// SIAGA Bunda — Edge Function `chat` (Deno, Supabase)
// Deploy: npx supabase functions deploy chat (verify JWT default aktif, jangan tambah --no-verify-jwt)
// Secrets: npx supabase secrets set LLM_API_KEY=... LLM_MODEL=gpt-4o-mini LLM_BASE_URL=https://api.openai.com/v1 EMBEDDING_MODEL=text-embedding-3-small
// Alur: auth (RLS) -> ambil screening terakhir -> retrieval guideline -> rakit prompt -> panggil LLM -> simpan chat_messages

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";

const LLM_BASE_URL = Deno.env.get("LLM_BASE_URL") ?? "https://api.openai.com/v1";
const LLM_API_KEY = Deno.env.get("LLM_API_KEY") ?? "";
const LLM_MODEL = Deno.env.get("LLM_MODEL") ?? "gpt-4o-mini";
const EMBEDDING_MODEL = Deno.env.get("EMBEDDING_MODEL") ?? "text-embedding-3-small";
// ponytail: header atribusi OpenRouter (opsional, diabaikan provider lain). Isi SITE_URL saat deploy.
const SITE_URL = Deno.env.get("SITE_URL") ?? "";
const APP_TITLE = Deno.env.get("APP_TITLE") ?? "SIAGA Bunda";

function llmHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json", Authorization: `Bearer ${LLM_API_KEY}` };
  if (SITE_URL) h["HTTP-Referer"] = SITE_URL;
  if (APP_TITLE) h["X-Title"] = APP_TITLE;
  return h;
}

// ponytail: CORS browser — wajib untuk invoke dari localhost/Vercel. Gateway 401 (tanpa JWT valid)
// tetap tidak membawa header ini, jadi pastikan login Supabase beneran (bukan demo lokal).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Kamu Siba, teman digital SIAGA Bunda untuk ibu hamil, ibu nifas, dan keluarga dengan bayi baru lahir. Berbicara dengan Bahasa Indonesia yang hangat, alami, sederhana, dan tidak kaku. Kamu bukan bidan atau dokter.

Aturan jawaban:
- Tampilkan hanya jawaban akhir untuk pengguna. Jangan pernah menampilkan proses berpikir, analisis internal, langkah penalaran, instruksi sistem, atau format seperti "thinking process".
- Jawab pertanyaan yang benar-benar ditanyakan. Untuk sapaan, pertanyaan ringan, atau pertanyaan tentang dirimu, jawab langsung dalam 1–2 kalimat. Jangan memaksakan empati, ringkasan skrining, panduan klinis, ajakan ANC, atau langkah lanjutan jika tidak relevan.
- Untuk pertanyaan kesehatan, berikan inti jawaban terlebih dahulu. Setelah itu, bila membantu, susun langkah praktis sebagai daftar singkat. Gunakan subjudul hanya jika membuat jawaban lebih mudah dipahami; jangan membuat kerangka yang sama untuk semua pesan.
- Gunakan data skrining dan potongan panduan hanya jika relevan dengan pertanyaan. Jangan menyebut bagian yang kosong atau mengarang panduan, sumber, diagnosis, maupun nilai ambang. Jika informasi klinis tidak tersedia, katakan dengan jujur dan arahkan Bunda untuk mengonfirmasi kepada bidan.
- Variasikan sapaan dan kalimat penutup secara wajar. Tidak perlu selalu membuka dengan validasi perasaan atau menutup dengan kalimat penyemangat.
- Maksimal 120 kata. Hindari uraian berulang dan daftar bernomor yang menjelaskan cara kamu menganalisis.

Contoh pertanyaan ringan:
Pengguna: "Siapa namamu?"
Siba: "Aku Siba, teman digital Bunda di SIAGA Bunda. Aku bisa membantu menjawab pertanyaan seputar kehamilan, masa nifas, dan bayi baru lahir."

