export type AdminTab =
  | 'dashboard'
  | 'devices'
  | 'categories'
  | 'guides'
  | 'faq'
  | 'media'
  | 'logs'
  | 'settings';

export interface ActivityLog {
  id: string;
  user: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'AUTH' | 'SYSTEM';
  target: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'driver' | 'document' | 'image' | 'guide';
  fileSize: string;
  targetDevice: string;
  targetOs: 'windows' | 'mac' | 'all';
  url: string;
  updatedAt: string;
}

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
