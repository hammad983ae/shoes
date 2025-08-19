import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import PostPurchaseModal from '@/components/PostPurchaseModal';
import InteractiveParticles from '@/components/InteractiveParticles';
import { useToast } from '@/hooks/use-toast';
import FirstTimeDiscountModal from '@/components/FirstTimeDiscountModal';

const Cart = () => {
  const { items, updateQuantity, removeItem, addItem } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPostPurchase, setShowPostPurchase] = useState(false);
  const [purchasedItems] = useState<any[]>([]);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsToApply, setCreditsToApply] = useState(0);
  const [appliedCredits, setAppliedCredits] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [credits, setCredits] = useState(0);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [hasFirstTimeDiscount, setHasFirstTimeDiscount] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  
  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('$', ''));
    return sum + (price * item.quantity);
  }, 0);

  const creditsDiscount = appliedCredits / 100; // Convert credits to dollars (100 credits = $1)
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const firstTimeDiscount = hasFirstTimeDiscount ? subtotal * 0.1 : 0; // 10% off for first time
  const totalDiscount = creditsDiscount + couponDiscount + firstTimeDiscount;
  const discountedSubtotal = Math.max(0, subtotal - totalDiscount);
  const tax = discountedSubtotal * 0.0875; // 8.75% tax
  const total = discountedSubtotal + tax;

  // Fetch user credits and check if first time user
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        // Fetch credits
        const { data: creditsData, error: creditsError } = await supabase
          .from('profiles')
          .select('credits')
          .eq('user_id', user.id)
          .single();
        
        if (creditsData && !creditsError) {
          setCredits(creditsData.credits || 0);
        }

        // Check if user has ever placed an order
        const { data: ordersData } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        const isFirstTime = !ordersData || ordersData.length === 0;
        setIsFirstTimeUser(isFirstTime);

        // Check localStorage for first-time discount preference
        const savedFirstTimeDiscount = localStorage.getItem(`firstTimeDiscount_${user.id}`);
        if (savedFirstTimeDiscount === 'applied' && isFirstTime) {
          setHasFirstTimeDiscount(true);
        }
      }
    };

    fetchUserData();
  }, [user]);

  // Show first-time discount modal when user has items and is first time
  useEffect(() => {
    if (user && isFirstTimeUser && items.length > 0 && !hasFirstTimeDiscount) {
      const modalShown = localStorage.getItem(`firstTimeModalShown_${user.id}`);
      if (!modalShown) {
        setShowFirstTimeModal(true);
        localStorage.setItem(`firstTimeModalShown_${user.id}`, 'true');
      }
    }
  }, [user, isFirstTimeUser, items.length, hasFirstTimeDiscount]);
  
  // For size editing - handle both EU and US sizes
  const getSizesForItem = (item: any) => {
    if (item.size_type === 'US') {
      return ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13'];
    } else if (item.size_type === 'EU') {
      return [
        { eu: '39', us: '6' }, { eu: '40', us: '6.5' }, { eu: '41', us: '7' },
        { eu: '42', us: '7.5' }, { eu: '43', us: '8' }, { eu: '44', us: '8.5' },
        { eu: '45', us: '9' }, { eu: '46', us: '9.5' }, { eu: '47', us: '10' },
        { eu: '48', us: '10.5' }, { eu: '49', us: '11' }, { eu: '50', us: '11.5' },
        { eu: '51', us: '12' }, { eu: '52', us: '12.5' }, { eu: '53', us: '13' }
      ];
    } else {
      console.error('Unknown or missing size type for item:', item);
      // Fallback to US sizes if size_type is unknown
      return ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13'];
    }
  };

  function handleSizeChange(item: any, newSize: string) {
    // Add console logs to verify newSize and parseFloat result
    console.log('New Size:', newSize);
    console.log('Parsed Size:', parseFloat(newSize) || 0);
    console.log('Dropdown value expected:', item.size);
    getSizesForItem(item).forEach(size => {
      if (typeof size === 'object') {
        const val = `EU ${size.eu} (US ${size.us})`;
        if (val === item.size) console.log('Matched:', val);
      }
    });
    // Remove old item, add new with same quantity
    removeItem(item.id, item.size);
    // Re-add with new size and same quantity
    for (let i = 0; i < item.quantity; i++) {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        size: parseFloat(newSize) || 0,
        size_type: item.size_type
      });
    }
  }

  const handleCreditsSubmit = () => {
    const maxCreditsForOrder = Math.floor(subtotal * 100); // Max credits = subtotal in cents
    const creditsToUse = Math.min(creditsToApply, Math.min(credits, maxCreditsForOrder));
    
    if (creditsToUse > 0 && creditsToUse <= credits) {
      setAppliedCredits(creditsToUse);
      setAppliedCoupon(null); // Remove coupon if applying credits
      setShowCreditsModal(false);
      toast({
        title: "Credits Applied",
        description: `Applied ${creditsToUse} credits ($${(creditsToUse / 100).toFixed(2)}) to your order.`,
      });
    }
  };

  const handleRemoveCredits = () => {
    setAppliedCredits(0);
    setCreditsToApply(0);
  };

  const handleCouponSubmit = async () => {
    if (!couponCode.trim()) return;
    
    try {
      // Validate coupon code exists in database
      const { data, error } = await supabase
        .from('coupon_codes')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .single();
      
      if (error || !data) {
        toast({
          title: "Invalid Coupon",
          description: "This coupon code is not valid.",
          variant: "destructive"
        });
        return;
      }
      
      // Apply 15% discount based on discount_percentage from database
      const discountPercentage = data.discount_percentage || 15;
      const discount = subtotal * (discountPercentage / 100);
      setAppliedCoupon({code: couponCode.toUpperCase(), discount});
      setAppliedCredits(0); // Remove credits if applying coupon
      setCouponCode('');
      toast({
        title: "Coupon Applied",
        description: `${couponCode.toUpperCase()} applied! ${discountPercentage}% discount.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply coupon code.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleApplyFirstTimeDiscount = () => {
    setHasFirstTimeDiscount(true);
    setAppliedCoupon(null); // Remove coupon if applying first-time discount
    setAppliedCredits(0); // Remove credits if applying first-time discount
    localStorage.setItem(`firstTimeDiscount_${user?.id}`, 'applied');
    toast({
      title: "First-Time Discount Applied!",
      description: "10% off has been applied to your order.",
    });
  };

  const handleCheckout = () => {
    // Pass discount data to checkout
    const checkoutData = {
      appliedCredits,
      appliedCoupon,
      totalDiscount
    };
    navigate('/checkout', { state: checkoutData });
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
                        value={item.size}
                        onChange={e => handleSizeChange(item, e.target.value)}
                        className="border rounded px-2 py-1 text-sm bg-background"
                      >
                        {getSizesForItem(item).map(size => (
                          <option key={typeof size === 'object' ? size.eu : size} value={typeof size === 'object' ? `EU ${size.eu} (US ${size.us})` : size}>
                            {typeof size === 'object' ? `EU ${size.eu} (US ${size.us})` : size}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-primary font-bold mt-1">{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, typeof item.size === 'number' ? item.size : parseInt(item.size, 10), item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, typeof item.size === 'number' ? item.size : parseInt(item.size, 10), item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
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
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {appliedCredits > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Credits Applied ({appliedCredits} credits):</span>
                    <span>-${(appliedCredits / 100).toFixed(2)}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({appliedCoupon.code}):</span>
                    <span>-${appliedCoupon.discount.toFixed(2)}</span>
                  </div>
                )}
                {hasFirstTimeDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span>First-Time Discount (10%):</span>
                    <span>-${firstTimeDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {user && (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Apply Credits</span>
                      <span className="text-sm text-muted-foreground">
                        Available: {credits} credits
                      </span>
                    </div>
                    
                    {appliedCredits > 0 ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <span className="text-green-700 font-medium">
                          {appliedCredits} credits applied (${(appliedCredits / 100).toFixed(2)})
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleRemoveCredits}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : credits > 0 && !appliedCoupon ? (
                      <Button 
                        onClick={() => setShowCreditsModal(true)}
                        variant="outline"
                        className="w-full"
                      >
                        Apply Credits
                      </Button>
                    ) : credits === 0 && !appliedCoupon ? (
                      <p className="text-sm text-muted-foreground">
                        No credits available
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="font-medium">Redeem Coupon Code</div>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <span className="text-green-700 font-medium">
                          {appliedCoupon.code} applied (10% off)
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleRemoveCoupon}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : !appliedCredits ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
                        />
                        <Button variant="outline" onClick={handleCouponSubmit}>Redeem</Button>
                      </div>
                    ) : null}
                  </div>
                </>
              )}

              {/* Guest Checkout Options */}
              {!user && (
                <div className="space-y-3 border-t pt-4">
                  <Button 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => navigate('/signin')}
                  >
                    Create Account for 10% Off
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

      <FirstTimeDiscountModal
        isOpen={showFirstTimeModal}
        onClose={() => setShowFirstTimeModal(false)}
        onApplyDiscount={handleApplyFirstTimeDiscount}
      />
      
      {/* Credits Modal */}
      <Dialog open={showCreditsModal} onOpenChange={setShowCreditsModal}>
        <DialogContent aria-describedby="cart-description">
          <DialogHeader>
            <DialogTitle>Use Credits</DialogTitle>
          </DialogHeader>
          <div id="cart-description" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Current Balance: <span className="font-semibold">{credits} credits</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Order Total: <span className="font-semibold">${Math.max(0, subtotal - (creditsToApply / 100)).toFixed(2)}</span>
            </div>
            <Input
              type="number"
              placeholder="Credits to use"
              value={creditsToApply}
              onChange={(e) => setCreditsToApply(parseInt(e.target.value) || 0)}
              max={Math.min(credits, subtotal * 100)}
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