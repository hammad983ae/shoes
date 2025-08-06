import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import PostPurchaseModal from '@/components/PostPurchaseModal';
import InteractiveParticles from '@/components/InteractiveParticles';

const Cart = () => {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems, addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [redeemState, setRedeemState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showPostPurchase, setShowPostPurchase] = useState(false);
  const [purchasedItems] = useState<any[]>([]);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsToUse, setCreditsToUse] = useState('');
  const [creditDiscount, setCreditDiscount] = useState(0);
  
  const currentBalance = 1000; // TODO: Get from user credits table
  const subtotal = getTotalPrice();
  const estimatedTax = subtotal * 0.08;
  const creditsToEarn = Math.floor(subtotal * 20); // 20% back in credits (1 dollar = 100 credits)
  const total = subtotal + estimatedTax - creditDiscount;
  
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

  function handleSizeChange(item: any, newSize: string) {
    // Remove old item, add new with same quantity
    removeItem(item.id, item.size);
    // Re-add with new size and same quantity
    for (let i = 0; i < item.quantity; i++) {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        size: parseFloat(newSize) || 0
      });
    }
  }

  const handleCreditsSubmit = () => {
    const credits = parseInt(creditsToUse) || 0;
    if (credits > currentBalance) {
      alert('Insufficient credits');
      return;
    }
    if (credits > subtotal * 100) { // Assuming 1 dollar = 100 credits
      alert('Credits exceed order total');
      return;
    }
    setCreditDiscount(credits / 100); // Convert credits to dollars
    setShowCreditsModal(false);
  };

  const handleCheckout = () => {
    navigate('/checkout-instructions');
  };
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
              {creditDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Credit Discount:</span>
                  <span>-${creditDiscount.toFixed(2)}</span>
                </div>
              )}
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

              {/* Credits to Earn */}
              <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Credits to Earn</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Get 20% back in credits</p>
                  </div>
                  <span className="font-bold text-green-800 dark:text-green-200">{creditsToEarn} credits</span>
                </div>
              </div>

              {/* Use Credits Option for Signed-in Users */}
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowCreditsModal(true)}
                >
                  Use Credits (Balance: {currentBalance})
                </Button>
              )}

              {/* Guest Checkout Options */}
              {!user && (
                <div className="space-y-3 border-t pt-4">
                  <Button 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => navigate('/signin')}
                  >
                    Create Account for 20% Off
                  </Button>
                  <div className="text-center text-sm text-muted-foreground">OR</div>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={handleCheckout}
                  >
                    Continue with Guest Checkout
                  </Button>
                </div>
              )}

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

              {/* Checkout button for signed-in users */}
              {user && (
                <Button onClick={handleCheckout} className="w-full mt-4" size="lg">
                  Checkout
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <PostPurchaseModal 
        isOpen={showPostPurchase}
        onClose={() => setShowPostPurchase(false)}
        purchasedItems={purchasedItems}
      />
      
      {/* Credits Modal */}
      <Dialog open={showCreditsModal} onOpenChange={setShowCreditsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Use Credits</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Current Balance: <span className="font-semibold">{currentBalance} credits</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Order Total: <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <Input
              type="number"
              placeholder="Credits to use"
              value={creditsToUse}
              onChange={(e) => setCreditsToUse(e.target.value)}
              max={Math.min(currentBalance, subtotal * 100)}
            />
            <div className="text-xs text-muted-foreground">
              100 credits = $1.00
            </div>
            <Button onClick={handleCreditsSubmit} className="w-full">
              Apply Credits
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
};

export default Cart;