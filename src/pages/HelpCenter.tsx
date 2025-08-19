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
  // Tracking My Order
  {
    category: 'Tracking My Order',
    question: 'Where is my tracking number?',
    answer: 'Your tracking number will be sent to your email once your order ships. You can also find it in your order history on your profile page.'
  },
  {
    category: 'Tracking My Order',
    question: 'How long does delivery take?',
    answer: 'Standard delivery takes 5-9 business days. Express shipping options are available at checkout for faster delivery.'
  },
  {
    category: 'Tracking My Order',
    question: "My tracking hasn't updated, what should I do?",
    answer: 'Tracking can sometimes take 24-48 hours to update. If your tracking hasn\'t updated after 3 days, please contact our support team.'
  },

  // Sizing Help
  {
    category: 'Sizing Help',
    question: 'Do your sizes run true to size?',
    answer: 'Most of our items run true to size, but we recommend checking the size chart on each product page. Different brands may have slight variations.'
  },
  {
    category: 'Sizing Help',
    question: 'How do I convert from US to EU sizing?',
    answer: 'Each product page includes a size conversion chart. Generally, add 31-32 to US men\'s sizes for EU sizing, but always check the specific chart for accuracy.'
  },
  {
    category: 'Sizing Help',
    question: 'Can I exchange for a different size?',
    answer: 'Yes, we accept size exchanges within 30 days of delivery. The item must be unworn and in original condition with tags attached.'
  },

  // Returns & Issues
  {
    category: 'Returns & Issues',
    question: 'Do you accept returns?',
    answer: 'Yes, we accept returns within 30 days of delivery. Items must be unworn, in original condition, and include all original packaging and tags.'
  },
  {
    category: 'Returns & Issues',
    question: 'My item arrived damaged — what now?',
    answer: 'We\'re sorry to hear about the damage. Please contact us immediately with photos of the damaged item and we\'ll arrange a replacement or full refund.'
  },
  {
    category: 'Returns & Issues',
    question: 'How do I request a return?',
    answer: 'Contact our support team with your order number and reason for return. We\'ll provide you with a return label and instructions.'
  },

  // Payment Questions
  {
    category: 'Payment Questions',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, Apple Pay, Google Pay, and various buy-now-pay-later options at checkout.'
  },
  {
    category: 'Payment Questions',
    question: 'Can I pay with Cash App or Zelle?',
    answer: 'Currently, we don\'t accept Cash App or Zelle payments. Please use our secure checkout with the available payment methods listed above.'
  },
  {
    category: 'Payment Questions',
    question: 'How do I confirm my payment went through?',
    answer: 'You\'ll receive an email confirmation immediately after successful payment. You can also check your order status in your account dashboard.'
  }
];

const categories = ['Tracking My Order', 'Sizing Help', 'Returns & Issues', 'Payment Questions'];

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
      await fetch('https://uvczawicaqqiyutcqoyg.supabase.co/functions/v1/send-support-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2Y3phd2ljYXFxaXl1dGNxb3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNjczNDAsImV4cCI6MjA2ODY0MzM0MH0.m3NCcH46Dfce34aVgEYbF08Bh_6rkMIDB6UF6z6xLLY',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          issue_type: formData.issue_type,
          message: formData.message
        }),
      });

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
                    <SelectItem value="Tracking">Tracking</SelectItem>
                    <SelectItem value="Sizing">Sizing</SelectItem>
                    <SelectItem value="Returns">Returns</SelectItem>
                    <SelectItem value="Payments">Payments</SelectItem>
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