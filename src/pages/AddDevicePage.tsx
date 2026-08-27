import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { categoriesData } from '../data/categories';
import {
  PlusCircle,
  ArrowLeft,
  Printer,
  Tv,
  Fingerprint,
  Share2,
  Video,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Tag,
  Layers,
  Sparkles,
  Lock,
  User as UserIcon,
  LogOut,
  Save,
  Eye,
} from 'lucide-react';

export const AddDevicePage: React.FC = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [categorySlug, setCategorySlug] = useState('printer');
  const [status, setStatus] = useState<'Ready' | 'Maintenance' | 'New'>('Ready');
  const [description, setDescription] = useState('');
  const [specInput, setSpecInput] = useState('');
  const [specs, setSpecs] = useState<string[]>([
    'Wi-Fi Direct / SSID Kantor',
    'Windows 10/11 & macOS Support',
  ]);
  const [step1Title, setStep1Title] = useState('Hubungkan ke Jaringan Wi-Fi Kantor');
  const [step1Desc, setStep1Desc] = useState(
    'Nyalakan perangkat dan sambungkan ke SSID Wi-Fi kantor dengan frekuensi 2.4 GHz.'
  );

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdDeviceId, setCreatedDeviceId] = useState<string | null>(null);

  const handleAddSpec = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (specInput.trim() && !specs.includes(specInput.trim())) {
      setSpecs([...specs, specInput.trim()]);
      setSpecInput('');
    }
  };

  const handleRemoveSpec = (indexToRemove: number) => {
    setSpecs(specs.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    const generatedId = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setCreatedDeviceId(generatedId);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setName('');
    setDescription('');
    setSpecs(['Wi-Fi Direct / SSID Kantor', 'Windows 10/11 & macOS Support']);
    setIsSubmitted(false);
    setCreatedDeviceId(null);
  };

  // If NOT logged in, show direct login prompt
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-8 shadow-xl text-center space-y-5">
          <div className="h-16 w-16 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 rounded-full flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
            <Lock className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Akses Terbatas: Login Diperlukan
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Anda harus masuk menggunakan akun <strong>User</strong> dan <strong>Password</strong> IT Support untuk dapat menambah atau mengelola perangkat kantor baru.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate('/login', { state: { from: { pathname: '/add-device' } } })}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-600/20"
            >
              <UserIcon className="h-4 w-4" />
              <span>Login dengan User & Password</span>
            </button>

            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedCategory = categoriesData.find((c) => c.slug === categorySlug);

  return (
    <div className="space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/" className="hover:text-slate-900 dark:hover:text-white">
              Beranda
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Tambah Perangkat</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Formulir Tambah Perangkat Kantor
          </h1>
        </div>

        {/* User Status Badge & Logout Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/60 text-xs">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              Masuk sebagai: <strong className="text-blue-600 dark:text-blue-400">{user?.name}</strong>
            </span>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Keluar Akun"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {isSubmitted ? (
        /* Success State */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 p-8 text-center space-y-5 shadow-lg">
          <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Perangkat Berhasil Didaftarkan!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Perangkat <strong>{name}</strong> dalam kategori <strong>{selectedCategory?.title}</strong> telah tersimpan dalam sistem dokumentasi IT.
            </p>
          </div>

          {/* Result Card Preview */}
          <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">{name}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400">
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
            <div className="flex flex-wrap gap-1 pt-1">
              {specs.map((s, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Tambah Perangkat Lain</span>
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Main Device Registration Form */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Main: Input Form (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Informasi Dasar Perangkat
                </h2>
                <p className="text-xs text-slate-500">
                  Lengkapi data spesifikasi perangkat baru yang tersedia di kantor.
                </p>
              </div>

              {/* Device Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nama Perangkat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Epson EcoTank L3250 / Samsung Smart TV 65 Inch"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kategori Alat Kantor <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categoriesData.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Status Kesiapan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Ready">Ready (Siap Digunakan)</option>
                    <option value="New">New (Baru Tiba)</option>
                    <option value="Maintenance">Maintenance (Dalam Perawatan)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Deskripsi Singkat & Kegunaan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan fungsi perangkat dan lokasi penempatannya di kantor..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Specs Tag Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Spesifikasi / Fitur Kunci
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={specInput}
                    onChange={(e) => setSpecInput(e.target.value)}
                    onKeyDown={handleAddSpec}
                    placeholder="Ketik poin spesifikasi lalu klik Tambah..."
                    className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                  >
                    Tambah
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {specs.map((spec, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300"
                    >
                      <Tag className="h-3 w-3" />
                      <span>{spec}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className="text-blue-400 hover:text-rose-500 transition-colors ml-0.5"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Initial Setup Step */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Langkah Panduan Awal (Setup Guide)
                </h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={step1Title}
                    onChange={(e) => setStep1Title(e.target.value)}
                    placeholder="Judul langkah (contoh: Nyalakan & Sambungkan Wi-Fi)"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                  <textarea
                    rows={2}
                    value={step1Desc}
                    onChange={(e) => setStep1Desc(e.target.value)}
                    placeholder="Instruksi langkah detail..."
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to="/"
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 active:scale-95 transition-all shadow-md shadow-blue-600/20"
                >
                  <Save className="h-4 w-4" />
                  <span>Simpan Perangkat Baru</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Live Preview Card (1 Col) */}
          <div className="space-y-4">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Eye className="h-4 w-4 text-blue-500" />
                <span>Pratinjau Kartu Perangkat</span>
              </div>

              <div className="border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20 shrink-0">
                      <Printer className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {name || 'Nama Perangkat Baru'}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Kategori: {selectedCategory?.title || 'Printer Kantor'}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 shrink-0">
                    {status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed min-h-[40px]">
                  {description || 'Deskripsi singkat perangkat akan muncul di sini...'}
                </p>

                <div className="flex flex-wrap gap-1">
                  {specs.length === 0 ? (
                    <span className="text-[10px] text-slate-400 italic">Belum ada spesifikasi</span>
                  ) : (
                    specs.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {s}
                      </span>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="w-full py-2 text-center text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    Pratinjau Tombol Panduan
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
