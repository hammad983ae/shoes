import React, { useEffect, useState } from 'react';
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
import { 
  CreditCard, 
  Star, 
  Settings, 
  Edit2, 
  Upload,
  BarChart3,
  Users,
  Award,
  History,
  Crown
} from 'lucide-react';

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

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<ProfileData>({ display_name: '', avatar_url: '' });
  
  // Modal states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditDetailsOpen, setIsEditDetailsOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [isSocialsOpen, setIsSocialsOpen] = useState(false);
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false);
  const [isManageMembershipOpen, setIsManageMembershipOpen] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    display_name: '',
    avatar_url: '',
    description: ''
  });
  
  const [detailsForm, setDetailsForm] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    const { data: transactionData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (transactionData) setTransactions(transactionData);

    const { data: creditsData } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (creditsData) setCredits(creditsData);

    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (reviewsData) setReviews(reviewsData);

    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (postsData) setPosts(postsData);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileData) {
      setProfile({
        display_name: profileData.display_name || '',
        avatar_url: profileData.avatar_url || ''
      });
      setEditForm({
        display_name: profileData.display_name || '',
        avatar_url: profileData.avatar_url || '',
        description: ''
      });
      setDetailsForm({
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setEditForm(prev => ({ ...prev, avatar_url: previewUrl }));
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    try {
      let avatarUrl = editForm.avatar_url;

      // Upload avatar if a file was selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}/avatar.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        avatarUrl = data.publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          display_name: editForm.display_name, 
          avatar_url: avatarUrl 
        })
        .eq('user_id', user.id);
      
      if (error) throw error;

      setProfile({ 
        display_name: editForm.display_name, 
        avatar_url: avatarUrl 
      });
      setIsEditProfileOpen(false);
      setAvatarFile(null);
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

  if (!user) return <div className="p-8 text-center">Please sign in to view your profile.</div>;

  const membershipLevel = "GOLD"; // Could be determined by credits/posts
  const pointsToNext = 750; // Example calculation

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 flex items-center justify-center">
      {/* Main Profile Card */}
      <div className="w-full max-w-md bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-700">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-16 h-16 border-2 border-yellow-500 shadow-lg">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-yellow-500 text-black font-bold text-xl">
              {profile.display_name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">
                {profile.display_name || 'Anonymous User'}
              </h2>
              <div className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full text-xs font-bold text-black">
                {membershipLevel}
              </div>
            </div>
            <p className="text-gray-400 text-sm">{user.email}</p>
            <p className="text-gray-500 text-xs mt-1">Member since March 2021</p>
          </div>
        </div>

        {/* Points Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-lg font-bold text-white">
              {credits?.current_balance || 0} Points
            </span>
          </div>
          <p className="text-gray-400 text-sm">{pointsToNext} points to platinum</p>
        </div>

        {/* Membership Card */}
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl border border-gray-600 relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
              <Crown className="w-4 h-4 text-black" />
            </div>
          </div>
          <div className="text-xs text-gray-400 mb-1">MEMBERSHIP CARD</div>
          <div className="text-lg font-mono text-white mb-2">•••• •••• •••• 5678</div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs text-gray-400">MEMBER NAME</div>
              <div className="text-sm font-semibold text-white">
                {profile.display_name || 'Anonymous User'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">EXPIRES</div>
              <div className="text-sm font-semibold text-white">09/25</div>
            </div>
          </div>
        </div>

        {/* Stats Widgets */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-800 rounded-xl p-3 text-center border border-gray-700">
            <BarChart3 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{posts.length}</div>
            <div className="text-xs text-gray-400">Posts</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 text-center border border-gray-700">
            <Users className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">1.2K</div>
            <div className="text-xs text-gray-400">Followers</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 text-center border border-gray-700">
            <Award className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{reviews.length}</div>
            <div className="text-xs text-gray-400">Reviews</div>
          </div>
        </div>

        {/* Membership Benefits */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold text-white">Membership Benefits</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
              <span>Priority customer support</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
              <span>Free shipping on all orders</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
              <span>Early access to new products</span>
            </div>
          </div>
        </div>

        {/* Quick Access Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <Button
            onClick={() => setIsCreditsOpen(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white h-12 rounded-xl"
          >
            <CreditCard className="w-4 h-4 mb-1" />
            <span className="text-xs">Credits</span>
          </Button>
          <Button
            onClick={() => setIsReviewsOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-12 rounded-xl"
          >
            <Star className="w-4 h-4 mb-1" />
            <span className="text-xs">Reviews</span>
          </Button>
          <Button
            onClick={() => setIsSocialsOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 rounded-xl"
          >
            <Users className="w-4 h-4 mb-1" />
            <span className="text-xs">Socials</span>
          </Button>
        </div>

        {/* Edit Profile Button */}
        <Button
          onClick={() => setIsEditProfileOpen(true)}
          className="w-full mb-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold h-12 rounded-xl"
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
            className="text-gray-400 hover:text-white"
          >
            <History className="w-4 h-4 mr-1" />
            <span className="text-xs">Transaction History</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsManageMembershipOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Settings className="w-4 h-4 mr-1" />
            <span className="text-xs">Manage Membership</span>
          </Button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 text-white rounded-2xl border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-2">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24 border-2 border-yellow-500">
                <AvatarImage src={editForm.avatar_url} />
                <AvatarFallback className="bg-yellow-500 text-black text-2xl font-bold">
                  {editForm.display_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  id="avatar-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Avatar
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="display_name">Username</Label>
              <Input 
                id="display_name" 
                value={editForm.display_name} 
                onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={editForm.description} 
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={updateProfile} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black">
                Save Changes
              </Button>
              <Button
                onClick={() => setIsEditDetailsOpen(true)}
                variant="outline"
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                Edit Details
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Details Modal */}
      <Dialog open={isEditDetailsOpen} onOpenChange={setIsEditDetailsOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 text-white rounded-2xl border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={detailsForm.email} 
                onChange={(e) => setDetailsForm({ ...detailsForm, email: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input 
                id="currentPassword" 
                type="password"
                value={detailsForm.currentPassword} 
                onChange={(e) => setDetailsForm({ ...detailsForm, currentPassword: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword" 
                type="password"
                value={detailsForm.newPassword} 
                onChange={(e) => setDetailsForm({ ...detailsForm, newPassword: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword" 
                type="password"
                value={detailsForm.confirmPassword} 
                onChange={(e) => setDetailsForm({ ...detailsForm, confirmPassword: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={updateDetails} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black">
                Update Details
              </Button>
              <Button onClick={() => setIsEditDetailsOpen(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credits Modal */}
      <Dialog open={isCreditsOpen} onOpenChange={setIsCreditsOpen}>
        <DialogContent className="sm:max-w-lg bg-gray-900 text-white rounded-2xl border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-400" />
              Credits Overview
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 p-2">
            <Card className="bg-gray-800 border-gray-600 p-4 text-center">
              <CardContent className="p-0">
                <div className="text-2xl font-bold text-green-400">{credits?.current_balance || 0}</div>
                <div className="text-sm text-gray-400">Current</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-600 p-4 text-center">
              <CardContent className="p-0">
                <div className="text-2xl font-bold text-blue-400">{credits?.total_earned || 0}</div>
                <div className="text-sm text-gray-400">Earned</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-600 p-4 text-center">
              <CardContent className="p-0">
                <div className="text-2xl font-bold text-red-400">{credits?.total_spent || 0}</div>
                <div className="text-sm text-gray-400">Spent</div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reviews Modal */}
      <Dialog open={isReviewsOpen} onOpenChange={setIsReviewsOpen}>
        <DialogContent className="sm:max-w-2xl bg-gray-900 text-white rounded-2xl border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-400" />
              Your Reviews
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto p-2">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="p-4 bg-gray-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                        />
                      ))}
                      <span className="text-sm text-gray-400 ml-2">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{review.review_text || 'No comment'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Socials Modal */}
      <Dialog open={isSocialsOpen} onOpenChange={setIsSocialsOpen}>
        <DialogContent className="sm:max-w-lg bg-gray-900 text-white rounded-2xl border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Social Stats
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-2">
            <div className="flex justify-between items-center p-4 bg-gray-800 rounded-xl">
              <span>Followers</span>
              <span className="font-bold text-blue-400">1,234</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-800 rounded-xl">
              <span>Following</span>
              <span className="font-bold text-green-400">567</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-800 rounded-xl">
              <span>Posts</span>
              <span className="font-bold text-purple-400">{posts.length}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction History Modal */}
      <Dialog open={isTransactionHistoryOpen} onOpenChange={setIsTransactionHistoryOpen}>
        <DialogContent className="sm:max-w-2xl bg-gray-900 text-white rounded-2xl border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-yellow-400" />
              Transaction History
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto p-2">
            {transactions.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No transactions yet.</p>
            ) : (
              <div className="space-y-3">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="flex justify-between items-center p-4 bg-gray-800 rounded-xl">
                    <div>
                      <h3 className="font-semibold">{transaction.product_name}</h3>
                      <p className="text-sm text-gray-400">{new Date(transaction.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${transaction.amount}</p>
                      {transaction.credits_earned && (
                        <p className="text-green-400 text-sm">+{transaction.credits_earned} credits</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Membership Modal */}
      <Dialog open={isManageMembershipOpen} onOpenChange={setIsManageMembershipOpen}>
        <DialogContent className="sm:max-w-lg bg-gray-900 text-white rounded-2xl border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-yellow-400" />
              Manage Membership
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-2">
            <div className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 cursor-pointer transition-colors">
              <h3 className="font-semibold mb-2">Privacy Settings</h3>
              <p className="text-sm text-gray-400">Control who can see your profile and activities</p>
            </div>
            <div className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 cursor-pointer transition-colors">
              <h3 className="font-semibold mb-2">Notifications</h3>
              <p className="text-sm text-gray-400">Manage email and push notification preferences</p>
            </div>
            <div className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 cursor-pointer transition-colors">
              <h3 className="font-semibold mb-2">Membership Upgrade</h3>
              <p className="text-sm text-gray-400">Upgrade to Platinum for exclusive benefits</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;