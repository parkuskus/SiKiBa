-- SIAGA Bunda — 002 chat + RAG guideline (idempotent, safe re-run)
-- Mirror pola 001_init_siaga_bunda.sql. Push via: npx supabase db push
-- Isi: riwayat chat per user + knowledge base PDF guideline (pgvector) + RPC retrieval

create extension if not exists "vector";

-- 1. chat_messages — riwayat tanya-jawab (LLM online saja; offline pakai FAQ lokal)
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  sources jsonb default '[]', -- halaman/sumber guideline yang dipakai assistant
  created_at timestamptz default now()
);
create index if not exists idx_chat_user on chat_messages(user_id, created_at desc);

-- 2. guideline_chunks — hasil ingest PDF guideline (scripts/ingest-guideline, jalan sekali)
-- embedding: text-embedding-3-small = 1536 dimensi. Kalau pakai Gemini embedding-001 (768),
-- ganti vector(1536) -> vector(768) SEBELUM ingest pertama (jangan campur dimensi).
create table if not exists guideline_chunks (
  id uuid primary key default gen_random_uuid(),
  teks text not null,
  sumber_halaman int,
  sumber_label text, -- mis. "Buku KIA h.42" / "SOP Puskesmas"
  embedding vector(1536),
  created_at timestamptz default now()
);
create index if not exists idx_guideline_embedding
  on guideline_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- 3. RPC retrieval — dipanggil Edge Function supabase/functions/chat
create or replace function match_guideline(
  query_embedding vector(1536),
  match_count int default 5
)
returns table (id uuid, teks text, sumber_halaman int, sumber_label text, similarity float)
language sql stable as $$
  select id, teks, sumber_halaman, sumber_label,
    1 - (embedding <=> query_embedding) as similarity
  from guideline_chunks
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- 4. RLS — sama seperti tabel lain: user hanya akses miliknya. guideline read-only untuk semua user login.
alter table chat_messages enable row level security;
alter table guideline_chunks enable row level security;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='chat_messages' AND policyname='own_chat') THEN
    CREATE POLICY "own_chat" ON chat_messages FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='guideline_chunks' AND policyname='read_guideline') THEN
    CREATE POLICY "read_guideline" ON guideline_chunks FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;
