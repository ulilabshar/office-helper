import React from 'react';
import { TargetOS } from '../types/device';
import { Monitor, Laptop, CheckCircle2 } from 'lucide-react';

interface OsTabSelectorProps {
  selectedOS: TargetOS;
  onSelectOS: (os: TargetOS) => void;
  className?: string;
}

export const OsTabSelector: React.FC<OsTabSelectorProps> = ({
  selectedOS,
  onSelectOS,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <span>Pilih Sistem Operasi Komputer Kamu:</span>
        </label>
        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
          Instruksi Khusus OS Active
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Windows Tab */}
        <button
          type="button"
          onClick={() => onSelectOS('windows')}
          className={`relative flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left ${
            selectedOS === 'windows'
              ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-600/15 shadow-md shadow-blue-500/10'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700'
          }`}
        >
          <div
            className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg font-bold transition-colors shrink-0 ${
              selectedOS === 'windows'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            <Monitor className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                Windows
              </span>
              {selectedOS === 'windows' && (
                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
              Windows 11, 10, 8.1 (.exe)
            </span>
          </div>
        </button>

        {/* macOS Tab */}
        <button
          type="button"
          onClick={() => onSelectOS('mac')}
          className={`relative flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left ${
            selectedOS === 'mac'
              ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-600/15 shadow-md shadow-indigo-500/10'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700'
          }`}
        >
          <div
            className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg font-bold transition-colors shrink-0 ${
              selectedOS === 'mac'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            <Laptop className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                macOS (Mac)
              </span>
              {selectedOS === 'mac' && (
                <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
              macOS Sequoia, Sonoma, AirPrint (.dmg)
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
