import { SystemSetting, DashboardStats } from '../types/admin';
import { Device, Category } from '../types/device';
import { devicesData } from './devices';
import { categoriesData } from './categories';

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
  categories: Category[] = categoriesData,
  generalFaqCount = 0
): DashboardStats {
  const totalDevices = devices.length;
  const totalCategories = categories.length;

  let totalGuides = 0;
  let totalFaqs = generalFaqCount;

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
