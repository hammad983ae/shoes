import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReferralData {
  referralCode: string | null;
  referralsCount: number;
  creditsEarned: number;
}

export const useReferral = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralData, setReferralData] = useState<ReferralData>({
    referralCode: null,
    referralsCount: 0,
    creditsEarned: 0
  });

  useEffect(() => {
    if (user) {
      fetchReferralData();
      setupReferralListener();
    }
  }, [user]);

  const fetchReferralData = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code, referrals_count')
        .eq('user_id', user.id)
        .single();

      const { data: analytics } = await supabase
        .from('post_analytics')
        .select('credits_earned')
        .eq('user_id', user.id);

      const totalCreditsEarned = analytics?.reduce((sum, a) => sum + a.credits_earned, 0) || 0;

      if (profile) {
        setReferralData({
          referralCode: profile.referral_code,
          referralsCount: profile.referrals_count || 0,
          creditsEarned: totalCreditsEarned
        });
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    }
  };

  const setupReferralListener = () => {
    if (!user) return;

    // Listen for referral updates
    const subscription = supabase
      .channel(`referrals-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Check if referrals_count increased
          if (payload.new.referrals_count > referralData.referralsCount) {
            toast({
              title: "New Referral! 🎉",
              description: "Someone has successfully signed up with your referral link.",
            });
            fetchReferralData();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const getReferralLink = () => {
    if (!referralData.referralCode) return '';
    return `${window.location.origin}/?ref=${referralData.referralCode}`;
  };

  const handleReferralPurchase = async (purchaseAmount: number, referrerCode: string) => {
    try {
      // Calculate credits (10% of purchase, converted to credits)
      const creditsEarned = Math.floor(purchaseAmount * 0.1 * 100);

      // Find referrer
      const { data: referrer } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('referral_code', referrerCode)
        .single();

      if (referrer) {
        // Add credits to referrer
        const { data: currentCredits } = await supabase
          .from('user_credits')
          .select('current_balance, total_earned')
          .eq('user_id', referrer.user_id)
          .single();

        await supabase
          .from('user_credits')
          .upsert({
            user_id: referrer.user_id,
            current_balance: (currentCredits?.current_balance || 0) + creditsEarned,
            total_earned: (currentCredits?.total_earned || 0) + creditsEarned
          });

        // Show celebration popup to referrer
        // This would typically be handled by real-time notifications
        return creditsEarned;
      }
    } catch (error) {
      console.error('Error handling referral purchase:', error);
    }
    return 0;
  };

  return {
    referralData,
    getReferralLink,
    handleReferralPurchase,
    fetchReferralData
  };
};