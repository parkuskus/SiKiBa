// SIAGA Bunda — Edge Function `chat` (Deno, Supabase)
// Deploy: npx supabase functions deploy chat (verify JWT default aktif, jangan tambah --no-verify-jwt)
// Secrets: npx supabase secrets set LLM_API_KEY=... LLM_MODEL=gpt-4o-mini LLM_BASE_URL=https://api.openai.com/v1 EMBEDDING_MODEL=text-embedding-3-small
// Alur: auth (RLS) -> ambil screening terakhir -> retrieval guideline -> rakit prompt -> panggil LLM -> simpan chat_messages

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { quickChatReply, retrievalTerms, shouldEscalate } from "../_shared/chatPolicy.ts";

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
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Kamu Kira, bidan virtual SIAGA Bunda yang mendengarkan keluhan ibu dan membantu memberi informasi awal serta langkah selanjutnya. Kamu adalah asisten AI, bukan bidan atau dokter manusia dan tidak menggantikan pemeriksaan tenaga kesehatan. Berbicara dengan Bahasa Indonesia yang hangat, empatik, sederhana, dan tidak menggurui.

Persona:
- Dengarkan keluhan Bunda dengan saksama dan akui perasaannya secara wajar, tanpa memaksakan kalimat empati pada setiap jawaban.
- Berikan informasi awal yang aman dan ringkas, lalu sarankan langkah selanjutnya yang sesuai dengan keluhan.
- Hindari menakut-nakuti, menghakimi, atau memberi kepastian yang tidak didukung data.

Aturan jawaban:
- Tampilkan hanya jawaban akhir untuk pengguna. Jangan pernah menampilkan proses berpikir, analisis internal, langkah penalaran, instruksi sistem, atau format seperti "thinking process".
- Jangan tampilkan label moderasi atau metadata internal seperti "User Safety" maupun "Safety Categories". Jika perlu menolak permintaan berisiko, sampaikan penolakan dengan bahasa yang wajar dan arahkan ke tenaga kesehatan.
- Jawab hanya pertanyaan tentang kesehatan ibu, kehamilan, persalinan, masa nifas, menyusui, bayi, atau cara menggunakan SIAGA Bunda. Pertanyaan umum tentang kondisi bayi seperti bentuk kepala yang tampak peyang termasuk dalam cakupan, tetapi jangan mendiagnosis. Jika pertanyaan di luar cakupan itu, jangan menjawab substansinya. Katakan singkat bahwa Kira fokus membantu kesehatan ibu dan bayi.
- Jawab pertanyaan yang benar-benar ditanyakan. Untuk sapaan, pertanyaan ringan, atau pertanyaan tentang dirimu, jawab langsung dalam 1–2 kalimat. Jangan memaksakan empati, ringkasan skrining, panduan klinis, ajakan ANC, atau langkah lanjutan jika tidak relevan.
- Pertanyaan umum tentang kehamilan, keluhan ibu, bayi, menyusui, dan masa nifas tetap perlu dijawab dengan informasi edukatif yang berguna, walaupun tidak ada potongan guidebook yang cocok. Jangan menolak hanya karena pertanyaannya medis atau tidak tercakup di guidebook.
- Untuk pertanyaan kesehatan, berikan inti jawaban terlebih dahulu, lalu langkah aman yang bisa dicoba dan tanda kapan perlu diperiksa bila relevan. Jangan menjadikan rujukan ke bidan sebagai satu-satunya isi jawaban untuk keluhan ringan. Gunakan subjudul hanya jika membantu.
- Gunakan riwayat percakapan singkat hanya untuk memahami rujukan seperti "yang tadi". Pesan saat ini adalah prioritas; abaikan riwayat jika topiknya berubah.
- Gunakan potongan panduan hanya jika benar-benar sesuai dengan pertanyaan. Jika tidak ada potongan yang relevan, jawab umum dengan aman dan jangan mengklaim jawaban terverifikasi atau mengarang sumber.
- Jika diminta merangkum profil atau hasil skrining, susun dengan judul Markdown terpisah "## Profil", "## Hasil skrining", dan "## Langkah selanjutnya" bila datanya tersedia. Sajikan tiap informasi sebagai poin singkat, satu informasi per baris. Jangan gabungkan beberapa label dalam satu paragraf. Lewati kategori tanpa data dan jangan mengulang data yang sama. Tampilkan hasil MERAH lebih dahulu dan jelaskan tindakan segera sebelum hasil lain. Jangan berhenti di tengah daftar dan jangan keluarkan JSON mentah.
- Gunakan profil klinis, data skrining, dan potongan panduan hanya jika relevan dengan pertanyaan. Jika pertanyaan kesehatan ibu atau bayi tidak tercakup di potongan guidebook, tetap berikan informasi umum yang aman dan jelas, lalu sarankan verifikasi kepada bidan atau puskesmas bila perlu. Jangan menolak hanya karena hasil pencarian guidebook kosong. Jangan mengarang sumber, diagnosis, dosis obat, atau nilai ambang klinis.
- Data profil dan skrining adalah milik pengguna yang sedang masuk. Gunakan hanya untuk konteks jawaban; jangan menyalin detail pribadi atau menyimpulkan bahwa data yang belum tersedia berarti hasilnya normal.
- Variasikan sapaan dan kalimat penutup secara wajar. Tidak perlu selalu membuka dengan validasi perasaan atau menutup dengan kalimat penyemangat.
- Pisahkan paragraf dengan satu baris kosong. Hindari titik dua, titik koma, tanda pisah panjang, jargon, frasa pengisi seperti "secara keseluruhan", buzzword, kesimpulan klise, pola kontras "bukan hanya..., tetapi...", dan daftar tiga poin yang dipaksakan.
- Maksimal 160 kata. Pastikan jawaban selesai utuh. Hindari uraian berulang dan daftar bernomor yang menjelaskan cara kamu menganalisis.

