import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCouponCode } from './useCouponCode';

interface CreatorStats {
  totalOrders: number;
  averageOrderValue: number;
  customersAcquired: number;
  totalCommission: number;
  totalSalesDriven: number;
}

interface SocialConnection {
  platform: string;
  username: string;
  follower_count: number;
  verified_at: string;
}

interface CreatorProfile {
  name: string;
  profileImage: string;
  tier: number;
  couponCode: string;
  commissionRate: number;
  followers: number;
  socialConnections: SocialConnection[];
}

interface CreditTransaction {
  date: string;
  action: string;
  credits: number;
  type: string;
}

interface Payout {
  date: string;
  amount: number;
  method: string;
  status: string;
}

interface Video {
  title: string;
  platform: string;
  views: number;
  likes: number;
  comments: number;
}

interface ChecklistItem {
  id: number;
  text: string;
  completed: boolean;
}

export const useCreatorDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const authStable = !authLoading;
  const { couponCode: couponCodeData } = useCouponCode(user?.id);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CreatorProfile>({
    name: '',
    profileImage: '/placeholder.svg',
    tier: 1,
    couponCode: '',
    commissionRate: 0,
    followers: 0,
    socialConnections: []
  });
  const [stats, setStats] = useState<CreatorStats>({
    totalOrders: 0,
    averageOrderValue: 0,
    customersAcquired: 0,
    totalCommission: 0,
    totalSalesDriven: 0
  });
  const [credits, setCredits] = useState({ balance: 0 });
  const [creditsHistory, setCreditsHistory] = useState<CreditTransaction[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<Payout[]>([]);
  const [recentVideos, setRecentVideos] = useState<Video[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  const fetchCreatorData = async () => {
    // Wait for stable auth
    if (!user?.id || !authStable) {
      console.log('❌ Skipping fetch - auth not stable');
      return;
    }

    console.log('✅ Session validated, fetching creator data for user:', user.id);

    try {
      setLoading(true);

      // Fetch creator profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch verified social connections
      const { data: socialConnections, error: socialError } = await supabase
        .from('social_connections')
        .select('platform, username, follower_count, verified_at')
        .eq('user_id', user.id);

      if (socialError) throw socialError;

      if (profileData) {
        setProfile({
          name: profileData.display_name || 'Creator',
          profileImage: profileData.avatar_url || '/placeholder.svg',
          tier: profileData.creator_tier === 'tier3' ? 3 : profileData.creator_tier === 'tier2' ? 2 : 1,
          couponCode: couponCodeData?.code || 'No code set',
          commissionRate: (profileData.commission_rate || 0.1) * 100,
          followers: 0, // Legacy field
          socialConnections: socialConnections || []
        });
      }

      // Set placeholder stats for now (no orders table yet)
      setStats({
        totalOrders: 0,
        averageOrderValue: 0,
        customersAcquired: 0,
        totalCommission: 0,
        totalSalesDriven: 0
      });

      // Set placeholder credits (no user_credits table yet)
      setCredits({ balance: profileData.credits || 0 });

      // Set placeholder histories (no related tables yet)
      setCreditsHistory([]);
      setPayoutHistory([]);
      setRecentVideos([]);
      setChecklistItems([]);

    } catch (error) {
      console.error('Error fetching creator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addChecklistItem = async (text: string) => {
    // Placeholder - no checklist_items table yet
    console.log('Add checklist item:', text);
  };

  const toggleChecklistItem = async (itemId: string, completed: boolean) => {
    // Placeholder - no checklist_items table yet
    console.log('Toggle checklist item:', itemId, completed);
  };

  const deleteChecklistItem = async (itemId: string) => {
    // Placeholder - no checklist_items table yet
    console.log('Delete checklist item:', itemId);
  };

  useEffect(() => {
    // Only fetch when auth is fully stable
    if (authStable) {
      fetchCreatorData();
    }
  }, [user?.id, couponCodeData?.code, authStable]); // Re-fetch when coupon code changes

  return {
    loading,
    profile,
    stats,
    credits,
    creditsHistory,
    payoutHistory,
    recentVideos,
    checklistItems,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    refetch: fetchCreatorData
  };
};