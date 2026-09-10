import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';
import { StepGuide } from '../components/StepGuide';
import { AccordionFaq } from '../components/AccordionFaq';
import { Printer, ChevronRight, Home, Tag, ArrowLeft, Share2 } from 'lucide-react';

export const DeviceDetailPage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const { getDeviceById } = useCatalog();
  const device = getDeviceById(deviceId || '');

  if (!device) {
    return (
      <div className="py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Panduan Tidak Ditemukan
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Perangkat atau dokumen dengan ID "{deviceId}" tidak terdaftar dalam sistem.
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
      <div className="border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-sm transition-colors space-y-4">
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

        {/* Technical Specs Summary Pills */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Poin Penting Panduan
          </div>
          <div className="flex flex-wrap gap-2">
            {device.specs.map((spec, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-950/80 dark:text-slate-300 dark:border-slate-800"
              >
                <Tag className="h-3 w-3 text-blue-500" />
                <span>{spec}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Stepper Guide */}
      <StepGuide sections={device.sections} />

      {/* Device Specific FAQ */}
      {device.faqs && device.faqs.length > 0 && (
        <AccordionFaq
          items={device.faqs}
          title={`FAQ ${device.name}`}
          subtitle="Pertanyaan umum seputar keamanan dan hak akses pembagian link dokumen."
        />
      )}
    </div>
  );
};
