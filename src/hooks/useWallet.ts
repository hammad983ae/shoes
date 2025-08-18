import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface WalletStats {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  videoCredits: number;
  lifetimeVideoCredits: number;
}

interface WalletTransaction {
  id: string;
  amount: number;
  credits_added: number;
  transaction_type: string;
  status: string;
  created_at: string | null;
}

interface PaymentMethod {
  id: string;
  card_last_four: string;
  card_brand: string;
  is_default: boolean | null;
  created_at: string | null;
}

export const useWallet = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WalletStats>({
    currentBalance: 0,
    totalEarned: 0,
    totalSpent: 0,
    videoCredits: 0,
    lifetimeVideoCredits: 0
  });
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const fetchWalletData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch user credits
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (creditsError && creditsError.code !== 'PGRST116') throw creditsError;

      // Create user credits record if it doesn't exist
      if (!creditsData) {
        const { error: insertError } = await supabase
          .from('user_credits')
          .insert([{ user_id: user.id }]);

        if (insertError) throw insertError;

        setStats({
          currentBalance: 0,
          totalEarned: 0,
          totalSpent: 0,
          videoCredits: 0,
          lifetimeVideoCredits: 0
        });
      } else {
        setStats({
          currentBalance: creditsData.current_balance || 0,
          totalEarned: creditsData.total_earned || 0,
          totalSpent: creditsData.total_spent || 0,
          videoCredits: creditsData.video_credits_this_month || 0,
          lifetimeVideoCredits: creditsData.lifetime_video_credits || 0
        });
      }

      // Fetch wallet transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);

      // Fetch payment methods
      const { data: methodsData, error: methodsError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (methodsError) throw methodsError;
      setPaymentMethods(methodsData || []);

    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateCreditsForAmount = (dollarAmount: number): number => {
    if (dollarAmount < 400) {
      return dollarAmount * 100; // 1:1 ratio below $400
    }

    // Apply discount ratios for amounts above $400
    if (dollarAmount >= 1000) {
      return Math.floor(dollarAmount * 110); // $1000 = 110,000 credits (10% bonus)
    } else if (dollarAmount >= 600) {
      return Math.floor(dollarAmount * 108.33); // $600 = 65,000 credits (~8.33% bonus)
    } else {
      return Math.floor(dollarAmount * 105); // $400 = 42,000 credits (5% bonus)
    }
  };

  const reloadWallet = async (amount: number, paymentMethodId?: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      const creditsToAdd = calculateCreditsForAmount(amount);

      const { data, error } = await supabase
        .from('wallet_transactions')
        .insert([{
          user_id: user.id,
          amount,
          credits_added: creditsToAdd,
          transaction_type: 'reload',
          payment_method_id: paymentMethodId
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Wallet reload initiated",
        description: `Added ${creditsToAdd.toLocaleString()} credits to your wallet`,
      });

      await fetchWalletData();
      return { success: true, data };
    } catch (error) {
      console.error('Error reloading wallet:', error);
      toast({
        title: "Error",
        description: "Failed to reload wallet",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const addPaymentMethod = async (cardData: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  }) => {
    if (!user) return { success: false };

    try {
      // In a real app, this would integrate with Stripe or another payment processor
      // For now, we'll store mock data
      const lastFour = cardData.cardNumber.slice(-4);
      const brand = cardData.cardNumber.startsWith('4') ? 'Visa' : 
                   cardData.cardNumber.startsWith('5') ? 'Mastercard' : 'Unknown';

      const { data, error } = await supabase
        .from('payment_methods')
        .insert([{
          user_id: user.id,
          card_last_four: lastFour,
          card_brand: brand,
          is_default: paymentMethods.length === 0 // First card is default
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Payment method added",
        description: `${brand} ending in ${lastFour} has been added`,
      });

      await fetchWalletData();
      return { success: true, data };
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Error",
        description: "Failed to add payment method",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const setDefaultPaymentMethod = async (paymentMethodId: string) => {
    if (!user) return { success: false };

    try {
      // First, set all payment methods to non-default
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Then set the selected one as default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', paymentMethodId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Default payment method updated",
        description: "Your default payment method has been changed",
      });

      await fetchWalletData();
      return { success: true };
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast({
        title: "Error",
        description: "Failed to update default payment method",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [user]);

  return {
    loading,
    stats,
    transactions,
    paymentMethods,
    calculateCreditsForAmount,
    reloadWallet,
    addPaymentMethod,
    setDefaultPaymentMethod,
    refetch: fetchWalletData
  };
};