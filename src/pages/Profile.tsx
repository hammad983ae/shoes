import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { 
  Star, 
  Settings, 
  Edit2, 
  BarChart3,
  Users,
  Award,
  History,
  Coins,
  MessageSquare,
  Instagram,
  Youtube,
  Twitter,
  Check,
  ArrowLeft,
  Upload,
  Video
} from 'lucide-react';
import InteractiveParticles from '@/components/InteractiveParticles';

interface Transaction {
  id: string;
  product_name: string;
  product_details: any;
  amount: number;
  credits_earned: number | null;
  credits_spent: number | null;
  transaction_type: string;
  created_at: string;
}

interface UserCredits {
  current_balance: number | null;
  total_earned: number | null;
  total_spent: number | null;
}


interface Post {
  id: string;
  title: string;
  content: string | null;
  sneaker_tags: string[] | null;
  brand_tags: string[] | null;
  engagement_score: number | null;
  created_at: string;
}

interface ProfileData {
  display_name: string | null;
  avatar_url: string | null;
  referrals_count: number;
  referral_code: string | null;
  bio: string | null;
}

interface SocialConnection {
  id: string;
  platform: string;
  username: string;
  is_active: boolean;
  connected_at: string;
}

interface PostAnalytic {
  id: string;
  top_post_id: string;
  credits_earned: number;
  engagement_multiplier: number;
  calculated_at: string;
  top_posts?: {
    platform: string;
    author_username: string;
    title: string | null;
    view_count: number;
    like_count: number;
    comment_count: number;
    share_count: number;
  };
}

interface Settings {
  privacy_public_profile: boolean;
  privacy_show_email: boolean;
  notifications_email: boolean;
  notifications_push: boolean;
}

