import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Package, Truck, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: string;
  order_total: number;
  status: string;
  created_at: string;
  estimated_delivery: string | null;
  coupon_code: string | null;
  coupon_discount: number | null;
  credits_used: number | null;
  order_items: any[];
}

export default function OrderConfirmation() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        // If no specific order ID, get the most recent order
        let query = supabase
          .from('orders')
          .select(`
            *,
            order_items(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (orderId) {
          query = query.eq('id', orderId);
        }

        const { data, error } = await query.limit(1).single();

        if (error) throw error;
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-4">
              We couldn't find your order. Please check your email for confirmation details.
            </p>
            <Button onClick={() => navigate('/')}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const deliveryDate = order.estimated_delivery ? new Date(order.estimated_delivery) : new Date();
  const orderDate = new Date(order.created_at);

  return (
    <div className="min-h-screen page-gradient">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Success Header */}
          <Card className="text-center">
            <CardContent className="pt-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
              <p className="text-muted-foreground mb-4">
                Thank you for your purchase. Your order has been confirmed and is being processed.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => navigate('/profile/orders')}>
                  View All Orders
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-mono">{order.id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date:</span>
                  <span>{orderDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold">${order.order_total.toFixed(2)}</span>
                </div>
                
                {order.coupon_code && order.coupon_discount && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon "{order.coupon_code}":</span>
                    <span>-${order.coupon_discount.toFixed(2)}</span>
                  </div>
                )}
                
                {order.credits_used && order.credits_used > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Credits Used:</span>
                    <span>-${(order.credits_used / 100).toFixed(2)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-orange-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Processing</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Estimated Delivery</span>
                  </div>
                  <p className="font-medium">{deliveryDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Quality Check</h4>
                  <p className="text-sm text-blue-700">
                    Your items will undergo a thorough quality inspection before shipping to ensure authenticity and condition.
                  </p>
                  <div className="mt-2 bg-white/50 rounded p-2 border border-dashed border-blue-300">
                    <p className="text-xs text-blue-600">Quality check image placeholder</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Order Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-center">Order<br/>Placed</span>
                </div>
                
                <div className="flex-1 h-1 bg-orange-500 mx-2"></div>
                
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-center">Processing</span>
                </div>
                
                <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
                
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <Truck className="w-4 h-4 text-gray-500" />
                  </div>
                  <span className="text-xs text-center">Shipped</span>
                </div>
                
                <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
                
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-gray-500" />
                  </div>
                  <span className="text-xs text-center">Delivered</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">📧 Order Confirmation Email</h4>
                  <p className="text-sm text-muted-foreground">
                    Check your email for detailed order confirmation and tracking information.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">📱 Track Your Order</h4>
                  <p className="text-sm text-muted-foreground">
                    Visit your order history to track progress and get updates.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">🔍 Quality Assurance</h4>
                  <p className="text-sm text-muted-foreground">
                    Items undergo professional authentication and quality checks before shipping.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">🚚 Fast Shipping</h4>
                  <p className="text-sm text-muted-foreground">
                    Express shipping ensures your items arrive quickly and safely.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}