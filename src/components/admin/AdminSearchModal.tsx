import React, { useState, useEffect, useMemo } from 'react';
import { Device, Category, FAQItem, SetupStep } from '../../types/device';
import { AdminTab } from '../../types/admin';
import {
  Search,
  X,
  HardDrive,
  BookOpenCheck,
  HelpCircle,
  FolderTree,
  ChevronDown,
  Edit3,
  ArrowRight,
  PlusCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface FlattenedStep extends SetupStep {
  deviceName: string;
  deviceCategory: string;
  deviceSlug: string;
  categorySlug: string;
}

interface FlattenedFaq extends FAQItem {
  targetName: string;
  isGeneral: boolean;
}

interface AdminSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: Device[];
  categories: Category[];
  steps: FlattenedStep[];
  faqs: FlattenedFaq[];
  onEditDevice: (device: Device) => void;
  onEditStep: (step: SetupStep) => void;
  onEditFaq: (faq: FAQItem, deviceId?: string | null) => void;
  onEditCategory: (category: Category) => void;
  onNavigateTab: (tab: AdminTab) => void;
  onOpenCreate: (type: 'device' | 'step' | 'faq' | 'category') => void;
}

export const AdminSearchModal: React.FC<AdminSearchModalProps> = ({
  isOpen,
  onClose,
  devices,
  categories,
  steps,
  faqs,
  onEditDevice,
  onEditStep,
  onEditFaq,
  onEditCategory,
  onNavigateTab,
  onOpenCreate,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'devices' | 'guides' | 'faq' | 'categories'>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

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

  // Filter Devices
  const filteredDevices = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return devices.slice(0, 4);
    return devices.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        (d.specs && d.specs.some((s) => s.toLowerCase().includes(q)))
    );
  }, [devices, query]);

  // Filter Steps / Guides
  const filteredSteps = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return steps.slice(0, 4);
    return steps.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        s.deviceName.toLowerCase().includes(q) ||
        (s.konten_windows && s.konten_windows.toLowerCase().includes(q)) ||
        (s.konten_mac && s.konten_mac.toLowerCase().includes(q))
    );
  }, [steps, query]);

  // Filter FAQs (General & Device specific)
  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs.slice(0, 4);
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.targetName.toLowerCase().includes(q)
    );
  }, [faqs, query]);

  // Filter Categories
  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories.slice(0, 4);
    return categories.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, query]);

  if (!isOpen) return null;

  const isSearching = query.trim().length > 0;
  const totalCount =
    filteredDevices.length + filteredSteps.length + filteredFaqs.length + filteredCategories.length;

  const handleClose = () => {
    setQuery('');
    setExpandedFaqId(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-16 px-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in-50 zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 gap-3 shrink-0">
          <Search className="h-5 w-5 text-blue-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setExpandedFaqId(null);
            }}
            placeholder="Cari perangkat, panduan langkah, FAQ kantor, atau kategori..."
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
              title="Hapus pencarian"
            >
              Clear
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Tutup Pencarian"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Tabs Bar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800/80 text-xs shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              Semua ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('devices')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 whitespace-nowrap ${
                activeFilter === 'devices'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <HardDrive className="h-3 w-3" />
              <span>Perangkat ({filteredDevices.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('guides')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 whitespace-nowrap ${
                activeFilter === 'guides'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpenCheck className="h-3 w-3" />
              <span>Panduan ({filteredSteps.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('faq')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 whitespace-nowrap ${
                activeFilter === 'faq'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="h-3 w-3" />
              <span>FAQ ({filteredFaqs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('categories')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 whitespace-nowrap ${
                activeFilter === 'categories'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <FolderTree className="h-3 w-3" />
              <span>Kategori ({filteredCategories.length})</span>
            </button>
          </div>

          <span className="text-[10px] text-slate-400 hidden md:inline ml-2">
            {isSearching ? 'Live Results' : 'Rekomendasi'}
          </span>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-3 sm:p-4 space-y-4 flex-1">
          {totalCount === 0 ? (
            <div className="py-10 text-center space-y-3">
              <Search className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tidak ada data dashboard yang cocok dengan &ldquo;{query}&rdquo;.
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Anda dapat menambahkan perangkat baru, langkah panduan, atau FAQ secara langsung.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onOpenCreate('device');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  + Tambah Perangkat
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onOpenCreate('faq');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  + Tambah FAQ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onOpenCreate('step');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  + Tambah Langkah
                </button>
              </div>
            </div>
          ) : null}

          {/* Section: FAQ Results */}
          {(activeFilter === 'all' || activeFilter === 'faq') && filteredFaqs.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
                  FAQ &amp; Tanya Jawab ({filteredFaqs.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onNavigateTab('faq');
                  }}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Ke Menu FAQ</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-2">
                {filteredFaqs.map((faq, idx) => {
                  const faqKey = faq.id || `admin-faq-${idx}`;
                  const isExpanded = isSearching || expandedFaqId === faqKey;

                  return (
                    <div
                      key={faqKey}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-blue-400/60 dark:hover:border-blue-500/60 transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaqId(isExpanded ? null : faqKey)}
                        className="w-full flex items-start justify-between gap-3 text-left group"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                            <HelpCircle className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  faq.isGeneral
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                }`}
                              >
                                {faq.targetName}
                              </span>
                            </div>
                            <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug">
                              {faq.question}
                            </span>
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-slate-400 shrink-0 mt-1 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-blue-500' : ''
                          }`}
                        />
                      </button>

                      {/* Expanded Answer Body & Action Buttons */}
                      {isExpanded && (
                        <div className="mt-2.5 ml-9 pl-3.5 border-l-2 border-blue-500 space-y-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          <p className="whitespace-pre-line">{faq.answer}</p>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                handleClose();
                                onEditFaq(faq, faq.device_id);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors"
                            >
                              <Edit3 className="h-3 w-3" />
                              <span>Ubah FAQ</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleClose();
                                onNavigateTab('faq');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                            >
                              <span>Buka di Menu FAQ</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Devices Results */}
          {(activeFilter === 'all' || activeFilter === 'devices') && filteredDevices.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-blue-500" />
                  Perangkat ({filteredDevices.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onNavigateTab('devices');
                  }}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Ke Menu Devices</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-2">
                {filteredDevices.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-blue-400/60 dark:hover:border-blue-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                        <HardDrive className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {d.name}
                          </h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {d.category}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              d.status === 'Ready'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                            }`}
                          >
                            {d.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {d.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          handleClose();
                          onEditDevice(d);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Ubah</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleClose();
                          onNavigateTab('devices');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span>Kelola</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Guides / Steps Results */}
          {(activeFilter === 'all' || activeFilter === 'guides') && filteredSteps.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpenCheck className="h-3.5 w-3.5 text-blue-500" />
                  Langkah Panduan Setup ({filteredSteps.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onNavigateTab('guides');
                  }}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Ke Menu Guides</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-2">
                {filteredSteps.map((step, idx) => (
                  <div
                    key={step.id || `admin-step-${idx}`}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-blue-400/60 dark:hover:border-blue-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs shrink-0 mt-0.5">
                        #{step.sort_order ?? idx + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {step.deviceName}
                          </span>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {step.title}
                          </h4>
                        </div>
                        {step.description && (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {step.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1">
                          {step.konten_windows && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                              Windows ✓
                            </span>
                          )}
                          {step.konten_mac && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                              macOS ✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          handleClose();
                          onEditStep(step);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Ubah Langkah</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleClose();
                          onNavigateTab('guides');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span>Buka</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Categories Results */}
          {(activeFilter === 'all' || activeFilter === 'categories') && filteredCategories.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderTree className="h-3.5 w-3.5 text-blue-500" />
                  Kategori Alat ({filteredCategories.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onNavigateTab('categories');
                  }}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Ke Menu Kategori</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-2">
                {filteredCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-blue-400/60 dark:hover:border-blue-500/60 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                        <FolderTree className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {cat.title}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400">/{cat.slug}</span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">{cat.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          handleClose();
                          onEditCategory(cat);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Ubah</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleClose();
                          onNavigateTab('categories');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span>Kelola</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
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
          <span className="text-slate-400">Pencarian Dashboard Admin &bull; Office Helper</span>
        </div>
      </div>
    </div>
  );
};
