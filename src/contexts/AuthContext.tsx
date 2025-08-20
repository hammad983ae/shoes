import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  role: string;
  is_creator: boolean;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  credits: number | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  isCreator: boolean;
  profile: Profile | null;
  loading: boolean;
  authStable: boolean;
  signUp: (email: string, password: string, displayName: string, referralCode: string, acceptedTerms: boolean) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
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

  const loadUserProfile = async (userId: string) => {
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
    let isRefreshing = false;
    let sessionInterval: NodeJS.Timeout | null = null;

    const refreshIfNeeded = async () => {
      if (isRefreshing) return;
      isRefreshing = true;

      try {
        const { data, error } = await supabase.auth.getSession();
        const session = data?.session;

        if (error || !session) {
          console.warn("No session found on visibilitychange, attempting refresh...");
          const { data: refreshedData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error("Refresh session failed", refreshError);
            setUser(null);
            setSession(null);
          } else {
            console.log("Session refreshed on tab focus:", refreshedData.session);
            setUser(refreshedData.session?.user || null);
            setSession(refreshedData.session);
            if (refreshedData.session?.user) {
              await loadUserProfile(refreshedData.session.user.id);
            }
          }
        } else {
          const now = Date.now() / 1000;
          const expiresIn = session.expires_at ? session.expires_at - now : 0;

          console.log("Session is valid, expires in", Math.floor(expiresIn), "seconds");
          setUser(session.user);
          setSession(session);

          if (expiresIn < 300) {
            console.log("Token expiring soon, refreshing...");
            const { data: refreshedData, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshedData.session) {
              setUser(refreshedData.session.user);
              setSession(refreshedData.session);
            } else if (refreshError) {
              console.error("Token refresh failed:", refreshError);
            }
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        isRefreshing = false;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        console.log("[Auth] Tab is visible — checking session");
        refreshIfNeeded();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    sessionInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshIfNeeded();
      }
    }, 60000);

    refreshIfNeeded();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (sessionInterval) clearInterval(sessionInterval);
    };
  }, []);

  const signUp = async (email: string, password: string, displayName: string, referralCode: string, acceptedTerms: boolean) => {
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

  const signIn = async (email: string, password: string) => {
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

export function isAuthenticated(user: User | null) {
  return !!user;
}
