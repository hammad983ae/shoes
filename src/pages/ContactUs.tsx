import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, MessageCircle, Mail, Music, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContactUs = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Socials</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">All of Our Links</h2>
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

              <a 
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-primary/10 transition-colors border border-border"
              >
                <Youtube className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-semibold">YouTube</p>
                  <p className="text-sm text-muted-foreground">@crallux_sneakers</p>
                </div>
              </a>
            </CardContent>
          </Card>

          {/* Stores & Email */}
          <Card>
            <CardHeader>
              <CardTitle>Stores & Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <Mail className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold">Email:</p>
                  <p className="text-sm text-muted-foreground">hello@crallux.com</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-semibold text-foreground">Stores:</p>
                
                <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div>
                    <p className="font-semibold">Depop</p>
                    <p className="text-sm text-muted-foreground">Prices are negotiable.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div>
                    <p className="font-semibold">Telegram</p>
                    <p className="text-sm text-muted-foreground">Buy in bulk.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-lg mx-auto">
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                Use one of these links to get around our ecosystem. Press this button to see our catalog and buy on the website.
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