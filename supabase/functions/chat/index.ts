// SIAGA Bunda — Edge Function `chat` (Deno, Supabase)
// Deploy: npx supabase functions deploy chat --no-verify-jwt (biarkan verify JWT aktif)
// Secrets: npx supabase secrets set LLM_API_KEY=... LLM_MODEL=gpt-4o-mini LLM_BASE_URL=https://api.openai.com/v1 EMBEDDING_MODEL=text-embedding-3-small
// Alur: auth (RLS) -> ambil screening terakhir -> retrieval guideline -> rakit prompt -> panggil LLM -> simpan chat_messages

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";

const LLM_BASE_URL = Deno.env.get("LLM_BASE_URL") ?? "https://api.openai.com/v1";
const LLM_API_KEY = Deno.env.get("LLM_API_KEY") ?? "";
const LLM_MODEL = Deno.env.get("LLM_MODEL") ?? "gpt-4o-mini";
const EMBEDDING_MODEL = Deno.env.get("EMBEDDING_MODEL") ?? "text-embedding-3-small";

const SYSTEM_PROMPT = `Kamu Siba, Sahabat Bunda — pendamping hangat SIAGA Bunda untuk ibu hamil, ibu nifas, dan orang tua bayi baru lahir. Bicara Bahasa Indonesia sederhana yang manusiawi dan menghangatkan, seperti bidan senior yang mendengarkan.
Gaya wajib (biar tidak kering):
1. Sapa "Bunda", sebut dirimu "Siba". Buka dengan satu kalimat validasi rasa ("Siba paham ini tidak enak ya Bunda", "Wajar Bunda khawatir").
2. Beri 1-2 info ringkas yang dikaitkan dengan RINGKASAN SKRINING + POTONGAN GUIDELINE. Jika tidak ada di guideline, katakan jujur belum tahu.
3. Beri satu langkah konkret berikutnya (misal cek skrining S-03b, buka Edukasi S-06, hubungi bidan).
4. Tutup dengan kalimat hangat yang menguatkan ("Bunda sudah hebat memperhatikan hal ini", "Siba selalu di sini").
Batas klinis (tidak boleh dilanggar):
- Kamu BUKAN pengganti bidan/dokter. Tidak menegakkan diagnosis definitif, tidak mengubah skor skrining.
- Jika kategori MERAH atau tanda bahaya (perdarahan, ketuban pecah, kejang, demam tinggi, bayi kuning hari pertama atau malas menyusu) -> tegas tapi hangat. sarankan segera ke fasyankes/bidan sekarang.
- Tutup dengan ajakan ANC atau hubungi bidan bila gejala berlanjut. Maksimal 150 kata.`;

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
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${LLM_API_KEY}` },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text.slice(0, 2000) }),
  });
  if (!res.ok) throw new Error(`embed gagal: ${res.status}`);
  const json = await res.json();
  return json.data[0].embedding;
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
    );
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return Response.json({ error: "unauthorized" }, { status: 401 });

    const { message } = await req.json() as { message: string };
    if (!message?.trim()) return Response.json({ error: "message kosong" }, { status: 400 });

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
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LLM_API_KEY}` },
      body: JSON.stringify({
        model: LLM_MODEL, temperature: 0.2, max_tokens: 400,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userBlock }],
      }),
    });
    if (!llmRes.ok) throw new Error(`LLM gagal: ${llmRes.status}`);
    const llmJson = await llmRes.json();
    const answer: string = llmJson.choices[0].message.content;

    // 4. simpan riwayat (fire-and-forget, jangan gagalkan jawaban)
    const escalate = adaMerah || /segera ke|tanda bahaya|igd|darurat/i.test(answer);
    await supabase.from("chat_messages").insert([
      { user_id: user.id, role: "user", content: message },
      { user_id: user.id, role: "assistant", content: answer, sources },
    ]).then(({ error }) => { if (error) console.warn("[chat] simpan skip:", error); });

    return Response.json({ answer, sources, escalate });
  } catch (e) {
    console.error("[chat]", e);
    return Response.json({ error: "chat gagal, coba lagi / hubungi bidan" }, { status: 500 });
  }
});
