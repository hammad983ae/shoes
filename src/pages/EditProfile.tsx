import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserAvatar } from '@/components/UserAvatar';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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
  
  // Crop UI state
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url, display_name, bio')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading profile:', error);
          toast({
            title: "Error loading profile",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (data) {
          setAvatarUrl(data.avatar_url || '');
          setDisplayName(data.display_name || '');
          setBio(data.bio || '');
        } else {
          // If no profile exists, set defaults
          setDisplayName(user.email?.split('@')[0] || '');
          setBio('');
          setAvatarUrl('');
        }
      } catch (error: any) {
        console.error('Failed to load profile:', error);
        toast({
          title: "Failed to load profile",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    loadProfile();
  }, [user, toast]);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

    // Create image URL for cropping
    const imageUrl = URL.createObjectURL(file);
    setImageToCrop(imageUrl);
    setShowCropModal(true);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Create a square crop in the center
    const size = Math.min(width, height);
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: (size / width) * 100,
        },
        1, // aspect ratio 1:1 for square
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  };

  const getCroppedImg = (image: HTMLImageElement, crop: Crop): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No 2d context'));
        return;
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Set canvas size to crop size
      canvas.width = crop.width * scaleX;
      canvas.height = crop.height * scaleY;

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

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.95
      );
    });
  };

  const handleCropSave = async () => {
    if (!completedCrop || !imgRef.current || !user) return;

    setUploading(true);
    try {
      // Get cropped image blob
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      // Generate unique file name with user folder structure for RLS
      const fileName = `${Date.now()}.jpg`;
      const filePath = `${user.id}/${fileName}`;

      // Upload cropped file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedBlob, {
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

      // Close crop modal and cleanup
      setShowCropModal(false);
      setImageToCrop('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setImageToCrop('');
    URL.revokeObjectURL(imageToCrop);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
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
            <UserAvatar 
              avatarUrl={avatarUrl} 
              displayName={displayName} 
              size="xl"
              className="w-24 h-24 mb-2 border-2 border-yellow-500 shadow-lg"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
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

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Crop Avatar</h3>
              <Button variant="ghost" size="icon" onClick={handleCropCancel}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-4 max-h-[calc(90vh-140px)] overflow-auto">
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(newCrop) => setCrop(newCrop)}
                  onComplete={(newCrop) => setCompletedCrop(newCrop)}
                  aspect={1}
                  circularCrop
                  className="max-w-full"
                >
                  <img
                    ref={imgRef}
                    src={imageToCrop}
                    onLoad={onImageLoad}
                    alt="Crop preview"
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                </ReactCrop>
              </div>
            </div>
            
            <div className="flex gap-3 p-4 border-t border-gray-700">
              <Button 
                variant="outline" 
                onClick={handleCropCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCropSave}
                disabled={!completedCrop || uploading}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
              >
                {uploading ? 'Saving...' : 'Save Avatar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 