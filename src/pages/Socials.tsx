import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, MessageCircle, Mail, Music, Youtube, Users, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import InteractiveParticles from '@/components/InteractiveParticles';

const Socials = () => {
  return (
    <div className="min-h-screen page-gradient relative">
      <InteractiveParticles isActive={true} />
    <div className="container mx-auto px-2 sm:px-4 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Socials</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">All of Our Links</h2>
          <p className="text-muted-foreground">
            All of our important links are right here — explore and connect with us.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Social Media */}
          <Card className="bg-[#0a0a0a] border-[#FFD700]">
            <CardHeader>
              <CardTitle>Follow Us on Social Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <a 
                href="https://www.instagram.com/cralluxsells/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-primary/10 transition-colors border border-border"
              >
                <Instagram className="w-6 h-6 text-pink-500" />
                <div>
                  <p className="font-semibold">Instagram</p>
                  <p className="text-sm text-muted-foreground">@cralluxsells</p>
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

          {/* Right side: Email and Stores stacked */}
          <div className="space-y-8">
            {/* Email */}
            <Card className="bg-[#0a0a0a] border-[#FFD700]">
              <CardHeader>
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <Mail className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-semibold">Email:</p>
                    <p className="text-sm text-muted-foreground">doppelsells@gmail.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stores */}
            <Card className="bg-[#0a0a0a] border-[#FFD700]">
              <CardHeader>
                <CardTitle>Our Stores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <a 
                  href="https://www.instagram.com/cralluxsells/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-lg hover:bg-primary/10 transition-colors border border-border"
                >
                  <Instagram className="w-6 h-6 text-pink-500" />
                  <div>
                    <p className="font-semibold">Instagram Store</p>
                    <p className="text-sm text-muted-foreground">Shop our latest drops</p>
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
                    <p className="font-semibold">TikTok Shop</p>
                    <p className="text-sm text-muted-foreground">Exclusive TikTok deals</p>
                  </div>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Form */}
        <Card className="mt-12 bg-[#0a0a0a] border-[#FFD700]">
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Have a Question?</h3>
                <p className="text-muted-foreground mb-4">
                  We're here to help! Send us a message and we'll respond as soon as possible.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-sm">doppelsells@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">DM us on Instagram</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input 
                    type="text" 
                    className="w-full p-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full p-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea 
                    className="w-full p-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none resize-none"
                    rows={4}
                    placeholder="How can we help you?"
                  />
                </div>
                <Button className="w-full btn-hover-glow">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
};

export default Socials; 