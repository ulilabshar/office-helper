import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminTab } from '../../types/admin';
import {
  LayoutDashboard,
  HardDrive,
  FolderTree,
  BookOpenCheck,
  HelpCircle,
  FolderArchive,
  Activity,
  Settings,
  BookOpen,
  ArrowLeft,
  X,
  LogOut,
  UserCheck,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isOpen: boolean;
  onClose: () => void;
  deviceCount?: number;
  categoryCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  deviceCount = 6,
  categoryCount = 5,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'devices', label: 'Devices', icon: HardDrive, badge: deviceCount },
    { id: 'categories', label: 'Categories', icon: FolderTree, badge: categoryCount },
    { id: 'guides', label: 'Guides', icon: BookOpenCheck },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'media', label: 'Media', icon: FolderArchive },
    { id: 'logs', label: 'Activity Logs', icon: Activity, badge: 'Live', badgeColor: 'bg-emerald-500' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTabClick = (tab: AdminTab) => {
    onSelectTab(tab);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Admin Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between transition-transform duration-300 shadow-xl lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Header Brand */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 group-hover:bg-blue-500 transition-colors">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  Admin Panel
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                    PRO
                  </span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                  Office Helper Management
                </span>
              </div>
            </Link>

            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-6">
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                Menu Utama Admin
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.badgeColor
                              ? 'text-white ' + item.badgeColor
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Notice Sesi Admin */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 px-3 py-2">
              <div className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1">
                Mode Admin Aktif
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Anda berada di area Dashboard. Logout untuk kembali ke tampilan website publik.
              </p>
            </div>
          </div>
        </div>

        {/* Footer User Info & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <UserCheck className="h-4 w-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.name || 'Administrator IT'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.role || 'Admin IT'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Logout dari Admin Panel"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
