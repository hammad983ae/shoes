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
    const onFocus = async () => {
      console.log("🔍 Tab focus - checking session...");
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      
      if (!activeSession) {
        console.log("❌ No active session found, attempting recovery...");
        const { data: { session: recovered }, error } = await supabase.auth.refreshSession();
        if (recovered) {
          console.log("✅ Session recovered successfully");
          setUser(recovered.user);
          setSession(recovered);
          await loadUserProfile(recovered.user.id);
        } else {
          console.warn("⚠️ Session could not be recovered:", error);
        }
      } else {
        console.log("✅ Active session found, updating state");
        // Session exists but make sure React state is updated
        setUser(activeSession.user);
        setSession(activeSession);
        
        // Check if session is about to expire (within 5 minutes)
        const expiresAt = activeSession.expires_at;
        const now = Math.floor(Date.now() / 1000);
        
        if (expiresAt) {
          const timeUntilExpiry = expiresAt - now;
          
          if (timeUntilExpiry < 300) { // Less than 5 minutes
            console.log("⏰ Session expiring soon, refreshing...");
            const { data: { session: refreshed }, error } = await supabase.auth.refreshSession();
            if (refreshed) {
              console.log("✅ Session refreshed successfully");
              setUser(refreshed.user);
              setSession(refreshed);
            } else {
              console.warn("⚠️ Session refresh failed:", error);
            }
          }
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
