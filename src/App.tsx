import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CatalogProvider } from './context/CatalogContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SearchModal } from './components/SearchModal';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { DeviceDetailPage } from './pages/DeviceDetailPage';
import { LoginPage } from './pages/LoginPage';

const AdminDashboardPage = React.lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
  }, [pathname]);

  return null;
};

const AppContent: React.FC = () => {
  const { pathname } = useLocation();
  const { isLoggedIn } = useAuth();

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // ── ATURAN PEMISAHAN PENUH: ADMIN & PUBLIK ──
  // 1. Jika Admin Login: HARUS selalu berada di /dashboard.
  //    Jika mengakses halaman publik (/, /category/..., /docs/..., /login),
  //    otomatis langsung diarahkan ke /dashboard.
  if (isLoggedIn) {
    if (!pathname.startsWith('/dashboard')) {
      return <Navigate to="/dashboard" replace />;
    }

    return (
      <>
        <ScrollToTop />
        <React.Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm font-semibold">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Memuat Dashboard Admin...</span>
              </div>
            </div>
          }
        >
          <Routes>
            <Route
              path="/dashboard"
              element={<AdminDashboardPage darkMode={darkMode} setDarkMode={setDarkMode} />}
            />
            <Route
              path="/dashboard/:tab"
              element={<AdminDashboardPage darkMode={darkMode} setDarkMode={setDarkMode} />}
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </React.Suspense>
      </>
    );
  }

  // 2. Jika Bukan Admin / Tidak Login (Pengunjung Publik):
  //    Akses ke /dashboard langsung diarahkan ke /login.
  if (pathname.startsWith('/dashboard')) {
    return <Navigate to="/login" replace state={{ from: { pathname } }} />;
  }

  if (pathname === '/login') {
    return (
      <>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<LoginPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
        </Routes>
      </>
    );
  }

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200 antialiased selection:bg-blue-500 selection:text-white">
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div
          className={`min-h-[calc(100vh-4rem)] transition-all duration-300 ${
            isSidebarOpen ? 'lg:pl-72' : 'lg:pl-0'
          }`}
        >
          <main className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
            <Routes>
              <Route path="/" element={<HomePage onOpenSearch={() => setIsSearchOpen(true)} />} />
              <Route path="/category/:categorySlug" element={<CategoryPage />} />
              <Route path="/docs/:categorySlug/:deviceSlug" element={<DeviceDetailPage />} />
            </Routes>
          </main>

          <footer className="mt-16 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 py-8 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
            <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Pusat Dokumentasi Perangkat & Sistem Kantor
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Dikelola oleh Tim IT Support Kantor
                </p>
              </div>
              <p className="text-[11px]">
                &copy; {new Date().getFullYear()} Office Docs. Hak Cipta Dilindungi.
              </p>
            </div>
          </footer>
        </div>

        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </div>
    </>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled app error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
          <div className="max-w-md w-full p-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <span className="text-xl font-bold">!</span>
            </div>
            <h2 className="text-lg font-bold">Terjadi Kendala Teknis</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Halaman mengalami kesalahan saat memuat data. Silakan muat ulang atau kembali ke beranda.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => (window.location.href = '/')}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors"
              >
                Kembali ke Beranda
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Muat Ulang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CatalogProvider>
          <Router>
            <AppContent />
          </Router>
        </CatalogProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
