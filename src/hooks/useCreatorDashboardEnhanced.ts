import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreatorStats {
  totalEarnings: number;
  currentMonthEarnings: number;
  totalSales: number;
  currentMonthSales: number;
  customersAcquired: number;
  averageOrderValue: number;
  conversionRate: number;
  tier: string;
  commissionRate: number;
  couponCode: string;
  weeklyRanking: number;
  totalCreators: number;
}

interface RecentOrder {
  id: string;
  order_total: number;
  commission_amount_at_purchase: number;
  created_at: string;
  customer_name?: string;
}

export const useCreatorDashboardEnhanced = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CreatorStats>({
    totalEarnings: 0,
    currentMonthEarnings: 0,
    totalSales: 0,
    currentMonthSales: 0,
    customersAcquired: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    tier: 'tier1',
    commissionRate: 0.10,
    couponCode: '',
    weeklyRanking: 0,
    totalCreators: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  const fetchCreatorDashboard = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get creator profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Get all orders using creator's coupon code
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          profiles(display_name)
        `)
        .eq('creator_id', user.id)
        .eq('status', 'paid')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Calculate current month stats
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const currentMonthOrders = orders?.filter(order => 
        new Date(order.created_at) >= currentMonth
      ) || [];

      // Calculate total stats
      const totalEarnings = orders?.reduce((sum, order) => 
        sum + (Number(order.commission_amount_at_purchase) || 0), 0
      ) || 0;

      const currentMonthEarnings = currentMonthOrders.reduce((sum, order) => 
        sum + (Number(order.commission_amount_at_purchase) || 0), 0
      );

      const totalSales = orders?.reduce((sum, order) => 
        sum + Number(order.order_total), 0
      ) || 0;

      const currentMonthSales = currentMonthOrders.reduce((sum, order) => 
        sum + Number(order.order_total), 0
      );

      const customersAcquired = new Set(orders?.map(order => order.user_id) || []).size;

      const averageOrderValue = orders?.length ? totalSales / orders.length : 0;

      // Get weekly ranking
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data: weeklyStats, error: weeklyError } = await supabase
        .from('creator_monthly_metrics')
        .select('creator_id, total_revenue')
        .gte('updated_at', weekStart.toISOString())
        .order('total_revenue', { ascending: false });

      if (weeklyError) throw weeklyError;

      const totalCreators = weeklyStats?.length || 0;
      const currentCreatorIndex = weeklyStats?.findIndex(stat => stat.creator_id === user.id) || -1;
      const weeklyRanking = currentCreatorIndex >= 0 ? currentCreatorIndex + 1 : totalCreators;

      // Format recent orders
      const formattedRecentOrders: RecentOrder[] = (orders?.slice(0, 10) || []).map(order => ({
        id: order.id,
        order_total: Number(order.order_total),
        commission_amount_at_purchase: Number(order.commission_amount_at_purchase || 0),
        created_at: order.created_at,
        customer_name: (order.profiles as any)?.display_name || 'Anonymous'
      }));

      setStats({
        totalEarnings,
        currentMonthEarnings,
        totalSales,
        currentMonthSales,
        customersAcquired,
        averageOrderValue,
        conversionRate: 0, // Would need traffic data
        tier: profile.creator_tier || 'tier1',
        commissionRate: profile.commission_rate || 0.10,
        couponCode: profile.coupon_code || '',
        weeklyRanking,
        totalCreators
      });

      setRecentOrders(formattedRecentOrders);

    } catch (error) {
      console.error('Error fetching creator dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatorDashboard();
  }, [user]);

  return {
    loading,
    stats,
    recentOrders,
    refetch: fetchCreatorDashboard
  };
};