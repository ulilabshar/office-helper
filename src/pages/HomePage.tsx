import React from 'react';
import { Link } from 'react-router-dom';
import { categoriesData } from '../data/categories';
import { devicesData } from '../data/devices';
import { CategoryCard } from '../components/CategoryCard';
import { DeviceCard } from '../components/DeviceCard';
import { NoticeBoard } from '../components/NoticeBoard';
import { AccordionFaq } from '../components/AccordionFaq';
import { Sparkles, Search, ArrowRight, ShieldCheck, Cpu, BookOpen } from 'lucide-react';

interface HomePageProps {
  onOpenSearch: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenSearch }) => {
  const defaultFaqs = [
    {
      question: 'Bagaimana jika perangkat printer tidak terdeteksi saat koneksi Wi-Fi?',
      answer: 'Pastikan komputer atau laptop kamu terhubung ke SSID Wi-Fi kantor yang sama (frekuensi 2.4 GHz). Coba matikan dan nyalakan kembali (power cycle) printer dan router Wi-Fi.',
    },
    {
      question: 'Di mana saya bisa mengunduh installer driver printer yang resmi?',
      answer: 'Setiap halaman panduan spesifik printer pada website ini telah menyediakan link installer resmi dan langkah setup driver yang sesuai untuk Windows & macOS.',
    },
    {
      question: 'Bagaimana cara membagikan link dokumen agar tidak bisa diubah orang lain?',
      answer: 'Pilih level izin "Viewer" pada menu Share link agar pengakses hanya dapat membaca isi dokumen tanpa bisa mengedit atau mengubah data.',
    },
    {
      question: 'Bagaimana cara menambahkan alat kantor baru (misal: Proyektor / Mesin Absensi)?',
      answer: 'Struktur folder website ini dibangun secara modular. Kamu cukup menambahkan file konfigurasi data perangkat baru pada folder `src/data/devices/` tanpa mengubah komponen utama.',
    },
  ];

  const handleScrollToAllGuides = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('semua-panduan');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-10 lg:space-y-12">
      {/* Hero Header Section */}
      <section className="relative rounded-2xl border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-6 sm:p-10 lg:p-12 backdrop-blur-md overflow-hidden transition-colors shadow-sm">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Pusat Dokumentasi Peralatan Kantor</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Panduan Lengkap Penggunaan Barang Kantor
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Temukan panduan langkah demi langkah disini agar tidak bingung..
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onOpenSearch}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-600/25"
            >
              <Search className="h-4 w-4" />
              <span>Cari Panduan Perangkat</span>
            </button>

            <a
              href="#semua-panduan"
              onClick={handleScrollToAllGuides}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl border border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white transition-all cursor-pointer"
            >
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span>Lihat Semua Panduan</span>
            </a>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Kategori Alat Kantor
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Pilih jenis peralatan kantor yang ingin diatur koneksinya.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {categoriesData.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* All Available Guides Section (Lihat Semua Panduan Target Anchor) */}
      <section id="semua-panduan" className="space-y-4 scroll-mt-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Semua Panduan Aktif
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Daftar seluruh panduan penggunaan perangkat dan pembagian dokumen kantor yang siap dipakai.
            </p>
          </div>
          <button
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
          >
            <span>Cari Panduan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {devicesData.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      </section>

      {/* Update Notice & Features Section Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notice Board Column */}
        <div className="lg:col-span-2">
          <NoticeBoard />
        </div>

        {/* System Features Card Column */}
        <div className="border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40 rounded-xl p-5 backdrop-blur-sm flex flex-col justify-between space-y-4 shadow-sm transition-colors">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Fitur Sistem Dokumentasi
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Website ini dirancang untuk mempermudah onboarding pegawai dan menghemat waktu tim IT.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>Sakelar OS (Windows vs macOS) per panduan</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                <span>Panduan Pembagian Link (Google Docs, Sheet, OneDrive)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Struktur folder mudah dikembangkan (Scalable)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Mode Gelap & Terang (Dark/Light theme)</span>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Cpu className="h-3.5 w-3.5" /> Static Site Docs
            </span>
            <span className="font-mono text-[10px]">v1.4.0</span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <AccordionFaq items={defaultFaqs} />
      </section>
    </div>
  );
};
