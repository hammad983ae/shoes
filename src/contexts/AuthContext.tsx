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

const AuthContext = createContext<AuthContextType | null>(null);

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

  // Session management effect - runs once on mount
  useEffect(() => {
    const updateSession = async () => {
      console.log('🔄 Re-fetching session from Supabase...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error);
        setSession(null);
        setUser(null);
        return;
      }
      
      console.log('📋 Session sync:', session ? '✅ Found & Updated' : '❌ No Session');
      setSession(session);
      setUser(session?.user ?? null);
      
      // Handle session backup for cross-tab sync
      if (session) {
        localStorage.setItem('supabase-session-backup', JSON.stringify({
          session,
          timestamp: Date.now()
        }));
      } else {
        localStorage.removeItem('supabase-session-backup');
      }
    };

    // 1. Re-fetch on window focus
    const handleFocus = () => {
      console.log('👁️ Tab focused - syncing session...');
      updateSession();
    };
    window.addEventListener('focus', handleFocus);

    // 2. Re-fetch on visibility change (tab return)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab visible - syncing session...');
        updateSession();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth event:', event, session ? '✅ Session' : '❌ No Session');
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('supabase-session-backup');
        setUserRole(null);
        setIsCreator(false);
        setProfile(null);
        setAuthStable(false);
      } else if (session) {
        // Backup session on auth events
        localStorage.setItem('supabase-session-backup', JSON.stringify({
          session,
          timestamp: Date.now()
        }));
      }
    });

    // 4. Cross-tab session synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'supabase-session-backup' && e.newValue) {
        try {
          const { session: newSession } = JSON.parse(e.newValue);
          if (newSession) {
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

    // 5. Initial session fetch on mount (after setting up listeners)
    updateSession();

    // Set loading to false after initial setup
    setLoading(false);

    // Cleanup all listeners and subscriptions
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Load user profile when user changes
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
  if (!context) {
    console.error('useAuth called outside AuthProvider. Current context:', context);
    throw new Error('useAuth must be used within an AuthProvider');
  }
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
