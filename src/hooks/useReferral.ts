import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReferralData {
  referralCode: string | null;
  referralsCount: number;
  creditsEarnedFromReferrals: number;
  totalCreditsEarned: number;
}

export const useReferral = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralData, setReferralData] = useState<ReferralData>({
    referralCode: null,
    referralsCount: 0,
    creditsEarnedFromReferrals: 0,
    totalCreditsEarned: 0
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
      // Get profile data with referral info
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code, referrals_count')
        .eq('user_id', user.id)
        .maybeSingle();

      // Get user credits from new system 
      const { data: credits } = await supabase
        .from('user_balances')
        .select('lifetime_earned, available')
        .eq('user_id', user.id)
        .maybeSingle();

      const totalCreditsEarned = credits?.lifetime_earned || 0;


      if (profile) {
        setReferralData({
          referralCode: profile.referral_code,
          referralsCount: profile.referrals_count || 0,
          creditsEarnedFromReferrals: 0, // We'll need a separate tracking for referral earnings
          totalCreditsEarned: totalCreditsEarned
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
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_balances',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Check if earned_from_referrals increased
          if (payload.new.earned_from_referrals > referralData.creditsEarnedFromReferrals) {
            const creditsEarned = payload.new.earned_from_referrals - referralData.creditsEarnedFromReferrals;
            toast({
              title: "Referral Credits Earned! 💰",
              description: `You earned ${creditsEarned} credits from a referral purchase!`,
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
    return `https://cralluxsells.com/ref/${referralData.referralCode}`;
  };

  const copyReferralLink = async () => {
    const link = getReferralLink();
    if (link) {
      try {
        await navigator.clipboard.writeText(link);
        toast({
          title: "Link Copied! 📋",
          description: "Your referral link has been copied to clipboard.",
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  const shareReferralLink = async () => {
    const link = getReferralLink();
    if (link && navigator.share) {
      try {
        await navigator.share({
          title: 'Join Crallux and get 10% off!',
          text: 'Get 10% off your first sneaker purchase at Crallux!',
          url: link,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  return {
    referralData,
    getReferralLink,
    copyReferralLink,
    shareReferralLink,
    fetchReferralData
  };
};