import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseReady, signInWithPassword, signOut as supabaseSignOut } from '../lib/supabase';

export interface User {
  id?: string;
  username: string;
  name: string;
  role: string;
  email?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  isLoginModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'office_docs_auth_user';

// ── Mock fallback credentials (digunakan untuk demo / fallback jika Supabase offline) ───
interface MockUser {
  username: string;
  email: string;
  passwords: string[];
  name: string;
  role: string;
}

const MOCK_USERS: MockUser[] = [
  {
    username: 'admin',
    email: 'admin@gmail.com',
    passwords: ['admin', 'admin123'],
    name: 'Administrator IT',
    role: 'Admin IT',
  },
  {
    username: 'admin@gmail.com',
    email: 'admin@gmail.com',
    passwords: ['admin', 'admin123'],
    name: 'Administrator IT',
    role: 'Admin IT',
  },
  {
    username: 'it-support',
    email: 'it-support@officedocs.local',
    passwords: ['admin123'],
    name: 'IT Support Officer',
    role: 'Admin IT',
  },
  {
    username: 'it',
    email: 'it@officedocs.local',
    passwords: ['it123'],
    name: 'IT Staff',
    role: 'Staff IT',
  },
];

function formatAuthUser(authUser: any, fallbackUsername?: string): User {
  const meta = authUser.user_metadata || {};
  const email: string = authUser.email || '';
  const emailPrefix = email ? email.split('@')[0] : (fallbackUsername || 'admin');
  const username = meta.username || emailPrefix;
  const name = meta.full_name || meta.name || emailPrefix;
  const role = meta.role || 'Admin IT';

  return {
    id: authUser.id,
    username,
    name,
    role,
    email,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // ── Sync Supabase session saat mount & auth change ──────────────────────────
  useEffect(() => {
    if (!isSupabaseReady || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !user) {
        const u = formatAuthUser(session.user);
        setUser(u);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } else if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        const u = formatAuthUser(session.user);
        setUser(u);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Simpan user ke localStorage ─────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      return { success: false, error: 'Username/email dan password wajib diisi!' };
    }

    // ── 1. Supabase Native Auth ──────────────────────────────────────────────
    if (isSupabaseReady && supabase) {
      try {
        let email = trimmedUser;
        if (!email.includes('@')) {
          email = `${trimmedUser}@officedocs.local`;
        }

        const data = await signInWithPassword(email, trimmedPass);
        if (data && data.user) {
          const authenticatedUser = formatAuthUser(data.user, trimmedUser);
          setUser(authenticatedUser);
          setIsLoginModalOpen(false);
          return { success: true };
        }
      } catch (err: unknown) {
        console.warn('Supabase Auth error, checking fallback accounts:', err);
      }
    }

    // ── 2. Mock Fallback (jika Supabase belum siap / error / akun demo) ───────
    const mockMatch = MOCK_USERS.find(
      (u) =>
        (u.username.toLowerCase() === trimmedUser ||
          u.email.toLowerCase() === trimmedUser ||
          `${u.username.toLowerCase()}@kantor.local` === trimmedUser ||
          `${u.username.toLowerCase()}@officedocs.local` === trimmedUser) &&
        u.passwords.includes(trimmedPass)
    );

    if (mockMatch) {
      const authenticatedUser: User = {
        id: 'mock-' + mockMatch.username,
        username: mockMatch.username,
        name: mockMatch.name,
        role: mockMatch.role,
        email: mockMatch.email,
      };
      setUser(authenticatedUser);
      setIsLoginModalOpen(false);
      return { success: true };
    }

    return {
      success: false,
      error: 'Username/email atau password salah!',
    };
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    if (isSupabaseReady) {
      await supabaseSignOut();
    }
    setUser(null);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: Boolean(user),
        user,
        login,
        logout,
        openLoginModal,
        closeLoginModal,
        isLoginModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

