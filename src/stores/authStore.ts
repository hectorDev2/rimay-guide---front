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
  error: null,

  loadProfile: async () => {
    const user = get().user;
    if (!user) {
      set({ profile: null, isAdmin: false });
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (error || !data) {
      set({ profile: null, isAdmin: false });
      return;
    }
    set({ profile: data as ProfileRow, isAdmin: data.role === 'admin' });
  },

  initialize: () => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      set({
        user: session?.user ?? null,
        isAuthenticated: !!session,
        isLoading: false,
      });
      if (session?.user) {
        await get().loadProfile();
      }
    });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({
        user: session?.user ?? null,
        isAuthenticated: !!session,
        isLoading: false,
      });
      if (session?.user) {
        await get().loadProfile();
      } else {
        set({ profile: null, isAdmin: false });
      }
    });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message, isLoading: false });
      throw error;
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
    await supabase.auth.signOut();
    set({ user: null, profile: null, isAuthenticated: false, isAdmin: false });
  },

  clearError: () => set({ error: null }),
}));
