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

  // 2) Enhanced session recovery - handles page refresh/tab switch null sessions
  useEffect(() => {
    const recoverSession = async () => {
      if (refRefreshing.current) return;
      refRefreshing.current = true;
      
      try {
        // First check current session
        let { data: sessionData } = await supabase.auth.getSession();
        
        // If session is null, try to refresh it
        if (!sessionData.session) {
          console.log('Session null, attempting refresh...');
          const { data: refreshData, error } = await supabase.auth.refreshSession();
          
          if (!error && refreshData.session) {
            console.log('Session recovered successfully');
            setSession(refreshData.session);
            setUser(refreshData.session.user);
          } else {
            // If refresh fails, try one more getSession call
            const { data: finalCheck } = await supabase.auth.getSession();
            setSession(finalCheck.session ?? null);
            setUser(finalCheck.session?.user ?? null);
          }
        } else {
          setSession(sessionData.session);
          setUser(sessionData.session.user);
        }
      } catch (error) {
        console.error('Session recovery failed:', error);
      } finally {
        refRefreshing.current = false;
      }
    };

    // Trigger on page focus and visibility change
    const onFocus = () => { void recoverSession(); };
    const onVisibilityChange = () => { 
      if (document.visibilityState === 'visible') {
        void recoverSession(); 
      }
    };

    // Also trigger on page load if we detect a missing session
    const checkOnLoad = () => {
      if (!session && !loading) {
        void recoverSession();
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    
    // Check immediately if we're missing a session
    checkOnLoad();

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [session, loading]);

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
    await supabase.auth.signOut();
    setProfile(null);
  };

  const value = useMemo(() => ({
    session, user, profile,
    isAdmin: (profile?.role || '').toLowerCase() === 'admin',
    loading, signIn, signUp, signOut
  }), [session, user, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
