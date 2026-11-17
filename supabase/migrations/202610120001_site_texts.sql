begin;

create table if not exists public.site_texts (
  key text primary key check (char_length(key) between 1 and 100),
  value text not null check (char_length(value) between 1 and 5000),
  updated_at timestamptz not null default now()
);

drop trigger if exists site_texts_set_updated_at on public.site_texts;
create trigger site_texts_set_updated_at
before update on public.site_texts
for each row execute function public.set_updated_at();

alter table public.site_texts enable row level security;

grant select on public.site_texts to anon, authenticated;
grant insert, update, delete on public.site_texts to authenticated;

drop policy if exists "Public can read site texts" on public.site_texts;
create policy "Public can read site texts"
  on public.site_texts for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can manage site texts" on public.site_texts;
create policy "Admins can manage site texts"
  on public.site_texts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

commit;
