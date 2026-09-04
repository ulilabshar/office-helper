import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminTab, ActivityLog, MediaAsset, SystemSetting } from '../../types/admin';
import { Device, Category } from '../../types/device';
import { devicesData as initialDevices } from '../../data/devices';
import { categoriesData } from '../../data/categories';
import {
  initialActivityLogs,
  initialMediaAssets,
  defaultSystemSettings,
  calculateDashboardStats,
} from '../../data/adminData';
import {
  isSupabaseReady,
  getDevices as sbGetDevices,
  getCategories as sbGetCategories,
  getFAQs as sbGetFAQs,
  getActivityLogs as sbGetActivityLogs,
  deleteDevice as sbDeleteDevice,
  deleteCategory as sbDeleteCategory,
  deleteFAQ as sbDeleteFAQ,
  logActivity,
  type DeviceRow,
  type FAQ as SupabaseFAQ,
} from '../../lib/supabase';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import {
  LayoutDashboard,
  HardDrive,
  FolderTree,
  BookOpenCheck,
  HelpCircle,
  FolderArchive,
  Activity,
  Settings,
  PlusCircle,
  Search,
  ExternalLink,
  Printer,
  Tv,
  Fingerprint,
  Share2,
  Video,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Trash2,
  Edit3,
  Eye,
  ShieldCheck,
  TrendingUp,
  FileText,
  User,
  RefreshCw,
  Sliders,
  Sparkles,
  Lock,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface AdminDashboardPageProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  darkMode,
  setDarkMode,
}) => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  // Active tab state
  const validTabs: AdminTab[] = [
    'dashboard',
    'devices',
    'categories',
    'guides',
    'faq',
    'media',
    'logs',
    'settings',
  ];
  const currentTab: AdminTab = validTabs.includes(tab as AdminTab)
    ? (tab as AdminTab)
    : 'dashboard';

  const [activeTab, setActiveTab] = useState<AdminTab>(currentTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Local data states (used as fallback; overwritten with Supabase data when available)
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(initialMediaAssets);
  const [settings, setSettings] = useState<SystemSetting>(defaultSystemSettings);
  const [deviceFilterStatus, setDeviceFilterStatus] = useState<string>('ALL');
  const [logFilterAction, setLogFilterAction] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Supabase data fetch ──────────────────────────────────────────────────────
  const loadSupabaseData = useCallback(async () => {
    if (!isSupabaseReady) return;
    setIsLoading(true);
    try {
      const [sbDevices, sbLogs] = await Promise.all([
        sbGetDevices(),
        sbGetActivityLogs(100),
      ]);

      if (sbDevices.length > 0) {
        // Map DeviceRow → Device shape for UI compatibility
        const mapped: Device[] = sbDevices.map((d: DeviceRow) => ({
          id: d.id,
          name: d.nama_perangkat,
          category: d.categories?.title ?? '',
          categorySlug: d.categories?.slug ?? '',
          description: d.deskripsi_singkat ?? '',
          status: d.status,
          specs: d.fitur_kunci ? d.fitur_kunci.split(',').map((s) => s.trim()) : [],
          sections: {} as Device['sections'],
          faqs: [],
        }));
        setDevices(mapped);
      }

      if (sbLogs.length > 0) {
        const mappedLogs: ActivityLog[] = sbLogs.map((l) => ({
          id: l.id,
          user: l.username ?? 'System',
          action: l.action,
          target: l.target,
          description: l.description ?? '',
          timestamp: new Date(l.created_at).toLocaleString('id-ID'),
          ipAddress: l.ip_address,
        }));
        setActivityLogs(mappedLogs);
      }

      setSupabaseConnected(true);
    } catch (err) {
      console.error('Supabase fetch error:', err);
      setSupabaseConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && isSupabaseReady) {
      loadSupabaseData();
    }
  }, [isLoggedIn, loadSupabaseData]);

  const handleTabChange = (newTab: AdminTab) => {
    setActiveTab(newTab);
    navigate(newTab === 'dashboard' ? '/dashboard' : `/dashboard/${newTab}`);
  };

  // Dynamic statistics
  const stats = useMemo(() => {
    return calculateDashboardStats(devices, categoriesData);
  }, [devices]);

  // Status toggle handler
  const handleToggleDeviceStatus = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId) {
          const nextStatus =
            d.status === 'Ready' ? 'Maintenance' : d.status === 'Maintenance' ? 'New' : 'Ready';

          // Log the action
          const newLog: ActivityLog = {
            id: 'log-' + Date.now(),
            user: user?.name || 'Administrator IT',
            action: 'UPDATE',
            target: d.name,
            description: `Status perangkat diubah menjadi "${nextStatus}".`,
            timestamp: 'Baru saja',
            ipAddress: '192.168.1.102',
          };
          setActivityLogs((logs) => [newLog, ...logs]);
          showToast(`Status "${d.name}" diubah menjadi ${nextStatus}`);
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
  };

  // Delete device (Supabase + local state)
  const handleDeleteDevice = async (deviceId: string, deviceName: string) => {
    if (confirm(`Yakin ingin menghapus perangkat "${deviceName}" dari daftar?`)) {
      // Remove from local state immediately
      setDevices((prev) => prev.filter((d) => d.id !== deviceId));

      // Persist to Supabase if connected
      if (supabaseConnected) {
        try {
          await sbDeleteDevice(deviceId);
          await logActivity({
            user_id: user?.id,
            username: user?.name ?? 'Administrator IT',
            action: 'DELETE',
            target: deviceName,
            description: `Perangkat "${deviceName}" dihapus dari sistem.`,
          });
        } catch (err) {
          console.error('Delete device error:', err);
          showToast('Gagal menghapus dari database. Cek koneksi Supabase.');
          return;
        }
      }

      const newLog: ActivityLog = {
        id: 'log-' + Date.now(),
        user: user?.name || 'Administrator IT',
        action: 'DELETE',
        target: deviceName,
        description: `Perangkat "${deviceName}" dihapus dari sistem.`,
        timestamp: 'Baru saja',
        ipAddress: '192.168.1.102',
      };
      setActivityLogs((logs) => [newLog, ...logs]);
      showToast(`Perangkat "${deviceName}" berhasil dihapus.`);
    }
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      officeName: settings.officeName,
      stats,
      devices,
      categories: categoriesData,
      mediaAssets,
      activityLogs,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `office-helper-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data backup JSON berhasil diunduh!');
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      user: user?.name || 'Administrator IT',
      action: 'UPDATE',
      target: 'System Settings',
      description: 'Pengaturan sistem & kontak IT support diperbarui.',
      timestamp: 'Baru saja',
      ipAddress: '192.168.1.102',
    };
    setActivityLogs((logs) => [newLog, ...logs]);
    showToast('Pengaturan sistem berhasil disimpan!');
  };

  // Protected route check
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-8 text-center space-y-5 shadow-xl">
          <div className="h-16 w-16 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
            <Lock className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Akses Dashboard Terbatas
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Halaman ini merupakan area kontrol Administrator IT. Silakan masuk terlebih dahulu dengan <strong>User</strong> dan <strong>Password</strong>.
            </p>
          </div>
          <div className="space-y-2.5 pt-2">
            <Link
              to="/login"
              state={{ from: { pathname: '/dashboard' } }}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20"
            >
              <User className="h-4 w-4" />
              <span>Login Administrator</span>
            </Link>
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span>Kembali ke Halaman Publik</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filtered devices
  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = deviceFilterStatus === 'ALL' || device.status === deviceFilterStatus;
    return matchesSearch && matchesStatus;
  });

  // Filtered logs
  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = logFilterAction === 'ALL' || log.action === logFilterAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200 antialiased selection:bg-blue-500 selection:text-white flex">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 flex items-center justify-center backdrop-blur-sm">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
            <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Memuat data dari Supabase…</span>
          </div>
        </div>
      )}

      {/* Supabase Connection Status Badge (top-left) */}
      {isSupabaseReady && (
        <div className={`fixed top-4 right-4 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold shadow border ${
          supabaseConnected
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
        }`}>
          <span className={`h-2 w-2 rounded-full ${supabaseConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {supabaseConnected ? 'Supabase Connected' : 'Supabase Connecting…'}
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white dark:bg-blue-600 dark:text-white rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200 text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}


      {/* Admin Dedicated Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        deviceCount={devices.length}
        categoryCount={categoriesData.length}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        {/* Admin Header */}
        <AdminHeader
          activeTab={activeTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAddDevice={() => navigate('/add-device')}
        />

        {/* Dashboard Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* ======================================================== */}
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {/* ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Welcome Banner */}
              <div className="relative rounded-2xl border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md overflow-hidden shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative z-10 max-w-2xl space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 text-[11px] font-semibold">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Control Center Admin</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Selamat Datang, {user?.name || 'Administrator IT'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Kelola seluruh dokumentasi peralatan kantor, status konektivitas, panduan instalasi multi-OS, dan bank FAQ dengan mudah dari panel ini.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5 z-10 shrink-0">
                  <button
                    onClick={() => navigate('/add-device')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 active:scale-95 transition-all shadow-md shadow-blue-600/25"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Tambah Perangkat</span>
                  </button>
                  <button
                    onClick={handleExportBackup}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    <span>Ekspor JSON</span>
                  </button>
                </div>
              </div>

              {/* 4 Primary Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* Card 1: Total Devices */}
                <div
                  onClick={() => handleTabChange('devices')}
                  className="group cursor-pointer rounded-2xl border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 p-5 shadow-sm hover:border-blue-500/60 dark:hover:border-blue-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <HardDrive className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                      {stats.readyDevicesCount} Ready
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {stats.totalDevices}
                    </span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Total Perangkat
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {stats.maintenanceDevicesCount} maintenance • {stats.newDevicesCount} baru
                    </p>
                  </div>
                </div>

                {/* Card 2: Total Categories */}
                <div
                  onClick={() => handleTabChange('categories')}
                  className="group cursor-pointer rounded-2xl border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 p-5 shadow-sm hover:border-indigo-500/60 dark:hover:border-indigo-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <FolderTree className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800">
                      Aktif
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {stats.totalCategories}
                    </span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Total Kategori
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Printer, Display, Video Conf, dll.
                    </p>
                  </div>
                </div>

                {/* Card 3: Total Guides */}
                <div
                  onClick={() => handleTabChange('guides')}
                  className="group cursor-pointer rounded-2xl border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 p-5 shadow-sm hover:border-amber-500/60 dark:hover:border-amber-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all">
                      <BookOpenCheck className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                      Win & Mac
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {stats.totalGuides}
                    </span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Total Langkah Panduan
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Modul setup & troubleshooting
                    </p>
                  </div>
                </div>

                {/* Card 4: Total FAQ */}
                <div
                  onClick={() => handleTabChange('faq')}
                  className="group cursor-pointer rounded-2xl border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 p-5 shadow-sm hover:border-emerald-500/60 dark:hover:border-emerald-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <HelpCircle className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                      Troubleshoot
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {stats.totalFaqs}
                    </span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Total FAQ & Solusi
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Pertanyaan umum & kendala
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid 2: Recent Activity Timeline & Devices Quick Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity Stream (2 cols) */}
                <div className="lg:col-span-2 rounded-2xl border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        Recent Activity (Aktivitas Terbaru)
                      </h3>
                    </div>
                    <button
                      onClick={() => handleTabChange('logs')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Lihat Semua Log</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {activityLogs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/80 transition-colors"
                      >
                        <div
                          className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                            log.action === 'CREATE'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : log.action === 'UPDATE'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : log.action === 'DELETE'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          }`}
                        >
                          {log.action.slice(0, 3)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {log.target}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {log.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {log.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                            <span>Oleh: <strong className="text-slate-600 dark:text-slate-300">{log.user}</strong></span>
                            {log.ipAddress && <span>• IP: {log.ipAddress}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Device Status Breakdown (1 col) */}
                <div className="rounded-2xl border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-emerald-500" />
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          Status Kesiapan Alat
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">
                        {devices.length} Total
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Ready (Siap Pakai)
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {stats.readyDevicesCount} ({Math.round((stats.readyDevicesCount / (devices.length || 1)) * 100)}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${(stats.readyDevicesCount / (devices.length || 1)) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Maintenance / Perawatan
                          </span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            {stats.maintenanceDevicesCount}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${(stats.maintenanceDevicesCount / (devices.length || 1)) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            New / Baru Ditambahkan
                          </span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {stats.newDevicesCount}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(stats.newDevicesCount / (devices.length || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Guide Card */}
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/60 space-y-2">
                    <p className="text-xs font-bold text-blue-800 dark:text-blue-300">
                      💡 Kelola Status Cepat
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Klik badge status pada tabel Devices untuk mengubah status perangkat secara instan.
                    </p>
                    <button
                      onClick={() => handleTabChange('devices')}
                      className="w-full py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-500 transition-all shadow-sm"
                    >
                      Buka Menu Devices
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: DEVICES MANAGEMENT */}
          {/* ======================================================== */}
          {activeTab === 'devices' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Daftar & Manajemen Perangkat ({filteredDevices.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Kelola status operasional, panduan, dan data teknis peralatan kantor.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Filters */}
                  {['ALL', 'Ready', 'Maintenance', 'New'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setDeviceFilterStatus(st)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                        deviceFilterStatus === st
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      {st === 'ALL' ? 'Semua Status' : st}
                    </button>
                  ))}

                  <button
                    onClick={() => navigate('/add-device')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all shadow-sm shadow-blue-600/20"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Tambah Perangkat</span>
                  </button>
                </div>
              </div>

              {/* Devices Table */}
              <div className="rounded-2xl border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5">Perangkat</th>
                        <th className="px-5 py-3.5">Kategori</th>
                        <th className="px-5 py-3.5">Status (Klik utk Ubah)</th>
                        <th className="px-5 py-3.5">Spesifikasi Kunci</th>
                        <th className="px-5 py-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {filteredDevices.map((d) => (
                        <tr
                          key={d.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {d.name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs truncate">
                              {d.description}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium">
                              {d.category}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => handleToggleDeviceStatus(d.id)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                                d.status === 'Ready'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-100'
                                  : d.status === 'Maintenance'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 hover:bg-amber-100'
                                  : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 hover:bg-blue-100'
                              }`}
                              title="Klik untuk mengganti status"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              <span>{d.status}</span>
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {d.specs.slice(0, 2).map((s, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                to={`/docs/${d.categorySlug}/${d.id}`}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                                title="Lihat Panduan Publik"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => handleDeleteDevice(d.id, d.name)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title="Hapus Perangkat"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: CATEGORIES */}
          {/* ======================================================== */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Kategori Alat Kantor ({categoriesData.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Klasifikasi kelompok perangkat kantor dan pengaturan ketersediaan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoriesData.map((cat) => (
                  <div
                    key={cat.id}
                    className="border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 flex items-center justify-center font-bold">
                          <FolderTree className="h-5 w-5" />
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cat.available
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {cat.available ? `${cat.deviceCount} Perangkat` : 'Segera Hadir'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {cat.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-mono text-[10px] text-slate-400">slug: {cat.slug}</span>
                      {cat.available && (
                        <Link
                          to={`/category/${cat.slug}`}
                          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <span>Buka Kategori</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: GUIDES */}
          {/* ======================================================== */}
          {activeTab === 'guides' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Langkah Panduan Setup Multi-OS ({stats.totalGuides} Modul & Langkah)
                </h2>
                <p className="text-xs text-slate-500">
                  Instruksi konektivitas Wi-Fi, Bluetooth, Driver, dan Troubleshooting untuk Windows & macOS.
                </p>
              </div>

              <div className="space-y-4">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 rounded-2xl p-5 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          {device.name}
                        </h3>
                        <span className="text-xs text-slate-500">
                          Kategori: {device.category}
                        </span>
                      </div>
                      <Link
                        to={`/docs/${device.categorySlug}/${device.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Lihat Format Lengkap Publik</span>
                      </Link>
                    </div>

                    {/* Sections Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {device.sections &&
                        Object.entries(device.sections).map(([key, sec]) => (
                          <div
                            key={key}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-900 dark:text-white">
                                {sec.title}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold">
                                {sec.badge || 'Modul'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 space-y-0.5">
                              {sec.osSteps && (
                                <>
                                  <p>🪟 Windows: {sec.osSteps.windows?.length || 0} langkah</p>
                                  <p>🍎 macOS: {sec.osSteps.mac?.length || 0} langkah</p>
                                </>
                              )}
                              {sec.steps && <p>📋 Langkah: {sec.steps.length} item</p>}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: FAQ */}
          {/* ======================================================== */}
          {activeTab === 'faq' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Bank FAQ & Troubleshooting ({stats.totalFaqs} Item)
                </h2>
                <p className="text-xs text-slate-500">
                  Daftar tanya jawab seputar operasional peralatan kantor dan solusi penanganan masalah.
                </p>
              </div>

              <div className="space-y-4">
                {/* Default FAQ */}
                <div className="border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 rounded-2xl p-5 shadow-sm space-y-3">
                  <h3 className="font-bold text-sm text-blue-600 dark:text-blue-400">
                    FAQ Umum Kantor
                  </h3>
                  <div className="space-y-2">
                    {[
                      {
                        q: 'Bagaimana jika perangkat printer tidak terdeteksi saat koneksi Wi-Fi?',
                        a: 'Pastikan komputer atau laptop kamu terhubung ke SSID Wi-Fi kantor yang sama (frekuensi 2.4 GHz). Lakukan power cycle pada printer.',
                      },
                      {
                        q: 'Di mana saya bisa mengunduh installer driver printer yang resmi?',
                        a: 'Setiap halaman panduan spesifik printer pada website ini telah menyediakan link installer resmi untuk Windows & macOS.',
                      },
                      {
                        q: 'Bagaimana cara membagikan link dokumen agar tidak bisa diubah orang lain?',
                        a: 'Pilih level izin "Viewer" pada menu Share link agar pengakses hanya dapat membaca tanpa mengedit.',
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800"
                      >
                        <p className="font-bold text-xs text-slate-900 dark:text-white">
                          Q: {item.q}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          A: {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Device FAQs */}
                {devices
                  .filter((d) => d.faqs && d.faqs.length > 0)
                  .map((d) => (
                    <div
                      key={d.id}
                      className="border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 rounded-2xl p-5 shadow-sm space-y-3"
                    >
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        FAQ: {d.name}
                      </h3>
                      <div className="space-y-2">
                        {d.faqs.map((faq, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800"
                          >
                            <p className="font-bold text-xs text-slate-900 dark:text-white">
                              Q: {faq.question}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              A: {faq.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: MEDIA & DRIVER REPOSITORY */}
          {/* ======================================================== */}
          {activeTab === 'media' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Media & Driver Repository ({mediaAssets.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    File installer driver resmi, manual SOP, dan software pendukung peralatan kantor.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {mediaAssets.map((media) => (
                  <div
                    key={media.id}
                    className="border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            media.type === 'driver'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                          }`}
                        >
                          {media.type}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {media.fileSize}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {media.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Target: <strong className="text-slate-700 dark:text-slate-300">{media.targetDevice}</strong> ({media.targetOs.toUpperCase()})
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Update: {media.updatedAt}</span>
                      <a
                        href={media.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Unduh File</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: ACTIVITY LOGS */}
          {/* ======================================================== */}
          {activeTab === 'logs' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Activity Logs & Audit Trail ({filteredLogs.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Rekaman riwayat perubahan konfigurasi, login sesi, dan update panduan.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {['ALL', 'CREATE', 'UPDATE', 'DELETE', 'AUTH'].map((act) => (
                    <button
                      key={act}
                      onClick={() => setLogFilterAction(act)}
                      className={`px-3 py-1 text-xs font-semibold rounded-xl border transition-all ${
                        logFilterAction === act
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div
                        className={`h-8 w-8 rounded-xl flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5 ${
                          log.action === 'CREATE'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : log.action === 'UPDATE'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : log.action === 'DELETE'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}
                      >
                        {log.action}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {log.target}
                            </span>
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              Oleh: {log.user}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {log.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {log.description}
                        </p>
                        {log.ipAddress && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Client IP: {log.ipAddress}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 8: SETTINGS */}
          {/* ======================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Pengaturan Sistem & Kontak IT Support
                </h2>
                <p className="text-xs text-slate-500">
                  Konfigurasi metadata aplikasi, kontak WhatsApp bantuan, dan backup data.
                </p>
              </div>

              <form
                onSubmit={handleSaveSettings}
                className="border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Nama Aplikasi / Portal Kantor
                    </label>
                    <input
                      type="text"
                      value={settings.officeName}
                      onChange={(e) => setSettings({ ...settings, officeName: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Nomor WhatsApp IT Support
                      </label>
                      <input
                        type="text"
                        value={settings.itSupportPhone}
                        onChange={(e) => setSettings({ ...settings, itSupportPhone: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Email IT Support
                      </label>
                      <input
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Backup & System Info */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Backup & Integritas Data
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Ekspor Seluruh Database & Log JSON
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Simpan salinan data perangkat, panduan, dan log aktivitas ke perangkat lokal.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 text-white dark:bg-slate-700 text-xs font-bold hover:bg-slate-700 transition-all shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download Backup JSON</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 active:scale-95 transition-all shadow-md shadow-blue-600/20"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Simpan Perubahan Pengaturan</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
