import { Device } from '../../types/device';

export const shareLinkGuide: Device = {
  id: 'share-link-guide',
  name: 'Panduan Pembagian Link & Hak Akses Dokumen',
  category: 'Pembagian Link Dokumen',
  categorySlug: 'share-link',
  description: 'Panduan lengkap cara mengatur siapa yang punya akses (Anyone with link atau Restricted), menentukan level izin (Viewer, Commenter, atau Editor), dan menyalin link (Google Docs, Sheet, Slide, OneDrive, MS Office).',
  status: 'Ready',
  specs: ['Berlaku Lintas Platform (Windows & Mac)', 'Google Docs / Sheets / Slides', 'OneDrive & MS Office 365', 'Fitur Copy Link & Proteksi Download'],
  sections: {
    wifi: {
      id: 'access-scope',
      title: 'Membuka Menu Share & Memilih Siapa Yang Punya Akses',
      tabLabel: '1. Hak Akses (Anyone / Restricted)',
      iconName: 'Share2',
      badge: 'Cakupan Akses',
      commonSteps: [
        {
          title: 'Langkah 1: Membuka Tombol "Share" (Bagikan)',
          description: 'Buka dokumen yang ingin kamu bagikan (Google Docs, Sheets, Slides, Word/Excel Online, atau OneDrive).',
          details: [
            'Di pojok kanan atas layar dokumen, klik tombol berwarna biru atau abu-abu bertuliskan [Share] (Bagikan).',
            'Kotak dialog pop-up pengaturan hak akses akan terbuka di tengah layar.'
          ],
          tip: 'Panduan ini berlaku sama untuk semua sistem operasi (Windows, macOS, Linux, Android, iOS) karena berbasis web browser.'
        },
        {
          title: 'Langkah 2: Memilih Siapa Yang Punya Akses (Access Scope)',
          description: 'Pilih cakupan jangkauan penerima link dokumen:',
          details: [
            'Opsi 1 - Restricted (Dibatasi): Hanya orang atau alamat email spesifik yang kamu tambahkan secara manual yang bisa membuka file. Pilihan paling aman untuk dokumen sensitif/keuangan kantor.',
            'Opsi 2 - Anyone with the link (Siapa saja yang memiliki link): Siapa pun yang mendapatkan URL link tersebut dapat langsung membuka dokumen tanpa perlu meminta izin akses.',
            'Opsi 3 - Target Domain Kantor (Misal: Anyone in Organization): Hanya rekan kerja yang menggunakan email domain resmi kantor yang bisa mengakses.'
          ],
          warning: 'Hindari memilih "Anyone with the link" untuk dokumen rahasia keuangan, gaji, atau data pribadi pegawai.'
        }
      ]
    },
    bluetooth: {
      id: 'permission-level',
      title: 'Menentukan Level Izin (Viewer, Commenter, atau Editor)',
      tabLabel: '2. Level Izin (Viewer/Commenter/Editor)',
      iconName: 'Lock',
      badge: 'Level Izin',
      commonSteps: [
        {
          title: 'Langkah 1: Menentukan Level Izin Hak Akses',
          description: 'Tentukan apa yang boleh dilakukan oleh penerima link pada dokumen kamu:',
          details: [
            '👁️ Viewer (Penglihat): Penerima hanya dapat membaca dan melihat isi dokumen. Tidak bisa mengedit, menambah baris, atau membuat komentar.',
            '💬 Commenter (Pemberi Komentar): Penerima bisa melihat isi dokumen dan menambahkan catatan masukan (komentar/suggesting mode) tanpa bisa mengubah teks utama.',
            '✏️ Editor (Pengedit): Penerima memiliki hak akses penuh untuk mengubah teks, menghapus file, menambah data, dan menyetujui masukan.'
          ],
          tip: 'Untuk dokumen laporan final yang hanya perlu dibaca oleh atasan/klien, pilih level "Viewer".'
        }
      ]
    },
    finish: {
      id: 'copy-link',
      title: 'Menyalin Link (Copy Link) & Fitur Keamanan',
      tabLabel: '3. Copy Link & Keamanan',
      iconName: 'CheckCircle2',
      badge: 'Salin Link',
      commonSteps: [
        {
          title: 'Langkah 1: Klik Tombol "Copy Link" (Salin Link)',
          description: 'Salin URL link dokumen yang sudah dikonfigurasi hak aksesnya.',
          details: [
            'Klik tombol [Copy Link] (Salin Link) di bagian bawah kotak dialog Share.',
            'Akan muncul notifikasi tulisan "Link copied to clipboard".',
            'Tempel (Paste / Ctrl+V / ⌘+V) link tersebut pada pesan WhatsApp, Email, atau Slack kantor kamu.'
          ],
          codeSnippet: 'https://docs.google.com/document/d/1A2B3C4D5E6F/edit?usp=sharing'
        },
        {
          title: 'Langkah 2: Mencegah Download, Print, dan Copy (Proteksi Dokumen)',
          description: 'Lindungi dokumen rahasia agar pengakses tidak bisa mengunduh atau mencetak file.',
          details: [
            'Pada menu Share, klik ikon Roda Gigi (Settings) di pojok kanan atas pop-up.',
            'Hilangkan centang pada opsi "Viewers and commenters can see the option to download, print, and copy".',
            'Klik Simpan (Done).'
          ]
        },
        {
          title: 'Langkah 3: Menghapus / Mengubah Akses Link di Kemudian Hari',
          description: 'Jika proyek sudah selesai, kamu bisa mencabut kembali hak akses link.',
          details: [
            'Buka kembali tombol [Share].',
            'Ubah status "Anyone with the link" kembali menjadi "Restricted".',
            'Link lama yang sudah tersebar secara otomatis tidak akan bisa dibuka lagi.'
          ]
        }
      ]
    }
  },
  faqs: [
    {
      question: 'Apakah penerima link memerlukan akun Google / Microsoft untuk membuka file?',
      answer: 'Jika diatur sebagai "Anyone with the link", penerima TIDAK wajib login. Namun jika diatur sebagai "Restricted", penerima wajib login dengan alamat email yang diundang.'
    },
    {
      question: 'Bagaimana cara mengetahui siapa saja yang sedang membuka dokumen?',
      answer: 'Di pojok kanan atas layar dokumen (Google Docs/OneDrive), akan muncul foto profil atau ikon avatar anonim dari orang-orang yang sedang aktif melihat dokumen.'
    },
    {
      question: 'Dapatkah saya membatalkan pengeditan yang salah dilakukan oleh Editor?',
      answer: 'Bisa. Kamu bisa menggunakan fitur Version History (File > Version History > See version history) untuk mengembalikan dokumen ke versi sebelum diubah.'
    }
  ]
};
