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
  productDetails?: any[];
  shippingAddress?: any;
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

      // Fetch all orders with comprehensive data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            product_id,
            quantity,
            price_per_item,
            size
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch user profiles for customer names
      const userIds = orders?.map(order => order.user_id).filter(Boolean) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Calculate comprehensive stats
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.order_total || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get unique customers
      const uniqueCustomers = new Set(orders?.map(order => order.user_id) || []);
      const newCustomers = uniqueCustomers.size;

      // Calculate returning customers (customers with more than 1 order)
      const customerOrderCounts = new Map();
      orders?.forEach(order => {
        const count = customerOrderCounts.get(order.user_id) || 0;
        customerOrderCounts.set(order.user_id, count + 1);
      });
      const returningCustomers = Array.from(customerOrderCounts.values()).filter(count => count > 1).length;

      // Format recent orders with full details
      const formattedOrders: RecentOrder[] = (orders?.slice(0, 5) || []).map(order => ({
        id: order.id.slice(-8).toUpperCase(),
        customer: profileMap.get(order.user_id)?.display_name || 'Anonymous',
        amount: Number(order.order_total || 0),
        time: new Date(order.created_at).toLocaleString(),
        status: order.status,
        productDetails: Array.isArray(order.product_details) ? order.product_details : (order.order_items || []),
        shippingAddress: order.shipping_address
      }));

      // Set stats
      setStats({
        revenue: totalRevenue,
        orders: totalOrders,
        averageOrderValue: avgOrderValue,
        conversionRate: totalOrders > 0 ? 100 : 0, // Simplified for now
        newCustomers,
        returningCustomers,
        cartAbandonment: 0, // Would need cart analytics
        bounceRate: 0 // Would need page view analytics
      });

      setRecentOrders(formattedOrders);
      
      // Create alerts for low stock products
      const { data: products } = await supabase
        .from('products')
        .select('title, stock')
        .lt('stock', 10);

      const stockAlerts: Alert[] = (products || []).map(product => ({
        title: 'Low Stock Alert',
        message: `${product.title} has only ${product.stock} items left`,
        time: new Date().toLocaleString()
      }));

      // Add alert for orders that need fulfillment
      const pendingOrders = orders?.filter(order => order.status === 'paid' || order.status === 'pending')?.length || 0;
      if (pendingOrders > 0) {
        stockAlerts.push({
          title: 'Orders Pending Fulfillment',
          message: `${pendingOrders} orders need to be processed and shipped`,
          time: new Date().toLocaleString()
        });
      }

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