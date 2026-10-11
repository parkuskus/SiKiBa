"""Smoke-check the production RAG RPC against three known topics.

Loads credentials from supabase/.env and calls the configured embedding API.
No query text, API key, or retrieved text is printed.
"""
import os
import re
import sys

import requests
from dotenv import load_dotenv
from supabase import create_client

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(ROOT, "supabase", ".env"))
STOP_WORDS = set("""
yang dan atau apa untuk saya aku bunda ibu hamil bayi dengan dari pada ini itu bila jika saat sejak sedang
mengalami merasakan terasa terjadi dilakukan bagaimana kapan kenapa apakah bisa tolong sekarang harus tidak bukan
belum ada sudah lebih kurang karena dalam oleh keluar muncul menjadi terus
""".split())
CASES = [
    ("Ibu hamil mengalami perdarahan merah segar dan pusing, apa yang harus dilakukan?", 4),
    ("Bayi kuning sejak hari pertama lahir dan sulit menyusu.", 84),
    ("Payudara bengkak dan keras saat menyusui.", 63),
]


def terms(text: str) -> list[str]:
    words = re.sub(r"[^a-z0-9]+", " ", text.lower()).split()
    return list(dict.fromkeys(word for word in words if len(word) >= 3 and word not in STOP_WORDS))[:10]


def main() -> int:
    base_url = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
    embedding_model = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    api_key = os.getenv("LLM_API_KEY")
    supabase_url = os.getenv("SUPABASE_URL")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not all((api_key, supabase_url, service_role_key)):
        print("Need LLM_API_KEY, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY in supabase/.env")
        return 1

    db = create_client(supabase_url, service_role_key)
    for query, expected_page in CASES:
        response = requests.post(
            f"{base_url}/embeddings",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"model": embedding_model, "input": query},
            timeout=45,
        )
        response.raise_for_status()
        vector = response.json()["data"][0]["embedding"]
        result = db.rpc("match_guideline_hybrid", {
            "query_text": query,
            "query_terms": terms(query),
            "query_embedding": vector,
            "match_count": 5,
        }).execute()
        if result.data is None:
            raise RuntimeError("RAG retrieval returned no result")
        pages = [row.get("sumber_halaman") for row in result.data]
        if expected_page not in pages:
            print(f"FAIL expected page {expected_page} in top 5; got {pages}")
            return 1
    print("Hybrid RAG retrieval returned the expected source page for all three smoke cases.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
