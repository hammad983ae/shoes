import { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
  id: number;
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
  removeItem: (id: number, size: string | number) => void;
  updateQuantity: (id: number, size: string | number, quantity: number) => void;
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

      // Trigger notification only on item addition
      setShowNotification(true);
      if (onItemAdded) {
        setTimeout(() => onItemAdded(), 100);
      }
      return updatedItems;
    });
  };

  const removeItem = (id: number, size: string | number) => {
    setItems(prevItems => prevItems.filter(item => !(item.id === id && item.size === size)));
  };

  const updateQuantity = (id: number, size: string | number, quantity: number) => {
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