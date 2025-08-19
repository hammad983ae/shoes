import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InviteCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteCreatorModal({ isOpen, onClose, onSuccess }: InviteCreatorModalProps) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tier, setTier] = useState("tier1");
  const [couponCode, setCouponCode] = useState("");
  const [startingCredits, setStartingCredits] = useState("");
  const [tiktokUsername, setTiktokUsername] = useState("");
  const [followers, setFollowers] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  const generateCouponCode = () => {
    if (displayName) {
      const baseCode = displayName.split(' ')[0].toUpperCase();
      setCouponCode(`${baseCode}15`);
    } else if (email) {
      const baseCode = email.split('@')[0].toUpperCase().slice(0, 6);
      setCouponCode(`${baseCode}15`);
    }
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Email address is required",
        variant: "destructive",
      });
      return;
    }

    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Coupon code is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const inviteData = {
        email,
        display_name: displayName,
        tier,
        coupon_code: couponCode,
        starting_credits: parseInt(startingCredits) || 0,
        tiktok_username: tiktokUsername,
        followers: parseInt(followers) || 0,
        notes
      };

      const { data, error } = await supabase.functions.invoke('send-creator-invite', {
        body: inviteData
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to send invite');
      }
      
      toast({
        title: "Invite Sent",
        description: `Creator invite sent to ${email}`,
      });
      
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error sending creator invite:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setDisplayName("");
    setTier("tier1");
    setCouponCode("");
    setStartingCredits("");
    setTiktokUsername("");
    setFollowers("");
    setNotes("");
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Invite Creator</span>
              </DialogTitle>
              <DialogDescription>
                Send an invitation to someone to become a creator
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@example.com"
                onBlur={generateCouponCode}
              />
            </div>

            <div>
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Creator's display name"
                onBlur={generateCouponCode}
              />
            </div>
          </div>

          {/* Creator Setup */}
          <div className="space-y-4">
            <h3 className="font-semibold">Creator Setup</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tier">Commission Tier</Label>
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tier1">Tier 1 (10%)</SelectItem>
                    <SelectItem value="tier2">Tier 2 (15%)</SelectItem>
                    <SelectItem value="tier3">Tier 3 (20%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="coupon">Coupon Code *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g., ALEX15"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateCouponCode}
                    size="sm"
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="credits">Starting Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  value={startingCredits}
                  onChange={(e) => setStartingCredits(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="tiktok">TikTok Username</Label>
                <Input
                  id="tiktok"
                  value={tiktokUsername}
                  onChange={(e) => setTiktokUsername(e.target.value)}
                  placeholder="@username"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="followers">TikTok Followers</Label>
              <Input
                id="followers"
                type="number"
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any internal notes about this creator invite..."
                rows={3}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Invite Preview</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Email will be sent to: <span className="font-medium">{email || 'No email provided'}</span></p>
              <p>Display name: <span className="font-medium">{displayName || 'Not specified'}</span></p>
              <p>Commission tier: <span className="font-medium">{tier} ({tier === 'tier1' ? '10%' : tier === 'tier2' ? '15%' : '20%'})</span></p>
              <p>Coupon code: <span className="font-medium">{couponCode || 'Not specified'}</span></p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!email || !couponCode || loading}
            >
              {loading ? "Sending..." : "Send Invite"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}