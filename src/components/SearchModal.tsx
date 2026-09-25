import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';
import { slugify } from '../utils/slugify';
import { FAQItem } from '../types/device';
import {
  Search,
  X,
  Printer,
  ChevronRight,
  ChevronDown,
  Monitor,
  Share2,
  Video,
  Fingerprint,
  FileText,
  Sparkles,
  HelpCircle,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchableFaqItem extends FAQItem {
  targetName: string;
  categorySlug?: string;
  deviceSlug?: string;
  isGeneral: boolean;
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'devices' | 'faq'>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { devices, generalFaqs } = useCatalog();

  // Reset state saat modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveFilter('all');
      setExpandedFaqId(null);
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

  // Semua FAQ (General + Device Specific)
  const allFaqs: SearchableFaqItem[] = useMemo(() => {
    const list: SearchableFaqItem[] = [];

    // 1. FAQ Umum (Beranda)
    (generalFaqs || []).forEach((gf, idx) => {
      list.push({
        ...gf,
        id: gf.id || `gfaq-${idx}`,
        targetName: 'FAQ Umum',
        isGeneral: true,
      });
    });

    // 2. FAQ Perangkat
    devices.forEach((d) => {
      (d.faqs || []).forEach((df, idx) => {
        list.push({
          ...df,
          id: df.id || `dfaq-${d.id}-${idx}`,
          targetName: d.name,
          categorySlug: d.categorySlug,
          deviceSlug: d.slug || slugify(d.name),
          isGeneral: false,
        });
      });
    });

    return list;
  }, [generalFaqs, devices]);

  // Live real-time search / filtering perangkat
  const filteredDevices = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
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

  // Live real-time search / filtering FAQ
  const filteredFaqs = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      // Saat query kosong: tampilkan FAQ umum utama
      return allFaqs.slice(0, 4);
    }
    return allFaqs.filter(
      (f) =>
        f.question.toLowerCase().includes(trimmed) ||
        f.answer.toLowerCase().includes(trimmed) ||
        f.targetName.toLowerCase().includes(trimmed)
    );
  }, [allFaqs, query]);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    setQuery('');
    setExpandedFaqId(null);
    onClose();
  };

  const handleSelectDevice = (categorySlug: string, deviceSlug: string) => {
    handleCloseModal();
    navigate(`/docs/${categorySlug}/${deviceSlug}`);
  };

  const isSearching = query.trim().length > 0;
  const totalResults = filteredDevices.length + filteredFaqs.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 bg-slate-900/60 transition-opacity"
      onClick={handleCloseModal}
    >
      <div
        className="w-full max-w-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-150 animate-in fade-in-50 zoom-in-95 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 gap-3 shrink-0">
          <Search className="h-5 w-5 text-blue-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setExpandedFaqId(null);
            }}
            placeholder="Cari panduan perangkat, FAQ, kendala Wi-Fi, printer..."
            className="w-full bg-transparent py-1 text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setExpandedFaqId(null);
              }}
              className="px-2 py-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded text-xs font-semibold"
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

        {/* Filter Tabs Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800/80 text-xs shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              Semua ({isSearching ? totalResults : filteredDevices.length + filteredFaqs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('devices')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                activeFilter === 'devices'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="h-3 w-3" />
              <span>Panduan ({filteredDevices.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('faq')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                activeFilter === 'faq'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="h-3 w-3" />
              <span>FAQ ({filteredFaqs.length})</span>
            </button>
          </div>

          <span className="text-[10px] text-slate-400 hidden sm:inline">
            {isSearching ? 'Hasil instan' : 'Rekomendasi'}
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-4 flex-1">
          {/* Empty State */}
          {((activeFilter === 'all' && totalResults === 0) ||
            (activeFilter === 'devices' && filteredDevices.length === 0) ||
            (activeFilter === 'faq' && filteredFaqs.length === 0)) && (
            <div className="py-12 px-4 text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                <Search className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Tidak ada hasil yang cocok
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Kata kunci &ldquo;<span className="text-blue-500">{query}</span>&rdquo; tidak ditemukan di panduan maupun FAQ. Coba ketik kata kunci lain seperti Wi-Fi, Printer, atau Mac.
              </p>
            </div>
          )}

          {/* Section: Panduan Perangkat */}
          {(activeFilter === 'all' || activeFilter === 'devices') && filteredDevices.length > 0 && (
            <div className="space-y-2">
              {activeFilter === 'all' && (
                <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                  <span>Panduan Perangkat ({filteredDevices.length})</span>
                </div>
              )}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/30">
                {filteredDevices.map((device) => {
                  const IconComponent = getDeviceIcon(device.categorySlug);
                  return (
                    <button
                      key={device.id}
                      onClick={() =>
                        handleSelectDevice(
                          device.categorySlug,
                          device.slug || slugify(device.name)
                        )
                      }
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-blue-50/60 dark:hover:bg-slate-800/70 transition-colors group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100/70 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                              {device.name}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
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
                })}
              </div>
            </div>
          )}

          {/* Section: FAQ / Tanya Jawab */}
          {(activeFilter === 'all' || activeFilter === 'faq') && filteredFaqs.length > 0 && (
            <div className="space-y-2">
              {activeFilter === 'all' && (
                <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                  <span>Tanya Jawab &amp; FAQ ({filteredFaqs.length})</span>
                </div>
              )}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/30">
                {filteredFaqs.map((faq, idx) => {
                  const faqKey = faq.id || `search-faq-${idx}`;
                  const isExpanded = expandedFaqId === faqKey;

                  return (
                    <div
                      key={faqKey}
                      className="p-3 transition-colors hover:bg-slate-100/60 dark:hover:bg-slate-800/50"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaqId(isExpanded ? null : faqKey)}
                        className="w-full flex items-start justify-between gap-3 text-left group"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100/70 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 shrink-0 mt-0.5">
                            <HelpCircle className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  faq.isGeneral
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50'
                                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50'
                                }`}
                              >
                                {faq.targetName}
                              </span>
                            </div>
                            <h5 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                              {faq.question}
                            </h5>
                            {!isExpanded && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                {faq.answer}
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-slate-400 shrink-0 mt-1 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-blue-500' : ''
                          }`}
                        />
                      </button>

                      {/* Expanded Answer Body */}
                      {isExpanded && (
                        <div className="mt-3 ml-11 pl-3.5 border-l-2 border-blue-500 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          <p className="whitespace-pre-line">{faq.answer}</p>
                          {faq.categorySlug && faq.deviceSlug ? (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => handleSelectDevice(faq.categorySlug!, faq.deviceSlug!)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                <span>Buka panduan {faq.targetName} lengkap</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  handleCloseModal();
                                  navigate('/#faq-section');
                                  setTimeout(() => {
                                    document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
                                  }, 100);
                                }}
                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                <span>Lihat di bagian FAQ Beranda</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer info & shortcut */}
        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
              ESC
            </span>
            <span>untuk keluar</span>
          </div>
          <span className="text-slate-400">Live Search &bull; Panduan &amp; FAQ</span>
        </div>
      </div>
    </div>
  );
};
