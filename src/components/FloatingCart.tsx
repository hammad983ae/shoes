import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface FloatingCartProps {
  show: boolean;
}

const FloatingCart = ({ show }: FloatingCartProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const totalItems = getTotalItems();

  useEffect(() => {
    if (show && totalItems > 0) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, totalItems]);

  if (!isVisible || totalItems === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in-right">
      <Button
        onClick={() => navigate('/cart')}
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-4 shadow-2xl hover:shadow-primary/25 transition-all duration-300 group"
      >
        <ShoppingCart className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
        <span className="font-semibold">
          View Cart ({totalItems})
        </span>
      </Button>
    </div>
  );
};

export default FloatingCart;