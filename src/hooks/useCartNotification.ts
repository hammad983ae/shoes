import { useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';

const useCartNotification = (onItemAdded: () => void) => {
  const { setOnItemAdded } = useCart();

  useEffect(() => {
    if (setOnItemAdded) {
      setOnItemAdded(onItemAdded);
    }
  }, [setOnItemAdded, onItemAdded]);
};

export default useCartNotification;