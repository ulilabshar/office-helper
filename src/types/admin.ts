export type AdminTab =
  | 'dashboard'
  | 'devices'
  | 'categories'
  | 'guides'
  | 'faq'
  | 'settings';


export interface SystemSetting {
  officeName: string;
  itSupportPhone: string;
  supportEmail: string;
  allowPublicComments: boolean;
  maintenanceMode: boolean;
  autoBackup: boolean;
  version: string;
}

export interface DashboardStats {
  totalDevices: number;
  totalCategories: number;
  totalGuides: number;
  totalFaqs: number;
  readyDevicesCount: number;
  maintenanceDevicesCount: number;
  newDevicesCount: number;
}
