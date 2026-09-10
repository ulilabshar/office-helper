import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CatalogProvider } from './context/CatalogContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SearchModal } from './components/SearchModal';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { DeviceDetailPage } from './pages/DeviceDetailPage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

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
  const isAdminRoute = pathname.startsWith('/dashboard');
  const isLoginRoute = pathname === '/login';

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  if (isAdminRoute) {
    return (
      <>
        <ScrollToTop />
        <Routes>
          <Route
            path="/dashboard"
            element={<AdminDashboardPage darkMode={darkMode} setDarkMode={setDarkMode} />}
          />
          <Route
            path="/dashboard/:tab"
            element={<AdminDashboardPage darkMode={darkMode} setDarkMode={setDarkMode} />}
          />
        </Routes>
      </>
    );
  }

  if (isLoginRoute) {
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
          <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<HomePage onOpenSearch={() => setIsSearchOpen(true)} />} />
              <Route path="/category/:categorySlug" element={<CategoryPage />} />
              <Route path="/docs/:categorySlug/:deviceId" element={<DeviceDetailPage />} />
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

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CatalogProvider>
        <Router>
          <AppContent />
        </Router>
      </CatalogProvider>
    </AuthProvider>
  );
};

export default App;
