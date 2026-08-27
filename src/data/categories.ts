import { Category } from '../types/device';

export const categoriesData: Category[] = [
  {
    id: 'printer',
    slug: 'printer',
    title: 'Printer Kantor',
    description: 'Panduan setup Wi-Fi, Bluetooth Direct, dan percetakan dokumen pada printer kantor.',
    icon: 'Printer',
    deviceCount: 2,
    available: true,
  },
  {
    id: 'share-link',
    slug: 'share-link',
    title: 'Pembagian Link Dokumen',
    description: 'Panduan lengkap pengaturan hak akses (Viewer, Commenter, Editor) dan penyalinan link (Google Docs, Sheet, Slide, OneDrive).',
    icon: 'Share2',
    deviceCount: 1,
    available: true,
  },
  {
    id: 'proyektor',
    slug: 'proyektor',
    title: 'Smart TV, Proyektor & Display',
    description: 'Panduan pengkoneksian Samsung Smart TV, Interactive Display 75", HDMI, Wireless Display (Smart View/AirPlay/Miracast).',
    icon: 'Projector',
    deviceCount: 2,
    available: true,
  },
  {
    id: 'video-conference',
    slug: 'video-conference',
    title: 'Video Conference & Meeting',
    description: 'Panduan setup kamera PTZ Video Conference Lumens, mic speakerphone, Zoom, Google Meet & MS Teams.',
    icon: 'Tv',
    deviceCount: 1,
    available: true,
  },
  {
    id: 'mesin-absensi',
    slug: 'mesin-absensi',
    title: 'Mesin Absensi',
    description: 'Panduan pendaftaran sidik jari, face recognition, dan sync log jam masuk pegawai.',
    icon: 'Fingerprint',
    deviceCount: 0,
    available: false,
  },
];
