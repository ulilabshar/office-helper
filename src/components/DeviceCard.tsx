import React from 'react';
import { Link } from 'react-router-dom';
import { Device } from '../types/device';
import { slugify } from '../utils/slugify';
import { Printer, ChevronRight, Wifi, Bluetooth, Settings, Share2, Lock, Eye, Copy, Tv, Fingerprint, FileText, Video, Monitor } from 'lucide-react';

interface DeviceCardProps {
  device: Device;
}

const getDeviceIcon = (categorySlug: string) => {
  switch (categorySlug) {
    case 'printer':
      return Printer;
    case 'share-link':
      return Share2;
    case 'proyektor':
      return Monitor;
    case 'video-conference':
      return Video;
    case 'mesin-absensi':
      return Fingerprint;
    default:
      return FileText;
  }
};

export const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
  const IconComponent = getDeviceIcon(device.categorySlug);

  return (
    <div className="group border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 rounded-xl p-5 backdrop-blur-sm hover:border-blue-500/60 dark:hover:border-blue-500/50 dark:hover:bg-slate-900/90 transition-all duration-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-600/10 dark:border-blue-500/20 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {device.name}
              </h3>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Kategori: {device.category}
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shrink-0">
            {device.status}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          {device.description}
        </p>

        {/* Specs Badges Summary */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {device.specs.slice(0, 3).map((spec, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>{spec}</span>
            </span>
          ))}
        </div>
      </div>

      <Link
        to={`/docs/${device.categorySlug}/${device.slug || slugify(device.name)}`}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-all shadow-sm"
      >
        <span>Buka Panduan Lengkap</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
};
