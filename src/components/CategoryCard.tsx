import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../types/device';
import { Printer, Tv, Fingerprint, ChevronRight, Layers, Share2 } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
}

const getCategoryIcon = (iconName: string) => {
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
      return Layers;
  }
};

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const IconComponent = getCategoryIcon(category.icon);

  return (
    <div
      className={`group border-2 rounded-xl p-5 transition-all duration-200 flex flex-col justify-between ${
        category.available
          ? 'border-slate-200 bg-white hover:border-blue-500/60 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-blue-500/50 dark:hover:bg-slate-900/80 shadow-sm'
          : 'border-slate-200 bg-slate-50 opacity-75 dark:border-slate-800/40 dark:bg-slate-950/40'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-600/10 dark:border-blue-500/20 dark:text-blue-400 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <IconComponent className="h-6 w-6" />
          </div>
          {category.available ? (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
              {category.deviceCount} Perangkat
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
              Segera Hadir
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1.5">
          {category.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          {category.description}
        </p>
      </div>

      <div>
        {category.available ? (
          <Link
            to={`/category/${category.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group-hover:translate-x-1"
          >
            <span>Lihat Daftar Perangkat</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500 italic">
            Dokumentasi sedang disiapkan
          </span>
        )}
      </div>
    </div>
  );
};
