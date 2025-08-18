import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Package, User, MapPin, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

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
  shipping_address?: {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items?: OrderItem[];
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

  if (!order) return null;

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(order.id, {
        tracking_number: trackingNumber,
        quality_check_image: qualityCheckImage,
        fulfillment_notes: fulfillmentNotes
      });
    }
    onClose();
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
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => (
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
                <p className="text-muted-foreground">No items found</p>
              )}
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">${order.order_total.toFixed(2)}</span>
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
              <Label htmlFor="quality-image">Quality Check Image URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="quality-image"
                  value={qualityCheckImage}
                  onChange={(e) => setQualityCheckImage(e.target.value)}
                  placeholder="Enter image URL for quality check"
                />
                {qualityCheckImage && (
                  <Button variant="outline" size="icon" onClick={() => window.open(qualityCheckImage, '_blank')}>
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
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