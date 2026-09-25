import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminTab } from '../../types/admin';
import {
  Menu,
  Sun,
  Moon,
  PlusCircle,
  Search,
  ChevronRight,
  ShieldCheck,
  Bell,
  LogOut,
} from 'lucide-react';

interface AdminHeaderProps {
  activeTab: AdminTab;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onOpenAddDevice?: () => void;
  onOpenSearchModal?: () => void;
}

const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard Overview', subtitle: 'Ringkasan performa dan statistik dokumen kantor' },
  devices: { title: 'Manajemen Devices', subtitle: 'Daftar dan konfigurasi seluruh peralatan kantor' },
  categories: { title: 'Kategori Alat', subtitle: 'Kelola grup dan klasifikasi perangkat' },
  guides: { title: 'Langkah Panduan OS', subtitle: 'Kelola panduan multi-OS (Windows & macOS)' },
  faq: { title: 'Bank FAQ & Troubleshooting', subtitle: 'Tanya jawab dan solusi permasalahan perangkat' },
  settings: { title: 'Pengaturan Sistem', subtitle: 'Konfigurasi kontak support, backup, dan metadata' },
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  darkMode,
  setDarkMode,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  onOpenAddDevice,
  onOpenSearchModal,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const currentTabInfo = tabTitles[activeTab] || { title: 'Admin Panel', subtitle: 'Office Helper' };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Sidebar Trigger + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            title="Buka Menu Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <Link to="/dashboard" className="hover:text-slate-900 dark:hover:text-white">
                Admin
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-slate-900 dark:text-white font-bold capitalize">
                {activeTab}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight hidden sm:block">
              {currentTabInfo.title}
            </h1>
          </div>
        </div>

        {/* Center: Search Trigger in Admin */}
        <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md mx-4">
          <button
            type="button"
            onClick={onOpenSearchModal}
            className="w-full flex items-center justify-between gap-3 px-3.5 py-1.5 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200/80 hover:text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200 transition-all shadow-inner text-left"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate">Cari perangkat, panduan, FAQ...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-200 dark:bg-slate-800 text-slate-500 shrink-0">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Button */}
          <button
            onClick={onOpenSearchModal}
            className="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl md:hidden"
            title="Cari data, panduan & FAQ"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Quick CTA: Tambah Perangkat */}
          <button
            onClick={onOpenAddDevice || (() => navigate('/dashboard/devices'))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 active:scale-95 transition-all shadow-sm shadow-blue-600/25"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tambah Perangkat</span>
            <span className="sm:hidden">Tambah</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 rounded-xl transition-colors"
            title={darkMode ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          >
            {darkMode ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>

          {user && (
            <span className="hidden lg:inline text-[11px] font-semibold text-slate-500 truncate max-w-[120px]">
              {user.name}
            </span>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors"
            title="Keluar dari Akun Admin"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
