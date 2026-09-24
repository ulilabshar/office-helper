import { Category, Device, DeviceSection, FAQItem, SetupStep } from '../types/device';
import { ActivityLog, MediaAsset, SystemSetting } from '../types/admin';
import { categoriesData } from '../data/categories';
import { devicesData } from '../data/devices';
import { defaultSystemSettings, initialActivityLogs, initialMediaAssets } from '../data/adminData';

export const CATALOG_STORAGE_KEY = 'office_docs_catalog_v1';

export interface CatalogState {
  categories: Category[];
  devices: Device[];
  generalFaqs: FAQItem[];
  mediaAssets: MediaAsset[];
  activityLogs: ActivityLog[];
  settings: SystemSetting;
}

export const DEFAULT_GENERAL_FAQS: FAQItem[] = [
  {
    question: 'Bagaimana jika perangkat printer tidak terdeteksi saat koneksi Wi-Fi?',
    answer:
      'Pastikan komputer atau laptop kamu terhubung ke SSID Wi-Fi kantor yang sama (frekuensi 2.4 GHz). Coba matikan dan nyalakan kembali (power cycle) printer dan router Wi-Fi.',
  },
  {
    question: 'Di mana saya bisa mengunduh installer driver printer yang resmi?',
    answer:
      'Setiap halaman panduan spesifik printer pada website ini telah menyediakan link installer resmi dan langkah setup driver yang sesuai untuk Windows & macOS.',
  },
  {
    question: 'Bagaimana cara membagikan link dokumen agar tidak bisa diubah orang lain?',
    answer:
      'Pilih level izin "Viewer" pada menu Share link agar pengakses hanya dapat membaca isi dokumen tanpa bisa mengedit atau mengubah data.',
  },
];

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function createEmptySection(
  id: 'wifi' | 'bluetooth' | 'finish' | 'troubleshooting',
  title: string,
  tabLabel: string,
  iconName: string,
  badge: string
): DeviceSection {
  return {
    id,
    title,
    tabLabel,
    iconName,
    badge,
    commonSteps: [],
    osSteps: { windows: [], mac: [] },
  };
}

export function createEmptyDevice(input: {
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  status: Device['status'];
  specs: string[];
  slug?: string;
}): Device {
  const base = input.slug || slugify(input.name) || 'perangkat';
  return {
    id: `${base}-${Date.now().toString(36)}`,
    name: input.name,
    slug: base,
    category: input.category,
    categorySlug: input.categorySlug,
    description: input.description,
    status: input.status,
    supported_os: ['windows', 'mac'],
    specs: input.specs,
    steps: [
      {
        title: 'Langkah 1: Menghubungkan Perangkat ke Jaringan',
        description: 'Pastikan perangkat menyala dan terhubung ke jaringan kantor.',
        konten_windows: '1. Nyalakan perangkat.\n2. Hubungkan ke Wi-Fi kantor "Kantor-Utama".',
        konten_mac: '1. Nyalakan perangkat.\n2. Hubungkan Mac ke Wi-Fi kantor "Kantor-Utama".',
      },
    ],
    sections: {
      wifi: createEmptySection('wifi', 'Langkah Koneksi Wi-Fi', '1. Koneksi Wi-Fi', 'Wifi', 'Jaringan'),
      bluetooth: createEmptySection(
        'bluetooth',
        'Langkah Koneksi Bluetooth',
        '2. Bluetooth',
        'Bluetooth',
        'Pairing'
      ),
      finish: createEmptySection('finish', 'Setup Selesai', '3. Selesai', 'CheckCircle2', 'Verifikasi'),
    },
    faqs: [],
  };
}

export function extractDeviceSteps(device: Device): SetupStep[] {
  if (device.steps && device.steps.length > 0) {
    return device.steps;
  }

  if (!device.sections) return [];

  const result: SetupStep[] = [];
  const sectionKeys: (keyof NonNullable<Device['sections']>)[] = [
    'wifi',
    'bluetooth',
    'finish',
    'troubleshooting',
  ];

  for (const key of sectionKeys) {
    const sec = device.sections[key];
    if (!sec) continue;

    if (sec.osSteps) {
      const win = sec.osSteps.windows || [];
      const mac = sec.osSteps.mac || [];
      const maxLen = Math.max(win.length, mac.length);

      for (let i = 0; i < maxLen; i++) {
        const w = win[i];
        const m = mac[i];
        result.push({
          title: w?.title || m?.title || `${sec.title} - Bagian ${i + 1}`,
          description: w?.description || m?.description || '',
          konten_windows: w?.details ? w.details.join('\n') : (w?.description || ''),
          konten_mac: m?.details ? m.details.join('\n') : (m?.description || ''),
          details: w?.details || m?.details,
          codeSnippet: w?.codeSnippet || m?.codeSnippet,
          tip: w?.tip || m?.tip,
          warning: w?.warning || m?.warning,
        });
      }
    } else if (sec.steps && sec.steps.length > 0) {
      result.push(...sec.steps);
    } else if (sec.commonSteps && sec.commonSteps.length > 0) {
      result.push(...sec.commonSteps);
    }
  }

  return result;
}

export function emptyStep(title = 'Langkah baru'): SetupStep {
  return { title, description: '', details: [] };
}

export function seedCatalog(): CatalogState {
  return {
    categories: categoriesData.map((c) => ({
      ...c,
      deviceCount: devicesData.filter((d) => d.categorySlug === c.slug).length,
    })),
    devices: devicesData,
    generalFaqs: DEFAULT_GENERAL_FAQS,
    mediaAssets: initialMediaAssets,
    activityLogs: initialActivityLogs,
    settings: defaultSystemSettings,
  };
}

export function withDeviceCounts(categories: Category[], devices: Device[]): Category[] {
  return categories.map((c) => ({
    ...c,
    deviceCount: devices.filter((d) => d.categorySlug === c.slug).length,
  }));
}

export function loadCatalog(): CatalogState {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return seedCatalog();
    const parsed = JSON.parse(raw) as Partial<CatalogState>;
    const seed = seedCatalog();
    return {
      categories: parsed.categories?.length ? parsed.categories : seed.categories,
      devices: parsed.devices?.length ? parsed.devices : seed.devices,
      generalFaqs: parsed.generalFaqs ?? seed.generalFaqs,
      mediaAssets: parsed.mediaAssets ?? seed.mediaAssets,
      activityLogs: parsed.activityLogs ?? seed.activityLogs,
      settings: parsed.settings ?? seed.settings,
    };
  } catch {
    return seedCatalog();
  }
}

export function saveCatalog(state: CatalogState) {
  localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(state));
}

export function searchInDevices(devices: Device[], query: string): Device[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return devices.filter(
    (device) =>
      device.name.toLowerCase().includes(q) ||
      device.description.toLowerCase().includes(q) ||
      device.specs.some((s) => s.toLowerCase().includes(q))
  );
}
