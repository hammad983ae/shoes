import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, MessageCircle, Mail, Music } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContactUs = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Contact Us</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <p className="text-muted-foreground">
            Have questions about our sneakers or need help? We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Follow Us on Social Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <a 
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-primary/10 transition-colors border border-border"
              >
                <Instagram className="w-6 h-6 text-pink-500" />
                <div>
                  <p className="font-semibold">Instagram</p>
                  <p className="text-sm text-muted-foreground">@crallux_sneakers</p>
                </div>
              </a>

              <a 
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-primary/10 transition-colors border border-border"
              >
                <Music className="w-6 h-6 text-black" />
                <div>
                  <p className="font-semibold">TikTok</p>
                  <p className="text-sm text-muted-foreground">@crallux_sneakers</p>
                </div>
              </a>

              <a 
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-primary/10 transition-colors border border-border"
              >
                <MessageCircle className="w-6 h-6 text-indigo-500" />
                <div>
                  <p className="font-semibold">Discord</p>
                  <p className="text-sm text-muted-foreground">Join our community</p>
                </div>
              </a>
            </CardContent>
          </Card>

          {/* Email Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Email Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <Mail className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold">General Inquiries</p>
                  <p className="text-sm text-muted-foreground">hello@crallux.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <Mail className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold">Customer Support</p>
                  <p className="text-sm text-muted-foreground">support@crallux.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <Mail className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold">Business Inquiries</p>
                  <p className="text-sm text-muted-foreground">business@crallux.com</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Quick Response</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We typically respond to emails within 24 hours. For immediate assistance, 
                reach out to us on our social media channels.
              </p>
              <Button asChild>
                <Link to="/catalog">
                  Continue Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;