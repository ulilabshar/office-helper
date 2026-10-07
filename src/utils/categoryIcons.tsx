import React from 'react';
import {
  Printer,
  Scan,
  Copy,
  FileText,
  Files,
  Folder,
  QrCode,
  Wifi,
  Router,
  Network,
  Server,
  Cloud,
  HardDrive,
  Database,
  Laptop,
  Cpu,
  Monitor,
  Tv,
  Projector,
  Tablet,
  Keyboard,
  Mouse,
  PhoneCall,
  Video,
  Mic,
  Volume2,
  Headphones,
  Radio,
  Mail,
  Fingerprint,
  ShieldCheck,
  KeyRound,
  Cctv,
  Zap,
  Share2,
  Wrench,
  Layers,
  LucideIcon,
} from 'lucide-react';
import { SelectOption } from '../components/CustomSelect';

export interface CategoryIconDefinition {
  value: string;
  label: string;
  sublabel: string;
  group: 'Cetak & Dokumen' | 'Jaringan & Server' | 'Komputer & Display' | 'Komunikasi & Meeting' | 'Keamanan & Utilitas';
  icon: LucideIcon;
}

export const CATEGORY_ICONS_MAP: Record<string, LucideIcon> = {
  // Cetak & Dokumen
  Printer,
  Scan,
  Copy,
  FileText,
  Files,
  Folder,
  QrCode,
  Share2,

  // Jaringan & Server
  Wifi,
  Router,
  Network,
  Server,
  Cloud,
  HardDrive,
  Database,

  // Komputer & Display
  Laptop,
  Cpu,
  Monitor,
  Tv,
  Projector,
  Tablet,
  Keyboard,
  Mouse,

  // Komunikasi & Meeting
  PhoneCall,
  Video,
  Mic,
  Volume2,
  Headphones,
  Radio,
  Mail,

  // Keamanan & Fasilitas
  Fingerprint,
  ShieldCheck,
  KeyRound,
  Cctv,
  Zap,
  Wrench,
  Layers,
};

