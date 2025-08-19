import { createContext, useContext, useState, ReactNode } from 'react';
import { useCartPersistence } from '@/hooks/useCartPersistence';
import { usePostHog } from '@/contexts/PostHogProvider';
import { trackAddToCart } from '@/hooks/useAnalytics';

interface CartItem {
  id: string; // Changed from number to string to support UUIDs
  name: string;
  price: string;
  image: string;
  size: string | number; // Allow size to be a string for formatted sizes
  quantity: number;
  size_type: 'EU' | 'US';
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string, size: string | number) => void;
  updateQuantity: (id: string, size: string | number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  showNotification: boolean;
  setShowNotification: (value: boolean) => void;
  onItemAdded?: () => void;
  setOnItemAdded?: (callback?: () => void) => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);


export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [onItemAdded, setOnItemAdded] = useState<(() => void) | undefined>();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const posthog = usePostHog();

  // Use cart persistence hook for Supabase sync
  const { clearCartFromSupabase } = useCartPersistence(items, setItems);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    // Ensure the size is passed as a string directly from the product detail page
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === newItem.id && item.size === newItem.size);
      const updatedItems = existingItem
        ? prevItems.map(item =>
            item.id === newItem.id && item.size === newItem.size
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prevItems, { ...newItem, quantity: 1 }];

      // Track add to cart event with PostHog
      if (!existingItem) {
        trackAddToCart(posthog, {
          productId: newItem.id,
          name: newItem.name,
          category: 'Sneakers', // You might want to pass this as a parameter
          price: parseFloat(newItem.price.replace('$', '')),
          quantity: 1
        });
      }

      // Trigger notification only on item addition
      setShowNotification(true);
      if (onItemAdded) {
        setTimeout(() => onItemAdded(), 100);
      }
      return updatedItems;
    });
  };

  const removeItem = (id: string, size: string | number) => {
    setItems(prevItems => prevItems.filter(item => !(item.id === id && item.size === size)));
  };

  const updateQuantity = (id: string, size: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, size);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setShowNotification(false); // Reset notification on cart clear
    clearCartFromSupabase(); // Clear from Supabase as well
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.price.replace('$', ''));
      return total + (price * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      showNotification,
      setShowNotification,
      onItemAdded,
      setOnItemAdded,
      toggleCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};