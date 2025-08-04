import { useState, useEffect, useCallback } from 'react';
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

interface Post {
  id: string;
  user_id: string;
  title: string | null;
  content: string | null;
  sneaker_tags: string[] | null;
  brand_tags: string[] | null;
  category_tags: string[] | null;
  image_url: string | null;
  media_url: string | null;
  engagement_score: number;
  created_at: string;
  updated_at: string;
  show_socials: boolean;
  show_username: boolean;
  post_type: string | null;
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [sortBy, setSortBy] = useState('recent');
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
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

  const fetchPosts = useCallback(async () => {
    
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles(display_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    
    if (data && !error) {
      setPosts(data as unknown as Post[]);
    } else if (error) {
      console.error('Error fetching posts:', error);
    }
  }, []);

  const fetchPurchasedProducts = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('purchase_history')
      .select('product_id, product_name')
      .eq('user_id', user.id);

    if (data && !error) {
      const uniqueProducts = data.reduce((acc: PurchasedProduct[], current) => {
        if (!acc.find((p) => p.product_id === current.product_id)) {
          acc.push(current);
        }
        return acc;
      }, []);
      setPurchasedProducts(uniqueProducts);
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchPurchasedProducts();
    }
  }, [fetchPosts, fetchPurchasedProducts, user]);

  const searchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .or(`display_name.ilike.%${userSearch}%`)
      .limit(5);

    if (data && !error) {
      setSearchResults(data);
    }
  }, [userSearch]);

  useEffect(() => {
    const productFilter = searchParams.get('product');
    if (productFilter) {
      // Optional: Add filtering logic here
      
    }
  }, [searchParams]);

  useEffect(() => {
    if (userSearch.trim()) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [userSearch, searchUsers]);

  const handleLinkSocials = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to link your socials',
        variant: 'destructive'
      });
      return;
    }
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
      if (uploadMethod === 'file' && uploadedFile) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
        if (!allowedTypes.includes(uploadedFile.type)) {
          toast({
            title: 'Invalid file type',
            description: 'Please upload an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, OGG)',
            variant: 'destructive'
          });
          return;
        }
        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (uploadedFile.size > maxSize) {
          toast({
            title: 'File too large',
            description: 'Please upload a file smaller than 10MB',
            variant: 'destructive'
          });
          return;
        }
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

  const resetCreateForm = () => {
    setCreateStep('upload');
    setUploadMethod('file');
    setUploadedFile(null);
    setSocialLink('');
    setSelectedProduct('');
    setShowSocials(true);
    setShowUsername(true);
  };

  const handleSubmitPost = async () => {
    setIsSubmitting(true);
    try {
      
      let mediaUrl = '';
      let postTitle = '';
      let postType = 'link';
      
             if (uploadMethod === 'file' && uploadedFile) {
         
         
         // Generate unique filename
         const fileExt = uploadedFile.name.split('.').pop();
         const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
         const filePath = `user-posts/${fileName}`;
         
         // Upload file to Supabase storage
         const { error: uploadError } = await supabase.storage
           .from('user-posts')
           .upload(filePath, uploadedFile);
         
         if (uploadError) {
           console.error('Upload error:', uploadError);
           
           // Check if it's a bucket not found error
           if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
             throw new Error('Storage bucket "user-posts" not found. Please create the bucket in Supabase dashboard.');
           }
           
           // Check if it's a permissions error
           if (uploadError.message.includes('permission') || uploadError.message.includes('unauthorized')) {
             throw new Error('Upload permission denied. Please check storage bucket permissions.');
           }
           
           throw new Error(`Failed to upload file: ${uploadError.message}`);
         }

         // Get public URL
         const { data: { publicUrl } } = supabase.storage
           .from('user-posts')
           .getPublicUrl(filePath);
         
         mediaUrl = publicUrl;
         postTitle = uploadedFile.name;
         postType = uploadedFile.type.startsWith('video/') ? 'video' : 'image';
         
         
       } else if (uploadMethod === 'link') {
        mediaUrl = socialLink;
        postTitle = 'Social Media Post';
        postType = 'link';
        
      }

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      console.log('User ID:', userId);
      if (!userId) throw new Error('User not authenticated');

      const postData = {
        user_id: userId,
        title: postTitle,
        content: `Shared from ${uploadMethod === 'link' ? 'social media' : 'file upload'}`,
        media_url: mediaUrl,
        post_type: postType,
        show_socials: showSocials,
        show_username: showUsername
      };
      console.log('Inserting post data:', postData);

      const { data: insertData, error: insertError } = await supabase.from('posts').insert(postData);
      console.log('Insert result:', { insertData, insertError });
      
      if (insertError) throw insertError;

      toast({ title: 'Post created successfully!' });
      setShowCreateModal(false);
      fetchPosts();
      resetCreateForm();
    } catch (error: unknown) {
      console.error('Error creating post:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      // Add helpful guidance for common storage issues
      let description = errorMessage;
      if (errorMessage.includes('user-posts') && errorMessage.includes('not found')) {
        description = 'Storage bucket not found. Please contact support to set up the user-posts bucket.';
      } else if (errorMessage.includes('permission')) {
        description = 'Upload permission denied. Please check your authentication status.';
      }
      
      toast({
        title: 'Error creating post',
        description,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewUserProfile = (userId: string) => {
    navigate('/profile', { state: { viewUserId: userId } });
  };

  // const getPlatformIcon = (platform: string) => {
  //   const icons = {
  //     tiktok: '🎵',
  //     instagram: '📷',
  //     youtube: '📹',
  //     x: '🐦',
  //     reddit: '🔴'
  //   };
  //   return icons[platform as keyof typeof icons] || '📱';
  // };

  return (
    <div className="min-h-screen page-gradient relative">
      <InteractiveParticles isActive={true} />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
            <h1 className="text-3xl font-bold mb-2">Top Posts</h1>

            <div className="flex gap-2 sm:hidden justify-end items-center mb-2 w-full">
              <Button onClick={handleCreatePost} className="px-2 py-1 h-8 min-w-0 text-xs rounded-md bg-[#FFD600] text-black hover:bg-[#E6C200] font-semibold">
                <Plus className="w-4 h-4 mr-1" />
                Create
              </Button>
              <Button onClick={handleLinkSocials} variant="outline" className="px-2 py-1 h-8 min-w-0 text-xs rounded-md border-[#FFD600] text-[#FFD600] bg-transparent hover:bg-[#FFD600]/10 font-semibold">
                <Link className="w-4 h-4 mr-1" />
                Socials
              </Button>
            </div>

            <div className="hidden sm:flex flex-row gap-2 w-auto">
              <Button onClick={handleCreatePost} className="transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg bg-[#FFD600] text-black hover:bg-[#E6C200] text-base font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
              <Button onClick={handleLinkSocials} variant="outline" className="transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg border-[#FFD600] text-[#FFD600] bg-transparent hover:bg-[#FFD600]/10 text-base font-semibold">
                <Link className="w-4 h-4 mr-2" />
                Link Socials
              </Button>
            </div>
          </div>

          <div className="relative mt-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for users by name..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="max-w-md text-xs sm:text-base"
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

          <div className="flex flex-row gap-2 mt-2 w-full">
            <Button
              variant={sortBy === 'recent' ? 'default' : 'outline'}
              onClick={() => setSortBy('recent')}
              size="sm"
              className="flex-1 transition-all duration-300 hover:transform hover:scale-105 text-xs sm:text-base"
            >
              Most Recent
            </Button>
            <Button
              variant={sortBy === 'trending' ? 'default' : 'outline'}
              onClick={() => setSortBy('trending')}
              size="sm"
              className="flex-1 transition-all duration-300 hover:transform hover:scale-105 text-xs sm:text-base"
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Trending
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="bg-[#0a0a0a] border-[#FFD700] transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={post.profiles?.avatar_url || ''} />
                      <AvatarFallback>{post.profiles?.display_name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {post.profiles?.display_name || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {post.title && <h2 className="text-xl font-bold">{post.title}</h2>}
                {post.content && <p className="text-muted-foreground">{post.content}</p>}
                {post.media_url && (
                  <div className="relative rounded-lg overflow-hidden">
                    {post.post_type === 'video' ? (
                      <video src={post.media_url} controls className="w-full max-h-96 object-cover" />
                    ) : (
                      <img
                        src={post.media_url}
                        alt={post.title || 'Post media'}
                        className="w-full max-h-96 object-cover"
                      />
                    )}
                  </div>
                )}
                {post.engagement_score && (
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <span>📊 Engagement Score: {post.engagement_score}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {posts.length === 0 && (
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
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogTitle>Create a New Post</DialogTitle>
          
          {createStep === 'upload' && (
            <div className="space-y-4">
                             <div className="flex gap-2">
                 <Button 
                   onClick={() => setUploadMethod('file')} 
                   variant={uploadMethod === 'file' ? 'default' : 'outline'}
                   className="flex-1"
                 >
                   <Upload className="w-4 h-4 mr-2" />
                   Upload File
                 </Button>
                 <Button 
                   onClick={() => setUploadMethod('link')} 
                   variant={uploadMethod === 'link' ? 'default' : 'outline'}
                   className="flex-1"
                 >
                   <Link className="w-4 h-4 mr-2" />
                   Social Link
                 </Button>
               </div>

                             {uploadMethod === 'file' ? (
                 <div className="space-y-2">
                   <label className="text-sm font-medium">Upload Media</label>
                   <Input
                     type="file"
                     accept="image/*,video/*"
                     onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                     className="cursor-pointer"
                   />
                   {uploadedFile && (
                     <div className="space-y-2">
                       <p className="text-sm text-muted-foreground">
                         Selected: {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)}MB)
                       </p>
                       <div className="relative rounded-lg overflow-hidden border border-border">
                         {uploadedFile.type.startsWith('video/') ? (
                           <video 
                             src={URL.createObjectURL(uploadedFile)} 
                             controls 
                             className="w-full max-h-48 object-cover"
                           />
                         ) : (
                           <img
                             src={URL.createObjectURL(uploadedFile)}
                             alt="Preview"
                             className="w-full max-h-48 object-cover"
                           />
                         )}
                       </div>
                     </div>
                   )}
                 </div>
               ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Social Media Link</label>
                  <Input
                    placeholder="Paste your social media link here..."
                    value={socialLink}
                    onChange={(e) => setSocialLink(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => setShowCreateModal(false)} 
                  variant="outline" 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleNextStep} 
                  className="flex-1 bg-[#FFD600] text-black hover:bg-[#E6C200]"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {createStep === 'settings' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Product (Optional)</label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product to tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-product">No Product</SelectItem>
                    {purchasedProducts.map((product) => (
                      <SelectItem key={product.product_id} value={product.product_id}>
                        {product.product_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Display Settings</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showSocials"
                      checked={showSocials}
                      onChange={(e) => setShowSocials(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="showSocials" className="text-sm">
                      Show social media links
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showUsername"
                      checked={showUsername}
                      onChange={(e) => setShowUsername(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="showUsername" className="text-sm">
                      Show username
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => setCreateStep('upload')} 
                  variant="outline" 
                  className="flex-1"
                >
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
