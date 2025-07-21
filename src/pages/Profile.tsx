import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, ShoppingBag, Star, TrendingUp, Settings, Edit2, Trash2 } from 'lucide-react';

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    avatar_url: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [activeTab, setActiveTab] = useState('transactions');

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
        email: user.email || '',
        password: '',
        confirmPassword: ''
      });
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    try {
      if (editForm.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: editForm.email });
        if (emailError) throw emailError;
      }
      if (editForm.password && editForm.password === editForm.confirmPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({ password: editForm.password });
        if (passwordError) throw passwordError;
      }
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: editForm.display_name, avatar_url: editForm.avatar_url })
        .eq('user_id', user.id);
      if (error) throw error;

      setProfile({ display_name: editForm.display_name, avatar_url: editForm.avatar_url });
      setIsEditDialogOpen(false);
      toast({ title: 'Profile updated successfully' });
    } catch (error: any) {
      toast({ title: 'Error updating profile', description: error.message, variant: 'destructive' });
    }
  };

  const deleteReview = async (reviewId: string) => {
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (error) toast({ title: 'Error deleting review', variant: 'destructive' });
    else {
      setReviews(reviews.filter((r) => r.id !== reviewId));
      toast({ title: 'Review deleted successfully' });
    }
  };

  if (!user) return <div className="p-8 text-center">Please sign in to view your profile.</div>;

  // Softer yellow glow and dark backgrounds
  const shadowBase =
    "shadow-[0px_0px_8px_rgba(255,215,0,0.12),-6px_-6px_8px_rgba(255,215,0,0.12)] dark:shadow-[6px_6px_8px_rgba(0,0,0,0.4),-6px_-6px_8px_rgba(255,215,0,0.18)]";
  const hoverShadow =
    "hover:shadow-[0px_0px_12px_rgba(255,215,0,0.2),-8px_-8px_12px_rgba(255,215,0,0.2)] dark:hover:shadow-[8px_8px_12px_rgba(0,0,0,0.5),-8px_-8px_12px_rgba(255,215,0,0.25)]";

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Profile header */}
      <div className={`group relative overflow-hidden rounded-3xl bg-gray-900 p-8 ${shadowBase} transition-all duration-500 ${hoverShadow} hover:scale-[1.02] hover:-translate-y-1`}>
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="w-32 h-32 border-4 border-gray-800 shadow-lg">
            <AvatarImage src={profile.avatar_url || undefined} className="object-cover" />
            <AvatarFallback className="text-2xl font-bold bg-yellow-500 text-white">
              {profile.display_name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <h1 className="text-4xl font-bold text-yellow-400 mb-2">{profile.display_name || 'Anonymous User'}</h1>
            <p className="text-gray-300">{user.email}</p>
            <div className="flex gap-6 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">{posts.length}</div>
                <div className="text-sm text-gray-400">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{credits?.current_balance || 0}</div>
                <div className="text-sm text-gray-400">Credits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{reviews.length}</div>
                <div className="text-sm text-gray-400">Reviews</div>
              </div>
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-black shadow-md hover:shadow-yellow-400/50">
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-2xl bg-gray-900 text-white">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 p-2">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input id="display_name" value={editForm.display_name} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar_url">Avatar URL</Label>
                    <Input id="avatar_url" value={editForm.avatar_url} onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password (optional)</Label>
                    <Input id="password" type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                  </div>
                  {editForm.password && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" value={editForm.confirmPassword} onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })} />
                    </div>
                  )}
                  <div className="flex gap-3 pt-4">
                    <Button onClick={updateProfile} className="bg-yellow-500 hover:bg-yellow-600 text-black">Save Changes</Button>
                    <Button onClick={() => setIsEditDialogOpen(false)} variant="outline">Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full grid-cols-5 rounded-2xl bg-gray-900 p-1 ${shadowBase}`}>
          {[
            { key: 'transactions', icon: <ShoppingBag className="w-4 h-4 mr-2" />, label: 'Transactions' },
            { key: 'credits', icon: <CreditCard className="w-4 h-4 mr-2" />, label: 'Credits' },
            { key: 'reviews', icon: <Star className="w-4 h-4 mr-2" />, label: 'Reviews' },
            { key: 'posts', icon: <TrendingUp className="w-4 h-4 mr-2" />, label: 'Posts' },
            { key: 'settings', icon: <Settings className="w-4 h-4 mr-2" />, label: 'Settings' }
          ].map(tab => (
            <TabsTrigger key={tab.key} value={tab.key} className="rounded-xl hover:scale-105 hover:shadow-yellow-400/50 text-white">
              {tab.icon}{tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Transactions */}
        <TabsContent value="transactions">
          <Card className={`rounded-2xl bg-gray-900 text-white ${shadowBase}`}>
            <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
            <CardContent>
              {transactions.length === 0 ? <p>No transactions yet.</p> : (
                <div className="space-y-4">
                  {transactions.map(t => (
                    <div key={t.id} className="flex justify-between items-center p-6 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-300">
                      <div>
                        <h3 className="font-semibold">{t.product_name}</h3>
                        <p className="text-sm">{new Date(t.created_at).toLocaleDateString()}</p>
                        <Badge variant="outline">{t.transaction_type}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${t.amount}</p>
                        {t.credits_earned ? <p className="text-green-400">+{t.credits_earned} credits</p> : null}
                        {t.credits_spent ? <p className="text-red-400">-{t.credits_spent} credits</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credits */}
        <TabsContent value="credits">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className={`rounded-2xl bg-gray-900 text-white ${shadowBase}`}>
              <CardHeader><CardTitle>Current Balance</CardTitle></CardHeader>
              <CardContent><p className="text-4xl text-yellow-400">{credits?.current_balance || 0}</p></CardContent>
            </Card>
            <Card className={`rounded-2xl bg-gray-900 text-white ${shadowBase}`}>
              <CardHeader><CardTitle>Total Earned</CardTitle></CardHeader>
              <CardContent><p className="text-4xl text-green-400">{credits?.total_earned || 0}</p></CardContent>
            </Card>
            <Card className={`rounded-2xl bg-gray-900 text-white ${shadowBase}`}>
              <CardHeader><CardTitle>Total Spent</CardTitle></CardHeader>
              <CardContent><p className="text-4xl text-red-400">{credits?.total_spent || 0}</p></CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reviews */}
        <TabsContent value="reviews">
          <Card className={`rounded-2xl bg-gray-900 text-white ${shadowBase}`}>
            <CardHeader><CardTitle>Your Reviews</CardTitle></CardHeader>
            <CardContent>
              {reviews.length === 0 ? <p>No reviews yet.</p> : (
                reviews.map(r => (
                  <div key={r.id} className="p-6 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-300">
                    <div className="flex justify-between">
                      <div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-yellow-400' : 'text-gray-500'}`} />
                          ))}
                        </div>
                        <p>{r.review_text}</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => deleteReview(r.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Posts */}
        <TabsContent value="posts">
          <Card className={`rounded-2xl bg-gray-900 text-white ${shadowBase}`}>
            <CardHeader><CardTitle>Your Posts</CardTitle></CardHeader>
            <CardContent>
              {posts.length === 0 ? <p>No posts yet.</p> : (
                posts.map(p => (
                  <div key={p.id} className="p-6 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-300">
                    <h3 className="font-semibold mb-2">{p.title}</h3>
                    <p>{p.content}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings">
          <Card className={`rounded-2xl bg-gray-900 text-white ${shadowBase}`}>
            <CardHeader><CardTitle>Account Settings</CardTitle></CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-gray-800 mb-3">Privacy Settings</div>
              <div className="p-4 rounded-xl bg-gray-800 mb-3">Notifications</div>
              <div className="p-4 rounded-xl bg-gray-800">App Experience</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
