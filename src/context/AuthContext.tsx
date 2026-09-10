import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseReady, getCurrentProfile, signInWithPassword, signOut as supabaseSignOut } from '../lib/supabase';

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

// ── Mock fallback credentials (digunakan jika Supabase belum dikonfigurasi) ───
const MOCK_USERS: Array<{ username: string; password: string; name: string; role: string }> = [
  { username: 'admin', password: 'admin123', name: 'Administrator IT', role: 'Admin IT' },
  { username: 'it-support', password: 'admin123', name: 'IT Support Officer', role: 'Admin IT' },
  { username: 'it', password: 'it123', name: 'IT Staff', role: 'Staff IT' },
];

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

  // ── Sync Supabase session saat mount ─────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseReady || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !user) {
        getCurrentProfile().then((profile) => {
          if (profile) {
            const u: User = {
              id: profile.id,
              username: profile.username,
              name: profile.full_name ?? profile.username,
              role: 'Admin IT',
              email: session.user.email,
            };
            setUser(u);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
          }
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } else if (event === 'SIGNED_IN' && session) {
        const profile = await getCurrentProfile();
        if (profile) {
          const u: User = {
            id: profile.id,
            username: profile.username,
            name: profile.full_name ?? profile.username,
            role: 'Admin IT',
            email: session.user.email,
          };
          setUser(u);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
        }
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
      return { success: false, error: 'Username dan password wajib diisi!' };
    }

    // ── Supabase Auth ────────────────────────────────────────────────────────
    if (isSupabaseReady && supabase) {
      try {
        // 1. Cek langsung ke tabel profiles berdasarkan username
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('id, username, password, full_name, avatar_url')
          .eq('username', trimmedUser)
          .maybeSingle();

        if (profileErr) {
          console.warn('Gagal cek tabel profiles:', profileErr.message);
        }

        // Jika user ditemukan di tabel profiles dan password cocok
        if (profileData && profileData.password === trimmedPass) {
          const u: User = {
            id: profileData.id,
            username: profileData.username,
            name: profileData.full_name ?? profileData.username,
            role: 'Admin IT',
            email: `${profileData.username}@officedocs.local`,
          };
          setUser(u);
          setIsLoginModalOpen(false);

          // Coba signIn ke Supabase auth di background jika akun auth.users ada
          try {
            const email = `${trimmedUser}@officedocs.local`;
            await signInWithPassword(email, trimmedPass);
          } catch {
            // Abaikan jika user hanya terdaftar di tabel profiles (direct db user)
          }

          return { success: true };
        }

        // 2. Jika password di profiles tidak cocok atau dicoba via auth.users email
        let email = trimmedUser;
        if (!email.includes('@')) {
          email = `${trimmedUser}@officedocs.local`;
        }

        try {
          await signInWithPassword(email, trimmedPass);
          const profile = await getCurrentProfile();
          if (profile) {
            const u: User = {
              id: profile.id,
              username: profile.username,
              name: profile.full_name ?? profile.username,
              role: 'Admin IT',
              email,
            };
            setUser(u);
            setIsLoginModalOpen(false);
            return { success: true };
          }
        } catch {
          // auth.users gagal
        }

        if (profileData) {
          return { success: false, error: 'Password salah.' };
        } else {
          return { success: false, error: 'Username tidak ditemukan di database.' };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, error: `Login gagal: ${msg}` };
      }
    }

    // ── Mock Fallback (jika Supabase belum disetup) ───────────────────────────
    const mockMatch = MOCK_USERS.find(
      (u) => u.username === trimmedUser && u.password === trimmedPass
    );

    if (mockMatch) {
      const authenticatedUser: User = {
        username: mockMatch.username,
        name: mockMatch.name,
        role: mockMatch.role,
        email: `${mockMatch.username}@kantor.local`,
      };
      setUser(authenticatedUser);
      setIsLoginModalOpen(false);
      return { success: true };
    }

    return {
      success: false,
      error: 'Username atau password salah!',
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
