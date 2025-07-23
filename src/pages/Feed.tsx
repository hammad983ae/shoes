import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Search, TrendingUp, ExternalLink, Plus, Upload, Link } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import InteractiveParticles from '@/components/InteractiveParticles';

interface TopPost {
  id: string;
  platform: string;
  platform_post_id: string;
  original_url: string;
  author_username: string;
  crowlix_user_id: string | null;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  engagement_score: number;
  credits_earned: number;
  posted_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface PurchasedProduct {
  product_id: string;
  product_name: string;
}


const TopPosts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [sortBy, setSortBy] = useState('recent');
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  
  
  // Create Post Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState<'upload' | 'settings'>('upload');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'link'>('file');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [socialLink, setSocialLink] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [showSocials, setShowSocials] = useState(true);
  const [showUsername, setShowUsername] = useState(true);
  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedProduct[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTopPosts();
    if (user) {
      fetchPurchasedProducts();
    }
  }, [sortBy, user]);

  // Filter posts by product if specified in URL
  useEffect(() => {
    const productFilter = searchParams.get('product');
    if (productFilter) {
      // TODO: Implement filtering logic when posts are linked to products
      console.log('Filtering by product:', productFilter);
    }
  }, [searchParams]);

  useEffect(() => {
    if (userSearch.trim()) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [userSearch]);

  const fetchTopPosts = async () => {
    let query = supabase
      .from('top_posts')
      .select(`
        *,
        profiles (display_name, avatar_url)
      `);

    if (sortBy === 'trending') {
      query = query.order('engagement_score', { ascending: false });
    } else {
      query = query.order('posted_at', { ascending: false });
    }

    const { data, error } = await query;
    if (data && !error) {
      setTopPosts(data as any);
    }
  };

  const searchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .or(`display_name.ilike.%${userSearch}%`)
      .limit(5);

    if (data && !error) {
      setSearchResults(data);
    }
  };


  const fetchPurchasedProducts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('purchase_history')
      .select('product_id, product_name')
      .eq('user_id', user.id);

    if (data && !error) {
      // Remove duplicates by product_id
      const uniqueProducts = data.reduce((acc: PurchasedProduct[], current) => {
        const exists = acc.find(p => p.product_id === current.product_id);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      setPurchasedProducts(uniqueProducts);
    }
  };

  const handleLinkSocials = () => {
    navigate('/profile', { state: { openSocialsModal: true } });
  };

  const handleCreatePost = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create a post',
        variant: 'destructive'
      });
      return;
    }
    setShowCreateModal(true);
    setCreateStep('upload');
  };

  const handleNextStep = () => {
    if (createStep === 'upload') {
      if (uploadMethod === 'file' && !uploadedFile) {
        toast({
          title: 'File required',
          description: 'Please upload a file to continue',
          variant: 'destructive'
        });
        return;
      }
      if (uploadMethod === 'link' && !socialLink.trim()) {
        toast({
          title: 'Link required',
          description: 'Please enter a social media link to continue',
          variant: 'destructive'
        });
        return;
      }
      setCreateStep('settings');
    }
  };

  const handleSubmitPost = async () => {
    setIsSubmitting(true);
    try {
      let mediaUrl = '';
      
      if (uploadMethod === 'file' && uploadedFile) {
        // Upload file to Supabase storage
        const fileExt = uploadedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `user-posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, uploadedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        mediaUrl = publicUrl;
      } else if (uploadMethod === 'link') {
        mediaUrl = socialLink;
      }

      const { error } = await supabase
        .from('user_posts')
        .insert({
          user_id: user!.id,
          media_url: mediaUrl,
          media_type: uploadMethod === 'file' ? (uploadedFile?.type.startsWith('video/') ? 'video' : 'image') : 'link',
          product_id: selectedProduct || null,
          show_socials: showSocials,
          show_username: showUsername
        });

      if (error) throw error;

      // Link to product if selected
      if (selectedProduct) {
        // This would require the post ID, so we'd need to restructure this
        // For now, just show success
      }

      toast({ title: 'Post created successfully!' });
      setShowCreateModal(false);
      resetCreateForm();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error creating post',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCreateForm = () => {
    setCreateStep('upload');
    setUploadMethod('file');
    setUploadedFile(null);
    setSocialLink('');
    setSelectedProduct('');
    setShowSocials(true);
    setShowUsername(true);
  };

  const handleViewUserProfile = (userId: string) => {
    navigate('/profile', { state: { viewUserId: userId } });
  };

  const getPlatformIcon = (platform: string) => {
    const icons = {
      tiktok: '🎵',
      instagram: '📷',
      youtube: '📹',
      x: '🐦',
      reddit: '🔴'
    };
    return icons[platform as keyof typeof icons] || '📱';
  };

  return (
    <div className="min-h-screen page-gradient relative">
      <InteractiveParticles isActive={true} />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Top Posts</h1>
          <div className="flex gap-4">
            <Button
              onClick={handleCreatePost}
              className="transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg bg-[#FFD600] text-black hover:bg-[#E6C200]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
            <Button
              onClick={handleLinkSocials}
              variant="outline"
              className="transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg border-[#FFD600] text-[#FFD600] bg-transparent hover:bg-[#FFD600]/10"
            >
              <Link className="w-4 h-4 mr-2" />
              Link Socials
            </Button>
          </div>
        </div>

        {/* User Search */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for users by name..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="max-w-md"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-lg mt-1 z-10 max-w-md ml-7">
              {searchResults.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                  onClick={() => handleViewUserProfile(profile.id)}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback>
                      {profile.display_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {profile.display_name || 'Anonymous User'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sort Toggle */}
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'recent' ? 'default' : 'outline'}
            onClick={() => setSortBy('recent')}
            size="sm"
            className="transition-all duration-300 hover:transform hover:scale-105"
          >
            Most Recent
          </Button>
          <Button
            variant={sortBy === 'trending' ? 'default' : 'outline'}
            onClick={() => setSortBy('trending')}
            size="sm"
            className="transition-all duration-300 hover:transform hover:scale-105"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending
          </Button>
        </div>

        {/* Top Posts Feed */}
        <div className="space-y-6">
          {topPosts.map((post) => (
            <Card key={post.id} className="bg-[#0a0a0a] border-[#FFD700] transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getPlatformIcon(post.platform)}</span>
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        @{post.author_username}
                        {post.crowlix_user_id && post.profiles && (
                          <button
                            onClick={() => handleViewUserProfile(post.crowlix_user_id!)}
                            className="text-yellow-500 hover:text-yellow-400 text-sm"
                          >
                            ({post.profiles.display_name || 'Crowlix User'})
                          </button>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.posted_at).toLocaleDateString()} • {post.platform}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(post.original_url, '_blank')}
                    className="transition-all duration-300 hover:transform hover:scale-105"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {post.title && (
                  <h2 className="text-xl font-bold">{post.title}</h2>
                )}
                {post.description && (
                  <p className="text-muted-foreground">{post.description}</p>
                )}
                
                {(post.thumbnail_url || post.video_url) && (
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={post.thumbnail_url || post.video_url || ''}
                      alt={post.title || 'Post media'}
                      className="w-full max-h-96 object-cover"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <span>👀 {post.view_count.toLocaleString()}</span>
                    <span>❤️ {post.like_count.toLocaleString()}</span>
                    <span>💬 {post.comment_count.toLocaleString()}</span>
                    <span>📤 {post.share_count.toLocaleString()}</span>
                  </div>
                  {post.credits_earned > 0 && (
                    <div className="flex items-center gap-2 text-yellow-500 font-semibold">
                      <span>🪙 {post.credits_earned} credits earned</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {topPosts.length === 0 && (
            <Card className="bg-[#0a0a0a] border-[#FFD700]">
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">
                  No posts yet. Be the first to create one!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => {
        setShowCreateModal(open);
        if (!open) resetCreateForm();
      }}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-black/95 to-gray-900/95 border-[#FFD600]">
          <DialogTitle>Create New Post</DialogTitle>
          
          {createStep === 'upload' && (
            <div className="space-y-6">
              <div className="flex gap-4 justify-center">
                <Button
                  variant={uploadMethod === 'file' ? 'default' : 'outline'}
                  onClick={() => setUploadMethod('file')}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
                <Button
                  variant={uploadMethod === 'link' ? 'default' : 'outline'}
                  onClick={() => setUploadMethod('link')}
                  className="flex-1"
                >
                  <Link className="w-4 h-4 mr-2" />
                  Social Link
                </Button>
              </div>

              {uploadMethod === 'file' ? (
                <div>
                  <label className="text-sm text-white mb-2 block">Upload Image or Video</label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setUploadedFile(e.target.files[0]);
                      }
                    }}
                    className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#FFD600] file:text-black hover:file:bg-[#E6C200] w-full"
                  />
                  {uploadedFile && (
                    <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-600">
                      <p className="text-sm text-gray-300">Selected: {uploadedFile.name}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="text-sm text-white mb-2 block">Instagram, YouTube, or TikTok Link</label>
                  <Input
                    placeholder="https://instagram.com/p/..."
                    value={socialLink}
                    onChange={(e) => setSocialLink(e.target.value)}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
              )}

              {/* Product Selection on Same Page */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Choose Product (Optional)</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Select a product you've purchased to earn credits, or choose "No product" to post without earning credits.
                </p>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue placeholder="Choose a product or select 'No product'" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-product">No product</SelectItem>
                    {purchasedProducts.map((product) => (
                      <SelectItem key={product.product_id} value={product.product_id}>
                        {product.product_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNextStep} className="bg-[#FFD600] text-black hover:bg-[#E6C200]">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {createStep === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Post Settings</h3>
                
                {/* Image vs Video Handling */}
                {uploadMethod === 'file' && uploadedFile && uploadedFile.type.startsWith('video/') && (
                  <div className="mb-4">
                    <label className="text-sm text-white mb-2 block">Upload Post Thumbnail (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#FFD600] file:text-black hover:file:bg-[#E6C200] w-full"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      If no thumbnail is uploaded, the first frame of the video will be used with a video icon overlay.
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm text-white mb-2 block">Description</label>
                  <textarea
                    placeholder="Write a description for your post..."
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 resize-none"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded border border-gray-600">
                    <div>
                      <label className="text-sm font-medium text-white">Show socials on post</label>
                      <p className="text-xs text-gray-400">Allow others to see and follow your connected social accounts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={showSocials}
                      onChange={(e) => setShowSocials(e.target.checked)}
                      className="w-4 h-4 text-[#FFD600] bg-gray-700 border-gray-600 rounded focus:ring-[#FFD600]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded border border-gray-600">
                    <div>
                      <label className="text-sm font-medium text-white">Show username</label>
                      <p className="text-xs text-gray-400">Display your username or stay anonymous</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={showUsername}
                      onChange={(e) => setShowUsername(e.target.checked)}
                      className="w-4 h-4 text-[#FFD600] bg-gray-700 border-gray-600 rounded focus:ring-[#FFD600]"
                    />
                  </div>

                  {/* Placeholder Privacy Settings */}
                  <div className="p-3 bg-gray-800/30 rounded border border-gray-600/50">
                    <h4 className="text-sm font-medium text-white mb-2">Privacy Settings</h4>
                    <p className="text-xs text-gray-500">Additional privacy options coming soon...</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setCreateStep('upload')} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleSubmitPost} 
                  disabled={isSubmitting}
                  className="flex-1 bg-[#FFD600] text-black hover:bg-[#E6C200]"
                >
                  {isSubmitting ? 'Creating...' : 'Create Post'}
                </Button>
              </div>
            </div>
          )}

        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TopPosts;