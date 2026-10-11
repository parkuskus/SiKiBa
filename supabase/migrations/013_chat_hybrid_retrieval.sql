create index if not exists idx_guideline_text_search
  on public.guideline_chunks using gin (to_tsvector('simple', teks));

-- The corpus currently has only hundreds of chunks; exact vector ranking avoids low-recall IVF probes.
drop index if exists public.idx_guideline_embedding;

create or replace function public.match_guideline_hybrid(
  query_text text,
  query_terms text[],
  query_embedding vector(1536),
  match_count int default 5
)
returns table (
  id uuid,
  teks text,
  sumber_halaman int,
  sumber_label text,
  similarity float,
  lexical_score float,
  relevance float
)
language sql stable
as $$
  with vector_ranked as (
    select g.id,
      1 - (g.embedding <=> query_embedding) as similarity,
      row_number() over (order by g.embedding <=> query_embedding) as rank
    from public.guideline_chunks g
    where g.embedding is not null
    order by g.embedding <=> query_embedding
    limit 30
  ), lexical_scores as (
    select g.id, count(*)::float as lexical_score
    from public.guideline_chunks g
    cross join unnest(coalesce(query_terms, array[]::text[])) as q(term)
    where length(q.term) >= 3
      and to_tsvector('simple', g.teks) @@ plainto_tsquery('simple', q.term)
    group by g.id
  ), lexical_ranked as (
    select l.id, l.lexical_score,
      row_number() over (order by l.lexical_score desc, l.id) as rank
    from lexical_scores l
    order by l.lexical_score desc, l.id
    limit 30
  ), candidates as (
    select id from vector_ranked
    union
    select id from lexical_ranked
  )
  select g.id, g.teks, g.sumber_halaman, g.sumber_label,
    coalesce(v.similarity, 0)::float,
    coalesce(l.lexical_score, 0)::float,
    (
      case when v.rank is null then 0 else 1.0 / (60 + v.rank) end
      + case when l.rank is null then 0 else 1.0 / (60 + l.rank) end
    )::float as relevance
  from candidates c
  join public.guideline_chunks g on g.id = c.id
  left join vector_ranked v on v.id = c.id
  left join lexical_ranked l on l.id = c.id
  order by relevance desc, similarity desc, g.id
  limit greatest(1, least(match_count, 10));
$$;

grant execute on function public.match_guideline_hybrid(text, text[], vector, integer) to authenticated;
