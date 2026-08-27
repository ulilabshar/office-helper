import { Device } from '../../types/device';

export const epsonWfC879r: Device = {
  id: 'epson-wf-c879r',
  name: 'Epson WorkForce Pro WF-C879R Series',
  category: 'Printer',
  categorySlug: 'printer',
  description: 'Printer korporat multifungsi A3 tinggi dengan kapasitas kantong tinta Replaceable Ink Pack System (RIPS) dan layar sentuh kontrol.',
  status: 'Ready',
  specs: ['Enterprise A3 Multifungsi', 'Touchscreen Control Panel', 'Gigabit Ethernet & Wi-Fi Direct', 'RIPS Ink Technology (Hingga 86.000 Halaman)'],
  sections: {
    wifi: {
      id: 'wifi',
      title: 'Langkah Koneksi Wi-Fi & Ethernet Jaringan Enterprise',
      iconName: 'Wifi',
      badge: 'Network Setup',
      osSteps: {
        windows: [
          {
            title: 'Langkah 1 (Windows): Menghubungkan Printer ke Router / LAN Kantor',
            description: 'Aktifkan printer dan hubungkan ke jaringan kantor via layar touchscreen.',
            details: [
              'Pada layar LCD touchscreen printer, ketuk [General Settings] > [Network Settings] > [Wi-Fi Setup].',
              'Pilih SSID jaringan Wi-Fi kantor dan masukkan kata sandi.',
              'Untuk jaringan kabel LAN, tancapkan kabel Ethernet RJ45 ke port belakang printer.'
            ]
          },
          {
            title: 'Langkah 2 (Windows): Deteksi IP Printer di Windows Network',
            description: 'Cari IP Address printer untuk ditambahkan ke PC Windows.',
            details: [
              'Di layar printer, ketuk ikon [Status] untuk melihat IP Address (Misal: `192.168.1.150`).',
              'Buka Windows Command Prompt (`cmd`) dan ketik `ping 192.168.1.150` untuk memastikan koneksi stabil.'
            ],
            codeSnippet: 'ping 192.168.1.150'
          }
        ],
        mac: [
          {
            title: 'Langkah 1 (macOS): Konfigurasi Wi-Fi & Bonjour Enterprise di Mac',
            description: 'Hubungkan printer ke Wi-Fi kantor dari layar sentuh LCD.',
            details: [
              'Ketuk [General Settings] > [Network Settings] > [Wi-Fi Setup] pada layar printer.',
              'Pilih SSID Wi-Fi kantor kamu.',
              'Di macOS, pastikan Mac terhubung ke jaringan Wi-Fi kantor yang sama.'
            ]
          },
          {
            title: 'Langkah 2 (macOS): Verifikasi IP & Web Config (EpsonNet Config)',
            description: 'Akses halaman administrasi printer melalui browser Safari di Mac.',
            details: [
              'Buka browser Safari di Mac.',
              'Ketik IP Address printer (contoh: `http://192.168.1.150`) di address bar.',
              'Halaman Web Config Epson WF-C879R akan terbuka untuk pengaturan lanjut.'
            ],
            codeSnippet: 'http://192.168.1.150'
          }
        ]
      }
    },
    bluetooth: {
      id: 'bluetooth',
      title: 'Langkah Koneksi Bluetooth & Wi-Fi Direct',
      iconName: 'Bluetooth',
      badge: 'Direct Connection',
      osSteps: {
        windows: [
          {
            title: 'Langkah 1 (Windows): Koneksi Wi-Fi Direct di Windows 10/11',
            description: 'Sambungkan PC Windows langsung ke SSID Wi-Fi Direct printer tanpa melalui router.',
            details: [
              'Aktifkan Wi-Fi Direct dari layar touchscreen printer: [Network Settings] > [Wi-Fi Direct] > ON.',
              'Di Windows, klik ikon Wi-Fi di taskbar > pilih nama SSID `DIRECT-WF-C879R`.',
              'Masukkan kata sandi Wi-Fi Direct yang ditampilkan di layar printer.'
            ]
          }
        ],
        mac: [
          {
            title: 'Langkah 1 (macOS): AirPlay & Wi-Fi Direct di macOS',
            description: 'Gunakan Apple AirPlay atau Wi-Fi Direct untuk mencetak langsung dari Mac.',
            details: [
              'Aktifkan Wi-Fi Direct di layar touchscreen printer.',
              'Buka Wi-Fi menu bar di macOS, hubungkan ke SSID `DIRECT-WF-C879R`.',
              'Buka dokumen di Mac, tekan ⌘P, dan pilih "Epson WF-C879R Direct".'
            ],
            tip: 'AirPrint pada macOS tidak memerlukan driver tambahan dan langsung siap mencetak dokumen A3/A4.'
          }
        ]
      }
    },
    finish: {
      id: 'finish',
      title: 'Proses Setup Selesai & Test Print',
      iconName: 'CheckCircle2',
      badge: 'Driver & Verifikasi',
      osSteps: {
        windows: [
          {
            title: 'Langkah 1 (Windows): Instal Universal Printer Driver PCL6 (.exe)',
            description: 'Instal paket driver korporat Epson Universal Print Driver pada komputer Windows.',
            details: [
              'Unduh dan jalankan installer `Epson_WF-C879R_UPD_Win.exe`.',
              'Pilih opsi "Search Network Printers Automatically".',
              'Pilih printer WF-C879R dari daftar dan selesaikan instalasi.'
            ],
            codeSnippet: 'Epson Universal Print Driver PCL6 / PS3 (Windows)'
          },
          {
            title: 'Langkah 2 (Windows): Konfigurasi Tray Kertas A4/A3 & Test Print',
            description: 'Atur ukuran kertas pada driver Windows.',
            details: [
              'Buka Control Panel > Devices and Printers.',
              'Klik kanan Epson WF-C879R > Printing Preferences.',
              'Set Paper Source: Tray 1 (A4) dan Tray 2 (A3).',
              'Klik [Print Test Page] untuk memverifikasi.'
            ]
          }
        ],
        mac: [
          {
            title: 'Langkah 1 (macOS): Instalasi Driver Mac (.dmg) & Pendaftaran AirPrint',
            description: 'Tambahkan printer di macOS via System Settings.',
            details: [
              'Unduh paket driver macOS `WF-C879R_Mac_Driver.dmg` dari situs Epson.',
              'Buka Apple Menu () > System Settings > Printers & Scanners.',
              'Klik (+), pilih Epson WF-C879R yang terdeteksi di jaringan Bonjour, dan pilih "Auto Select AirPrint".'
            ],
            codeSnippet: 'Epson WF-C879R macOS Driver Package (.dmg)'
          },
          {
            title: 'Langkah 2 (macOS): Cetak Halaman Uji di Mac',
            description: 'Uji pencetakan dokumen dari Mac.',
            details: [
              'Buka dokumen apapun di Mac.',
              'Tekan ⌘ + P > pilih Printer Epson WF-C879R > klik [Print].'
            ]
          }
        ]
      }
    },
    troubleshooting: {
      id: 'troubleshooting',
      title: 'Troubleshooting & Perbaikan Masalah',
      iconName: 'HelpCircle',
      badge: 'Solusi Cepat',
      osSteps: {
        windows: [
          {
            title: 'Penanganan Paper Jam di Windows Spooler',
            description: 'Jika dokumen tertahan di antrean cetak Windows:',
            details: [
              'Buka Run (`Win + R`), ketik `services.msc`.',
              'Cari "Print Spooler", klik kanan > Restart.',
              'Buka folder `%systemroot%\\System32\\spool\\PRINTERS` dan hapus file temp.'
            ],
            codeSnippet: 'net stop spooler && net start spooler'
          }
        ],
        mac: [
          {
            title: 'Penanganan Error Communication di macOS',
            description: 'Jika muncul status "Communication Error" pada macOS:',
            details: [
              'Buka System Settings > Printers & Scanners.',
              'Hapus printer WF-C879R dan tambahkan kembali.',
              'Pastikan Mac dan printer terhubung ke subnet IP yang sama.'
            ]
          }
        ]
      }
    }
  },
  faqs: [
    {
      question: 'Berapa kapasitas simpan kertas pada Epson WF-C879R?',
      answer: 'Printer ini mendukung total kapasitas hingga 1.835 lembar kertas dengan opsi cassette tray tambahan.'
    },
    {
      question: 'Apakah driver macOS mendukung fitur duplex (cetak bolak-balik) A3?',
      answer: 'Ya, driver macOS dan AirPrint mendukung penuh cetak otomatis 2-sisi (Auto Duplex) hingga ukuran A3.'
    }
  ]
};
