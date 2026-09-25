import React, { useState, useMemo } from 'react';
import { ChevronDown, HelpCircle, Search, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FAQItem } from '../types/device';

export interface ExtendedFaqItem extends FAQItem {
  targetName?: string;
  categorySlug?: string;
  deviceSlug?: string;
}

interface AccordionFaqProps {
  items: FAQItem[];
  allDeviceFaqs?: ExtendedFaqItem[];
  title?: string;
  subtitle?: string;
  searchable?: boolean;
}

export const AccordionFaq: React.FC<AccordionFaqProps> = ({
  items,
  allDeviceFaqs,
  title = 'FAQ (Frequently Asked Questions)',
  subtitle = 'Pertanyaan umum yang sering ditanyakan seputar pengoperasian perangkat.',
  searchable = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'all'>('general');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const hasDeviceFaqs = allDeviceFaqs && allDeviceFaqs.length > 0;

  // Active items based on tab
  const baseItems: ExtendedFaqItem[] = useMemo(() => {
    if (!hasDeviceFaqs || activeTab === 'general') {
      return items.map((it) => ({ ...it, targetName: it.device_id ? undefined : 'FAQ Umum' }));
    }
    return [
      ...items.map((it) => ({ ...it, targetName: 'FAQ Umum' })),
      ...allDeviceFaqs,
    ];
  }, [items, allDeviceFaqs, activeTab, hasDeviceFaqs]);

  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return baseItems;
    return baseItems.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        (item.targetName && item.targetName.toLowerCase().includes(q))
    );
  }, [baseItems, searchQuery]);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40 rounded-2xl p-5 sm:p-7 backdrop-blur-sm shadow-sm transition-colors space-y-5">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
          </div>
          {subtitle && <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
        </div>

        {/* Tab Switcher if has device FAQs */}
        {hasDeviceFaqs && (
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl shrink-0 self-start md:self-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('general');
                setOpenIndex(0);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'general'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              FAQ Umum ({items.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setOpenIndex(0);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Semua FAQ ({items.length + allDeviceFaqs.length})
            </button>
          </div>
        )}
      </div>

      {/* Search Input Bar (when searchable is true) */}
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // Auto-expand first result when typing
              setOpenIndex(0);
            }}
            placeholder="Cari pertanyaan, kendala Wi-Fi, printer macet, scan..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Hapus pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Search Indicator info */}
      {isSearching && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Hasil pencarian untuk &ldquo;<span className="text-blue-600 font-semibold">{searchQuery}</span>&rdquo;:
          </span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {filteredItems.length} ditemukan
          </span>
        </div>
      )}

      {/* Accordion List */}
      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {filteredItems.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <HelpCircle className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Tidak ada pertanyaan yang sesuai dengan kata kunci &ldquo;{searchQuery}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Tampilkan semua FAQ
            </button>
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            // When actively searching, expand all matching items by default
            const isOpen = isSearching || openIndex === idx;

            return (
              <div key={item.id || idx} className="py-3.5 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="flex w-full items-start justify-between gap-4 text-left font-semibold text-sm sm:text-base text-slate-800 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition-colors py-1 group"
                >
                  <div className="space-y-1">
                    {item.targetName && (
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 mr-2">
                        {item.targetName}
                      </span>
                    )}
                    <span className="leading-snug">{item.question}</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 mt-1 ${
                      isOpen ? 'rotate-180 text-blue-500' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-3.5 border-l-2 border-blue-500 py-1 space-y-2">
                    <p className="whitespace-pre-line">{item.answer}</p>
                    {item.categorySlug && item.deviceSlug && (
                      <div className="pt-1">
                        <Link
                          to={`/docs/${item.categorySlug}/${item.deviceSlug}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <span>Buka panduan {item.targetName} lengkap</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
