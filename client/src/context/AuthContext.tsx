import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';
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

export interface RegisterResult {
  requiresEmailConfirmation: boolean;
  user: any;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: {
    displayName: string;
    email: string;
    password: string;
    preferredLanguage?: string;
    intendedUse?: string;
  }) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  quickDemoLogin: (role: 'analyst' | 'admin' | 'expert') => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => ({ requiresEmailConfirmation: false, user: null }),
  logout: async () => {},
  quickDemoLogin: async () => {},
  updateUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('trustlens_user_data');
      if (stored) return JSON.parse(stored);
      const devId = localStorage.getItem('trustlens_dev_user_id');
      if (devId) {
        return {
          id: devId,
          email: 'analyst@trustlens.org',
          displayName: 'Citizen Investigator',
          role: 'analyst',
        };
      }
      return null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const saveUserSession = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      try {
        localStorage.setItem('trustlens_user_data', JSON.stringify(userData));
      } catch {}
    } else {
      localStorage.removeItem('trustlens_user_data');
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      // 1. First check Supabase session if configured
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.warn('Supabase getSession notice:', sessionError.message);
          }

          if (session?.user && mounted) {
            const supaUser = session.user;
            const metadata = supaUser.user_metadata || {};

            let profileRecord: any = null;
            try {
              const { data } = await supabase.from('profiles').select('*').eq('id', supaUser.id).maybeSingle();
              profileRecord = data;
            } catch (e) {
              // RLS or network fallback
            }

            const resolvedUser: User = {
              id: supaUser.id,
              email: supaUser.email || '',
              displayName: profileRecord?.display_name || metadata.display_name || supaUser.email?.split('@')[0] || 'User',
              role: profileRecord?.role || metadata.role || 'user',
              preferredLanguage: profileRecord?.preferred_language || metadata.preferred_language || 'en',
              intendedUse: profileRecord?.intended_use || metadata.intended_use || 'personal_verification',
              avatarUrl: profileRecord?.avatar_url || metadata.avatar_url,
            };

            saveUserSession(resolvedUser);
            setAuthToken(session.access_token);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase session initialization error:', err);
        }
      }

      // 2. Check local JWT token fallback
      const token = getAuthToken();
      if (token) {
        try {
          const data = await api.getMe();
          if (data?.user && mounted) {
            saveUserSession(data.user);
            setLoading(false);
            return;
          }
        } catch (err: any) {
          // Only invalidate token if server explicitly rejected auth (401)
          if (err?.message?.includes('401') || err?.message?.includes('Unauthorized')) {
            removeAuthToken();
            localStorage.removeItem('trustlens_user_data');
          }
        }
      }

      // 3. Fallback: check dev user session
      const devId = localStorage.getItem('trustlens_dev_user_id');
      if (devId && mounted) {
        try {
          const data = await api.getMe();
          if (data?.user) {
            saveUserSession(data.user);
          }
        } catch {
          // Keep existing cached session in dev/offline mode
        }
      }

      if (mounted) {
        setLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth state changes
    let authSubscription: any = null;
    const supa = supabase;
    if (isSupabaseConfigured() && supa) {
      const { data: { subscription } } = supa.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const supaUser = session.user;
          const metadata = supaUser.user_metadata || {};
          let profileRecord: any = null;
          try {
            const { data } = await supa.from('profiles').select('*').eq('id', supaUser.id).maybeSingle();
            profileRecord = data;
          } catch {}

          setUser({
            id: supaUser.id,
            email: supaUser.email || '',
            displayName: profileRecord?.display_name || metadata.display_name || supaUser.email?.split('@')[0] || 'User',
            role: profileRecord?.role || metadata.role || 'user',
            preferredLanguage: profileRecord?.preferred_language || metadata.preferred_language || 'en',
            intendedUse: profileRecord?.intended_use || metadata.intended_use || 'personal_verification',
            avatarUrl: profileRecord?.avatar_url || metadata.avatar_url,
          });
          setAuthToken(session.access_token);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          removeAuthToken();
        }
      });
      authSubscription = subscription;
    }

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email address before signing in. Check your inbox for the verification link.');
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please verify your credentials.');
        } else {
          throw new Error(error.message);
        }
      }

      if (data.session && data.user) {
        const supaUser = data.user;
        const metadata = supaUser.user_metadata || {};

        let profileRecord: any = null;
        try {
          const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
          profileRecord = prof;
        } catch {}

        const appUser: User = {
          id: supaUser.id,
          email: supaUser.email || cleanEmail,
          displayName: profileRecord?.display_name || metadata.display_name || cleanEmail.split('@')[0],
          role: profileRecord?.role || metadata.role || 'user',
          preferredLanguage: profileRecord?.preferred_language || metadata.preferred_language || 'en',
          intendedUse: profileRecord?.intended_use || metadata.intended_use || 'personal_verification',
          avatarUrl: profileRecord?.avatar_url || metadata.avatar_url,
        };

        setUser(appUser);
        setAuthToken(data.session.access_token);

        // Sync backend session
        try {
          await api.login({ email: cleanEmail, password: pass });
        } catch (e) {
          // Ignored if backend already synced
        }
        return;
      }
    }

    // Fallback to backend API
    try {
      const data = await api.login({ email: cleanEmail, password: pass });
      setAuthToken(data.token);
      saveUserSession(data.user);
    } catch (err: any) {
      // If offline/demo fallback
      if (cleanEmail.includes('trustlens.org') || cleanEmail.includes('demo')) {
        const fallbackUser: User = {
          id: 'demo_user_01',
          email: cleanEmail,
          displayName: cleanEmail.split('@')[0].toUpperCase(),
          role: cleanEmail.includes('admin') ? 'admin' : cleanEmail.includes('expert') ? 'expert' : 'analyst',
        };
        saveUserSession(fallbackUser);
        localStorage.setItem('trustlens_dev_user_id', fallbackUser.id);
        return;
      }
      throw err;
    }
  };

  const register = async (payload: {
    displayName: string;
    email: string;
    password: string;
    preferredLanguage?: string;
    intendedUse?: string;
  }): Promise<RegisterResult> => {
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanDisplayName = payload.displayName.trim();
    const lang = payload.preferredLanguage || 'en';
    const use = payload.intendedUse || 'personal_verification';

    if (!cleanEmail || !payload.password) {
      throw new Error('Please enter both email and password.');
    }

    // 1. Direct Supabase Authentication integration (Tasks 5 & 6)
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: payload.password,
        options: {
          data: {
            display_name: cleanDisplayName,
            preferred_language: lang,
            intended_use: use,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('Password should be')) {
          throw new Error('Password must be at least 6 characters long.');
        } else {
          throw new Error(error.message);
        }
      }

      const supaUser = data.user;
      const session = data.session;

      // Check if email confirmation is required (Task 7)
      const requiresEmailConfirmation = !session;

      if (session && supaUser) {
        // Active session established: Save profile info without duplicates (Task 9)
        try {
          await supabase.from('profiles').upsert({
            id: supaUser.id,
            email: cleanEmail,
            display_name: cleanDisplayName,
            preferred_language: lang,
            intended_use: use,
            role: 'user',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
        } catch (profErr: any) {
          console.warn('Supabase profiles upsert notice:', profErr.message);
        }

        const appUser: User = {
          id: supaUser.id,
          email: cleanEmail,
          displayName: cleanDisplayName,
          role: 'user',
          preferredLanguage: lang,
          intendedUse: use,
        };

        saveUserSession(appUser);
        setAuthToken(session.access_token);
      }

      // Also sync with backend Express database
      try {
        await api.register({
          displayName: cleanDisplayName,
          email: cleanEmail,
          password: payload.password,
          preferredLanguage: lang,
          intendedUse: use,
        });
      } catch (backendSyncErr: any) {
        console.log('Backend sync status:', backendSyncErr.message);
      }

      return {
        requiresEmailConfirmation,
        user: supaUser,
        message: requiresEmailConfirmation
          ? `Verification email sent! Please check your inbox at ${cleanEmail} to confirm your account.`
          : 'Account created successfully!',
      };
    }

    // Fallback to backend API
    const backendData = await api.register({
      displayName: cleanDisplayName,
      email: cleanEmail,
      password: payload.password,
      preferredLanguage: lang,
      intendedUse: use,
    });
    setAuthToken(backendData.token);
    saveUserSession(backendData.user);
    return {
      requiresEmailConfirmation: false,
      user: backendData.user,
      message: 'Account created successfully!',
    };
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err: any) {
        console.warn('Supabase logout notice:', err.message);
      }
    }
    removeAuthToken();
    localStorage.removeItem('trustlens_dev_user_id');
    saveUserSession(null);
  };

  const quickDemoLogin = async (role: 'analyst' | 'admin' | 'expert') => {
    let email = 'analyst@trustlens.org';
    if (role === 'admin') email = 'admin@trustlens.org';
    if (role === 'expert') email = 'dr.sharma@trustlens.org';

    try {
      await login(email, 'trustlens123');
    } catch {
      const demoUser: User = {
        id: `demo_${role}_01`,
        email,
        displayName: role === 'admin' ? 'Security Admin' : role === 'expert' ? 'Dr. Sharma' : 'Lead Analyst',
        role,
      };
      saveUserSession(demoUser);
      localStorage.setItem('trustlens_dev_user_id', demoUser.id);
    }
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      const merged = { ...user, ...updated };
      saveUserSession(merged);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, quickDemoLogin, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
