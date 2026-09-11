/**
 * Mengubah teks (misalnya nama perangkat) menjadi slug URL yang bersih dan ramah SEO.
 * Contoh: "Epson EcoTank L3250 Series" -> "epson-ecotank-l3250-series"
 * Contoh: "Interactive Display 75\" Touchscreen" -> "interactive-display-75-touchscreen"
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Ganti karakter non-alfanumerik (termasuk spasi, tanda petik, kurung, garis bawah) menjadi strip (-)
    .replace(/[^a-z0-9]+/g, '-')
    // Hilangkan strip berulang (contoh: --- menjadi -)
    .replace(/-+/g, '-')
    // Hilangkan strip di awal dan akhir string
    .replace(/^-+|-+$/g, '');
}
