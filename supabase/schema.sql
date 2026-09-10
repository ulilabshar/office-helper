-- ============================================================
-- Office Helper – Supabase PostgreSQL Schema (Simpel & Scalable)
-- Jalankan seluruh script ini di Supabase SQL Editor
-- ============================================================

-- Bersihkan tabel lama jika ada
drop table if exists public.steps cascade;
drop table if exists public.devices cascade;
drop table if exists public.categories cascade;
drop table if exists public.profiles cascade;
drop table if exists public.sections cascade;
drop table if exists public.faqs cascade;
drop table if exists public.activity_logs cascade;

-- Enable UUID extension jika belum aktif
create extension if not exists "pgcrypto";

-- Function otomatis perbarui updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 1. TABEL PROFILES (Terhubung ke Supabase auth.users)
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  username    text unique not null,
  password    text not null,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- 2. TABEL CATEGORIES
-- ============================================================
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  icon        text not null default 'Monitor',
  sort_order  int4 not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger categories_updated_at
  before update on public.categories
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- 3. TABEL DEVICES
-- ============================================================
create table public.devices (
  id                 uuid primary key default gen_random_uuid(),
  category_id        uuid not null references public.categories(id) on delete cascade,
  nama_perangkat     text not null,
  deskripsi_singkat  text,
  status             text not null default 'Ready',
  tambah_os          text[] default '{}',
  image_url          text,
  faq                text,
  sort_order         int4 not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index idx_devices_category_id on public.devices(category_id);

create trigger devices_updated_at
  before update on public.devices
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- 4. TABEL STEPS (Panduan langkah: Windows & Mac)
-- ============================================================
create table public.steps (
  id              uuid primary key default gen_random_uuid(),
  device_id       uuid not null references public.devices(id) on delete cascade,
  title           text not null,
  description     text,
  konten_windows  text,
  konten_mac      text,
  sort_order      int4 not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_steps_device_id on public.steps(device_id);

create trigger steps_updated_at
  before update on public.steps
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.devices    enable row level security;
alter table public.steps      enable row level security;

-- Profiles: Publik dapat membaca username untuk verifikasi login, update hanya pemilik akun
create policy "profiles_read_all" on public.profiles for select using (true);
create policy "profiles_insert_auth" on public.profiles for insert with check (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Categories: Publik dapat melihat (read), Admin/Authenticated dapat kelola (CUD)
create policy "categories_public_read" on public.categories for select using (true);
create policy "categories_auth_all" on public.categories for all using (auth.role() = 'authenticated');

-- Devices: Publik dapat melihat (read), Admin/Authenticated dapat kelola (CUD)
create policy "devices_public_read" on public.devices for select using (true);
create policy "devices_auth_all" on public.devices for all using (auth.role() = 'authenticated');

-- Steps: Publik dapat melihat (read), Admin/Authenticated dapat kelola (CUD)
create policy "steps_public_read" on public.steps for select using (true);
create policy "steps_auth_all" on public.steps for all using (auth.role() = 'authenticated');

-- ============================================================
-- DATA DUMMY (SEED DATA)
-- ============================================================

-- 1. Kategori
insert into public.categories (id, title, description, icon, sort_order) values
  ('11111111-1111-1111-1111-111111111101', 'Printer Kantor', 'Panduan setup Wi-Fi, driver percetakan, dan cetak nirkabel.', 'Printer', 1),
  ('11111111-1111-1111-1111-111111111102', 'Pembagian Link Dokumen', 'Panduan hak akses (Viewer, Commenter, Editor) Google Docs, Sheets, OneDrive.', 'Share2', 2),
  ('11111111-1111-1111-1111-111111111103', 'Smart TV, Proyektor & Display', 'Panduan koneksi HDMI, Smart View, Miracast, dan Apple AirPlay.', 'Projector', 3),
  ('11111111-1111-1111-1111-111111111104', 'Video Conference & Meeting', 'Setup kamera PTZ Lumens, mic speakerphone, Zoom, Google Meet & Teams.', 'Tv', 4),
  ('11111111-1111-1111-1111-111111111105', 'Mesin Absensi', 'Pendaftaran sidik jari, face recognition, dan verifikasi jam kerja.', 'Fingerprint', 5);

-- 2. Perangkat (Devices)
insert into public.devices (id, category_id, nama_perangkat, deskripsi_singkat, status, tambah_os, image_url, faq, sort_order) values
  (
    '22222222-2222-2222-2222-222222222201',
    '11111111-1111-1111-1111-111111111101',
    'Epson EcoTank L3250',
    'Printer All-in-One Ink Tank dengan konektivitas Wi-Fi & Wi-Fi Direct untuk area kerja kantor.',
    'Ready',
    array['windows', 'mac'],
    'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=800',
    'Q: Mengapa printer offline di Windows?
A: Pastikan laptop terhubung ke SSID Wi-Fi kantor "Kantor-Utama" (2.4 GHz) dan printer sudah dinyalakan.

Q: Bagaimana cara cetak tanpa driver di macOS?
A: macOS mendukung fitur Apple AirPrint otomatis tanpa perlu instalasi driver manual.',
    1
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    '11111111-1111-1111-1111-111111111101',
    'Epson WorkForce Pro WF-C879R',
    'Printer Multifungsi Warna A3+ volume tinggi dengan fitur Network LAN dan Secure PIN Print.',
    'Ready',
    array['windows', 'mac'],
    'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&q=80&w=800',
    'Q: Bagaimana mencetak dokumen rahasia dengan PIN?
A: Pada dialog print, aktifkan "Confidential Job / PIN Print", masukkan 4 digit PIN, lalu masukkan PIN pada panel layar printer untuk mulai mencetak.',
    2
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    '11111111-1111-1111-1111-111111111102',
    'Panduan Pembagian Link Dokumen',
    'Standar operasional pembagian link Google Docs, Sheets, Slides, dan Microsoft OneDrive yang aman.',
    'Ready',
    array['windows', 'mac'],
    'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800',
    'Q: Apa beda level akses Viewer vs Commenter?
A: Viewer hanya dapat membaca dokumen tanpa bisa mengubah isi. Commenter dapat menambahkan saran/catatan tanpa merubah teks asli.',
    1
  ),
  (
    '22222222-2222-2222-2222-222222222204',
    '11111111-1111-1111-1111-111111111103',
    'Samsung Crystal UHD 4K Smart TV 55"',
    'Smart TV Ruang Meeting Utama dengan dukungan Wireless Screen Mirroring (Smart View, Miracast, AirPlay 2).',
    'Ready',
    array['windows', 'mac'],
    'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=800',
    'Q: Apa PIN AirPlay untuk Smart TV?
A: PIN 4 angka akan tampil otomatis di layar TV saat pertama kali MacBook mencoba mirroring.',
    1
  ),
  (
    '22222222-2222-2222-2222-222222222205',
    '11111111-1111-1111-1111-111111111103',
    'Interactive Display 75" Touchscreen',
    'Papan tulis digital interaktif 4K UHD dengan multi-touch 20 titik dan wireless presentation dongle.',
    'Ready',
    array['windows', 'mac'],
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
    'Q: Bagaimana mengaktifkan fungsi touchscreen di laptop?
A: Hubungkan kabel USB Touch (Type-A ke Type-B) selain kabel HDMI display.',
    2
  ),
  (
    '22222222-2222-2222-2222-222222222206',
    '11111111-1111-1111-1111-111111111104',
    'Lumens PTZ Camera & Speakerphone',
    'Kamera konferensi PTZ 12x Optical Zoom dengan omnidirectional microphone untuk ruang rapat hybrid.',
    'Ready',
    array['windows', 'mac'],
    'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&q=80&w=800',
    'Q: Kenapa suara speakerphone feedback / menggema?
A: Pastikan mic laptop dinonaktifkan dan hanya gunakan Lumens Speakerphone sebagai Microphone sekaligus Speaker pada Zoom/Meet.',
    1
  );

-- 3. Langkah-langkah Panduan (Steps)
insert into public.steps (device_id, title, description, konten_windows, konten_mac, sort_order) values
  -- Epson L3250
  (
    '22222222-2222-2222-2222-222222222201',
    'Langkah 1: Koneksi Jaringan Wi-Fi',
    'Menghubungkan printer ke jaringan Wi-Fi lokal kantor.',
    '1. Nyalakan printer dengan menekan tombol Power.
2. Pastikan lampu indikator Wi-Fi menyala hijau.
3. Hubungkan laptop Windows ke SSID: "Kantor-Utama" (2.4 GHz).
4. Masuk ke Settings -> Bluetooth & devices -> Printers & scanners.
5. Klik "Add device" dan pilih "EPSON L3250 Series".',
    '1. Nyalakan printer dan pastikan terhubung ke Wi-Fi kantor.
2. Hubungkan MacBook ke SSID Wi-Fi yang sama ("Kantor-Utama").
3. Buka System Settings -> Printers & Scanners.
4. Klik "Add Printer, Scanner, or Fax...".
5. Pilih "EPSON L3250 Series" dengan protokol AirPrint.',
    1
  ),
  (
    '22222222-2222-2222-2222-222222222201',
    'Langkah 2: Instalasi Driver & Cetak Dokumen',
    'Pengujian cetak dokumen pertama kali.',
    '1. Buka file dokumen (Word atau PDF), tekan Ctrl + P.
2. Pilih printer "EPSON L3250 Series".
3. Pastikan ukuran kertas diatur ke A4.
4. Klik Print untuk mencetak halaman uji.',
    '1. Buka dokumen di Preview atau aplikasi lainnya, tekan Cmd + P.
2. Pilih printer "EPSON L3250 Series".
3. Pastikan Paper Size diatur ke A4.
4. Klik Print untuk mencetak halaman uji.',
    2
  ),
  -- Panduan Pembagian Link Dokumen
  (
    '22222222-2222-2222-2222-222222222203',
    'Langkah 1: Pengaturan Hak Akses Link',
    'Menentukan hak akses yang tepat sebelum membagikan link.',
    '1. Buka dokumen Google Docs atau Sheets Anda.
2. Klik tombol "Bagikan / Share" di pojok kanan atas.
3. Pada bagian "Akses umum", pilih opsi:
   - Viewer: hanya membaca dokumen
   - Commenter: hanya memberi komentar
   - Editor: dapat mengubah dokumen
4. Klik "Salin Link / Copy link".',
    '1. Buka dokumen Google Docs / Sheets di Safari atau Chrome.
2. Klik tombol "Share" warna biru di kanan atas.
3. Atur General Access: pilih "Restricted" atau "Anyone with the link".
4. Tentukan peran (Viewer, Commenter, Editor).
5. Klik "Copy link" lalu klik "Done".',
    1
  ),
  -- Samsung Smart TV
  (
    '22222222-2222-2222-2222-222222222204',
    'Langkah 1: Screen Mirroring Nirkabel',
    'Menampilkan layar laptop ke Smart TV tanpa kabel.',
    '1. Tekan tombol Windows + K pada keyboard laptop Anda.
2. Pada panel Cast di sisi kanan, pilih "Meeting-Room-TV".
3. Pilih mode proyeksi: "Duplicate" (tampilan sama) atau "Extend" (layar kedua).
4. Layar laptop Anda langsung terproyeksi ke TV.',
    '1. Klik ikon Control Center di pojok kanan atas menu bar Mac.
2. Pilih menu "Screen Mirroring".
3. Pilih "Meeting-Room-TV" dari daftar perangkat.
4. Masukkan kode AirPlay 4 digit yang muncul di layar TV.
5. Layar Mac berhasil terhubung.',
    1
  );
