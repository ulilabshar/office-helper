import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';
import { Search, X, Printer, ChevronRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { searchDevices } = useCatalog();

  const results = searchDevices(query);

  // Automatically reset search query whenever modal is closed
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  const handleCloseModal = () => {
    setQuery('');
    onClose();
  };

  const handleSelect = (categorySlug: string, deviceId: string) => {
    handleCloseModal();
    navigate(`/docs/${categorySlug}/${deviceId}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-md"
      onClick={handleCloseModal}
    >
      <div
        className="w-full max-w-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik nama printer, Wi-Fi, Bluetooth, atau dokumen..."
            className="w-full bg-transparent py-3.5 px-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={handleCloseModal}
            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded"
            title="Tutup Pencarian"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Ketik kata kunci untuk mencari dokumentasi panduan alat kantor.
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Tidak ditemukan panduan untuk "{query}".
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Hasil Perangkat Ditemukan ({results.length})
              </div>
              {results.map((device) => (
                <button
                  key={device.id}
                  onClick={() => handleSelect(device.categorySlug, device.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-50 text-blue-600 dark:bg-blue-600/10 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                      <Printer className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {device.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                        {device.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500">
          <span>Tekan ESC atau klik luar untuk menutup</span>
          <span className="font-mono">Office Docs Search</span>
        </div>
      </div>
    </div>
  );
};
