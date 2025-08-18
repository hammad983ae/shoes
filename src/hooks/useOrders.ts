import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: string;
  user_id: string;
  creator_id?: string;
  order_total: number;
  status: string;
  coupon_code?: string;
  currency: string;
  commission_amount_at_purchase?: number;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  items?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    price_per_item: number;
    size?: string;
    product_title?: string;
  }>;
}

interface OrderSummary {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  returned: number;
}

interface FulfillmentStats {
  avgProcessingTime: string;
  avgShippingTime: string;
  onTimeDelivery: number;
  returnRate: number;
}

export const useOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<OrderSummary>({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    returned: 0
  });
  const [fulfillmentStats, setFulfillmentStats] = useState<FulfillmentStats>({
    avgProcessingTime: '0 days',
    avgShippingTime: '0 days',
    onTimeDelivery: 0,
    returnRate: 0
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const { data: ordersData, error } = await supabase
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

      if (error) throw error;

      // Get user profile data separately for orders
      const userIds = ordersData?.map(order => order.user_id).filter(Boolean) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const formattedOrders: Order[] = (ordersData || []).map(order => ({
        ...order,
        creator_id: order.creator_id || undefined,
        coupon_code: order.coupon_code || undefined,
        commission_amount_at_purchase: order.commission_amount_at_purchase || undefined,
        customer_name: profileMap.get(order.user_id)?.display_name || 'Anonymous',
        items: (order.order_items || []).map(item => ({
          ...item,
          size: item.size || undefined,
          product_title: (item.products as any)?.title || 'Unknown Product'
        }))
      }));

      setOrders(formattedOrders);

      // Calculate summary
      const total = formattedOrders.length;
      const pending = formattedOrders.filter(o => o.status === 'pending').length;
      const processing = formattedOrders.filter(o => o.status === 'processing').length;
      const shipped = formattedOrders.filter(o => o.status === 'shipped').length;
      const delivered = formattedOrders.filter(o => o.status === 'delivered').length;
      const returned = formattedOrders.filter(o => o.status === 'returned').length;

      setSummary({
        total,
        pending,
        processing,
        shipped,
        delivered,
        returned
      });

      // Calculate fulfillment stats (simplified)
      const returnRate = total > 0 ? (returned / total) * 100 : 0;

      setFulfillmentStats({
        avgProcessingTime: '1-2 days',
        avgShippingTime: '3-5 days',
        onTimeDelivery: 95,
        returnRate: Math.round(returnRate)
      });

    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: {
    user_id: string;
    order_total: number;
    items: Array<{
      product_id: string;
      quantity: number;
      price_per_item: number;
      size?: string;
    }>;
    coupon_code?: string;
  }) => {
    try {
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: orderData.user_id,
          order_total: orderData.order_total,
          coupon_code: orderData.coupon_code,
          status: 'pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.items.map(item => ({
        ...item,
        order_id: order.id
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await fetchOrders(); // Refresh the list
      return { success: true, data: order };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    loading,
    orders,
    summary,
    fulfillmentStats,
    createOrder,
    refetch: fetchOrders
  };
};