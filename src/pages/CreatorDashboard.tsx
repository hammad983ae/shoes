import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Copy, 
  DollarSign, 
  Users, 
  TrendingUp, 
  CreditCard, 
  Trophy,
  Video,
  ShoppingBag,
  Target
} from 'lucide-react';
import { useReferral } from '@/hooks/useReferral';

interface CreatorProfile {
  creator_tier: string | null;
  commission_rate: number | null;
  month_revenue_cached: number | null;
  is_creator: boolean;
}

interface CreatorMetrics {
  revenue: number | null;
  orders_count: number | null;
  aov: number | null;
  ltv: number | null;
  commission_paid: number | null;
  customers_acquired: number;
}

interface OrderRecord {
  id: string;
  order_total: number;
  commission_amount: number;
  commission_rate_at_purchase: number;
  created_at: string;
  order_id: string;
}

interface CreditRecord {
  id: string;
  type: string;
  amount_credits: number;
  status: string | null;
  notes: string | null;
  created_at: string;
}

const getTierDetails = (tier: string) => {
  switch (tier) {
    case 'tier3':
      return { name: 'Tier 3', color: 'bg-yellow-500', nextThreshold: null, commission: '20%' };
    case 'tier2':
      return { name: 'Tier 2', color: 'bg-purple-500', nextThreshold: 15000, commission: '15%' };
    default:
      return { name: 'Tier 1', color: 'bg-blue-500', nextThreshold: 5000, commission: '10%' };
  }
};

const CreatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { referralData } = useReferral();
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [metrics, setMetrics] = useState<CreatorMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderRecord[]>([]);
  const [creditRecords, setCreditRecords] = useState<CreditRecord[]>([]);
  const [creditBalance, setCreditBalance] = useState(0);
  const [videoCreditsThisMonth, setVideoCreditsThisMonth] = useState(0);
  const [lifetimeVideoCredits, setLifetimeVideoCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCreatorData();
    }
  }, [user]);

  const loadCreatorData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Get creator profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('creator_tier, commission_rate, month_revenue_cached, is_creator')
        .eq('user_id', user.id)
        .single();

      if (!profile?.is_creator) {
        toast.error('Access denied. Creator status required.');
        return;
      }

      setCreatorProfile(profile);

      // Get current month metrics
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      const { data: monthlyMetrics } = await supabase
        .from('creator_metrics_monthly')
        .select('*')
        .eq('creator_id', user.id)
        .eq('month', currentMonth)
        .single();

      // Calculate customers acquired this month
      const { count: customersAcquired } = await supabase
        .from('customer_acquisition')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id)
        .gte('first_order_date', currentMonth);

      if (monthlyMetrics) {
        setMetrics({
          revenue: monthlyMetrics.revenue || 0,
          orders_count: monthlyMetrics.orders_count || 0,
          aov: monthlyMetrics.aov || 0,
          ltv: monthlyMetrics.ltv || 0,
          commission_paid: monthlyMetrics.commission_paid || 0,
          customers_acquired: customersAcquired || 0
        });
      } else {
        setMetrics({
          revenue: 0,
          orders_count: 0,
          aov: 0,
          ltv: 0,
          commission_paid: 0,
          customers_acquired: customersAcquired || 0
        });
      }

      // Get recent orders
      const { data: orders } = await supabase
        .from('creator_earnings')
        .select(`
          id,
          order_total,
          commission_amount,
          commission_rate_at_purchase,
          created_at,
          order_id
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentOrders(orders || []);

      // Get credit balance
      const { data: credits } = await supabase
        .from('user_credits')
        .select('current_balance')
        .eq('user_id', user.id)
        .single();

      setCreditBalance(credits?.current_balance || 0);

      // Get credit records
      const { data: creditLedger } = await supabase
        .from('creator_credits_ledger')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setCreditRecords(creditLedger || []);

      // Calculate video credits
      const thisMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
      const thisMonthCredits = creditLedger?.filter(
        record => record.type === 'video_bonus' && 
        record.status === 'approved' &&
        record.created_at.startsWith(thisMonth)
      ).reduce((sum, record) => sum + record.amount_credits, 0) || 0;

      const lifetimeCredits = creditLedger?.filter(
        record => record.type === 'video_bonus' && record.status === 'approved'
      ).reduce((sum, record) => sum + record.amount_credits, 0) || 0;

      setVideoCreditsThisMonth(thisMonthCredits);
      setLifetimeVideoCredits(lifetimeCredits);

    } catch (error) {
      console.error('Error loading creator data:', error);
      toast.error('Failed to load creator data');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (referralData?.referralCode) {
      navigator.clipboard.writeText(referralData.referralCode);
      toast.success('Referral code copied to clipboard!');
    }
  };

  const submitVideoForApproval = async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('creator_credits_ledger')
        .insert({
          creator_id: user.id,
          type: 'video_bonus',
          amount_credits: 5000,
          notes: 'Video submission for approval',
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Video submitted for approval! You will receive 5,000 credits once approved.');
      loadCreatorData(); // Refresh data
    } catch (error) {
      console.error('Error submitting video:', error);
      toast.error('Failed to submit video for approval');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading creator dashboard...</div>
      </div>
    );
  }

  if (!creatorProfile?.is_creator) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Creator status required to access this dashboard.</p>
        </div>
      </div>
    );
  }

  const tierInfo = getTierDetails(creatorProfile.creator_tier || 'tier1');
  const monthRevenue = creatorProfile.month_revenue_cached || 0;
  const progressToNext = tierInfo.nextThreshold 
    ? Math.min((monthRevenue / tierInfo.nextThreshold) * 100, 100)
    : 100;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
        <p className="text-muted-foreground">Manage your earnings and track your performance</p>
      </div>

      {/* Tier Status Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge className={`${tierInfo.color} text-white`}>
                <Trophy className="h-4 w-4 mr-1" />
                {tierInfo.name}
              </Badge>
              <span className="text-lg font-semibold">{tierInfo.commission} Commission</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${monthRevenue.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">This month's revenue</p>
            </div>
          </div>
          
          {tierInfo.nextThreshold && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {tierInfo.nextThreshold === 5000 ? 'Tier 2' : 'Tier 3'}</span>
                <span>${monthRevenue.toFixed(2)} / ${tierInfo.nextThreshold.toFixed(2)}</span>
              </div>
              <Progress value={progressToNext} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders This Month</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.orders_count || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AOV This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(metrics?.aov || 0).toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers Acquired</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.customers_acquired || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(metrics?.commission_paid || 0).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Your Checkout Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Checkout Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Share this code with customers</p>
              <p className="text-2xl font-mono font-bold">{referralData?.referralCode || 'Loading...'}</p>
            </div>
            <Button 
              onClick={copyReferralCode} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Credits Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Creator Credits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold">{creditBalance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Video Credits This Month</p>
                <p className="text-2xl font-bold">{videoCreditsThisMonth.toLocaleString()}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Submit Video for Approval</p>
                <p className="text-sm text-muted-foreground">Earn 5,000 credits per approved video</p>
              </div>
              <Button onClick={submitVideoForApproval} size="sm">
                <Video className="h-4 w-4 mr-2" />
                Submit Video
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Lifetime video credits: {lifetimeVideoCredits.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">${order.order_total.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+${order.commission_amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {(order.commission_rate_at_purchase * 100).toFixed(0)}% rate
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No orders yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Share your referral code to start earning!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Credits Ledger */}
      <Card>
        <CardHeader>
          <CardTitle>Credits History</CardTitle>
        </CardHeader>
        <CardContent>
          {creditRecords.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {creditRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={record.status === 'approved' ? 'default' : 
                                record.status === 'pending' ? 'secondary' : 'destructive'}
                      >
                        {record.status}
                      </Badge>
                      <span className="font-medium capitalize">
                        {record.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(record.created_at).toLocaleDateString()}
                    </p>
                    {record.notes && (
                      <p className="text-sm text-muted-foreground">{record.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      record.amount_credits > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {record.amount_credits > 0 ? '+' : ''}{record.amount_credits.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">credits</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No credit transactions yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payouts */}
      <Card>
        <CardHeader>
          <CardTitle>Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Payout system coming soon!</p>
            <Button disabled>Request Payout</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorDashboard;