import { Device } from '../../types/device';

export const interactiveDisplay75: Device = {
  id: 'interactive-display-75',
  name: 'Interactive Whiteboard Display 75"',
  category: 'Smart TV, Proyektor & Display',
  categorySlug: 'proyektor',
  description: 'Panduan penggunaan layar sentuh interaktif 75 inci untuk rapat kantor, menggambar digital whiteboard, koneksi kabel HDMI + Touch USB, dan Wireless Screen Sharing (EShare / Bytello Share).',
  status: 'Ready',
  specs: [
    'Layar Sentuh 75" 4K UHD Multi-Touch 20 Point',
    'Dual Connection (Kabel HDMI + Touch USB)',
    'Wireless Screen Sharing App (EShare / Bytello)',
    'Built-in Android Digital Whiteboard & QR Export'
  ],
  sections: {
    wifi: {
      id: 'hdmi-touch-connection',
      title: 'Koneksi Kabel HDMI + Touch USB (Fitur Layar Sentuh)',
      tabLabel: '1. Koneksi HDMI + Touch USB',
      iconName: 'Tv',
      badge: 'Layar Sentuh',
      osSteps: {
        windows: [
          {
            title: 'Langkah 1: Tancapkan Kabel HDMI & Kabel Touch USB',
            description: 'Untuk menggunakan fitur gambar/sentuh layar 75" pada Windows, kamu harus menghubungkan DUA kabel dari layar interaktif ke laptop:',
            details: [
              'Kabel 1 - HDMI: Tancapkan ke port HDMI laptop (menampilkan gambar/video).',
              'Kabel 2 - Touch USB (USB Type-A to Type-B): Tancapkan ke port USB laptop kamu (mengaktifkan respon sentuhan jari/stylus pada layar ke laptop).'
            ],
            tip: 'Jika hanya menancapkan kabel HDMI tanpa kabel Touch USB, layar 75" hanya berfungsi sebagai monitor biasa tanpa respon sentuhan.'
          },
          {
            title: 'Langkah 2: Verifikasi Driver Touchscreen Windows (Plug & Play)',
            description: 'Windows 10 / 11 akan otomatis mendeteksi Interactive Display sebagai [HID-compliant touch screen].',
            details: [
              'Sentuh layar 75" menggunakan jari atau stylus pen bawaan.',
              'Kursor mouse di laptop Windows kamu akan otomatis bergerak mengikuti sentuhan di layar 75".'
            ]
          }
        ],
        mac: [
          {
            title: 'Langkah 1: Menghubungkan Kabel HDMI & USB Touch di macOS',
            description: 'Tancapkan adapter USB-C Multiport ke Mac kamu:',
            details: [
              'Hubungkan kabel HDMI ke port HDMI adapter Mac.',
              'Hubungkan kabel Touch USB ke port USB Type-A adapter Mac.'
            ]
          },
          {
            title: 'Langkah 2: Pengaturan Respon Sentuh di macOS',
            description: 'macOS akan mendeteksi layar interaktif sebagai perangkat input pen/touchscreen.',
            details: [
              'Kamu dapat mengontrol slide presentasi, menggeser dokumen, dan mengklik tombol aplikasi langsung dari layar 75".'
            ]
          }
        ]
      }
    },
    bluetooth: {
      id: 'wireless-screenshare',
      title: 'Wireless Screen Sharing (Aplikasi EShare / Bytello Share)',
      tabLabel: '2. Wireless Screen Share App',
      iconName: 'Share2',
      badge: 'Wireless Share',
      osSteps: {
        windows: [
          {
            title: 'Langkah 3: Sambungkan Laptop ke Wi-Fi Ruang Rapat yang Sama',
            description: 'Pastikan laptop Windows kamu dan layar Interactive Display 75" terhubung pada jaringan Wi-Fi kantor yang sama.',
            details: [
              'Periksa nama Wi-Fi dan IP address yang tertera di pojok bawah layar 75".'
            ]
          },
          {
            title: 'Langkah 4: Buka Aplikasi EShare / Bytello Share di Windows',
            description: 'Buka aplikasi EShare / Bytello Share pada laptop Windows kamu.',
            details: [
              'Ketikkan 6 digit kode PIN / Server Code yang tampil di layar besar 75".',
              'Klik tombol [Start Sharing] / [Mirroring].',
              'Tampilan laptop kamu akan langsung muncul di layar 75" secara nirkabel.'
            ],
            codeSnippet: 'Masukkan 6-Digit PIN Code (Tercantum di Layar 75")'
          }
        ],
        mac: [
          {
            title: 'Langkah 3: Sambungkan Mac ke Wi-Fi Ruang Rapat yang Sama',
            description: 'Pastikan MacBook dan layar Interactive Display 75" terhubung pada jaringan Wi-Fi kantor yang sama.',
            details: [
              'Periksa nama Wi-Fi di MacBook kamu.'
            ]
          },
          {
            title: 'Langkah 4: Buka Aplikasi EShare / Bytello Share untuk macOS',
            description: 'Jalankan aplikasi EShare / Bytello Share di Mac kamu.',
            details: [
              'Ketikkan 6 digit kode PIN yang tampil di layar besar 75".',
              'Setujui izin [Screen Recording] jika macOS meminta konfirmasi keamanan.'
            ]
          }
        ]
      }
    },
    finish: {
      id: 'whiteboard-export',
      title: 'Penggunaan Digital Whiteboard & QR Code Export',
      tabLabel: '3. Digital Whiteboard & Export PDF',
      iconName: 'CheckCircle2',
      badge: 'Whiteboard',
      osSteps: {
        windows: [
          {
            title: 'Langkah 5: Membuka Fitur Built-in Whiteboard',
            description: 'Beralih ke sistem bawaan Interactive Display (Android Mode) tanpa memerlukan laptop.',
            details: [
              'Tekan tombol [Home] di bingkai layar 75" atau ikon pensil di toolbar samping.',
              'Pilih aplikasi [Whiteboard].',
              'Gunakan Stylus Pen bawaan untuk menulis, menggambar diagram, atau membuat uran rapat.'
            ]
          },
          {
            title: 'Langkah 6: Anotasi di Atas Presentasi PowerPoint / PDF',
            description: 'Kamu bisa memuat mode coret-coret di atas layar laptop yang sedang diproyeksikan.',
            details: [
              'Ketuk toolbar samping di layar 75" > Pilih ikon [Annotation / Marker].',
              'Lingkari poin-poin penting pada slide presentasi rapat.',
              'Tekan ikon [Save] untuk menyimpan screenshot hasil coretan.'
            ]
          },
          {
            title: 'Langkah 7: Menyimpan & Membagikan Hasil Rapat via Scan QR Code',
            description: 'Bagikan hasil papan tulis rapat langsung ke HP seluruh peserta rapat:',
            details: [
              'Setelah rapat selesai, klik tombol [Share / Export] di pojok kanan bawah Whiteboard.',
              'Layar 75" akan memunculkan gambar [QR Code].',
              'Minta peserta rapat melakukan scan QR Code menggunakan kamera HP (Android/iPhone) untuk langsung mengunduh file rapat dalam format PDF.'
            ],
            tip: 'Fitur Scan QR Code menghemat kertas dan tidak perlu memfoto papan tulis manual.'
          }
        ],
        mac: [
          {
            title: 'Langkah 5: Membuka Fitur Built-in Whiteboard di Mac Mode',
            description: 'Beralih ke sistem bawaan Interactive Display (Android Mode) saat presentasi Mac.',
            details: [
              'Tekan tombol [Home] di bingkai layar 75" atau ikon pensil di toolbar samping.',
              'Pilih aplikasi [Whiteboard].'
            ]
          },
          {
            title: 'Langkah 6: Anotasi & Scan QR Code Export (macOS)',
            description: 'Gunakan fitur coret-coret dan bagikan hasil rapat via QR Code:',
            details: [
              'Ketuk ikon [Annotation / Marker] di layar 75".',
              'Ekspor hasil catatan rapat ke format PDF dengan memilih [Share] > Scan QR Code di HP.'
            ]
          }
        ]
      }
    }
  },
  faqs: [
    {
      question: 'Mengapa layar 75" bisa menampilkan gambar tetapi tidak bisa disentuh?',
      answer: 'Pastikan kabel Touch USB (kabel kotak USB Type-B) sudah terpasang dari layar 75" ke port USB laptop kamu. Kabel HDMI hanya mengirim gambar, sedangkan kabel Touch USB yang mengirim data sentuhan.'
    },
    {
      question: 'Apakah Stylus Pen memerlukan baterai?',
      answer: 'Tidak. Stylus Pen pada Interactive Display 75" umumnya menggunakan teknologi pasif magnetik yang tidak memerlukan pengisian daya atau baterai.'
    },
    {
      question: 'Bagaimana cara beralih dari layar laptop kembali ke menu Whiteboard Android?',
      answer: 'Tekan tombol [Home] fisik di bagian bawah bingkai layar atau geser toolbar dari tepi kanan/kiri layar lalu tekan ikon rumah.'
    }
  ]
};
