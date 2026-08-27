import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SearchModal } from './components/SearchModal';
import { LoginModal } from './components/LoginModal';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { DeviceDetailPage } from './pages/DeviceDetailPage';
import { LoginPage } from './pages/LoginPage';
import { AddDevicePage } from './pages/AddDevicePage';

// Global ScrollToTop & Clear Selection helper component
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Immediately clear any active text selection/highlighting on route change
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
  }, [pathname]);

  return null;
};

const AppContent: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { isLoginModalOpen, closeLoginModal } = useAuth();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200 antialiased selection:bg-blue-500 selection:text-white">
        {/* Sticky Global Top Bar Header */}
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Collapsible Left Navigation Drawer Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Workspace Layout Container */}
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
              <Route path="/login" element={<LoginPage />} />
              <Route path="/add-device" element={<AddDevicePage />} />
            </Routes>
          </main>

          {/* Footer */}
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

        {/* Search Modal */}
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

        {/* Login Modal */}
        <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} redirectTo="/add-device" />
      </div>
    </Router>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

