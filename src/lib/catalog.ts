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
}): Device {
  const base = slugify(input.name) || 'perangkat';
  return {
    id: `${base}-${Date.now().toString(36)}`,
    name: input.name,
    category: input.category,
    categorySlug: input.categorySlug,
    description: input.description,
    status: input.status,
    specs: input.specs,
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
