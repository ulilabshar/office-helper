import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminTab, MediaAsset } from '../../types/admin';
import { Device, Category, FAQItem } from '../../types/device';
import { calculateDashboardStats } from '../../data/adminData';
import { useCatalog } from '../../context/CatalogContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import {
  CategoryFormModal,
  DeviceFormModal,
  FaqFormModal,
  GuideFormModal,
  MediaFormModal,
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
  Activity,
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
    'media',
    'logs',
    'settings',
  ];
  const currentTab: AdminTab = validTabs.includes(tab as AdminTab) ? (tab as AdminTab) : 'dashboard';
  const [activeTab, setActiveTab] = useState<AdminTab>(currentTab);

  useEffect(() => {
    setActiveTab(currentTab);
  }, [currentTab]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceFilterStatus, setDeviceFilterStatus] = useState('ALL');
  const [logFilterAction, setLogFilterAction] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [settingsDraft, setSettingsDraft] = useState(catalog.settings);

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
    sectionKey: keyof Device['sections'] | null;
  }>({ open: false, device: null, sectionKey: null });
  const [faqModal, setFaqModal] = useState<{
    open: boolean;
    title: string;
    items: FAQItem[];
    onSave: (items: FAQItem[]) => void;
  } | null>(null);
  const [mediaModal, setMediaModal] = useState<{ open: boolean; asset: MediaAsset | null }>({
    open: false,
    asset: null,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleTabChange = (newTab: AdminTab) => {
    setActiveTab(newTab);
    navigate(newTab === 'dashboard' ? '/dashboard' : `/dashboard/${newTab}`);
  };

  const stats = useMemo(
    () => calculateDashboardStats(catalog.devices, catalog.categories, catalog.generalFaqs.length),
    [catalog.devices, catalog.categories, catalog.generalFaqs.length]
  );

  const filteredDevices = catalog.devices.filter((device) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      device.name.toLowerCase().includes(q) ||
      device.category.toLowerCase().includes(q) ||
      device.description.toLowerCase().includes(q);
    const matchesStatus = deviceFilterStatus === 'ALL' || device.status === deviceFilterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredLogs = catalog.activityLogs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      log.target.toLowerCase().includes(q) ||
      log.description.toLowerCase().includes(q) ||
      log.user.toLowerCase().includes(q);
    const matchesAction = logFilterAction === 'ALL' || log.action === logFilterAction;
    return matchesSearch && matchesAction;
  });

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
                    className="text-left rounded-2xl border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 p-5 hover:border-blue-500/60"
                  >
                    <card.icon className="h-5 w-5 text-blue-600 mb-3" />
                    <div className="text-3xl font-black">{card.value}</div>
                    <p className="text-xs font-bold mt-1">{card.label}</p>
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border-2 border-slate-200 bg-white dark:border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <h3 className="font-bold text-sm">Aktivitas Terbaru</h3>
                  </div>
                  <button onClick={() => handleTabChange('logs')} className="text-xs font-semibold text-blue-600 inline-flex items-center gap-1">
                    Lihat semua <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                {catalog.activityLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex justify-between gap-2">
                      <span className="text-xs font-bold">{log.target}</span>
                      <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{log.description}</p>
                  </div>
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
                              onClick={() => {
                                if (confirm(`Hapus perangkat "${d.name}"?`)) {
                                  catalog.deleteDevice(d.id);
                                  showToast(`"${d.name}" dihapus.`);
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
                  <h2 className="text-xl font-bold">Kategori ({catalog.categories.length})</h2>
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
                {catalog.categories.map((cat) => (
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
                          onClick={() => {
                            if (confirm(`Hapus kategori "${cat.title}" beserta perangkatnya?`)) {
                              catalog.deleteCategory(cat.id);
                              showToast('Kategori dihapus.');
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
              <h2 className="text-xl font-bold">Panduan Setup ({stats.totalGuides} modul & langkah)</h2>
              <div className="space-y-4">
                {catalog.devices.map((device) => (
                  <div key={device.id} className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center gap-2">
                      <div>
                        <h3 className="font-bold">{device.name}</h3>
                        <span className="text-xs text-slate-500">{device.category}</span>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {device.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {(Object.entries(device.sections) as [keyof Device['sections'], NonNullable<Device['sections'][keyof Device['sections']]>][])
                        .filter(([, sec]) => sec)
                        .map(([key, sec]) => (
                          <div key={key} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-bold text-xs">{sec.title}</span>
                              <button
                                onClick={() => setGuideModal({ open: true, device, sectionKey: key })}
                                className="text-blue-600"
                                title="Ubah"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Win {sec.osSteps?.windows?.length || sec.steps?.length || 0} · Mac {sec.osSteps?.mac?.length || 0}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">FAQ ({stats.totalFaqs})</h2>
              <div className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between">
                  <h3 className="font-bold text-sm text-blue-600">FAQ Umum (beranda)</h3>
                  <button
                    className="text-xs font-bold text-blue-600"
                    onClick={() =>
                      setFaqModal({
                        open: true,
                        title: 'FAQ Umum',
                        items: catalog.generalFaqs,
                        onSave: (items) => {
                          catalog.saveGeneralFaqs(items);
                          showToast('FAQ umum disimpan.');
                        },
                      })
                    }
                  >
                    Kelola
                  </button>
                </div>
                {catalog.generalFaqs.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 text-xs">
                    <p className="font-bold">Q: {item.question}</p>
                    <p className="text-slate-500 mt-1">A: {item.answer}</p>
                  </div>
                ))}
              </div>
              {catalog.devices.map((d) => (
                <div key={d.id} className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-sm">FAQ: {d.name}</h3>
                    <button
                      className="text-xs font-bold text-blue-600"
                      onClick={() =>
                        setFaqModal({
                          open: true,
                          title: `FAQ ${d.name}`,
                          items: d.faqs,
                          onSave: (items) => {
                            catalog.saveDeviceFaqs(d.id, items);
                            showToast('FAQ perangkat disimpan.');
                          },
                        })
                      }
                    >
                      Kelola
                    </button>
                  </div>
                  {(d.faqs.length === 0 ? [{ question: '(belum ada)', answer: 'Tambah FAQ lewat tombol Kelola.' }] : d.faqs).map(
                    (faq, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 text-xs">
                        <p className="font-bold">Q: {faq.question}</p>
                        <p className="text-slate-500 mt-1">A: {faq.answer}</p>
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Media & Driver ({catalog.mediaAssets.length})</h2>
                <button
                  onClick={() => setMediaModal({ open: true, asset: null })}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Tambah media
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {catalog.mediaAssets.map((media) => (
                  <div key={media.id} className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                    <h3 className="font-bold text-sm">{media.name}</h3>
                    <p className="text-xs text-slate-500">
                      {media.type} · {media.targetDevice} · {media.targetOs}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <a href={media.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 inline-flex items-center gap-1">
                        <ExternalLink className="h-3.5 w-3.5" /> Buka
                      </a>
                      <div className="flex gap-1">
                        <button onClick={() => setMediaModal({ open: true, asset: media })} className="p-1.5 text-blue-600">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus "${media.name}"?`)) {
                              catalog.deleteMedia(media.id);
                              showToast('Media dihapus.');
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

          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <h2 className="text-xl font-bold">Activity Logs ({filteredLogs.length})</h2>
                <div className="flex flex-wrap gap-2">
                  {['ALL', 'CREATE', 'UPDATE', 'DELETE', 'AUTH'].map((act) => (
                    <button
                      key={act}
                      onClick={() => setLogFilterAction(act)}
                      className={`px-3 py-1 text-xs font-semibold rounded-xl border ${
                        logFilterAction === act ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-4">
                    <div className="flex justify-between gap-2">
                      <span className="text-xs font-bold">
                        {log.action} · {log.target}
                      </span>
                      <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{log.description}</p>
                  </div>
                ))}
              </div>
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
              <div className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
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
        onSave={(device, isNew) => {
          catalog.saveDevice(device, isNew);
          showToast(isNew ? 'Perangkat ditambahkan.' : 'Perangkat diperbarui.');
        }}
      />
      <CategoryFormModal
        isOpen={categoryModal.open}
        onClose={() => setCategoryModal({ open: false, category: null })}
        initial={categoryModal.category}
        onSave={(category, isNew) => {
          catalog.saveCategory(category, isNew);
          showToast(isNew ? 'Kategori ditambahkan.' : 'Kategori diperbarui.');
        }}
      />
      <GuideFormModal
        isOpen={guideModal.open}
        onClose={() => setGuideModal({ open: false, device: null, sectionKey: null })}
        device={guideModal.device}
        sectionKey={guideModal.sectionKey}
        onSave={(section) => {
          if (guideModal.device && guideModal.sectionKey) {
            catalog.saveDeviceSection(guideModal.device.id, guideModal.sectionKey, section);
            showToast('Panduan disimpan.');
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
      <MediaFormModal
        isOpen={mediaModal.open}
        onClose={() => setMediaModal({ open: false, asset: null })}
        initial={mediaModal.asset}
        onSave={(asset, isNew) => {
          catalog.saveMedia(asset, isNew);
          showToast(isNew ? 'Media ditambahkan.' : 'Media diperbarui.');
        }}
      />
    </div>
  );
};
