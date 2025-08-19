import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import CartAnimation from './CartAnimation';
import SizeChartModal from './SizeChartModal';

interface SizeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sneaker: {
    id: number;
    name: string;
    price: string;
    image: string;
  };
  onAddToCart: (size: number) => void;
}

const SizeSelectionModal = ({ isOpen, onClose, sneaker, onAddToCart }: SizeSelectionModalProps) => {
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const { addItem } = useCart();

  const sizes = [37, 38, 39, 40, 41, 42, 43, 44, 45]; // EU sizes only

  const handleAddToCart = () => {
    if (selectedSize) {
      addItem({
        id: sneaker.id.toString(),
        name: sneaker.name,
        price: sneaker.price,
        image: sneaker.image,
        size: selectedSize,
        size_type: 'EU' // EU sizing only
      });
      
      // Start cart animation
      setIsAnimating(true);
      
      // Close modal after animation starts
      setTimeout(() => {
        onAddToCart(selectedSize);
        onClose();
        setSelectedSize(null);
      }, 100);
    }
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Size</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <img 
                src={sneaker.image} 
                alt={sneaker.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h3 className="font-semibold">{sneaker.name}</h3>
                <p className="text-primary font-bold">{sneaker.price}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {sizes.map(size => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  onClick={() => setSelectedSize(size)}
                  className="h-12"
                >
                  {size} EU
                </Button>
              ))}
            </div>

            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => setShowSizeChart(true)}
                className="text-sm text-primary hover:underline"
              >
                View EU to US Size Chart
              </Button>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="flex-1"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <CartAnimation
        isAnimating={isAnimating}
        startPosition={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }}
        endPosition={{ x: 64, y: 64 }} // Approximate sidebar cart position
        onComplete={handleAnimationComplete}
      />
      
      <SizeChartModal 
        isOpen={showSizeChart} 
        onClose={() => setShowSizeChart(false)} 
      />
    </>
  );
};

export default SizeSelectionModal;