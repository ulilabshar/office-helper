import { Device } from '../../types/device';

export const epsonL3250: Device = {
  id: 'epson-l3250',
  name: 'Epson EcoTank L3250 Series',
  category: 'Printer',
  categorySlug: 'printer',
  description: 'Printer multifungsi (Print, Scan, Copy) dengan sistem tangki tinta hemat energi dan konektivitas Wi-Fi Direct.',
  status: 'Ready',
  specs: ['All-in-One (Print, Scan, Copy)', 'Wi-Fi & Wi-Fi Direct', 'Epson Smart Panel', 'Kecepatan Cetak 33ppm (B/W)'],
  sections: {
    wifi: {
      id: 'wifi',
      title: 'Langkah Koneksi Wi-Fi',
      iconName: 'Wifi',
      badge: 'Jaringan Kantor',
      osSteps: {
        windows: [
          {
            title: 'Langkah 1 (Windows): Hubungkan Printer ke Wi-Fi Router via WPS',
            description: 'Nyalakan printer Epson L3250. Tekan dan tahan tombol [Wi-Fi] pada printer selama 5 detik hingga indikator berkedip bergantian.',
            details: [
              'Tekan tombol WPS pada router Wi-Fi kantor dalam rentang 2 menit.',
              'Pastikan Laptop Windows terhubung ke SSID Wi-Fi 2.4 GHz yang sama.'
            ],
            tip: 'Pengguna Windows 10/11 dapat langsung mengecek status koneksi di menu Settings > Bluetooth & Devices > Printers.'
          },
          {
            title: 'Langkah 2 (Windows): Setup Wi-Fi Direct via Network Discovery',
            description: 'Jika tidak menggunakan router kantor, hubungkan langsung PC Windows ke sinyal Wi-Fi Direct printer.',
            details: [
              'Tekan tombol [Wi-Fi Direct] di printer selama 3 detik.',
              'Di laptop Windows, klik ikon Wi-Fi di taskbar kanan bawah.',
              'Pilih SSID `DIRECT-xxxx-L3250` dan masukkan Password yang tercetak dari tombol [i].'
            ],
            codeSnippet: 'Wi-Fi SSID: DIRECT-L3250-Series | Pass: 12345678'
          }
        ],
        mac: [
          {
            title: 'Langkah 1 (macOS): Koneksi Wi-Fi & Penemuan via AirPrint / Bonjour',
            description: 'Pastikan Mac kamu dan printer Epson L3250 berada di satu jaringan Wi-Fi kantor.',
            details: [
              'Tekan dan tahan tombol [Wi-Fi] pada printer hingga lampu indikator berkedip hijau.',
              'Tekan tombol WPS pada router Wi-Fi kantor.',
              'macOS akan secara otomatis mendeteksi printer melalui protokol Bonjour Broadcast.'
            ],
            tip: 'Di macOS, kamu tidak wajib mengunduh driver manual jika menggunakan protokol AirPrint.'
          },
          {
            title: 'Langkah 2 (macOS): Menghubungkan Wi-Fi Direct pada Mac',
            description: 'Sambungkan Wi-Fi Mac langsung ke pemancar Wi-Fi Direct Epson L3250.',
            details: [
              'Buka Control Center > Wi-Fi pada menu bar kanan atas macOS.',
              'Pilih nama Wi-Fi Direct `DIRECT-xxxx-L3250`.',
              'Masukkan Kata Sandi Wi-Fi Direct printer.'
            ]
          }
        ]
      }
    },
    bluetooth: {
      id: 'bluetooth',
      title: 'Langkah Koneksi Bluetooth & Smart App',
      iconName: 'Bluetooth',
      badge: 'Mobile & Smart Setup',
      osSteps: {
        windows: [
          {
            title: 'Langkah 1 (Windows): Pairing Bluetooth Smart Setup',
            description: 'Windows 10/11 mendukung penemuan cepat Bluetooth Low Energy (BLE) untuk printer Epson.',
            details: [
              'Buka Start Menu > Settings (Pengaturan) > Bluetooth & Devices.',
              'Aktifkan Bluetooth PC Windows kamu.',
              'Klik "Add Device" > pilih "Bluetooth" dan cari "EPSON L3250 Series".'
            ],
            warning: 'Koneksi Bluetooth pada printer ini utamanya digunakan untuk setup awal dan pemindaian status.'
          },
          {
            title: 'Langkah 2 (Windows): Verifikasi Device Driver di Windows',
            description: 'Pastikan Windows Device Manager mengenali port Bluetooth / Wireless printer.',
            details: [
              'Buka `devmgmt.msc` di Windows Run.',
              'Periksa kategori "Print Queues" apakah "EPSON L3250 Series" sudah terdaftar.'
            ]
          }
        ],
        mac: [
          {
            title: 'Langkah 1 (macOS): Setup via Aplikasi Epson Smart Panel / Bluetooth Mobile',
            description: 'Gunakan iPhone/iPad/Mac dengan Bluetooth aktif untuk pairing instan.',
            details: [
              'Aktifkan Bluetooth di macOS melalui System Settings > Bluetooth.',
              'Unduh aplikasi Epson Smart Panel dari Mac App Store / iOS App Store.',
              'Pilih "Setup New Product" di aplikasi. Aplikasi akan menemukan Epson L3250 via Bluetooth.'
            ],
            tip: 'Setelah terhubung via Bluetooth Smart, aplikasi akan secara otomatis membagikan kredensial Wi-Fi Mac ke printer.'
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
            title: 'Langkah 1 (Windows): Instal Web Installer Driver (.exe)',
            description: 'Unduh paket penginstal lengkap resmi Epson L3250 untuk sistem operasi Windows.',
            details: [
              'Buka file `L3250_Lite_Win_1.2.exe`.',
              'Pilih opsi "Auto Wireless Connect" saat installer meminta tipe koneksi.',
              'Selesaikan wizard instalasi hingga muncul notifikasi "Printer Added Successfully".'
            ],
            codeSnippet: 'Epson L3250 Windows Web Installer (L3250_Lite_Win.exe)'
          },
          {
            title: 'Langkah 2 (Windows): Cetak Halaman Uji (Print Test Page)',
            description: 'Lakukan pengujian akhir pencetakan via Control Panel Windows.',
            details: [
              'Buka Control Panel > Devices and Printers.',
              'Klik kanan pada ikon "EPSON L3250 Series" > Printer Properties.',
              'Tekan tombol [Print Test Page].'
            ]
          }
        ],
        mac: [
          {
            title: 'Langkah 1 (macOS): Menambahkan Printer via System Settings > Printers & Scanners',
            description: 'Tambahkan printer ke antrean cetak macOS menggunakan driver AirPrint / Epson Drivers.',
            details: [
              'Buka Apple Menu () > System Settings > Printers & Scanners.',
              'Klik tombol [Add Printer, Scanner, or Fax...] (+).',
              'Pilih "EPSON L3250 Series" dari daftar penemuan Bonjour.',
              'Pada kolom "Use", pilih "Auto Select" atau "Secure AirPrint".'
            ],
            codeSnippet: 'macOS AirPrint Driver / Epson Driver (.dmg)'
          },
          {
            title: 'Langkah 2 (macOS): Uji Cetak Dokumen Test dari Mac',
            description: 'Cetak dokumen uji dari aplikasi Preview atau TextEdit di macOS.',
            details: [
              'Buka dokumen PDF di aplikasi Preview.',
              'Tekan Command (⌘) + P.',
              'Pilih Printer "EPSON L3250 Series" dan ketuk tombol [Print].'
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
            title: 'Printer Berstatus Offline di Windows',
            description: 'Buka Control Panel > Devices and Printers.',
            details: [
              'Klik kanan EPSON L3250 > pilih "See what\'s printing".',
              'Klik menu Printer > hilangkan centang pada "Use Printer Offline".',
              'Restart layanan Print Spooler di `services.msc`.'
            ]
          }
        ],
        mac: [
          {
            title: 'Printer Berstatus Offline / Pause di macOS',
            description: 'Reset sistem pencetakan macOS (Reset Printing System):',
            details: [
              'Buka System Settings > Printers & Scanners.',
              'Klik kanan pada daftar printer dan pilih "Reset Printing System...".',
              'Tambahkan kembali Epson L3250 menggunakan tombol (+).'
            ]
          }
        ]
      }
    }
  },
  faqs: [
    {
      question: 'Bagaimana cara reset indikator tinta jika lampu tinta berkedip?',
      answer: 'Tekan dan tahan tombol Stop (ikon segitiga merah) selama 5 detik hingga indikator tinta mati.'
    },
    {
      question: 'Berapa password default Wi-Fi Direct Epson L3250?',
      answer: 'Password Wi-Fi Direct dapat dicetak secara fisik dengan menekan dan menahan tombol [i] selama 7 detik hingga printer mencetak lembar status.'
    },
    {
      question: 'Apakah aplikasi Epson Smart Panel bisa digunakan di Mac?',
      answer: 'Aplikasi Epson Smart Panel tersedia untuk iOS/iPadOS dan macOS dengan Apple Silicon (M1/M2/M3/M4).'
    }
  ]
};
