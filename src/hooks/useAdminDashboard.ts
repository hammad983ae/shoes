import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  revenue: number;
  orders: number;
  averageOrderValue: number;
  conversionRate: number;
  newCustomers: number;
  returningCustomers: number;
  cartAbandonment: number;
  bounceRate: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: number;
  time: string;
  status: string;
}

interface Alert {
  title: string;
  message: string;
  time: string;
}

export const useAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    revenue: 0,
    orders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    newCustomers: 0,
    returningCustomers: 0,
    cartAbandonment: 0,
    bounceRate: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch orders with user data - fixed query
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            product_id,
            quantity,
            price_per_item,
            size,
            products(title)
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Calculate stats
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.order_total || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get unique customers
      const uniqueCustomers = new Set(orders?.map(order => order.user_id) || []);
      const newCustomers = uniqueCustomers.size;

      // Get user profile data separately for orders
      const userIds = orders?.map(order => order.user_id).filter(Boolean) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Format recent orders
      const formattedOrders: RecentOrder[] = (orders?.slice(0, 5) || []).map(order => ({
        id: order.id.slice(-8),
        customer: profileMap.get(order.user_id)?.display_name || 'Anonymous',
        amount: Number(order.order_total || 0),
        time: new Date(order.created_at).toLocaleString(),
        status: order.status
      }));

      setStats({
        revenue: totalRevenue,
        orders: totalOrders,
        averageOrderValue: avgOrderValue,
        conversionRate: 0, // Would need traffic data
        newCustomers,
        returningCustomers: 0, // Would need historical data
        cartAbandonment: 0, // Would need cart data
        bounceRate: 0 // Would need analytics data
      });

      setRecentOrders(formattedOrders);
      
      // Create alerts for low stock
      const { data: products } = await supabase
        .from('products')
        .select('title, stock')
        .lt('stock', 10);

      const stockAlerts: Alert[] = (products || []).map(product => ({
        title: 'Low Stock Alert',
        message: `${product.title} has only ${product.stock} items left`,
        time: new Date().toLocaleString()
      }));

      setAlerts(stockAlerts);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    loading,
    stats,
    recentOrders,
    alerts,
    refetch: fetchDashboardData
  };
};