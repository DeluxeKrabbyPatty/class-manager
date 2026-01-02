import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '@/utils/auth';
import type { UserSession } from '@/types/user';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    name: string,
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const result = await loginUser(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  }

  async function register(email: string, password: string, name: string, phone?: string) {
    const result = await registerUser(email, password, name, phone);
    if (result.success && result.user) {
      const session: UserSession = {
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name,
      };
      setUser(session);
    }
    return result;
  }

  async function logout() {
    await logoutUser();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

