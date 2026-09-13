-- forge/events Supabase schema
create extension if not exists "pgcrypto";

do $$ begin create type public.registration_status as enum ('new', 'under_review', 'accepted', 'waitlisted', 'rejected'); exception when duplicate_object then null; end $$;
do $$ begin create type public.hackathon_status as enum ('draft', 'open', 'closed'); exception when duplicate_object then null; end $$;

create table if not exists public.hackathons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text not null default 'Virtual',
  tags text[] not null default '{}',
  prize_pool integer not null default 0 check (prize_pool >= 0),
  capacity integer not null default 500 check (capacity > 0),
  status public.hackathon_status not null default 'draft',
  created_at timestamptz not null default now(),
  constraint ends_after_start check (ends_at > starts_at)
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (email ~* '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'),
  role text not null,
  experience text not null,
  github_url text,
  portfolio_url text,
  resume_path text,
  motivation text,
  status public.registration_status not null default 'new',
  created_at timestamptz not null default now(),
  unique (hackathon_id, email)
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists registrations_hackathon_id_idx on public.registrations(hackathon_id);
create index if not exists registrations_status_idx on public.registrations(status);
create index if not exists hackathons_status_idx on public.hackathons(status);

alter table public.hackathons enable row level security;
alter table public.registrations enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Published hackathons are public" on public.hackathons;
create policy "Published hackathons are public" on public.hackathons for select to anon, authenticated using (status = 'open');

drop policy if exists "Anyone can submit a registration" on public.registrations;
create policy "Anyone can submit a registration" on public.registrations for insert to anon, authenticated with check (status = 'new');

drop policy if exists "Applicants can view their own status" on public.registrations;
create policy "Applicants can view their own status" on public.registrations for select to anon, authenticated using (false);

drop policy if exists "Admins can manage hackathons" on public.hackathons;
create policy "Admins can manage hackathons" on public.hackathons for all to authenticated using (exists (select 1 from public.admin_users where user_id = (select auth.uid()))) with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Admins can manage registrations" on public.registrations;
create policy "Admins can manage registrations" on public.registrations for all to authenticated using (exists (select 1 from public.admin_users where user_id = (select auth.uid()))) with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

insert into storage.buckets (id, name, public) values ('resumes', 'resumes', false) on conflict (id) do nothing;

-- Manual admin allowlist step: replace with a real auth.users id and run after signup.
-- insert into public.admin_users (user_id, email) values ('00000000-0000-0000-0000-000000000000', 'admin@example.com');
