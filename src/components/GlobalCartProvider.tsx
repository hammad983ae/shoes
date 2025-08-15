import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import CartSidebar from './CartSidebar';
import CartAddNotification from './CartAddNotification';
import useCartNotification from '../hooks/useCartNotification';

interface GlobalCartProviderProps {
  children: React.ReactNode;
}

const GlobalCartProvider = ({ children }: GlobalCartProviderProps) => {
  const location = useLocation();

  // Don't show cart on landing page
  const isLandingPage = location.pathname === '/';

  const handleItemAdded = useCallback(() => {
    // Notification is handled by the CartContext and CartAddNotification component
  }, []);

  useCartNotification(handleItemAdded);

  return (
    <>
      {children}
      {!isLandingPage && (
        <>
          {/* Adjusted cart sidebar positioning for desktop alignment */}
          <div className="fixed top-[4.5rem] right-4 z-50 md:top-[4.5rem]">
            <CartSidebar />
          </div>
          <CartAddNotification />
        </>
      )}
    </>
  );
};

export default GlobalCartProvider;