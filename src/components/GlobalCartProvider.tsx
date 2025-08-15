import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import CartSidebar from './CartSidebar';
import CartAddNotification from './CartAddNotification';
import useCartNotification from '../hooks/useCartNotification';

interface GlobalCartProviderProps {
  children: React.ReactNode;
}

const GlobalCartProvider = ({ children }: GlobalCartProviderProps) => {
  const [showNotification, setShowNotification] = useState(false);
  const location = useLocation();

  // Don't show cart on landing page
  const isLandingPage = location.pathname === '/';

  const handleItemAdded = () => {
    setShowNotification(true);
  };

  const handleNotificationHide = () => {
    setShowNotification(false);
  };

  useCartNotification(handleItemAdded);

  return (
    <>
      {children}
      {!isLandingPage && (
        <>
          <div className="fixed top-2 right-4 z-50">
            <CartSidebar />
          </div>
          <CartAddNotification 
            show={showNotification} 
            onHide={handleNotificationHide}
          />
        </>
      )}
    </>
  );
};

export default GlobalCartProvider;