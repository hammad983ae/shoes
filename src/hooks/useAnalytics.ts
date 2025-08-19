import { useState, useEffect } from 'react';
import { usePostHog } from '@/contexts/PostHogProvider';

interface AnalyticsStats {
  revenue: number;
  orders: number;
  averageOrderValue: number;
  conversionRate: number;
  newCustomers: number;
  returningCustomers: number;
  cartAbandonment: number;
  bounceRate: number;
  pageViews: number;
  uniqueVisitors: number;
  avgSessionDuration: string;
  topSource: string;
}

export const useAnalytics = (timeRange: string = 'today') => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AnalyticsStats>({
    revenue: 0,
    orders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    newCustomers: 0,
    returningCustomers: 0,
    cartAbandonment: 0,
    bounceRate: 0,
    pageViews: 0,
    uniqueVisitors: 0,
    avgSessionDuration: '0m 0s',
    topSource: 'Direct'
  });
  
  const posthog = usePostHog();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!posthog) return;
      
      setLoading(true);
      
      try {
        // Calculate date range
        const now = new Date();
        let startDate = new Date();
        
        switch (timeRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(now.getDate() - 90);
            break;
          case 'all':
            startDate = new Date('2023-01-01');
            break;
        }

        // Get events from PostHog for the time range
        // Note: In a real implementation, you'd use PostHog's API with proper authentication
        // For now, we'll simulate with some mock data based on the time range
        
        const mockStats = calculateMockStats(timeRange);
        setStats(mockStats);
        
        // Track analytics page view
        posthog.capture('admin_dashboard_viewed', {
          time_range: timeRange,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange, posthog]);

  return { loading, stats };
};

// Mock data calculation based on time range
const calculateMockStats = (timeRange: string): AnalyticsStats => {
  const multiplier = {
    'today': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90,
    'all': 365
  }[timeRange] || 1;

  const baseRevenue = 1250 * multiplier;
  const baseOrders = 15 * multiplier;
  const basePageViews = 2500 * multiplier;
  const baseUniqueVisitors = 1200 * multiplier;

  return {
    revenue: baseRevenue + Math.random() * 500,
    orders: baseOrders + Math.floor(Math.random() * 10),
    averageOrderValue: baseRevenue / baseOrders,
    conversionRate: 2.3 + Math.random() * 1.5,
    newCustomers: Math.floor(baseOrders * 0.6),
    returningCustomers: Math.floor(baseOrders * 0.4),
    cartAbandonment: 65 + Math.random() * 10,
    bounceRate: 35 + Math.random() * 15,
    pageViews: basePageViews,
    uniqueVisitors: baseUniqueVisitors,
    avgSessionDuration: `${Math.floor(Math.random() * 5) + 2}m ${Math.floor(Math.random() * 60)}s`,
    topSource: ['Direct', 'Google', 'Instagram', 'TikTok', 'Email'][Math.floor(Math.random() * 5)]
  };
};

// Enhanced tracking functions for e-commerce events
export const trackPurchase = (posthog: any, orderData: {
  orderId: string;
  amount: number;
  items: Array<{ 
    product_id: string; 
    name: string; 
    category: string; 
    price: number; 
    quantity: number 
  }>;
  userId?: string;
  couponCode?: string;
}) => {
  if (!posthog) return;
  
  posthog.capture('purchase_completed', {
    order_id: orderData.orderId,
    amount: orderData.amount,
    items: orderData.items,
    item_count: orderData.items.length,
    user_id: orderData.userId,
    coupon_code: orderData.couponCode,
    timestamp: new Date().toISOString()
  });

  // Also track individual product purchases
  orderData.items.forEach(item => {
    posthog.capture('product_purchased', {
      product_id: item.product_id,
      product_name: item.name,
      category: item.category,
      price: item.price,
      quantity: item.quantity,
      order_id: orderData.orderId
    });
  });
};

export const trackAddToCart = (posthog: any, productData: {
  productId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}) => {
  if (!posthog) return;
  
  posthog.capture('added_to_cart', {
    product_id: productData.productId,
    product_name: productData.name,
    category: productData.category,
    price: productData.price,
    quantity: productData.quantity,
    timestamp: new Date().toISOString()
  });
};

export const trackCheckoutStarted = (posthog: any, cartData: {
  cartTotal: number;
  itemCount: number;
  items: Array<{ product_id: string; name: string; price: number; quantity: number }>;
}) => {
  if (!posthog) return;
  
  posthog.capture('checkout_started', {
    cart_total: cartData.cartTotal,
    item_count: cartData.itemCount,
    items: cartData.items,
    timestamp: new Date().toISOString()
  });
};

export const trackProductView = (posthog: any, productData: {
  productId: string;
  name: string;
  category: string;
  price: number;
}) => {
  if (!posthog) return;
  
  posthog.capture('product_viewed', {
    product_id: productData.productId,
    product_name: productData.name,
    category: productData.category,
    price: productData.price,
    timestamp: new Date().toISOString()
  });
};

export const identifyUser = (posthog: any, userData: {
  userId: string;
  email?: string;
  role?: string;
  isCreator?: boolean;
}) => {
  if (!posthog) return;
  
  posthog.identify(userData.userId, {
    email: userData.email,
    role: userData.role,
    is_creator: userData.isCreator,
    identified_at: new Date().toISOString()
  });
};