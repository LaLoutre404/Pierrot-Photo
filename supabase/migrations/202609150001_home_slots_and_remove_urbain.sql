begin;

alter table public.categories
  add column if not exists is_active boolean not null default true;

update public.categories
set is_active = false
where slug = 'urbain';

update public.photos
set is_published = false,
    is_featured = false
where category_id in (
  select id from public.categories where slug = 'urbain'
);

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
  on public.categories for select
  to anon, authenticated
  using (is_active = true or public.is_admin());

drop policy if exists "Public can read published photos" on public.photos;
create policy "Public can read published photos"
  on public.photos for select
  to anon, authenticated
  using (
    public.is_admin()
    or (
      is_published = true
      and exists (
        select 1 from public.categories
        where categories.id = photos.category_id
          and categories.is_active = true
      )
    )
  );

create table if not exists public.home_photo_slots (
  slot_key text primary key check (
    slot_key in (
      'hero',
      'about',
      'skills-1',
      'skills-2',
      'skills-3',
      'skills-4',
      'quote',
      'universe-shooting',
      'universe-spectacle-vivant',
      'universe-sport'
    )
  ),
  photo_id uuid references public.photos(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists home_photo_slots_photo_idx
  on public.home_photo_slots(photo_id);

drop trigger if exists home_photo_slots_set_updated_at on public.home_photo_slots;
create trigger home_photo_slots_set_updated_at
before update on public.home_photo_slots
for each row execute function public.set_updated_at();

alter table public.home_photo_slots enable row level security;

drop policy if exists "Public can read visible home photo slots" on public.home_photo_slots;
create policy "Public can read visible home photo slots"
  on public.home_photo_slots for select
  to anon, authenticated
  using (
    public.is_admin()
    or photo_id is null
    or exists (
      select 1 from public.photos
      where photos.id = home_photo_slots.photo_id
        and photos.is_published = true
    )
  );

drop policy if exists "Admins can manage home photo slots" on public.home_photo_slots;
create policy "Admins can manage home photo slots"
  on public.home_photo_slots for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Public can read stored published photos" on storage.objects;
create policy "Public can read stored published photos"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'portfolio'
    and (
      public.is_admin()
      or exists (
        select 1
        from public.photos
        join public.categories on categories.id = photos.category_id
        where photos.storage_path = storage.objects.name
          and photos.is_published = true
          and categories.is_active = true
      )
    )
  );

insert into public.home_photo_slots (slot_key)
values
  ('hero'),
  ('about'),
  ('skills-1'),
  ('skills-2'),
  ('skills-3'),
  ('skills-4'),
  ('quote'),
  ('universe-shooting'),
  ('universe-spectacle-vivant'),
  ('universe-sport')
on conflict (slot_key) do nothing;

update public.home_photo_slots
set photo_id = null
where photo_id in (
  select photos.id
  from public.photos
  join public.categories on categories.id = photos.category_id
  where categories.slug = 'urbain'
);

commit;
