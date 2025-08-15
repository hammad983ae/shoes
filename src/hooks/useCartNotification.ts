import { useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';

const useCartNotification = (onItemAdded: () => void) => {
  const { setOnItemAdded, setShowNotification } = useCart();

  useEffect(() => {
    if (setOnItemAdded) {
      setOnItemAdded(() => () => {
        onItemAdded();
      });
    }
    return () => {
      if (setOnItemAdded) {
        setOnItemAdded(undefined);
        setShowNotification(false); // Cleanup notification state
      }
    };
  }, [setOnItemAdded, onItemAdded, setShowNotification]);
};

export default useCartNotification;