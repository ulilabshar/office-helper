import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  username: string;
  name: string;
  role: string;
  email?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  isLoginModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'office_docs_auth_user';

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

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = (username: string, password: string): { success: boolean; error?: string } => {
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      return { success: false, error: 'Username dan password wajib diisi!' };
    }

    // Default account credentials: user 'admin' or 'it-support', password 'admin123'
    if (
      (trimmedUser === 'admin' && trimmedPass === 'admin123') ||
      (trimmedUser === 'it-support' && trimmedPass === 'admin123') ||
      (trimmedUser === 'it' && trimmedPass === 'it123')
    ) {
      const authenticatedUser: User = {
        username: trimmedUser,
        name: trimmedUser === 'admin' ? 'Administrator IT' : 'IT Support Officer',
        role: 'Admin IT',
        email: `${trimmedUser}@kantor.local`,
      };
      setUser(authenticatedUser);
      setIsLoginModalOpen(false);
      return { success: true };
    }

    // Custom non-empty fallback for ease of testing
    if (trimmedPass === '123456' || trimmedPass === 'admin123') {
      const authenticatedUser: User = {
        username: trimmedUser,
        name: trimmedUser.charAt(0).toUpperCase() + trimmedUser.slice(1),
        role: 'Staff IT',
        email: `${trimmedUser}@kantor.local`,
      };
      setUser(authenticatedUser);
      setIsLoginModalOpen(false);
      return { success: true };
    }

    return {
      success: false,
      error: 'Username atau password salah! (Gunakan user: "admin" & password: "admin123")',
    };
  };

  const logout = () => {
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
