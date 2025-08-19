import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CreatorSignup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [inviteData, setInviteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link');
      setLoading(false);
      return;
    }

    fetchInviteData();
  }, [token]);

  const fetchInviteData = async () => {
    try {
      const { data, error } = await supabase
        .from('creator_invites')
        .select('*')
        .eq('invite_token', token!)
        .eq('status', 'pending')
        .single();

      if (error) throw error;

      if (!data) {
        setError('Invalid or expired invite link');
        return;
      }

      setInviteData(data);
      setFormData(prev => ({
        ...prev,
        email: data.email,
        displayName: data.display_name || ''
      }));
    } catch (error: any) {
      console.error('Error fetching invite:', error);
      setError('Failed to load invite data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setSignupLoading(true);
    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: formData.displayName,
            accepted_terms: true,
            is_creator: true,
            creator_tier: inviteData.tier,
            coupon_code: inviteData.coupon_code,
            starting_credits: inviteData.starting_credits
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update the invite status
        await supabase
          .from('creator_invites')
          .update({ status: 'accepted' })
          .eq('invite_token', token!);

        // Update the user's profile to make them a creator
        await supabase
          .from('profiles')
          .update({
            is_creator: true,
            creator_tier: inviteData.tier,
            coupon_code: inviteData.coupon_code,
            credits: inviteData.starting_credits || 0,
            commission_rate: inviteData.tier === 'tier3' ? 0.20 : 
                           inviteData.tier === 'tier2' ? 0.15 : 0.10
          })
          .eq('user_id', authData.user.id);

        // Add the coupon code to the coupon_codes table
        await supabase
          .from('coupon_codes')
          .insert({
            creator_id: authData.user.id,
            code: inviteData.coupon_code,
            is_active: true
          });

        toast({
          title: "Welcome to Crallux!",
          description: "Your creator account has been set up successfully. Please check your email to confirm your account.",
        });

        // Redirect to dashboard
        navigate('/creator');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setSignupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading invite...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invalid Invite</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle>Join Crallux as a Creator</CardTitle>
          <CardDescription>
            You've been invited to join our creator program
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Your Creator Details</h3>
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Email:</span> {inviteData.email}</p>
                <p><span className="text-muted-foreground">Tier:</span> {inviteData.tier} ({inviteData.tier === 'tier1' ? '10%' : inviteData.tier === 'tier2' ? '15%' : '20%'} commission)</p>
                <p><span className="text-muted-foreground">Coupon Code:</span> {inviteData.coupon_code}</p>
                {inviteData.starting_credits > 0 && (
                  <p><span className="text-muted-foreground">Starting Credits:</span> {inviteData.starting_credits}</p>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Your display name"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Choose a secure password"
                required
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={signupLoading}
            >
              {signupLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Creator Account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorSignup;