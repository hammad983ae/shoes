import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Instagram, Twitter, Youtube, Plus, Minus } from 'lucide-react';

interface Creator {
  id: string;
  user_id: string;
  display_name: string;
  coupon_code?: string;
  creator_tier: string;
  credits: number;
  commission_rate: number;
}

interface CreatorEditModalProps {
  creator: Creator | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (creatorData: any) => void;
}

const CreatorEditModal = ({ creator, isOpen, onClose, onSave }: CreatorEditModalProps) => {
  const [formData, setFormData] = useState({
    coupon_code: creator?.coupon_code || '',
    creator_tier: creator?.creator_tier || 'tier1',
    credits: creator?.credits || 0,
    admin_notes: '',
    payout_tier_override: '',
    socials: [] as { platform: string; username: string; verified: boolean; follower_count: number }[]
  });
  
  const [socialConnections, setSocialConnections] = useState<any[]>([]);
  const [loadingSocials, setLoadingSocials] = useState(true);
  const [editingSocials, setEditingSocials] = useState(false);

  useEffect(() => {
    if (creator?.user_id && isOpen) {
      fetchSocialConnections();
      setFormData(prev => ({
        ...prev,
        coupon_code: creator?.coupon_code || '',
        creator_tier: creator?.creator_tier || 'tier1',
        credits: creator?.credits || 0
      }));
    }
  }, [creator, isOpen]);

  const fetchSocialConnections = async () => {
    if (!creator?.user_id) return;
    
    setLoadingSocials(true);
    try {
      const { data, error } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', creator.user_id);
      
      if (error) throw error;
      setSocialConnections(data || []);
    } catch (error) {
      console.error('Error fetching social connections:', error);
    } finally {
      setLoadingSocials(false);
    }
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const adjustCredits = (amount: number) => {
    setFormData(prev => ({
      ...prev,
      credits: Math.max(0, prev.credits + amount)
    }));
  };

  const updateSocialFollowerCount = async (index: number, newCount: number) => {
    const updatedConnections = [...socialConnections];
    updatedConnections[index] = { ...updatedConnections[index], follower_count: newCount };
    setSocialConnections(updatedConnections);

    // Update in database
    try {
      const { error } = await supabase
        .from('social_connections')
        .update({ follower_count: newCount })
        .eq('id', updatedConnections[index].id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating follower count:', error);
    }
  };


  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'tiktok': return <div className="w-4 h-4">🎵</div>;
      default: return <Instagram className="w-4 h-4" />;
    }
  };

  if (!creator) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Creator - {creator.display_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Creator Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Creator Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="coupon_code">Coupon Code</Label>
                  <Input
                    id="coupon_code"
                    value={formData.coupon_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, coupon_code: e.target.value }))}
                    placeholder="Enter coupon code"
                  />
                </div>
                <div>
                  <Label htmlFor="creator_tier">Creator Tier</Label>
                  <Select value={formData.creator_tier} onValueChange={(value) => setFormData(prev => ({ ...prev, creator_tier: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tier1">Tier 1 (10% Commission)</SelectItem>
                      <SelectItem value="tier2">Tier 2 (15% Commission)</SelectItem>
                      <SelectItem value="tier3">Tier 3 (20% Commission)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="credits">Current Credits</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustCredits(-100)}
                      disabled={formData.credits <= 0}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      id="credits"
                      type="number"
                      value={formData.credits}
                      onChange={(e) => setFormData(prev => ({ ...prev, credits: parseInt(e.target.value) || 0 }))}
                      className="text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustCredits(100)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="payout_tier">Credits Per Video Tier</Label>
                  <Select value={formData.payout_tier_override} onValueChange={(value) => setFormData(prev => ({ ...prev, payout_tier_override: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto (based on followers)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Auto (based on followers)</SelectItem>
                      <SelectItem value="2000">Under 10K: $20 (2000 credits)</SelectItem>
                      <SelectItem value="3500">10K–50K: $35 (3500 credits)</SelectItem>
                      <SelectItem value="5000">50K–100K: $50 (5000 credits)</SelectItem>
                      <SelectItem value="7500">100K–500K: $75 (7500 credits)</SelectItem>
                      <SelectItem value="10000">500K–1M: $100 (10000 credits)</SelectItem>
                      <SelectItem value="15000">1M+: $150 (15000 credits)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Connections */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Connected Socials</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSocials(!editingSocials)}
                >
                  {editingSocials ? 'Done' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingSocials ? (
                <p className="text-sm text-muted-foreground">Loading social connections...</p>
              ) : socialConnections.length === 0 ? (
                <p className="text-sm text-muted-foreground">No verified social connections</p>
              ) : (
                socialConnections.map((social, index) => (
                  <div key={social.id} className="flex items-center gap-3 p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="flex items-center gap-2">
                      {getSocialIcon(social.platform)}
                      <span className="font-medium capitalize">{social.platform}</span>
                    </div>
                    <span className="flex-1">@{social.username}</span>
                    <div className="flex items-center gap-2">
                      {editingSocials ? (
                        <Input
                          type="number"
                          value={social.follower_count || 0}
                          onChange={(e) => updateSocialFollowerCount(index, parseInt(e.target.value) || 0)}
                          className="w-24 h-8 text-sm"
                          placeholder="Followers"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {social.follower_count?.toLocaleString()} followers
                        </span>
                      )}
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Verified
                    </Badge>
                    <span className="text-sm font-medium">
                      ${(social.payout_tier_credits / 100).toFixed(0)}/video
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Admin Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add internal notes about this creator..."
                value={formData.admin_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                rows={3}
              />
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatorEditModal;