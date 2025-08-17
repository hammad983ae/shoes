import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useCheckout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createOrder = async (cartItems: any[], orderTotal: number, couponCode?: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete your order",
        variant: "destructive"
      });
      return { success: false };
    }

    setLoading(true);
    try {
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          order_total: orderTotal,
          coupon_code: couponCode,
          status: 'pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id.toString(), // Convert to string as expected by schema
        quantity: item.quantity,
        price_per_item: parseFloat(item.price.replace('$', '')),
        size: item.selectedSize
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update order status to paid (simulating payment success)
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', order.id);

      if (updateError) throw updateError;

      toast({
        title: "Order Created Successfully",
        description: `Order #${order.id.slice(-8)} has been placed`,
      });

      return { success: true, orderId: order.id };
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Order Failed",
        description: "There was an error processing your order",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    createOrder,
    loading
  };
};