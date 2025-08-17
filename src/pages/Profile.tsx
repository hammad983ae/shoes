import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { useToast } from '@/hooks/use-toast';
// import { Textarea } from '@/components/ui/textarea';
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
  Bell,
  Wallet
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
  earned_from_referrals: number | null;
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


const Profile = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
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
  
  const [postAnalytics, setPostAnalytics] = useState<PostAnalytic[]>([]);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  
  // Modal states - back to original design
  const [isAvatarCropOpen, setIsAvatarCropOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Form states
  // const [editForm, setEditForm] = useState({
  //   display_name: '',
  //   bio: ''
  // });

  // Image cropping states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  // const [previewAvatar, setPreviewAvatar] = useState<string>('');
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
        // setEditForm({
        //   display_name: profileData.display_name || '',
        //   bio: profileData.bio || ''
        // });
        // setPreviewAvatar(profileData.avatar_url || '');
      }


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

      // Fetch credits from profiles table (same as wallet)
      const { data: creditsData } = await supabase
        .from('profiles')
        .select('credits')
        .eq('user_id', user.id)
        .single();

      if (creditsData) setCredits({ current_balance: creditsData.credits, total_earned: 0, total_spent: 0, earned_from_referrals: 0 });

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

      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (notificationsData) {
        setNotifications(notificationsData);
        const unreadNotifications = notificationsData.filter(n => !n.is_read);
        setUnreadCount(unreadNotifications.length);
      }

    } catch (error: any) {
      console.error('Error fetching user data:', error);
    }
  };

  // const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     setAvatarFile(file);
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       setImageSrc(reader.result as string);
  //       setIsAvatarCropOpen(true);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

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
      await uploadAvatar(croppedBlob);
      
      // setPreviewAvatar(avatarUrl);
      setIsAvatarCropOpen(false);
      setImageSrc('');
      setAvatarFile(null);
      
      toast({ title: 'Avatar updated successfully' });
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({ title: 'Error updating avatar', description: error.message, variant: 'destructive' });
    }
  };

  // const updateProfile = async () => {
  //   if (!user) return;
  //   try {
  //     const { error } = await supabase
  //       .from('profiles')
  //       .update({ 
  //         display_name: editForm.display_name, 
  //         avatar_url: previewAvatar,
  //         bio: editForm.bio
  //       })
  //       .eq('user_id', user.id);

  //     if (error) throw error;

  //     setProfile(prev => ({ 
  //       ...prev,
  //       display_name: editForm.display_name, 
  //       avatar_url: previewAvatar,
  //       bio: editForm.bio
  //     }));
  //     toast({ title: 'Profile updated successfully' });
  //   } catch (error: any) {
  //     console.error('Profile update error:', error);
  //     toast({ title: 'Error updating profile', description: error.message, variant: 'destructive' });
  //   }
  // };

  const updateSettings = async () => {
    try {
      toast({ title: 'Settings updated successfully' });
      setIsSettingsOpen(false);
    } catch (error: any) {
      toast({ title: 'Error updating settings', description: error.message, variant: 'destructive' });
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };


  if (loading) return <div className="min-h-screen flex items-center justify-center page-gradient"><span className="text-lg text-gray-400">Loading...</span></div>;
  if (!user) return <div className="p-8 text-center">Please sign in to view your profile.</div>;

  return (
    <div className="min-h-screen page-gradient flex flex-col">
      <div className="flex-1 flex items-center justify-center px-2 sm:px-4 py-4 sm:py-8 w-full">
        <div className="w-full max-w-xs sm:max-w-md mx-auto relative">
          <InteractiveParticles isActive={true} />
          
          {/* Main Profile Card - Always Rendered */}
          <div className="w-full bg-gradient-to-r from-[#111111] to-[#FFD700]/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl border border-yellow-500/50 hover:shadow-yellow-500/20 transition-all duration-300 btn-hover-glow">
              {/* Profile Header */}
              <div className="flex items-start justify-between gap-2 sm:gap-4 mb-4 sm:mb-6 w-full">
                <div className="flex items-center gap-2 sm:gap-4">
                  <Avatar className="w-12 sm:w-16 h-12 sm:h-16 border-2 border-yellow-500 shadow-lg">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-yellow-500 text-black font-bold text-lg sm:text-xl">
                      {profile.display_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      {profile.display_name || 'Anonymous User'}
                    </h2>
                    {profile.bio && (
                      <p className="text-gray-300 text-xs sm:text-sm mt-1">{profile.bio}</p>
                    )}
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">{user.email}</p>
                    <p className="text-gray-500 text-[10px] sm:text-xs mt-1">Member since {new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {/* Top Right Icons */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/wallet')}
                    className="relative text-gray-400 hover:text-yellow-500 w-8 h-8 sm:w-10 sm:h-10"
                  >
                    <Wallet className="w-4 sm:w-5 h-4 sm:h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsNotificationsOpen(true)}
                    className="relative text-gray-400 hover:text-yellow-500 w-8 h-8 sm:w-10 sm:h-10"
                  >
                    <Bell className="w-4 sm:w-5 h-4 sm:h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 sm:w-5 h-4 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Credits Section */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <Coins className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-500" />
                  <span className="text-base sm:text-lg font-bold text-white">
                    {credits?.current_balance || 0} Credits
                  </span>
                </div>
              </div>

              {/* Stats Grid - now always 3 columns, smaller on mobile */}
              <div className="grid grid-cols-3 gap-1 sm:gap-4 mb-4 sm:mb-6 w-full">
                <div className="text-center p-1.5 sm:p-3 bg-gray-800/50 rounded-lg sm:rounded-xl border border-gray-700">
                  <Users className="w-3 sm:w-5 h-3 sm:h-5 text-yellow-500 mx-auto mb-1" />
                  <div className="text-sm sm:text-lg font-bold text-white">{profile.referrals_count}</div>
                  <div className="text-[8px] sm:text-xs text-gray-400">Referred</div>
                </div>
                <div className="text-center p-1.5 sm:p-3 bg-gray-800/50 rounded-lg sm:rounded-xl border border-gray-700">
                  <Award className="w-3 sm:w-5 h-3 sm:h-5 text-yellow-500 mx-auto mb-1" />
                  <div className="text-sm sm:text-lg font-bold text-white">{posts.length}</div>
                  <div className="text-[8px] sm:text-xs text-gray-400">Posts</div>
                </div>
                <div className="text-center p-1.5 sm:p-3 bg-gray-800/50 rounded-lg sm:rounded-xl border border-gray-700">
                  <BarChart3 className="w-3 sm:w-5 h-3 sm:h-5 text-yellow-500 mx-auto mb-1" />
                  <div className="text-sm sm:text-lg font-bold text-white">{postAnalytics.reduce((sum, a) => sum + a.credits_earned, 0)}</div>
                  <div className="text-[8px] sm:text-xs text-gray-400">Earned</div>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 mb-3 sm:mb-4 w-full">
                <Button
                  onClick={() => setIsReviewsOpen(true)}
                  variant="outline"
                  className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 flex flex-col py-2 sm:py-3 h-9 sm:h-12 rounded-lg sm:rounded-xl btn-hover-glow"
                >
                  <Star className="w-3 sm:w-4 h-3 sm:h-4 mb-1" />
                  <span className="text-[10px] sm:text-xs">Reviews</span>
                </Button>
              </div>

              {/* Edit Profile Button */}
              <Button
                onClick={() => navigate('/edit-profile')}
                className="w-full mb-3 sm:mb-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold h-9 sm:h-12 rounded-lg sm:rounded-xl btn-hover-glow text-sm"
              >
                <Edit2 className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                Edit Profile
              </Button>

              {/* Bottom Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-center pt-3 sm:pt-4 border-t border-gray-700 w-full gap-1.5 sm:gap-2">
                <Button
                  onClick={() => navigate('/order-history')}
                  variant="ghost"
                  className="flex-1 text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10 transition-colors duration-200 text-xs sm:text-sm h-8 sm:h-auto"
                >
                  <History className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                  View Orders
                </Button>
                <Button
                  onClick={() => navigate('/settings')}
                  variant="ghost"
                  className="flex-1 text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10 transition-colors duration-200 text-xs sm:text-sm h-8 sm:h-auto"
                >
                  <Settings className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                  Settings
                </Button>
              </div>
            </div>

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
                  <h4 className="text-lg font-semibold text-white">Privacy</h4>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="public-profile" className="text-gray-300">Public Profile</Label>
                    <Switch
                      id="public-profile"
                      checked={settings.privacy_public_profile}
                      onCheckedChange={(checked) => setSettings({...settings, privacy_public_profile: checked})}
                    />
                  </div>
                </div>

                <Button onClick={updateSettings} className="w-full">
                  Save Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Notifications Modal */}
          <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <DialogContent className="bg-gray-900 border-gray-700 max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Notifications</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No notifications yet</p>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        notification.is_read 
                          ? 'bg-gray-800 border-gray-700' 
                          : 'bg-gray-700 border-yellow-500/30'
                      }`}
                      onClick={() => !notification.is_read && markNotificationAsRead(notification.id)}
                    >
                      <p className="text-white text-sm">{notification.message}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Footer Links - Fixed at bottom, centered and properly spaced */}
      <div className="mt-auto py-4 px-4">
        <div className="flex justify-center items-center">
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
            <Button
              variant="link"
              size="sm"
              className="text-[12px] sm:text-sm px-2 py-1 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
              onClick={() => window.open('/return-policy', '_blank')}
            >
              Return Policy
            </Button>
            <span className="text-gray-600 hidden sm:inline">|</span>
            <Button
              variant="link"
              size="sm"
              className="text-[12px] sm:text-sm px-2 py-1 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
              onClick={() => window.open('/privacy', '_blank')}
            >
              Privacy Policy
            </Button>
            <span className="text-gray-600 hidden sm:inline">|</span>
            <Button
              variant="link"
              size="sm"
              className="text-[12px] sm:text-sm px-2 py-1 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
              onClick={() => window.open('/terms', '_blank')}
            >
              Terms of Service
            </Button>
            <span className="text-gray-600 hidden sm:inline">|</span>
            <Button
              variant="link"
              size="sm"
              className="text-[12px] sm:text-sm px-2 py-1 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
              onClick={() => window.open('/opt-in-policy', '_blank')}
            >
              Opt-In Policy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;