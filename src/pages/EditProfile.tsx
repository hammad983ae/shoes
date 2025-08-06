import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          setDisplayName(data.display_name || '');
          setBio(data.bio || '');
        }
      });
  }, [user]);

  const handleSaveChanges = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          bio: bio,
          avatar_url: avatarUrl
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Profile updated successfully",
        description: "Your profile has been saved.",
      });
      
      navigate('/profile');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update avatar URL in state and database
      setAvatarUrl(data.publicUrl);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Avatar updated successfully!",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen page-gradient flex flex-col items-center justify-center px-2 py-8">
      <div className="w-full max-w-md bg-gradient-to-r from-[#111111] to-[#FFD700]/10 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-2xl border border-yellow-500/50 relative">
        {/* Top Bar */}
        <div className="flex items-center mb-6 relative">
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} className="absolute left-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-full flex justify-center">
            <span className="font-bold text-lg text-white">Edit Profile</span>
          </div>
        </div>
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-6">
          <Avatar className="w-24 h-24 mb-2 border-2 border-yellow-500 shadow-lg">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-yellow-500 text-black font-bold text-2xl">
              {displayName?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          <Button 
            variant="outline" 
            className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 btn-hover-glow text-xs px-3 py-1 mt-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-3 h-3 mr-1" />
            {uploading ? 'Uploading...' : 'Change Avatar'}
          </Button>
        </div>
        {/* Display Name */}
        <div className="mb-4">
          <Label htmlFor="displayName" className="text-gray-300 mb-2 block">Display Name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="Enter your display name"
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
        <Button 
          onClick={handleSaveChanges}
          disabled={loading}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold h-12 rounded-xl btn-hover-glow"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
} 