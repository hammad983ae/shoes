import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import ProductCard from './ProductCard';
import CartAnimation from './CartAnimation';

interface Sneaker {
  id: number;
  image: string;
  price: string;
  name: string;
  category: string;
}

interface ViewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  sneaker: Sneaker;
  allSneakers: Sneaker[];
}

const ViewProductModal = ({ isOpen, onClose, sneaker, allSneakers }: ViewProductModalProps) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [isAnimating, setIsAnimating] = useState(false);
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const sizes = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13'];
  const quantities = ['1', '2', '3', '4', '5'];
  
  // Mock inventory data
  const getInventory = (size: string) => Math.floor(Math.random() * 10) + 1;
  
  // Mock reviews
  const reviews = [
    { name: 'John D.', rating: 5, comment: 'Amazing quality and comfort!' },
    { name: 'Sarah M.', rating: 4, comment: 'Great fit, love the style.' },
    { name: 'Mike R.', rating: 5, comment: 'Perfect for everyday wear.' }
  ];

  // Similar items (exclude current product)
  const similarItems = allSneakers
    .filter(item => item.category === sneaker.category && item.id !== sneaker.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    if (selectedSize) {
      for (let i = 0; i < parseInt(quantity); i++) {
        addItem({
          id: sneaker.id,
          name: sneaker.name,
          price: sneaker.price,
          image: sneaker.image,
          size: parseFloat(selectedSize),
        });
      }
      
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // In a real app, this would redirect to checkout
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl w-[90vw] h-[90vh] p-0 overflow-hidden">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-background/80 hover:bg-background"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Left side - Image */}
            <div className="relative bg-muted/20 flex items-center justify-center p-8">
              <div className="relative max-w-md">
                <img 
                  src={sneaker.image} 
                  alt={sneaker.name}
                  className="w-full h-auto object-cover rounded-lg"
                />
                
                {/* Heart icon */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 left-4 bg-background/80 hover:bg-background"
                  onClick={() => toggleFavorite(sneaker.id)}
                >
                  <Heart className={`w-5 h-5 ${isFavorite(sneaker.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                </Button>
              </div>
            </div>

            {/* Right side - Details */}
            <div className="flex flex-col p-8 overflow-y-auto">
              <div className="space-y-6">
                {/* Product info */}
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{sneaker.name}</h1>
                  <p className="text-2xl font-bold text-primary mb-1">{sneaker.price}</p>
                  <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                    {sneaker.category}
                  </span>
                </div>

                {/* Size selector */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Size</label>
                  <div className="grid grid-cols-5 gap-2">
                    {sizes.map(size => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        onClick={() => setSelectedSize(size)}
                        className="h-12 text-sm"
                      >
                        <div className="text-center">
                          <div>{size}</div>
                          <div className="text-xs text-muted-foreground">
                            {getInventory(size)} left
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Quantity</label>
                  <Select value={quantity} onValueChange={setQuantity}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {quantities.map(qty => (
                        <SelectItem key={qty} value={qty}>{qty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <Button 
                    onClick={handleAddToCart}
                    disabled={!selectedSize}
                    className="flex-1"
                  >
                    Add to Cart
                  </Button>
                  <Button 
                    onClick={handleBuyNow}
                    disabled={!selectedSize}
                    variant="secondary"
                    className="flex-1"
                  >
                    Buy Now
                  </Button>
                </div>

                {/* Reviews */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Reviews</h3>
                  <div className="space-y-4">
                    {reviews.map((review, index) => (
                      <div key={index} className="border-l-2 border-primary/20 pl-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{review.name}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-xs ${i < review.rating ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* About this item */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">About This Item</h3>
                  <p className="text-muted-foreground">
                    This premium sneaker combines style and comfort with high-quality materials and expert craftsmanship. 
                    Perfect for both casual wear and athletic activities, featuring breathable materials and superior cushioning 
                    for all-day comfort. Each pair is carefully designed to provide the perfect balance of durability and style.
                  </p>
                </div>

                {/* Similar items */}
                {similarItems.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Similar Items</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {similarItems.map((item) => (
                        <div key={item.id} className="scale-75 origin-top-left">
                          <ProductCard sneaker={item} index={0} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CartAnimation
        isAnimating={isAnimating}
        startPosition={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }}
        endPosition={{ x: 64, y: 64 }}
        onComplete={() => setIsAnimating(false)}
      />
    </>
  );
};

export default ViewProductModal;