const socialPlatforms = [
  { name: 'TikTok', icon: Video, platform: 'tiktok' },
  { name: 'Instagram', icon: Instagram, platform: 'instagram' },
  { name: 'YouTube', icon: Youtube, platform: 'youtube' },
  { name: 'X (Twitter)', icon: Twitter, platform: 'x' },
  { name: 'Reddit', icon: MessageSquare, platform: 'reddit' },
];

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<ProfileData>({ 
    display_name: '', 
    avatar_url: '', 
    referrals_count: 0, 
    referral_code: null,
    bio: null
  });
  const [settings, setSettings] = useState<Settings>({
    privacy_public_profile: true,
    privacy_show_email: false,
    notifications_email: true,
    notifications_push: true
  });
  const [socialConnections, setSocialConnections] = useState<SocialConnection[]>([]);
  const [postAnalytics, setPostAnalytics] = useState<PostAnalytic[]>([]);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  
  // Modal states - back to original design
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAvatarCropOpen, setIsAvatarCropOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [isSocialsOpen, setIsSocialsOpen] = useState(false);
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: ''
  });

  // Image cropping states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [previewAvatar, setPreviewAvatar] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10
  });
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (user) fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch profile data with referral info
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, referrals_count, referral_code, bio')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile({
          display_name: profileData.display_name,
          avatar_url: profileData.avatar_url,
          referrals_count: profileData.referrals_count || 0,
          referral_code: profileData.referral_code,
          bio: profileData.bio
        });
        setEditForm({
          display_name: profileData.display_name || '',
          bio: profileData.bio || ''
        });
        setPreviewAvatar(profileData.avatar_url || '');
      }

      // Fetch social connections
      const { data: socialData } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (socialData) setSocialConnections(socialData);

      // Fetch post analytics
      const { data: analyticsData } = await supabase
        .from('post_analytics')
        .select(`
          *,
          top_posts (
            platform,
            author_username,
            title,
            view_count,
            like_count,
            comment_count,
            share_count
          )
        `)
        .eq('user_id', user.id)
        .order('calculated_at', { ascending: false });

      if (analyticsData) setPostAnalytics(analyticsData as any);

      // Fetch credits
      const { data: creditsData } = await supabase
        .from('user_credits')
        .select('current_balance, total_earned, total_spent')
        .eq('user_id', user.id)
        .single();

      if (creditsData) setCredits(creditsData);

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsData) setTransactions(transactionsData);

      // Fetch product reviews from new table
      const { data: reviewsData } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (reviewsData) setUserReviews(reviewsData);

      // Fetch posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (postsData) setPosts(postsData);

    } catch (error: any) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setIsAvatarCropOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = (image: HTMLImageElement, crop: Crop): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    // Calculate actual pixel dimensions based on crop percentages
    const cropX = (crop.x! / 100) * image.naturalWidth;
    const cropY = (crop.y! / 100) * image.naturalHeight;
    const cropWidth = (crop.width! / 100) * image.naturalWidth;
    const cropHeight = (crop.height! / 100) * image.naturalHeight;

    // Set canvas size to match the crop area
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw the cropped portion
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob(resolve as any, 'image/jpeg', 0.95);
    });
  };

  const uploadAvatar = async (blob: Blob): Promise<string> => {
    const fileName = `${user?.id}/avatar-${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, { cacheControl: '3600', upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleCropSave = async () => {
    if (!imageRef.current || !avatarFile) return;

    try {
      const croppedBlob = await getCroppedImg(imageRef.current, crop);
      const avatarUrl = await uploadAvatar(croppedBlob);
      
      setPreviewAvatar(avatarUrl);
      setIsAvatarCropOpen(false);
      setImageSrc('');
      setAvatarFile(null);
      
      toast({ title: 'Avatar updated successfully' });
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({ title: 'Error updating avatar', description: error.message, variant: 'destructive' });
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          display_name: editForm.display_name, 
          avatar_url: previewAvatar,
          bio: editForm.bio
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => ({ 
        ...prev,
        display_name: editForm.display_name, 
        avatar_url: previewAvatar,
        bio: editForm.bio
      }));
      setIsEditMode(false);
      toast({ title: 'Profile updated successfully' });
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({ title: 'Error updating profile', description: error.message, variant: 'destructive' });
    }
  };

  const updateSettings = async () => {
    try {
      toast({ title: 'Settings updated successfully' });
      setIsSettingsOpen(false);
    } catch (error: any) {
      toast({ title: 'Error updating settings', description: error.message, variant: 'destructive' });
    }
  };

  const connectSocialPlatform = async (platform: string) => {
    if (platform === 'Instagram') {
      try {
        const { facebookLogin } = await import('@/utils/facebookLogin');
        const auth = await facebookLogin();
        console.log('✅ Instagram/Facebook login success:', auth);
        // TODO: Send auth.accessToken and auth.userID to Supabase to store as linked account
        // Example:
        // await supabase.from('social_connections').insert({
        //   user_id: user?.id,
        //   platform: 'instagram',
        //   platform_user_id: auth.userID,
        //   access_token: auth.accessToken,
        //   username: 'temp_username' // Get from FB Graph API
        // });
        toast({ 
          title: 'Success!', 
          description: 'Instagram account connected successfully!' 
        });
      } catch (err) {
        console.error('❌ Login error:', err);
        toast({ 
          title: 'Connection Failed', 
          description: 'Failed to connect Instagram account. Please try again.',
          variant: 'destructive'
        });
      }
    } else {
      toast({ 
        title: 'Coming Soon', 
        description: `${platform} connection will be available soon!` 
      });
    }
  };

  const isPlatformConnected = (platform: string) => {
    return socialConnections.some(conn => conn.platform === platform && conn.is_active);
  };

  if (!user) return <div className="p-8 text-center">Please sign in to view your profile.</div>;

  return (
    <div className="min-h-screen page-gradient p-4 flex items-center justify-center relative">
      <InteractiveParticles isActive={true} />
      
      {!isEditMode ? (
        /* Main Profile Card - Original Layout */
        <div className="w-full max-w-md bg-gradient-to-r from-[#111111] to-[#FFD700]/10 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-yellow-500/50 hover:shadow-yellow-500/20 transition-all duration-300 btn-hover-glow">
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16 border-2 border-yellow-500 shadow-lg">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-yellow-500 text-black font-bold text-xl">
                {profile.display_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">
                {profile.display_name || 'Anonymous User'}
              </h2>
              {profile.bio && (
                <p className="text-gray-300 text-sm mt-1">{profile.bio}</p>
              )}
              <p className="text-gray-400 text-sm mt-1">{user.email}</p>
              <p className="text-gray-500 text-xs mt-1">Member since {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Credits Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-bold text-white">
                {credits?.current_balance || 0} Credits
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-800/50 rounded-xl border border-gray-700">
              <Users className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{profile.referrals_count}</div>
              <div className="text-xs text-gray-400">People Referred</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-xl border border-gray-700">
              <Award className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{posts.length}</div>
              <div className="text-xs text-gray-400">Posts</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-xl border border-gray-700">
              <BarChart3 className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{postAnalytics.reduce((sum, a) => sum + a.credits_earned, 0)}</div>
              <div className="text-xs text-gray-400">Credits Earned</div>
            </div>
          </div>


          {/* Quick Action Buttons */}
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setIsReviewsOpen(true)}
              variant="outline"
              className="flex-1 border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 flex flex-col py-3 h-12 rounded-xl btn-hover-glow"
            >
              <Star className="w-4 h-4 mb-1" />
              <span className="text-xs">Reviews</span>
            </Button>
            <Button
              onClick={() => setIsSocialsOpen(true)}
              variant="outline"
              className="flex-1 border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 flex flex-col py-3 h-12 rounded-xl btn-hover-glow"
            >
              <MessageSquare className="w-4 h-4 mb-1" />
              <span className="text-xs">Socials</span>
            </Button>
          </div>

          {/* Edit Profile Button */}
          <Button
            onClick={() => setIsEditMode(true)}
            className="w-full mb-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold h-12 rounded-xl btn-hover-glow"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>

          {/* Bottom Bar */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTransactionHistoryOpen(true)}
              className="text-gray-400 hover:text-white btn-hover-glow"
            >
              <History className="w-4 h-4 mr-1" />
              <span className="text-xs">History</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="text-gray-400 hover:text-white btn-hover-glow"
            >
              <Settings className="w-4 h-4 mr-1" />
              <span className="text-xs">Settings</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Edit Profile Subpage - New Design */
        <div className="w-full max-w-md bg-gradient-to-r from-[#111111] to-[#FFD700]/10 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-yellow-500/50 hover:shadow-yellow-500/20 transition-all duration-300 btn-hover-glow">
          {/* Back Button */}
          <Button
            onClick={() => setIsEditMode(false)}
            variant="ghost"
            className="mb-4 text-gray-400 hover:text-white btn-hover-glow"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>

          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-yellow-500 shadow-lg">
                <AvatarImage src={previewAvatar || undefined} />
                <AvatarFallback className="bg-yellow-500 text-black font-bold text-2xl">
                  {editForm.display_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                onClick={() => document.getElementById('avatar-upload')?.click()}
                variant="outline"
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 btn-hover-glow"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Username */}
            <div>
              <Label htmlFor="display_name" className="text-gray-300 mb-2 block">Username</Label>
              <Input
                id="display_name"
                value={editForm.display_name}
                onChange={(e) => setEditForm({...editForm, display_name: e.target.value})}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Enter your username"
              />
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio" className="text-gray-300 mb-2 block">Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={updateProfile}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold h-12 rounded-xl btn-hover-glow"
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Avatar Crop Modal */}
      <Dialog open={isAvatarCropOpen} onOpenChange={setIsAvatarCropOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Crop Avatar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {imageSrc && (
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  aspect={1}
                  className="max-w-full"
                >
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Crop preview"
                    className="max-w-full max-h-80 object-contain"
                  />
                </ReactCrop>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={() => setIsAvatarCropOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCropSave}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reviews Modal */}
      <Dialog open={isReviewsOpen} onOpenChange={setIsReviewsOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">My Reviews</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {userReviews.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No reviews yet</p>
            ) : (
              userReviews.map((review) => (
                <div key={review.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-600'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-white font-semibold">{review.rating}/5</span>
                  </div>
                  <p className="text-gray-300 mb-2">{review.review_text || 'No review text'}</p>
                  <p className="text-gray-500 text-sm">
                    Product: {review.product_id} • {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Social Connections Modal */}
      <Dialog open={isSocialsOpen} onOpenChange={setIsSocialsOpen}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Social Connections</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {socialPlatforms.map((platform) => {
              const isConnected = isPlatformConnected(platform.platform);
              const connection = socialConnections.find(conn => conn.platform === platform.platform);
              
              return (
                <div key={platform.platform} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <platform.icon className="w-6 h-6 text-yellow-500" />
                    <div>
                      <p className="text-white font-medium">{platform.name}</p>
                      {isConnected && connection && (
                        <p className="text-gray-400 text-sm">@{connection.username}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Button
                        onClick={() => connectSocialPlatform(platform.name)}
                        size="sm"
                        className="bg-yellow-500 hover:bg-yellow-600 text-black"
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* View Post Analytics Button at bottom of socials modal */}
            <div className="pt-4 border-t border-gray-700">
              <Button
                onClick={() => {
                  setIsSocialsOpen(false);
                  setIsAnalyticsOpen(true);
                }}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold h-12 rounded-xl"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Post Analytics
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post Analytics Modal */}
      <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Post Analytics Dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-yellow-500" />
                    <span className="text-white font-medium">Total Posts Tracked</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{postAnalytics.length}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <span className="text-white font-medium">Credits Earned</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {postAnalytics.reduce((sum, analytics) => sum + analytics.credits_earned, 0)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="text-white font-medium">Avg Multiplier</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {postAnalytics.length > 0 
                      ? (postAnalytics.reduce((sum, analytics) => sum + analytics.engagement_multiplier, 0) / postAnalytics.length).toFixed(1)
                      : '0.0'
                    }x
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Recent Analytics</h3>
              {postAnalytics.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No analytics data yet</p>
              ) : (
                postAnalytics.map((analytics) => (
                  <div key={analytics.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-white font-medium">
                          {analytics.top_posts?.title || 'Untitled Post'}
                        </h4>
                        <p className="text-gray-400 text-sm">
                          Platform: {analytics.top_posts?.platform} • 
                          Author: @{analytics.top_posts?.author_username}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-500 font-bold">
                          +{analytics.credits_earned} Credits
                        </div>
                        <div className="text-gray-400 text-sm">
                          {analytics.engagement_multiplier}x multiplier
                        </div>
                      </div>
                    </div>
                    
                    {analytics.top_posts && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Views:</span>
                          <span className="text-white ml-1">{analytics.top_posts.view_count?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Likes:</span>
                          <span className="text-white ml-1">{analytics.top_posts.like_count?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Comments:</span>
                          <span className="text-white ml-1">{analytics.top_posts.comment_count?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Shares:</span>
                          <span className="text-white ml-1">{analytics.top_posts.share_count?.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-gray-500 text-xs mt-2">
                      Calculated: {new Date(analytics.calculated_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction History Modal */}
      <Dialog open={isTransactionHistoryOpen} onOpenChange={setIsTransactionHistoryOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Transaction History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No transactions yet</p>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-white font-medium">{transaction.product_name}</h4>
                      <p className="text-gray-400 text-sm">{transaction.transaction_type}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">${transaction.amount}</div>
                      {transaction.credits_earned && (
                        <div className="text-green-500 text-sm">+{transaction.credits_earned} credits</div>
                      )}
                      {transaction.credits_spent && (
                        <div className="text-red-500 text-sm">-{transaction.credits_spent} credits</div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs">
                    {new Date(transaction.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Privacy</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="public-profile" className="text-gray-300">Public Profile</Label>
                <Switch
                  id="public-profile"
                  checked={settings.privacy_public_profile}
                  onCheckedChange={(checked) => setSettings({...settings, privacy_public_profile: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-email" className="text-gray-300">Show Email</Label>
                <Switch
                  id="show-email"
                  checked={settings.privacy_show_email}
                  onCheckedChange={(checked) => setSettings({...settings, privacy_show_email: checked})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="text-gray-300">Email Notifications</Label>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications_email}
                  onCheckedChange={(checked) => setSettings({...settings, notifications_email: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="text-gray-300">Push Notifications</Label>
                <Switch
                  id="push-notifications"
                  checked={settings.notifications_push}
                  onCheckedChange={(checked) => setSettings({...settings, notifications_push: checked})}
                />
              </div>
            </div>

            <Button onClick={updateSettings} className="w-full">
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;