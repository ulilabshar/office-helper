import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Category, Device, DeviceSection, FAQItem, SetupStep } from '../types/device';
import { ActivityLog, MediaAsset, SystemSetting } from '../types/admin';
import {
  CatalogState,
  createEmptyDevice,
  loadCatalog,
  saveCatalog,
  slugify,
  withDeviceCounts,
} from '../lib/catalog';
import {
  supabase,
  isSupabaseReady,
  fetchCategories,
  fetchDevices,
  fetchStepsByDeviceId,
  createCategory as sbCreateCategory,
  updateCategory as sbUpdateCategory,
  deleteCategory as sbDeleteCategory,
  createDevice as sbCreateDevice,
  updateDevice as sbUpdateDevice,
  deleteDevice as sbDeleteDevice,
} from '../lib/supabase';
import { useAuth } from './AuthContext';

function parseFaqText(raw?: string | null): FAQItem[] {
  if (!raw) return [];
  const items: FAQItem[] = [];
  const blocks = raw.split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const qLine = lines.find((l) => l.startsWith('Q:') || l.startsWith('Tanya:'));
    const aLine = lines.find((l) => l.startsWith('A:') || l.startsWith('Jawab:'));
    if (qLine && aLine) {
      items.push({
        question: qLine.replace(/^(Q:|Tanya:)\s*/i, ''),
        answer: aLine.replace(/^(A:|Jawab:)\s*/i, ''),
      });
    } else if (lines.length >= 2) {
      items.push({
        question: lines[0].replace(/^Q:\s*/i, ''),
        answer: lines.slice(1).join(' ').replace(/^A:\s*/i, ''),
      });
    }
  }
  return items;
}

interface CatalogContextType {
  categories: Category[];
  devices: Device[];
  generalFaqs: FAQItem[];
  mediaAssets: MediaAsset[];
  activityLogs: ActivityLog[];
  settings: SystemSetting;
  isLoadingSupabase: boolean;
  getDeviceById: (id: string) => Device | undefined;
  getDevicesByCategory: (slug: string) => Device[];
  searchDevices: (query: string) => Device[];
  saveCategory: (category: Category, isNew: boolean) => void;
  deleteCategory: (id: string) => void;
  saveDevice: (device: Device, isNew: boolean) => void;
  deleteDevice: (id: string) => void;
  saveDeviceSection: (deviceId: string, sectionKey: keyof Device['sections'], section: DeviceSection) => void;
  saveDeviceFaqs: (deviceId: string, faqs: FAQItem[]) => void;
  saveGeneralFaqs: (faqs: FAQItem[]) => void;
  saveMedia: (asset: MediaAsset, isNew: boolean) => void;
  deleteMedia: (id: string) => void;
  saveSettings: (settings: SystemSetting) => void;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<CatalogState>(() => loadCatalog());
  const [isLoadingSupabase, setIsLoadingSupabase] = useState(false);

  // ── Sync awal dari Supabase jika koneksi aktif ──────────────────────────────
  useEffect(() => {
    if (!isSupabaseReady || !supabase) return;

    let isMounted = true;
    const loadFromSupabase = async () => {
      try {
        setIsLoadingSupabase(true);
        const [sbCats, sbDevs] = await Promise.all([
          fetchCategories(),
          fetchDevices(),
        ]);

        if (sbCats.length > 0 && isMounted) {
          // Ambil steps untuk masing-masing device
          const allSteps = await Promise.all(
            sbDevs.map((d) => fetchStepsByDeviceId(d.id).catch(() => []))
          );

          const mappedCategories: Category[] = sbCats.map((c) => ({
            id: c.id,
            slug: slugify(c.title),
            title: c.title,
            description: c.description || '',
            icon: c.icon || 'Monitor',
            deviceCount: 0,
            available: true,
          }));

          const mappedDevices: Device[] = sbDevs.map((d, index) => {
            const catObj = sbCats.find((c) => c.id === d.category_id);
            const catTitle = catObj?.title || 'Umum';
            const catSlug = slugify(catTitle);
            const devSteps = allSteps[index] || [];

            const winSteps: SetupStep[] = devSteps.map((s) => ({
              title: s.title,
              description: s.description || '',
              details: s.konten_windows
                ? s.konten_windows.split('\n').map((l) => l.trim()).filter(Boolean)
                : [],
            }));

            const macSteps: SetupStep[] = devSteps.map((s) => ({
              title: s.title,
              description: s.description || '',
              details: s.konten_mac
                ? s.konten_mac.split('\n').map((l) => l.trim()).filter(Boolean)
                : [],
            }));

            return {
              id: d.id,
              name: d.nama_perangkat,
              category: catTitle,
              categorySlug: catSlug,
              description: d.deskripsi_singkat || '',
              image: d.image_url || undefined,
              status: (d.status as Device['status']) || 'Ready',
              specs: d.tambah_os && d.tambah_os.length > 0 ? d.tambah_os : ['windows', 'mac'],
              sections: {
                wifi: {
                  id: 'wifi',
                  title: 'Langkah Panduan Setup',
                  tabLabel: '1. Setup Utama',
                  iconName: 'Wifi',
                  badge: 'Panduan',
                  commonSteps: [],
                  osSteps: { windows: winSteps, mac: macSteps },
                },
                bluetooth: {
                  id: 'bluetooth',
                  title: 'Koneksi Nirkabel / Tambahan',
                  tabLabel: '2. Nirkabel / Opsi',
                  iconName: 'Bluetooth',
                  badge: 'Koneksi',
                  commonSteps: [],
                  osSteps: { windows: [], mac: [] },
                },
                finish: {
                  id: 'finish',
                  title: 'Setup Selesai & Pengujian',
                  tabLabel: '3. Selesai',
                  iconName: 'CheckCircle2',
                  badge: 'Verifikasi',
                  commonSteps: [],
                  osSteps: { windows: [], mac: [] },
                },
              },
              faqs: parseFaqText(d.faq),
            };
          });

          setState((prev) => ({
            ...prev,
            categories: withDeviceCounts(mappedCategories, mappedDevices),
            devices: mappedDevices,
          }));
        }
      } catch (err) {
        console.warn('Gagal memuat data dari Supabase, menggunakan data lokal:', err);
      } finally {
        if (isMounted) setIsLoadingSupabase(false);
      }
    };

    loadFromSupabase();

    return () => {
      isMounted = false;
    };
  }, []);

