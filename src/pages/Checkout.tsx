import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

// Dynamically load Chiron script if not present
function useChironScript() {
  useEffect(() => {
    if (!(window as any).ChironPayment) {
      const script = document.createElement('script');
      script.src = 'https://payment.chironapp.io/chiron-checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);
}

export default function Checkout() {
  const { items, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const paymentFormRef = useRef<HTMLFormElement>(null);

  // Get any existing credit discount from localStorage or state
  const [creditDiscount] = useState(0); // This would come from cart context
  const subtotal = getTotalPrice();
  const discountedSubtotal = Math.max(0, subtotal - creditDiscount);
  const tax = discountedSubtotal * 0.08;
  const total = discountedSubtotal + tax;

  useChironScript();

  // Chiron payment handler
  const handleChironPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    setPaymentSuccess('');
    setSubmitting(true);
    
    try {
      // Mock payment processing for now

      // Mock Chiron payment for now - replace with actual implementation
      setTimeout(() => {
        setPaymentSuccess('Payment succeeded!');
        setSubmitting(false);
        clearCart();
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }, 2000);
      
    } catch (error: any) {
      setPaymentError(error.message || 'Failed to process payment.');
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
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {creditDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Credit Discount</span>
                      <span>-${creditDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Payment Form */}
            <div>
              <form ref={paymentFormRef} onSubmit={handleChironPayment} className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    required
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                  <div className="space-y-3">
                    <Input id="address" placeholder="Address" required />
                    <div className="grid grid-cols-2 gap-3">
                      <Input id="city" placeholder="City" required />
                      <Input id="state" placeholder="State" required />
                    </div>
                    <Input id="zip" placeholder="Postal code" required />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Payment</h3>
                  <div className="space-y-3">
                    <Input id="card-number" placeholder="Card number" required />
                    <div className="grid grid-cols-3 gap-3">
                      <Input id="expiry" placeholder="MM / YY" required />
                      <Input id="cvc" placeholder="Security code" required />
                      <Input id="card-name" placeholder="Name on card" required />
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
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : `Complete order • $${total.toFixed(2)}`}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Powered by Chiron
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}