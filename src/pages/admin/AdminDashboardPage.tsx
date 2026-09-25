import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminTab } from '../../types/admin';
import { Device, Category, FAQItem, SetupStep } from '../../types/device';
import { calculateDashboardStats } from '../../data/adminData';
import { useCatalog } from '../../context/CatalogContext';
import { slugify, extractDeviceSteps } from '../../lib/catalog';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSearchModal } from '../../components/admin/AdminSearchModal';
import {
  CategoryFormModal,
  DeviceFormModal,
  FaqFormModal,
  GuideFormModal,
  SingleStepModal,
  SingleFaqModal,
} from '../../components/admin/AdminCrudForms';
import {
  HardDrive,
  FolderTree,
  BookOpenCheck,
  HelpCircle,
  PlusCircle,
  Download,
  Trash2,
  Edit3,
  Eye,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  ExternalLink,
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
  const catalog = useCatalog();

  const validTabs: AdminTab[] = [
    'dashboard',
    'devices',
    'categories',
    'guides',
    'faq',
    'settings',
  ];
  const currentTab: AdminTab = validTabs.includes(tab as AdminTab) ? (tab as AdminTab) : 'dashboard';
  const [activeTab, setActiveTab] = useState<AdminTab>(currentTab);

  useEffect(() => {
    setActiveTab(currentTab);
  }, [currentTab]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [deviceFilterStatus, setDeviceFilterStatus] = useState('ALL');
  const [guideFilterDevice, setGuideFilterDevice] = useState<string>('ALL');
  const [faqFilterTarget, setFaqFilterTarget] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [settingsDraft, setSettingsDraft] = useState(catalog.settings);

  // Global Ctrl+K shortcut untuk membuka AdminSearchModal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [deviceModal, setDeviceModal] = useState<{ open: boolean; device: Device | null }>({
    open: false,
    device: null,
  });
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; category: Category | null }>({
    open: false,
    category: null,
  });
  const [guideModal, setGuideModal] = useState<{
    open: boolean;
    device: Device | null;
  }>({ open: false, device: null });
  const [singleStepModal, setSingleStepModal] = useState<{
    open: boolean;
    step: SetupStep | null;
    preselectedDeviceId?: string;
  }>({ open: false, step: null });

  const [faqModal, setFaqModal] = useState<{
    open: boolean;
    title: string;
    items: FAQItem[];
    onSave: (items: FAQItem[]) => void;
  } | null>(null);
  const [singleFaqModal, setSingleFaqModal] = useState<{
    open: boolean;
    faq: FAQItem | null;
    preselectedDeviceId?: string | null;
  }>({ open: false, faq: null });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleTabChange = (newTab: AdminTab) => {
    setActiveTab(newTab);
    navigate(newTab === 'dashboard' ? '/dashboard' : `/dashboard/${newTab}`);
  };

  // ── Flattened Steps for granular CRUD ───────────────────────────────────────
  const allSteps = useMemo(() => {
    const list: Array<SetupStep & { deviceName: string; deviceCategory: string; deviceSlug: string; categorySlug: string }> = [];
    catalog.devices.forEach((d) => {
      const devSteps = d.steps && d.steps.length > 0 ? d.steps : extractDeviceSteps(d);
      devSteps.forEach((s) => {
        list.push({
          ...s,
          device_id: s.device_id || d.id,
          deviceName: d.name,
          deviceCategory: d.category,
          deviceSlug: d.slug || slugify(d.name),
          categorySlug: d.categorySlug,
        });
      });
    });
    return list;
  }, [catalog.devices]);

  const filteredSteps = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allSteps.filter((s) => {
      const matchesDevice = guideFilterDevice === 'ALL' || s.device_id === guideFilterDevice;
      const matchesSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        s.deviceName.toLowerCase().includes(q) ||
        (s.konten_windows && s.konten_windows.toLowerCase().includes(q)) ||
        (s.konten_mac && s.konten_mac.toLowerCase().includes(q));
      return matchesDevice && matchesSearch;
    });
  }, [allSteps, guideFilterDevice, searchQuery]);

  // ── Flattened FAQs for granular CRUD ────────────────────────────────────────
  const allFaqs = useMemo(() => {
    const list: Array<FAQItem & { targetName: string; isGeneral: boolean }> = [];
    catalog.generalFaqs.forEach((gf) => {
      list.push({
        ...gf,
        targetName: 'FAQ Umum (Beranda)',
        isGeneral: true,
      });
    });
    catalog.devices.forEach((d) => {
      (d.faqs || []).forEach((df) => {
        list.push({
          ...df,
          device_id: d.id,
          targetName: d.name,
          isGeneral: false,
        });
      });
    });
    return list;
  }, [catalog.generalFaqs, catalog.devices]);

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allFaqs.filter((f) => {
      let matchesTarget = true;
      if (faqFilterTarget === 'GENERAL') {
        matchesTarget = f.isGeneral;
      } else if (faqFilterTarget !== 'ALL') {
        matchesTarget = f.device_id === faqFilterTarget;
      }

      const matchesSearch =
        !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.targetName.toLowerCase().includes(q);

      return matchesTarget && matchesSearch;
    });
  }, [allFaqs, faqFilterTarget, searchQuery]);

  const stats = useMemo(
    () => ({
      ...calculateDashboardStats(catalog.devices, catalog.categories, catalog.generalFaqs.length),
      totalGuides: allSteps.length,
      totalFaqs: allFaqs.length,
    }),
    [catalog.devices, catalog.categories, catalog.generalFaqs.length, allSteps.length, allFaqs.length]
  );

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return catalog.categories;
    return catalog.categories.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [catalog.categories, searchQuery]);

  const filteredDevices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return catalog.devices.filter((device) => {
      const matchesSearch =
        !q ||
        device.name.toLowerCase().includes(q) ||
        device.category.toLowerCase().includes(q) ||
        device.description.toLowerCase().includes(q) ||
        (device.specs && device.specs.some((s) => s.toLowerCase().includes(q)));
      const matchesStatus = deviceFilterStatus === 'ALL' || device.status === deviceFilterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [catalog.devices, searchQuery, deviceFilterStatus]);

  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      settings: catalog.settings,
      stats,
      devices: catalog.devices,
      categories: catalog.categories,
      mediaAssets: catalog.mediaAssets,
      activityLogs: catalog.activityLogs,
      generalFaqs: catalog.generalFaqs,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `office-helper-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON diunduh.');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-8 text-center space-y-5 shadow-xl">
          <div className="h-16 w-16 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
            <Lock className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Akses Dashboard Terbatas</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Area CRUD Administrator IT. Masuk terlebih dahulu.
            </p>
          </div>
          <div className="space-y-2.5 pt-2">
            <Link
              to="/login"
              state={{ from: { pathname: '/dashboard' } }}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500"
            >
              <User className="h-4 w-4" />
              Login Administrator
            </Link>
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Kembali ke situs publik
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans antialiased flex">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl text-xs font-semibold">
          {toastMessage}
        </div>
      )}

      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        deviceCount={catalog.devices.length}
        categoryCount={catalog.categories.length}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <AdminHeader
          activeTab={activeTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenSearchModal={() => setIsSearchModalOpen(true)}
          onOpenAddDevice={() => {
            handleTabChange('devices');
            setDeviceModal({ open: true, device: null });
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="rounded-2xl border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-2xl space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 text-[11px] font-semibold">
                    <Sparkles className="h-3.5 w-3.5" />
                    Control Center Admin
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    Selamat Datang, {user?.name || 'Administrator IT'}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    CRUD perangkat, kategori, panduan, FAQ, dan media. Situs publik hanya menampilkan data ini.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => {
                      handleTabChange('devices');
                      setDeviceModal({ open: true, device: null });
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Tambah Perangkat
                  </button>
                  <button
                    onClick={handleExportBackup}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                  >
                    <Download className="h-4 w-4" />
                    Ekspor JSON
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { tab: 'devices' as AdminTab, icon: HardDrive, label: 'Total Perangkat', value: stats.totalDevices },
                  { tab: 'categories' as AdminTab, icon: FolderTree, label: 'Total Kategori', value: stats.totalCategories },
                  { tab: 'guides' as AdminTab, icon: BookOpenCheck, label: 'Langkah Panduan', value: stats.totalGuides },
                  { tab: 'faq' as AdminTab, icon: HelpCircle, label: 'Total FAQ', value: stats.totalFaqs },
                ].map((card) => (
                  <button
                    key={card.label}
                    onClick={() => handleTabChange(card.tab)}
                    className="text-left rounded-2xl border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 p-5 hover:border-blue-500/60 transition-all group"
                  >
                    <card.icon className="h-5 w-5 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                    <div className="text-3xl font-black">{card.value}</div>
                    <p className="text-xs font-bold mt-1 text-slate-700 dark:text-slate-300">{card.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">Manajemen Perangkat ({filteredDevices.length})</h2>
                  <p className="text-xs text-slate-500">Create, ubah, dan hapus perangkat. Hasilnya langsung tampil di situs publik.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['ALL', 'Ready', 'Maintenance', 'New'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setDeviceFilterStatus(st)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border ${
                        deviceFilterStatus === st ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {st === 'ALL' ? 'Semua' : st}
                    </button>
                  ))}
                  <button
                    onClick={() => setDeviceModal({ open: true, device: null })}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Tambah
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-3.5">Perangkat</th>
                      <th className="px-5 py-3.5">Kategori</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredDevices.map((d) => (
                      <tr key={d.id}>
                        <td className="px-5 py-4">
                          <div className="font-bold">{d.name}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">{d.description}</div>
                        </td>
                        <td className="px-5 py-4">{d.category}</td>
                        <td className="px-5 py-4">{d.status}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setDeviceModal({ open: true, device: d })}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                              title="Ubah"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Hapus perangkat "${d.name}"?`)) {
                                  try {
                                    await catalog.deleteDevice(d.id);
                                    showToast(`"${d.name}" berhasil dihapus.`);
                                  } catch (err: unknown) {
                                    const msg = err instanceof Error ? err.message : String(err);
                                    showToast(`Gagal menghapus: ${msg}`);
                                  }
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"
                              title="Hapus"
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
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Kategori ({filteredCategories.length})</h2>
                  <p className="text-xs text-slate-500">CRUD klasifikasi perangkat untuk navigasi publik.</p>
                </div>
                <button
                  onClick={() => setCategoryModal({ open: true, category: null })}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Tambah kategori
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCategories.map((cat) => (
                  <div key={cat.id} className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold">{cat.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{cat.description}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                        {cat.deviceCount} alat
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="font-mono text-[10px] text-slate-400">{cat.slug}</span>
                      <div className="flex gap-1">
                        <button onClick={() => setCategoryModal({ open: true, category: cat })} className="p-1.5 text-blue-600">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Hapus kategori "${cat.title}" beserta perangkatnya?`)) {
                              try {
                                await catalog.deleteCategory(cat.id);
                                showToast('Kategori berhasil dihapus.');
                              } catch (err: unknown) {
                                const msg = err instanceof Error ? err.message : String(err);
                                showToast(`Gagal menghapus: ${msg}`);
                              }
                            }
                          }}
                          className="p-1.5 text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'guides' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">Panduan Langkah Setup ({filteredSteps.length} Langkah)</h2>
                  <p className="text-xs text-slate-500">
                    Tambah, ubah, dan hapus langkah panduan per perangkat. Langsung tersimpan ke database Supabase.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={guideFilterDevice}
                    onChange={(e) => setGuideFilterDevice(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <option value="ALL">Semua Perangkat ({catalog.devices.length})</option>
                    {catalog.devices.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setSingleStepModal({
                        open: true,
                        step: null,
                        preselectedDeviceId: guideFilterDevice !== 'ALL' ? guideFilterDevice : catalog.devices[0]?.id,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 shadow-sm"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Tambah Langkah
                  </button>
                </div>
              </div>

              {filteredSteps.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
                  <BookOpenCheck className="h-10 w-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Tidak ada langkah panduan yang ditemukan.
                  </p>
                  <button
                    onClick={() => {
                      setSingleStepModal({
                        open: true,
                        step: null,
                        preselectedDeviceId: guideFilterDevice !== 'ALL' ? guideFilterDevice : catalog.devices[0]?.id,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Tambah Langkah Pertama
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-4 py-3.5 w-16 text-center">Urutan</th>
                          <th className="px-4 py-3.5">Perangkat</th>
                          <th className="px-4 py-3.5">Judul & Panduan</th>
                          <th className="px-4 py-3.5">Platform OS</th>
                          <th className="px-4 py-3.5 text-right w-24">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {filteredSteps.map((step, idx) => (
                          <tr key={step.id || `${step.device_id}-${idx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30">
                            <td className="px-4 py-4 text-center">
                              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-[11px] text-slate-700 dark:text-slate-300">
                                #{step.sort_order ?? idx + 1}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="font-bold text-slate-900 dark:text-white">{step.deviceName}</div>
                              <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                                {step.deviceCategory}
                              </span>
                            </td>
                            <td className="px-4 py-4 max-w-md">
                              <div className="font-bold text-slate-900 dark:text-slate-100">{step.title}</div>
                              {step.description && (
                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                  {step.description}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-1.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  step.konten_windows
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                                }`}>
                                  Windows {step.konten_windows ? '✓' : '-'}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  step.konten_mac
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                                }`}>
                                  macOS {step.konten_mac ? '✓' : '-'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSingleStepModal({ open: true, step, preselectedDeviceId: step.device_id })}
                                  className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-950/50 dark:text-blue-400"
                                  title="Ubah Langkah"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm(`Hapus langkah "${step.title}"?`)) {
                                      try {
                                        if (step.id && step.device_id) {
                                          await catalog.deleteSingleStep(step.id, step.device_id);
                                          showToast(`Langkah "${step.title}" berhasil dihapus.`);
                                        } else {
                                          showToast('Gagal: ID langkah tidak ditemukan.');
                                        }
                                      } catch (err: unknown) {
                                        const msg = err instanceof Error ? err.message : String(err);
                                        showToast(`Gagal menghapus langkah: ${msg}`);
                                      }
                                    }
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 dark:hover:bg-rose-950/50 dark:text-rose-400"
                                  title="Hapus Langkah"
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
              )}

              {/* Card Ringkasan & Batch Editor per Perangkat */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                    Alur Langkah per Perangkat (Batch Editor)
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catalog.devices.map((device) => {
                    const devSteps = device.steps && device.steps.length > 0 ? device.steps : extractDeviceSteps(device);
                    return (
                      <div
                        key={device.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs truncate">{device.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{devSteps.length} langkah terpasang</p>
                        </div>
                        <button
                          onClick={() => setGuideModal({ open: true, device })}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 inline-flex items-center gap-1"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Kelola Alur</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">Manajemen FAQ ({filteredFaqs.length} Pertanyaan)</h2>
                  <p className="text-xs text-slate-500">
                    Tambah, ubah, dan hapus pertanyaan & jawaban FAQ Umum dan FAQ spesifik perangkat.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={faqFilterTarget}
                    onChange={(e) => setFaqFilterTarget(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <option value="ALL">Semua Target FAQ ({allFaqs.length})</option>
                    <option value="GENERAL">FAQ Umum (Beranda) ({catalog.generalFaqs.length})</option>
                    {catalog.devices.map((d) => (
                      <option key={d.id} value={d.id}>
                        FAQ: {d.name} ({d.faqs?.length || 0})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setSingleFaqModal({
                        open: true,
                        faq: null,
                        preselectedDeviceId: faqFilterTarget !== 'ALL' && faqFilterTarget !== 'GENERAL' ? faqFilterTarget : null,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 shadow-sm"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Tambah FAQ
                  </button>
                </div>
              </div>

              {filteredFaqs.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
                  <HelpCircle className="h-10 w-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Tidak ada FAQ yang sesuai dengan pencarian atau filter.
                  </p>
                  <button
                    onClick={() => {
                      setSingleFaqModal({
                        open: true,
                        faq: null,
                        preselectedDeviceId: faqFilterTarget !== 'ALL' && faqFilterTarget !== 'GENERAL' ? faqFilterTarget : null,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Tambah FAQ Baru
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredFaqs.map((faq, idx) => (
                    <div
                      key={faq.id || `${faq.device_id}-${idx}`}
                      className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 bg-white dark:bg-slate-900/60 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                              faq.isGeneral
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {faq.targetName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Urutan #{faq.sort_order ?? idx + 1}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                          {faq.question}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400">
                          {faq.isGeneral ? 'Muncul di Beranda Publik' : 'Muncul di Halaman Perangkat'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setSingleFaqModal({
                                open: true,
                                faq,
                                preselectedDeviceId: faq.device_id || null,
                              })
                            }
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                            title="Ubah FAQ"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Hapus FAQ "${faq.question}"?`)) {
                                try {
                                  if (faq.id) {
                                    await catalog.deleteSingleFaq(faq.id, faq.device_id);
                                    showToast('FAQ berhasil dihapus.');
                                  } else {
                                    showToast('Gagal: ID FAQ tidak ditemukan.');
                                  }
                                } catch (err: unknown) {
                                  const msg = err instanceof Error ? err.message : String(err);
                                  showToast(`Gagal menghapus FAQ: ${msg}`);
                                }
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Hapus FAQ"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <form
              className="space-y-6 max-w-4xl"
              onSubmit={(e) => {
                e.preventDefault();
                catalog.saveSettings(settingsDraft);
                showToast('Pengaturan disimpan.');
              }}
            >
              <h2 className="text-xl font-bold">Pengaturan Sistem</h2>
              <div className="border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 rounded-2xl p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5">Nama portal</label>
                  <input
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                    value={settingsDraft.officeName}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, officeName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">WhatsApp IT</label>
                    <input
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                      value={settingsDraft.itSupportPhone}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, itSupportPhone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Email IT</label>
                    <input
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                      value={settingsDraft.supportEmail}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, supportEmail: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold">
                    Simpan pengaturan
                  </button>
                </div>
              </div>
            </form>
          )}
        </main>
      </div>

      <DeviceFormModal
        isOpen={deviceModal.open}
        onClose={() => setDeviceModal({ open: false, device: null })}
        categories={catalog.categories}
        initial={deviceModal.device}
        onSave={async (device, isNew) => {
          try {
            await catalog.saveDevice(device, isNew);
            showToast(isNew ? 'Perangkat berhasil ditambahkan ke database.' : 'Perangkat berhasil diperbarui.');
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            showToast(`Gagal menyimpan perangkat: ${msg}`);
          }
        }}
      />
      <CategoryFormModal
        isOpen={categoryModal.open}
        onClose={() => setCategoryModal({ open: false, category: null })}
        initial={categoryModal.category}
        onSave={async (category, isNew) => {
          try {
            await catalog.saveCategory(category, isNew);
            showToast(isNew ? 'Kategori berhasil ditambahkan ke database.' : 'Kategori berhasil diperbarui.');
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            showToast(`Gagal menyimpan kategori: ${msg}`);
          }
        }}
      />
      <GuideFormModal
        isOpen={guideModal.open}
        onClose={() => setGuideModal({ open: false, device: null })}
        device={guideModal.device}
        onSaveSteps={async (deviceId, steps) => {
          try {
            await catalog.saveDeviceSteps(deviceId, steps);
            showToast('Langkah panduan berhasil disimpan ke Supabase.');
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            showToast(`Gagal menyimpan langkah: ${msg}`);
          }
        }}
        onSave={async (section) => {
          if (guideModal.device) {
            try {
              await catalog.saveDeviceSection(guideModal.device.id, 'wifi', section);
              showToast('Panduan berhasil disimpan ke Supabase.');
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err);
              showToast(`Gagal menyimpan panduan: ${msg}`);
            }
          }
        }}
      />
      {faqModal && (
        <FaqFormModal
          isOpen={faqModal.open}
          onClose={() => setFaqModal(null)}
          title={faqModal.title}
          items={faqModal.items}
          onSave={faqModal.onSave}
        />
      )}
      <SingleStepModal
        isOpen={singleStepModal.open}
        onClose={() => setSingleStepModal({ open: false, step: null })}
        devices={catalog.devices}
        initial={singleStepModal.step}
        preselectedDeviceId={singleStepModal.preselectedDeviceId}
        onSave={async (step, isNew) => {
          try {
            await catalog.saveSingleStep(step, isNew);
            showToast(isNew ? 'Langkah panduan berhasil ditambahkan ke database.' : 'Langkah panduan berhasil diperbarui.');
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            showToast(`Gagal menyimpan langkah: ${msg}`);
          }
        }}
      />
      <SingleFaqModal
        isOpen={singleFaqModal.open}
        onClose={() => setSingleFaqModal({ open: false, faq: null })}
        devices={catalog.devices}
        initial={singleFaqModal.faq}
        preselectedDeviceId={singleFaqModal.preselectedDeviceId}
        onSave={async (faq, isNew) => {
          try {
            await catalog.saveSingleFaq(faq, isNew);
            showToast(isNew ? 'FAQ berhasil ditambahkan ke database.' : 'FAQ berhasil diperbarui.');
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            showToast(`Gagal menyimpan FAQ: ${msg}`);
          }
        }}
      />

      {/* Global Admin Search Modal (Ctrl+K) */}
      <AdminSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        devices={catalog.devices}
        categories={catalog.categories}
        steps={allSteps}
        faqs={allFaqs}
        onEditDevice={(device) => {
          handleTabChange('devices');
          setDeviceModal({ open: true, device });
        }}
        onEditStep={(step) => {
          handleTabChange('guides');
          setSingleStepModal({ open: true, step, preselectedDeviceId: step.device_id });
        }}
        onEditFaq={(faq, deviceId) => {
          handleTabChange('faq');
          setSingleFaqModal({ open: true, faq, preselectedDeviceId: deviceId || null });
        }}
        onEditCategory={(category) => {
          handleTabChange('categories');
          setCategoryModal({ open: true, category });
        }}
        onNavigateTab={(targetTab) => {
          handleTabChange(targetTab);
        }}
        onOpenCreate={(type) => {
          if (type === 'device') {
            handleTabChange('devices');
            setDeviceModal({ open: true, device: null });
          } else if (type === 'step') {
            handleTabChange('guides');
            setSingleStepModal({ open: true, step: null, preselectedDeviceId: catalog.devices[0]?.id });
          } else if (type === 'faq') {
            handleTabChange('faq');
            setSingleFaqModal({ open: true, faq: null, preselectedDeviceId: null });
          } else if (type === 'category') {
            handleTabChange('categories');
            setCategoryModal({ open: true, category: null });
          }
        }}
      />
    </div>
  );
};
