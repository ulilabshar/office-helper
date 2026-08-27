import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { categoriesData } from '../data/categories';
import { getDevicesByCategory } from '../data/devices';
import { DeviceCard } from '../components/DeviceCard';
import { Printer, ChevronRight, Home, Layers, Share2, Tv, Fingerprint, FileText } from 'lucide-react';

const getCategoryHeaderIcon = (iconName: string) => {
  switch (iconName) {
    case 'Printer':
      return Printer;
    case 'Share2':
      return Share2;
    case 'Projector':
      return Tv;
    case 'Fingerprint':
      return Fingerprint;
    default:
      return FileText;
  }
};

export const CategoryPage: React.FC = () => {
  const { categorySlug, catSlug } = useParams<{ categorySlug?: string; catSlug?: string }>();
  const activeSlug = categorySlug || catSlug || '';

  const category = categoriesData.find((c) => c.slug === activeSlug);
  const devices = getDevicesByCategory(activeSlug);

  if (!category) {
    return (
      <div className="py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Kategori Tidak Ditemukan
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Kategori "{activeSlug}" tidak terdaftar dalam sistem.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500"
        >
          <Home className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    );
  }

  const IconComponent = getCategoryHeaderIcon(category.icon);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
          Beranda
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-900 font-semibold dark:text-slate-100">
          {category.title}
        </span>
      </nav>

      {/* Category Banner */}
      <div className="border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 rounded-xl p-6 sm:p-8 backdrop-blur-md shadow-sm transition-colors">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20">
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Kategori: {category.title}
            </h1>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
              {devices.length} Panduan Terdaftar
            </span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
          {category.description}
        </p>
      </div>

      {/* Devices List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Daftar Panduan {category.title}
        </h2>

        {devices.length === 0 ? (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <Layers className="h-8 w-8 mx-auto text-slate-400" />
            <p className="text-sm font-semibold">Belum Ada Panduan di Kategori Ini</p>
            <p className="text-xs text-slate-500">
              Panduan perangkat untuk kategori ini akan segera ditambahkan oleh tim IT.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
