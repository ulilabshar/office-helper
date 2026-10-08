# Office Helper — Pusat Dokumentasi & Panduan Perangkat Kantor

Aplikasi web modern berbasis **React 18**, **TypeScript**, **Vite**, dan **Tailwind CSS** yang dirancang sebagai pusat dokumentasi operasional, panduan langkah-demi-langkah, dan basis pengetahuan (FAQ) perangkat keras maupun perangkat lunak di lingkungan kantor.

---

## 📌 Ringkasan Proyek & Arsitektur

Office Helper mengadopsi arsitektur **Hybrid Client-First** dengan sinkronisasi ke **Supabase (PostgreSQL)**:
1. **Mode Online (Supabase Connected)**: Data kategori, perangkat, panduan langkah, dan FAQ tersinkronisasi secara dua arah langsung ke database PostgreSQL Supabase secara realtime.
2. **Mode Offline/Fallback**: Jika koneksi jaringan atau database belum terkonfigurasi, aplikasi tetap dapat beroperasi normal menggunakan cache `localStorage` dan dataset bawaan (*seed data*).
3. **Pemisahan Jalur Publik & Admin**:
   - **Publik**: Akses bebas untuk staf dan pegawai kantor tanpa perlu login untuk membaca panduan, mencari solusi masalah, dan menyalin instruksi teknis.
   - **Admin (`/dashboard`)**: Dilindungi autentikasi (*Supabase Auth*) untuk mengelola (CRUD) kategori, spesifikasi perangkat, urutan alur langkah, bank FAQ, dan aset berkas.
4. **Performa & Code Splitting**:
   - Menggunakan `React.lazy` dan `React.Suspense` untuk memisahkan halaman admin (`AdminDashboardPage`) dari *bundle* publik utama.
   - Konfigurasi *manual chunks* pada Vite untuk memisahkan `vendor-react`, `vendor-supabase`, dan `vendor-icons`, memastikan waktu muat awal (*First Contentful Paint*) sangat cepat di perangkat desktop maupun seluler.
5. **Keandalan (Fault Tolerance)**: Dilengkapi dengan `ErrorBoundary` tingkat *root* untuk menangkap *exception runtime* tak terduga, mencegah *blank screen*, dan menyediakan opsi pemulihan yang ramah pengguna.

---

## 🚀 Fitur-Fitur Utama

### 1. 🏠 Beranda & Navigasi Panduan Terstruktur
- **Banner Hero Responsif**: Dilengkapi tombol aksi cepat untuk pencarian instan, lompat ke daftar panduan, atau melihat FAQ.
- **Kartu Kategori Interaktif**: Menampilkan kategori peralatan kantor beserta ikon representatif dan jumlah perangkat aktif di dalamnya.
- **Drawer Navigasi Seluler (Android/iOS)**: Sidebar penuh dengan *smooth scrolling*, pengelompokan kategori yang rapi, tombol WhatsApp IT Support yang ringkas, serta pencegahan *background scrolling* saat menu terbuka.

### 2. 📑 Alur Langkah Interaktif (*Stepper Guide*)
- **Penomoran Linier Visual**: Langkah panduan ditampilkan berurutan dengan indikator nomor yang terhubung rapi.
- **Pemilih Sistem Operasi Dinamis (Windows vs macOS)**: Untuk perangkat yang mendukung dual OS, pengguna dapat berpindah panduan antara Windows dan Mac dengan satu klik. Instruksi yang tidak relevan dinonaktifkan otomatis.
- **Instruksi Terperinci & Kotak Kode**: Format langkah per baris (1, 2, 3...) dilengkapi kotak *code snippet* dengan tombol salin instan (*Copy to Clipboard*).
- **Badge Tips & Peringatan**: Menyorot hal-hal krusial seperti frekuensi Wi-Fi 2.4 GHz, mode kabel, atau peringatan keamanan data.

### 3. 🔗 Simulator Hak Akses Tautan (*Share Link Simulator*)
- Widget khusus pada panduan pembagian dokumen (Google Docs, Sheets, Slides, OneDrive).
- Memungkinkan staf menguji coba kombinasi **Access Scope** (*Restricted* vs *Anyone with link*) dan **Permission Level** (*Viewer*, *Commenter*, *Editor*) secara visual sebelum membagikan link dokumen sensitif kantor.

