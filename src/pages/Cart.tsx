import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import PostPurchaseModal from '@/components/PostPurchaseModal';
import InteractiveParticles from '@/components/InteractiveParticles';

const Cart = () => {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [redeemState, setRedeemState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showAuthBlock, setShowAuthBlock] = useState(!user);
  const [showPostPurchase, setShowPostPurchase] = useState(false);
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
  
  // For size editing - handle both EU and US sizes
  const getSizesForItem = (item: any) => {
    // If size is a string (EU sizing), show EU sizes with US conversion
    if (typeof item.size === 'string' && !isNaN(parseInt(item.size))) {
      const euSizes = [
        { eu: '39', us: '6' }, { eu: '40', us: '6.5' }, { eu: '41', us: '7' },
        { eu: '42', us: '7.5' }, { eu: '43', us: '8' }, { eu: '44', us: '8.5' },
        { eu: '45', us: '9' }, { eu: '46', us: '9.5' }, { eu: '47', us: '10' },
        { eu: '48', us: '10.5' }, { eu: '49', us: '11' }, { eu: '50', us: '11.5' },
        { eu: '51', us: '12' }, { eu: '52', us: '12.5' }, { eu: '53', us: '13' }
      ];
      return euSizes;
    } else {
      // US sizes
      return ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13'];
    }
  };

  // Placeholder for updating size (in real app, would update cart context)
  function handleSizeChange(item: any, newSize: string) {
    // Remove old item, add new with same quantity
    removeItem(item.id, item.size);
    updateQuantity(item.id, newSize, item.quantity);
  }

  // Estimated tax (e.g., 8%)
  const subtotal = getTotalPrice();
  const estimatedTax = subtotal * 0.08;
  const total = subtotal + estimatedTax;

  const handleCheckout = () => {
    navigate('/checkout-instructions');
  };

  const handleContinueAnyways = () => {
    // Allow non-signed-in users to proceed to checkout
    handleCheckout();
  };

  if (!user) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center px-4">
        <Card className="max-w-md w-full mx-auto text-center p-8">
          <CardContent>
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">You must be signed in or create an account to continue with your purchase.</h2>
            <div className="flex flex-col gap-3 mt-6">
              <Button className="w-full" onClick={() => navigate('/signin')}>Sign In</Button>
              <Button className="w-full" variant="outline" onClick={() => navigate('/signin?mode=signup')}>Create Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="min-h-screen page-gradient relative">
        <InteractiveParticles isActive={true} />
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
                <Button asChild className="btn-hover-glow">
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
                        {getSizesForItem(item).map(size => {
                          if (typeof size === 'string') {
                            return <option key={size} value={size}>{size}</option>;
                          } else {
                            return <option key={size.eu} value={size.eu}>{size.eu} ({size.us})</option>;
                          }
                        })}
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

              {/* Coupon code input */}
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="text"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  placeholder="Redeem coupon code"
                  className="flex-1 border rounded px-3 py-2 text-sm bg-background"
                />
                <Button
                  size="sm"
                  onClick={() => setRedeemState('success')} // Placeholder handler
                  disabled={redeemState === 'loading'}
                >
                  {redeemState === 'loading' ? '...' : 'Redeem'}
                </Button>
              </div>
              {/* Checkout button */}
              <Button onClick={handleCheckout} className="w-full mt-4" size="lg">
                Checkout
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