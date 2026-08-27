import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Search, Sun, Moon, PanelLeftClose, PanelLeft, PlusCircle } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenSearch: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  onOpenSearch,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const location = useLocation();

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Sidebar Toggle Button (Desktop & Mobile) + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex items-center justify-center p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            title={isSidebarOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar'}
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-5 w-5 text-blue-500" />
            ) : (
              <PanelLeft className="h-5 w-5" />
            )}
          </button>

          <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-500/20 group-hover:bg-blue-500 transition-colors">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Dokumentasi Kantor
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">
                Panduan Penggunaan Perangkat
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Trigger (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between gap-3 px-3.5 py-1.5 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200 transition-all shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span>Cari panduan printer, Wi-Fi, Bluetooth...</span>
            </div>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenSearch}
            className="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg md:hidden"
            title="Cari"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Theme Switcher Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 rounded-lg transition-colors"
            title={darkMode ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700" />
            )}
          </button>

          {/* Request Button */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="hidden sm:inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 active:scale-95 transition-all shadow-md shadow-blue-600/20"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Tambah Perangkat</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
