import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type Profile = {
  user_id: string;
  display_name: string | null;
  role: string | null;
  credits_cents?: number | null;
  credits?: number | null;         // tolerate either column name
  avatar_url: string | null;
};

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({} as any);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const refRefreshing = useRef(false);

  // 1) initial session + listener
  useEffect(() => {
    let mounted = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mounted) return;
      setSession(s ?? null);
      setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  // 2) keep session fresh when user returns to the tab
  useEffect(() => {
    const refresh = async () => {
      if (refRefreshing.current) return;
      refRefreshing.current = true;

      try {
        const { data } = await supabase.auth.refreshSession();
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.warn('Session refresh failed:', error);
      } finally {
        refRefreshing.current = false;
      }
    };

// <<<<<<< codex/fix-app-connection-issue-to-supabase-db-8jrtqq
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.startAutoRefresh();
        void refresh();
      }
    };

    supabase.auth.startAutoRefresh();
    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
    const onFocus = () => {
      supabase.auth.startAutoRefresh();
      // Debounce to avoid rate limiting
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => void rehydrate(), 1000);
    };

    const onVis = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.startAutoRefresh();
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => void rehydrate(), 1000);
      } else {
        // Pause auto refresh when tab is hidden to avoid rate limiting
        supabase.auth.stopAutoRefresh();
      }
    };

    // Ensure auto refresh is active when this effect runs
    supabase.auth.startAutoRefresh();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);

      supabase.auth.stopAutoRefresh();
    };
  }, [session]);

  // 3) load profile (retry once if 406/rls hiccup)
  useEffect(() => {
    let mounted = true;
    const load = async (retry = false) => {
      if (!user?.id) { if (mounted) setProfile(null); return; }
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, role, credits_cents, credits, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!mounted) return;
      if (error) {
        if (!retry) setTimeout(() => load(true), 250);
        else setProfile(null);
      } else {
        setProfile((data || null) as Profile | null);
      }
    };
    void load(false);
    return () => { mounted = false; };
  }, [user?.id]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };
  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { display_name: displayName || '' } }
    });
    return { error };
  };
  const signOut = async () => {
    try {
      // Force clear local state first
      setSession(null);
      setUser(null);
      setProfile(null);
      
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Force signout with global scope
      await supabase.auth.signOut({ scope: 'global' });
      
      // Reload page to ensure complete cleanup
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Force reload even if logout fails
      window.location.reload();
    }
  };

  const value = useMemo(() => ({
    session, user, profile,
    isAdmin: (profile?.role || '').toLowerCase() === 'admin',
    loading, signIn, signUp, signOut
  }), [session, user, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
