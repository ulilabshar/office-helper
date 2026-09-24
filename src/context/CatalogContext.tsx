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
  DEFAULT_GENERAL_FAQS,
  extractDeviceSteps,
} from '../lib/catalog';
import {
  supabase,
  isSupabaseReady,
  fetchCategories,
  fetchDevices,
  fetchAllSteps,
  fetchAllFaqs,
  createCategory as sbCreateCategory,
  updateCategory as sbUpdateCategory,
  deleteCategory as sbDeleteCategory,
  createDevice as sbCreateDevice,
  updateDevice as sbUpdateDevice,
  createStep,
  updateStep,
  deleteStep,
  createFaq,
  updateFaq,
  deleteFaq,
  syncDeviceSteps,
  syncDeviceFaqs,
  syncGeneralFaqs,
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
  getDeviceBySlug: (slugOrId: string) => Device | undefined;
  getDevicesByCategory: (slug: string) => Device[];
  searchDevices: (query: string) => Device[];
  saveCategory: (category: Category, isNew: boolean) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveDevice: (device: Device, isNew: boolean) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
  saveDeviceSteps: (deviceId: string, steps: SetupStep[]) => Promise<void>;
  saveSingleStep: (step: SetupStep, isNew: boolean) => Promise<void>;
  deleteSingleStep: (stepId: string, deviceId: string) => Promise<void>;
  saveDeviceSection: (deviceId: string, sectionKey: keyof NonNullable<Device['sections']>, section: DeviceSection) => Promise<void>;
  saveDeviceFaqs: (deviceId: string, faqs: FAQItem[]) => Promise<void>;
  saveGeneralFaqs: (faqs: FAQItem[]) => Promise<void>;
  saveSingleFaq: (faq: FAQItem, isNew: boolean) => Promise<void>;
  deleteSingleFaq: (faqId: string, deviceId?: string | null) => Promise<void>;
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
        const [sbCats, sbDevs, sbSteps, sbFaqs] = await Promise.all([
          fetchCategories(),
          fetchDevices(),
          fetchAllSteps(),
          fetchAllFaqs(),
        ]);

        if (sbCats.length > 0 && isMounted) {
          const mappedCategories: Category[] = sbCats.map((c) => ({
            id: c.id,
            slug: c.slug || slugify(c.title),
            title: c.title,
            description: c.description || '',
            icon: c.icon || 'Monitor',
            deviceCount: 0,
            available: c.is_active ?? true,
            sort_order: c.sort_order,
          }));

          const mappedDevices: Device[] = sbDevs.map((d) => {
            const catObj = sbCats.find((c) => c.id === d.category_id);
            const catTitle = catObj?.title || 'Umum';
            const catSlug = catObj?.slug || slugify(catTitle);
            const devSteps = sbSteps.filter((s) => s.device_id === d.id);
            const devFaqs = sbFaqs.filter((f) => f.device_id === d.id);

            const stepsList: SetupStep[] = devSteps.map((s) => ({
              id: s.id,
              device_id: s.device_id,
              title: s.title,
              description: s.description || '',
              konten_windows: s.konten_windows || '',
              konten_mac: s.konten_mac || '',
              details: s.konten_windows
                ? s.konten_windows.split('\n').map((l) => l.trim()).filter(Boolean)
                : [],
              sort_order: s.sort_order,
            }));

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

            const faqsList: FAQItem[] =
              devFaqs.length > 0
                ? devFaqs.map((f) => ({
                    id: f.id,
                    device_id: f.device_id,
                    question: f.question,
                    answer: f.answer,
                    sort_order: f.sort_order,
                  }))
                : parseFaqText(d.faq);

            const rawSpecs =
              d.specs && d.specs.length > 0
                ? d.specs
                : d.tambah_os && d.tambah_os.length > 0
                ? d.tambah_os
                : ['windows', 'mac'];

            return {
              id: d.id,
              name: d.nama_perangkat,
              slug: d.slug || slugify(d.nama_perangkat),
              category: catTitle,
              categorySlug: catSlug,
              description: d.deskripsi_singkat || '',
              image: d.image_url || undefined,
              status: (d.status as Device['status']) || 'Ready',
              supported_os: d.supported_os || ['windows', 'mac'],
              specs: rawSpecs,
              sort_order: d.sort_order,
              steps: stepsList,
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
              faqs: faqsList,
            };
          });

          const generalFaqsFromDb: FAQItem[] = sbFaqs
            .filter((f) => !f.device_id)
            .map((f) => ({
              id: f.id,
              question: f.question,
              answer: f.answer,
              sort_order: f.sort_order,
            }));

          const finalGeneralFaqs =
            generalFaqsFromDb.length > 0 ? generalFaqsFromDb : DEFAULT_GENERAL_FAQS;

          setState((prev) => ({
            ...prev,
            categories: withDeviceCounts(mappedCategories, mappedDevices),
            devices: mappedDevices,
            generalFaqs: finalGeneralFaqs,
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
      getDeviceById: (id) =>
        state.devices.find(
          (d) =>
            d.id === id ||
            (d.slug && d.slug === id) ||
            slugify(d.name) === id
        ),
      getDeviceBySlug: (slugOrId) =>
        state.devices.find(
          (d) =>
            (d.slug && d.slug === slugOrId) ||
            slugify(d.name) === slugOrId ||
            d.id === slugOrId
        ),
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
      saveCategory: async (category, isNew) => {
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

        // Simpan langsung ke Supabase
        if (isSupabaseReady && supabase) {
          if (isNew) {
            const created = await sbCreateCategory({
              title: category.title.trim(),
              slug: category.slug || slugify(category.title),
              description: category.description?.trim() || '',
              icon: category.icon || 'Printer',
              sort_order: category.sort_order ?? 0,
              is_active: category.available ?? true,
            } as any);
            setState((prev) => ({
              ...prev,
              categories: prev.categories.map((c) =>
                c.id === category.id ? { ...c, id: created.id } : c
              ),
            }));
          } else {
            await sbUpdateCategory(category.id, {
              title: category.title.trim(),
              slug: category.slug || slugify(category.title),
              description: category.description?.trim() || '',
              icon: category.icon || 'Printer',
              sort_order: category.sort_order ?? 0,
              is_active: category.available ?? true,
            } as any);
          }
        }
      },
      deleteCategory: async (id) => {
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
          await sbDeleteCategory(id);
        }
      },
      saveDevice: async (device, isNew) => {
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
          const catObj = state.categories.find(
            (c) => c.slug === device.categorySlug || c.title.toLowerCase() === device.category.toLowerCase()
          );
          if (!catObj) {
            console.error('Kategori tidak ditemukan untuk perangkat:', device.categorySlug);
            throw new Error(`Kategori "${device.categorySlug}" tidak ditemukan di database.`);
          }

          const payload: any = {
            category_id: catObj.id,
            nama_perangkat: device.name.trim(),
            slug: device.slug || slugify(device.name),
            deskripsi_singkat: device.description?.trim() || null,
            status: device.status || 'Ready',
            supported_os: device.supported_os && device.supported_os.length > 0 ? device.supported_os : ['windows', 'mac'],
            specs: device.specs || [],
            image_url: device.image?.trim() || null,
            sort_order: device.sort_order ?? 0,
          };

          if (isNew) {
            const created = await sbCreateDevice(payload);
            setState((prev) => ({
              ...prev,
              devices: prev.devices.map((d) =>
                d.id === device.id ? { ...d, id: created.id } : d
              ),
            }));

            // Sinkronkan steps awal jika ada
            if (device.steps && device.steps.length > 0) {
              await syncDeviceSteps(created.id, device.steps as any);
            }
            // Sinkronkan faqs awal jika ada
            if (device.faqs && device.faqs.length > 0) {
              await syncDeviceFaqs(created.id, device.faqs);
            }
          } else {
            await sbUpdateDevice(device.id, payload);
            if (device.steps && device.steps.length > 0) {
              await syncDeviceSteps(device.id, device.steps as any);
            }
            if (device.faqs && device.faqs.length > 0) {
              await syncDeviceFaqs(device.id, device.faqs);
            }
          }
        }
      },
      deleteDevice: async (id) => {
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
          await sbDeleteDevice(id);
        }
      },
      saveDeviceSteps: async (deviceId, steps) => {
        setState((prev) => ({
          ...prev,
          devices: prev.devices.map((d) =>
            d.id === deviceId ? { ...d, steps } : d
          ),
          activityLogs: pushLog(
            prev,
            'UPDATE',
            'Panduan Langkah',
            `Langkah panduan perangkat diperbarui.`
          ),
        }));

        if (isSupabaseReady && supabase) {
          const payload = steps.map((s, idx) => ({
            title: s.title,
            description: s.description || null,
            konten_windows: s.konten_windows || (s.details ? s.details.join('\n') : null),
            konten_mac: s.konten_mac || (s.details ? s.details.join('\n') : null),
            sort_order: s.sort_order ?? idx + 1,
          }));
          await syncDeviceSteps(deviceId, payload);
        }
      },
      saveSingleStep: async (step, isNew) => {
        if (!step.device_id) throw new Error('Target perangkat wajib dipilih!');

        if (isSupabaseReady && supabase) {
          if (isNew) {
            const created = await createStep({
              device_id: step.device_id,
              title: step.title.trim(),
              description: step.description?.trim() || null,
              konten_windows: step.konten_windows?.trim() || null,
              konten_mac: step.konten_mac?.trim() || null,
              sort_order: step.sort_order ?? 1,
            });

            const newStepObj: SetupStep = {
              id: created.id,
              device_id: created.device_id,
              title: created.title,
              description: created.description || '',
              konten_windows: created.konten_windows || '',
              konten_mac: created.konten_mac || '',
              sort_order: created.sort_order,
            };

            setState((prev) => ({
              ...prev,
              devices: prev.devices.map((d) =>
                d.id === step.device_id
                  ? {
                      ...d,
                      steps: [...(d.steps || []), newStepObj].sort(
                        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
                      ),
                    }
                  : d
              ),
              activityLogs: pushLog(
                prev,
                'CREATE',
                step.title,
                `Langkah panduan "${step.title}" ditambahkan.`
              ),
            }));
          } else {
            if (!step.id) throw new Error('ID Langkah tidak valid!');
            await updateStep(step.id, {
              title: step.title.trim(),
              description: step.description?.trim() || null,
              konten_windows: step.konten_windows?.trim() || null,
              konten_mac: step.konten_mac?.trim() || null,
              sort_order: step.sort_order ?? 1,
            });

            setState((prev) => ({
              ...prev,
              devices: prev.devices.map((d) =>
                d.id === step.device_id
                  ? {
                      ...d,
                      steps: (d.steps || [])
                        .map((s) => (s.id === step.id ? { ...s, ...step } : s))
                        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
                    }
                  : d
              ),
              activityLogs: pushLog(
                prev,
                'UPDATE',
                step.title,
                `Langkah panduan "${step.title}" diperbarui.`
              ),
            }));
          }
        } else {
          const fakeId = step.id || `step-${Date.now()}`;
          const stepWithId = { ...step, id: fakeId };
          setState((prev) => ({
            ...prev,
            devices: prev.devices.map((d) => {
              if (d.id !== step.device_id) return d;
              const exists = (d.steps || []).some((s) => s.id === step.id);
              const steps = exists
                ? (d.steps || []).map((s) => (s.id === step.id ? stepWithId : s))
                : [...(d.steps || []), stepWithId];
              return {
                ...d,
                steps: steps.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
              };
            }),
            activityLogs: pushLog(
              prev,
              isNew ? 'CREATE' : 'UPDATE',
              step.title,
              `Langkah panduan "${step.title}" disimpan.`
            ),
          }));
        }
      },
      deleteSingleStep: async (stepId, deviceId) => {
        if (isSupabaseReady && supabase) {
          await deleteStep(stepId);
        }

        setState((prev) => ({
          ...prev,
          devices: prev.devices.map((d) =>
            d.id === deviceId
              ? { ...d, steps: (d.steps || []).filter((s) => s.id !== stepId) }
              : d
          ),
          activityLogs: pushLog(
            prev,
            'DELETE',
            'Langkah Panduan',
            'Langkah panduan berhasil dihapus.'
          ),
        }));
      },
      saveDeviceSection: async (deviceId, sectionKey, section) => {
        setState((prev) => ({
          ...prev,
          devices: prev.devices.map((d) =>
            d.id === deviceId
              ? {
                  ...d,
                  sections: d.sections
                    ? { ...d.sections, [sectionKey]: section }
                    : { [sectionKey]: section } as any,
                }
              : d
          ),
          activityLogs: pushLog(
            prev,
            'UPDATE',
            section.title,
            `Panduan "${section.title}" diperbarui.`
          ),
        }));

        // Sinkronkan ke tabel steps di Supabase
        if (isSupabaseReady && supabase) {
          const winSteps = section.osSteps?.windows || section.steps || [];
          const macSteps = section.osSteps?.mac || [];
          const maxLen = Math.max(winSteps.length, macSteps.length);
          const stepsPayload: Array<{
            title: string;
            description?: string | null;
            konten_windows?: string | null;
            konten_mac?: string | null;
            sort_order: number;
          }> = [];

          for (let i = 0; i < maxLen; i++) {
            const w = winSteps[i];
            const m = macSteps[i];
            stepsPayload.push({
              title: w?.title || m?.title || `Langkah ${i + 1}`,
              description: w?.description || m?.description || null,
              konten_windows: w?.details ? w.details.join('\n') : (w?.description || null),
              konten_mac: m?.details ? m.details.join('\n') : (m?.description || null),
              sort_order: i + 1,
            });
          }

          await syncDeviceSteps(deviceId, stepsPayload);
        }
      },
      saveDeviceFaqs: async (deviceId, faqs) => {
        setState((prev) => {
          const device = prev.devices.find((d) => d.id === deviceId);
          return {
            ...prev,
            devices: prev.devices.map((d) => (d.id === deviceId ? { ...d, faqs } : d)),
            activityLogs: pushLog(prev, 'UPDATE', device?.name || 'FAQ', `FAQ perangkat diperbarui.`),
          };
        });

        if (isSupabaseReady && supabase) {
          await syncDeviceFaqs(deviceId, faqs);
        }
      },
      saveGeneralFaqs: async (faqs) => {
        setState((prev) => ({
          ...prev,
          generalFaqs: faqs,
          activityLogs: pushLog(prev, 'UPDATE', 'FAQ Umum', 'Bank FAQ umum diperbarui.'),
        }));

        if (isSupabaseReady && supabase) {
          await syncGeneralFaqs(faqs);
        }
      },
      saveSingleFaq: async (faq, isNew) => {
        if (!faq.question.trim() || !faq.answer.trim()) {
          throw new Error('Pertanyaan dan jawaban FAQ wajib diisi!');
        }

        if (isSupabaseReady && supabase) {
          if (isNew) {
            const created = await createFaq({
              device_id: faq.device_id || null,
              question: faq.question.trim(),
              answer: faq.answer.trim(),
              sort_order: faq.sort_order ?? 1,
            });

            const newFaqItem: FAQItem = {
              id: created.id,
              device_id: created.device_id,
              question: created.question,
              answer: created.answer,
              sort_order: created.sort_order,
            };

            setState((prev) => {
              if (!created.device_id) {
                return {
                  ...prev,
                  generalFaqs: [...prev.generalFaqs, newFaqItem].sort(
                    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
                  ),
                  activityLogs: pushLog(
                    prev,
                    'CREATE',
                    faq.question,
                    `FAQ Umum "${faq.question}" ditambahkan.`
                  ),
                };
              } else {
                return {
                  ...prev,
                  devices: prev.devices.map((d) =>
                    d.id === created.device_id
                      ? {
                          ...d,
                          faqs: [...(d.faqs || []), newFaqItem].sort(
                            (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
                          ),
                        }
                      : d
                  ),
                  activityLogs: pushLog(
                    prev,
                    'CREATE',
                    faq.question,
                    `FAQ Perangkat "${faq.question}" ditambahkan.`
                  ),
                };
              }
            });
          } else {
            if (!faq.id) throw new Error('ID FAQ tidak valid!');
            await updateFaq(faq.id, {
              device_id: faq.device_id || null,
              question: faq.question.trim(),
              answer: faq.answer.trim(),
              sort_order: faq.sort_order ?? 1,
            });

            setState((prev) => {
              if (!faq.device_id) {
                return {
                  ...prev,
                  generalFaqs: prev.generalFaqs
                    .map((f) => (f.id === faq.id ? { ...f, ...faq } : f))
                    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
                  activityLogs: pushLog(
                    prev,
                    'UPDATE',
                    faq.question,
                    `FAQ Umum "${faq.question}" diperbarui.`
                  ),
                };
              } else {
                return {
                  ...prev,
                  devices: prev.devices.map((d) =>
                    d.id === faq.device_id
                      ? {
                          ...d,
                          faqs: (d.faqs || [])
                            .map((f) => (f.id === faq.id ? { ...f, ...faq } : f))
                            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
                        }
                      : d
                  ),
                  activityLogs: pushLog(
                    prev,
                    'UPDATE',
                    faq.question,
                    `FAQ Perangkat "${faq.question}" diperbarui.`
                  ),
                };
              }
            });
          }
        } else {
          const fakeId = faq.id || `faq-${Date.now()}`;
          const faqWithId = { ...faq, id: fakeId };
          setState((prev) => {
            if (!faq.device_id) {
              const exists = prev.generalFaqs.some((f) => f.id === faq.id);
              const list = exists
                ? prev.generalFaqs.map((f) => (f.id === faq.id ? faqWithId : f))
                : [...prev.generalFaqs, faqWithId];
              return {
                ...prev,
                generalFaqs: list.sort(
                  (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
                ),
                activityLogs: pushLog(
                  prev,
                  isNew ? 'CREATE' : 'UPDATE',
                  faq.question,
                  `FAQ disimpan.`
                ),
              };
            } else {
              return {
                ...prev,
                devices: prev.devices.map((d) => {
                  if (d.id !== faq.device_id) return d;
                  const exists = (d.faqs || []).some((f) => f.id === faq.id);
                  const list = exists
                    ? (d.faqs || []).map((f) => (f.id === faq.id ? faqWithId : f))
                    : [...(d.faqs || []), faqWithId];
                  return {
                    ...d,
                    faqs: list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
                  };
                }),
                activityLogs: pushLog(
                  prev,
                  isNew ? 'CREATE' : 'UPDATE',
                  faq.question,
                  `FAQ disimpan.`
                ),
              };
            }
          });
        }
      },
      deleteSingleFaq: async (faqId, deviceId) => {
        if (isSupabaseReady && supabase) {
          await deleteFaq(faqId);
        }

        setState((prev) => {
          if (!deviceId) {
            return {
              ...prev,
              generalFaqs: prev.generalFaqs.filter((f) => f.id !== faqId),
              activityLogs: pushLog(prev, 'DELETE', 'FAQ', 'FAQ Umum dihapus.'),
            };
          } else {
            return {
              ...prev,
              devices: prev.devices.map((d) =>
                d.id === deviceId
                  ? { ...d, faqs: (d.faqs || []).filter((f) => f.id !== faqId) }
                  : d
              ),
              activityLogs: pushLog(prev, 'DELETE', 'FAQ', 'FAQ Perangkat dihapus.'),
            };
          }
        });
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
