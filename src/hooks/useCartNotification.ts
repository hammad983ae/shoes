import { useEffect, useCallback } from 'react';
import { useCart } from '@/contexts/CartContext';

const useCartNotification = (onItemAdded: () => void) => {
  const { setOnItemAdded } = useCart();

  const handleItemAdded = useCallback(() => {
    onItemAdded();
  }, [onItemAdded]);

  useEffect(() => {
    if (setOnItemAdded) {
      setOnItemAdded(handleItemAdded);
    }
    return () => {
      if (setOnItemAdded) {
        setOnItemAdded(undefined);
      }
    };
  }, [setOnItemAdded, handleItemAdded]);
};

export default useCartNotification;