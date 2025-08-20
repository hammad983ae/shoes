import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CTAButtonsProps {
  onShopNow: () => void;
  onViewSocials: () => void;
}

const CTAButtons = ({ onShopNow, onViewSocials }: CTAButtonsProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [browsingCount, setBrowsingCount] = useState(37);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Fetch global browsing count from Supabase
  const fetchBrowsingCount = async () => {
    try {
      // Temporarily use site_settings instead of site_metrics
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'browsing_now')
        .single();
      
      if (error) throw error;
      setBrowsingCount(parseInt(data?.value ?? '37'));
    } catch (error) {
      console.error('Error fetching browsing count:', error);
      // Fallback to current value
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchBrowsingCount();
    
    // Poll every 60 seconds
    const interval = setInterval(fetchBrowsingCount, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div
        className={`flex flex-col items-center gap-8 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{
          animation: isVisible ? 'fadeInUp 0.8s ease-out' : 'none',
        }}
      >
        {/* Graphic and Headline */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-48 h-48 flex items-center justify-center -mb-4">
            <img
              src="/lovable-uploads/519bed3c-88f6-4fd6-bd29-4ceb869c5a3b.png"
              alt="Crallux Brand"
              className="w-full h-full object-contain filter drop-shadow-lg"
            />
          </div>
          <h1 className="text-6xl font-bold text-center bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">
            CRALLUX SELLS
          </h1>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full items-center justify-center">
          <Button
            onClick={onShopNow}
            className="cta-button text-lg px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 w-full md:w-auto min-w-0 justify-center btn-hover-glow animate-pulse-glow shadow-lg shadow-primary/30"
            size="lg"
          >
            <ShoppingBag className="w-5 h-5" />
            Shop Now
          </Button>

          <Button
            onClick={onViewSocials}
            variant="outline"
            className="text-lg px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 w-full md:w-auto min-w-0 justify-center border-primary/30 text-primary hover:bg-primary/10 btn-hover-glow"
            size="lg"
          >
            <Smartphone className="w-5 h-5" />
            View Socials
          </Button>
        </div>
        
        {/* Live social proof - moved below shop now button */}
        <div className="text-sm text-white/75 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
          <span className="animate-pulse inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
          {browsingCount} people are browsing now
        </div>
        
      </div>
    </div>
  );
};

export default CTAButtons;
