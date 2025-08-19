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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserRole(null);
      setIsCreator(false);
      setProfile(null);
      return;
    }
    
    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, is_creator, display_name, avatar_url, bio, credits')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Profile query error:', error);
          setUserRole('user');
          setIsCreator(false);
          setProfile(null);
          return;
        }
        
        if (!data) {
          // Create profile if it doesn't exist
          const defaultProfile = {
            user_id: user.id,
            display_name: user.email?.split('@')[0] || 'User',
            role: 'user',
            is_creator: false,
            bio: '',
            credits: 0
          };
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert(defaultProfile)
            .select('role, is_creator, display_name, avatar_url, bio, credits')
            .single();
            
          if (createError) {
            console.error('Failed to create profile:', createError);
            setUserRole('user');
            setIsCreator(false);
            setProfile(defaultProfile);
          } else {
            setProfile(newProfile);
            setUserRole('user');
            setIsCreator(false);
          }
        } else {
          setProfile(data);
          setUserRole((data.role as 'user' | 'creator' | 'admin') ?? 'user');
          setIsCreator(Boolean(data.is_creator));
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
        setUserRole('user');
        setIsCreator(false);
        setProfile(null);
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
      // Clear local state first
      setUser(null);
      setSession(null);
      setUserRole(null);
      setIsCreator(false);
      setProfile(null);
      
      // Clear localStorage
      localStorage.clear();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
      
      // Force redirect to home page
      window.location.href = '/';
    } catch (error: any) {
      console.error('Sign out failed:', error);
      // Force logout anyway
      localStorage.clear();
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