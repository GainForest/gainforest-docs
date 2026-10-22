-- "Was this page helpful?" votes from docs.gainforest.earth.
-- Written only by the site's server route with the service role key, so RLS
-- is on with no policies: the anon key can neither read nor write.
create table if not exists public.docs_feedback (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  page       text not null check (char_length(page) <= 300),
  vote       text not null check (vote in ('up', 'down')),
  comment    text check (char_length(comment) <= 2000)
);

create index if not exists docs_feedback_page_idx on public.docs_feedback (page, created_at desc);

alter table public.docs_feedback enable row level security;

-- Per page totals, for a quick look in the Supabase dashboard.
create or replace view public.docs_feedback_summary
with (security_invoker = true) as
select
  page,
  count(*) filter (where vote = 'up')   as up,
  count(*) filter (where vote = 'down') as down,
  count(*) filter (where comment is not null) as comments,
  max(created_at) as last_vote
from public.docs_feedback
group by page;