export const CATEGORY_ICON_DEFINITIONS: CategoryIconDefinition[] = [
  // Cetak & Dokumen
  { value: 'Printer', label: 'Printer', sublabel: 'Peralatan cetak dokumen', group: 'Cetak & Dokumen', icon: Printer },
  { value: 'Scan', label: 'Scanner', sublabel: 'Pemindai dokumen & berkas', group: 'Cetak & Dokumen', icon: Scan },
  { value: 'Copy', label: 'Mesin Fotokopi', sublabel: 'Pengganda dokumen & copier', group: 'Cetak & Dokumen', icon: Copy },
  { value: 'FileText', label: 'Berkas & SOP', sublabel: 'Dokumen kantor & formulir', group: 'Cetak & Dokumen', icon: FileText },
  { value: 'Files', label: 'Manajemen Arsip', sublabel: 'Pengarsipan & berkas fisik', group: 'Cetak & Dokumen', icon: Files },
  { value: 'Folder', label: 'Folder Berkas', sublabel: 'Direktori berkas kantor', group: 'Cetak & Dokumen', icon: Folder },
  { value: 'QrCode', label: 'QR / Barcode Scanner', sublabel: 'Pemindai inventaris & kode QR', group: 'Cetak & Dokumen', icon: QrCode },
  { value: 'Share2', label: 'Sharing Folder / Jaringan', sublabel: 'Berbagi link, folder LAN & server', group: 'Cetak & Dokumen', icon: Share2 },

  // Jaringan & Server
  { value: 'Wifi', label: 'Wi-Fi / Nirkabel', sublabel: 'Akses internet wireless kantor', group: 'Jaringan & Server', icon: Wifi },
  { value: 'Router', label: 'Router & Modem', sublabel: 'Gateway & perangkat routing', group: 'Jaringan & Server', icon: Router },
  { value: 'Network', label: 'Jaringan LAN', sublabel: 'Switch hub & kabel LAN kantor', group: 'Jaringan & Server', icon: Network },
  { value: 'Server', label: 'Server Kantor', sublabel: 'Rak server fisik & data center', group: 'Jaringan & Server', icon: Server },
  { value: 'Cloud', label: 'Cloud Storage', sublabel: 'Google Drive, OneDrive & cloud', group: 'Jaringan & Server', icon: Cloud },
  { value: 'HardDrive', label: 'Hard Disk / NAS', sublabel: 'Penyimpanan data eksternal & backup', group: 'Jaringan & Server', icon: HardDrive },
  { value: 'Database', label: 'Database', sublabel: 'Basis data & sistem internal', group: 'Jaringan & Server', icon: Database },

  // Komputer & Display
  { value: 'Laptop', label: 'Laptop / Notebook', sublabel: 'Komputer jinjing portabel', group: 'Komputer & Display', icon: Laptop },
  { value: 'Cpu', label: 'PC / Desktop', sublabel: 'Komputer desktop & CPU kantor', group: 'Komputer & Display', icon: Cpu },
  { value: 'Monitor', label: 'Monitor Komputer', sublabel: 'Layar kerja & dual monitor', group: 'Komputer & Display', icon: Monitor },
  { value: 'Tv', label: 'Smart TV', sublabel: 'Televisi & display ruang kerja', group: 'Komputer & Display', icon: Tv },
  { value: 'Projector', label: 'Proyektor', sublabel: 'Proyektor ruang rapat & presentasi', group: 'Komputer & Display', icon: Projector },
  { value: 'Tablet', label: 'Tablet / iPad', sublabel: 'Tablet digital & layar sentuh', group: 'Komputer & Display', icon: Tablet },
  { value: 'Keyboard', label: 'Keyboard Komputer', sublabel: 'Perangkat input & keyboard', group: 'Komputer & Display', icon: Keyboard },
  { value: 'Mouse', label: 'Mouse & Pointer', sublabel: 'Mouse komputer & pointer rapat', group: 'Komputer & Display', icon: Mouse },

  // Komunikasi & Meeting
  { value: 'PhoneCall', label: 'Telepon / PABX', sublabel: 'Telepon meja & interkom kantor', group: 'Komunikasi & Meeting', icon: PhoneCall },
  { value: 'Video', label: 'Video Conference', sublabel: 'Kamera webcam & Zoom meeting', group: 'Komunikasi & Meeting', icon: Video },
  { value: 'Mic', label: 'Mikrofon Rapat', sublabel: 'Mic meja & sound conference', group: 'Komunikasi & Meeting', icon: Mic },
  { value: 'Volume2', label: 'Speaker Kantor', sublabel: 'Tata suara & speakerphone', group: 'Komunikasi & Meeting', icon: Volume2 },
  { value: 'Headphones', label: 'Headset / Headphone', sublabel: 'Headset call center & rapat', group: 'Komunikasi & Meeting', icon: Headphones },
  { value: 'Radio', label: 'Handy Talky (HT)', sublabel: 'Radio komunikasi operasional', group: 'Komunikasi & Meeting', icon: Radio },
  { value: 'Mail', label: 'Email Kantor', sublabel: 'Korespondensi email & surat digital', group: 'Komunikasi & Meeting', icon: Mail },

  // Keamanan & Fasilitas
  { value: 'Fingerprint', label: 'Mesin Absensi', sublabel: 'Biometrik sidik jari & wajah', group: 'Keamanan & Utilitas', icon: Fingerprint },
  { value: 'ShieldCheck', label: 'Keamanan IT', sublabel: 'Antivirus, firewall & proteksi', group: 'Keamanan & Utilitas', icon: ShieldCheck },
  { value: 'KeyRound', label: 'Smart Lock / Akses', sublabel: 'Kunci elektronik & kartu RFID', group: 'Keamanan & Utilitas', icon: KeyRound },
  { value: 'Cctv', label: 'Kamera CCTV', sublabel: 'Pengawasan keamanan kantor', group: 'Keamanan & Utilitas', icon: Cctv },
  { value: 'Zap', label: 'UPS & Kelistrikan', sublabel: 'Daya cadangan & stabilizer listrik', group: 'Keamanan & Utilitas', icon: Zap },
  { value: 'Wrench', label: 'Servis & Perawatan', sublabel: 'Perkakas IT & utilitas pemeliharaan', group: 'Keamanan & Utilitas', icon: Wrench },
  { value: 'Layers', label: 'Peralatan Umum', sublabel: 'Peralatan multi-fungsi kantor', group: 'Keamanan & Utilitas', icon: Layers },
];

/**
 * Returns a LucideIcon component corresponding to the given icon name.
 * Safe fallback to `Layers` if no match is found.
 */
export const getCategoryIcon = (iconName?: string): LucideIcon => {
  if (!iconName) return Layers;

  // Exact match
  if (CATEGORY_ICONS_MAP[iconName]) {
    return CATEGORY_ICONS_MAP[iconName];
  }

  // Case-insensitive match
  const lower = iconName.toLowerCase().trim();
  const matchedKey = Object.keys(CATEGORY_ICONS_MAP).find(
    (key) => key.toLowerCase() === lower
  );
  if (matchedKey) {
    return CATEGORY_ICONS_MAP[matchedKey];
  }

  // Aliases
  if (lower === 'proyektor') return Projector;
  if (lower === 'smart-tv' || lower === 'smarttv') return Tv;
  if (lower === 'absensi') return Fingerprint;
  if (lower === 'sharing' || lower === 'share') return Share2;

  return Layers;
};

/**
 * Generates options for CustomSelect with embedded icon elements.
 */
export const getCategorySelectOptions = (): SelectOption[] => {
  return CATEGORY_ICON_DEFINITIONS.map((item) => {
    const IconComp = item.icon;
    return {
      value: item.value,
      label: item.label,
      sublabel: `${item.sublabel} • [${item.group}]`,
      icon: <IconComp className="h-4 w-4" />,
    };
  });
};
