import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import type { ProfileRow } from '@/lib/supabase/types';

interface AuthState {
  user: User | null;
  profile: ProfileRow | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isProfileLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  socialLogin: (provider: 'google' | 'apple') => Promise<void>;
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

    supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('authStore.onAuthStateChange event:', _event, 'session:', session);
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

  signUp: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
    set({ isLoading: false });
  },

  socialLogin: async (provider: 'google' | 'apple') => {
    set({ isLoading: true, error: null });
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
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
