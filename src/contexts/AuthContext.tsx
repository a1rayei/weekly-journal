import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest, clearAuthToken } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  // 登录弹窗控制
  loginModalOpen: boolean;
  openLoginModal: (afterLogin?: () => void) => void;
  closeLoginModal: () => void;
  // Toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [afterLoginCb, setAfterLoginCb] = useState<(() => void) | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiRequest('GET', '/auth/me')
        .then((data: any) => {
          if (data?.user) setUser(data.user);
        })
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2800);
  };

  const login = async (email: string, password: string) => {
    const data = await apiRequest('POST', '/auth/login', { email, password });
    if (data.user) {
      localStorage.setItem('token', 'mock-token');
      setUser(data.user);
      setLoginModalOpen(false);
      showToast('登录成功，欢迎回来', 'success');
      if (afterLoginCb) {
        const cb = afterLoginCb;
        setAfterLoginCb(null);
        setTimeout(cb, 100);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    clearAuthToken();
    setUser(null);
    showToast('已退出登录', 'info');
  };

  const openLoginModal = (afterLogin?: () => void) => {
    setAfterLoginCb(() => afterLogin || null);
    setLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
    setAfterLoginCb(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, loginModalOpen, openLoginModal, closeLoginModal, toast, showToast }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
