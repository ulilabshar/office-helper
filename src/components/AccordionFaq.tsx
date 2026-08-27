import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQItem } from '../types/device';

interface AccordionFaqProps {
  items: FAQItem[];
  title?: string;
  subtitle?: string;
}

export const AccordionFaq: React.FC<AccordionFaqProps> = ({
  items,
  title = 'FAQ (Frequently Asked Questions)',
  subtitle = 'Pertanyaan umum yang sering ditanyakan seputar pengoperasian perangkat.',
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40 rounded-xl p-4 sm:p-6 backdrop-blur-sm shadow-sm transition-colors">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
        </div>
        {subtitle && <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                className="flex w-full items-center justify-between gap-4 text-left font-semibold text-sm sm:text-base text-slate-800 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition-colors py-1"
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-blue-500' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-3 border-l-2 border-blue-500 py-1">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
