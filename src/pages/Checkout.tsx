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
          
          // Create order in database with shipping address
          try {
            if (!user?.id) throw new Error('User not authenticated');
            
            // Get form data for shipping address
            const formData = new FormData(paymentFormRef.current!);
            const shippingAddress = {
              name: formData.get('card-name')?.toString() || '',
              email: formData.get('email')?.toString() || '',
              address: formData.get('address')?.toString() || '',
              city: formData.get('city')?.toString() || '',
              state: formData.get('state')?.toString() || '',
              zipCode: formData.get('zip')?.toString() || ''
            };

            // Prepare product details
            const productDetails = items.map(item => ({
              id: item.id,
              name: item.name,
              price: typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : item.price,
              quantity: item.quantity,
              size: item.size,
              size_type: item.size_type,
              image: item.image
            }));

            const { error: orderError } = await supabase.from('orders').insert({
              user_id: user.id,
              order_total: total,
              coupon_code: appliedCoupon?.code || null,
              coupon_discount: couponDiscount,
              credits_used: appliedCredits,
              status: 'paid',
              shipping_address: shippingAddress,
              product_details: productDetails,
              order_images: items.map(item => item.image).filter(Boolean)
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
      
      // Get form data for shipping address
      const formData = new FormData(paymentFormRef.current!);
      const shippingAddress = {
        name: formData.get('contact-name')?.toString() || '',
        email: formData.get('email')?.toString() || '',
        address: formData.get('address')?.toString() || '',
        city: formData.get('city')?.toString() || '',
        state: formData.get('state')?.toString() || '',
        zipCode: formData.get('zip')?.toString() || ''
      };
      
      // Prepare product details
      const productDetails = items.map(item => ({
        id: item.id,
        name: item.name,
        price: typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : item.price,
        quantity: item.quantity,
        size: item.size,
        size_type: item.size_type,
        image: item.image
      }));
      
      const { error: orderError } = await supabase.from('orders').insert({
        user_id: user.id,
        order_total: 0,
        coupon_code: appliedCoupon?.code || null,
        coupon_discount: couponDiscount,
        credits_used: appliedCredits,
        status: 'paid',
        payment_method: 'credits',
        shipping_address: shippingAddress,
        product_details: productDetails,
        order_images: items.map(item => item.image).filter(Boolean),
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Side - Checkout Form */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold mb-6">sani</h1>
            </div>

            {/* Express Checkout */}
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Express checkout</p>
              <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" className="h-12 bg-[#5A31F4] hover:bg-[#4A27D4] text-white border-none rounded-md font-medium">
                  Shop Pay
                </Button>
                <Button variant="outline" className="h-12 bg-[#FFC439] hover:bg-[#E6A700] text-black border-none rounded-md font-medium">
                  PayPal
                </Button>
                <Button variant="outline" className="h-12 bg-black hover:bg-gray-800 text-white border-none rounded-md font-medium">
                  G Pay
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-sm text-muted-foreground">OR</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>
            </div>

            {total > 0 ? (
              <form ref={paymentFormRef} onSubmit={handleChironPayment} className="space-y-8">
                {/* Email or Phone */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Email or Phone</label>
                    <Button variant="link" className="text-sm p-0 h-auto text-primary">Log in</Button>
                  </div>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email or mobile phone number"
                    className="h-12 rounded-md"
                    required
                  />
                </div>

                {/* Delivery */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Delivery</h3>
                  <div className="space-y-3">
                    <select className="w-full h-12 px-3 rounded-md border border-input bg-background">
                      <option>United States</option>
                    </select>
                    <div className="grid grid-cols-2 gap-3">
                      <Input 
                        name="first-name" 
                        placeholder="First name (optional)" 
                        className="h-12 rounded-md" 
                      />
                      <Input 
                        name="last-name" 
                        placeholder="Last name" 
                        className="h-12 rounded-md" 
                        required 
                      />
                    </div>
                    <div className="relative">
                      <Input 
                        name="address" 
                        placeholder="Address" 
                        className="h-12 rounded-md pr-10" 
                        required 
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                      >
                        🔍
                      </Button>
                    </div>
                    <Input 
                      name="apartment" 
                      placeholder="Apartment, suite, etc. (optional)" 
                      className="h-12 rounded-md" 
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <Input 
                        name="city" 
                        placeholder="City" 
                        className="h-12 rounded-md" 
                        required 
                      />
                      <select 
                        name="state" 
                        className="h-12 px-3 rounded-md border border-input bg-background"
                        required
                      >
                        <option value="">State</option>
                        <option value="RI">Rhode Island</option>
                        <option value="AL">Alabama</option>
                        <option value="AK">Alaska</option>
                        <option value="AZ">Arizona</option>
                        <option value="AR">Arkansas</option>
                        <option value="CA">California</option>
                        <option value="CO">Colorado</option>
                        <option value="CT">Connecticut</option>
                        <option value="DE">Delaware</option>
                        <option value="FL">Florida</option>
                        <option value="GA">Georgia</option>
                      </select>
                      <Input 
                        name="zip" 
                        placeholder="ZIP code" 
                        className="h-12 rounded-md" 
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Shipping method</h3>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">US Express (Tracked, Insured)</p>
                          <p className="text-sm text-muted-foreground">Complete Satisfaction Guarantee</p>
                        </div>
                        <span className="font-medium">$9.71</span>
                      </div>
                    </div>
                    <div className="p-4 border-2 border-primary rounded-md bg-primary/5">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">US Eco-Friendly Express (Tracked, Insured)</p>
                          <p className="text-sm text-muted-foreground">Complete Satisfaction Guarantee</p>
                        </div>
                        <span className="font-medium">$14.71</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secure Checkout */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Secure Checkout</h3>
                  <p className="text-sm text-muted-foreground">
                    All transactions are secure and encrypted. Your order includes free returns and 
                    24/7 access to our award-winning customer service.
                  </p>
                  
                  <div className="p-4 border rounded-md">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      </div>
                      <span className="font-medium">Credit card</span>
                      <div className="flex gap-2 ml-auto">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAzMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMwIiBoZWlnaHQ9IjIwIiByeD0iMyIgZmlsbD0iIzAwNTFBNSIvPgo8L3N2Zz4K" alt="Visa" className="w-8 h-5" />
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAzMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMwIiBoZWlnaHQ9IjIwIiByeD0iMyIgZmlsbD0iI0VCMDAxQiIvPgo8L3N2Zz4K" alt="Mastercard" className="w-8 h-5" />
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAzMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMwIiBoZWlnaHQ9IjIwIiByeD0iMyIgZmlsbD0iIzAwNjZDQyIvPgo8L3N2Zz4K" alt="Discover" className="w-8 h-5" />
                        <span className="text-sm text-muted-foreground">+4</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Input 
                        name="card-number" 
                        placeholder="Card number" 
                        maxLength={19}
                        className="h-12 rounded-md"
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
                          className="h-12 rounded-md"
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
                          className="h-12 rounded-md"
                          required 
                        />
                        <Input 
                          name="card-name" 
                          placeholder="Name on card" 
                          className="h-12 rounded-md"
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  {/* PayPal Option */}
                  <div className="p-4 border rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">PayPal</span>
                      <span className="text-primary">PayPal</span>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Remember me</h3>
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        id="save-info" 
                        className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <label htmlFor="save-info" className="text-sm text-muted-foreground">
                        Save my information for a faster checkout with Shop account
                      </label>
                    </div>
                    <Input 
                      placeholder="Mobile phone number"
                      className="h-12 rounded-md"
                    />
                  </div>

                  {paymentError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {paymentError}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-semibold bg-black hover:bg-gray-800 text-white rounded-md"
                    disabled={submitting || !chironLoaded}
                  >
                    {!chironLoaded ? 'Loading payment system...' : submitting ? 'Processing...' : 'Complete Purchase'}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Your info will be saved to a Shop account. By continuing, you agree to Shop's{' '}
                    <a href="#" className="underline">Terms of Service</a> and acknowledge the{' '}
                    <a href="#" className="underline">Privacy Policy</a>.
                  </p>
                </div>
              </form>
            ) : (
                <form ref={paymentFormRef} onSubmit={(e) => { e.preventDefault(); handleZeroDollarOrder(); }} className="space-y-4">
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
                      <Input name="contact-name" placeholder="Full Name" required />
                      <Input name="address" placeholder="Address" required />
                      <div className="grid grid-cols-2 gap-3">
                        <Input name="city" placeholder="City" required />
                        <Input name="state" placeholder="State" required />
                      </div>
                      <Input name="zip" placeholder="Postal code" required />
                    </div>
                  </div>

                  <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2 text-green-700">Your order is FREE!</h2>
                    <p className="text-green-600 mb-4">
                      Your discounts have covered the full order amount.
                    </p>
                  </div>

                  {paymentError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {paymentError}
                    </div>
                  )}

                  <Button 
                    type="submit"
                    className="w-full py-3 text-lg font-semibold"
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : 'Complete Free Order'}
                  </Button>
                </form>
              )}
            </div>

            {/* Right Side - Order Summary */}
            <div className="lg:sticky lg:top-8 lg:h-fit">
              <div className="bg-muted/30 p-6 rounded-lg space-y-6">
                {/* Order Items */}
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${parseFloat(item.price.replace('$', '')).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gift Card Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Input 
                      placeholder="Gift card" 
                      className="flex-1 h-10 text-sm"
                    />
                    <Button variant="outline" className="text-sm px-4">
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal • {items.length} item{items.length > 1 ? 's' : ''}</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {appliedCredits > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Credits Applied ({appliedCredits} credits)</span>
                      <span>-${creditsDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Coupon ({appliedCoupon.code})</span>
                      <span>-${couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>$14.71</span>
                  </div>
                  
                  <div className="flex justify-between font-semibold text-lg pt-3 border-t">
                    <span>Total</span>
                    <span>USD ${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Applied Discounts Display */}
                {(appliedCredits > 0 || appliedCoupon) && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                    <h4 className="font-medium text-green-700 text-sm">Applied Discounts</h4>
                    {appliedCredits > 0 && (
                      <div className="text-xs text-green-600">
                        ✓ {appliedCredits} credits applied ($${creditsDiscount.toFixed(2)} off)
                      </div>
                    )}
                    {appliedCoupon && (
                      <div className="text-xs text-green-600">
                        ✓ Coupon "{appliedCoupon.code}" applied ($${couponDiscount.toFixed(2)} off)
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
