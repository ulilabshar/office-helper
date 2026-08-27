import React from 'react';
import { Bell, UserCheck, Calendar } from 'lucide-react';

interface NoticeItem {
  id: string;
  author: string;
  email: string;
  text: string;
  date: string;
}

const notices: NoticeItem[] = [
  {
    id: '1',
    author: 'Tim IT Support',
    email: 'it-support@kantor.com',
    text: 'Pembaruan panduan setup Wi-Fi Direct Epson L3250 & driver Windows 11 / macOS Sequoia.',
    date: '13 Agustus 2026',
  },
  {
    id: '2',
    author: 'Admin Operasional',
    email: 'ops@kantor.com',
    text: 'Penambahan panduan penggantian kantong tinta RIPS Epson WF-C879R.',
    date: '05 Agustus 2026',
  },
  {
    id: '3',
    author: 'Tim Sarpras',
    email: 'sarpras@kantor.com',
    text: 'Persiapan penambahan kategori Proyektor & Mesin Absensi Fingerprint.',
    date: '28 Juli 2026',
  },
];

export const NoticeBoard: React.FC = () => {
  return (
    <div className="border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40 rounded-xl p-4 sm:p-5 backdrop-blur-sm h-full flex flex-col shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Catatan Update</h2>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 rounded border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
          Live Notice
        </span>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
        Pembaruan dokumentasi & penambahan panduan terbaru berdasarkan feedback pengguna.
      </p>

      <div className="space-y-3 overflow-y-auto max-h-72 pr-1 flex-1">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-950/70 dark:border-slate-800 text-xs space-y-1.5 transition-all hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <UserCheck className="h-3.5 w-3.5 text-blue-500" />
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {notice.author}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                <Calendar className="h-3 w-3" />
                <span>{notice.date}</span>
              </div>
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-xs leading-snug font-normal">
              {notice.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
