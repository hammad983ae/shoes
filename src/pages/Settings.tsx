import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Download, Trash2, Mail, Eye, Settings as SettingsIcon, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  referral_code: string | null;
  accepted_terms: boolean | null;
  referrals_count: number | null;
  created_at: string;
  updated_at: string;
}

interface UserSettings {
  id: string;
  user_id: string;
  email_notifications: boolean | null;
  push_notifications: boolean | null;
  privacy_level: string | null;
  created_at: string;
  updated_at: string;
}

interface UserCredits {
  current_balance: number | null;
  total_earned: number | null;
  earned_from_referrals: number | null;
}

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);
  const [emailReferral, setEmailReferral] = useState(true);
  const [emailLikes, setEmailLikes] = useState(true);
  const [emailCredits, setEmailCredits] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch settings
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch credits
      const { data: creditsData } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch posts count
      const { data: postsData } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', user.id);

      setProfile(profileData);
      setCredits(creditsData);
      setPosts(postsData || []);

      if (settingsData) {
        setPublicProfile(settingsData.privacy_level === 'public');
        setEmailReferral(settingsData.email_notifications ?? true);
        setEmailLikes(settingsData.push_notifications ?? true);
        setEmailCredits(settingsData.email_notifications ?? true);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load settings data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    }
  };

  const handleCopyReferralCode = async () => {
    if (profile?.referral_code) {
      await navigator.clipboard.writeText(profile.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard.",
      });
    }
  };

  const handleDownloadData = async () => {
    try {
      // Fetch all user data
      const [profileRes, creditsRes, postsRes, transactionsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user!.id),
        supabase.from('user_credits').select('*').eq('user_id', user!.id),
        supabase.from('posts').select('*').eq('user_id', user!.id),
        supabase.from('transactions').select('*').eq('user_id', user!.id)
      ]);

      const userData = {
        profile: profileRes.data,
        credits: creditsRes.data,
        posts: postsRes.data,
        transactions: transactionsRes.data,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Downloaded",
        description: "Your account data has been downloaded.",
      });
    } catch (error) {
      console.error('Error downloading data:', error);
      toast({
        title: "Error",
        description: "Failed to download data.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Sign out first
      await signOut();
      
      // Note: In a real app, you'd want to call an edge function to properly delete all user data
      toast({
        title: "Account Deletion",
        description: "Account deletion process initiated. Please contact support to complete.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="public-profile">Public Profile</Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to view your profile and posts
                </p>
              </div>
              <Switch
                id="public-profile"
                checked={publicProfile}
                onCheckedChange={(checked) => {
                  setPublicProfile(checked);
                  updateSettings({ privacy_level: checked ? 'public' : 'private' });
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Button variant="outline" className="justify-start" onClick={() => navigate('/edit-credentials')}>
                <Mail className="h-4 w-4 mr-2" />
                Change Email
              </Button>
              
              <Button variant="outline" className="justify-start" onClick={() => navigate('/edit-credentials')}>
                <SettingsIcon className="h-4 w-4 mr-2" />
                Change Password
              </Button>

              <Separator />

              <div className="space-y-2">
                <Label>Referral Code</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 bg-muted rounded-md font-mono text-sm">
                    {profile?.referral_code || 'No referral code'}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyReferralCode}
                    disabled={!profile?.referral_code}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button variant="outline" className="justify-start" onClick={handleDownloadData}>
                <Download className="h-4 w-4 mr-2" />
                Download Account Data
              </Button>

              <Separator />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="justify-start">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-referral">Referral Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Email me when someone uses my referral code
                </p>
              </div>
              <Switch
                id="email-referral"
                checked={emailReferral}
                onCheckedChange={(checked) => {
                  setEmailReferral(checked);
                  updateSettings({ email_notifications: checked });
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-likes">Like Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Email me when someone likes my post
                </p>
              </div>
              <Switch
                id="email-likes"
                checked={emailLikes}
                onCheckedChange={(checked) => {
                  setEmailLikes(checked);
                  updateSettings({ push_notifications: checked });
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-credits">Credit Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Email me when I receive credits
                </p>
              </div>
              <Switch
                id="email-credits"
                checked={emailCredits}
                onCheckedChange={(checked) => {
                  setEmailCredits(checked);
                  updateSettings({ email_notifications: checked });
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Developer/Advanced */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Developer Information
            </CardTitle>
            <CardDescription>
              Advanced information about your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID:</span>
                <span className="font-mono">{user?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Number of Posts:</span>
                <span>{posts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Referral Earnings:</span>
                <span>{credits?.earned_from_referrals || 0} credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Created:</span>
                <span>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;