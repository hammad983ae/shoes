import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Heart, Share, Plus, Filter, TrendingUp } from 'lucide-react';
import InteractiveParticles from '@/components/InteractiveParticles';

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  sneaker_tags: string[] | null;
  brand_tags: string[] | null;
  category_tags: string[] | null;
  image_url: string | null;
  engagement_score: number | null;
  created_at: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface PostForm {
  title: string;
  content: string;
  sneaker_tags: string;
  brand_tags: string;
  category_tags: string;
  image_url: string;
}

const Feed = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [filterTag, setFilterTag] = useState('');
  const [postForm, setPostForm] = useState<PostForm>({
    title: '',
    content: '',
    sneaker_tags: '',
    brand_tags: '',
    category_tags: '',
    image_url: ''
  });

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  const fetchPosts = async () => {
    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles (display_name, avatar_url)
      `);

    if (sortBy === 'trending') {
      query = query.order('engagement_score', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (data && !error) {
      setPosts(data as any);
    }
  };

  const createPost = async () => {
    if (!user || !postForm.title.trim()) {
      toast({ title: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        title: postForm.title,
        content: postForm.content,
        sneaker_tags: postForm.sneaker_tags.split(',').map(tag => tag.trim()).filter(Boolean),
        brand_tags: postForm.brand_tags.split(',').map(tag => tag.trim()).filter(Boolean),
        category_tags: postForm.category_tags.split(',').map(tag => tag.trim()).filter(Boolean),
        image_url: postForm.image_url
      });

    if (error) {
      toast({ title: 'Error creating post', variant: 'destructive' });
    } else {
      toast({ title: 'Post created successfully!' });
      setIsCreateOpen(false);
      setPostForm({
        title: '',
        content: '',
        sneaker_tags: '',
        brand_tags: '',
        category_tags: '',
        image_url: ''
      });
      fetchPosts();
    }
  };

  const interactWithPost = async (postId: string, type: 'like' | 'view' | 'share') => {
    if (!user) return;

    const { error } = await supabase
      .from('post_interactions')
      .upsert({
        user_id: user.id,
        post_id: postId,
        interaction_type: type
      });

    if (!error && type === 'like') {
      toast({ title: 'Post liked!' });
    }
  };

  const filteredPosts = posts.filter(post => {
    if (!filterTag) return true;
    return (
      post.sneaker_tags?.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase())) ||
      post.brand_tags?.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase())) ||
      post.category_tags?.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen page-gradient relative">
      <InteractiveParticles isActive={true} />
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Feed</h1>
        <div className="flex gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>
          
          {user && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Post title *"
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Share your thoughts about sneakers..."
                    value={postForm.content}
                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  />
                  <Input
                    placeholder="Sneaker tags (comma separated)"
                    value={postForm.sneaker_tags}
                    onChange={(e) => setPostForm({ ...postForm, sneaker_tags: e.target.value })}
                  />
                  <Input
                    placeholder="Brand tags (comma separated)"
                    value={postForm.brand_tags}
                    onChange={(e) => setPostForm({ ...postForm, brand_tags: e.target.value })}
                  />
                  <Input
                    placeholder="Category tags (comma separated)"
                    value={postForm.category_tags}
                    onChange={(e) => setPostForm({ ...postForm, category_tags: e.target.value })}
                  />
                  <Input
                    placeholder="Image URL (optional)"
                    value={postForm.image_url}
                    onChange={(e) => setPostForm({ ...postForm, image_url: e.target.value })}
                  />
                  <Button onClick={createPost} className="w-full">Create Post</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <Filter className="w-4 h-4" />
        <Input
          placeholder="Filter by tags..."
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={post.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {post.profiles?.display_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{post.profiles?.display_name || 'Anonymous'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                <p className="text-muted-foreground">{post.content}</p>
              </div>
              
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full max-h-96 object-cover rounded-lg"
                />
              )}
              
              <div className="flex flex-wrap gap-2">
                {post.sneaker_tags?.map((tag, i) => (
                  <Badge key={i} variant="default">{tag}</Badge>
                ))}
                {post.brand_tags?.map((tag, i) => (
                  <Badge key={i} variant="secondary">{tag}</Badge>
                ))}
                {post.category_tags?.map((tag, i) => (
                  <Badge key={i} variant="outline">{tag}</Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => interactWithPost(post.id, 'like')}
                    disabled={!user}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Like
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => interactWithPost(post.id, 'share')}
                    disabled={!user}
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  {post.engagement_score} interactions
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredPosts.length === 0 && (
          <Card className="bg-[#0a0a0a] border-[#FFD700]">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                {filterTag ? 'No posts found with that filter.' : 'No posts yet. Be the first to create one!'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </div>
  );
};

export default Feed;