import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
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
  onProductSelect?: (product: Sneaker) => void;
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
  const getInventory = () => Math.floor(Math.random() * 10) + 1;

  // Review system (stateful, extensible for future auth logic)
  type Review = { name: string; rating: number; comment: string; };
  const [reviews, setReviews] = useState<Review[]>([
    { name: 'John D.', rating: 5, comment: 'Amazing quality and comfort!' },
    { name: 'Sarah M.', rating: 4, comment: 'Great fit, love the style.' },
    { name: 'Mike R.', rating: 5, comment: 'Perfect for everyday wear.' }
  ]);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

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
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  // Review submission handler
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;
    setReviewSubmitting(true);
    setTimeout(() => {
      setReviews(prev => [
        ...prev,
        { name: reviewName.trim(), rating: reviewRating, comment: reviewComment.trim() }
      ]);
      setReviewName('');
      setReviewRating(5);
      setReviewComment('');
      setReviewSubmitting(false);
    }, 400);
  };

  // Parallax effect refs and logic
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const container = imageContainerRef.current;
    const img = imageRef.current;
    if (!container || !img) return;
    let frame: number | null = null;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    const maxMove = 18; // px, max translation
    const ease = 0.12; // lower = smoother
    function animate() {
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      if (img) {
        img.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      frame = requestAnimationFrame(animate);
    }
    function onMouseMove(e: MouseEvent) {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      // Opposite direction, center is 0,0
      targetX = (0.5 - x) * maxMove;
      targetY = (0.5 - y) * maxMove;
    }
    function onMouseLeave() {
      targetX = 0;
      targetY = 0;
    }
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);
    frame = requestAnimationFrame(animate);
    return () => {
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      if (frame) cancelAnimationFrame(frame);
      if (img) img.style.transform = '';
    };
  }, [isOpen]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogTitle className="sr-only">
            {sneaker.name} - Product Details
          </DialogTitle>
          
          {/* Close button (only one, top right) */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-background/80 hover:bg-background"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Left side - Image (parallax, fills container) */}
            <div ref={imageContainerRef} className="relative bg-muted/20 flex items-center justify-center p-0 h-full overflow-hidden">
              <div className="relative w-full max-w-md h-[340px] sm:h-[400px] md:h-[480px] lg:h-[520px] flex items-center justify-center overflow-hidden">
                <img 
                  ref={imageRef}
                  src={sneaker.image} 
                  alt={sneaker.name}
                  className="w-full h-full object-cover rounded-lg shadow-lg mx-auto transition-transform duration-300 will-change-transform select-none pointer-events-none"
                  draggable={false}
                  style={{ display: 'block' }}
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

            {/* Right side - Details (scrollable) */}
            <div className="flex flex-col p-8 overflow-y-auto h-full min-h-0">
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
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {sizes.map(sizeOption => (
                      <Button
                        key={sizeOption}
                        variant={selectedSize === sizeOption ? "default" : "outline"}
                        onClick={() => setSelectedSize(sizeOption)}
                        className="h-12 text-sm"
                      >
                        <div className="text-center">
                          <div>{sizeOption}</div>
                           <div className="text-xs text-muted-foreground">
                             {getInventory()} left
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
                    {reviews.length === 0 && (
                      <div className="text-muted-foreground text-sm">No reviews yet. Be the first to review!</div>
                    )}
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
                  {/* Review submission form */}
                  <form onSubmit={handleReviewSubmit} className="mt-6 p-4 bg-muted/40 rounded-lg space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="Your name"
                        className="border rounded px-3 py-2 text-sm flex-1 bg-background"
                        value={reviewName}
                        onChange={e => setReviewName(e.target.value)}
                        required
                      />
                      <select
                        className="border rounded px-3 py-2 text-sm bg-background"
                        value={reviewRating}
                        onChange={e => setReviewRating(Number(e.target.value))}
                        required
                      >
                        {[5,4,3,2,1].map(r => (
                          <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      placeholder="Write your review..."
                      className="border rounded px-3 py-2 text-sm w-full bg-background min-h-[60px]"
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      required
                    />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={reviewSubmitting || !reviewName.trim() || !reviewComment.trim()}>
                        {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </div>
                  </form>
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