import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  display_name: string;
  role: 'user' | 'creator' | 'admin';
  is_creator: boolean;
  creator_tier: string;
  commission_rate: number;
  coupon_code: string | null;
  credits: number;
  created_at: string;
}

interface CreatorMetrics {
  total_orders: number | null;
  total_revenue: number | null;
  total_commission: number | null;
  customers_acquired: number | null;
  aov: number | null;
  video_credits_granted: number | null;
}

interface CreatorManagementModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

export const CreatorManagementModal = ({ user, isOpen, onClose, onUserUpdated }: CreatorManagementModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [creditAmount, setCreditAmount] = useState(0);
  const [creditNotes, setCreditNotes] = useState('');
  const [metrics, setMetrics] = useState<CreatorMetrics | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      setIsCreator(user.is_creator);
      setCouponCode(user.coupon_code || '');
      setCreditAmount(0);
      setCreditNotes('');
      
      // Load metrics if user is a creator
      if (user.is_creator) {
        loadCreatorMetrics();
      }
    }
  }, [user, isOpen]);

  const loadCreatorMetrics = async () => {
    if (!user) return;
    
    setMetricsLoading(true);
    try {
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      
      const { data: monthlyMetrics } = await supabase
        .from('creator_monthly_metrics')
        .select('*')
        .eq('creator_id', user.id)
        .eq('month', currentMonth)
        .single();

      if (monthlyMetrics) {
        setMetrics(monthlyMetrics);
      } else {
        // Create default metrics if none exist
        setMetrics({
          total_orders: 0,
          total_revenue: 0,
          total_commission: 0,
          customers_acquired: 0,
          aov: 0,
          video_credits_granted: 0,
        });
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setMetricsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Save creator status if changed
      if (isCreator !== user.is_creator) {
        const { data: statusResult, error: statusError } = await supabase
          .rpc('admin_set_creator_status', {
            target_user_id: user.id,
            is_creator_status: isCreator,
            new_role: isCreator ? 'creator' : 'user'
          });

        if (statusError) {
          console.error('Status update error:', statusError);
          throw new Error(statusError.message || 'Failed to update creator status');
        }

        if (!(statusResult as any)?.success) {
          throw new Error((statusResult as any)?.error || 'Failed to update creator status');
        }
      }

      // Save coupon code if provided and user is creator
      if (isCreator && couponCode.trim()) {
        const { data: couponResult, error: couponError } = await supabase
          .rpc('admin_set_coupon_code', {
            target_user_id: user.id,
            new_code: couponCode.trim()
          });

        if (couponError) {
          console.error('Coupon code error:', couponError);
          throw new Error(couponError.message || 'Failed to save coupon code');
        }

        if (!(couponResult as any)?.success) {
          throw new Error((couponResult as any)?.error || 'Failed to save coupon code');
        }
      }

      toast({
        title: 'Success',
        description: 'User updated successfully',
      });

      onUserUpdated();
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGrantCredits = async () => {
    if (!user || creditAmount <= 0) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('grant_credits_admin', {
        target_user: user.id,
        amount: creditAmount,
        reason: 'admin_grant',
        meta: { notes: creditNotes.trim() || undefined },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Granted ${creditAmount} credits to ${user.display_name}`,
      });

      setCreditAmount(0);
      setCreditNotes('');
      onUserUpdated();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to grant credits',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage User: {user.display_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input value={user.email} disabled />
                </div>
                <div>
                  <Label>Display Name</Label>
                  <Input value={user.display_name} disabled />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isCreator}
                  onCheckedChange={setIsCreator}
                  disabled={user.role === 'admin'}
                />
                <Label>Creator Status</Label>
                {user.role === 'admin' && (
                  <Badge variant="destructive">Admin (Cannot modify)</Badge>
                )}
              </div>

              {isCreator && (
              <div>
                <Label>Coupon Code</Label>
                <Input
                  value={couponCode || ''}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter unique coupon code"
                  className="uppercase"
                />
              </div>
              )}
            </CardContent>
          </Card>

          {/* Creator Metrics */}
          {isCreator && (
            <Card>
              <CardHeader>
                <CardTitle>Creator Metrics (Current Month)</CardTitle>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : metrics ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Total Orders</Label>
                      <div className="text-2xl font-bold">{metrics.total_orders || 0}</div>
                    </div>
                    <div>
                      <Label>Total Revenue</Label>
                      <div className="text-2xl font-bold">${(metrics.total_revenue || 0).toFixed(2)}</div>
                    </div>
                    <div>
                      <Label>Total Commission</Label>
                      <div className="text-2xl font-bold">${(metrics.total_commission || 0).toFixed(2)}</div>
                    </div>
                    <div>
                      <Label>Customers Acquired</Label>
                      <div className="text-2xl font-bold">{metrics.customers_acquired || 0}</div>
                    </div>
                    <div>
                      <Label>AOV</Label>
                      <div className="text-2xl font-bold">${(metrics.aov || 0).toFixed(2)}</div>
                    </div>
                    <div>
                      <Label>Video Credits Granted</Label>
                      <div className="text-2xl font-bold">{metrics.video_credits_granted || 0}</div>
                    </div>
                  </div>
                ) : (
                  <p>No metrics available</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Credit Management */}
          <Card>
            <CardHeader>
              <CardTitle>Grant Credits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Credit Amount</Label>
                  <Input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                    placeholder="Enter credit amount"
                    min="1"
                  />
                </div>
                <div>
                  <Label>Current Balance</Label>
                  <div className="text-2xl font-bold">{user.credits} credits</div>
                </div>
              </div>
              
              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={creditNotes}
                  onChange={(e) => setCreditNotes(e.target.value)}
                  placeholder="Reason for credit grant..."
                />
              </div>

              <Button
                onClick={handleGrantCredits}
                disabled={loading || creditAmount <= 0}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Grant {creditAmount} Credits
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};