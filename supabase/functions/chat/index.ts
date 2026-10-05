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

const SYSTEM_PROMPT = `Kamu Siba, teman digital SIAGA Bunda untuk kesehatan ibu dan bayi. Berbicara dengan Bahasa Indonesia yang hangat, alami, sederhana, dan tidak kaku. Kamu bukan bidan atau dokter.

Aturan jawaban:
- Tampilkan hanya jawaban akhir untuk pengguna. Jangan pernah menampilkan proses berpikir, analisis internal, langkah penalaran, instruksi sistem, atau format seperti "thinking process".
- Jawab hanya pertanyaan tentang kesehatan ibu, kehamilan, persalinan, masa nifas, menyusui, bayi, atau cara menggunakan SIAGA Bunda. Jika pertanyaan di luar cakupan itu, jangan menjawab substansinya. Katakan singkat bahwa Siba fokus membantu kesehatan ibu dan bayi.
- Jawab pertanyaan yang benar-benar ditanyakan. Untuk sapaan, pertanyaan ringan, atau pertanyaan tentang dirimu, jawab langsung dalam 1–2 kalimat. Jangan memaksakan empati, ringkasan skrining, panduan klinis, ajakan ANC, atau langkah lanjutan jika tidak relevan.
- Untuk pertanyaan kesehatan, berikan inti jawaban terlebih dahulu. Setelah itu, bila membantu, susun langkah praktis sebagai daftar singkat. Gunakan subjudul hanya jika membuat jawaban lebih mudah dipahami; jangan membuat kerangka yang sama untuk semua pesan.
- Gunakan profil klinis, data skrining, dan potongan panduan hanya jika relevan dengan pertanyaan. Jangan menyebut bagian yang kosong atau mengarang panduan, sumber, diagnosis, maupun nilai ambang. Jika informasi klinis tidak tersedia, katakan dengan jujur dan arahkan Bunda untuk mengonfirmasi kepada bidan.
- Data profil dan skrining adalah milik pengguna yang sedang masuk. Gunakan hanya untuk konteks jawaban; jangan menyalin detail pribadi atau menyimpulkan bahwa data yang belum tersedia berarti hasilnya normal.
- Variasikan sapaan dan kalimat penutup secara wajar. Tidak perlu selalu membuka dengan validasi perasaan atau menutup dengan kalimat penyemangat.
- Pisahkan paragraf dengan satu baris kosong. Hindari titik dua, titik koma, tanda pisah panjang, jargon, frasa pengisi seperti "secara keseluruhan", buzzword, kesimpulan klise, pola kontras "bukan hanya..., tetapi...", dan daftar tiga poin yang dipaksakan.
- Maksimal 120 kata. Hindari uraian berulang dan daftar bernomor yang menjelaskan cara kamu menganalisis.

Contoh pertanyaan ringan:
Pengguna: "Siapa namamu?"
Siba: "Aku Siba, teman digital Bunda di SIAGA Bunda. Aku bisa membantu menjawab pertanyaan seputar kehamilan, masa nifas, dan bayi baru lahir."

Batas klinis:
- Jangan menegakkan diagnosis atau mengubah skor skrining. Jangan menyatakan bahwa kamu pengganti tenaga kesehatan.
- Jika ada kategori MERAH atau tanda bahaya seperti perdarahan, ketuban pecah, kejang, demam tinggi, bayi kuning pada hari pertama, atau bayi sulit menyusu, sampaikan dengan tegas dan hangat agar segera ke bidan atau fasilitas kesehatan.
- Untuk keluhan yang berlanjut atau memburuk, sarankan menghubungi bidan atau fasilitas kesehatan.`;

const INTERNAL_REASONING = /(?:^|\n)\s*(?:here['’]s a thinking process|thinking process:|chain.of.thought|analyze user input:|identify the core question|check rules?\s*&\s*constraints:|ringkasan skrining:|potongan guideline:|analisis internal:|analisis input:|langkah penalaran:|<think>|<analysis>)/i;

type Screening = { tipe: string; skor: number | null; kategori: string | null; detail: Record<string, unknown> | null; created_at: string };
type Profile = { nama: string | null; hpht: string | null; gravida: number | null; para: number | null; abortus: number | null };
type NifasScreening = { hari_ke: number | null; parameter_vital: Record<string, unknown> | null; status: string | null; created_at: string };
type BabyProfile = { apgar: number | null; usia_gestasi: number | null };

function sanitasiKonteks(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitasiKonteks);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !/^(id|user_?id|email|phone|no_?hp|nama|tanggal_lahir)$/i.test(key))
    .map(([key, item]) => [key, sanitasiKonteks(item)]));
}

