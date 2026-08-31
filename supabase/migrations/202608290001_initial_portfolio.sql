begin;

create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  description text not null default '',
  theme_color text not null check (theme_color ~ '^#[0-9A-Fa-f]{6}$'),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
);

create sequence if not exists public.photo_sequence as bigint start with 1 increment by 1 no cycle;

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  sequence_number bigint not null unique default nextval('public.photo_sequence'),
  filename text not null unique check (filename ~ '^photo-[0-9]+\.webp$'),
  storage_path text not null unique,
  category_id uuid not null references public.categories(id) on update cascade on delete restrict,
  alt_text text not null check (char_length(trim(alt_text)) between 3 and 500),
  caption text check (caption is null or char_length(caption) <= 1000),
  width integer not null check (width > 0 and width <= 5000),
  height integer not null check (height > 0 and height <= 5000),
  sort_order integer not null default 0 check (sort_order >= 0),
  is_featured boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists photos_category_order_idx
  on public.photos(category_id, sort_order, sequence_number);
create index if not exists photos_published_idx
  on public.photos(is_published) where is_published = true;
create unique index if not exists one_featured_photo_per_category_idx
  on public.photos(category_id) where is_featured = true;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists photos_set_updated_at on public.photos;
create trigger photos_set_updated_at
before update on public.photos
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.allocate_photo_sequence()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' and not public.is_admin() then
    raise exception 'not authorized';
  end if;
  return nextval('public.photo_sequence');
end;
$$;

revoke all on function public.allocate_photo_sequence() from public;
grant execute on function public.allocate_photo_sequence() to authenticated, service_role;

alter table public.categories enable row level security;
alter table public.photos enable row level security;
alter table public.admin_users enable row level security;

create policy "Public can read categories"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "Admins can manage categories"
  on public.categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Public can read published photos"
  on public.photos for select
  to anon, authenticated
  using (is_published = true or public.is_admin());

create policy "Admins can insert photos"
  on public.photos for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update photos"
  on public.photos for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete photos"
  on public.photos for delete
  to authenticated
  using (public.is_admin());

create policy "Users can verify their admin membership"
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid());

insert into public.categories (slug, title, description, theme_color, sort_order)
values
  (
    'shooting',
    'Shooting',
    'Chaque séance photo est une rencontre, un échange destiné à mettre en lumière votre personnalité et votre singularité. Que ce soit pour un portrait artistique, un projet professionnel ou un souvenir personnel, j’accorde une attention particulière à vos attentes et à l’atmosphère que vous souhaitez transmettre.',
    '#e6c99c',
    0
  ),
  (
    'spectacle-vivant',
    'Spectacle vivant',
    'Sur scène, chaque détail compte : un regard, une posture, un jeu de lumière. Mon approche consiste à capter l’essence même de la performance et l’ambiance singulière du spectacle.',
    '#f0d8a8',
    1
  ),
  (
    'sport',
    'Sport',
    'La photographie sportive demande une grande réactivité et une attention particulière aux détails afin de figer l’intensité du mouvement et l’émotion de l’instant.',
    '#a85b1d',
    2
  ),
  (
    'urbain',
    'Urbain',
    'La ville est un terrain d’expression riche, où chaque bâtiment, chaque perspective et chaque jeu d’ombre raconte une histoire.',
    '#9d8966',
    3
  )
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  theme_color = excluded.theme_color,
  sort_order = excluded.sort_order;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio',
  'portfolio',
  false,
  12582912,
  array['image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

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
        where photos.storage_path = storage.objects.name
          and photos.is_published = true
      )
    )
  );

create policy "Admins can upload portfolio photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio' and public.is_admin());

create policy "Admins can update portfolio photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio' and public.is_admin())
  with check (bucket_id = 'portfolio' and public.is_admin());

create policy "Admins can delete portfolio photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio' and public.is_admin());

commit;
