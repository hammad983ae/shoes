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
  const { user } = useAuth();
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
    if (!user?.id) return;

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

      // Fetch orders created through this creator's coupon
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('creator_id', user.id)
        .eq('status', 'paid');

      if (ordersError) throw ordersError;

      // Calculate stats
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.order_total || 0), 0) || 0;
      const totalCommission = orders?.reduce((sum, order) => sum + Number(order.commission_amount_at_purchase || 0), 0) || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const uniqueCustomers = new Set(orders?.map(order => order.user_id) || []);

      setStats({
        totalOrders,
        averageOrderValue: avgOrderValue,
        customersAcquired: uniqueCustomers.size,
        totalCommission,
        totalSalesDriven: totalRevenue
      });

      // Fetch credits
      const { data: userCredits } = await supabase
        .from('user_credits')
        .select('current_balance')
        .eq('user_id', user.id)
        .single();

      setCredits({ balance: userCredits?.current_balance || 0 });

      // Fetch credits history
      const { data: creditsHistoryData } = await supabase
        .from('credits_history')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setCreditsHistory((creditsHistoryData || []).map(transaction => ({
        date: new Date(transaction.created_at || '').toLocaleDateString(),
        action: transaction.action,
        credits: transaction.credits,
        type: transaction.type
      })));

      // Fetch payouts
      const { data: payoutsData } = await supabase
        .from('payouts')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setPayoutHistory((payoutsData || []).map(payout => ({
        date: new Date(payout.created_at || '').toLocaleDateString(),
        amount: Number(payout.amount),
        method: payout.method,
        status: payout.status || 'pending'
      })));

      // Fetch videos
      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentVideos((videosData || []).map(video => ({
        title: video.title,
        platform: video.platform,
        views: video.views || 0,
        likes: video.likes || 0,
        comments: video.comments || 0
      })));

      // Fetch checklist items
      const { data: checklistData } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      setChecklistItems((checklistData || []).map((item, index) => ({
        id: index + 1,
        text: item.text,
        completed: item.completed || false
      })));

    } catch (error) {
      console.error('Error fetching creator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addChecklistItem = async (text: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('checklist_items')
        .insert([{ profile_id: user.id, text, completed: false }]);

      if (error) throw error;
      await fetchCreatorData(); // Refresh data
    } catch (error) {
      console.error('Error adding checklist item:', error);
    }
  };

  const toggleChecklistItem = async (itemId: string, completed: boolean) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('checklist_items')
        .update({ completed })
        .eq('profile_id', user.id)
        .eq('id', itemId);

      if (error) throw error;
      await fetchCreatorData(); // Refresh data
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  };

  const deleteChecklistItem = async (itemId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('profile_id', user.id)
        .eq('id', itemId);

      if (error) throw error;
      await fetchCreatorData(); // Refresh data
    } catch (error) {
      console.error('Error deleting checklist item:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCreatorData();
    }
  }, [user?.id, couponCodeData?.code]); // Re-fetch when coupon code changes

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