import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface CrudModalProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}

export const CrudModal: React.FC<CrudModalProps> = ({
  title,
  subtitle,
  isOpen,
  onClose,
  children,
  wide,
}) => {
  // Prevent background scrolling while modal is active on mobile/desktop
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain">
      {/* Backdrop with touch dismiss */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Sheet */}
      <div
        className={`relative w-full ${
          wide ? 'max-w-3xl' : 'max-w-xl'
        } max-h-[92dvh] sm:max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl z-10 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95`}
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="pt-2.5 pb-1 sm:hidden flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs shrink-0">
          <div className="min-w-0 pr-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] -mr-2 -mt-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Tutup Form"
            aria-label="Tutup form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable with Momentum Touch */}
        <div className="overflow-y-auto overscroll-contain flex-1 p-4 sm:p-6 text-slate-900 dark:text-slate-100">
          {children}
        </div>
      </div>
    </div>
  );
};

export const fieldClass =
  'w-full px-3.5 py-3 sm:py-2.5 text-base sm:text-sm bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-[0_6px_20px_rgba(37,99,235,0.12)] focus:-translate-y-0.5 transition-all duration-200';

export const labelClass = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-0.5';
