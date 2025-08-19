import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, MessageCircle, Mail, Music, Youtube, Users, Send } from 'lucide-react';
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
                href="https://www.instagram.com/cralluxsells2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-primary/10 transition-colors border border-border"
              >
                <Instagram className="w-6 h-6 text-pink-500" />
                <div>
                  <p className="font-semibold">Instagram</p>
                  <p className="text-sm text-muted-foreground">@cralluxsells2</p>
                </div>
              </a>

              <a 
                href="https://www.tiktok.com/@cralluxxx"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-primary/10 transition-colors border border-border"
              >
                <Music className="w-6 h-6 text-black" />
                <div>
                  <p className="font-semibold">TikTok</p>
                  <p className="text-sm text-muted-foreground">@cralluxxx</p>
                </div>
              </a>

              <a 
                href="https://www.youtube.com/@CralluxSells"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-primary/10 transition-colors border border-border"
              >
                <Youtube className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-semibold">YouTube</p>
                  <p className="text-sm text-muted-foreground">@CralluxSells</p>
                </div>
              </a>

              <div 
                className="flex items-center gap-3 p-4 rounded-lg border border-border cursor-not-allowed opacity-60"
              >
                <MessageCircle className="w-6 h-6 text-indigo-500" />
                <div>
                  <p className="font-semibold">Discord Community</p>
                  <p className="text-sm text-muted-foreground">Coming Soon</p>
                </div>
              </div>
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
                    <p className="text-sm text-muted-foreground">cralluxmaster@protonmail.com</p>
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
                   href="https://www.depop.com/cralluxsells"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center gap-3 p-4 rounded-lg hover:bg-primary/10 transition-colors border border-border"
                 >
                   <Users className="w-6 h-6 text-red-500" />
                   <div>
                     <p className="font-semibold">Depop</p>
                     <p className="text-sm text-muted-foreground">@cralluxsells</p>
                   </div>
                 </a>

                <a 
                  href="https://t.me/+4qmUyM8MsPU0ZTRh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-lg hover:bg-primary/10 transition-colors border border-border"
                >
                  <Send className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="font-semibold">Telegram</p>
                    <p className="text-sm text-muted-foreground">Join our community</p>
                  </div>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
    </div>
  );
};

export default Socials; 