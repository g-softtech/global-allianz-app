import { create } from 'zustand';
import { User, AuthResponse } from '../types';

const KEYS = {
  customer: { token: 'token',       user: 'user',       refresh: 'refreshToken'       },
  admin:    { token: 'admin_token', user: 'admin_user', refresh: 'admin_refreshToken' },
};

const safeParseUser = (key: string): User | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const loadInitialState = () => {
  const adminToken = localStorage.getItem(KEYS.admin.token);
  const adminUser  = safeParseUser(KEYS.admin.user);
  if (adminToken && adminUser?.role === 'admin') {
    return { user: adminUser, token: adminToken, isAuthenticated: true, sessionType: 'admin' as const };
  }
  const customerToken = localStorage.getItem(KEYS.customer.token);
  const customerUser  = safeParseUser(KEYS.customer.user);
  if (customerToken) {
    return { user: customerUser, token: customerToken, isAuthenticated: true, sessionType: 'customer' as const };
  }
  return { user: null, token: null, isAuthenticated: false, sessionType: 'customer' as const };
};

interface AuthStore {
  user:            User | null;
  token:           string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;   // true while AuthRehydrator is fetching /users/me
  isReady:         boolean;   // true once AuthRehydrator has finished (success or fail)
  error:           string | null;
  sessionType:     'admin' | 'customer';

  setUser:      (user: User | null) => void;
  setToken:     (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setReady:     (ready: boolean) => void;
  setError:     (error: string | null) => void;
  logout:       () => void;
  setAuth:      (response: AuthResponse, role?: 'admin' | 'customer') => void;
  updateUser:   (partial: Partial<User>) => void;
}

const initial = loadInitialState();

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initial,
  isLoading: false,
  // If no token exists, we're immediately ready (no fetch needed)
  isReady:   !initial.token,
  error:     null,

  setUser: (user) => {
    const keys = KEYS[get().sessionType];
    if (user) localStorage.setItem(keys.user, JSON.stringify(user));
    else      localStorage.removeItem(keys.user);
    set({ user });
  },

  setToken: (token) => {
    const keys = KEYS[get().sessionType];
    if (token) localStorage.setItem(keys.token, token);
    else       localStorage.removeItem(keys.token);
    set({ token, isAuthenticated: !!token });
  },

  setIsLoading: (isLoading) => set({ isLoading }),
  setReady:     (isReady)   => set({ isReady }),
  setError:     (error)     => set({ error }),

  setAuth: (response: AuthResponse, role?: 'admin' | 'customer') => {
    const sessionType = role || (response.user?.role === 'admin' ? 'admin' : 'customer');
    const keys = KEYS[sessionType];
    localStorage.setItem(keys.token,   response.token);
    localStorage.setItem(keys.refresh, response.refreshToken);
    localStorage.setItem(keys.user,    JSON.stringify(response.user));
    set({
      user: response.user, token: response.token,
      isAuthenticated: true, sessionType, isReady: true, error: null,
    });
  },

  updateUser: (partial: Partial<User>) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...partial };
    localStorage.setItem(KEYS[get().sessionType].user, JSON.stringify(updated));
    set({ user: updated });
  },

  logout: () => {
    const keys = KEYS[get().sessionType];
    localStorage.removeItem(keys.token);
    localStorage.removeItem(keys.refresh);
    localStorage.removeItem(keys.user);
    set({ user: null, token: null, isAuthenticated: false, isReady: true, error: null });
  },
}));

export const getCustomerToken = () => localStorage.getItem(KEYS.customer.token);
export const getAdminToken    = () => localStorage.getItem(KEYS.admin.token);
