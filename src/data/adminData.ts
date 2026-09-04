import { ActivityLog, MediaAsset, SystemSetting, DashboardStats } from '../types/admin';
import { Device, Category } from '../types/device';
import { devicesData } from './devices';
import { categoriesData } from './categories';

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 'log-1',
    user: 'Administrator IT',
    action: 'AUTH',
    target: 'Sesi Admin',
    description: 'Admin IT berhasil login ke sistem via otentikasi User & Password.',
    timestamp: 'Baru saja',
    ipAddress: '192.168.1.102',
  },
  {
    id: 'log-2',
    user: 'Administrator IT',
    action: 'UPDATE',
    target: 'Epson EcoTank L3250',
    description: 'Memperbarui panduan setup Wi-Fi Direct untuk macOS Sequoia.',
    timestamp: '2 jam yang lalu',
    ipAddress: '192.168.1.102',
  },
  {
    id: 'log-3',
    user: 'IT Support Officer',
    action: 'CREATE',
    target: 'Video Conference Lumens',
    description: 'Menambahkan panduan konektivitas PTZ camera & speakerphone ruang meeting utama.',
    timestamp: '1 hari yang lalu',
    ipAddress: '192.168.1.115',
  },
  {
    id: 'log-4',
    user: 'System',
    action: 'SYSTEM',
    target: 'Vercel Production Deploy',
    description: 'Build otomatis dan sinkronisasi rute SPA berhasil dideploy ke cloud.',
    timestamp: '2 hari yang lalu',
    ipAddress: 'Vercel CI/CD',
  },
  {
    id: 'log-5',
    user: 'Administrator IT',
    action: 'UPDATE',
    target: 'Interactive Display 75"',
    description: 'Menambahkan instruksi pairing wireless display dan AirPlay.',
    timestamp: '3 hari yang lalu',
    ipAddress: '192.168.1.102',
  },
  {
    id: 'log-6',
    user: 'IT Support Officer',
    action: 'UPDATE',
    target: 'Pembagian Link Dokumen',
    description: 'Memperbarui panduan hak akses viewer & commenter untuk Google Drive.',
    timestamp: '4 hari yang lalu',
    ipAddress: '192.168.1.115',
  },
];

export const initialMediaAssets: MediaAsset[] = [
  {
    id: 'media-1',
    name: 'Epson L3250 Web Installer Driver',
    type: 'driver',
    fileSize: '14.2 MB',
    targetDevice: 'Epson EcoTank L3250',
    targetOs: 'windows',
    url: 'https://download.epson.biz/l3250_win.exe',
    updatedAt: '2026-08-20',
  },
  {
    id: 'media-2',
    name: 'Epson L3250 macOS Package Driver',
    type: 'driver',
    fileSize: '18.6 MB',
    targetDevice: 'Epson EcoTank L3250',
    targetOs: 'mac',
    url: 'https://download.epson.biz/l3250_mac.dmg',
    updatedAt: '2026-08-20',
  },
  {
    id: 'media-3',
    name: 'Lumens PTZ Camera Controller Suite',
    type: 'driver',
    fileSize: '45.0 MB',
    targetDevice: 'Video Conference Lumens',
    targetOs: 'windows',
    url: 'https://lumens.cloud/software/vc-ctrl.exe',
    updatedAt: '2026-08-15',
  },
  {
    id: 'media-4',
    name: 'Interactive Display User Manual PDF',
    type: 'document',
    fileSize: '3.8 MB',
    targetDevice: 'Interactive Display 75"',
    targetOs: 'all',
    url: '/docs/manual-interactive-display.pdf',
    updatedAt: '2026-08-10',
  },
  {
    id: 'media-5',
    name: 'Standard Operating Procedure IT Kantor',
    type: 'document',
    fileSize: '1.2 MB',
    targetDevice: 'All Devices',
    targetOs: 'all',
    url: '/docs/sop-perangkat-kantor.pdf',
    updatedAt: '2026-08-01',
  },
];

export const defaultSystemSettings: SystemSetting = {
  officeName: 'Pusat Dokumentasi IT Kantor',
  itSupportPhone: '+6285157816339',
  supportEmail: 'it-support@kantor.local',
  allowPublicComments: false,
  maintenanceMode: false,
  autoBackup: true,
  version: 'v1.5.0-admin',
};

export function calculateDashboardStats(
  devices: Device[] = devicesData,
  categories: Category[] = categoriesData
): DashboardStats {
  const totalDevices = devices.length;
  const totalCategories = categories.length;

  let totalGuides = 0;
  let totalFaqs = 4; // default base faqs

  let readyDevicesCount = 0;
  let maintenanceDevicesCount = 0;
  let newDevicesCount = 0;

  devices.forEach((device) => {
    // Count status
    if (device.status === 'Ready') readyDevicesCount++;
    else if (device.status === 'Maintenance') maintenanceDevicesCount++;
    else if (device.status === 'New') newDevicesCount++;

    // Count FAQs
    if (device.faqs) {
      totalFaqs += device.faqs.length;
    }

    // Count Guide steps in each section
    if (device.sections) {
      Object.values(device.sections).forEach((section) => {
        if (section) {
          totalGuides++;
          if (section.osSteps) {
            totalGuides += (section.osSteps.windows?.length || 0) + (section.osSteps.mac?.length || 0);
          }
          if (section.steps) {
            totalGuides += section.steps.length;
          }
          if (section.commonSteps) {
            totalGuides += section.commonSteps.length;
          }
        }
      });
    }
  });

  return {
    totalDevices,
    totalCategories,
    totalGuides,
    totalFaqs,
    readyDevicesCount,
    maintenanceDevicesCount,
    newDevicesCount,
  };
}
