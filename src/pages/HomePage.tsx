import React from 'react';
import { CategoryCard } from '../components/CategoryCard';
import { DeviceCard } from '../components/DeviceCard';
import { useCatalog } from '../context/CatalogContext';
import { Sparkles, Search, ArrowRight, BookOpen } from 'lucide-react';

interface HomePageProps {
  onOpenSearch: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenSearch }) => {
  const { categories, devices } = useCatalog();

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
          {categories.map((cat) => (
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
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      </section>
    </div>
  );
};
