import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, X, Image as ImageIcon, Video, Maximize2, Download, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  bucketName?: string;
  maxSize?: number; // in MB
  className?: string;
}

export default function ImageUpload({ 
  onImageUploaded, 
  currentImage, 
  bucketName = 'products',
  maxSize = 5,
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage || '');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Please select an image smaller than ${maxSize}MB`,
        variant: "destructive"
      });
      return;
    }

    // Validate file type with stricter checks
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/mov', 'video/avi', 'video/webm'
    ];
    
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image (JPEG, PNG, WebP, GIF) or video file (MP4, MOV, AVI, WebM)",
        variant: "destructive"
      });
      return;
    }

    // Additional security: Check file extension matches MIME type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'avi', 'webm'];
    
    if (!fileExt || !validExtensions.includes(fileExt)) {
      toast({
        title: "Invalid file extension",
        description: "File extension doesn't match expected format",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `quality-checks/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      setPreviewUrl(publicUrl);
      onImageUploaded(publicUrl);

      toast({
        title: file.type.startsWith('image/') ? "Image uploaded" : "Video uploaded",
        description: `Quality check ${file.type.startsWith('image/') ? 'image' : 'video'} has been uploaded successfully`,
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || url.includes('.webm');
  };

  const handleDownload = async () => {
    if (!previewUrl) return;
    
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quality-check-${Date.now()}.${isVideo(previewUrl) ? 'mp4' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the file",
        variant: "destructive"
      });
    }
  };

  const handleCreditsModal = () => {
    setShowCreditsModal(true);
  };

  const handleSocials = () => {
    navigate('/socials');
    setShowCreditsModal(false);
  };

  return (
    <>
      <div className={`space-y-3 ${className}`}>
        <Label>Quality Check Media</Label>
        
        {previewUrl ? (
          <div className="relative">
            {isVideo(previewUrl) ? (
              <video 
                src={previewUrl} 
                controls
                className="w-full h-48 object-contain rounded-lg border bg-black"
              />
            ) : (
              <img 
                src={previewUrl} 
                alt="Quality check preview" 
                className="w-full h-48 object-contain rounded-lg border bg-muted"
              />
            )}
            
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Credits Promotion */}
            <div className="mt-3 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Post and Tag Us to Earn 1000 Credits!</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreditsModal}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Upload a quality check image or video
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Choose File'}
            </Button>
          </div>
        )}

        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Fullscreen Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0">
          <DialogHeader className="p-4">
            <DialogTitle>Quality Check Media</DialogTitle>
          </DialogHeader>
          <div className="relative flex items-center justify-center bg-black rounded-b-lg">
            {previewUrl && (
              isVideo(previewUrl) ? (
                <video 
                  src={previewUrl} 
                  controls
                  className="max-w-full max-h-[70vh] object-contain"
                />
              ) : (
                <img 
                  src={previewUrl} 
                  alt="Quality check fullscreen" 
                  className="max-w-full max-h-[70vh] object-contain"
                />
              )
            )}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credits Info Modal */}
      <Dialog open={showCreditsModal} onOpenChange={setShowCreditsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Post and Tag Us to Earn 1000 Credits!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share your quality check media on social platforms and tag us to earn 1000 credits! 
              Perfect for showcasing your latest pickup.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleCreditsModal}
                className="flex-1"
              >
                Post & Tag
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSocials}
                className="flex-1"
              >
                Socials
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Visit our socials page to see where to tag us!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}