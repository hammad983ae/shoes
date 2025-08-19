import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Instagram, Twitter, Youtube, Plus, X } from 'lucide-react';

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
    socials: [] as { platform: string; username: string; verified: boolean }[]
  });

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const addSocialConnection = () => {
    setFormData(prev => ({
      ...prev,
      socials: [...prev.socials, { platform: 'instagram', username: '', verified: false }]
    }));
  };

  const removeSocialConnection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socials: prev.socials.filter((_, i) => i !== index)
    }));
  };

  const updateSocialConnection = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      socials: prev.socials.map((social, i) => 
        i === index ? { ...social, [field]: value } : social
      )
    }));
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
                  <Input
                    id="credits"
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData(prev => ({ ...prev, credits: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="payout_tier">Payout Tier Override</Label>
                  <Select value={formData.payout_tier_override} onValueChange={(value) => setFormData(prev => ({ ...prev, payout_tier_override: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="No override" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No override</SelectItem>
                      <SelectItem value="standard">Standard Payout</SelectItem>
                      <SelectItem value="priority">Priority Payout</SelectItem>
                      <SelectItem value="instant">Instant Payout</SelectItem>
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
                <Button size="sm" variant="outline" onClick={addSocialConnection}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Social
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.socials.length === 0 ? (
                <p className="text-sm text-muted-foreground">No social connections added</p>
              ) : (
                formData.socials.map((social, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getSocialIcon(social.platform)}
                      <Select 
                        value={social.platform} 
                        onValueChange={(value) => updateSocialConnection(index, 'platform', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      placeholder="@username"
                      value={social.username}
                      onChange={(e) => updateSocialConnection(index, 'username', e.target.value)}
                      className="flex-1"
                    />
                    {social.verified && <Badge variant="secondary">Verified</Badge>}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => removeSocialConnection(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
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