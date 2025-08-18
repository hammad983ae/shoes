import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, User, Package, MapPin, DollarSign, CreditCard, Mail, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}

interface OrderItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  size?: string;
}

interface Customer {
  id: string;
  display_name: string;
  email?: string;
  credits: number;
}

export const CreateOrderModal = ({ isOpen, onClose, onOrderCreated }: CreateOrderModalProps) => {
  const [loading, setLoading] = useState(false);
  
  // Customer selection
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  
  // Product selection
  const [products, setProducts] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  // Shipping & Payment
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US"
  });
  const [couponCode, setCouponCode] = useState("");
  const [creditsToUse, setCreditsToUse] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("mark_paid");
  const [orderNotes, setOrderNotes] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchProducts();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, credits')
        .limit(100);

      if (error) throw error;

      // Get emails from auth users - this would require admin privileges
      const formattedCustomers: Customer[] = (data || []).map(profile => ({
        id: profile.user_id,
        display_name: profile.display_name || 'Anonymous',
        email: 'email@example.com', // Would need to fetch from auth.users
        credits: profile.credits || 0
      }));

      setCustomers(formattedCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('title');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addOrderItem = (product: any) => {
    const newItem: OrderItem = {
      product_id: product.id,
      product_name: product.title,
      price: product.price,
      quantity: 1,
      size: undefined
    };
    setOrderItems([...orderItems, newItem]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const creditsDiscount = creditsToUse / 100; // 100 credits = $1
    return Math.max(0, subtotal - creditsDiscount);
  };

  const handleCreateOrder = async () => {
    if (!selectedCustomer || orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select a customer and add at least one item",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const orderTotal = calculateTotal();
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: selectedCustomer.id,
          order_total: orderTotal,
          status: paymentMethod === 'mark_paid' ? 'paid' : 'pending',
          shipping_address: shippingAddress,
          coupon_code: couponCode || null,
          credits_used: creditsToUse,
          payment_method: paymentMethod === 'mark_paid' ? 'admin_created' : 'card',
          fulfillment_notes: orderNotes
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItemsData = orderItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_per_item: item.price,
        size: item.size
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      // Deduct credits if used
      if (creditsToUse > 0) {
        const { error: creditsError } = await supabase
          .from('profiles')
          .update({ 
            credits: Math.max(0, selectedCustomer.credits - creditsToUse) 
          })
          .eq('user_id', selectedCustomer.id);

        if (creditsError) throw creditsError;
      }

      toast({
        title: "Order created successfully",
        description: `Order #${order.id.slice(-6)} has been created`,
      });

      onOrderCreated();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setCustomerSearch("");
    setOrderItems([]);
    setShippingAddress({
      fullName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US"
    });
    setCouponCode("");
    setCreditsToUse(0);
    setPaymentMethod("mark_paid");
    setOrderNotes("");
  };

  const filteredCustomers = customers.filter(customer =>
    customer.display_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Create Order - Admin Checkout</DialogTitle>
              <DialogDescription>
                Manually create orders with full control over products, pricing, and fulfillment
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Order Builder */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Customer Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Customer Selection</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Search Customer</Label>
                  <Input
                    placeholder="Search by name or email..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                </div>
                
                {customerSearch && (
                  <div className="max-h-40 overflow-y-auto border rounded-lg">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className={`p-3 cursor-pointer hover:bg-muted ${
                          selectedCustomer?.id === customer.id ? 'bg-primary/10' : ''
                        }`}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setCustomerSearch(customer.display_name);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{customer.display_name}</p>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                          </div>
                          <Badge variant="outline">{customer.credits} credits</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedCustomer && (
                  <div className="p-3 border rounded-lg bg-green-50">
                    <p className="font-medium">Selected: {selectedCustomer.display_name}</p>
                    <p className="text-sm text-muted-foreground">Available credits: {selectedCustomer.credits}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Products Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Add Products</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted"
                      onClick={() => addOrderItem(product)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{product.title}</p>
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            ${product.price}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">Add</Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Items */}
                {orderItems.length > 0 && (
                  <div className="space-y-3">
                    <Separator />
                    <h4 className="font-medium">Order Items</h4>
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">${item.price} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-16 h-8"
                          />
                          <Select onValueChange={(value) => updateOrderItem(index, 'size', value)}>
                            <SelectTrigger className="w-20 h-8">
                              <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="7">7</SelectItem>
                              <SelectItem value="8">8</SelectItem>
                              <SelectItem value="9">9</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="11">11</SelectItem>
                              <SelectItem value="12">12</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeOrderItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Shipping Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Full Name</Label>
                  <Input
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Address</Label>
                  <Input
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main St"
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="New York"
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="NY"
                  />
                </div>
                <div>
                  <Label>ZIP Code</Label>
                  <Input
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="10001"
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <Select value={shippingAddress.country} onValueChange={(value) => setShippingAddress(prev => ({ ...prev, country: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            
            {/* Discounts & Credits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Discounts & Credits</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Coupon Code</Label>
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="DISCOUNT15"
                  />
                </div>
                
                <div>
                  <Label>Use Credits (1 credit = $0.01)</Label>
                  <Input
                    type="number"
                    min="0"
                    max={selectedCustomer?.credits || 0}
                    value={creditsToUse}
                    onChange={(e) => setCreditsToUse(parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                  {selectedCustomer && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Available: {selectedCustomer.credits} credits
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Options</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mark_paid">Mark as Paid</SelectItem>
                    <SelectItem value="charge_card">Charge Card (Placeholder)</SelectItem>
                    <SelectItem value="send_invoice">Send Invoice via Email</SelectItem>
                  </SelectContent>
                </Select>
                
                {paymentMethod === 'send_invoice' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <p className="text-sm text-blue-800">
                        Will generate checkout link for customer
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                {creditsToUse > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Credits Applied</span>
                    <span>-${(creditsToUse / 100).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Add notes for fulfillment team..."
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Create Order Button */}
            <Button 
              onClick={handleCreateOrder} 
              disabled={loading || !selectedCustomer || orderItems.length === 0}
              className="w-full"
              size="lg"
            >
              {loading ? "Creating Order..." : "Create Order"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};