import React, { useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';
import { slugify } from '../utils/slugify';
import {
  Home,
  Printer,
  Tv,
  Fingerprint,
  ChevronRight,
  Sparkles,
  BookOpen,
  X,
  Share2,
  MessageCircle,
} from 'lucide-react';
import { getCategoryIcon } from '../utils/categoryIcons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { categories, devices } = useCatalog();

  // Prevent background scrolling on mobile when sidebar is open
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && window.innerWidth < 1024) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Helper function to smooth scroll to top, deselect text, and close drawer on mobile
  const handleSidebarNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/65 backdrop-blur-xs lg:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 lg:top-16 lg:z-30 w-[86vw] max-w-[328px] sm:w-80 lg:w-72 bg-white dark:bg-slate-950 border-r border-slate-200/90 dark:border-slate-800 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none flex flex-col rounded-r-3xl lg:rounded-none overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header: Sleek, Sticky, with Logo & Touch-Friendly Close Button */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shrink-0 lg:hidden">
          <Link
            to="/"
            onClick={handleSidebarNavClick}
            className="flex items-center gap-2.5 min-w-0 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25 shrink-0 group-hover:bg-blue-500 transition-colors">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white truncate">
                  Dokumentasi
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 shrink-0">
                  OFFICE
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                Panduan Penggunaan Perangkat
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all active:scale-90 shrink-0"
            title="Tutup Menu"
            aria-label="Tutup menu navigasi"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Scrollable Content Body (Hidden scrollbar on Android, smooth momentum touch scrolling) */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-6 no-scrollbar pb-10 sm:pb-6">
          {/* Main Navigation Section */}
          <div>
            <div className="px-2 mb-2 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Navigasi Utama
            </div>
            <NavLink
              to="/"
              onClick={handleSidebarNavClick}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
                }`
              }
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                  location.pathname === '/'
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                }`}
              >
                <Home className="h-4 w-4" />
              </div>
              <span>Beranda Panduan</span>
            </NavLink>
          </div>

          {/* Categories & Devices Section */}
          <div className="space-y-4">
            <div className="px-2 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Kategori Alat Kantor
            </div>

            <div className="space-y-3">
              {categories.map((category) => {
                const IconComponent = getCategoryIcon(category.icon);
                const categoryDevices = devices.filter((d) => d.categorySlug === category.slug);

                return (
                  <div key={category.id} className="space-y-1">
                    {/* Category Header Link */}
                    {category.available ? (
                      <NavLink
                        to={`/category/${category.slug}`}
                        onClick={handleSidebarNavClick}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-2.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                            isActive
                              ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-600/10'
                              : 'text-slate-800 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 hover:bg-slate-100/80 dark:hover:bg-slate-900/60'
                          }`
                        }
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
                            <IconComponent className="h-3.5 w-3.5" />
                          </div>
                          <span className="truncate">{category.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {categoryDevices.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                              {categoryDevices.length}
                            </span>
                          )}
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600" />
                        </div>
                      </NavLink>
                    ) : (
                      <div className="flex items-center justify-between px-2.5 py-1.5 text-xs font-bold text-slate-400 dark:text-slate-500">
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-400 shrink-0">
                            <IconComponent className="h-3.5 w-3.5" />
                          </div>
                          <span className="truncate">{category.title}</span>
                        </div>
                        <span className="px-1.5 py-0.5 text-[9px] font-medium bg-slate-100 text-slate-500 rounded border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                          Segera
                        </span>
                      </div>
                    )}

                    {/* Sub-item Devices Navigation List */}
                    {category.available ? (
                      <div className="ml-3.5 pl-3 border-l-2 border-slate-100 dark:border-slate-800 space-y-0.5 mt-1">
                        {categoryDevices.map((device) => (
                          <NavLink
                            key={device.id}
                            to={`/docs/${category.slug}/${device.slug || slugify(device.name)}`}
                            onClick={handleSidebarNavClick}
                            className={({ isActive }) =>
                              `flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-all ${
                                isActive
                                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/60'
                              }`
                            }
                          >
                            <span className="truncate pr-1">{device.name}</span>
                            <ChevronRight
                              className={`h-3 w-3 shrink-0 opacity-60 ${
                                location.pathname.includes(device.slug || '') ? 'text-white' : ''
                              }`}
                            />
                          </NavLink>
                        ))}
                      </div>
                    ) : (
                      <div className="ml-3.5 pl-3 py-0.5 border-l-2 border-slate-100 dark:border-slate-800/50">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                          Belum ada perangkat terdaftar
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Help Footer Card with WhatsApp Link */}
          <div className="pt-1">
            <div className="p-2.5 rounded-xl border border-emerald-200/90 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-500/10 space-y-2 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Butuh Bantuan IT Support?</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                Hubungi via WhatsApp: <span className="font-semibold text-emerald-700 dark:text-emerald-400">+62 851-5781-6339</span>
              </p>
              <a
                href="https://wa.me/6285157816339"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 transition-all shadow-xs whitespace-nowrap"
              >
                <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Chat IT Support</span>
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
