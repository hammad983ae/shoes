import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  isCreator: boolean;
  profile: any;
  loading: boolean;
  authStable: boolean; // New: indicates auth is fully stable and ready
  signUp: (email: string, password: string, displayName?: string, referralCode?: string, acceptedTerms?: boolean) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authStable, setAuthStable] = useState(false);
  const { toast } = useToast();

  // 🔥 CORE SESSION REFRESH FUNCTION
  const refreshSession = async () => {
    try {
      console.log("🔄 Manually refreshing session...");
      const { error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("❌ Manual session refresh failed:", error);
        toast({
          title: "Session Error",
          description: "Please refresh the page or sign in again",
          variant: "destructive"
        });
        return;
      }
      
      console.log("✅ Manual session refresh successful");
      // onAuthStateChange will handle the state updates
    } catch (error) {
      console.error("💥 Session refresh threw error:", error);
    }
  };

  // 🧠 BACKEND WAKE-UP PING
  const wakeUpBackend = async () => {
    try {
      console.log("🔥 Sending backend wake-up ping...");
      await supabase.from('profiles').select('id').limit(1);
      console.log("✅ Backend wake-up ping successful");
    } catch (err) {
      console.warn("⚠️ Backend wake-up ping failed:", err);
    }
  };

  // 🔒 LOAD USER PROFILE (only when session is guaranteed)
  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_creator, display_name, avatar_url, bio, credits')
        .eq('user_id', userId)
        .single();

      console.log('Profile query result:', { data, error });

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setUserRole(data.role);
        setIsCreator(data.is_creator || false);
        setProfile(data);
        console.log('Profile loaded successfully:', data);
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };


  // 🎯 INITIAL AUTH SETUP
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log("🔄 Initializing bulletproof auth session...");

      // Send initial wake-up ping
      await wakeUpBackend();

      // Set up auth state listener FIRST to catch all events
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return;

          console.log(`🌀 Supabase auth event: ${event}`);
          
          if (session?.user) {
            console.log(`📦 Session from event: ${session.user.email}`);
            console.log(`🕐 Session expires at: ${new Date(session.expires_at! * 1000).toISOString()}`);
            console.log(`⏰ Time until expiry: ${Math.floor((session.expires_at! * 1000 - Date.now()) / 60000)} minutes`);
            console.log(`🔑 Access token length: ${session.access_token.length}`);
            console.log(`🔄 Refresh token exists: ${!!session.refresh_token}`);
          }

          // Handle different auth events
          switch (event) {
            case 'SIGNED_IN':
              console.log("✅ User signed in");
              setSession(session);
              setUser(session?.user ?? null);
              break;
              
            case 'SIGNED_OUT':
              console.log("🚪 User signed out");
              setSession(null);
              setUser(null);
              setUserRole(null);
              setIsCreator(false);
              setProfile(null);
              setAuthStable(false);
              break;
              
            case 'TOKEN_REFRESHED':
              console.log("🔄 Token refreshed successfully");
              setSession(session);
              setUser(session?.user ?? null);
              break;
              
            case 'INITIAL_SESSION':
              console.log("🏁 Initial session loaded");
              setSession(session);
              setUser(session?.user ?? null);
              
              if (session?.user) {
                console.log(`📦 Initial session found for: ${session.user.email}`);
                console.log(`🕐 Initial session expires: ${new Date(session.expires_at! * 1000).toISOString()}`);
                console.log(`⏰ Minutes until expiry: ${Math.floor((session.expires_at! * 1000 - Date.now()) / 60000)}`);
              }
              break;
              
            default:
              console.log(`🔄 Auth event: ${event}`);
              setSession(session);
              setUser(session?.user ?? null);
          }
        }
      );

      // THEN check for existing session
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("❌ Error getting initial session:", error);
        } else if (session) {
          console.log("📦 Initial session check complete");
          setSession(session);
          setUser(session.user);
        } else {
          console.log("🚫 No initial session found");
        }
      } catch (error) {
        console.error("💥 Initial session check failed:", error);
      } finally {
        setLoading(false);
      }

      return subscription;
    };

    const subscription = initializeAuth();

    return () => {
      mounted = false;
      subscription.then(sub => sub?.unsubscribe());
    };
  }, []); // Empty deps - run only once!

  // 🔒 PROFILE LOADING (only when session is confirmed stable)
  useEffect(() => {
    if (!user || !session) {
      console.log('No user or session, clearing profile state');
      setUserRole(null);
      setIsCreator(false);
      setProfile(null);
      setAuthStable(false);
      return;
    }

    // Add a small delay to ensure auth state is fully stable
    const timeoutId = setTimeout(async () => {
      console.log("🔒 Session confirmed stable, loading profile...");
      await loadUserProfile(user.id);
      setAuthStable(true); // Mark auth as fully stable
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [user, session]);

  // 🔁 ENHANCED SESSION RECOVERY ON FOCUS/VISIBILITY
  useEffect(() => {
    let sessionCheckInterval: NodeJS.Timeout | null = null;

    const handleTabFocus = async () => {
      console.log("🔍 Tab focused - checking session health...");
      
      try {
        // Step 1: Get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Error getting session on focus:", error);
          return;
        }

        if (!currentSession) {
          console.warn("⚠️ No session found on tab focus - attempting recovery...");
          
          // Step 2: Try to refresh session
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error("❌ Session refresh failed on tab focus:", refreshError);
            // Clear auth state if refresh fails
            setSession(null);
            setUser(null);
            setUserRole(null);
            setIsCreator(false);
            setProfile(null);
            setAuthStable(false);
            return;
          }

          if (refreshedSession) {
            console.log("✅ Session recovered successfully on tab focus");
            setSession(refreshedSession);
            setUser(refreshedSession.user);
            // onAuthStateChange will handle the rest
          } else {
            console.warn("⚠️ Session refresh returned null - user may need to re-login");
          }
          return;
        }

        // Step 3: Check if session is expiring soon
        const expiresAt = currentSession.expires_at;
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt ? expiresAt - now : 0;
        
        console.log(`📊 Session check on focus - expires in ${Math.floor(timeUntilExpiry / 60)} minutes`);
        
        if (timeUntilExpiry < 300) { // Less than 5 minutes
          console.log("⏰ Session expiring soon on tab focus - refreshing preemptively...");
          const { error: preemptiveRefreshError } = await supabase.auth.refreshSession();
          
          if (preemptiveRefreshError) {
            console.error("❌ Preemptive refresh failed:", preemptiveRefreshError);
          } else {
            console.log("✅ Preemptive session refresh successful");
          }
        } else {
          console.log("✅ Session healthy on tab focus");
        }

      } catch (error) {
        console.error("💥 Tab focus session check failed:", error);
      }
    };

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log("👁️ Tab became visible - initiating session recovery...");
        await handleTabFocus();
      } else {
        console.log("🙈 Tab hidden - session will be checked when visible again");
      }
    };

    // Background session health pinging (every 60 seconds)
    const startSessionPing = () => {
      if (sessionCheckInterval) return;
      
      sessionCheckInterval = setInterval(async () => {
        if (!session || document.visibilityState !== 'visible') return;
        
        try {
          console.log("💓 Background session ping...");
          const { data: { session: pingSession }, error } = await supabase.auth.getSession();
          
          if (error || !pingSession) {
            console.warn("⚠️ Background ping detected session issue - will recover on next focus");
          } else {
            const expiresAt = pingSession.expires_at;
            const now = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = expiresAt ? expiresAt - now : 0;
            
            if (timeUntilExpiry < 600) { // Less than 10 minutes
              console.log("⏰ Background ping triggering early refresh...");
              await supabase.auth.refreshSession();
            }
          }
        } catch (error) {
          console.warn("⚠️ Background session ping failed:", error);
        }
      }, 60000); // Every 60 seconds
    };

    const stopSessionPing = () => {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
        sessionCheckInterval = null;
      }
    };

    // Start background pinging if we have a session
    if (session) {
      startSessionPing();
    } else {
      stopSessionPing();
    }

    // Add event listeners
    window.addEventListener("focus", handleTabFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup function
    return () => {
      window.removeEventListener("focus", handleTabFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopSessionPing();
    };
  }, [session]); // Re-run when session changes

  // 🔥 AUTH FUNCTIONS
  const signUp = async (email: string, password: string, displayName?: string, referralCode?: string, acceptedTerms?: boolean) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName,
            referral_code: referralCode,
            accepted_terms: acceptedTerms
          }
        }
      });

      return { error };
    } catch (error) {
      console.error('SignUp error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      console.error('SignIn error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log("🚪 Signing out...");
      await supabase.auth.signOut();
      
      // Clear all state
      setUser(null);
      setSession(null);
      setUserRole(null);
      setIsCreator(false);
      setProfile(null);
      setAuthStable(false);
    } catch (error) {
      console.error('SignOut error:', error);
    }
  };

  // 🔒 SESSION STABILITY CHECK - Show fallback if session dies
  if (!session && !loading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-6 border rounded-lg bg-card">
          <div className="text-destructive text-lg font-medium">⚠️ Session Lost</div>
          <p className="text-muted-foreground">Your session has expired or been lost.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Loading state with session restoration info
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">🔄 Restoring session...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userRole,
      isCreator,
      profile,
      loading,
      authStable, // New: indicates auth is fully stable
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 🔒 SESSION GUARD HOOK - Use this in any component that needs guaranteed session
export function useAuthGuard() {
  const { session, loading, authStable } = useAuth();
  
  const isReady = !loading && authStable && session;
  
  return {
    isReady,
    session,
    loading: loading || !authStable,
    error: !loading && !session ? 'No valid session' : null
  };
}

export function isAuthenticated(user: any) {
  return !!user;
}