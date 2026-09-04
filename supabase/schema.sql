-- ============================================================
-- Office Helper – Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  full_name   text,
  role        text not null default 'admin' check (role in ('admin', 'superadmin')),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
create table if not exists public.categories (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  title       text not null,
  description text,
  icon        text not null default 'Monitor',
  available   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger categories_updated_at
  before update on public.categories
  for each row execute procedure public.handle_updated_at();

create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_categories_available on public.categories(available);

-- ============================================================
-- 3. DEVICES
-- ============================================================
create table if not exists public.devices (
  id                 uuid primary key default uuid_generate_v4(),
  category_id        uuid not null references public.categories(id) on delete restrict,
  nama_perangkat     text not null,
  deskripsi_singkat  text,
  status             text not null default 'Ready' check (status in ('Ready', 'Maintenance', 'New')),
  fitur_kunci        text,
  tambah_os          text[] default '{}',
  image_url          text,
  sort_order         int not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger devices_updated_at
  before update on public.devices
  for each row execute procedure public.handle_updated_at();

create index if not exists idx_devices_category_id on public.devices(category_id);
create index if not exists idx_devices_status on public.devices(status);

-- ============================================================
-- 4. SECTIONS
-- ============================================================
create table if not exists public.sections (
  id          uuid primary key default uuid_generate_v4(),
  device_id   uuid not null references public.devices(id) on delete cascade,
  title       text not null,
  tab_label   text,
  icon_name   text not null default 'BookOpen',
  badge       text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger sections_updated_at
  before update on public.sections
  for each row execute procedure public.handle_updated_at();

create index if not exists idx_sections_device_id on public.sections(device_id);

-- ============================================================
-- 5. STEPS (konten_panduan - 2 kolom: windows & mac)
-- ============================================================
create table if not exists public.steps (
  id              uuid primary key default uuid_generate_v4(),
  section_id      uuid not null references public.sections(id) on delete cascade,
  title           text not null,
  description     text,
  konten_windows  text,
  konten_mac      text,
  os_target       text not null default 'all' check (os_target in ('all', 'windows', 'mac')),
  code_snippet    text,
  warning         text,
  tip             text,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger steps_updated_at
  before update on public.steps
  for each row execute procedure public.handle_updated_at();

create index if not exists idx_steps_section_id on public.steps(section_id);

-- ============================================================
-- 6. FAQS
-- ============================================================
create table if not exists public.faqs (
  id          uuid primary key default uuid_generate_v4(),
  device_id   uuid references public.devices(id) on delete cascade,
  question    text not null,
  answer      text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger faqs_updated_at
  before update on public.faqs
  for each row execute procedure public.handle_updated_at();

create index if not exists idx_faqs_device_id on public.faqs(device_id);

-- ============================================================
-- 7. ACTIVITY_LOGS
-- ============================================================
create table if not exists public.activity_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete set null,
  username    text,
  action      text not null check (action in ('CREATE', 'UPDATE', 'DELETE', 'AUTH', 'SYSTEM')),
  target      text not null,
  description text,
  ip_address  text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_activity_logs_user_id on public.activity_logs(user_id);
create index if not exists idx_activity_logs_action on public.activity_logs(action);
create index if not exists idx_activity_logs_created_at on public.activity_logs(created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.profiles       enable row level security;
alter table public.categories     enable row level security;
alter table public.devices        enable row level security;
alter table public.sections       enable row level security;
alter table public.steps          enable row level security;
alter table public.faqs           enable row level security;
alter table public.activity_logs  enable row level security;

create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'superadmin')
  );
$$;

-- PROFILES
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- CATEGORIES
create policy "categories_public_read" on public.categories for select using (true);
create policy "categories_admin_insert" on public.categories for insert with check (public.is_admin());
create policy "categories_admin_update" on public.categories for update using (public.is_admin());
create policy "categories_admin_delete" on public.categories for delete using (public.is_admin());

-- DEVICES
create policy "devices_public_read" on public.devices for select using (true);
create policy "devices_admin_insert" on public.devices for insert with check (public.is_admin());
create policy "devices_admin_update" on public.devices for update using (public.is_admin());
create policy "devices_admin_delete" on public.devices for delete using (public.is_admin());

-- SECTIONS
create policy "sections_public_read" on public.sections for select using (true);
create policy "sections_admin_insert" on public.sections for insert with check (public.is_admin());
create policy "sections_admin_update" on public.sections for update using (public.is_admin());
create policy "sections_admin_delete" on public.sections for delete using (public.is_admin());

-- STEPS
create policy "steps_public_read" on public.steps for select using (true);
create policy "steps_admin_insert" on public.steps for insert with check (public.is_admin());
create policy "steps_admin_update" on public.steps for update using (public.is_admin());
create policy "steps_admin_delete" on public.steps for delete using (public.is_admin());

-- FAQS
create policy "faqs_public_read" on public.faqs for select using (true);
create policy "faqs_admin_insert" on public.faqs for insert with check (public.is_admin());
create policy "faqs_admin_update" on public.faqs for update using (public.is_admin());
create policy "faqs_admin_delete" on public.faqs for delete using (public.is_admin());

-- ACTIVITY LOGS
create policy "logs_admin_select" on public.activity_logs for select using (public.is_admin());
create policy "logs_admin_insert" on public.activity_logs for insert with check (public.is_admin());

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'username')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
