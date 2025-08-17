import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import CartAddNotification from './CartAddNotification';
import useCartNotification from '../hooks/useCartNotification';
import { useCartPersistence } from '../hooks/useCartPersistence';

interface GlobalCartProviderProps {
  children: React.ReactNode;
}

const GlobalCartProvider = ({ children }: GlobalCartProviderProps) => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  const handleItemAdded = useCallback(() => {
    // Notification is handled by the CartContext and CartAddNotification component
  }, []);

  useCartNotification(handleItemAdded);
  useCartPersistence(); // Initialize cart persistence

  return (
    <>
      {children}
      {!isLandingPage && <CartAddNotification />}
    </>
  );
};

export default GlobalCartProvider;
