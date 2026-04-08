import { create } from "zustand";
import { User, AuthResponse } from "../types";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  setAuth: (response: AuthResponse) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    set({ token, isAuthenticated: !!token });
  },
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },
  setAuth: (response) => {
    localStorage.setItem("token", response.token);
    localStorage.setItem("refreshToken", response.refreshToken);
    set({
      user: response.user,
      token: response.token,
      isAuthenticated: true,
      error: null,
    });
  },
}));
