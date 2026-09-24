-- ============================================================
-- Office Helper – Supabase PostgreSQL Schema (Clean & Aligned)
-- Jalankan seluruh script ini di Supabase SQL Editor
-- ============================================================

-- Bersihkan tabel lama jika ada
drop table if exists public.steps cascade;
drop table if exists public.faqs cascade;
drop table if exists public.devices cascade;
drop table if exists public.categories cascade;
drop table if exists public.profiles cascade;

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
  slug        text unique not null,
  description text,
  icon        text not null default 'Printer',
  sort_order  int4 not null default 0,
  is_active   boolean not null default true,
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
  slug               text unique not null,
  deskripsi_singkat  text,
  status             text not null default 'Ready',
  supported_os       text[] default '{"windows", "mac"}',
  specs              text[] default '{}',
  image_url          text,
  sort_order         int4 not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index idx_devices_category_id on public.devices(category_id);
create index idx_devices_slug on public.devices(slug);

create trigger devices_updated_at
  before update on public.devices
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- 4. TABEL STEPS (Panduan Alur Linear: Windows & Mac)
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
-- 5. TABEL FAQS (FAQ Umum & FAQ Spesifik Perangkat)
-- ============================================================
create table public.faqs (
  id          uuid primary key default gen_random_uuid(),
  device_id   uuid references public.devices(id) on delete cascade,
  question    text not null,
  answer      text not null,
  sort_order  int4 not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_faqs_device_id on public.faqs(device_id);

create trigger faqs_updated_at
  before update on public.faqs
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.devices    enable row level security;
alter table public.steps      enable row level security;
alter table public.faqs       enable row level security;

-- Profiles
create policy "profiles_read_all" on public.profiles for select using (true);
create policy "profiles_insert_auth" on public.profiles for insert with check (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Categories
create policy "categories_public_read" on public.categories for select using (true);
create policy "categories_auth_all" on public.categories for all using (auth.role() = 'authenticated');

-- Devices
create policy "devices_public_read" on public.devices for select using (true);
create policy "devices_auth_all" on public.devices for all using (auth.role() = 'authenticated');

-- Steps
create policy "steps_public_read" on public.steps for select using (true);
create policy "steps_auth_all" on public.steps for all using (auth.role() = 'authenticated');

-- FAQs
create policy "faqs_public_read" on public.faqs for select using (true);
create policy "faqs_auth_all" on public.faqs for all using (auth.role() = 'authenticated');

-- ============================================================
-- DATA AWAL LENGKAP (SEED DATA)
-- ============================================================

-- 1. Kategori
insert into public.categories (id, title, slug, description, icon, sort_order, is_active) values
  ('11111111-1111-1111-1111-111111111101', 'Printer Kantor', 'printer', 'Panduan setup Wi-Fi, driver percetakan, dan cetak nirkabel.', 'Printer', 1, true),
  ('11111111-1111-1111-1111-111111111102', 'Pembagian Link Dokumen', 'share-link', 'Panduan hak akses (Viewer, Commenter, Editor) Google Docs, Sheets, OneDrive.', 'Share2', 2, true),
  ('11111111-1111-1111-1111-111111111103', 'Smart TV, Proyektor & Display', 'proyektor', 'Panduan koneksi HDMI, Smart View, Miracast, dan Apple AirPlay.', 'Projector', 3, true),
  ('11111111-1111-1111-1111-111111111104', 'Video Conference & Meeting', 'video-conference', 'Setup kamera PTZ Lumens, mic speakerphone, Zoom, Google Meet & Teams.', 'Tv', 4, true),
  ('11111111-1111-1111-1111-111111111105', 'Mesin Absensi', 'mesin-absensi', 'Pendaftaran sidik jari, face recognition, dan verifikasi jam kerja.', 'Fingerprint', 5, false);

-- 2. Perangkat (Devices)
insert into public.devices (id, category_id, nama_perangkat, slug, deskripsi_singkat, status, supported_os, specs, image_url, sort_order) values
  (
    '22222222-2222-2222-2222-222222222201',
    '11111111-1111-1111-1111-111111111101',
    'Epson EcoTank L3250',
    'epson-ecotank-l3250',
    'Printer All-in-One Ink Tank dengan konektivitas Wi-Fi & Wi-Fi Direct untuk area kerja kantor.',
    'Ready',
    array['windows', 'mac'],
    array['All-in-One (Print, Scan, Copy)', 'Wi-Fi & Wi-Fi Direct', 'Epson Smart Panel App'],
    'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=800',
    1
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    '11111111-1111-1111-1111-111111111101',
    'Epson WorkForce Pro WF-C879R',
    'epson-workforce-wf-c879r',
    'Printer Multifungsi Warna A3+ volume tinggi dengan fitur Network LAN dan Secure PIN Print.',
    'Ready',
    array['windows', 'mac'],
    array['Enterprise A3 Multifungsi', 'Touchscreen Panel', 'Gigabit Ethernet', 'RIPS Ink Pack'],
    'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&q=80&w=800',
    2
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    '11111111-1111-1111-1111-111111111102',
    'Panduan Pembagian Link Dokumen',
    'panduan-pembagian-link-dokumen',
    'Standar operasional pembagian link Google Docs, Sheets, Slides, dan Microsoft OneDrive yang aman.',
    'Ready',
    array['windows', 'mac'],
    array['Lintas Platform (Web)', 'Google Docs & Sheets', 'OneDrive Office 365', 'Proteksi Unduh & Salin'],
    'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800',
    1
  ),
  (
    '22222222-2222-2222-2222-222222222204',
    '11111111-1111-1111-1111-111111111103',
    'Samsung Crystal UHD 4K Smart TV 55"',
    'samsung-crystal-uhd-4k-smart-tv',
    'Smart TV Ruang Meeting Utama dengan dukungan Wireless Screen Mirroring (Smart View, Miracast, AirPlay 2).',
    'Ready',
    array['windows', 'mac'],
    array['Resolusi 4K UHD 55"', 'Dual HDMI Input', 'Wireless Display (Miracast)', 'Apple AirPlay 2 Native'],
    'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=800',
    1
  ),
  (
    '22222222-2222-2222-2222-222222222205',
    '11111111-1111-1111-1111-111111111103',
    'Interactive Display 75" Touchscreen',
    'interactive-display-75-touchscreen',
    'Papan tulis digital interaktif 4K UHD dengan multi-touch 20 titik dan wireless presentation dongle.',
    'Ready',
    array['windows', 'mac'],
    array['Multi-Touch 20 Titik', 'Dual Kabel HDMI + Touch USB', 'Wireless EShare', 'Digital Whiteboard'],
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
    2
  ),
  (
    '22222222-2222-2222-2222-222222222206',
    '11111111-1111-1111-1111-111111111104',
    'Lumens PTZ Camera & Speakerphone',
    'lumens-ptz-camera-speakerphone',
    'Kamera konferensi PTZ 12x Optical Zoom dengan omnidirectional microphone untuk ruang rapat hybrid.',
    'Ready',
    array['windows', 'mac'],
    array['PTZ 12x Optical Zoom', 'Mic Omnidirectional 360°', 'USB Plug & Play', 'Kompatibel Zoom & Meet'],
    'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&q=80&w=800',
    1
  );

-- 3. Langkah-langkah Panduan (Steps Linear Berurutan)
insert into public.steps (device_id, title, description, konten_windows, konten_mac, sort_order) values
  -- Epson L3250
  (
    '22222222-2222-2222-2222-222222222201',
    'Langkah 1: Menghubungkan Printer ke Jaringan Wi-Fi Kantor',
    'Hubungkan printer Epson L3250 ke router Wi-Fi kantor.',
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
    'Langkah 2: Opsi Wi-Fi Direct (Tanpa Router)',
    'Gunakan koneksi Wi-Fi Direct jika jaringan router sedang gangguan.',
    '1. Tekan tombol [Wi-Fi Direct] di printer selama 3 detik hingga lampu berkedip.
2. Di laptop Windows, klik ikon Wi-Fi di taskbar kanan bawah.
3. Pilih SSID "DIRECT-xxxx-L3250".
4. Masukkan password Wi-Fi Direct (cetak password dengan menahan tombol [i] selama 7 detik).',
    '1. Tekan tombol Wi-Fi Direct pada printer selama 3 detik.
2. Di MacBook, buka Control Center -> Wi-Fi.
3. Pilih jaringan "DIRECT-xxxx-L3250".
4. Masukkan password Wi-Fi Direct printer.',
    2
  ),
  (
    '22222222-2222-2222-2222-222222222201',
    'Langkah 3: Uji Cetak Dokumen (Test Print)',
    'Pengujian cetak dokumen pertama kali untuk memastikan respon printer.',
    '1. Buka file dokumen (Word atau PDF), tekan Ctrl + P.
2. Pilih printer "EPSON L3250 Series".
3. Pastikan ukuran kertas diatur ke A4.
4. Klik Print untuk mencetak halaman uji.',
    '1. Buka dokumen di Preview atau aplikasi lainnya, tekan Cmd + P.
2. Pilih printer "EPSON L3250 Series".
3. Pastikan Paper Size diatur ke A4.
4. Klik Print untuk mencetak halaman uji.',
    3
  ),

  -- Epson WF-C879R
  (
    '22222222-2222-2222-2222-222222222202',
    'Langkah 1: Koneksi Jaringan LAN / Wi-Fi Enterprise',
    'Hubungkan printer ke jaringan kantor melalui panel layar sentuh.',
    '1. Pada layar sentuh printer, pilih [General Settings] -> [Network Settings] -> [Wi-Fi Setup].
2. Pilih SSID kantor "Kantor-Utama" atau tancapkan kabel LAN Gigabit di bagian belakang.
3. Periksa IP address printer pada menu status jaringan.',
    '1. Di layar printer, masuk ke menu [General Settings] -> [Network Settings].
2. Sambungkan ke jaringan kantor yang sama dengan Mac.
3. Catat IP address printer untuk verifikasi Bonjour.',
    1
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    'Langkah 2: Menambahkan Printer & Fitur Cetak Rahasia (PIN Print)',
    'Amankan dokumen sensitif kantor dengan fitur PIN Print.',
    '1. Di Windows, buka dialog Print (Ctrl + P) -> Printer Properties.
2. Aktifkan opsi "Job Settings" -> "Confidential Job / PIN Print".
3. Masukkan 4 digit PIN rahasia kamu.
4. Klik Print. Dokumen hanya akan keluar saat kamu memasukkan PIN tersebut langsung di layar touchscreen printer.',
    '1. Pada dialog Print macOS (Cmd + P), pilih menu dropdown "Printer Features".
2. Pilih "Confidential / PIN Print" dan buat 4 digit PIN.
3. Dokumen akan tertahan di memori printer sampai kamu memasukkan PIN di panel mesin.',
    2
  ),

  -- Panduan Pembagian Link Dokumen
  (
    '22222222-2222-2222-2222-222222222203',
    'Langkah 1: Pengaturan Cakupan Akses Link',
    'Menentukan siapa saja yang boleh membuka link sebelum dibagikan.',
    '1. Buka file Google Docs, Sheets, atau OneDrive Anda.
2. Klik tombol "Share / Bagikan" di pojok kanan atas.
3. Pada bagian "Akses umum", tentukan pilihan:
   - Restricted (Dibatasi): Hanya email terdaftar yang bisa membuka.
   - Anyone with the link: Siapa saja yang punya link bisa membuka langsung.',
    '1. Buka dokumen Google Docs / Sheets di browser Safari atau Chrome.
2. Klik tombol "Share" warna biru di kanan atas.
3. Atur General Access: pilih "Restricted" atau "Anyone with the link".',
    1
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    'Langkah 2: Menentukan Level Izin (Viewer, Commenter, Editor)',
    'Mengatur batasan izin pengakses dokumen.',
    '1. Tentukan peran penerima link:
   - Viewer: hanya membaca dokumen tanpa mengubah isi.
   - Commenter: bisa memberikan komentar masukan.
   - Editor: bisa mengubah dan menghapus isi dokumen.
2. Klik "Copy link / Salin link".
3. Tempelkan link ke WhatsApp atau Email rekan kerja.',
    '1. Tentukan peran (Viewer, Commenter, Editor).
2. Klik tombol "Copy link" di pojok kiri bawah pop-up.
3. Bagikan link yang sudah disalin ke rekan kerja.',
    2
  ),

  -- Samsung Smart TV
  (
    '22222222-2222-2222-2222-222222222204',
    'Langkah 1: Screen Mirroring Nirkabel (Wireless Display)',
    'Menampilkan layar laptop ke Smart TV ruang rapat tanpa kabel.',
    '1. Nyalakan Samsung Smart TV ruang meeting.
2. Di laptop Windows, tekan tombol shortcut [Windows + K].
3. Pada panel Cast di sebelah kanan, pilih "Meeting-Room-TV".
4. Pilih mode: "Duplicate" (tampilan sama) atau "Extend" (layar kedua).',
    '1. Nyalakan TV dan pastikan MacBook terhubung ke Wi-Fi yang sama.
2. Klik ikon Control Center di menu bar pojok kanan atas Mac.
3. Klik menu "Screen Mirroring".
4. Pilih "Meeting-Room-TV" dan masukkan kode PIN 4 angka yang tampil di TV.',
    1
  ),
  (
    '22222222-2222-2222-2222-222222222204',
    'Langkah 2: Koneksi Kabel HDMI Alternatif',
    'Gunakan kabel HDMI jika memerlukan transmisi presentasi tanpa latensi.',
    '1. Tancapkan kabel HDMI dari TV ke port laptop Windows.
2. Tekan tombol [Source] pada remote TV dan pilih port HDMI yang aktif.
3. Tekan [Windows + P] untuk menyesuaikan mode layar.',
    '1. Tancapkan kabel HDMI menggunakan adapter USB-C ke MacBook.
2. Pilih input source HDMI di TV.
3. Layar Mac akan otomatis terdeteksi.',
    2
  ),

  -- Interactive Display 75"
  (
    '22222222-2222-2222-2222-222222222205',
    'Langkah 1: Koneksi Kabel HDMI + Kabel Touch USB',
    'Mengaktifkan tampilan layar sekaligus fungsi sentuh pada laptop.',
    '1. Hubungkan kabel HDMI dari layar interaktif ke laptop (menampilkan video).
2. Hubungkan kabel Touch USB (Type-A to Type-B) ke port USB laptop.
3. Kedua kabel WAJIB terpasang agar fitur layar sentuh berfungsi ke laptop Anda.',
    '1. Sambungkan kabel HDMI ke adapter MacBook.
2. Sambungkan kabel Touch USB ke adapter USB MacBook.
3. Layar sentuh 75" langsung siap digunakan sebagai pointer di Mac.',
    1
  ),

  -- Lumens PTZ Camera
  (
    '22222222-2222-2222-2222-222222222206',
    'Langkah 1: Koneksi USB Hardware & Penempatan Speakerphone',
    'Menghubungkan kamera ruang meeting dan speakerphone ke laptop.',
    '1. Tancapkan kabel USB utama Lumens ke port USB laptop rapat.
2. Letakkan unit Speakerphone omnidirectional di tengah meja rapat.
3. Pastikan lampu indikator pada speakerphone menyala biru.',
    '1. Hubungkan kabel USB Lumens ke port USB Mac.
2. Posisikan speakerphone di tengah meja agar mencakup seluruh peserta rapat.',
    1
  ),
  (
    '22222222-2222-2222-2222-222222222206',
    'Langkah 2: Pemilihan Perangkat di Zoom / Google Meet',
    'Memilih kamera dan microphone Lumens di dalam aplikasi meeting.',
    '1. Buka aplikasi Zoom / Google Meet.
2. Pada pengaturan Video, pilih: "Lumens PTZ Camera".
3. Pada pengaturan Audio (Microphone & Speaker), pilih: "Lumens Speakerphone".
4. Jangan gunakan mic bawaan laptop agar suara tidak menggema.',
    '1. Buka Zoom atau Google Meet di Mac.
2. Di menu Camera, pilih "Lumens PTZ Camera".
3. Di menu Audio & Microphone, pilih "Lumens Speakerphone".',
    2
  );

-- 4. Bank FAQ (FAQ Umum & FAQ Perangkat)
insert into public.faqs (device_id, question, answer, sort_order) values
  -- FAQ Umum Beranda (device_id is null)
  (
    null,
    'Bagaimana jika perangkat printer kantor tidak terdeteksi saat koneksi Wi-Fi?',
    'Pastikan komputer atau laptop kamu terhubung ke SSID Wi-Fi kantor yang sama (frekuensi 2.4 GHz). Coba matikan dan nyalakan kembali (power cycle) printer dan router Wi-Fi.',
    1
  ),
  (
    null,
    'Di mana saya bisa mengunduh installer driver printer yang resmi?',
    'Setiap halaman panduan spesifik printer pada website ini telah menyediakan link installer resmi dan langkah setup driver yang sesuai untuk Windows & macOS.',
    2
  ),
  (
    null,
    'Bagaimana cara membagikan link dokumen agar tidak bisa diubah orang lain?',
    'Pilih level izin "Viewer" pada menu Share link agar pengakses hanya dapat membaca isi dokumen tanpa bisa mengedit atau mengubah data.',
    3
  ),

  -- FAQ Perangkat
  (
    '22222222-2222-2222-2222-222222222201',
    'Mengapa printer berstatus offline di Windows?',
    'Pastikan laptop terhubung ke SSID Wi-Fi kantor "Kantor-Utama" (2.4 GHz) dan printer sudah dinyalakan. Periksa juga apakah status "Use Printer Offline" tidak tercentang di Windows Printers.',
    1
  ),
  (
    '22222222-2222-2222-2222-222222222201',
    'Bagaimana cara cetak tanpa driver di macOS?',
    'macOS mendukung fitur Apple AirPrint otomatis sehingga Anda cukup memilih nama printer tanpa perlu instalasi driver manual.',
    2
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    'Apa beda level akses Viewer vs Commenter?',
    'Viewer hanya dapat membaca dokumen tanpa bisa mengubah isi. Commenter dapat menambahkan saran/catatan tanpa merubah teks asli.',
    1
  ),
  (
    '22222222-2222-2222-2222-222222222204',
    'Apa PIN AirPlay untuk Smart TV?',
    'PIN 4 angka akan tampil otomatis di layar TV saat pertama kali MacBook mencoba melakukan mirroring.',
    1
  ),
  (
    '22222222-2222-2222-2222-222222222206',
    'Kenapa suara speakerphone feedback / menggema?',
    'Pastikan mic laptop dinonaktifkan dan hanya gunakan Lumens Speakerphone sebagai Microphone sekaligus Speaker pada Zoom/Meet.',
    1
  );

-- ============================================================
-- 6. GRANT PRIVILEGES (Wajib untuk Supabase PostgREST API)
-- ============================================================
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all sequences in schema public to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;


