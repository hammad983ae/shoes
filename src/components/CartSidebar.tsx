import { useState } from 'react';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface CartSidebarProps {
  alignWithStickyNav?: boolean;
}

const CartSidebar = ({ alignWithStickyNav = false }: CartSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { items, removeItem, updateQuantity, getTotalItems, getTotalPrice, addItem } = useCart();
  const navigate = useNavigate();

  const handleGoToCart = () => {
    setIsOpen(false);
    navigate('/cart');
  };

  const formatPrice = (price: string) => {
    return parseFloat(price.replace('$', '')).toFixed(2);
  };

  const handleSizeChange = (item: any, newSize: string) => {
    removeItem(item.id, item.size);
    setTimeout(() => {
      addItem({ ...item, size: newSize, size_type: item.size_type });
    }, 100);
  };

  const getSizesForItem = (item: any) => {
    if (item.size_type === 'US') {
      return [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13];
    } else if (item.size_type === 'EU') {
      return [
        { eu: 39, us: 6 }, { eu: 40, us: 6.5 }, { eu: 41, us: 7 },
        { eu: 42, us: 7.5 }, { eu: 43, us: 8 }, { eu: 44, us: 8.5 },
        { eu: 45, us: 9 }, { eu: 46, us: 9.5 }, { eu: 47, us: 10 },
        { eu: 48, us: 10.5 }, { eu: 49, us: 11 }, { eu: 50, us: 11.5 },
        { eu: 51, us: 12 }, { eu: 52, us: 12.5 }, { eu: 53, us: 13 }
      ];
    } else {
      console.error('Unknown or missing size type for item:', item);
      // Fallback to US sizes if size_type is unknown
      return [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13];
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {/* Cart button layout adapts based on page */}
        <Button
          variant="outline"
          className={`h-10 w-10 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 btn-hover-glow backdrop-blur-md bg-background/60 border-border/50 z-[60]
            ${alignWithStickyNav ? 'ml-2' : 'fixed top-[calc(var(--announcement-height)+0.5rem)]'}
          `}
        >
          <ShoppingBag className="w-5 h-5" />
          {getTotalItems() > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {getTotalItems()}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:w-96 z-[70] flex flex-col h-full"
        style={{ height: 'calc(100vh - 0px)' }}
      >
        <SheetHeader className="pb-4 flex-shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Cart ({getTotalItems()} items)
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="border rounded-lg p-4 space-y-3">
                  <div className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Size:</span>
                        <select
                          value={item.size}
                          onChange={e => handleSizeChange(item, e.target.value)}
                          className="border rounded px-2 py-1 text-sm bg-background"
                        >
                          {getSizesForItem(item).map(size => (
                            <option key={typeof size === 'object' ? size.eu : size} value={typeof size === 'object' ? `EU ${size.eu} (US ${size.us})` : size}>
                              {typeof size === 'object' ? `EU ${size.eu} (US ${size.us})` : size}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="font-semibold">${formatPrice(item.price)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id, item.size)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-semibold">
                      ${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-4 flex-shrink-0 bg-background sticky bottom-0" style={{ marginBottom: '80px' }}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-bold">${getTotalPrice().toFixed(2)}</span>
              </div>
              <Button
                onClick={handleGoToCart}
                className="w-full"
                size="lg"
              >
                Go to Cart
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;
