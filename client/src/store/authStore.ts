import { create } from 'zustand';
import { User, AuthResponse } from '../types';

// Safely parse user from localStorage
const getSavedUser = (): User | null => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

interface AuthStore {
  user:            User | null;
  token:           string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  error:           string | null;

  setUser:      (user: User | null) => void;
  setToken:     (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError:     (error: string | null) => void;
  logout:       () => void;
  setAuth:      (response: AuthResponse) => void;
  updateUser:   (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Rehydrate both token AND user from localStorage on load
  user:            getSavedUser(),
  token:           localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading:       false,
  error:           null,

  setUser: (user) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else      localStorage.removeItem('user');
    set({ user });
  },

  setToken: (token) => {
    if (token) localStorage.setItem('token', token);
    else       localStorage.removeItem('token');
    set({ token, isAuthenticated: !!token });
  },

  setIsLoading: (isLoading) => set({ isLoading }),
  setError:     (error)     => set({ error }),

  // Called after login / register
  setAuth: (response: AuthResponse) => {
    localStorage.setItem('token',        response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user',         JSON.stringify(response.user));
    set({
      user:            response.user,
      token:           response.token,
      isAuthenticated: true,
      error:           null,
    });
  },

  // Partial update — used by profile page after saving
  updateUser: (partial: Partial<User>) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...partial };
    localStorage.setItem('user', JSON.stringify(updated));
    set({ user: updated });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },
}));
