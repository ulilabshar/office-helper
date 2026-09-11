import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';
import {
  Search,
  X,
  Printer,
  ChevronRight,
  Monitor,
  Share2,
  Video,
  Fingerprint,
  FileText,
  Sparkles,
  Command,
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getDeviceIcon = (categorySlug: string) => {
  switch (categorySlug) {
    case 'printer':
      return Printer;
    case 'share-link':
      return Share2;
    case 'proyektor':
      return Monitor;
    case 'video-conference':
      return Video;
    case 'mesin-absensi':
      return Fingerprint;
    default:
      return FileText;
  }
};

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { devices, categories } = useCatalog();

  // Reset search query saat modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut Ctrl+K dan Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Live real-time search / filtering
  const filteredDevices = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      // Saat kosong: Tampilkan seluruh daftar perangkat (default/rekomendasi)
      return devices;
    }
    return devices.filter(
      (d) =>
        d.name.toLowerCase().includes(trimmed) ||
        d.description.toLowerCase().includes(trimmed) ||
        d.category.toLowerCase().includes(trimmed) ||
        (d.specs && d.specs.some((s) => s.toLowerCase().includes(trimmed)))
    );
  }, [devices, query]);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    setQuery('');
    onClose();
  };

  const handleSelect = (categorySlug: string, deviceId: string) => {
    handleCloseModal();
    navigate(`/docs/${categorySlug}/${deviceId}`);
  };

  const isSearching = query.trim().length > 0;

  return (
    /* Backdrop TANPA efek blur (Hapus backdrop-blur sepenuhnya) */
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-slate-900/60 transition-opacity"
      onClick={handleCloseModal}
    >
      <div
        className="w-full max-w-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-150 animate-in fade-in-50 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 gap-3">
          <Search className="h-5 w-5 text-blue-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari perangkat, panduan, printer, Wi-Fi, dokumen..."
            className="w-full bg-transparent py-1 text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded text-xs"
              title="Hapus ketikan"
            >
              Clear
            </button>
          )}
          <button
            onClick={handleCloseModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Tutup Pencarian"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Header Indikator Daftar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            {isSearching ? (
              <>
                <span>Hasil Pencarian:</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  {filteredDevices.length} ditemukan
                </span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Semua Panduan & Rekomendasi ({filteredDevices.length} Perangkat)</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-slate-400">Klik item untuk membuka</span>
        </div>

        {/* Results / Default List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/50">
          {filteredDevices.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                <Search className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Tidak ada panduan yang cocok
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Kata kunci &ldquo;<span className="text-blue-500">{query}</span>&rdquo; tidak ditemukan. Coba ketik nama perangkat lain seperti Epson, Smart TV, atau Dokumen.
              </p>
            </div>
          ) : (
            filteredDevices.map((device) => {
              const IconComponent = getDeviceIcon(device.categorySlug);
              return (
                <button
                  key={device.id}
                  onClick={() => handleSelect(device.categorySlug, device.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-600/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {device.name}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                          {device.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md mt-0.5">
                        {device.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer info & shortcut */}
        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
              ESC
            </span>
            <span>untuk keluar</span>
          </div>
          <span className="text-slate-400">Live Search &bull; Office Helper</span>
        </div>
      </div>
    </div>
  );
};
