import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseReady, getCurrentProfile, signInWithPassword, signOut as supabaseSignOut, logActivity } from '../lib/supabase';

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

// ── Mock fallback credentials (used when Supabase is not configured) ──────────
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

  // ── Sync Supabase session on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseReady || !supabase) return;

    // Check if there's already an active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !user) {
        getCurrentProfile().then((profile) => {
          if (profile) {
            const u: User = {
              id: profile.id,
              username: profile.username,
              name: profile.full_name ?? profile.username,
              role: profile.role,
              email: session.user.email,
            };
            setUser(u);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
          }
        });
      }
    });

    // Listen for auth state changes
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
            role: profile.role,
            email: session.user.email,
          };
          setUser(u);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
        }
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist user to localStorage ───────────────────────────────────────────
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
        // Try signing in using username as email (email@domain or bare email)
        // Attempt 1: use username directly as email
        let email = trimmedUser;
        if (!email.includes('@')) {
          // username is not an email; look up email from profiles table via username
          const { data: profileData, error: profileErr } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', trimmedUser)
            .single();

          if (profileErr || !profileData) {
            return { success: false, error: 'Username tidak ditemukan.' };
          }

          // Get the auth user email via admin endpoint is not possible from the client.
          // Instead: instruct users to register with email = username@officedocs.local
          // OR store email in profiles. For now, construct email:
          email = `${trimmedUser}@officedocs.local`;
        }

        const authData = await signInWithPassword(email, trimmedPass);
        const profile = await getCurrentProfile();

        if (profile) {
          const u: User = {
            id: profile.id,
            username: profile.username,
            name: profile.full_name ?? profile.username,
            role: profile.role,
            email,
          };
          setUser(u);
          setIsLoginModalOpen(false);

          // Log the auth event
          await logActivity({
            user_id: profile.id,
            username: profile.username,
            action: 'AUTH',
            target: 'Sesi Admin',
            description: `${profile.username} berhasil login via Supabase Auth.`,
          });

          return { success: true };
        }

        // Edge case: auth succeeded but profile not found
        await supabase.auth.signOut();
        return { success: false, error: 'Profil admin tidak ditemukan. Hubungi superadmin.' };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, error: `Login gagal: ${msg}` };
      }
    }

    // ── Mock Fallback (Supabase not configured) ───────────────────────────────
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
        isLoggedIn: !!user,
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
