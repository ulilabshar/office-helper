import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';
import { slugify } from '../utils/slugify';
import { Home, Printer, Tv, Fingerprint, ChevronRight, Sparkles, BookOpen, X, Share2, MessageCircle, Video, Monitor } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Printer':
      return Printer;
    case 'Share2':
      return Share2;
    case 'Projector':
      return Monitor;
    case 'Tv':
      return Video;
    case 'Fingerprint':
      return Fingerprint;
    default:
      return BookOpen;
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { categories, devices } = useCatalog();

  // Helper function to force smooth scroll to top and clear mouse text selections
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
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-72 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 transition-transform duration-300 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-4 space-y-6">
          {/* Header Mobile Close Button */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Menu Navigasi
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Main Nav */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Navigasi Utama
            </div>
            <NavLink
              to="/"
              onClick={handleSidebarNavClick}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Home className="h-4 w-4 text-blue-500" />
              <span>Beranda Panduan</span>
            </NavLink>
          </div>

          {/* Categories & Devices List */}
          <div className="space-y-4">
            <div className="px-3 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Kategori Alat Kantor
            </div>

            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category.icon);
              const categoryDevices = devices.filter((d) => d.categorySlug === category.slug);

              return (
                <div key={category.id} className="space-y-1">
                  {/* Clickable Category Header Link */}
                  {category.available ? (
                    <NavLink
                      to={`/category/${category.slug}`}
                      onClick={handleSidebarNavClick}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                          isActive
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-600/10'
                            : 'text-slate-800 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-3.5 w-3.5 text-blue-500" />
                        <span>{category.title}</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </NavLink>
                  ) : (
                    <div className="flex items-center justify-between px-3 py-1.5 text-xs font-bold text-slate-400 dark:text-slate-500">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-3.5 w-3.5 text-slate-400" />
                        <span>{category.title}</span>
                      </div>
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-500 rounded border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                        Segera
                      </span>
                    </div>
                  )}

                  {/* Sub-item Devices Navigation */}
                  {category.available ? (
                    <div className="pl-3 space-y-1 border-l border-slate-200 dark:border-slate-800 ml-4">
                      {categoryDevices.map((device) => (
                        <NavLink
                          key={device.id}
                          to={`/docs/${category.slug}/${device.slug || slugify(device.name)}`}
                          onClick={handleSidebarNavClick}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                              isActive
                                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
                            }`
                          }
                        >
                          <span className="truncate">{device.name}</span>
                          <ChevronRight className="h-3 w-3 opacity-60" />
                        </NavLink>
                      ))}
                    </div>
                  ) : (
                    <div className="pl-3 py-1 ml-4 border-l border-slate-200 dark:border-slate-800/50">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                        Belum ada perangkat terdaftar
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Help Footer with Direct WhatsApp Support Link */}
          <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-500/10 dark:border-emerald-500/30 space-y-2.5 transition-colors">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Butuh Bantuan IT Support?</span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                Hubungi Tim IT Support kantor secara langsung via WhatsApp:
              </p>
              <a
                href="https://wa.me/6285157816339"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 transition-all shadow-sm"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat IT Support (+6285157816339)</span>
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
