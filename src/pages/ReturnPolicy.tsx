import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ReturnPolicy() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen page-gradient">
      {/* Back Button */}
      <div className="sticky top-0 z-40 w-full px-4 md:px-8 py-1">
        <div className="flex items-center justify-start gap-2 max-w-screen-lg mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:bg-muted/50 backdrop-blur-md bg-background/60 rounded-full border border-border/50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
          <h1 className="text-4xl font-bold text-foreground mb-6">Return and Refund Policy</h1>
          <p className="text-muted-foreground mb-8 text-lg">Effective Date: July 24, 2025</p>
          <div className="prose prose-invert max-w-none space-y-8 text-foreground">
            <p>At Crallux Sells, customer satisfaction is important to us. Please read our policy carefully before ordering.</p>
            <h2 className="text-2xl font-bold mt-8">Returns</h2>
            <p>All sales are final unless the item arrives significantly damaged or incorrect.</p>
            <p>To request a return for a damaged or incorrect item, contact us within 3 calendar days of delivery at <a href="mailto:cralluxmaster@protonmail.com" className="text-primary hover:underline">cralluxmaster@protonmail.com</a> with:</p>
            <ul>
              <li>Your order number</li>
              <li>Photos of the item and packaging</li>
            </ul>
            <h2 className="text-2xl font-bold mt-8">Eligibility for Return</h2>
            <ul>
              <li>Be unused and in its original condition.</li>
              <li>Include all original packaging.</li>
            </ul>
            <h2 className="text-2xl font-bold mt-8">Non‑returnable Items</h2>
            <p>Items purchased in error, due to size/color preference, or normal wear and tear are not eligible for return.</p>
            <h2 className="text-2xl font-bold mt-8">Refunds</h2>
            <p>If your return is approved:</p>
            <ul>
              <li>A replacement item may be sent or a store credit/refund issued at our discretion.</li>
              <li>Refunds, if issued, will be processed to your original payment method within 7–10 business days after we receive and inspect the item.</li>
            </ul>
            <h2 className="text-2xl font-bold mt-8">Exchanges</h2>
            <p>We do not offer direct exchanges. If a replacement is available, we will ship it after inspecting your return.</p>
            <h2 className="text-2xl font-bold mt-8">Shipping for Returns</h2>
            <p>Customers are responsible for return shipping costs unless the return is due to an error on our part (damaged or incorrect item).</p>
            <h2 className="text-2xl font-bold mt-8">Contact</h2>
            <p>For any return or order issue, email <a href="mailto:cralluxmaster@protonmail.com" className="text-primary hover:underline">cralluxmaster@protonmail.com</a> within 3 days of delivery.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 