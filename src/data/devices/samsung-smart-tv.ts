import { Device } from '../../types/device';

export const samsungSmartTv: Device = {
  id: 'samsung-smart-tv',
  name: 'Samsung Smart TV 4K Office',
  category: 'Smart TV, Proyektor & Display',
  categorySlug: 'proyektor',
  description: 'Panduan pengkoneksian kabel HDMI, Wireless Screen Mirroring (Samsung Smart View / Miracast untuk Windows, AirPlay 2 untuk Mac/iPhone), dan pengaturan audio TV kantor.',
  status: 'Ready',
  specs: [
    'Resolusi 4K UHD Office Display',
    'Dual HDMI Input & Audio Out',
    'Wireless Display (Smart View & Miracast)',
    'Apple AirPlay 2 Native Support'
  ],
  sections: {
    wifi: {
      id: 'hdmi-connection',
      title: 'Koneksi Kabel HDMI & Pengaturan Source TV',
      tabLabel: '1. Koneksi Kabel HDMI',
      iconName: 'Tv',
      badge: 'HDMI Input',
      osSteps: {
        windows: [
          {
            title: 'Langkah 1: Menghubungkan Kabel HDMI ke Laptop & TV',
            description: 'Tancapkan satu ujung kabel HDMI ke port HDMI laptop Windows kamu dan ujung lainnya ke port HDMI 1 atau HDMI 2 di bagian belakang/samping Samsung Smart TV.',
            details: [
              'Pastikan kabel HDMI terpasang dengan erat dan tidak longgar.',
              'Jika laptop tidak memiliki port HDMI standar, gunakan konverter (USB-C to HDMI Adapter).'
            ],
            tip: 'Gunakan port HDMI 1 (STB/DVI) atau HDMI 2 untuk kualitas sinyal presentasi terbaik.'
          },
          {
            title: 'Langkah 2: Memilih Input Source HDMI di Remote TV',
            description: 'Tekan tombol [Source] atau [Home] pada remote control Samsung TV.',
            details: [
              'Pilih opsi HDMI 1 atau HDMI 2 sesuai dengan port yang kamu colokkan.',
              'Tunggu 2–3 detik hingga layar TV menampilkan tampilan layar laptop Windows kamu.'
            ]
          },
          {
            title: 'Langkah 3: Mengatur Mode Tampilan Layar (Duplicate / Extend)',
            description: 'Tekan kombinasi tombol [Win + P] pada keyboard laptop Windows kamu.',
            details: [
              'Pilih [Duplicate] (Duplikat): Tampilan layar laptop dan TV akan persis sama (cocok untuk presentasi).',
              'Pilih [Extend] (Perluas): TV menjadi layar sekunder tambahan (cocok untuk rapat sambil melihat catatan rahasia di laptop).'
            ],
            codeSnippet: 'Shortcut: Win + P (Pilih Duplicate / Extend)'
          }
        ],
        mac: [
          {
            title: 'Langkah 1: Menghubungkan Adapter USB-C ke HDMI di Mac',
            description: 'Hubungkan adapter USB-C (Thunderbolt) to HDMI ke MacBook kamu, lalu tancapkan kabel HDMI dari Samsung TV.',
            details: [
              'Pastikan TV dalam keadaan menyala.',
              'Buka [System Settings] > [Displays] di macOS.'
            ]
          },
          {
            title: 'Langkah 2: Memilih Input Source di Samsung TV',
            description: 'Tekan tombol [Source] pada remote TV dan pilih port HDMI yang aktif (HDMI 1 atau HDMI 2).',
            details: [
              'Layar Mac akan otomatis berkedip 1 detik menandakan sinyal monitor eksternal terdeteksi.'
            ]
          },
          {
            title: 'Langkah 3: Mengatur Arrangement & Mirror Display di macOS',
            description: 'Di menu [System Settings] > [Displays], tentukan mode tampilan:',
            details: [
              'Centang [Mirror Built-in Display] jika ingin tampilan TV sama persis dengan MacBook.',
              'Atur letak posisi layar jika memilih mode Extend Display.'
            ]
          }
        ]
      }
    },
    bluetooth: {
      id: 'wireless-mirroring',
      title: 'Wireless Screen Mirroring (Smart View & Apple AirPlay 2)',
      tabLabel: '2. Wireless Screen Mirroring',
      iconName: 'Share2',
      badge: 'Tanpa Kabel',
      osSteps: {
        windows: [
          {
            title: 'Langkah 4: Menghubungkan Laptop ke Wi-Fi Kantor yang Sama',
            description: 'Pastikan laptop Windows kamu dan Samsung Smart TV terhubung ke jaringan Wi-Fi kantor yang sama.',
            details: [
              'Pastikan Wi-Fi laptop menyala.',
              'TV akan otomatis siap menerima sinyal proyeksi nirkabel.'
            ]
          },
          {
            title: 'Langkah 5: Menggunakan Wireless Display (Win + K)',
            description: 'Tekan kombinasi tombol [Win + K] pada keyboard Windows kamu.',
            details: [
              'Panel menu [Cast] / [Connect] akan muncul di sisi kanan layar.',
              'Pilih nama TV kantor (contoh: [TV] Samsung 7 Series / Samsung Office TV).',
              'Setujui notifikasi pengkoneksian di layar TV jika muncul balok izin.'
            ],
            codeSnippet: 'Shortcut: Win + K (Pilih Samsung Smart TV)'
          }
        ],
        mac: [
          {
            title: 'Langkah 4: Menggunakan Apple AirPlay 2 Native di Mac',
            description: 'Pastikan MacBook dan Samsung Smart TV berada di jaringan Wi-Fi kantor yang sama.',
            details: [
              'Klik ikon [Control Center] di bar atas layar Mac kamu (sebelah jam).',
              'Klik opsi [Screen Mirroring].'
            ]
          },
          {
            title: 'Langkah 5: Memilih Samsung TV & Memasukkan AirPlay PIN',
            description: 'Pilih nama Samsung Smart TV dari daftar perangkat AirPlay.',
            details: [
              'Layar Samsung TV akan menampilkan 4 digit kode AirPlay PIN secara otomatis.',
              'Ketikkan 4 digit PIN tersebut di pop-up layar Mac kamu lalu tekan Enter.',
              'Layar Mac akan langsung terproyeksi secara jernih ke TV tanpa kabel.'
            ],
            tip: 'Kode AirPlay PIN hanya muncul saat pengkoneksian pertama kali untuk keamanan.'
          }
        ]
      }
    },
    finish: {
      id: 'audio-troubleshooting',
      title: 'Pengaturan Sound Output TV & Troubleshooting',
      tabLabel: '3. Audio & Troubleshooting',
      iconName: 'CheckCircle2',
      badge: 'Audio & Tips',
      osSteps: {
        windows: [
          {
            title: 'Langkah 6: Mengarahkan Output Suara Laptop ke Speaker TV (Windows)',
            description: 'Jika video terputar di TV tetapi suara masih keluar dari speaker laptop Windows:',
            details: [
              'Klik ikon Speaker di pojok kanan bawah taskbar Windows.',
              'Klik panah di samping slider volume > Pilih [SAMSUNG TV (Intel/NVIDIA Display Audio)].'
            ]
          },
          {
            title: 'Langkah 7: Solusi Masalah Layar Hitam (No Signal) / Gambarnya Terpotong',
            description: 'Jika layar TV menampilkan tulisan "No Signal" atau resolusi terpotong:',
            details: [
              'Cabut kabel HDMI dan tancapkan kembali dengan kencang.',
              'Pada remote TV: Buka [Settings] > [General] > [External Device Manager] > Matikan/Nyalakan [HDMI UHD Color].',
              'Pastikan resolusi layar laptop diatur ke 1920x1080 (Full HD) atau 3840x2160 (4K).'
            ]
          }
        ],
        mac: [
          {
            title: 'Langkah 6: Mengarahkan Output Suara Mac ke Speaker TV (macOS)',
            description: 'Jika video terputar di TV tetapi suara masih keluar dari speaker MacBook:',
            details: [
              'Buka [System Settings] > [Sound] > [Output].',
              'Pilih [Samsung TV] dari daftar output audio yang tersedia.'
            ]
          },
          {
            title: 'Langkah 7: Solusi Masalah Layar Hitam (No Signal) pada macOS',
            description: 'Jika layar TV tidak merespon di Mac:',
            details: [
              'Lepas adapter USB-C HDMI dari Mac kamu lalu tancapkan kembali.',
              'Di macOS, buka [System Settings] > [Displays] > Tekan tombol Option dan klik [Detect Displays].'
            ]
          }
        ]
      }
    }
  },
  faqs: [
    {
      question: 'Mengapa laptop Windows saya tidak menemukan TV saat menekan Win + K?',
      answer: 'Pastikan laptop dan Samsung TV berada di jaringan Wi-Fi/SSID kantor yang sama dan fitur Wi-Fi Direct pada TV dalam kondisi aktif.'
    },
    {
      question: 'Bagaimana jika suara video tersendat-sendat saat menggunakan Wireless Mirroring?',
      answer: 'Wireless mirroring menggunakan pita gelombang Wi-Fi. Jika jaringan Wi-Fi kantor sedang padat, disarankan menggunakan koneksi kabel HDMI untuk kestabilan presentasi video.'
    },
    {
      question: 'Di mana letak tombol remote jika remote control fisik hilang?',
      answer: 'Samsung TV memiliki tombol joystick fisik kecil di bagian bawah bingkai tengah layar (dekat logo Samsung) untuk menyalakan dan mengganti source HDMI.'
    }
  ]
};
