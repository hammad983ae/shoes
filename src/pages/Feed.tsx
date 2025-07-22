import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Search, TrendingUp, CheckCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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


const TopPosts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [sortBy, setSortBy] = useState('recent');
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [connectedAccountsCount, setConnectedAccountsCount] = useState(0);

  useEffect(() => {
    fetchTopPosts();
    if (user) {
      fetchSocialConnections();
    }
  }, [sortBy, user]);

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

  const fetchSocialConnections = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('social_connections')
      .select('platform, username, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (data && !error) {
      setConnectedAccountsCount(data.length);
    }
  };

  const handleLinkSocials = () => {
    navigate('/profile', { state: { activeTab: 'socials' } });
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
              onClick={handleLinkSocials}
              className={`transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg ${
                connectedAccountsCount > 0 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {connectedAccountsCount > 0 ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {connectedAccountsCount} Accounts Connected
                </>
              ) : (
                'Link Socials'
              )}
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
    </div>
  );
};

export default TopPosts;