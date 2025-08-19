import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Search,
  MapPin,
  DollarSign,
  Eye,
  ArrowLeft,
  Download,
  Gift
} from 'lucide-react';
import { OrderStatusTracker } from '@/components/OrderStatusTracker';

interface Order {
  id: string;
  order_total: number;
  status: string;
  created_at: string;
  estimated_delivery: string | null;
  tracking_number: string | null;
  quality_check_image?: string | null;
  product_details: any[] | null;
  order_images: string[] | null;
  shipping_address: any;
  coupon_code: string | null;
  credits_used: number | null;
}

export default function OrderHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [hasReviews, setHasReviews] = useState<{[orderId: string]: boolean}>({});

  useEffect(() => {
    if (user) {
      fetchOrders();
      checkReviewStatus();
    }
  }, [user]);

  const checkReviewStatus = async () => {
    if (!user) return;
    
    try {
      const { data: reviews, error } = await supabase
        .from('product_reviews')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;

      // Get all orders with their items to check which orders have reviews
      const { data: ordersWithItems, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_items(product_id)
        `)
        .eq('user_id', user.id);

      if (ordersError) throw ordersError;

      const reviewedProducts = new Set(reviews?.map(r => r.product_id) || []);
      const orderReviewStatus: {[orderId: string]: boolean} = {};

      ordersWithItems?.forEach(order => {
        const hasAnyReviews = order.order_items?.some(item => 
          reviewedProducts.has(item.product_id)
        );
        orderReviewStatus[order.id] = !!hasAnyReviews;
      });

      setHasReviews(orderReviewStatus);
    } catch (error) {
      console.error('Error checking review status:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const formattedOrders = (data || []).map(order => ({
        ...order,
        product_details: Array.isArray(order.product_details) ? order.product_details : [],
        order_images: Array.isArray(order.order_images) ? order.order_images : [],
        credits_used: order.credits_used || 0
      }));
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 hover:bg-muted/50 backdrop-blur-md bg-background/60 rounded-full border border-border/50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
              <p className="text-muted-foreground">
                Track your orders and view purchase history
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search orders..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No orders found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'No orders match your search.' : 'You haven\'t placed any orders yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {order.order_images?.[0] ? (
                          <img 
                            src={order.order_images[0]} 
                            alt="Order item"
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">Order #{order.id.slice(-8)}</h3>
                          {getStatusIcon(order.status)}
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Placed on {format(new Date(order.created_at), 'MMM dd, yyyy')}
                        </p>
                        {order.estimated_delivery && (
                          <p className="text-sm text-muted-foreground">
                            Estimated delivery: {format(new Date(order.estimated_delivery), 'MMM dd, yyyy')}
                          </p>
                        )}
                        {order.tracking_number && (
                          <div className="text-sm">
                            <p className="text-muted-foreground">UPS Tracking Number</p>
                            <a 
                              href={`https://www.ups.com/track?track=yes&trackNums=${order.tracking_number}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-mono"
                            >
                              {order.tracking_number}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-medium">${order.order_total.toFixed(2)}</span>
                      </div>
                      {order.product_details && (
                        <p className="text-sm text-muted-foreground">
                          {order.product_details.length} item{order.product_details.length !== 1 ? 's' : ''}
                        </p>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Order #{selectedOrder.id.slice(-8)}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Status Tracker */}
                <OrderStatusTracker 
                  currentStatus={selectedOrder.status}
                  onLeaveReview={() => navigate(`/review-order/${selectedOrder.id}`)}
                  isReviewed={hasReviews[selectedOrder.id]}
                />

                {/* Order Summary */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Order Date</p>
                    <p className="font-medium">{format(new Date(selectedOrder.created_at), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-medium">${selectedOrder.order_total.toFixed(2)}</p>
                  </div>
                  {selectedOrder.estimated_delivery && (
                    <div>
                      <p className="text-muted-foreground">Estimated Delivery</p>
                      <p className="font-medium">{format(new Date(selectedOrder.estimated_delivery), 'MMM dd, yyyy')}</p>
                    </div>
                  )}
                  {selectedOrder.tracking_number && (
                    <div>
                      <p className="text-muted-foreground">UPS Tracking Number</p>
                      <a 
                        href={`https://www.ups.com/track?track=yes&trackNums=${selectedOrder.tracking_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {selectedOrder.tracking_number}
                      </a>
                    </div>
                  )}
                </div>

                {/* Quality Check Media */}
                <div>
                  <h4 className="font-medium mb-2">Quality Check</h4>
                  {selectedOrder.quality_check_image ? (
                    <div className="border rounded-lg overflow-hidden relative">
                      {selectedOrder.quality_check_image.includes('.mp4') || 
                       selectedOrder.quality_check_image.includes('.mov') || 
                       selectedOrder.quality_check_image.includes('.avi') || 
                       selectedOrder.quality_check_image.includes('.webm') ? (
                        <video 
                          src={selectedOrder.quality_check_image} 
                          controls
                          className="w-full h-48 object-contain bg-black"
                        />
                      ) : (
                        <img 
                          src={selectedOrder.quality_check_image} 
                          alt="Quality check"
                          className="w-full h-48 object-contain bg-muted"
                        />
                      )}
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = selectedOrder.quality_check_image!;
                            link.download = `quality-check-${selectedOrder.id.slice(-8)}`;
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      {/* Credits Promotion */}
                      <div className="p-3 bg-gradient-to-r from-primary/10 to-secondary/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Share & Earn 1000 Credits!</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/socials')}
                          >
                            Socials
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Quality check media will appear here once your order is processed
                    </p>
                  )}
                </div>

                {/* Package Status */}
                <div>
                  <h4 className="font-medium mb-2">Package Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedOrder.status)}
                      <span className="font-medium">{selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}</span>
                    </div>
                    {selectedOrder.tracking_number && (
                      <div className="text-sm text-muted-foreground">
                        Tracking: <span className="text-blue-600 font-mono">{selectedOrder.tracking_number}</span>
                      </div>
                    )}
                    {selectedOrder.estimated_delivery && (
                      <div className="text-sm text-muted-foreground">
                        Expected delivery: {format(new Date(selectedOrder.estimated_delivery), 'MMM dd, yyyy')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Products */}
                {selectedOrder.product_details && selectedOrder.product_details.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Items Ordered</h4>
                    <div className="space-y-3">
                      {selectedOrder.product_details.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded">
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Size: {item.size} | Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                {selectedOrder.shipping_address && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Shipping Address
                    </h4>
                    <div className="p-3 bg-muted rounded text-sm">
                      <p>{selectedOrder.shipping_address.name}</p>
                      <p>{selectedOrder.shipping_address.address}</p>
                      <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zipCode}</p>
                    </div>
                  </div>
                )}

                {/* Discounts Applied */}
                {(selectedOrder.coupon_code || (selectedOrder.credits_used && selectedOrder.credits_used > 0)) && (
                  <div>
                    <h4 className="font-medium mb-2">Discounts Applied</h4>
                    <div className="space-y-2 text-sm">
                      {selectedOrder.coupon_code && (
                        <div className="flex justify-between">
                          <span>Coupon: {selectedOrder.coupon_code}</span>
                          <span className="text-green-600">Applied</span>
                        </div>
                      )}
                      {selectedOrder.credits_used && selectedOrder.credits_used > 0 && (
                        <div className="flex justify-between">
                          <span>Credits Used: {selectedOrder.credits_used}</span>
                          <span className="text-green-600">-${(selectedOrder.credits_used / 100).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}