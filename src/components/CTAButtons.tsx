import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Instagram } from 'lucide-react';

interface CTAButtonsProps {
  onShopNow: () => void;
  onViewInstagram: () => void;
}

const CTAButtons = ({ onShopNow, onViewInstagram }: CTAButtonsProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger fade-in animation
  useState(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  });

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div 
        className={`flex flex-col sm:flex-row gap-6 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{
          animation: isVisible ? 'fadeInUp 0.8s ease-out' : 'none'
        }}
      >
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
  );
};

export default CTAButtons;