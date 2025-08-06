import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

export default function CheckoutInstructions() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsToUse, setCreditsToUse] = useState('');
  const [creditDiscount, setCreditDiscount] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTotalPrice } = useCart();
  
  const currentBalance = 1000; // TODO: Get from user credits table
  const subtotal = getTotalPrice();
  const taxes = subtotal * 0.08; // 8% tax
  const finalTotal = subtotal + taxes - creditDiscount;

  useChironScript();
  const paymentFormRef = useRef<HTMLFormElement>(null);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStep(2);
    setSubmitting(false);
  };

  // Chiron payment handler
  const handleChironPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    setPaymentSuccess('');
    setSubmitting(true);
    try {
      // 1. Get payment token from backend
      const amount = 100; // TODO: Replace with actual order total
      const tokenResponse = await fetch('/api/create-payment-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const tokenData = await tokenResponse.json();
      if (!tokenData.token) throw new Error('Failed to generate payment token');

      // 2. Get form values
      const formEl = paymentFormRef.current;
      if (!formEl) throw new Error('Form not found');
      const get = (id: string) => (formEl.querySelector(`#${id}`) as HTMLInputElement)?.value || '';
      const name = get('card-name');
      const cardNumber = get('card-number').replace(/\s+/g, '');
      const expiry = get('expiry').replace('/', '');
      const cvc = get('cvc');
      const address = get('address');
      const city = get('city');
      const state = get('state');
      const zip = get('zip');

      // 3. Call ChironPayment.pay
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
          ssl_first_name: name.split(' ')[0],
          ssl_last_name: name.split(' ')[1] || '',
          ssl_avs_zip: zip,
          ssl_city: city,
          ssl_state: state,
          ssl_avs_address: address,
        },
        {
          onError: (error: any) => {
            setPaymentError(error.ssl_result_message || 'An error occurred during payment processing.');
            setSubmitting(false);
          },
          onDeclined: (error: any) => {
            setPaymentError(error.errorMessage || 'Payment was declined.');
            setSubmitting(false);
          },
          onApproval: async () => {
            setPaymentSuccess('Payment succeeded.');
            setSubmitting(false);
            setStep(3);
            // TODO: Save order in Supabase, wipe cart, send email, etc.
          }
        }
      );
    } catch (error: any) {
      setPaymentError(error.message || 'Failed to initialize payment.');
      setSubmitting(false);
    }
  };

  // const handleConfirmPaid = async () => {
    setSubmitting(true);
    // TODO: Update order in Supabase to 'paid_pending_review', trigger email
    setTimeout(() => {
      setSubmitting(false);
      setStep(3);
      // setConfirmed(true);
      // TODO: Wipe cart here
    }, 800);
  // };

  // Payment instructions by method
  // const paymentInstructions = {
  //   cashapp: (
  //     <div className="space-y-2">
  //       <div>Send payment to <span className="font-bold">$YourCashAppHandle</span> on Cash App.</div>
  //       <div>Include your name in the note.</div>
  //     </div>
  //   ),
  //   zelle: (
  //     <div className="space-y-2">
  //       <div>Send payment to <span className="font-bold">your@email.com</span> via Zelle.</div>
  //       <div>Include your name in the memo.</div>
  //     </div>
  //   ),
  //   coinbase: (
  //     <div className="space-y-2">
  //       <div>Pay via <a href="https://commerce.coinbase.com/checkout/your-link" target="_blank" rel="noopener noreferrer" className="text-primary underline">Coinbase Commerce</a>.</div>
  //       <div>Follow the instructions on the Coinbase page.</div>
  //     </div>
  //   ),
  //   crypto: (
  //     <div className="space-y-2">
  //       <div>Send crypto to wallet address:</div>
  //       <div className="font-mono bg-gray-900 p-2 rounded">0xYourWalletAddressHere</div>
  //       <div>Include your name in the transaction memo if possible.</div>
  //     </div>
  //   ),
  //   invoice: (
  //     <div className="space-y-2">
  //       <div>We will email you a custom invoice shortly with payment instructions.</div>
  //     </div>
  //   ),
  // };

  return (
    <div className="min-h-screen page-gradient flex flex-col items-center justify-center px-2 py-8">
      <div className="w-full max-w-lg bg-background/80 rounded-2xl shadow-xl p-4 sm:p-8 border border-primary/30">
        {!user && step === 1 && (
          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-bold text-center">Get Started</h2>
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
              onClick={() => setStep(1)}
            >
              Continue with Guest Checkout
            </Button>
          </div>
        )}
        
        {/* Order Summary */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${taxes.toFixed(2)}</span>
            </div>
            {creditDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Credit Discount:</span>
                <span>-${creditDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-1 flex justify-between font-semibold">
              <span>Total:</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>
          
          {user && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3"
              onClick={() => setShowCreditsModal(true)}
            >
              Use Credits (Balance: {currentBalance})
            </Button>
          )}
        </div>
        
        {(user || step > 1) && step === 1 && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold mb-2 text-center">Shipping & Payment Info</h2>
            <Input
              required
              placeholder="Full Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <Input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
            <Input
              placeholder="Phone Number (optional)"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
            <Input
              required
              placeholder="Street Address"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            />
            <div className="flex gap-2">
              <Input
                required
                placeholder="City"
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              />
              <Input
                required
                placeholder="State"
                value={form.state}
                onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
              />
              <Input
                required
                placeholder="Zip"
                value={form.zip}
                onChange={e => setForm(f => ({ ...f, zip: e.target.value }))}
              />
            </div>
            <Textarea
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
            />
            <div className="text-xs text-muted-foreground mb-2">
              By submitting this form, you agree to our <a href="/terms" className="underline">Terms of Service</a> and <a href="/privacy" className="underline">Privacy Policy</a>.
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit & Get Payment Info'}
            </Button>
            <div className="mt-4 text-center text-xs text-muted-foreground">
              Need help selecting a payment?{' '}
              <a href="/contact-us" className="underline text-primary">Contact Us</a>
            </div>
          </form>
        )}
        {step === 2 && (
          <form ref={paymentFormRef} className="space-y-4" onSubmit={handleChironPayment}>
            <h2 className="text-2xl font-bold mb-2 text-center">Payment Details</h2>
            <Input id="card-name" placeholder="Cardholder Name" required />
            <Input id="card-number" placeholder="Card Number" required />
            <div className="flex gap-2">
              <Input id="expiry" placeholder="MM/YY" required />
              <Input id="cvc" placeholder="CVC" required maxLength={4} />
            </div>
            <Input id="address" placeholder="Street Address" required />
            <div className="flex gap-2">
              <Input id="city" placeholder="City" required />
              <Input id="state" placeholder="State" required />
            </div>
            <Input id="zip" placeholder="ZIP Code" required />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Processing...' : 'Pay Now'}
            </Button>
            {paymentError && <div className="text-red-500 text-sm mt-2">{paymentError}</div>}
            {paymentSuccess && <div className="text-green-500 text-sm mt-2">{paymentSuccess}</div>}
          </form>
        )}
        {step === 3 && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold mb-2">🎉 Thanks for your order!</h2>
            <div className="text-muted-foreground text-lg">
              We’re preparing your package. You’ll receive a confirmation email and tracking number within 24–48 hours.
            </div>
            <Button className="w-full mt-4" onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        )}
      </div>
      
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
  );
}