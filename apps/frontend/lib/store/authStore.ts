import { create } from 'zustand';

interface AuthState {
  token: string | null;
  isHydrated: boolean;
  setToken: (token: string | null) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isHydrated: false,
  setToken: (token) => {
    if (token) {
      localStorage.setItem('Authorization', token);
    } else {
      localStorage.removeItem('Authorization');
    }
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('Authorization');
    set({ token: null });
  },
  hydrate: () => {
    const token = localStorage.getItem('Authorization');
    set({ token, isHydrated: true });
  },
}));
