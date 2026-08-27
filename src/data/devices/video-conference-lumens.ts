import { Device } from '../../types/device';

export const videoConferenceLumens: Device = {
  id: 'video-conference-lumens',
  name: 'Video Conference Lumens PTZ Camera System',
  category: 'Video Conference & Meeting',
  categorySlug: 'video-conference',
  description: 'Panduan setup sistem kamera PTZ Lumens (Pan-Tilt-Zoom), speakerphone mic omnidirectional, dan integrasi penuh dengan aplikasi Zoom Meeting, Google Meet, serta Microsoft Teams.',
  status: 'Ready',
  specs: [
    'Kamera PTZ Lumens 4K / Full HD 20x Optical Zoom',
    'Omnidirectional Microphone & Expansion Speakerphone',
    'USB Plug & Play (Universal Zoom, Meet & Teams)',
    'Remote IR Control (Pan, Tilt, Zoom & Preset Position)'
  ],
  sections: {
    wifi: {
      id: 'hardware-setup',
      title: 'Koneksi Kabel USB Hardware Lumens ke Laptop Rapat',
      tabLabel: '1. Koneksi Hardware USB',
      iconName: 'Tv',
      badge: 'Hardware USB',
      commonSteps: [
        {
          title: 'Langkah 1: Menghubungkan Kabel USB Utama Lumens ke Laptop',
          description: 'Sistem Video Conference Lumens menggunakan koneksi USB terintegrasi untuk mengirim data video kamera dan audio mikrofon sekaligus.',
          details: [
            'Hubungkan adaptor daya (Power Adapter) kamera PTZ Lumens & Speakerphone ke stopkontak listrik.',
            'Tancapkan kabel USB utama (USB 3.0 Type-A) dari hub Lumens ke port USB laptop rapat kamu.',
            'Lampu indikator LED pada kamera Lumens akan menyala (biru/hijau) menandakan sistem siap digunakan.'
          ],
          tip: 'Gunakan port USB 3.0 (berwarna biru pada laptop) untuk mentransfer video HD dengan kualitas paling jernih tanpa kerekatan.'
        },
        {
          title: 'Langkah 2: Menempatkan Speakerphone Omnidirectional di Meja Rapat',
          description: 'Letakkan unit Speakerphone Lumens di tengah meja rapat.',
          details: [
            'Mikrofon omnidirectional Lumens dapat menangkap suara dari radius 360 derajat hingga jarak 5–8 meter.',
            'Pastikan tidak ada dokumen atau botol air yang menutupi bagian kisi mikrofon.'
          ]
        }
      ]
    },
    bluetooth: {
      id: 'software-config',
      title: 'Pengaturan Camera & Audio pada Zoom, Google Meet & MS Teams',
      tabLabel: '2. Setup Software Zoom & Meet',
      iconName: 'Share2',
      badge: 'Setup App',
      commonSteps: [
        {
          title: 'Langkah 1: Pengaturan Kamera & Audio pada Zoom Meeting',
          description: 'Buka aplikasi Zoom di laptop kamu > Masuk ke [Settings] (Ikon Roda Gigi):',
          details: [
            'Menu [Video] > Kamera: Pilih [Lumens VC Camera / USB Camera].',
            'Menu [Audio] > Speaker: Pilih [Lumens Audio Speakerphone].',
            'Menu [Audio] > Microphone: Pilih [Lumens Audio Speakerphone].'
          ],
          tip: 'Tekan tombol [Test Speaker & Microphone] di Zoom untuk memastikan suara peserta di ruang rapat dan peserta online terdengar dengan jelas.'
        },
        {
          title: 'Langkah 2: Pengaturan pada Google Meet & Microsoft Teams',
          description: 'Di Google Meet / MS Teams, masuk ke menu [Settings] > [Audio & Video Devices]:',
          details: [
            'Video Device: Pilih [Lumens PTZ Camera].',
            'Audio Device: Pilih [Lumens Speakerphone].'
          ]
        }
      ]
    },
    finish: {
      id: 'ptz-remote-control',
      title: 'Penggunaan Remote Control PTZ (Pan-Tilt-Zoom) & Preset Position',
      tabLabel: '3. Remote Control & Preset Camera',
      iconName: 'CheckCircle2',
      badge: 'Remote PTZ',
      commonSteps: [
        {
          title: 'Langkah 1: Mengontrol Arah Kamera Lumens (Pan, Tilt, Zoom)',
          description: 'Gunakan Remote IR Control Lumens untuk mengarahkan lensa kamera rapat:',
          details: [
            'Tombol Pan (Panah Kiri/Kanan): Menggeser kamera ke sudut kiri atau kanan ruang rapat.',
            'Tombol Tilt (Panah Atas/Bawah): Mengarahkan kamera ke atas atau ke bawah.',
            'Tombol Zoom (+ / -): Meng-zoom in hingga 20x optical zoom untuk memperjelas wajah pembicara atau teks di papan tulis.'
          ]
        },
        {
          title: 'Langkah 2: Menggunakan Fitur Preset Memory Position (Tombol Angka 1-6)',
          description: 'Sistem Lumens memiliki fitur simpan sudut pandang kamera (Preset):',
          details: [
            'Tekan tombol angka [1] di remote: Kamera akan otomatis bergerak menyorot Meja Utama Rapat.',
            'Tekan tombol angka [2]: Kamera otomatis mengarah ke Papan Tulis / Layar Presentasi.',
            'Tekan tombol angka [3]: Kamera otomatis mengarah ke Podium / Pembicara Utama.'
          ],
          tip: 'Untuk menyimpan posisi kamera baru: Arahkan kamera > Tekan tombol [Set Preset] > Tekan Angka [1-6].'
        },
        {
          title: 'Langkah 3: Penggunaan Tombol Mute Mic pada Speakerphone',
          description: 'Jika peserta di ruang rapat perlu berdiskusi secara internal tanpa didengar peserta online:',
          details: [
            'Tekan tombol berikon [Microphone Mute] pada unit Speakerphone Lumens atau remote.',
            'Lampu LED pada speakerphone akan berubah menjadi merah (Mute aktif).'
          ]
        }
      ]
    }
  },
  faqs: [
    {
      question: 'Mengapa kamera Lumens tidak muncul di daftar Video Zoom / Meet?',
      answer: 'Pastikan kabel USB Lumens telah tercolok kencang dan adaptor listrik kamera menyala. Jika kamera baru dinyalakan, tunggu sekitar 10 detik hingga proses selftest rotasi awal kamera selesai.'
    },
    {
      question: 'Mengapa terjadi suara gema (echo) saat rapat berlangsung?',
      answer: 'Pastikan baik Microphone maupun Speaker di pengaturan Zoom/Meet sama-sama mengarah ke perangkat Lumens Audio Speakerphone, bukan tercampur dengan speaker bawaan laptop.'
    },
    {
      question: 'Berapa jarak jangkauan mikrofon Lumens?',
      answer: 'Mikrofon omnidirectional Lumens dapat menangkap suara dengan jernih dari seluruh arah dalam radius hingga 6–8 meter di dalam ruang rapat.'
    }
  ]
};
