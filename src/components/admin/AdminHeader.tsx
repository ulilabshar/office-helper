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
  ExternalLink,
} from 'lucide-react';

interface AdminHeaderProps {
  activeTab: AdminTab;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onOpenAddDevice?: () => void;
}

const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard Overview', subtitle: 'Ringkasan performa dan statistik dokumen kantor' },
  devices: { title: 'Manajemen Devices', subtitle: 'Daftar dan konfigurasi seluruh peralatan kantor' },
  categories: { title: 'Kategori Alat', subtitle: 'Kelola grup dan klasifikasi perangkat' },
  guides: { title: 'Langkah Panduan OS', subtitle: 'Kelola panduan multi-OS (Windows & macOS)' },
  faq: { title: 'Bank FAQ & Troubleshooting', subtitle: 'Tanya jawab dan solusi permasalahan perangkat' },
  media: { title: 'Media & Driver Repository', subtitle: 'Tautan installer driver resmi dan dokumen SOP' },
  logs: { title: 'Activity Logs & Audit', subtitle: 'Riwayat aktivitas admin dan audit trail sistem' },
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
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

        {/* Center: Search Filter in Admin */}
        <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari data, perangkat, log..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
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

          {/* Direct Link to Public Web */}
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Buka Website Publik"
          >
            <span>Web Publik</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Link>
          {user && (
            <span className="hidden lg:inline text-[11px] font-semibold text-slate-500 truncate max-w-[120px]">
              {user.name}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
