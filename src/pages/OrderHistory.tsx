import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Truck, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
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
  tracking_number: string | null;
  order_items: any[];
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'processing':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen page-gradient">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-8 w-48" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-gradient">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/profile')}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Order History</h1>
              <p className="text-muted-foreground">
                Track your orders and view past purchases
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="pt-8 text-center">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't placed any orders yet. Start shopping to see your order history here.
                </p>
                <Button onClick={() => navigate('/catalog')}>
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const orderDate = new Date(order.created_at);
                const deliveryDate = order.estimated_delivery ? new Date(order.estimated_delivery) : new Date();
                const orderNumber = order.id.slice(-8).toUpperCase();

                return (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            Order #{orderNumber}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Placed on {orderDate.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <p className="text-lg font-bold mt-1">${order.order_total.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Order Items */}
                      <div className="grid gap-3">
                        {order.order_items?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Product Item</p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity} • ${item.price_per_item?.toFixed(2) || '0.00'} each
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Discounts Applied */}
                      {(order.coupon_code || (order.credits_used && order.credits_used > 0)) && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-800 mb-1">Discounts Applied</h4>
                          <div className="space-y-1 text-sm">
                            {order.coupon_code && order.coupon_discount && (
                              <p className="text-green-700">
                                Coupon "{order.coupon_code}": -${order.coupon_discount.toFixed(2)}
                              </p>
                            )}
                            {order.credits_used && order.credits_used > 0 && (
                              <p className="text-green-700">
                                Credits Used: {order.credits_used} (-${(order.credits_used / 100).toFixed(2)})
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Delivery Info */}
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-800 font-medium">
                            {order.status === 'delivered' ? 'Delivered' : 'Estimated Delivery'}
                          </span>
                        </div>
                        <span className="text-blue-700">
                          {deliveryDate.toLocaleDateString()}
                        </span>
                      </div>

                      {/* Tracking */}
                      {order.tracking_number && (
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between">
                            <span className="text-purple-800 font-medium">Tracking Number:</span>
                            <span className="font-mono text-purple-700">{order.tracking_number}</span>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/order-confirmation?orderId=${order.id}`)}
                        >
                          View Details
                        </Button>
                        {order.status === 'delivered' && (
                          <Button variant="outline" size="sm">
                            Reorder
                          </Button>
                        )}
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <Button variant="outline" size="sm">
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}