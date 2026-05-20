import { create } from 'zustand';

type AuthProvider = 'email' | 'google' | 'apple';

interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  provider: AuthProvider;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  socialLogin: (provider: 'google' | 'apple') => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: { id: 'demo', email: 'demo@rimay.pe', name: 'Usuario Demo', provider: 'email' },
  isAuthenticated: true,
  isLoading: false,
  error: null,

  login: async (email: string, _password: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with Supabase auth call
      await new Promise((r) => setTimeout(r, 800));
      set({
        user: { id: '1', email, provider: 'email' },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({ error: 'Credenciales inválidas', isLoading: false });
    }
  },

  socialLogin: async (provider: 'google' | 'apple') => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with Supabase OAuth
      await new Promise((r) => setTimeout(r, 800));
      set({
        user: {
          id: '1',
          email: `user@${provider}.com`,
          provider,
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({ error: `Error al iniciar con ${provider}`, isLoading: false });
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
