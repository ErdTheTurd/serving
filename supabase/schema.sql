-- Run this in Supabase Dashboard → SQL Editor
-- Project: https://rhcambnracldfibsqjdg.supabase.co

-- 1) Enable Anonymous sign-ins:
--    Authentication → Providers → Anonymous → Enable

-- Profiles (one row per signed-in server)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  points integer not null default 0,
  masses_served integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

-- Authenticated users (including anonymous) can read all profiles & slots
create policy "profiles_select" on public.profiles for select to authenticated using (true);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id);

create policy "mass_slots_select" on public.mass_slots for select to authenticated using (true);
create policy "mass_slots_insert" on public.mass_slots for insert to authenticated with check (true);
create policy "mass_slots_update" on public.mass_slots for update to authenticated using (true);

-- Auto-create profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, '');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Realtime (optional): Database → Replication → add mass_slots to publication
