import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Instagram } from 'lucide-react';

interface CTAButtonsProps {
  onShopNow: () => void;
  onViewInstagram: () => void;
}

const CTAButtons = ({ onShopNow, onViewInstagram }: CTAButtonsProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
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
        <div className="flex flex-row gap-6">
          <Button
            onClick={onShopNow}
            className="cta-button text-lg px-12 py-6 rounded-2xl font-semibold flex items-center gap-3 min-w-[200px] justify-center"
            size="lg"
          >
            <ShoppingBag className="w-5 h-5" />
            Shop Now
          </Button>

          <Button
            onClick={onViewInstagram}
            variant="outline"
            className="text-lg px-12 py-6 rounded-2xl font-semibold flex items-center gap-3 min-w-[200px] justify-center border-primary/30 text-primary hover:bg-primary/10"
            size="lg"
          >
            <Instagram className="w-5 h-5" />
            View Instagram
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CTAButtons;
