# Ingest PDF guideline -> supabase.guideline_chunks (RAG Siba). Jalan sekali, aman diulang.
# Butuh di supabase/.env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (dashboard Settings -> API -> service_role), LLM_API_KEY.
# Tes kecil dulu:  python scripts/ingest-guideline.py --limit 5
# Penuh:           python scripts/ingest-guideline.py

import argparse
import os
import re
import sys

import pypdf
import requests
from dotenv import load_dotenv
from supabase import create_client

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(ROOT, "supabase", ".env"))

PDF = os.path.join(ROOT, "assets", "Guideline Chatbot_SIAGA.pdf")
LABEL = "Guideline Chatbot SIAGA"
BASE_URL = os.getenv("LLM_BASE_URL", "https://openrouter.ai/api/v1")
EMB_MODEL = os.getenv("EMBEDDING_MODEL", "openai/text-embedding-3-small")
CHUNK, OVERLAP, BATCH = 700, 100, 32


def chunks_of(text: str):
    text = re.sub(r"[ \t]+", " ", text).strip()
    if not text:
        return
    paras, buf = text.split("\n"), ""
    for p in paras:
        p = p.strip()
        if not p:
            continue
        buf = f"{buf}\n{p}" if buf else p
        while len(buf) >= CHUNK:
            yield buf[:CHUNK]
            buf = buf[CHUNK - OVERLAP :]
    if buf.strip():
        yield buf


def embed(texts: list[str]) -> list[list[float]]:
    out: list[list[float]] = []
    key = os.environ["LLM_API_KEY"]
    for i in range(0, len(texts), BATCH):
        part = texts[i : i + BATCH]
        r = requests.post(
            f"{BASE_URL}/embeddings",
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
            json={"model": EMB_MODEL, "input": part},
            timeout=120,
        )
        r.raise_for_status()
        out.extend(d["embedding"] for d in r.json()["data"])
        print(f"  embed {min(i + BATCH, len(texts))}/{len(texts)}", flush=True)
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0, help="coba N chunk pertama saja")
    args = ap.parse_args()

    for v in ("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "LLM_API_KEY"):
        if not os.getenv(v):
            print(f"kurang {v} di supabase/.env")
            return 1

    print("baca PDF...")
    reader = pypdf.PdfReader(PDF)
    rows: list[tuple[str, int]] = []
    for n, page in enumerate(reader.pages, start=1):
        for c in chunks_of(page.extract_text() or ""):
            rows.append((c, n))
    if args.limit:
        rows = rows[: args.limit]
    print(f"total {len(rows)} chunk dari {len(reader.pages)} halaman")

    print("embed via OpenRouter...")
    vecs = embed([c for c, _ in rows])
    if len(vecs[0]) != 1536:
        print(f"dimensi {len(vecs[0])} bukan 1536 — samakan EMBEDDING_MODEL/migrasi 002")
        return 1

    print("tulis ke guideline_chunks...")
    sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
    sb.table("guideline_chunks").delete().eq("sumber_label", LABEL).execute()
    for i in range(0, len(rows), 100):
        part = [
            {"teks": rows[j][0], "sumber_halaman": rows[j][1], "sumber_label": LABEL, "embedding": vecs[j]}
            for j in range(i, min(i + 100, len(rows)))
        ]
        sb.table("guideline_chunks").insert(part).execute()
        print(f"  insert {min(i + 100, len(rows))}/{len(rows)}", flush=True)
    print("selesai. cek: select count(*) from guideline_chunks;")
    return 0


sys.exit(main())