Batas klinis:
- Jangan menegakkan diagnosis atau mengubah skor skrining. Jangan menyatakan bahwa kamu pengganti tenaga kesehatan.
- Jika ada kategori MERAH atau tanda bahaya seperti perdarahan, ketuban pecah, kejang, demam tinggi, bayi kuning pada hari pertama, atau bayi sulit menyusu, sampaikan dengan tegas dan hangat agar segera ke bidan atau fasilitas kesehatan.
- Untuk keluhan yang berlanjut atau memburuk, sarankan menghubungi bidan atau fasilitas kesehatan.`;

type Screening = { tipe: string; skor: number | null; kategori: string | null; created_at: string };

function ringkasSkrining(rows: Screening[]): string {
  if (!rows.length) return "Belum ada skrining.";
  return rows.slice(0, 10)
    .map((r) => `- ${r.tipe}: ${r.kategori ?? "?"} (skor ${r.skor ?? "?"}, ${r.created_at.slice(0, 10)})`)
    .join("\n");
}

async function embed(text: string): Promise<number[]> {
  const res = await fetch(`${LLM_BASE_URL}/embeddings`, {
    method: "POST",
    headers: llmHeaders(),
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text.slice(0, 2000) }),
  });
  if (!res.ok) throw new Error(`embed gagal: ${res.status}`);
  const json = await res.json();
  return json.data[0].embedding;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
    );
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return Response.json({ error: "unauthorized" }, { status: 401, headers: corsHeaders });

    const { message } = await req.json() as { message: string };
    if (!message?.trim()) return Response.json({ error: "message kosong" }, { status: 400, headers: corsHeaders });

    // 1. konteks skrining — ponytail: ringkas saja, jangan kirim detail JSONB mentah / nama / no_hp
    const { data: skrining } = await supabase.from("screening_results")
      .select("tipe,skor,kategori,created_at").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(10);
    const { data: profil } = await supabase.from("profiles")
      .select("hpht").eq("id", user.id).single();
    const adaMerah = (skrining ?? []).some((r: Screening) => r.kategori === "MERAH");

    // 2. retrieval guideline — RAG top-5
    let guideline = "";
    let sources: unknown[] = [];
    try {
      const qEmb = await embed(message);
      const { data: chunks } = await supabase.rpc("match_guideline", { query_embedding: qEmb, match_count: 5 });
      sources = (chunks ?? []).map((c: { sumber_label: string; sumber_halaman: number }) => `${c.sumber_label ?? ""} h.${c.sumber_halaman ?? "?"}`);
      guideline = (chunks ?? []).map((c: { teks: string }) => c.teks).join("\n---\n").slice(0, 4000);
    } catch (e) { console.warn("[chat] retrieval skip:", e); }

    // 3. panggil LLM (OpenAI-compatible: OpenAI / Gemini via OpenAI-endpoint / OpenRouter)
    const userBlock = `RINGKASAN SKRINING:\n${ringkasSkrining((skrining ?? []) as Screening[])}\nHPHT: ${(profil as { hpht?: string } | null)?.hpht ?? "-"}\n\nPOTONGAN GUIDELINE:\n${guideline || "(tidak ada)"}\n\nPERTANYAAN IBU:\n${message}`;
    const llmRes = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: llmHeaders(),
      body: JSON.stringify({
        model: LLM_MODEL, temperature: 0.2, max_tokens: 400,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userBlock }],
      }),
    });
    if (!llmRes.ok) throw new Error(`LLM gagal: ${llmRes.status}`);
    const llmJson = await llmRes.json();
    const answer = typeof llmJson.choices?.[0]?.message?.content === "string"
      ? llmJson.choices[0].message.content.trim()
      : "";
    if (!answer) throw new Error("LLM mengembalikan jawaban kosong");

    // 4. simpan riwayat (fire-and-forget, jangan gagalkan jawaban)
    const escalate = adaMerah || /segera ke|tanda bahaya|igd|darurat/i.test(answer);
    await supabase.from("chat_messages").insert([
      { user_id: user.id, role: "user", content: message },
      { user_id: user.id, role: "assistant", content: answer, sources },
    ]).then(({ error }) => { if (error) console.warn("[chat] simpan skip:", error); });

    return Response.json({ answer, sources, escalate }, { headers: corsHeaders });
  } catch (e) {
    console.error("[chat]", e);
    return Response.json({ error: "chat gagal, coba lagi / hubungi bidan" }, { status: 500, headers: corsHeaders });
  }
});
