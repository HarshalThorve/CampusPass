import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error('Session restoration failed:', err.message);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Sync Supabase Google Session with Backend
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const currentToken = localStorage.getItem('token');
        const email = session.user.email;

        // Sync with backend if no token exists, or if email of logged-in user changed
        if (!currentToken || !user || user.email !== email) {
          const provider = session.user.app_metadata?.provider;
          const isGoogle = provider === 'google' || session.user.identities?.some(id => id.provider === 'google');

          if (isGoogle) {
            try {
              const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Google User';
              const backendData = await authService.googleLogin(name, email);
              localStorage.setItem('token', backendData.token);
              setUser(backendData.user);
            } catch (err) {
              console.error('Failed to sync Google user with backend:', err);
            }
          }
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [user]);

  // Update DOM when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Auth Operations
  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err.response?.data?.message || 'Login failed';
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await authService.register(name, email, password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err.response?.data?.message || 'Registration failed';
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setUser(null);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Supabase sign out error:', err);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = {
    user,
    loading,
    theme,
    login,
    register,
    logout,
    toggleTheme
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
