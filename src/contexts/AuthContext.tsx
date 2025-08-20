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
      console.log("🔄 Forcing session refresh...");
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Session refresh error:", error);
        // Clear localStorage if refresh fails
        localStorage.removeItem('supabase-session-backup');
        toast({ title: "Session Error", description: "Please sign in again", variant: "destructive" });
      } else if (data.session) {
        console.log("✅ Session refreshed successfully");
        // Backup session to localStorage
        localStorage.setItem('supabase-session-backup', JSON.stringify({
          session: data.session,
          timestamp: Date.now()
        }));
        setSession(data.session);
        setUser(data.session.user);
      }
    } catch (error) {
      console.error("Refresh session failed:", error);
      localStorage.removeItem('supabase-session-backup');
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
      // 🎯 ENHANCED SESSION RECOVERY WITH CROSS-TAB SYNC
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        
        console.log(`🔔 Auth event: ${event}`, session ? 'with session' : 'no session');
        
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('supabase-session-backup');
          setUser(null);
          setSession(null);
          setUserRole(null);
          setIsCreator(false);
          setProfile(null);
          setAuthStable(false);
        } else if (session) {
          // Backup session to localStorage on every auth event
          localStorage.setItem('supabase-session-backup', JSON.stringify({
            session,
            timestamp: Date.now()
          }));
          setUser(session.user);
          setSession(session);
        }
      });

      // 🚀 AGGRESSIVE SESSION RECOVERY LOGIC
      const recoverSession = async () => {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          console.log("✅ Session found directly");
          setUser(currentSession.user);
          setSession(currentSession);
        } else {
          console.log("⚠️ No session from getSession(), trying recovery...");
          
          // Try localStorage backup first
          const backup = localStorage.getItem('supabase-session-backup');
          if (backup) {
            try {
              const { session: backedUpSession, timestamp } = JSON.parse(backup);
              const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1000; // 24 hours
              
              if (isRecent && backedUpSession?.expires_at) {
                const expiresAt = backedUpSession.expires_at * 1000;
                const isStillValid = expiresAt > Date.now();
                
                if (isStillValid) {
                  console.log("🔄 Attempting session recovery from localStorage backup");
                  await refreshSession();
                  return;
                }
              }
            } catch (e) {
              console.warn("Invalid session backup in localStorage");
              localStorage.removeItem('supabase-session-backup');
            }
          }
          
          // Force refresh as last resort
          console.log("🔄 Forcing session refresh as last resort");
          await refreshSession();
        }
      };
      
      await recoverSession();
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
    const updateUserFromSession = async () => {
      console.log('🔄 Updating user from session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error);
        return;
      }
      
      console.log('📋 Session status:', session ? '✅ Found' : '❌ Missing');
      setSession(session);
      setUser(session?.user ?? null);
    };

    // 1. Recheck when the window regains focus
    window.addEventListener('focus', updateUserFromSession);

    // 2. Recheck on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab became visible - syncing session...');
        updateUserFromSession();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. On mount, get session once
    updateUserFromSession();

    // 4. Cross-tab session synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'supabase-session-backup' && e.newValue) {
        try {
          const { session: newSession } = JSON.parse(e.newValue);
          if (newSession && (!session || session.access_token !== newSession.access_token)) {
            console.log("🔄 Session updated from another tab");
            setSession(newSession);
            setUser(newSession.user);
          }
        } catch (error) {
          console.warn("Failed to parse session from storage event");
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener('focus', updateUserFromSession);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
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
