import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Sun,
  Moon,
  X,
} from 'lucide-react';

interface LoginPageProps {
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ darkMode, setDarkMode }) => {
  const { login, isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    if (fromPath && !fromPath.startsWith('/dashboard')) {
      navigate(fromPath);
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const result = await login(username, password);
    setIsLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Gagal login. Periksa username dan password Anda.');
    }
  };

  return (
    <div
      onClick={handleClose}
      className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between"
    >
      <header
        className="flex items-center justify-between px-4 sm:px-8 h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm z-10"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke situs publik
        </button>

        <div className="flex items-center gap-2">
          {setDarkMode && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDarkMode(!darkMode);
              }}
              className="p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title={darkMode ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            title="Tutup halaman login"
            aria-label="Tutup halaman login"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div
        className="flex-1 flex items-center justify-center px-4 py-8"
        onClick={handleClose}
      >
        <div
          className="w-full max-w-md cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoggedIn && user ? (
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center space-y-5">
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                title="Tutup"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Anda sudah masuk</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Sebagai <span className="font-semibold text-blue-600">{user.name}</span> ({user.role})
                </p>
              </div>
              <Link
                to="/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-blue-600 text-white"
              >
                Buka Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={logout}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700"
              >
                Keluar / Ganti akun
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
              <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                      <KeyRound className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-xl font-extrabold">Login Dashboard</h1>
                      <p className="text-xs text-slate-500">Khusus admin untuk mengelola konten.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                    title="Tutup halaman login"
                    aria-label="Tutup"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
                {error && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold">Username</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50 flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-medium">
                    <ShieldCheck className="h-4 w-4" />
                    Akun: <strong>admin@gmail.com</strong> / <strong>admin</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('admin@gmail.com');
                      setPassword('admin');
                      setError(null);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold"
                  >
                    Isi
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-blue-600 text-white disabled:opacity-50"
                >
                  {isLoading ? 'Masuk...' : 'Masuk ke Dashboard'}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-center">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                  Dokumentasi Kantor
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
