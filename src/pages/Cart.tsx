import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import PostPurchaseModal from '@/components/PostPurchaseModal';

const Cart = () => {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems, clearCart } = useCart();
  const { user } = useAuth();
  const [showPostPurchase, setShowPostPurchase] = useState(false);
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
  
  // For size editing
  const sizes = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13'];

  // Placeholder for updating size (in real app, would update cart context)
  function handleSizeChange(item: any, newSize: string) {
    // Remove old item, add new with same quantity
    removeItem(item.id, item.size);
    updateQuantity(item.id, parseFloat(newSize), item.quantity);
  }

  // Estimated tax (e.g., 8%)
  const subtotal = getTotalPrice();
  const estimatedTax = subtotal * 0.08;
  const total = subtotal + estimatedTax;

  const handleCheckout = () => {
    // Store purchased items for post-purchase modal
    setPurchasedItems([...items]);
    clearCart();
    setShowPostPurchase(true);
  };

  const handleContinueAnyways = () => {
    // Allow non-signed-in users to proceed to checkout
    handleCheckout();
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen page-gradient">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Your Cart</h1>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="pt-12 pb-12">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Looks like you haven't added any sneakers to your cart yet.
              </p>
              <Button asChild>
                <Link to="/catalog">
                  Start Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-gradient">
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Your Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={`${item.id}-${item.size}`}> 
              <CardContent className="p-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1 min-w-[180px]">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-muted-foreground">Size:</span>
                      <select
                        className="border rounded px-2 py-1 text-sm bg-background"
                        value={item.size}
                        onChange={e => handleSizeChange(item, e.target.value)}
                      >
                        {sizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    <p className="text-primary font-bold mt-1">{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeItem(item.id, item.size)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({getTotalItems()} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span>${estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-muted-foreground">FREE</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {!user ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground mb-4">
                      Sign in to save your cart and earn rewards!
                    </p>
                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link to="/signin">Sign In</Link>
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={handleContinueAnyways}>
                        Continue Anyways
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Button onClick={handleCheckout} className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
              )}

              <Button variant="outline" className="w-full" asChild>
                <Link to="/catalog">
                  Continue Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <PostPurchaseModal 
        isOpen={showPostPurchase}
        onClose={() => setShowPostPurchase(false)}
        purchasedItems={purchasedItems}
      />
    </div>
    </div>
  );
};

export default Cart;