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

  useEffect(() => {
    let mounted = true;

    // Initialize session first - REQUIRED on app load
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          console.log('Session restored:', session?.user?.id || 'none');
          setSession(session);
          setUser(session?.user ?? null);
          // Don't set loading false here - wait for profile to load
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.id || 'none');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT' || !session) {
          setUserRole(null);
          setIsCreator(false);
          setProfile(null);
          setLoading(false);
        }
        // Don't set loading false here either - let profile effect handle it
      }
    );

    // Initialize session on mount
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      console.log('No user, clearing profile state');
      setUserRole(null);
      setIsCreator(false);
      setProfile(null);
      setLoading(false); // Set loading false when no user
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
          setLoading(false); // Set loading false after handling error
          return;
        }
        
        console.log('Profile loaded successfully:', data);
        setProfile(data);
        setUserRole((data.role as 'user' | 'creator' | 'admin') ?? 'user');
        setIsCreator(Boolean(data.is_creator));
        setLoading(false); // Set loading false after successful profile load
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
        setLoading(false); // Set loading false after handling exception
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
      // Sign out from Supabase first - this handles session cleanup
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      
      // Clear local state after Supabase logout
      setUser(null);
      setSession(null);
      setUserRole(null);
      setIsCreator(false);
      setProfile(null);
      
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
      
      // Force redirect to home page
      window.location.href = '/';
    } catch (error: any) {
      console.error('Sign out failed:', error);
      // Force logout anyway
      window.location.href = '/';
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};