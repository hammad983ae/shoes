import { useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';

const useCartNotification = (onItemAdded: () => void) => {
  const { setOnItemAdded } = useCart();

  useEffect(() => {
    // Only set the callback, don't call it during setup
    if (setOnItemAdded) {
      setOnItemAdded(onItemAdded);
    }
    
    // Clean up callback on unmount
    return () => {
      if (setOnItemAdded) {
        setOnItemAdded(undefined);
      }
    };
  }, [setOnItemAdded, onItemAdded]);
};

export default useCartNotification;