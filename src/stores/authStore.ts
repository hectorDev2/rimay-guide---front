import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import type { ProfileRow } from '@/lib/supabase/types';

// Vuelve a /login con el destino original: si la confirmación/OAuth ya deja
// sesión activa al llegar, LoginRoute detecta isAuthenticated y navega solo
// hacia `redirect` en vez de dejar al usuario varado en el landing.
function buildEmailRedirect(redirectPath: string): string {
  return `${window.location.origin}/login?redirect=${encodeURIComponent(redirectPath)}`;
}

interface AuthState {
  user: User | null;
  profile: ProfileRow | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isProfileLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, redirectPath?: string) => Promise<void>;
  resendConfirmation: (email: string, redirectPath?: string) => Promise<void>;
  socialLogin: (provider: 'google' | 'apple', redirectPath?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initialize: () => void;
  loadProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  isProfileLoading: false,
  error: null,

  loadProfile: async () => {
    const user = get().user;
    if (!user) {
      set({ profile: null, isAdmin: false, isProfileLoading: false });
      return;
    }

    console.log('authStore.loadProfile start for user:', user.id);
    set({ isProfileLoading: true });

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('authStore.loadProfile error:', {
          userId: user.id,
          error,
        });
        set({ profile: null, isAdmin: false });
        return;
      }

      if (!data) {
        console.warn('authStore.loadProfile: no profile row found for user', user.id);
        set({ profile: null, isAdmin: false });
        return;
      }

      console.log('authStore.loadProfile success:', data);
      set({ profile: data as ProfileRow, isAdmin: data.role === 'admin' });
    } catch (error) {
      console.error('authStore.loadProfile exception:', error);
      set({ profile: null, isAdmin: false });
    } finally {
      set({ isProfileLoading: false });
    }
  },

  initialize: () => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('authStore.initialize session:', session);
      set({
        user: session?.user ?? null,
        isAuthenticated: !!session,
        isLoading: false,
      });
      if (session?.user) {
        await get().loadProfile();
      } else {
        set({ profile: null, isAdmin: false, isProfileLoading: false });
      }
    });

    // IMPORTANTE: el callback NO debe ser async ni hacer queries a Supabase
    // directamente — supabase-js mantiene un lock de auth mientras emite este
    // evento y cualquier query interno queda en deadlock (skeleton infinito
    // al refrescar). Se difiere con setTimeout para salir del lock.
    supabase.auth.onAuthStateChange((_event, session) => {
      console.log('authStore.onAuthStateChange event:', _event, 'session:', session);
      set({
        user: session?.user ?? null,
        isAuthenticated: !!session,
        isLoading: false,
      });
      if (session?.user) {
        setTimeout(() => {
          get().loadProfile();
        }, 0);
      } else {
        set({ profile: null, isAdmin: false, isProfileLoading: false });
      }
    });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }

    set({
      user: data.session?.user ?? null,
      isAuthenticated: !!data.session,
      isLoading: false,
    });

    if (data.session?.user) {
      await get().loadProfile();
    }
  },

  signUp: async (email: string, password: string, redirectPath = '/tour') => {
    set({ isLoading: true, error: null });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: buildEmailRedirect(redirectPath) },
    });
    if (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
    set({ isLoading: false });
  },

  resendConfirmation: async (email: string, redirectPath = '/tour') => {
    set({ isLoading: true, error: null });
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: buildEmailRedirect(redirectPath) },
    });
    if (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
    set({ isLoading: false });
  },

  socialLogin: async (provider: 'google' | 'apple', redirectPath = '/tour') => {
    set({ isLoading: true, error: null });
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: buildEmailRedirect(redirectPath),
      },
    });
    if (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ user: null, profile: null, isAuthenticated: false, isAdmin: false, isProfileLoading: false });
    try {
      await supabase.auth.signOut();
    } catch {
      // signOut falló pero ya limpiamos local
    }
  },

  clearError: () => set({ error: null }),
}));
