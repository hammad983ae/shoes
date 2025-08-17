import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { loadChiron } from '@/utils/loadChiron';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Checkout() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [chironLoaded, setChironLoaded] = useState(false);
  const paymentFormRef = useRef<HTMLFormElement>(null);
  
  // Get discount data from cart page
  const cartDiscountData = location.state || {};
  const appliedCredits = cartDiscountData.appliedCredits || 0;
  const appliedCoupon = cartDiscountData.appliedCoupon || null;

  useEffect(() => {
    const initChiron = async () => {
      try {
        await loadChiron();
        setChironLoaded(true);
      } catch (error) {
        console.error('Failed to load Chiron:', error);
        setPaymentError('Payment system failed to load. Please refresh the page.');
      }
    };
    
    initChiron();
  }, []);

  // Calculate order totals with discounts from cart
  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('$', ''));
    return sum + (price * item.quantity);
  }, 0);

  const creditsDiscount = appliedCredits / 100; // Convert credits to dollars
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const discount = creditsDiscount + couponDiscount;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = discountedSubtotal * 0.0875; // 8.75% tax
  const total = Math.max(0, discountedSubtotal + tax);


  // Chiron payment handler
  const handleChironPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    setPaymentSuccess('');
    setSubmitting(true);
    
    if (!paymentFormRef.current) {
      setPaymentError('Form reference not found');
      setSubmitting(false);
      return;
    }

    const form = paymentFormRef.current;
    const formData = new FormData(form);
    
    // Get form values
    const name = formData.get('card-name') as string;
    const cardNumber = (formData.get('card-number') as string)?.replace(/\s+/g, '');
    const expiry = (formData.get('expiry') as string)?.replace(/[\/\s]/g, '');
    const cvc = formData.get('cvc') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const zip = formData.get('zip') as string;
    
    // Validate form
    if (!name || !cardNumber || !expiry || !cvc || !address || !city || !state || !zip) {
      setPaymentError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    if (cardNumber.length < 13 || cardNumber.length > 19) {
      setPaymentError('Please enter a valid card number');
      setSubmitting(false);
      return;
    }

    if (expiry.length !== 4) {
      setPaymentError('Please enter a valid expiration date (MM/YY)');
      setSubmitting(false);
      return;
    }

    if (cvc.length < 3 || cvc.length > 4) {
      setPaymentError('Please enter a valid CVC code');
      setSubmitting(false);
      return;
    }
    
    try {
      // Skip payment processing if total is $0
      if (total <= 0) {
        await handleZeroDollarOrder();
        return;
      }

      // Generate payment token from backend
      const { data: tokenData, error } = await supabase.functions.invoke('create-payment-token', {
        body: {
          amount: total.toFixed(2)
        }
      });

      if (error || !tokenData?.token) {
        throw new Error(error?.message || 'Failed to generate payment token');
      }

      // Define callback functions
      const callback = {
        onError: (error: any) => {
          console.error('Chiron payment error:', error);
          setPaymentError(error.ssl_result_message || 'An error occurred during payment processing');
          setSubmitting(false);
        },
        onDeclined: (error: any) => {
          console.error('Payment declined:', error);
          setPaymentError(error.errorMessage || 'Payment was declined. Please check your card details and try again.');
          setSubmitting(false);
        },
        onApproval: async (response: any) => {
          console.log('Payment approved:', response);
          
          // Create order in database
          try {
            if (!user?.id) throw new Error('User not authenticated');
            const { error: orderError } = await supabase.from('orders').insert({
              user_id: user.id,
              order_total: total,
              coupon_code: appliedCoupon?.code || null,
              coupon_discount: couponDiscount,
              credits_used: appliedCredits,
              status: 'paid',
              payment_method: 'card',
              estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });

            if (orderError) throw orderError;

            // Deduct credits if used
            if (appliedCredits > 0 && user) {
              const { data: userCreditsData } = await supabase
                .from('user_credits')
                .select('current_balance, total_spent')
                .eq('user_id', user.id)
                .single();

              if (userCreditsData && userCreditsData.current_balance !== null) {
                await supabase
                  .from('user_credits')
                  .update({ 
                    current_balance: userCreditsData.current_balance - appliedCredits,
                    total_spent: (userCreditsData.total_spent || 0) + appliedCredits
                  })
                  .eq('user_id', user.id);
              }
            }

            setPaymentSuccess('Payment succeeded!');
            setSubmitting(false);
            clearCart();
            setTimeout(() => {
              navigate('/order-confirmation');
            }, 2000);
          } catch (error) {
            console.error('Error saving order:', error);
            toast({ title: "Warning", description: "Payment processed but order saving failed", variant: "destructive" });
          }
        }
      };

      // Process payment using ChironPayment.pay()
      (window as any).ChironPayment.pay(
        {
          ssl_amount: tokenData.amount.toString(),
          ssl_transaction_type: 'ccsale',
          ssl_txn_auth_token: tokenData.token,
          ssl_exp_date: expiry,
          ssl_cvv2cvc2: cvc,
          ssl_card_number: cardNumber,
          ssl_get_token: 'Y',
          ssl_add_token: 'Y',
          ssl_first_name: name.split(' ')[0] || '',
          ssl_last_name: name.split(' ')[1] || '',
          ssl_avs_zip: zip,
          ssl_city: city,
          ssl_state: state,
          ssl_avs_address: address,
        },
        callback
      );
      
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      setPaymentError(error.message || 'Failed to process payment');
      setSubmitting(false);
    }
  };

  // Handle $0 orders
  const handleZeroDollarOrder = async () => {
    try {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error: orderError } = await supabase.from('orders').insert({
        user_id: user.id,
        order_total: 0,
        coupon_code: appliedCoupon?.code || null,
        coupon_discount: couponDiscount,
        credits_used: appliedCredits,
        status: 'paid',
        payment_method: 'credits',
        estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      if (orderError) throw orderError;

      // Deduct credits if used
      if (appliedCredits > 0) {
        const { data: userCreditsData } = await supabase
          .from('user_credits')
          .select('current_balance, total_spent')
          .eq('user_id', user.id)
          .single();

        if (userCreditsData && userCreditsData.current_balance !== null) {
          await supabase
            .from('user_credits')
            .update({ 
              current_balance: userCreditsData.current_balance - appliedCredits,
              total_spent: (userCreditsData.total_spent || 0) + appliedCredits
            })
            .eq('user_id', user.id);
        }
      }

      setPaymentSuccess('Order placed successfully!');
      setSubmitting(false);
      clearCart();
      setTimeout(() => {
        navigate('/order-confirmation');
      }, 2000);
    } catch (error) {
      console.error('Error processing free order:', error);
      setPaymentError('Failed to process order');
      setSubmitting(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-4">
              Thank you for your order. You'll receive a confirmation email shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to home page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-gradient">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Side - Order Summary & Product Images */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold mb-4">CRALLUX SELLS LLC</h1>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="relative">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order Summary */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {appliedCredits > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Credits Applied ({appliedCredits} credits):</span>
                      <span>-${creditsDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon ({appliedCoupon.code}):</span>
                      <span>-${couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Applied Discounts Display */}
                {(appliedCredits > 0 || appliedCoupon) && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                    <h4 className="font-medium text-green-700">Applied Discounts</h4>
                    {appliedCredits > 0 && (
                      <div className="text-sm text-green-600">
                        ✓ {appliedCredits} credits applied ($${creditsDiscount.toFixed(2)} off)
                      </div>
                    )}
                    {appliedCoupon && (
                      <div className="text-sm text-green-600">
                        ✓ Coupon "{appliedCoupon.code}" applied ($${couponDiscount.toFixed(2)} off)
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Discounts were applied on the cart page. Go back to cart to modify.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Payment Form */}
            <div>
              {total > 0 ? (
                <form ref={paymentFormRef} onSubmit={handleChironPayment} className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email"
                      required
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                    <div className="space-y-3">
                      <Input name="address" placeholder="Address" required />
                      <div className="grid grid-cols-2 gap-3">
                        <Input name="city" placeholder="City" required />
                        <Input name="state" placeholder="State" required />
                      </div>
                      <Input name="zip" placeholder="Postal code" required />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Payment</h3>
                    <div className="space-y-3">
                      <Input 
                        name="card-number" 
                        placeholder="Card number" 
                        maxLength={19}
                        onChange={(e) => {
                          // Format card number with spaces
                          let value = e.target.value.replace(/\s+/g, '');
                          if (value.length > 0) {
                            value = value.match(new RegExp('.{1,4}', 'g'))?.join(' ') || value;
                          }
                          e.target.value = value;
                        }}
                        required 
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <Input 
                          name="expiry" 
                          placeholder="MM / YY" 
                          maxLength={5}
                          onChange={(e) => {
                            // Format expiry date
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length > 2) {
                              value = value.substring(0, 2) + '/' + value.substring(2, 4);
                            }
                            e.target.value = value;
                          }}
                          required 
                        />
                        <Input 
                          name="cvc" 
                          placeholder="Security code" 
                          maxLength={4}
                          required 
                        />
                        <Input name="card-name" placeholder="Name on card" required />
                      </div>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {paymentError}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full py-3 text-lg font-semibold"
                    disabled={submitting || !chironLoaded}
                  >
                    {!chironLoaded ? 'Loading payment system...' : submitting ? 'Processing...' : `Complete order • $${total.toFixed(2)}`}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    Powered by Chiron
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2 text-green-700">Your order is FREE!</h2>
                    <p className="text-green-600 mb-4">
                      Your discounts have covered the full order amount.
                    </p>
                    <Button 
                      onClick={handleZeroDollarOrder}
                      className="w-full py-3 text-lg font-semibold"
                      disabled={submitting}
                    >
                      {submitting ? 'Processing...' : 'Complete Free Order'}
                    </Button>
                  </div>
                  
                  {paymentError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {paymentError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}