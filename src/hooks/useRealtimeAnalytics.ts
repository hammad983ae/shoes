import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealtimeMetrics {
  pageViews: number;
  activeUsers: number;
  revenue: number;
  orders: number;
  conversionRate: number;
  averageOrderValue: number;
}

export const useRealtimeAnalytics = () => {
  const [metrics, setMetrics] = useState<RealtimeMetrics>({
    pageViews: 0,
    activeUsers: 0,
    revenue: 0,
    orders: 0,
    conversionRate: 0,
    averageOrderValue: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchRealtimeMetrics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's realtime analytics
      const { data: realtimeData } = await supabase
        .from('site_analytics_realtime')
        .select('*')
        .eq('date', today);

      // Fetch today's orders
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('order_total, status')
        .gte('created_at', today)
        .eq('status', 'paid');

      const pageViews = realtimeData?.reduce((sum, item) => {
        if (item.metric_type === 'page_views') return sum + (item.metric_value || 0);
        return sum;
      }, 0) || 0;

      const activeUsers = realtimeData?.reduce((sum, item) => {
        if (item.metric_type === 'active_users') return sum + (item.metric_value || 0);
        return sum;
      }, 0) || 0;

      const revenue = todayOrders?.reduce((sum, order) => sum + order.order_total, 0) || 0;
      const orders = todayOrders?.length || 0;
      const conversionRate = pageViews > 0 ? (orders / pageViews) * 100 : 0;
      const averageOrderValue = orders > 0 ? revenue / orders : 0;

      setMetrics({
        pageViews,
        activeUsers,
        revenue,
        orders,
        conversionRate,
        averageOrderValue
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching realtime metrics:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealtimeMetrics();

    // Set up realtime subscription
    const channel = supabase
      .channel('realtime-metrics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_analytics_realtime'
        },
        () => fetchRealtimeMetrics()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => fetchRealtimeMetrics()
      )
      .subscribe();

    // Refresh every 30 seconds
    const interval = setInterval(fetchRealtimeMetrics, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return {
    metrics,
    loading,
    refresh: fetchRealtimeMetrics
  };
};