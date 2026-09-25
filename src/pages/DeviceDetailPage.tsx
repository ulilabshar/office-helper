import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';
import { StepGuide } from '../components/StepGuide';
import { AccordionFaq } from '../components/AccordionFaq';
import { Printer, ChevronRight, Home, Tag, ArrowLeft, Share2, Maximize2, X } from 'lucide-react';

export const DeviceDetailPage: React.FC = () => {
  const { deviceSlug, deviceId } = useParams<{ deviceSlug?: string; deviceId?: string }>();
  const { getDeviceBySlug, getDeviceById } = useCatalog();

  const slugOrId = deviceSlug || deviceId || '';
  const device = getDeviceBySlug ? getDeviceBySlug(slugOrId) : getDeviceById(slugOrId);

  if (!device) {
    return (
      <div className="py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Panduan Tidak Ditemukan
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Perangkat atau dokumen dengan kata kunci "{slugOrId}" tidak terdaftar dalam sistem.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500"
        >
          <Home className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    );
  }

  const isShareLinkCategory = device.categorySlug === 'share-link';
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Beranda
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            to={`/category/${device.categorySlug}`}
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {device.category}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-900 font-semibold dark:text-slate-100 truncate max-w-[150px] sm:max-w-none">
            {device.name}
          </span>
        </nav>

        <Link
          to={`/category/${device.categorySlug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali</span>
        </Link>
      </div>

      {/* Header Summary Banner */}
      <div className="border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-sm transition-colors space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 shrink-0">
              {isShareLinkCategory ? <Share2 className="h-6 w-6" /> : <Printer className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {device.name}
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                  {device.status}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {device.description}
              </p>
            </div>
          </div>
        </div>

        {/* Technical Specs Summary & Device Image Section */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Poin Penting Panduan */}
            <div className="flex-1 space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Poin Penting Panduan
              </div>
              <div className="flex flex-wrap gap-2">
                {device.specs.map((spec, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-950/80 dark:text-slate-300 dark:border-slate-800"
                  >
                    <Tag className="h-3 w-3 text-blue-500 shrink-0" />
                    <span>{spec}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Gambar dari Database (Paksakan Sesuai Size Bagian) */}
            {device.image && (
              <div className="shrink-0 w-full md:w-64 lg:w-72">
                <div
                  onClick={() => setIsImageModalOpen(true)}
                  className="group relative w-full h-40 sm:h-44 md:h-48 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shadow-xs flex items-center justify-center p-2 cursor-pointer hover:border-blue-500/60 transition-all"
                  title="Klik untuk melihat foto lebih besar"
                >
                  <img
                    src={device.image}
                    alt={device.name}
                    className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-xs font-semibold backdrop-blur-xs shadow-sm">
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span>Perbesar</span>
                    </span>
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900/75 text-white backdrop-blur-xs pointer-events-none">
                    Foto Perangkat
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive Stepper Guide */}
      <StepGuide steps={device.steps} sections={device.sections} />

      {/* Device Specific FAQ */}
      {device.faqs && device.faqs.length > 0 && (
        <AccordionFaq
          items={device.faqs}
          title={`FAQ ${device.name}`}
          subtitle={`Pertanyaan umum dan solusi kendala terkait panduan ${device.name}.`}
        />
      )}

      {/* Lightbox Modal for Full Image Preview */}
      {isImageModalOpen && device.image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-6 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">{device.name}</span>
                <span className="text-xs text-slate-500">&bull; Foto Perangkat</span>
              </div>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] w-full overflow-hidden flex items-center justify-center p-2">
              <img
                src={device.image}
                alt={device.name}
                className="max-h-[68vh] max-w-full w-auto h-auto object-contain rounded-xl shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
