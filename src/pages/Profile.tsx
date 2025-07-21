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
import { CreditCard, ShoppingBag, Star, TrendingUp, Settings, Edit2, Trash2, Shield, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface Profile {
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
  const [profile, setProfile] = useState<Profile>({ display_name: '', avatar_url: '' });
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
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    // Fetch transactions
    const { data: transactionData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (transactionData) setTransactions(transactionData);

    // Fetch credits
    const { data: creditsData } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (creditsData) setCredits(creditsData);

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

    // Fetch profile
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
      // Update email and password if changed
      if (editForm.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: editForm.email
        });
        if (emailError) throw emailError;
      }

      if (editForm.password && editForm.password === editForm.confirmPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: editForm.password
        });
        if (passwordError) throw passwordError;
      }

      // Update profile data
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editForm.display_name,
          avatar_url: editForm.avatar_url
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile({
        display_name: editForm.display_name,
        avatar_url: editForm.avatar_url
      });
      setIsEditDialogOpen(false);
      toast({ title: 'Profile updated successfully' });
    } catch (error: any) {
      toast({ 
        title: 'Error updating profile', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  const deleteReview = async (reviewId: string) => {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      toast({ title: 'Error deleting review', variant: 'destructive' });
    } else {
      setReviews(reviews.filter(r => r.id !== reviewId));
      toast({ title: 'Review deleted successfully' });
    }
  };

  if (!user) {
    return <div className="p-8 text-center">Please sign in to view your profile.</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Animated Profile Header Card */}
      <div className="group relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 p-8 shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,0.9)] dark:shadow-[12px_12px_24px_rgba(0,0,0,0.3),-12px_-12px_24px_rgba(255,255,255,0.1)] transition-all duration-500 hover:shadow-[20px_20px_40px_rgba(0,0,0,0.2),-20px_-20px_40px_rgba(255,255,255,1)] dark:hover:shadow-[20px_20px_40px_rgba(0,0,0,0.4),-20px_-20px_40px_rgba(255,255,255,0.15)] hover:scale-[1.02] hover:-translate-y-1">
        
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar Section */}
          <div className="relative group/avatar">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-700 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                <AvatarImage src={profile.avatar_url || undefined} className="object-cover" />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-secondary text-white">
                  {profile.display_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              {/* Status Indicator */}
              <div className="absolute -bottom-2 -right-2 flex items-center gap-2">
                <div className={cn(
                  "h-6 w-6 rounded-full border-4 border-white dark:border-gray-800 transition-all duration-300 group-hover:scale-125 bg-green-500 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]"
                )} />
                <div className="rounded-full bg-blue-500 dark:bg-blue-600 p-2 shadow-[2px_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  <Shield className="h-4 w-4 fill-white text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2 transition-all duration-300 group-hover:scale-105">
                {profile.display_name || 'Anonymous User'}
              </h1>
              <p className="text-muted-foreground text-lg">{user.email}</p>
              
              {/* Stats Row */}
              <div className="flex flex-wrap gap-6 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{posts.length}</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{credits?.current_balance || 0}</div>
                  <div className="text-sm text-muted-foreground">Credits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{reviews.length}</div>
                  <div className="text-sm text-muted-foreground">Reviews</div>
                </div>
              </div>
            </div>

            {/* Edit Profile Button */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="group/btn bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Edit2 className="w-4 h-4 mr-2 transition-transform duration-300 group-hover/btn:rotate-12" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-2xl shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Edit Profile
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 p-2">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={editForm.display_name}
                      onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                      placeholder="Your display name"
                      className="rounded-xl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="avatar_url">Avatar URL</Label>
                    <Input
                      id="avatar_url"
                      value={editForm.avatar_url}
                      onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                      className="rounded-xl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="your.email@example.com"
                      className="rounded-xl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password (optional)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      placeholder="Enter new password"
                      className="rounded-xl"
                    />
                  </div>
                  
                  {editForm.password && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={editForm.confirmPassword}
                        onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                        className="rounded-xl"
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={updateProfile} 
                      className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 rounded-xl"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button 
                      onClick={() => setIsEditDialogOpen(false)} 
                      variant="outline" 
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Animated Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 rounded-2xl bg-white dark:bg-gray-800 p-1 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(255,255,255,0.1)]">
          <TabsTrigger 
            value="transactions" 
            className="rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg data-[state=active]:shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)] dark:data-[state=active]:shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(255,255,255,0.1)]"
          >
            <ShoppingBag className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
            Transactions
          </TabsTrigger>
          <TabsTrigger 
            value="credits" 
            className="rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg data-[state=active]:shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)] dark:data-[state=active]:shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(255,255,255,0.1)]"
          >
            <CreditCard className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
            Credits
          </TabsTrigger>
          <TabsTrigger 
            value="reviews" 
            className="rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg data-[state=active]:shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)] dark:data-[state=active]:shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(255,255,255,0.1)]"
          >
            <Star className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
            Reviews
          </TabsTrigger>
          <TabsTrigger 
            value="posts" 
            className="rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg data-[state=active]:shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)] dark:data-[state=active]:shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(255,255,255,0.1)]"
          >
            <TrendingUp className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
            Posts
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg data-[state=active]:shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)] dark:data-[state=active]:shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(255,255,255,0.1)]"
          >
            <Settings className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4 animate-fade-in">
          <Card className="rounded-2xl shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(255,255,255,0.1)] border-0 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-muted-foreground">No transactions yet.</p>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                      <div>
                        <h3 className="font-semibold">{transaction.product_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                        <Badge variant="outline">{transaction.transaction_type}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${transaction.amount}</p>
                        {(transaction.credits_earned || 0) > 0 && (
                          <p className="text-sm text-green-600">+{transaction.credits_earned} credits</p>
                        )}
                        {(transaction.credits_spent || 0) > 0 && (
                          <p className="text-sm text-red-600">-{transaction.credits_spent} credits</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="group rounded-2xl shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(255,255,255,0.1)] border-0 bg-gradient-to-br from-primary/10 to-primary/5 hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Current Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  {credits?.current_balance || 0}
                </p>
              </CardContent>
            </Card>
            <Card className="group rounded-2xl shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(255,255,255,0.1)] border-0 bg-gradient-to-br from-green-500/10 to-green-500/5 hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Total Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-600 group-hover:scale-110 transition-transform duration-300">
                  {credits?.total_earned || 0}
                </p>
              </CardContent>
            </Card>
            <Card className="group rounded-2xl shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(255,255,255,0.1)] border-0 bg-gradient-to-br from-red-500/10 to-red-500/5 hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-red-600 group-hover:scale-110 transition-transform duration-300">
                  {credits?.total_spent || 0}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4 animate-fade-in">
          <Card className="rounded-2xl shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(255,255,255,0.1)] border-0 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Your Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{review.review_text}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteReview(review.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4 animate-fade-in">
          <Card className="rounded-2xl shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(255,255,255,0.1)] border-0 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Your Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <p className="text-muted-foreground">No posts yet. Create your first post in the feed!</p>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                      <h3 className="font-semibold mb-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{post.content}</p>
                      <div className="flex items-center gap-2 mb-2">
                        {post.sneaker_tags?.map((tag, i) => (
                          <Badge key={i} variant="secondary">{tag}</Badge>
                        ))}
                        {post.brand_tags?.map((tag, i) => (
                          <Badge key={i} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        <span>{post.engagement_score} interactions</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 animate-fade-in">
          <div className="grid gap-6">
            <Card className="rounded-2xl shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(255,255,255,0.1)] border-0 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300">
                  <h3 className="font-semibold mb-2 text-lg">Privacy Settings</h3>
                  <p className="text-sm text-muted-foreground">Manage your privacy preferences and data visibility.</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300">
                  <h3 className="font-semibold mb-2 text-lg">Notifications</h3>
                  <p className="text-sm text-muted-foreground">Configure your notification preferences and alerts.</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300">
                  <h3 className="font-semibold mb-2 text-lg">App Experience</h3>
                  <p className="text-sm text-muted-foreground">Customize your app experience and interface preferences.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;