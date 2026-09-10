-- ============================================================
-- Silverhawk WebLearn — upgrade schema fitur diskusi
-- Jalankan di Supabase → SQL Editor (sekali saja)
-- Fitur: reply 3 level, klaim profil, likes, hapus 7 hari
-- ============================================================

-- 1) Kolom tambahan pada comments
alter table public.comments
  add column if not exists parent_id uuid references public.comments(id) on delete cascade,
  add column if not exists depth int not null default 0,
  add column if not exists is_claimed boolean not null default false,
  add column if not exists likes int not null default 0;

create index if not exists comments_parent_id_idx on public.comments (parent_id);
create index if not exists comments_is_claimed_idx on public.comments (is_claimed);

-- 2) Tabel profil (klaim nama + password hash + avatar)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  password_hash text not null,
  avatar_seed text not null default '1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Baca profil publik (opsional, untuk cek claimed)
drop policy if exists "Public read profiles" on public.profiles;
create policy "Public read profiles"
  on public.profiles for select
  to anon, authenticated
  using (true);

-- Insert / update profil (klaim) — terbuka untuk demo komunitas
drop policy if exists "Public upsert profiles" on public.profiles;
create policy "Public upsert profiles"
  on public.profiles for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Public update profiles" on public.profiles;
create policy "Public update profiles"
  on public.profiles for update
  to anon, authenticated
  using (true)
  with check (true);

grant select, insert, update on public.profiles to anon, authenticated;

-- 3) Pastikan policy comments mendukung update (likes + claim)
drop policy if exists "Public update comments" on public.comments;
create policy "Public update comments"
  on public.comments for update
  to anon, authenticated
  using (true)
  with check (true);

grant select, insert, update on public.comments to anon, authenticated;

-- 4) Realtime (abaikan error jika sudah ada)
do $$
begin
  alter publication supabase_realtime add table public.comments;
exception when duplicate_object then
  null;
end $$;

-- 5) (Opsional) Bersihkan komentar tidak diklaim yang lebih dari 7 hari
-- Jalankan manual kapan saja, atau jadwalkan lewat cron / Edge Function
-- delete from public.comments
-- where is_claimed = false
--   and created_at < now() - interval '7 days';

-- Selesai. Refresh website lalu uji reply, klaim profil, dan like.
