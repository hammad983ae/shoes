import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, MessageCircle, Mail, Music, Youtube, Users, Send } from 'lucide-react';
import InteractiveParticles from '@/components/InteractiveParticles';
import { useState } from 'react';
import { submitContactRequest } from '@/api/contact';
import { useToast } from '@/hooks/use-toast';

const Socials = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await submitContactRequest(formData);
      
      toast({
        title: "Message Sent!",
        description: "We've received your message and will get back to you soon.",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        message: ''
      });
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                href="#"
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-primary/10 transition-colors border border-border cursor-not-allowed opacity-60"
              >
                <Youtube className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-semibold">YouTube</p>
                  <p className="text-sm text-muted-foreground">Coming Soon</p>
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

                <div 
                  className="flex items-center gap-3 p-4 rounded-lg border border-border cursor-not-allowed opacity-60"
                >
                  <Send className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="font-semibold">Telegram</p>
                    <p className="text-sm text-muted-foreground">Coming Soon</p>
                  </div>
                </div>
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
                    <span className="text-sm">cralluxmaster@protonmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">DM us on Instagram</span>
                  </div>
                </div>
              </div>
              
                             <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium mb-2">Name</label>
                   <input 
                     type="text" 
                     name="name"
                     value={formData.name}
                     onChange={handleInputChange}
                     className="w-full p-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
                     placeholder="Your name"
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-2">Email</label>
                   <input 
                     type="email" 
                     name="email"
                     value={formData.email}
                     onChange={handleInputChange}
                     className="w-full p-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
                     placeholder="your@email.com"
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-2">Message</label>
                   <textarea 
                     name="message"
                     value={formData.message}
                     onChange={handleInputChange}
                     className="w-full p-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none resize-none"
                     rows={4}
                     placeholder="How can we help you?"
                     required
                   />
                 </div>
                 <Button 
                   type="submit" 
                   className="w-full btn-hover-glow"
                   disabled={isSubmitting}
                 >
                   <Send className="w-4 h-4 mr-2" />
                   {isSubmitting ? 'Sending...' : 'Send Message'}
                 </Button>
               </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
};

export default Socials; 