import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: 'user' | 'creator' | 'admin' | null;
  isCreator: boolean;
  profile: any; // Add profile to context
  signUp: (email: string, password: string, displayName?: string, referralCode?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function isAuthenticated(user: any) {
  return !!user;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'user' | 'creator' | 'admin' | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();

  // Remove the debug logs that were causing noise during normal React rendering
  // These were triggering during legitimate React remounts and causing confusion

  useEffect(() => {
    let mounted = true;

    console.log("🔄 Initializing auth session...");

    // Set up auth state listener FIRST to catch all events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("🌀 Supabase auth event:", event);
        console.log("📦 Session from event:", session?.user?.email || 'none');
        
        // Handle ALL auth events properly
        switch (event) {
          case 'INITIAL_SESSION':
            console.log("🏁 Initial session loaded");
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            break;
            
          case 'SIGNED_IN':
            console.log("✅ User signed in");
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            break;
            
          case 'SIGNED_OUT':
            console.log("👋 User signed out");
            setSession(null);
            setUser(null);
            setUserRole(null);
            setIsCreator(false);
            setProfile(null);
            setLoading(false);
            break;
            
          case 'TOKEN_REFRESHED':
            console.log("🔄 Token refreshed successfully");
            // CRITICAL: Update session with new tokens
            setSession(session);
            setUser(session?.user ?? null);
            break;
            
          case 'USER_UPDATED':
            console.log("👤 User updated");
            setSession(session);
            setUser(session?.user ?? null);
            break;
            
          default:
            console.log(`🤷‍♂️ Unhandled auth event: ${event}`);
            if (session) {
              setSession(session);
              setUser(session?.user ?? null);
            }
        }
      }
    );

    // Get initial session AFTER setting up listener
    supabase.auth.getSession().then(({ error }) => {
      if (error) {
        console.error('❌ Error getting initial session:', error);
        setLoading(false);
        return;
      }
      
      // Initial session is handled by INITIAL_SESSION event
      console.log("📦 Initial session check complete");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty deps - run only once!

  useEffect(() => {
    if (!user) {
      console.log('No user, clearing profile state');
      setUserRole(null);
      setIsCreator(false);
      setProfile(null);
      // DON'T set loading false here - let session restoration handle it
      return;
    }
    
    console.log('Loading profile for user:', user.id);
    
    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, is_creator, display_name, avatar_url, bio, credits')
          .eq('user_id', user.id)
          .single();
        
        console.log('Profile query result:', { data, error });
        
        if (error) {
          console.error('Profile query error:', error);
          
          // Create profile if it doesn't exist
          if (error.code === 'PGRST116') {
            console.log('Creating new profile for user');
            const newProfile = {
              user_id: user.id,
              display_name: user.email?.split('@')[0] || 'User',
              role: 'user',
              is_creator: false,
              bio: '',
              credits: 0
            };
            
            const { data: insertData, error: insertError } = await supabase
              .from('profiles')
              .insert(newProfile)
              .select()
              .single();
              
            if (insertError) {
              console.error('Failed to create profile:', insertError);
              setUserRole('user');
              setIsCreator(false);
              setProfile(newProfile);
            } else {
              console.log('Profile created successfully:', insertData);
              setProfile(insertData);
              setUserRole(insertData.role as 'user' | 'creator' | 'admin');
              setIsCreator(Boolean(insertData.is_creator));
            }
          } else {
            // Use defaults for other errors
            const defaultProfile = {
              display_name: user.email?.split('@')[0] || 'User',
              role: 'user',
              is_creator: false,
              bio: '',
              credits: 0
            };
            setUserRole('user');
            setIsCreator(false);
            setProfile(defaultProfile);
          }
          return;
        }
        
        console.log('Profile loaded successfully:', data);
        setProfile(data);
        setUserRole((data.role as 'user' | 'creator' | 'admin') ?? 'user');
        setIsCreator(Boolean(data.is_creator));
      } catch (e) {
        console.error('Failed to load profile:', e);
        const defaultProfile = {
          display_name: user.email?.split('@')[0] || 'User',
          role: 'user',
          is_creator: false,
          bio: '',
          credits: 0
        };
        setUserRole('user');
        setIsCreator(false);
        setProfile(defaultProfile);
      }
    };
    
    loadProfile();
  }, [user]);

  const signUp = async (email: string, password: string, displayName?: string, referralCode?: string, acceptedTerms?: boolean) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName || email.split('@')[0],
            referral_code: referralCode || localStorage.getItem('referral_code') || null,
            accepted_terms: acceptedTerms || false
          }
        }
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Show success toast when signup is successful (regardless of confirmation status)
        if (referralCode) {
          toast({
            title: "Welcome! 🎉", 
            description: "Check your email for confirmation. You'll get 10% off your first order!",
          });
        } else {
          toast({
            title: "Confirmation email sent",
            description: "Check your email for a confirmation link to complete your registration.",
          });
        }
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Force clear all state immediately
      setLoading(true);
      setUser(null);
      setSession(null);
      setUserRole(null);
      setIsCreator(false);
      setProfile(null);
      
      // Clear all Supabase auth data
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear any remaining localStorage auth data
      localStorage.removeItem('sb-uvczawicaqqiyutcqoyg-auth-token');
      localStorage.removeItem('supabase.auth.token');
      
      // Clear session storage as well
      sessionStorage.clear();
      
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
      
      // Force complete page reload to reset everything
      window.location.replace('/');
    } catch (error: any) {
      console.error('Sign out failed:', error);
      
      // Force clear everything even if signOut fails
      setUser(null);
      setSession(null);
      setUserRole(null);
      setIsCreator(false);
      setProfile(null);
      
      // Clear storage manually
      localStorage.clear();
      sessionStorage.clear();
      
      // Force reload anyway
      window.location.replace('/');
    }
  };

  const value = {
    user,
    session,
    loading,
    userRole,
    isCreator,
    profile,
    signUp,
    signIn,
    signOut,
  };

  // Block rendering until session is fully restored
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Restoring session...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};