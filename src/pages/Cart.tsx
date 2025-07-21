import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';

const Cart = () => {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCart();
  const isLoggedIn = false; // Replace with actual auth state
  const navigate = useNavigate();
  // For size editing
  const sizes = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13'];

  // Placeholder for updating size (in real app, would update cart context)
  function handleSizeChange(item, newSize) {
    // Remove old item, add new with same quantity
    removeItem(item.id, item.size);
    updateQuantity(item.id, parseFloat(newSize), item.quantity);
  }

  // Estimated tax (e.g., 8%)
  const subtotal = getTotalPrice();
  const estimatedTax = subtotal * 0.08;
  const total = subtotal + estimatedTax;

  function handleCheckout() {
    // Placeholder: simulate redirect to checkout provider
    alert('Redirecting to checkout provider (Stripe/Shopify/Link)...');
    // In real app, redirect to provider with cart data
    // window.location.href = 'https://checkout-provider.com/checkout?cart=...';
  }

  if (items.length === 0) {
    return (
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
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Your Cart</h1>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="pt-12 pb-12">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-4">Don't lose your cart!</h2>
              <p className="text-muted-foreground mb-6">
                You have {getTotalItems()} item{getTotalItems() > 1 ? 's' : ''} in your cart. 
                Create an account to save your items and complete your purchase.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="flex-1">
                  <Link to="/signin">
                    Create an Account
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/cart', { replace: true })}
                >
                  Continue Anyways
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
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
              <Button className="w-full mt-6" onClick={handleCheckout}>
                Checkout
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/catalog">
                  Continue Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;