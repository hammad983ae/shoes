import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authStable, setAuthStable] = useState(false);
  const { toast } = useToast();

  const refreshSession = async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Session refresh error:", error);
        toast({ title: "Session Error", description: "Please sign in again", variant: "destructive" });
      }
    } catch (error) {
      console.error("Refresh session failed:", error);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_creator, display_name, avatar_url, bio, credits')
        .eq('user_id', userId)
        .single();

      if (data) {
        setUserRole(data.role);
        setIsCreator(data.is_creator || false);
        setProfile(data);
      } else if (error) {
        console.error("Profile fetch error:", error);
      }
    } catch (error) {
      console.error("loadUserProfile error:", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setUserRole(null);
          setIsCreator(false);
          setProfile(null);
          setAuthStable(false);
        } else {
          setUser(session?.user ?? null);
          setSession(session);
        }
      });

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        setUser(currentSession.user);
        setSession(currentSession);
      }

      setLoading(false);
      return subscription;
    };

    const sub = init();
    return () => {
      mounted = false;
      sub.then((s) => s?.unsubscribe());
    };
  }, []);

  useEffect(() => {
    if (!user || !session) {
      setUserRole(null);
      setIsCreator(false);
      setProfile(null);
      setAuthStable(false);
      return;
    }

    const timer = setTimeout(async () => {
      await loadUserProfile(user.id);
      setAuthStable(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [user, session]);

  useEffect(() => {
    const onFocus = async () => {
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      if (!activeSession) {
        const { data: { session: recovered }, error } = await supabase.auth.refreshSession();
        if (recovered) {
          setUser(recovered.user);
          setSession(recovered);
        } else {
          console.warn("Session could not be recovered:", error);
        }
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === 'visible') onFocus();
    });

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  const signUp = async (email, password, displayName, referralCode, acceptedTerms) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: displayName, referral_code: referralCode, accepted_terms: acceptedTerms },
      },
    });
    return { error };
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setIsCreator(false);
    setProfile(null);
    setAuthStable(false);
  };

  if (!session && !loading && user) {
    return <div className="min-h-screen flex items-center justify-center">Session Lost. Please refresh.</div>;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading session...</div>;
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userRole,
      isCreator,
      profile,
      loading,
      authStable,
      signUp,
      signIn,
      signOut,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export function useAuthGuard() {
  const { session, loading, authStable } = useAuth();
  return {
    isReady: !loading && authStable && session,
    session,
    loading: loading || !authStable,
    error: !loading && !session ? 'No valid session' : null,
  };
}

export function isAuthenticated(user) {
  return !!user;
}
