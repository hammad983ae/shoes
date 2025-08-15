import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const CartAddNotification = () => {
  const { showNotification, setShowNotification } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showNotification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setShowNotification(false), 300); // Reset after fade-out
      }, 1000); // Show for 1 second
      return () => clearTimeout(timer);
    }
  }, [showNotification, setShowNotification]);

  if (!showNotification) return null;

  return (
    <div 
      className={`fixed top-[4.5rem] right-4 z-[60] bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <Check className="w-4 h-4" />
      <span className="text-sm font-medium">You added an item</span>
    </div>
  );
};

export default CartAddNotification;