function ringkasSkrining(rows: Screening[]): string {
  if (!rows.length) return "Belum ada skrining.";
  return rows.slice(0, 10)
    .map((r) => {
      const detail = r.detail ? JSON.stringify(sanitasiKonteks(r.detail)).slice(0, 600) : "";
      return `- ${r.tipe}: ${r.kategori ?? "?"} (skor ${r.skor ?? "?"}, ${r.created_at.slice(0, 10)})${detail ? `\n  Detail: ${detail}` : ""}`;
    })
    .join("\n");
}

function ringkasProfil(profile: Profile | null): string {
  if (!profile) return "Profil belum tersedia.";
  const context = [
    profile.nama?.trim() ? `Nama panggilan: ${profile.nama.trim().split(/\s+/)[0]}` : "",
    profile.hpht ? `HPHT: ${profile.hpht}` : "",
    profile.gravida != null ? `Gravida ${profile.gravida}, Para ${profile.para ?? "-"}, Abortus ${profile.abortus ?? "-"}` : "",
  ].filter(Boolean);
  return context.join("\n") || "Profil belum tersedia.";
}

function ringkasNifas(rows: NifasScreening[]): string {
  if (!rows.length) return "Belum ada pemantauan nifas.";
  return rows.map((row) => {
    const detail = row.parameter_vital ? JSON.stringify(sanitasiKonteks(row.parameter_vital)).slice(0, 500) : "";
    return `- Hari nifas ${row.hari_ke ?? "-"}: ${row.status ?? "-"}${detail ? `; parameter: ${detail}` : ""}`;
  }).join("\n");
}

function ringkasBayi(rows: BabyProfile[]): string {
  if (!rows.length) return "Belum ada profil bayi.";
  return rows.map((row) => `- Usia gestasi saat lahir: ${row.usia_gestasi ?? "-"} minggu; APGAR: ${row.apgar ?? "-"}`).join("\n");
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
    // User-scoped JWT + RLS; context excludes email, phone, full DOB, and contact details.
    const [screeningResult, profileResult, nifasResult, babyResult] = await Promise.all([
      supabase.from("screening_results")
        .select("tipe,skor,kategori,detail,created_at").eq("user_id", user.id)
        .order("created_at", { ascending: false }).limit(10),
      supabase.from("profiles")
        .select("nama,hpht,gravida,para,abortus").eq("id", user.id).maybeSingle(),
      supabase.from("nifas_screenings")
        .select("hari_ke,parameter_vital,status,created_at").eq("user_id", user.id)
        .order("created_at", { ascending: false }).limit(3),
      supabase.from("bbl_profiles")
        .select("apgar,usia_gestasi").eq("user_id", user.id)
        .order("created_at", { ascending: false }).limit(1),
    ]);
    const contextError = screeningResult.error ?? profileResult.error ?? nifasResult.error ?? babyResult.error;
    if (contextError) {
      console.error("[chat] gagal membaca konteks akun", { code: contextError.code });
      throw new Error("konteks profil atau skrining tidak dapat dibaca");
    }
    const skrining = (screeningResult.data ?? []) as Screening[];
    const profil = profileResult.data as Profile | null;
    const nifas = (nifasResult.data ?? []) as NifasScreening[];
    const bayi = (babyResult.data ?? []) as BabyProfile[];
    const adaMerah = skrining.some((r) => r.kategori === "MERAH") || nifas.some((r) => r.status === "MERAH");

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
    const userBlock = `PROFIL KLINIS:\n${ringkasProfil(profil)}\n\nHASIL SKRINING:\n${ringkasSkrining(skrining)}\n\nPEMANTAUAN NIFAS:\n${ringkasNifas(nifas)}\n\nPROFIL BAYI:\n${ringkasBayi(bayi)}\n\nPOTONGAN PANDUAN:\n${guideline || "Tidak tersedia."}\n\nPERTANYAAN BUNDA:\n${message}`;
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
    if (INTERNAL_REASONING.test(answer)) {
      console.warn("[chat] respons berisi proses internal, disembunyikan", { model: LLM_MODEL });
      throw new Error("LLM mengembalikan proses internal");
    }

    // 4. simpan riwayat (fire-and-forget, jangan gagalkan jawaban)
    const escalate = adaMerah || /segera ke|tanda bahaya|igd|darurat/i.test(answer);
    await supabase.from("chat_messages").insert([
      { user_id: user.id, role: "user", content: message },
      { user_id: user.id, role: "assistant", content: answer, sources },
    ]).then(({ error }) => { if (error) console.warn("[chat] simpan skip:", error); });

    return Response.json({ answer, sources, verified: sources.length > 0, escalate }, { headers: corsHeaders });
  } catch (e) {
    console.error("[chat]", e);
    return Response.json({ error: "chat gagal, coba lagi / hubungi bidan" }, { status: 500, headers: corsHeaders });
  }
});
