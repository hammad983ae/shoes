import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReferral } from '@/hooks/useReferral';
import { Copy, DollarSign, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


interface PaymentMethod {
  id: string;
  type: string;
  last_four: string;
  brand: string;
}

interface SaleRecord {
  id: string;
  amount: number;
  commission: number;
  user_discount: number;
  created_at: string;
  referral_code: string;
}

const CreatorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { referralData } = useReferral();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [availableWithdrawal, setAvailableWithdrawal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadCreatorData();
  }, [user]);

  const loadCreatorData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Get user credits
      const { data: creditsData } = await supabase
        .from('user_credits')
        .select('earned_from_referrals, current_balance')
        .eq('user_id', user.id)
        .single();

      if (creditsData) {
        setTotalEarnings(creditsData.earned_from_referrals || 0);
        setAvailableWithdrawal(creditsData.current_balance || 0);
      }

      // Mock sales history - in real app, get from transactions table
      setSalesHistory([]);
      
      // Mock payment methods - in real app, get from user profile/wallet
      setPaymentMethods([]);
      
    } catch (error) {
      console.error('Error loading creator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (referralData.referralCode) {
      navigator.clipboard.writeText(referralData.referralCode);
      toast({
        title: "Code Copied!",
        description: "Your checkout code has been copied to clipboard.",
      });
    }
  };

  const handleWithdraw = () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method first.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Withdrawal Initiated",
      description: "Your withdrawal request has been submitted for processing.",
    });
  };

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Creator Dashboard</h1>

      {/* Referral Code Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Your Checkout Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <code className="text-lg font-mono font-bold">
              {referralData.referralCode || 'Loading...'}
            </code>
            <Button 
              variant="outline" 
              size="sm"
              onClick={copyReferralCode}
              disabled={!referralData.referralCode}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Users get 15% off their order • You earn 20% commission on their total
          </p>
        </CardContent>
      </Card>

      {/* Earnings Summary - Big Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Earnings Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">${(totalEarnings / 100).toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Earnings</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">${(availableWithdrawal / 100).toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Available for Withdrawal</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{referralData.referralsCount}</div>
              <div className="text-sm text-muted-foreground">Total Referrals</div>
            </div>
          </div>

          {/* Withdrawal Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Withdraw Funds</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Payment Method</label>
                <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No payment methods found - Add one in your Wallet
                      </SelectItem>
                    ) : (
                      paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.brand} •••• {method.last_four}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleWithdraw}
                  disabled={availableWithdrawal === 0 || !selectedPaymentMethod}
                  className="w-full"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Withdraw ${(availableWithdrawal / 100).toFixed(2)}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales History */}
      <Card>
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
        </CardHeader>
        <CardContent>
          {salesHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sales yet. Share your referral code to start earning!
            </div>
          ) : (
            <div className="space-y-3">
              {salesHistory.map((sale) => (
                <div key={sale.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Order #{sale.id.slice(0, 8)}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(sale.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">+${(sale.commission / 100).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      Order: ${(sale.amount / 100).toFixed(2)} • User saved: ${(sale.user_discount / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorDashboard;
