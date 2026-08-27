import React, { useState, useEffect } from 'react';
import { DeviceSection, TargetOS, SetupStep } from '../types/device';
import { OsTabSelector } from './OsTabSelector';
import { Wifi, Bluetooth, CheckCircle2, HelpCircle, AlertTriangle, Lightbulb, Copy, Check, Terminal, Monitor, Laptop, FileText, Lock, Share2 } from 'lucide-react';

interface StepGuideProps {
  sections: {
    wifi: DeviceSection;
    bluetooth: DeviceSection;
    finish: DeviceSection;
    troubleshooting?: DeviceSection;
  };
  showOsSelector?: boolean;
}

export const StepGuide: React.FC<StepGuideProps> = ({ sections, showOsSelector = true }) => {
  const [activeTab, setActiveTab] = useState<'wifi' | 'bluetooth' | 'finish' | 'troubleshooting'>('wifi');
  const [selectedOS, setSelectedOS] = useState<TargetOS>('windows');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const clearSelection = () => {
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
  };

  // Automatically reset active tab to Tab 1 ('wifi'), reset copy state, and clear text selection when navigating to another guide
  useEffect(() => {
    setActiveTab('wifi');
    setCopiedSnippet(null);
    clearSelection();
  }, [sections]);

  // Reset copy state and clear text selection when switching tabs
  useEffect(() => {
    setCopiedSnippet(null);
    clearSelection();
  }, [activeTab]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(text);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const getTabIcon = (key: string, iconName?: string) => {
    if (iconName === 'Share2') return Share2;
    if (iconName === 'Lock') return Lock;
    if (iconName === 'FileText') return FileText;
    switch (key) {
      case 'wifi':
        return Wifi;
      case 'bluetooth':
        return Bluetooth;
      case 'finish':
        return CheckCircle2;
      default:
        return HelpCircle;
    }
  };

  const tabs = [
    {
      key: 'wifi',
      label: sections.wifi.tabLabel || '1. Koneksi Wi-Fi',
      icon: getTabIcon('wifi', sections.wifi.iconName),
      color: 'text-blue-500',
    },
    {
      key: 'bluetooth',
      label: sections.bluetooth.tabLabel || '2. Koneksi Bluetooth',
      icon: getTabIcon('bluetooth', sections.bluetooth.iconName),
      color: 'text-indigo-500',
    },
    {
      key: 'finish',
      label: sections.finish.tabLabel || '3. Setup Selesai',
      icon: getTabIcon('finish', sections.finish.iconName),
      color: 'text-emerald-500',
    },
    ...(sections.troubleshooting
      ? [
          {
            key: 'troubleshooting',
            label: sections.troubleshooting.tabLabel || '4. Troubleshooting',
            icon: getTabIcon('troubleshooting', sections.troubleshooting.iconName),
            color: 'text-amber-500',
          },
        ]
      : []),
  ] as const;

  const getStepsForSection = (sec: DeviceSection | undefined, os: TargetOS): SetupStep[] => {
    if (!sec) return [];
    if (sec.osSteps && sec.osSteps[os]) return sec.osSteps[os];
    if (sec.commonSteps) return sec.commonSteps;
    if (sec.steps) return sec.steps.filter((s) => !s.osTarget || s.osTarget === 'all' || s.osTarget === os);
    return [];
  };

  // Calculate cumulative preceding step count so step numbers are continuous (1, 2, 3, 4, 5, 6...)
  let startStepIndex = 0;
  for (let i = 0; i < tabs.length; i++) {
    const tabKey = tabs[i].key;
    if (tabKey === activeTab) break;
    const sec = sections[tabKey as keyof typeof sections];
    startStepIndex += getStepsForSection(sec, selectedOS).length;
  }

  const currentSection = sections[activeTab as keyof typeof sections];
  const displaySteps = getStepsForSection(currentSection, selectedOS);

  // Check if any section in this device guide has OS-specific steps
  const hasAnyOsSteps = Object.values(sections).some(
    (sec) => sec && (!!sec.osSteps || (sec.steps && sec.steps.some((s) => s.osTarget && s.osTarget !== 'all')))
  );

  return (
    <div className="space-y-6">
      {/* OS Selector Bar */}
      {showOsSelector && hasAnyOsSteps && (
        <OsTabSelector selectedOS={selectedOS} onSelectOS={setSelectedOS} />
      )}

      {/* Main Section Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm transition-colors">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : tab.color}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Current Section Container */}
      {currentSection && (
        <div className="border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40 rounded-2xl p-5 sm:p-6 backdrop-blur-sm shadow-sm transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{currentSection.title}</span>
              </h2>
              {hasAnyOsSteps && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Menampilkan instruksi khusus pengguna{' '}
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {selectedOS === 'windows' ? 'Windows' : 'macOS'}
                  </span>
                  .
                </p>
              )}
            </div>

            {hasAnyOsSteps && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                  {selectedOS === 'windows' ? (
                    <>
                      <Monitor className="h-3.5 w-3.5 text-blue-500" />
                      <span>Mode Windows</span>
                    </>
                  ) : (
                    <>
                      <Laptop className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Mode macOS</span>
                    </>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Stepper Cards */}
          <div className="space-y-6">
            {displaySteps.map((step, idx) => {
              // Continuous sequential step number (1, 2, 3, 4, 5, 6, 7...)
              const currentStepNum = startStepIndex + idx + 1;

              // Format step title so "Langkah X:" matches currentStepNum dynamically
              const formattedTitle = step.title.replace(/^Langkah\s+\d+/, `Langkah ${currentStepNum}`);

              return (
                <div
                  key={idx}
                  className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-3 pb-6 last:pb-0"
                >
                  {/* Continuous Sequential Step Circle Badge */}
                  <div className="absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-extrabold text-xs ring-4 ring-white dark:ring-slate-950 shadow-md">
                    {currentStepNum}
                  </div>

                  <div className="pt-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {formattedTitle}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Details List */}
                  {step.details && step.details.length > 0 && (
                    <ul className="space-y-1.5 my-2">
                      {step.details.map((detail, dIdx) => (
                        <li
                          key={dIdx}
                          className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Code Snippet Box */}
                  {step.codeSnippet && (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-900 text-slate-100 dark:border-slate-800 dark:bg-slate-950 p-3 font-mono text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Terminal className="h-4 w-4 text-blue-400" />
                        <span>{step.codeSnippet}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(step.codeSnippet!)}
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
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
      )}
    </div>
  );
};
