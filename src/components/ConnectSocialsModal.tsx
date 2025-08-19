import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Instagram, Twitter, Youtube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ConnectSocialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ConnectSocialsModal = ({ isOpen, onClose, onSuccess }: ConnectSocialsModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    platform: '',
    username: '',
    screenshot: null as File | null
  });


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, screenshot: file }));
    }
  };

  const handleSubmit = async () => {
    if (!user?.id || !formData.platform || !formData.username) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let screenshotUrl = null;

      // Upload screenshot if provided
      if (formData.screenshot) {
        const fileExt = formData.screenshot.name.split('.').pop();
        const fileName = `${user.id}_${formData.platform}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('user-posts')
          .upload(fileName, formData.screenshot);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('user-posts')
          .getPublicUrl(fileName);

        screenshotUrl = publicUrl;
      }

      // Create verification request
      const { error } = await supabase
        .from('social_verification_requests')
        .insert([{
          user_id: user.id,
          platform: formData.platform,
          username: formData.username.replace('@', ''), // Remove @ if present
          screenshot_url: screenshotUrl
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Social verification request submitted! We'll review it within 24 hours."
      });

      onSuccess?.();
      onClose();
      setFormData({ platform: '', username: '', screenshot: null });
    } catch (error) {
      console.error('Error submitting verification request:', error);
      toast({
        title: "Error",
        description: "Failed to submit verification request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Social Account</DialogTitle>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Verification Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select 
                value={formData.platform} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">
                    <div className="flex items-center gap-2">
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </div>
                  </SelectItem>
                  <SelectItem value="tiktok">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4">🎵</div>
                      TikTok
                    </div>
                  </SelectItem>
                  <SelectItem value="twitter">
                    <div className="flex items-center gap-2">
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </div>
                  </SelectItem>
                  <SelectItem value="youtube">
                    <div className="flex items-center gap-2">
                      <Youtube className="w-4 h-4" />
                      YouTube
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="@yourusername"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="screenshot">Screenshot (Optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="screenshot"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="screenshot" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {formData.screenshot 
                      ? formData.screenshot.name 
                      : "Upload a screenshot showing you're logged in"
                    }
                  </p>
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This helps us verify account ownership
              </p>
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Payout Tiers:</h4>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>&lt;10K followers</span>
                  <span>$20/video</span>
                </div>
                <div className="flex justify-between">
                  <span>10K–50K</span>
                  <span>$35/video</span>
                </div>
                <div className="flex justify-between">
                  <span>50K–100K</span>
                  <span>$50/video</span>
                </div>
                <div className="flex justify-between">
                  <span>100K–500K</span>
                  <span>$75/video</span>
                </div>
                <div className="flex justify-between">
                  <span>500K–1M</span>
                  <span>$100/video</span>
                </div>
                <div className="flex justify-between">
                  <span>1M+</span>
                  <span>$150/video</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit for Verification"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectSocialsModal;