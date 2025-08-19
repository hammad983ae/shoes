import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Fuse from 'fuse.js';
import { supabase } from '@/integrations/supabase/client';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQ[] = [
  // Orders & Shipping
  {
    category: 'Orders & Shipping',
    question: 'How long does shipping take?',
    answer: 'Orders take up to 3 business days to process. After that, shipping typically takes 5–9 business days globally for the U.S. and Europe. Orders to South America, Africa, Asia, and Australia may take up to 14 business days depending on customs and location.'
  },
  {
    category: 'Orders & Shipping',
    question: 'How do I track my order?',
    answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also check your order status in your account under "Order History" or track directly with the carrier (USPS, UPS, FedEx).'
  },
  {
    category: 'Orders & Shipping',
    question: 'What do I do if my order hasn\'t arrived?',
    answer: 'Check your tracking number for the most up-to-date status. If your tracking hasn\'t updated or your order is significantly delayed, contact our support team.'
  },
  {
    category: 'Orders & Shipping',
    question: 'Do you ship internationally?',
    answer: 'Yes, we ship to most countries worldwide. International shipping rates and times vary by location. Customs fees and import duties are the buyer\'s responsibility.'
  },
  {
    category: 'Orders & Shipping',
    question: 'Can I cancel or edit my order?',
    answer: 'Orders can be cancelled or modified within 2 hours of placing. After this window, orders enter fulfillment and cannot be changed. Contact us immediately if you need to make changes.'
  },

  // Account & Credits
  {
    category: 'Account & Credits',
    question: 'How do I use store credits?',
    answer: 'Store credits must be manually applied on the cart page, before proceeding to checkout. Credits cannot be applied once you\'re already in checkout.'
  },
  {
    category: 'Account & Credits',
    question: 'Where can I check my balance?',
    answer: 'Your current credit balance is displayed in your account dashboard and at checkout. You can also view your credit history and transactions in your profile settings.'
  },
  {
    category: 'Account & Credits',
    question: 'What happens if I return an item purchased with credits?',
    answer: 'Returns for items purchased with credits will be refunded back as store credits to your account. The credits will be available immediately upon return processing.'
  },
  {
    category: 'Account & Credits',
    question: 'Can I combine coupon codes with credits?',
    answer: 'No. You can only use one: either a coupon code or store credits, not both in the same order.'
  },
  {
    category: 'Account & Credits',
    question: 'How do I reset my password or update account info?',
    answer: 'Go to your profile settings to update your information. For password resets, use the "Forgot Password" link on the sign-in page to receive a reset email.'
  },
  {
    category: 'Account & Credits',
    question: 'How does the referral system work?',
    answer: 'Share your unique referral code with friends. When they make their first purchase, you both earn store credits! Check the "Get Free Credits" page for more details.'
  },

  // Payments & Pricing
  {
    category: 'Payments & Pricing',
    question: 'What payment methods do you accept?',
    answer: 'We currently accept all major credit cards. Apple Pay is coming soon. We do not accept PayPal, Google Pay, or Buy Now Pay Later at this time.'
  },
  {
    category: 'Payments & Pricing',
    question: 'Is payment secure?',
    answer: 'Yes, all payments are processed through secure, encrypted gateways. We never store your payment information on our servers. Your financial data is protected with industry-standard security.'
  },
  {
    category: 'Payments & Pricing',
    question: 'Why was my payment declined?',
    answer: 'Payment declines can happen due to insufficient funds, expired cards, incorrect billing information, or bank security measures. Try a different payment method or contact your bank.'
  },
  {
    category: 'Payments & Pricing',
    question: 'Do you offer refunds to the original method or just store credit?',
    answer: 'You may choose between a store credit refund (processed instantly) or a refund to your original payment method (processed within 5–10 business days) once your return is approved.'
  },

  // Product Info & Sizing
  {
    category: 'Product Info & Sizing',
    question: 'Are your shoes true to size?',
    answer: 'Most of our shoes run true to size, but we recommend checking the Top Posts tab and the product description for sizing tips and fit suggestions. Certain styles may suggest sizing up.'
  },
  {
    category: 'Product Info & Sizing',
    question: 'Do you provide a size chart?',
    answer: 'Yes. Every product includes a size chart located next to the size selection menu. Charts include US, EU, and UK conversions for accurate fit.'
  },
  {
    category: 'Product Info & Sizing',
    question: 'What materials are used in your products?',
    answer: 'Our products feature high-quality materials including premium synthetic leather, genuine leather, suede, and advanced textile materials. Material details are listed on each product page.'
  },
  {
    category: 'Product Info & Sizing',
    question: 'What type of shoes do you sell?',
    answer: 'We specialize in premium streetwear footwear including popular sneaker styles, limited releases, and EU-imported designer-inspired shoes. All products meet high quality standards.'
  },

  // Promotions & Discounts
  {
    category: 'Promotions & Discounts',
    question: 'How do I use a coupon code?',
    answer: 'Enter your coupon code on the cart page, not the checkout page. Once applied, your discount will carry over to checkout automatically.'
  },
  {
    category: 'Promotions & Discounts',
    question: 'Can I use more than one coupon?',
    answer: 'Only one coupon code can be used per order, but you can combine coupon discounts with store credits for maximum savings on your purchase.'
  },
  {
    category: 'Promotions & Discounts',
    question: 'My code didn\'t work—what should I do?',
    answer: 'Check that the code is spelled correctly and hasn\'t expired. Some codes have minimum purchase requirements or are for specific products. Contact support if you\'re still having issues.'
  },
  {
    category: 'Promotions & Discounts',
    question: 'How do I get early access / join the waitlist?',
    answer: 'Follow us on Instagram @cralluxsells2 and TikTok @cralluxxx for early access to drops and exclusive codes. VIP customers also receive priority access to limited releases.'
  },

  // Contact & Support
  {
    category: 'Contact & Support',
    question: 'How do I contact support?',
    answer: 'Email us at cralluxmaster@protonmail.com or use the contact form below. We typically respond within 12-24 hours during business days. For urgent matters, DM us on Instagram.'
  },
  {
    category: 'Contact & Support',
    question: 'Do you offer live chat?',
    answer: 'Currently, we provide support via email and social media DMs. Our team monitors messages regularly and responds quickly to ensure you get the help you need.'
  },
  {
    category: 'Contact & Support',
    question: 'What\'s your response time?',
    answer: 'We aim to respond to all inquiries within 12-24 hours during business days (Monday-Friday). More complex issues may take up to 48 hours for a complete resolution.'
  },
  {
    category: 'Contact & Support',
    question: 'Is there a phone number I can call?',
    answer: 'We currently operate as an online-only business and don\'t offer phone support. However, our email and social media support teams are highly responsive and can handle any questions you have.'
  },
  {
    category: 'Contact & Support',
    question: 'How can I report an issue with my order?',
    answer: 'Use the contact form below or email us directly with your order number and details about the issue. Include photos if there\'s a problem with the product condition or packaging.'
  }
];

const categories = ['Orders & Shipping', 'Account & Credits', 'Payments & Pricing', 'Product Info & Sizing', 'Promotions & Discounts', 'Contact & Support'];

const HelpCenter = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issue_type: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fuzzy search setup
  const fuse = useMemo(() => new Fuse(faqData, {
    keys: ['question', 'answer', 'category'],
    threshold: 0.3,
    includeScore: true
  }), []);

  // Filter FAQs based on search
  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) return faqData;
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, fuse]);

  // Group filtered FAQs by category
  const groupedFAQs = useMemo(() => {
    const grouped: { [key: string]: FAQ[] } = {};
    categories.forEach(category => {
      grouped[category] = filteredFAQs.filter(faq => faq.category === category);
    });
    return grouped;
  }, [filteredFAQs]);

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.issue_type || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Store in Supabase
      const { error: dbError } = await supabase
        .from('support_tickets')
        .insert([{
          name: formData.name,
          email: formData.email,
          issue_type: formData.issue_type,
          message: formData.message
        }]);

      if (dbError) throw dbError;

      // Send email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-support-email', {
        body: {
          name: formData.name,
          email: formData.email,
          issue_type: formData.issue_type,
          message: formData.message
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
      }

      toast({
        title: "Support Ticket Submitted!",
        description: "We've received your request and will get back to you shortly. Check your email for confirmation.",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        issue_type: '',
        message: ''
      });
    } catch (error: any) {
      console.error('Error submitting support ticket:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Help Center</h1>
          <p className="text-muted-foreground">
            Find answers to common questions or get in touch with our support team
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="What do you need help with?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-6 mb-12">
          {categories.map(category => {
            const categoryFAQs = groupedFAQs[category];
            const isOpen = openCategories.includes(category);
            
            // Hide empty categories when searching
            if (searchQuery && categoryFAQs.length === 0) return null;
            
            return (
              <Card key={category} className="border-border">
                <Collapsible open={isOpen} onOpenChange={() => toggleCategory(category)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{category}</CardTitle>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {categoryFAQs.map((faq, index) => (
                          <div key={index} className="border-l-2 border-primary/20 pl-4">
                            <h4 className="font-medium text-foreground mb-2">{faq.question}</h4>
                            <p className="text-sm text-muted-foreground">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>

        {/* Contact Form */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Still need help?</CardTitle>
            <p className="text-muted-foreground">
              Can't find what you're looking for? Send us a message and we'll get back to you soon.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Issue Type</label>
                <Select value={formData.issue_type} onValueChange={(value) => handleInputChange('issue_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Orders">Orders & Shipping</SelectItem>
                    <SelectItem value="Account">Account & Credits</SelectItem>
                    <SelectItem value="Payments">Payments & Pricing</SelectItem>
                    <SelectItem value="Sizing">Product Info & Sizing</SelectItem>
                    <SelectItem value="Promotions">Promotions & Discounts</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={4}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full btn-hover-glow"
                disabled={isSubmitting}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpCenter;