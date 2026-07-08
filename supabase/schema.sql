-- Run this in Supabase Dashboard → SQL Editor
-- Project: https://rhcambnracldfibsqjdg.supabase.co
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS

-- 1) Enable auth providers:
--    Authentication → Providers → Anonymous → Enable
--    Authentication → Providers → Email → Enable (magic link)

-- Profiles (one row per signed-in server)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  points integer not null default 0,
  masses_served integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists avatar_url text;

-- Mass schedule slots (shared parish board)
create table if not exists public.mass_slots (
  id text primary key,
  mass_date date not null,
  mass_time text not null,
  label text not null default 'Low Mass',
  priest text not null default 'Fr. FSSP',
  ac1_id uuid references public.profiles(id) on delete set null,
  ac1_name text,
  ac1_trade_offer boolean not null default false,
  ac2_id uuid references public.profiles(id) on delete set null,
  ac2_name text,
  ac2_trade_offer boolean not null default false,
  served boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists mass_slots_date_idx on public.mass_slots (mass_date);

alter table public.profiles enable row level security;
alter table public.mass_slots enable row level security;

-- Schedule admins (parish MC / coordinators)
create or replace function public.is_schedule_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'erdunn706@gmail.com',
    'froneill@fssp.com'
  );
$$;

-- Policies (drop first so this script can be re-run safely)
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "mass_slots_select" on public.mass_slots;
drop policy if exists "mass_slots_insert" on public.mass_slots;
drop policy if exists "mass_slots_update" on public.mass_slots;
drop policy if exists "mass_slots_delete" on public.mass_slots;

create policy "profiles_select" on public.profiles for select to authenticated using (true);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id);

create policy "mass_slots_select" on public.mass_slots for select to authenticated using (true);
create policy "mass_slots_update" on public.mass_slots for update to authenticated using (true);
create policy "mass_slots_insert" on public.mass_slots for insert to authenticated with check (public.is_schedule_admin());
create policy "mass_slots_delete" on public.mass_slots for delete to authenticated using (public.is_schedule_admin());

-- Seed empty schedule (callable by any signed-in user on first load)
create or replace function public.seed_mass_slots_if_empty(slots jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.mass_slots limit 1) then
    insert into public.mass_slots (id, mass_date, mass_time, label, priest)
    select
      s->>'id',
      (s->>'date')::date,
      s->>'time',
      coalesce(s->>'label', 'Low Mass'),
      coalesce(s->>'priest', 'Fr. FSSP')
    from jsonb_array_elements(slots) as s;
  end if;
end;
$$;

grant execute on function public.seed_mass_slots_if_empty(jsonb) to authenticated;

-- Auto-create profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, '')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Avatar storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 524288, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 524288;

drop policy if exists "avatars_public_read" on storage.objects;
drop policy if exists "avatars_upload_own" on storage.objects;
drop policy if exists "avatars_update_own" on storage.objects;
drop policy if exists "avatars_delete_own" on storage.objects;

create policy "avatars_public_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_upload_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Realtime (optional): Database → Replication → add mass_slots to publication
