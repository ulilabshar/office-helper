export type TargetOS = 'windows' | 'mac';

export interface SetupStep {
  title: string;
  description: string;
  details?: string[];
  codeSnippet?: string;
  warning?: string;
  tip?: string;
  osTarget?: 'all' | 'windows' | 'mac';
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
  steps?: SetupStep[]; // Backward compatibility fallback
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Device {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  image?: string;
  status: 'Ready' | 'Maintenance' | 'New';
  specs: string[];
  sections: {
    wifi: DeviceSection;
    bluetooth: DeviceSection;
    finish: DeviceSection;
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
}
