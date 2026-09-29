import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  required?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Pilih salah satu...',
  className = '',
  disabled = false,
  searchable,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Auto-enable search if more than 5 options, unless explicitly set
  const showSearch = searchable ?? options.length > 5;

  const filteredOptions = showSearch && searchQuery.trim()
    ? options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (opt.sublabel && opt.sublabel.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : options;

  // Toggle open and calculate best popup position
  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // If less than 230px below and more space above, open upward
      if (spaceBelow < 230 && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
      setSearchQuery('');
    }
    setIsOpen((prev) => !prev);
  };

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when open
  useEffect(() => {
    if (isOpen && showSearch) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showSearch]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isOpen ? 'z-30' : 'z-10'} ${
        disabled ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 sm:py-2 rounded-xl text-left text-sm font-normal transition-all duration-200 min-h-[40px] bg-white dark:bg-slate-900 border ${
          isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-[0_4px_16px_rgba(37,99,235,0.12)]'
            : 'border-slate-200/90 dark:border-slate-700/80 shadow-[0_2px_6px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:border-slate-300 dark:hover:border-slate-600'
        } ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedOption?.icon && (
            <span className="shrink-0 text-slate-500 dark:text-slate-400">
              {selectedOption.icon}
            </span>
          )}
          <div className="flex flex-col min-w-0 flex-1 leading-snug">
            {selectedOption ? (
              <>
                <span className="text-slate-900 dark:text-white font-medium text-xs sm:text-sm truncate">
                  {selectedOption.label}
                </span>
                {selectedOption.sublabel && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate -mt-0.5">
                    {selectedOption.sublabel}
                  </span>
                )}
              </>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm truncate">
                {placeholder}
              </span>
            )}
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-500' : ''
          }`}
        />
      </button>

      {/* Floating Compact Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 z-50 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl dark:shadow-2xl overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${
            openUpward
              ? 'bottom-[calc(100%+4px)] origin-bottom'
              : 'top-[calc(100%+4px)] origin-top'
          }`}
          style={{ maxHeight: '192px' }}
        >
          {/* Optional Search Bar */}
          {showSearch && (
            <div className="p-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 shrink-0 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari..."
                className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none py-1"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Scrollable Options List */}
          <div className="overflow-y-auto overscroll-contain flex-1 py-0.5 divide-y divide-slate-100/50 dark:divide-slate-800/50">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-slate-400 dark:text-slate-500">
                Tidak ada pilihan yang cocok
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {opt.icon && (
                        <span className="shrink-0 text-slate-400 dark:text-slate-500">
                          {opt.icon}
                        </span>
                      )}
                      <div className="flex flex-col min-w-0 flex-1 leading-snug">
                        <span className="text-xs sm:text-sm truncate">
                          {opt.label}
                        </span>
                        {opt.sublabel && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate mt-0.5">
                            {opt.sublabel}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-1.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