### 4. 🔍 Pencarian Instan & Pintasan Keyboard
- Modal pencarian cepat yang dapat dibuka kapan saja melalui tombol header atau pintasan keyboard **`Ctrl + K`** (atau `Cmd + K` di Mac) dan ditutup dengan tombol **`Esc`**.
- Filter multi-kategori: Cari panduan perangkat atau cari solusi spesifik di bank FAQ secara instan.

### 5. 🎨 Dark Mode & Fleksibilitas Tampilan
- Dukungan tema **Terang (Light)** dan **Gelap (Dark)** dengan penyimpanan preferensi di `localStorage` dan deteksi otomatis preferensi sistem operasi pengguna.

### 6. 🗂️ 34 Pilihan Ikon Kategori Selaras Kantor
- Modul ikon terpusat berbasis `lucide-react` yang mencakup seluruh kebutuhan inventaris kantor:
  - **Cetak & Dokumen**: `Printer`, `Scan`, `Copy`, `FileText`, `Files`, `Folder`, `QrCode`, `Share2`.
  - **Komputer & Display**: `Laptop`, `Cpu`, `Monitor`, `Tv`, `Projector`, `Tablet`, `Keyboard`, `Mouse`.
  - **Jaringan & Server**: `Wifi`, `Router`, `Network`, `Server`, `Cloud`, `HardDrive`, `Database`.
  - **Komunikasi & Meeting**: `PhoneCall`, `Video`, `Mic`, `Volume2`, `Headphones`, `Radio`, `Mail`.
  - **Keamanan & Fasilitas**: `Fingerprint`, `ShieldCheck`, `KeyRound`, `Cctv`, `Zap`, `Wrench`, `Layers`.
- Pemilihan ikon di form admin dilengkapi pratinjau visual SVG langsung di dalam menu dropdown.

### 7. 🛡️ Dashboard Manajemen Admin Lengkap (`/dashboard`)
- **Manajemen Kategori**: Tambah, edit judul, ubah slug URL, tentukan urutan (*sort_order*), ganti ikon, dan atur visibilitas publik.
- **Manajemen Perangkat**: Kelola nama, kategori, status (*Ready*, *Maintenance*, *New*), urutan tampilan, spesifikasi, dan dukungan sistem operasi.
- **Editor Langkah Panduan (Steps CRUD)**:
  - Mode per perangkat: susun alur langkah lengkap dalam satu form editor.
  - Mode satuan (*Single Step*): tambah atau ubah langkah individual dengan dukungan teks terpisah untuk Windows & macOS.
- **Bank FAQ Terpadu**:
  - FAQ Umum: solusi kendala global yang tampil di beranda.
  - FAQ Spesifik: solusi yang langsung terikat ke perangkat tertentu.
- **Manajemen Berkas & Media**: Manajemen tautan unduhan driver resmi, dokumen SOP kantor, dan panduan PDF.
- **Log Aktivitas**: Pencatatan riwayat penambahan, pengubahan, dan penghapusan data oleh administrator.

---

## 📂 Struktur Direktori

