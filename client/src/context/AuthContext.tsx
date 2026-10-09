import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setAuthToken, removeAuthToken, getAuthToken } from '../services/api.js';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'analyst' | 'expert' | 'admin';
  preferredLanguage?: string;
  intendedUse?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role: 'analyst' | 'admin' | 'expert') => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  quickDemoLogin: async () => {},
  updateUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkCurrentSession() {
      const token = getAuthToken();
      if (!token) {
        // Fallback: check if we have a dev analyst session saved
        const devId = localStorage.getItem('trustlens_dev_user_id');
        if (devId) {
          try {
            const data = await api.getMe();
            setUser(data.user);
          } catch {
            localStorage.removeItem('trustlens_dev_user_id');
          }
        }
        setLoading(false);
        return;
      }

      try {
        const data = await api.getMe();
        setUser(data.user);
      } catch (err) {
        console.warn('Session verification failed:', err);
        removeAuthToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkCurrentSession();
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await api.login({ email, password: pass });
    setAuthToken(data.token);
    setUser(data.user);
  };

  const register = async (payload: any) => {
    const data = await api.register(payload);
    setAuthToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    removeAuthToken();
    localStorage.removeItem('trustlens_dev_user_id');
    setUser(null);
  };

  const quickDemoLogin = async (role: 'analyst' | 'admin' | 'expert') => {
    let email = 'analyst@trustlens.org';
    if (role === 'admin') email = 'admin@trustlens.org';
    if (role === 'expert') email = 'dr.sharma@trustlens.org';

    await login(email, 'trustlens123');
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, quickDemoLogin, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
