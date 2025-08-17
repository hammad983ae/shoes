import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  salesRevenue: {
    totalRevenue: number;
    revenueByCategory: Array<{ category: string; revenue: number; orders: number }>;
    monthlyRevenue: Array<{ month: string; revenue: number }>;
  };
  orderMetrics: {
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
    topProducts: Array<{ name: string; revenue: number; orders: number }>;
  };
  customerData: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    customerLTV: number;
  };
  loading: boolean;
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    salesRevenue: {
      totalRevenue: 0,
      revenueByCategory: [],
      monthlyRevenue: []
    },
    orderMetrics: {
      totalOrders: 0,
      averageOrderValue: 0,
      conversionRate: 0,
      topProducts: []
    },
    customerData: {
      totalCustomers: 0,
      newCustomers: 0,
      returningCustomers: 0,
      customerLTV: 0
    },
    loading: true
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch orders data
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id,
            order_total,
            user_id,
            created_at,
            status,
            order_items(
              product_id,
              quantity,
              price_per_item
            )
          `)
          .eq('status', 'paid');

        if (ordersError) throw ordersError;

        // Fetch products data for category analysis
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, title, category, categories, price');

        if (productsError) throw productsError;

        // Fetch user profiles for customer analysis
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, created_at');

        if (profilesError) throw profilesError;

        // Calculate analytics
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        // Sales Revenue
        const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.order_total), 0) || 0;
        
        // Revenue by category
        const categoryRevenue: { [key: string]: { revenue: number; orders: number } } = {};
        orders?.forEach(order => {
          order.order_items?.forEach(item => {
            const product = products?.find(p => p.id === item.product_id);
            const category = product?.category || 'Uncategorized';
            if (!categoryRevenue[category]) {
              categoryRevenue[category] = { revenue: 0, orders: 0 };
            }
            categoryRevenue[category].revenue += Number(item.price_per_item) * item.quantity;
            categoryRevenue[category].orders += 1;
          });
        });

        const revenueByCategory = Object.entries(categoryRevenue).map(([category, data]) => ({
          category,
          revenue: data.revenue,
          orders: data.orders
        }));

        // Monthly revenue (last 12 months)
        const monthlyRevenue = [];
        for (let i = 11; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
          
          const monthRevenue = orders?.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= monthDate && orderDate < nextMonth;
          }).reduce((sum, order) => sum + Number(order.order_total), 0) || 0;

          monthlyRevenue.push({
            month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            revenue: monthRevenue
          });
        }

        // Order Metrics
        const totalOrders = orders?.length || 0;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Top products by revenue
        const productRevenue: { [key: string]: { revenue: number; orders: number; name: string } } = {};
        orders?.forEach(order => {
          order.order_items?.forEach(item => {
            const product = products?.find(p => p.id === item.product_id);
            const productId = item.product_id;
            if (!productRevenue[productId]) {
              productRevenue[productId] = { 
                revenue: 0, 
                orders: 0, 
                name: product?.title || 'Unknown Product' 
              };
            }
            productRevenue[productId].revenue += Number(item.price_per_item) * item.quantity;
            productRevenue[productId].orders += item.quantity;
          });
        });

        const topProducts = Object.values(productRevenue)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10);

        // Customer Data
        const totalCustomers = profiles?.length || 0;
        const newCustomers = profiles?.filter(profile => {
          const createdDate = new Date(profile.created_at);
          return createdDate >= thirtyDaysAgo;
        }).length || 0;

        
        const returningCustomersCount = Math.max(0, totalCustomers - newCustomers);
        const customerLTV = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

        setAnalytics({
          salesRevenue: {
            totalRevenue,
            revenueByCategory,
            monthlyRevenue
          },
          orderMetrics: {
            totalOrders,
            averageOrderValue,
            conversionRate: 2.4, // This would need traffic data to calculate properly
            topProducts
          },
          customerData: {
            totalCustomers,
            newCustomers,
            returningCustomers: returningCustomersCount,
            customerLTV
          },
          loading: false
        });

      } catch (error) {
        console.error('Error fetching analytics:', error);
        setAnalytics(prev => ({ ...prev, loading: false }));
      }
    };

    fetchAnalytics();
  }, []);

  return analytics;
};