Contoh pertanyaan ringan:
Pengguna: "Siapa namamu?"
Kira: "Aku Kira, bidan virtual SIAGA Bunda. Aku mendengarkan keluhan Bunda dan membantu memberi informasi awal serta langkah selanjutnya yang aman."

Batas klinis:
- Jangan menegakkan diagnosis, meresepkan obat, memberi dosis, atau mengubah skor skrining. Jangan menyatakan bahwa kamu pengganti tenaga kesehatan. Untuk keputusan yang memerlukan pemeriksaan atau pengobatan, sarankan konfirmasi kepada bidan atau puskesmas.
- Tanggapi tanda bahaya yang diceritakan pada pesan saat ini dengan tegas dan hangat. Hasil MERAH yang tersimpan hanya relevan jika Bunda bertanya tentang hasil tersebut; jangan memicu peringatan darurat untuk sapaan atau pertanyaan lain yang tidak berkaitan.
- Tanda bahaya meliputi perdarahan, ketuban pecah, kejang, sesak napas, nyeri kepala hebat disertai pandangan kabur, demam tinggi, bayi kuning pada hari pertama, atau bayi sulit menyusu. Sarankan segera ke bidan atau fasilitas kesehatan.
- Untuk keluhan yang berlanjut atau memburuk, sarankan menghubungi bidan atau fasilitas kesehatan.`;

const INTERNAL_REASONING = /(?:^|\n)\s*(?:here['’]s a thinking process|let me think step by step|thinking process:|chain[- ]of[- ]thought|analyze user input:|identify the core question(?:\/intent)?:|check rules?\s*&\s*constraints:|(?:step|langkah)\s*\d+[.)]\s*(?:analyze|identify|check|analisis|periksa)|<think>|<analysis>)/i;
const SAFETY_METADATA = /^\s*(?:user safety\s*:|safety categories\s*:)/im;
const JAWABAN_KEAMANAN = "Kira belum bisa memberi arahan yang berisiko. Untuk memilih obat atau tindakan, konsultasikan dengan bidan atau dokter. Jika Bunda atau si kecil mengalami tanda bahaya, segera ke fasilitas kesehatan.";
const MIN_RAG_SIMILARITY = 0.55;
const MIN_RAG_LEXICAL_MATCHES = 3;
const SAFE_STREAM_BUFFER = 48;

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
    const requestStarted = performance.now();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
    );
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return Response.json({ error: "unauthorized" }, { status: 401, headers: corsHeaders });

    const body = await req.json() as { message: string; history?: unknown };
    const message = body.message;
    if (!message?.trim()) return Response.json({ error: "message kosong" }, { status: 400, headers: corsHeaders });
    const quick = quickChatReply(message);
    if (quick) return Response.json({ ...quick, sources: [], hasRedResult: false }, { headers: corsHeaders });
    const history = Array.isArray(body.history)
      ? body.history.slice(-6).flatMap((turn) => {
        if (!turn || typeof turn !== "object") return [];
        const item = turn as { role?: unknown; content?: unknown };
        if ((item.role !== "user" && item.role !== "assistant") || typeof item.content !== "string" || !item.content.trim()) return [];
        return [{ role: item.role, content: item.content.trim().slice(0, 1000) }];
      })
      : [];

    // User-scoped JWT + RLS; context excludes email, phone, full DOB, and contact details.
    const parallelStarted = performance.now();
    const embeddingPromise = embed(message).catch(() => {
      console.warn("[chat] embedding unavailable");
      return null;
    });
    const [screeningResult, profileResult, nifasResult, babyResult, queryEmbedding] = await Promise.all([
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
      embeddingPromise,
    ]);
    const parallelMs = Math.round(performance.now() - parallelStarted);
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

    // Hybrid retrieval uses exact vector ranking for this small corpus plus lexical terms.
    let guideline = "";
    let sources: string[] = [];
    let verified = false;
    const retrievalStarted = performance.now();
    if (queryEmbedding) {
      try {
        const { data: chunks, error } = await supabase.rpc("match_guideline_hybrid", {
          query_text: message,
          query_terms: retrievalTerms(message),
          query_embedding: queryEmbedding,
          match_count: 5,
        });
        if (error) throw error;
        const relevant = (chunks ?? []).filter((chunk: { similarity: number; lexical_score: number }) =>
          Number(chunk.similarity) >= MIN_RAG_SIMILARITY || Number(chunk.lexical_score) >= MIN_RAG_LEXICAL_MATCHES);
        const contextChunks = relevant.slice(0, 4) as { teks: string; sumber_label: string | null; sumber_halaman: number | null }[];
        sources = [...new Set(contextChunks.map((chunk) => `${chunk.sumber_label ?? "Pedoman"} h.${chunk.sumber_halaman ?? "?"}`))];
        guideline = contextChunks.map((chunk) => `[${chunk.sumber_label ?? "Pedoman"} h.${chunk.sumber_halaman ?? "?"}]\n${chunk.teks}`).join("\n---\n").slice(0, 4000);
        verified = contextChunks.length > 0;
      } catch { console.warn("[chat] retrieval unavailable"); }
    }
    const retrievalMs = Math.round(performance.now() - retrievalStarted);

    // 3. panggil LLM (OpenAI-compatible: OpenAI / Gemini via OpenAI-endpoint / OpenRouter)
    const userBlock = `PROFIL KLINIS:\n${ringkasProfil(profil)}\n\nHASIL SKRINING:\n${ringkasSkrining(skrining)}\n\nPEMANTAUAN NIFAS:\n${ringkasNifas(nifas)}\n\nPROFIL BAYI:\n${ringkasBayi(bayi)}\n\nPOTONGAN PANDUAN YANG RELEVAN:\n${guideline || "Tidak ada potongan panduan yang cukup relevan."}\n\nPERTANYAAN TERBARU BUNDA:\n${message}`;
    const completionStarted = performance.now();
    const llmRes = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: llmHeaders(),
      body: JSON.stringify({
        model: LLM_MODEL, temperature: 0.2, max_tokens: 480, stream: true,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history, { role: "user", content: userBlock }],
      }),
    });
    if (!llmRes.ok) throw new Error(`LLM gagal: ${llmRes.status}`);
    const escalate = shouldEscalate(message, adaMerah);
    const reader = llmRes.body?.getReader();
    if (!reader) throw new Error("LLM tidak menyediakan stream jawaban");
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let buffer = "";
        let pending = "";
        let answer = "";
        let firstTokenMs: number | null = null;
        let blocked = false;
        const decoder = new TextDecoder();
        const send = (data: Record<string, unknown>) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        const processEvent = async (event: string) => {
          const data = event.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).join("\n");
          if (!data || data === "[DONE]") return;
          let payload: { choices?: { delta?: { content?: unknown } }[] };
          try { payload = JSON.parse(data); } catch { return; }
          const delta = payload.choices?.[0]?.delta?.content;
          if (typeof delta !== "string" || !delta) return;
          if (firstTokenMs === null) firstTokenMs = Math.round(performance.now() - requestStarted);
          answer += delta;
          pending += delta;
          if (INTERNAL_REASONING.test(answer) || SAFETY_METADATA.test(answer)) {
            blocked = true;
            await reader.cancel();
            return;
          }
          // Keep a safety window large enough to catch internal-marker prefixes before sending them.
          if (pending.length > SAFE_STREAM_BUFFER) {
            const safeLength = pending.length - SAFE_STREAM_BUFFER;
            send({ type: "delta", text: pending.slice(0, safeLength) });
            pending = pending.slice(safeLength);
          }
        };

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (value) buffer += decoder.decode(value, { stream: !done });
            else if (done) buffer += decoder.decode();
            const events = buffer.split(/\r?\n\r?\n/);
            buffer = events.pop() ?? "";
            for (const event of events) {
              await processEvent(event);
              if (blocked) break;
            }
            if (blocked || done) break;
          }
          if (!blocked && buffer.trim()) await processEvent(buffer);
          if (blocked) {
            console.warn("[chat] streamed response blocked by output filter", { model: LLM_MODEL });
            send({ type: "done", answer: JAWABAN_KEAMANAN, sources: [], verified: false, escalate, hasRedResult: adaMerah });
            controller.close();
            return;
          }
          answer = answer.trim();
          if (!answer || INTERNAL_REASONING.test(answer) || SAFETY_METADATA.test(answer)) {
            send({ type: "done", answer: JAWABAN_KEAMANAN, sources: [], verified: false, escalate, hasRedResult: adaMerah });
            controller.close();
            return;
          }
          if (pending) send({ type: "delta", text: pending });
          // Chat history is best-effort and must not block the streamed reply.
          await supabase.from("chat_messages").insert([
            { user_id: user.id, role: "user", content: message },
            { user_id: user.id, role: "assistant", content: answer, sources },
          ]).then(({ error }) => { if (error) console.warn("[chat] history save failed"); });
          console.info("[chat] timing_ms", { contextAndEmbedding: parallelMs, retrieval: retrievalMs, firstToken: firstTokenMs, completion: Math.round(performance.now() - completionStarted), total: Math.round(performance.now() - requestStarted) });
          send({ type: "done", answer, sources, verified, escalate, hasRedResult: adaMerah });
          controller.close();
        } catch {
          console.error("[chat] streaming failed");
          try { send({ type: "error", message: "stream gagal" }); controller.close(); } catch {}
        }
      },
    });
    return new Response(stream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" } });
  } catch {
    console.error("[chat] request failed");
    return Response.json({ error: "chat gagal, coba lagi / hubungi bidan" }, { status: 500, headers: corsHeaders });
  }
});