  // ── Simpan ke localStorage sebagai cache ─────────────────────────────────────
  useEffect(() => {
    saveCatalog({
      ...state,
      categories: withDeviceCounts(state.categories, state.devices),
    });
  }, [state]);

  const pushLog = (
    prev: CatalogState,
    action: ActivityLog['action'],
    target: string,
    description: string
  ): ActivityLog[] => {
    const log: ActivityLog = {
      id: `log-${Date.now()}`,
      user: user?.name || 'Administrator IT',
      action,
      target,
      description,
      timestamp: 'Baru saja',
    };
    return [log, ...prev.activityLogs].slice(0, 80);
  };

  const value = useMemo<CatalogContextType>(() => {
    const categories = withDeviceCounts(state.categories, state.devices);

    return {
      categories,
      devices: state.devices,
      generalFaqs: state.generalFaqs,
      mediaAssets: state.mediaAssets,
      activityLogs: state.activityLogs,
      settings: state.settings,
      isLoadingSupabase,
      getDeviceById: (id) => state.devices.find((d) => d.id === id),
      getDevicesByCategory: (slug) => state.devices.filter((d) => d.categorySlug === slug),
      searchDevices: (query) => {
        const q = query.toLowerCase().trim();
        if (!q) return [];
        return state.devices.filter(
          (device) =>
            device.name.toLowerCase().includes(q) ||
            device.description.toLowerCase().includes(q) ||
            device.specs.some((s) => s.toLowerCase().includes(q))
        );
      },
      saveCategory: (category, isNew) => {
        setState((prev) => {
          const exists = prev.categories.some((c) => c.id === category.id);
          const updatedCategories = exists
            ? prev.categories.map((c) => (c.id === category.id ? category : c))
            : [...prev.categories, category];
          return {
            ...prev,
            categories: updatedCategories,
            activityLogs: pushLog(
              prev,
              isNew ? 'CREATE' : 'UPDATE',
              category.title,
              isNew ? `Kategori "${category.title}" ditambahkan.` : `Kategori "${category.title}" diperbarui.`
            ),
          };
        });

        // Simpan juga ke Supabase jika aktif
        if (isSupabaseReady && supabase) {
          if (isNew) {
            sbCreateCategory({
              title: category.title,
              description: category.description,
              icon: category.icon,
              sort_order: 0,
            }).catch((e) => console.warn('Supabase saveCategory error:', e));
          } else {
            sbUpdateCategory(category.id, {
              title: category.title,
              description: category.description,
              icon: category.icon,
            }).catch((e) => console.warn('Supabase updateCategory error:', e));
          }
        }
      },
      deleteCategory: (id) => {
        setState((prev) => {
          const cat = prev.categories.find((c) => c.id === id);
          return {
            ...prev,
            categories: prev.categories.filter((c) => c.id !== id),
            devices: prev.devices.filter((d) => d.categorySlug !== cat?.slug),
            activityLogs: pushLog(prev, 'DELETE', cat?.title || 'Kategori', `Kategori "${cat?.title}" dihapus.`),
          };
        });

        if (isSupabaseReady && supabase) {
          sbDeleteCategory(id).catch((e) => console.warn('Supabase deleteCategory error:', e));
        }
      },
      saveDevice: (device, isNew) => {
        setState((prev) => {
          const exists = prev.devices.some((d) => d.id === device.id);
          const devices = exists
            ? prev.devices.map((d) => (d.id === device.id ? device : d))
            : [...prev.devices, device];
          return {
            ...prev,
            devices,
            activityLogs: pushLog(
              prev,
              isNew || !exists ? 'CREATE' : 'UPDATE',
              device.name,
              isNew || !exists
                ? `Perangkat "${device.name}" ditambahkan.`
                : `Perangkat "${device.name}" diperbarui.`
            ),
          };
        });

        if (isSupabaseReady && supabase) {
          const catObj = state.categories.find((c) => c.slug === device.categorySlug);
          if (catObj) {
            if (isNew) {
              sbCreateDevice({
                category_id: catObj.id,
                nama_perangkat: device.name,
                deskripsi_singkat: device.description,
                status: device.status,
                tambah_os: device.specs,
                image_url: device.image,
                faq: device.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n'),
                sort_order: 0,
              }).catch((e) => console.warn('Supabase createDevice error:', e));
            } else {
              sbUpdateDevice(device.id, {
                nama_perangkat: device.name,
                deskripsi_singkat: device.description,
                status: device.status,
                tambah_os: device.specs,
                image_url: device.image,
                faq: device.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n'),
              }).catch((e) => console.warn('Supabase updateDevice error:', e));
            }
          }
        }
      },
      deleteDevice: (id) => {
        setState((prev) => {
          const device = prev.devices.find((d) => d.id === id);
          return {
            ...prev,
            devices: prev.devices.filter((d) => d.id !== id),
            activityLogs: pushLog(
              prev,
              'DELETE',
              device?.name || 'Perangkat',
              `Perangkat "${device?.name}" dihapus.`
            ),
          };
        });

        if (isSupabaseReady && supabase) {
          sbDeleteDevice(id).catch((e) => console.warn('Supabase deleteDevice error:', e));
        }
      },
      saveDeviceSection: (deviceId, sectionKey, section) => {
        setState((prev) => ({
          ...prev,
          devices: prev.devices.map((d) =>
            d.id === deviceId
              ? { ...d, sections: { ...d.sections, [sectionKey]: section } }
              : d
          ),
          activityLogs: pushLog(
            prev,
            'UPDATE',
            section.title,
            `Panduan "${section.title}" diperbarui.`
          ),
        }));
      },
      saveDeviceFaqs: (deviceId, faqs) => {
        setState((prev) => {
          const device = prev.devices.find((d) => d.id === deviceId);
          return {
            ...prev,
            devices: prev.devices.map((d) => (d.id === deviceId ? { ...d, faqs } : d)),
            activityLogs: pushLog(prev, 'UPDATE', device?.name || 'FAQ', `FAQ perangkat diperbarui.`),
          };
        });
      },
      saveGeneralFaqs: (faqs) => {
        setState((prev) => ({
          ...prev,
          generalFaqs: faqs,
          activityLogs: pushLog(prev, 'UPDATE', 'FAQ Umum', 'Bank FAQ umum diperbarui.'),
        }));
      },
      saveMedia: (asset, isNew) => {
        setState((prev) => {
          const exists = prev.mediaAssets.some((m) => m.id === asset.id);
          const mediaAssets = exists
            ? prev.mediaAssets.map((m) => (m.id === asset.id ? asset : m))
            : [...prev.mediaAssets, asset];
          return {
            ...prev,
            mediaAssets,
            activityLogs: pushLog(
              prev,
              isNew || !exists ? 'CREATE' : 'UPDATE',
              asset.name,
              isNew || !exists ? `Media "${asset.name}" ditambahkan.` : `Media "${asset.name}" diperbarui.`
            ),
          };
        });
      },
      deleteMedia: (id) => {
        setState((prev) => {
          const asset = prev.mediaAssets.find((m) => m.id === id);
          return {
            ...prev,
            mediaAssets: prev.mediaAssets.filter((m) => m.id !== id),
            activityLogs: pushLog(prev, 'DELETE', asset?.name || 'Media', `Media "${asset?.name}" dihapus.`),
          };
        });
      },
      saveSettings: (settings) => {
        setState((prev) => ({
          ...prev,
          settings,
          activityLogs: pushLog(prev, 'UPDATE', 'Pengaturan Sistem', 'Pengaturan sistem disimpan.'),
        }));
      },
    };
  }, [state, user?.name, isLoadingSupabase]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalog = () => {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within a CatalogProvider');
  return ctx;
};

export { createEmptyDevice };
