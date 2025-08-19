import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
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
          <h1 className="text-4xl font-bold text-foreground mb-6">Terms of Service</h1>
          <p className="text-muted-foreground mb-8 text-lg">Effective Date: July 24, 2025</p>
          <div className="prose prose-invert max-w-none space-y-8 text-foreground">
            <p>Welcome to Crallux Sells. These Terms (“Terms”) govern your access to and use of https://cralluxsells.com and related Services. By creating an account or using our Site, you agree to these Terms.</p>
            <h2 className="text-2xl font-bold mt-8">1. Eligibility</h2>
            <p>You must be at least 13 years old and able to enter into binding agreements to use our Services.</p>
            <h2 className="text-2xl font-bold mt-8">2. Your Account</h2>
            <p>You are responsible for keeping your login credentials confidential and for all activity under your account. You agree to:</p>
            <ul>
              <li>Provide accurate registration information.</li>
              <li>Keep your password secure and notify us immediately of unauthorized access.</li>
            </ul>
            <h2 className="text-2xl font-bold mt-8">3. Connecting Third‑Party Accounts</h2>
            <p>When linking third‑party platforms (e.g., Instagram, YouTube, TikTok), you authorize us to retrieve and display basic profile data and public post data. You remain responsible for complying with each platform’s terms.</p>
            <h2 className="text-2xl font-bold mt-8">4. Products and Listings</h2>
            <p>We may feature products and styles from independent suppliers. Product names, colors, and descriptions are for identification and reference only. We do not claim any affiliation or endorsement from any third‑party brands. All products are sourced through suppliers we independently select.</p>
            <h2 className="text-2xl font-bold mt-8">5. Orders and Payments</h2>
            <ul>
              <li>You have reviewed product details and agreed to the applicable price.</li>
              <li>Payment is due at the time of checkout through the methods we offer.</li>
              <li>Once an order is placed, it is considered final unless eligible under our Return Policy.</li>
            </ul>
            <h2 className="text-2xl font-bold mt-8">6. User-Generated Content</h2>
            <p>You may upload or link content (e.g., posts or product pairings). You grant us a non‑exclusive, worldwide, royalty‑free license to display that content within our Services. You represent that you have rights to the content you upload or link.</p>
            <h2 className="text-2xl font-bold mt-8">7. Prohibited Uses</h2>
            <ul>
              <li>Use our Services for illegal, infringing, or fraudulent activities.</li>
              <li>Attempt to hack, damage, or interfere with our Site or Services.</li>
              <li>Misrepresent products or submit false information.</li>
            </ul>
            <h2 className="text-2xl font-bold mt-8">8. Limitation of Liability</h2>
            <p>Our Services are provided “as is.” To the fullest extent allowed by law, we disclaim all warranties and are not liable for indirect, incidental, or consequential damages.</p>
            <h2 className="text-2xl font-bold mt-8">9. Termination</h2>
            <p>We reserve the right to suspend or terminate access to our Services if you violate these Terms or engage in conduct harmful to our operations.</p>
            <h2 className="text-2xl font-bold mt-8">10. Updates</h2>
            <p>We may update these Terms periodically. Continued use of the Site means you accept any updates.</p>
            <h2 className="text-2xl font-bold mt-8">11. Governing Law</h2>
            <p>These Terms are governed by the laws of the United States and your state of residence, without regard to conflict of law principles.</p>
            <h2 className="text-2xl font-bold mt-8">Contact</h2>
            <p>For questions, email <a href="mailto:cralluxmaster@protonmail.com" className="text-primary hover:underline">cralluxmaster@protonmail.com</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}