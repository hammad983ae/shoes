import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('avatar_url, display_name, bio')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setAvatarUrl(data.avatar_url || '');
          setUsername(data.display_name || '');
          setBio(data.bio || '');
        }
      });
  }, [user]);

  return (
    <div className="min-h-screen page-gradient flex flex-col items-center justify-center px-2 py-8">
      <div className="w-full max-w-md bg-gradient-to-r from-[#111111] to-[#FFD700]/10 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-2xl border border-yellow-500/50 relative">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-bold text-lg text-white">Edit Profile</span>
          <Button variant="ghost" size="icon" onClick={() => navigate('/edit-credentials')}>
            <Edit2 className="w-5 h-5" />
          </Button>
        </div>
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-6">
          <Avatar className="w-24 h-24 mb-2 border-2 border-yellow-500 shadow-lg">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-yellow-500 text-black font-bold text-2xl">
              {username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <Button variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 btn-hover-glow text-xs px-3 py-1 mt-2">
            Change Avatar
          </Button>
        </div>
        {/* Username */}
        <div className="mb-4">
          <Label htmlFor="username" className="text-gray-300 mb-2 block">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="Enter your username"
          />
        </div>
        {/* Bio */}
        <div className="mb-6">
          <Label htmlFor="bio" className="text-gray-300 mb-2 block">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="Tell us about yourself"
            rows={3}
          />
        </div>
        {/* Save Button */}
        <Button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold h-12 rounded-xl btn-hover-glow">
          Save Changes
        </Button>
      </div>
    </div>
  );
} 