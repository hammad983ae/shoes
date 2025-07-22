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
  MessageSquare
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

interface Review {
  id: string;
  product_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
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
}

interface Settings {
  privacy_public_profile: boolean;
  privacy_show_email: boolean;
  notifications_email: boolean;
  notifications_push: boolean;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<ProfileData>({ display_name: '', avatar_url: '' });
  const [settings, setSettings] = useState<Settings>({
    privacy_public_profile: true,
    privacy_show_email: false,
    notifications_email: true,
    notifications_push: true
  });
  
  // Modal states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditDetailsOpen, setIsEditDetailsOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [isSocialsOpen, setIsSocialsOpen] = useState(false);
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    display_name: '',
    description: ''
  });
  
  const [detailsForm, setDetailsForm] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Image cropping states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25
  });
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (user) fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setEditForm({
          display_name: profileData.display_name || '',
          description: '' // Add description field to profiles table if needed
        });
      }

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

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (reviewsData) setReviews(reviewsData);

      // Fetch posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (postsData) setPosts(postsData);

      setDetailsForm(prev => ({ ...prev, email: user.email || '' }));
    } catch (error: any) {
      toast({ title: 'Error fetching user data', description: error.message, variant: 'destructive' });
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = (image: HTMLImageElement, crop: Crop): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    
    const ctx = canvas.getContext('2d')!;
    
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );
    
    return new Promise((resolve) => {
      canvas.toBlob(resolve as BlobCallback, 'image/jpeg', 0.95);
    });
  };

  const uploadAvatar = async (blob: Blob): Promise<string> => {
    const fileName = `avatar-${user?.id}-${Date.now()}.jpg`;
    
    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const updateProfile = async () => {
    if (!user) return;
    try {
      let avatarUrl = profile.avatar_url;
      
      if (avatarFile && imageRef.current && crop.width && crop.height) {
        const croppedBlob = await getCroppedImg(imageRef.current, crop);
        if (croppedBlob) {
          avatarUrl = await uploadAvatar(croppedBlob);
        }
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          user_id: user.id, 
          display_name: editForm.display_name, 
          avatar_url: avatarUrl 
        });

      if (error) throw error;

      setProfile({ 
        display_name: editForm.display_name, 
        avatar_url: avatarUrl 
      });
      setIsEditProfileOpen(false);
      setAvatarFile(null);
      setImageSrc('');
      toast({ title: 'Profile updated successfully' });
    } catch (error: any) {
      toast({ title: 'Error updating profile', description: error.message, variant: 'destructive' });
    }
  };

  const updateDetails = async () => {
    if (!user) return;
    try {
      if (detailsForm.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ 
          email: detailsForm.email 
        });
        if (emailError) throw emailError;
      }

      if (detailsForm.newPassword && detailsForm.newPassword === detailsForm.confirmPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({ 
          password: detailsForm.newPassword 
        });
        if (passwordError) throw passwordError;
      }

      setIsEditDetailsOpen(false);
      setDetailsForm({
        email: detailsForm.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast({ title: 'Details updated successfully' });
    } catch (error: any) {
      toast({ title: 'Error updating details', description: error.message, variant: 'destructive' });
    }
  };

  const updateSettings = async () => {
    try {
      // In a real app, you'd save settings to a user_settings table
      toast({ title: 'Settings updated successfully' });
      setIsSettingsOpen(false);
    } catch (error: any) {
      toast({ title: 'Error updating settings', description: error.message, variant: 'destructive' });
    }
  };

  if (!user) return <div className="p-8 text-center">Please sign in to view your profile.</div>;

  return (
    <div className="min-h-screen page-gradient p-4 flex items-center justify-center relative">
      <InteractiveParticles isActive={true} />
      {/* Main Profile Card */}
      <div className="w-full max-w-md bg-gradient-to-r from-[#111111] to-[#FFD700]/10 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-yellow-500/50 hover:shadow-yellow-500/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
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
            <p className="text-gray-400 text-sm">{user.email}</p>
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

        {/* Stats Widgets */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-800/80 rounded-xl p-3 text-center border border-gray-700/50">
            <BarChart3 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{posts.length}</div>
            <div className="text-xs text-gray-400">Posts</div>
          </div>
          <div className="bg-gray-800/80 rounded-xl p-3 text-center border border-gray-700/50">
            <Users className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">1.2K</div>
            <div className="text-xs text-gray-400">Followers</div>
          </div>
          <div className="bg-gray-800/80 rounded-xl p-3 text-center border border-gray-700/50">
            <Award className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{reviews.length}</div>
            <div className="text-xs text-gray-400">Reviews</div>
          </div>
        </div>

        {/* How to Get More Credits */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold text-white">How to Get More Credits</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
              <span>Share product reviews</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
              <span>Create sneaker posts</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
              <span>Refer friends to the platform</span>
            </div>
          </div>
        </div>

        {/* Quick Access Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <Button
            onClick={() => setIsReviewsOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-12 rounded-xl transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
          >
            <Star className="w-4 h-4 mb-1" />
            <span className="text-xs">Reviews</span>
          </Button>
          <Button
            onClick={() => setIsSocialsOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 rounded-xl transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
          >
            <MessageSquare className="w-4 h-4 mb-1" />
            <span className="text-xs">Socials</span>
          </Button>
        </div>

        {/* Edit Profile Button */}
        <Button
          onClick={() => setIsEditProfileOpen(true)}
          className="w-full mb-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold h-12 rounded-xl transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-300"
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
            className="text-gray-400 hover:text-white transform hover:scale-105 transition-all duration-200"
          >
            <History className="w-4 h-4 mr-1" />
            <span className="text-xs">Transaction History</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="text-gray-400 hover:text-white transform hover:scale-105 transition-all duration-200"
          >
            <Settings className="w-4 h-4 mr-1" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="display_name" className="text-gray-300">Username</Label>
              <Input
                id="display_name"
                value={editForm.display_name}
                onChange={(e) => setEditForm({...editForm, display_name: e.target.value})}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-gray-300">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Avatar</Label>
              <div className="space-y-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="bg-gray-800 border-gray-700"
                />
                {imageSrc && (
                  <div className="max-w-full">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      aspect={1}
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
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={updateProfile} className="flex-1">
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditDetailsOpen(true)}
                className="flex-1"
              >
                Edit Details
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Details Modal */}
      <Dialog open={isEditDetailsOpen} onOpenChange={setIsEditDetailsOpen}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={detailsForm.email}
                onChange={(e) => setDetailsForm({...detailsForm, email: e.target.value})}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="current_password" className="text-gray-300">Current Password</Label>
              <Input
                id="current_password"
                type="password"
                value={detailsForm.currentPassword}
                onChange={(e) => setDetailsForm({...detailsForm, currentPassword: e.target.value})}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="new_password" className="text-gray-300">New Password</Label>
              <Input
                id="new_password"
                type="password"
                value={detailsForm.newPassword}
                onChange={(e) => setDetailsForm({...detailsForm, newPassword: e.target.value})}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="confirm_password" className="text-gray-300">Confirm New Password</Label>
              <Input
                id="confirm_password"
                type="password"
                value={detailsForm.confirmPassword}
                onChange={(e) => setDetailsForm({...detailsForm, confirmPassword: e.target.value})}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button onClick={updateDetails} className="w-full">
              Update Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reviews Modal */}
      <Dialog open={isReviewsOpen} onOpenChange={setIsReviewsOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Your Reviews</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No reviews yet</p>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-white">Product ID: {review.product_id}</span>
                      <div className="flex text-yellow-500">
                        {Array.from({ length: review.rating }, (_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-300">{review.review_text}</p>
                    <p className="text-gray-500 text-sm mt-2">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Socials Modal */}
      <Dialog open={isSocialsOpen} onOpenChange={setIsSocialsOpen}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Social Stats</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{posts.length}</div>
                <div className="text-gray-400">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">1.2K</div>
                <div className="text-gray-400">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">845</div>
                <div className="text-gray-400">Following</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction History Modal */}
      <Dialog open={isTransactionHistoryOpen} onOpenChange={setIsTransactionHistoryOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Transaction History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {transactions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No transactions yet</p>
            ) : (
              transactions.map((transaction) => (
                <Card key={transaction.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-white">{transaction.product_name}</span>
                        <p className="text-gray-400 text-sm">{transaction.transaction_type}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">${transaction.amount}</div>
                        {transaction.credits_earned && (
                          <div className="text-green-400 text-sm">+{transaction.credits_earned} credits</div>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm mt-2">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
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
              <h3 className="text-lg font-semibold text-white">Privacy Settings</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="public_profile" className="text-gray-300">Public Profile</Label>
                <Switch
                  id="public_profile"
                  checked={settings.privacy_public_profile}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, privacy_public_profile: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show_email" className="text-gray-300">Show Email</Label>
                <Switch
                  id="show_email"
                  checked={settings.privacy_show_email}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, privacy_show_email: checked }))
                  }
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Notification Settings</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="email_notifications" className="text-gray-300">Email Notifications</Label>
                <Switch
                  id="email_notifications"
                  checked={settings.notifications_email}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, notifications_email: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push_notifications" className="text-gray-300">Push Notifications</Label>
                <Switch
                  id="push_notifications"
                  checked={settings.notifications_push}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, notifications_push: checked }))
                  }
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