```text
office-helper/
├── .env.example              # Contoh variabel lingkungan (Supabase URL & Key)
├── index.html                # Entry point HTML dengan font Plus Jakarta Sans
├── package.json              # Dependensi proyek & scripts (build, dev, typecheck)
├── tsconfig.json             # Konfigurasi TypeScript
├── vite.config.ts            # Konfigurasi Vite & manual chunk splitting
├── vercel.json               # Konfigurasi rewrite SPA untuk hosting Vercel
│
├── supabase/
│   └── schema.sql            # Skema tabel PostgreSQL & RLS Supabase
│
└── src/
    ├── App.tsx               # Root component, routing, Auth guard & Error Boundary
    ├── main.tsx              # Entry point React DOM
    ├── index.css             # Tailwind CSS & styling kustom
    ├── vite-env.d.ts         # Deklarasi tipe lingkungan Vite
    │
    ├── components/           # Komponen UI Publik & Bersama
    │   ├── AccordionFaq.tsx       # Komponen FAQ akordion dengan fitur pencarian
    │   ├── CategoryCard.tsx      # Kartu kategori di halaman beranda
    │   ├── CustomSelect.tsx      # Komponen dropdown select custom dengan preview ikon
    │   ├── DeviceCard.tsx        # Kartu perangkat panduan
    │   ├── Header.tsx            # Header atas navigasi & toggle tema
    │   ├── OsTabSelector.tsx     # Selector tab sistem operasi (Windows / Mac)
    │   ├── SearchModal.tsx       # Modal pencarian cepat (Ctrl + K)
    │   ├── ShareLinkSimulator.tsx# Widget simulator hak akses link dokumen
    │   ├── Sidebar.tsx           # Drawer navigasi samping responsif
    │   ├── StepGuide.tsx         # Komponen stepper alur langkah interaktif
    │   └── admin/                # Komponen Khusus Panel Admin
    │       ├── AdminCrudForms.tsx    # Modal form CRUD (Device, Category, Step, FAQ, Media)
    │       ├── AdminHeader.tsx       # Header atas panel admin
    │       ├── AdminSearchModal.tsx  # Pencarian cepat khusus data admin
    │       ├── AdminSidebar.tsx      # Navigasi tab panel admin
    │       └── CrudModal.tsx         # Wrapper modal dialog CRUD
    │
    ├── context/              # Manajemen State Aplikasi (React Context)
    │   ├── AuthContext.tsx       # Autentikasi Supabase & session management
    │   └── CatalogContext.tsx    # State katalog data perangkat, kategori, step & FAQ
    │
    ├── data/                 # Dataset Awal & Seed Data
    │   ├── adminData.ts          # Dataset statistik awal, log, dan media
    │   ├── categories.ts         # Dataset kategori default
    │   └── devices/              # Panduan default perangkat (Epson, TV, Lumens, dll.)
    │
    ├── lib/                  # Utilitas Logika & Integrasi Eksternal
    │   ├── catalog.ts            # Fungsi helper manipulasi katalog data & LocalStorage
    │   ├── errorHandler.ts       # Formatter error ramah pengguna (PostgREST & JS errors)
    │   └── supabase.ts           # Client Supabase & API helpers (CRUD PostgreSQL)
    │
    ├── pages/                # Halaman Aplikasi
    │   ├── HomePage.tsx          # Beranda utama publik
    │   ├── CategoryPage.tsx      # Halaman daftar perangkat per kategori
    │   ├── DeviceDetailPage.tsx  # Halaman detail panduan perangkat & stepper
    │   ├── LoginPage.tsx         # Halaman login administrator
    │   └── admin/
    │       └── AdminDashboardPage.tsx # Dashboard komprehensif manajemen admin
    │
    ├── types/                # Definisi TypeScript Interfaces & Types
    │   ├── admin.ts              # Tipe log, media, settings, dan tab admin
    │   └── device.ts             # Tipe kategori, perangkat, langkah, dan FAQ
    │
    └── utils/                # Fungsi Utilitas Umum
        ├── categoryIcons.tsx     # Registry terpusat 34 ikon kategori & resolver
        └── slugify.ts            # Generator URL slug ramah SEO
```

---

## 🛠️ Panduan Instalasi & Menjalankan Proyek

### 1. Prasyarat
- **Node.js** versi 18.0.0 atau yang lebih baru.
- **npm** atau **yarn** / **pnpm**.

### 2. Pemasangan Dependensi
```bash
git clone https://github.com/ulilabshar/office-helper.git
cd office-helper
npm install
```

### 3. Konfigurasi Lingkungan (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan konfigurasi kunci Supabase Anda:
```env
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-publishable-key>
```

### 4. Menjalankan di Mode Pengembangan
```bash
npm run dev
```
Buka peramban di `http://localhost:5173`.

### 5. Pemeriksaan Tipe Data (Typecheck)
```bash
npm run typecheck
```

### 6. Build Produksi
```bash
npm run build
```
Hasil build yang teroptimasi dan terbagi dalam beberapa *vendor chunk* akan berada di folder `dist/`.

---

## 🗄️ Skema Database Supabase

Aplikasi menggunakan 4 tabel utama pada Supabase PostgreSQL (dapat di-generate menggunakan `supabase/schema.sql`):
1. **`categories`**: Menyimpan kategori alat kantor (`id`, `title`, `slug`, `description`, `icon`, `sort_order`, `is_active`).
2. **`devices`**: Menyimpan katalog perangkat (`id`, `category_id`, `nama_perangkat`, `slug`, `deskripsi_singkat`, `status`, `supported_os`, `specs`, `image_url`, `sort_order`).
3. **`steps`**: Menyimpan langkah-langkah alur panduan (`id`, `device_id`, `title`, `description`, `konten_windows`, `konten_mac`, `sort_order`).
4. **`faqs`**: Menyimpan daftar tanya-jawab bantuan (`id`, `device_id` [opsional untuk FAQ umum], `question`, `answer`, `sort_order`).

---

## 📄 Lisensi
Proyek ini dikembangkan untuk kebutuhan operasional dokumentasi internal kantor. Hak cipta dilindungi undang-undang.
