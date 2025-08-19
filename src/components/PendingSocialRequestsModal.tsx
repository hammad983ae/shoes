import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Instagram, Twitter, Youtube, Check, X, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SocialRequest {
  id: string;
  user_id: string;
  platform: string;
  username: string;
  screenshot_url?: string | null;
  follower_count: number | null;
  status: string;
  created_at: string;
  profiles?: {
    display_name: string;
  };
}

interface PendingSocialRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PendingSocialRequestsModal = ({ isOpen, onClose }: PendingSocialRequestsModalProps) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<SocialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingRequest, setEditingRequest] = useState<SocialRequest | null>(null);
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [rejectionReason, setRejectionReason] = useState('');

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'tiktok': return <div className="w-4 h-4">🎵</div>;
      default: return null;
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_verification_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to load verification requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen]);

  const handleApprove = async () => {
    if (!editingRequest) return;

    setProcessingId(editingRequest.id);
    try {
      const { error } = await supabase.rpc('approve_social_verification', {
        request_id: editingRequest.id,
        verified_follower_count: followerCount || editingRequest.follower_count || 0
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Social account verified successfully!"
      });

      await fetchRequests();
      setEditingRequest(null);
      setFollowerCount(0);
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve verification",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!editingRequest || !rejectionReason.trim()) return;

    setProcessingId(editingRequest.id);
    try {
      const { error } = await supabase
        .from('social_verification_requests')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingRequest.id);

      if (error) throw error;

      toast({
        title: "Request Rejected",
        description: "Verification request has been rejected"
      });

      await fetchRequests();
      setEditingRequest(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject verification",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (editingRequest) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Review Verification Request</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto flex-1 pr-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  {getSocialIcon(editingRequest.platform)}
                  {editingRequest.platform} Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Creator</Label>
                    <p className="font-medium">{editingRequest.profiles?.display_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <Label>Username</Label>
                    <p className="font-medium">@{editingRequest.username}</p>
                  </div>
                </div>

                <div>
                  <Label>Submitted Follower Count</Label>
                  <p className="font-medium">{editingRequest.follower_count?.toLocaleString() || 'Not provided'}</p>
                </div>

                <div>
                  <Label htmlFor="verified_followers">Verified Follower Count</Label>
                  <Input
                    id="verified_followers"
                    type="number"
                    placeholder="Enter actual follower count"
                    value={followerCount || ''}
                    onChange={(e) => setFollowerCount(parseInt(e.target.value) || 0)}
                  />
                </div>

                {editingRequest.screenshot_url && (
                  <div>
                    <Label>Screenshot</Label>
                    <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                      <img 
                        src={editingRequest.screenshot_url} 
                        alt="Verification screenshot"
                        className="max-w-full max-h-80 object-contain rounded mx-auto block"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => editingRequest.screenshot_url && window.open(editingRequest.screenshot_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Full Size
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="rejection_reason">Rejection Reason (if rejecting)</Label>
                  <Textarea
                    id="rejection_reason"
                    placeholder="Explain why this request is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t bg-background">
            <Button variant="outline" onClick={() => setEditingRequest(null)}>
              Back
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={processingId === editingRequest.id || !rejectionReason.trim()}
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={processingId === editingRequest.id}
            >
              <Check className="w-4 h-4 mr-2" />
              {processingId === editingRequest.id ? "Approving..." : "Approve"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pending Social Verification Requests</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <p>Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No pending verification requests</p>
          ) : (
            requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getSocialIcon(request.platform)}
                        <span className="font-medium capitalize">{request.platform}</span>
                      </div>
                      <div>
                        <p className="font-medium">{request.profiles?.display_name || 'Unknown Creator'}</p>
                        <p className="text-sm text-muted-foreground">@{request.username}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Followers</p>
                        <p className="font-medium">{request.follower_count?.toLocaleString() || 'Not provided'}</p>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingRequest(request)}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PendingSocialRequestsModal;