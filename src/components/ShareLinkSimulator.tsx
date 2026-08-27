import React, { useState } from 'react';
import { Lock, Globe, Eye, MessageSquare, Edit3, Copy, Check, ShieldAlert, Link2, Users } from 'lucide-react';

export const ShareLinkSimulator: React.FC = () => {
  const [accessScope, setAccessScope] = useState<'restricted' | 'anyone'>('anyone');
  const [permissionLevel, setPermissionLevel] = useState<'viewer' | 'commenter' | 'editor'>('viewer');
  const [isCopied, setIsCopied] = useState(false);

  const sampleUrl = `https://docs.office.kantor.com/d/document-id-9037?access=${accessScope}&role=${permissionLevel}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="border-2 border-blue-200 bg-white dark:border-blue-900/50 dark:bg-slate-900/80 rounded-2xl p-5 sm:p-6 backdrop-blur-sm shadow-md space-y-6 transition-colors">
      {/* Widget Header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 mb-1.5">
            <Link2 className="h-3.5 w-3.5" />
            <span>Simulator Interaktif Hak Akses Dokumen</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Uji Coba Pengaturan Hak Akses Link (Share Link)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Gunakan kontrol di bawah ini untuk memahami perbedaan antara akses dan izin sebelum menyalin link.
          </p>
        </div>
      </div>

      {/* Step 1: Access Scope Selection */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Users className="h-4 w-4 text-blue-500" />
          <span>1. Memilih Siapa Yang Punya Akses (Access Scope)</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Restricted Option */}
          <button
            type="button"
            onClick={() => setAccessScope('restricted')}
            className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
              accessScope === 'restricted'
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:bg-slate-900'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${accessScope === 'restricted' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                Restricted (Dibatasi)
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 leading-snug block mt-0.5">
                Hanya orang/email spesifik yang diundang yang bisa membuka dokumen.
              </span>
            </div>
          </button>

          {/* Anyone with Link Option */}
          <button
            type="button"
            onClick={() => setAccessScope('anyone')}
            className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
              accessScope === 'anyone'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:bg-slate-900'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${accessScope === 'anyone' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                Anyone with the link (Siapa saja)
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 leading-snug block mt-0.5">
                Semua orang yang memegang link dapat langsung membuka tanpa perlu login/minta izin.
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Step 2: Permission Level Selection */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Eye className="h-4 w-4 text-indigo-500" />
          <span>2. Menentukan Level Izin (Permission Level)</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Viewer */}
          <button
            type="button"
            onClick={() => setPermissionLevel('viewer')}
            className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
              permissionLevel === 'viewer'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-600/15 dark:border-blue-500'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-blue-500" />
              <span className="font-bold text-sm text-slate-900 dark:text-white">Viewer</span>
            </div>
            <span className="text-[11px] text-slate-600 dark:text-slate-400">
              Hanya bisa melihat/membaca dokumen. Tidak bisa mengedit atau komentar.
            </span>
          </button>

          {/* Commenter */}
          <button
            type="button"
            onClick={() => setPermissionLevel('commenter')}
            className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
              permissionLevel === 'commenter'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-600/15 dark:border-indigo-500'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="h-4 w-4 text-indigo-500" />
              <span className="font-bold text-sm text-slate-900 dark:text-white">Commenter</span>
            </div>
            <span className="text-[11px] text-slate-600 dark:text-slate-400">
              Bisa membaca dan menambahkan komentar/saran tanpa mengubah teks utama.
            </span>
          </button>

          {/* Editor */}
          <button
            type="button"
            onClick={() => setPermissionLevel('editor')}
            className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
              permissionLevel === 'editor'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-600/15 dark:border-emerald-500'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Edit3 className="h-4 w-4 text-emerald-500" />
              <span className="font-bold text-sm text-slate-900 dark:text-white">Editor</span>
            </div>
            <span className="text-[11px] text-slate-600 dark:text-slate-400">
              Hak akses penuh untuk mengedit isi, menghapus data, dan mengatur ulang dokumen.
            </span>
          </button>
        </div>
      </div>

      {/* Step 3: Copy Link Area */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            3. Menyalin Link (Copy Link)
          </label>
          <span className="text-[11px] text-slate-500">
            Kombinasi Active: <strong className="text-blue-500 capitalize">{accessScope}</strong> + <strong className="text-indigo-500 capitalize">{permissionLevel}</strong>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="w-full flex-1 p-2.5 rounded-xl border border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 font-mono text-xs truncate">
            {sampleUrl}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-md shrink-0 ${
              isCopied
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'
            }`}
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4" />
                <span>Link Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Security Caution Tip */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300 text-xs">
        <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Tips Keamanan:</strong> Jangan pernah memberikan akses <strong>Anyone with link + Editor</strong> pada file rahasia kantor (seperti laporan keuangan atau data pegawai) agar data tidak mudah terhapus atau diubah pihak tidak bertanggung jawab.
        </p>
      </div>
    </div>
  );
};
