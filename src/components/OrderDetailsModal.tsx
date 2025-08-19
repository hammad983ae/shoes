import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Package, User, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import ImageUpload from "./ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price_per_item: number;
  size?: string;
}

interface Order {
  id: string;
  user_id: string;
  customer_name?: string;
  customer_email?: string;
  order_total: number;
  status: string;
  created_at: string;
  estimated_delivery?: string;
  tracking_number?: string;
  quality_check_image?: string;
  fulfillment_notes?: string;
  credits_used?: number;
  coupon_discount?: number;
  product_details?: Array<{
    id?: number;
    name?: string;
    quantity?: number;
    price?: number;
    size?: string;
  }>;
  shipping_address?: {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    price_per_item: number;
    size?: string;
    product_title?: string;
  }>;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdate?: (orderId: string, updates: Partial<Order>) => void;
}

export function OrderDetailsModal({ isOpen, onClose, order, onUpdate }: OrderDetailsModalProps) {
  const [trackingNumber, setTrackingNumber] = useState(order?.tracking_number || "");
  const [qualityCheckImage, setQualityCheckImage] = useState(order?.quality_check_image || "");
  const [fulfillmentNotes, setFulfillmentNotes] = useState(order?.fulfillment_notes || "");
  const { toast } = useToast();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (order) {
      setTrackingNumber(order.tracking_number || "");
      setQualityCheckImage(order.quality_check_image || "");
      setFulfillmentNotes(order.fulfillment_notes || "");
      
      // Use items from the order if they exist, otherwise check product_details
      if (order.items && order.items.length > 0) {
        const formattedItems: OrderItem[] = order.items.map(item => ({
          id: item.id,
          product_name: item.product_title || 'Unknown Product',
          quantity: item.quantity,
          price_per_item: item.price_per_item,
          size: item.size
        }));
        setOrderItems(formattedItems);
      } else if (order.product_details && Array.isArray(order.product_details) && order.product_details.length > 0) {
        // Fallback to product_details JSON field for older orders
        const formattedItems: OrderItem[] = order.product_details.map((item: any, index: number) => ({
          id: item.id?.toString() || index.toString(),
          product_name: item.name || 'Unknown Product',
          quantity: item.quantity || 1,
          price_per_item: item.price || 0,
          size: item.size
        }));
        setOrderItems(formattedItems);
      } else {
        fetchOrderItems();
      }
    }
  }, [order]);

  const fetchOrderItems = async () => {
    if (!order) return;
    
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          product_id,
          quantity,
          price_per_item,
          size,
          products(title)
        `)
        .eq('order_id', order.id);

      if (error) throw error;

      const items: OrderItem[] = (data || []).map(item => ({
        id: item.id,
        product_name: (item.products as any)?.title || 'Unknown Product',
        quantity: item.quantity,
        price_per_item: item.price_per_item,
        size: item.size || undefined
      }));

      setOrderItems(items);
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  if (!order) return null;

  const handleSave = async () => {
    try {
      // Update order in database
      const { error } = await supabase
        .from('orders')
        .update({
          tracking_number: trackingNumber,
          quality_check_image: qualityCheckImage,
          fulfillment_notes: fulfillmentNotes
        })
        .eq('id', order.id);

      if (error) throw error;

      if (onUpdate) {
        onUpdate(order.id, {
          tracking_number: trackingNumber,
          quality_check_image: qualityCheckImage,
          fulfillment_notes: fulfillmentNotes
        });
      }

      toast({
        title: "Order updated",
        description: "Order details have been updated successfully",
      });

      onClose();
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update order",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Order Details - #{order.id.slice(-8)}</DialogTitle>
              <DialogDescription>
                Complete order information for fulfillment
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Order Status */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="font-semibold">Order Status</h3>
              <p className="text-sm text-muted-foreground">Created: {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <Badge variant="secondary" className={`${getStatusColor(order.status)} text-white`}>
              {order.status}
            </Badge>
          </div>

          {/* Customer Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Customer Information</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium">{order.shipping_address?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">{order.shipping_address?.email || order.customer_email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">User ID</Label>
                  <p className="font-mono text-sm">{order.user_id}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Shipping Address</h3>
              </div>
              {order.shipping_address ? (
                <div className="space-y-1">
                  <p className="font-medium">{order.shipping_address.name}</p>
                  <p>{order.shipping_address.address}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No shipping address provided</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Order Items</h3>
            </div>
            <div className="space-y-3">
              {orderItems.length > 0 ? (
                orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      {item.size && <p className="text-sm text-muted-foreground">Size: {item.size}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.price_per_item.toFixed(2)} x {item.quantity}</p>
                      <p className="text-sm text-muted-foreground">${(item.price_per_item * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Loading items...</p>
              )}
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="font-semibold">Subtotal</span>
              <span className="font-bold text-lg">
                ${(orderItems.reduce((sum, item) => sum + (item.price_per_item * item.quantity), 0)).toFixed(2)}
              </span>
            </div>
            {(order.credits_used && order.credits_used > 0) && (
              <div className="flex justify-between items-center text-green-600">
                <span>Credits Applied ({order.credits_used} credits)</span>
                <span>-${(order.credits_used / 100).toFixed(2)}</span>
              </div>
            )}
            {order.coupon_discount && (
              <div className="flex justify-between items-center text-green-600">
                <span>Coupon Discount</span>
                <span>-${order.coupon_discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Tax (8.75%)</span>
              <span>${((order.order_total || 0) * 0.0875).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t font-bold">
              <span>Final Total</span>
              <span className="text-lg">${(order.order_total || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Fulfillment Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Fulfillment Information</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tracking">Tracking Number</Label>
                <Input
                  id="tracking"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                />
              </div>
              <div>
                <Label htmlFor="delivery">Estimated Delivery</Label>
                <Input
                  id="delivery"
                  value={order.estimated_delivery || ''}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="quality-check">Quality Check Image</Label>
              <ImageUpload
                onImageUploaded={setQualityCheckImage}
                currentImage={qualityCheckImage}
                bucketName="products"
              />
            </div>

            <div>
              <Label htmlFor="notes">Fulfillment Notes</Label>
              <Textarea
                id="notes"
                value={fulfillmentNotes}
                onChange={(e) => setFulfillmentNotes(e.target.value)}
                placeholder="Add notes for fulfillment team..."
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}