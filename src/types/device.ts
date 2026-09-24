export type TargetOS = 'windows' | 'mac';

export interface SetupStep {
  id?: string;
  device_id?: string;
  title: string;
  description?: string;
  konten_windows?: string;
  konten_mac?: string;
  details?: string[];
  codeSnippet?: string;
  warning?: string;
  tip?: string;
  osTarget?: 'all' | 'windows' | 'mac';
  sort_order?: number;
}

export interface OsSpecificSteps {
  windows: SetupStep[];
  mac: SetupStep[];
}

export interface DeviceSection {
  id: string;
  title: string;
  tabLabel?: string;
  iconName: string;
  badge?: string;
  commonSteps?: SetupStep[];
  osSteps?: OsSpecificSteps;
  steps?: SetupStep[];
}

export interface FAQItem {
  id?: string;
  device_id?: string | null;
  question: string;
  answer: string;
  sort_order?: number;
}

export interface Device {
  id: string;
  name: string;
  slug?: string;
  category: string;
  categorySlug: string;
  description: string;
  image?: string;
  status: 'Ready' | 'Maintenance' | 'New';
  supported_os?: string[];
  specs: string[];
  sort_order?: number;
  steps?: SetupStep[];
  sections?: {
    wifi?: DeviceSection;
    bluetooth?: DeviceSection;
    finish?: DeviceSection;
    troubleshooting?: DeviceSection;
  };
  faqs: FAQItem[];
}

export interface Category {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  deviceCount: number;
  available: boolean;
  sort_order?: number;
}


