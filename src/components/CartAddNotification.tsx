import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface CartAddNotificationProps {
  show: boolean;
  onHide: () => void;
}

const CartAddNotification = ({ show, onHide }: CartAddNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onHide, 300); // Wait for fade out animation
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div 
      className={`fixed top-16 right-4 z-[60] bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <Check className="w-4 h-4" />
      <span className="text-sm font-medium">You added an item</span>
    </div>
  );
};

export default CartAddNotification;