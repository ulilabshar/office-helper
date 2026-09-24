import React, { useState, useEffect } from 'react';
import { TargetOS, SetupStep, Device } from '../types/device';
import { OsTabSelector } from './OsTabSelector';
import { extractDeviceSteps } from '../lib/catalog';
import {
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  Terminal,
  Monitor,
  Laptop,
  CheckCircle2,
} from 'lucide-react';

interface StepGuideProps {
  steps?: SetupStep[];
  sections?: Device['sections'];
  showOsSelector?: boolean;
}

export const StepGuide: React.FC<StepGuideProps> = ({
  steps,
  sections,
  showOsSelector = true,
}) => {
  const [selectedOS, setSelectedOS] = useState<TargetOS>('windows');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Normalisasikan daftar langkah dari steps atau fallback sections
  const allSteps: SetupStep[] =
    steps && steps.length > 0
      ? steps
      : sections
      ? extractDeviceSteps({ sections } as Device)
      : [];

  const clearSelection = () => {
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
  };

  // Reset copy state and clear text selection saat panduan berganti
  useEffect(() => {
    setCopiedSnippet(null);
    clearSelection();
  }, [steps, sections]);

  // Reset copy state saat berganti OS
  useEffect(() => {
    setCopiedSnippet(null);
    clearSelection();
  }, [selectedOS]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(text);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  // Periksa apakah ada langkah yang memiliki instruksi spesifik untuk Windows / Mac
  const hasAnyOsSteps = allSteps.some((s) => {
    const hasWin = Boolean(s.konten_windows && s.konten_windows.trim());
    const hasMac = Boolean(s.konten_mac && s.konten_mac.trim());
    if (hasWin && hasMac && s.konten_windows?.trim() !== s.konten_mac?.trim()) return true;
    if (s.osTarget && s.osTarget !== 'all') return true;
    return false;
  });

  const getStepLines = (step: SetupStep, os: TargetOS): string[] => {
    const osContent = os === 'windows' ? step.konten_windows : step.konten_mac;
    if (osContent && osContent.trim()) {
      return osContent.split('\n').map((l) => l.trim()).filter(Boolean);
    }
    if (step.details && step.details.length > 0) {
      return step.details;
    }
    // Jika hanya ada konten OS lain sebagai fallback
    const otherContent = os === 'windows' ? step.konten_mac : step.konten_windows;
    if (otherContent && otherContent.trim()) {
      return otherContent.split('\n').map((l) => l.trim()).filter(Boolean);
    }
    return [];
  };

  if (allSteps.length === 0) {
    return (
      <div className="border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40 rounded-2xl p-8 text-center text-slate-500">
        <CheckCircle2 className="h-8 w-8 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-semibold">Langkah panduan belum tersedia untuk perangkat ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* OS Selector Bar & Mode Indicator */}
      {showOsSelector && hasAnyOsSteps && (
        <div className="space-y-3">
          <OsTabSelector selectedOS={selectedOS} onSelectOS={setSelectedOS} />
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-blue-200/80 bg-blue-50/70 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300 text-xs">
            <span className="flex items-center gap-2 font-medium">
              {selectedOS === 'windows' ? (
                <>
                  <Monitor className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>
                    Menampilkan instruksi langkah khusus sistem operasi <strong>Windows</strong>.
                  </span>
                </>
              ) : (
                <>
                  <Laptop className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>
                    Menampilkan instruksi langkah khusus sistem operasi <strong>macOS</strong>.
                  </span>
                </>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Main Linear Stepper Container */}
      <div className="border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40 rounded-2xl p-5 sm:p-7 backdrop-blur-sm shadow-sm transition-colors">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Alur Langkah Panduan</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ikuti setiap tahapan di bawah ini secara berurutan ({allSteps.length} langkah).
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {allSteps.length} Langkah
          </span>
        </div>

        {/* Stepper Cards */}
        <div className="space-y-8">
          {allSteps.map((step, idx) => {
            const currentStepNum = idx + 1;
            const lines = getStepLines(step, selectedOS);

            // Bersihkan format judul agar tidak dobel nomor
            const cleanTitle = step.title.replace(/^Langkah\s+\d+[:\s-]*/i, '');
            const displayTitle = `Langkah ${currentStepNum}: ${cleanTitle || step.title}`;

            return (
              <div
                key={idx}
                className="relative pl-7 sm:pl-9 border-l-2 border-blue-500/30 dark:border-blue-500/20 space-y-3 pb-8 last:pb-0"
              >
                {/* Continuous Sequential Step Circle Badge */}
                <div className="absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-black text-xs ring-4 ring-white dark:ring-slate-950 shadow-md">
                  {currentStepNum}
                </div>

                <div className="pt-0.5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    {displayTitle}
                  </h3>
                  {step.description && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  )}
                </div>

                {/* Instruction Lines / Details */}
                {lines.length > 0 && (
                  <div className="space-y-2 my-3 p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Instruksi Pelaksanaan:
                    </div>
                    <ul className="space-y-2">
                      {lines.map((line, lIdx) => {
                        const isNumbered = /^\d+[\.\)]\s*/.test(line);
                        const cleanLine = line.replace(/^\d+[\.\)]\s*/, '').replace(/^[-*]\s*/, '');
                        return (
                          <li
                            key={lIdx}
                            className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                          >
                            {isNumbered ? (
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-bold text-[10px] mt-0.5">
                                {lIdx + 1}
                              </span>
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                            )}
                            <span className="flex-1">{cleanLine}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Code Snippet Box */}
                {step.codeSnippet && (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-900 text-slate-100 dark:border-slate-800 dark:bg-slate-950 p-3 font-mono text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Terminal className="h-4 w-4 text-blue-400 shrink-0" />
                      <span className="break-all">{step.codeSnippet}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(step.codeSnippet!)}
                      className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors shrink-0"
                      title="Salin Teks"
                    >
                      {copiedSnippet === step.codeSnippet ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}

                {/* Tip Box */}
                {step.tip && (
                  <div className="mt-3 flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20 text-xs sm:text-sm">
                    <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold mr-1">Tips:</span>
                      {step.tip}
                    </div>
                  </div>
                )}

                {/* Warning Box */}
                {step.warning && (
                  <div className="mt-3 flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20 text-xs sm:text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold mr-1">Perhatian:</span>
                      {step.warning}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

