import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, X, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  profiles?: {
    display_name: string | null;
  } | null;
}

const ViewProductModal = ({ isOpen, onClose, sneaker }: ViewProductModalProps) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [isAnimating, setIsAnimating] = useState(false);
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const { toast } = useToast();

  const sizes = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13'];
  const quantities = ['1', '2', '3', '4', '5'];
  
  // Mock inventory data
  const getInventory = () => Math.floor(Math.random() * 10) + 1;

  // Review system with Supabase
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Load reviews from Supabase
  useEffect(() => {
    if (isOpen) {
      loadReviews();
    }
  }, [isOpen, sneaker.id]);

  const loadReviews = async () => {
    try {
      const { data: reviewsData, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', sneaker.id.toString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get profile info for each review
      const reviewsWithProfiles = await Promise.all(
        (reviewsData || []).map(async (review) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', review.user_id)
            .maybeSingle();
          
          return {
            ...review,
            profiles: profile
          };
        })
      );

      setReviews(reviewsWithProfiles);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

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
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ 
        title: 'Authentication required', 
        description: 'Please sign in to submit a review',
        variant: 'destructive' 
      });
      return;
    }

    if (!reviewComment.trim()) {
      toast({ 
        title: 'Review text required', 
        description: 'Please write a review',
        variant: 'destructive' 
      });
      return;
    }

    setReviewSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('product_reviews')
        .insert({
          user_id: user.id,
          product_id: sneaker.id.toString(),
          rating: reviewRating,
          review_text: reviewComment.trim()
        });

      if (error) throw error;

      toast({ title: 'Review submitted successfully!' });
      setReviewRating(5);
      setReviewComment('');
      loadReviews(); // Reload reviews
    } catch (error: any) {
      console.error('Review submission error:', error);
      toast({ 
        title: 'Error submitting review', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setReviewSubmitting(false);
    }
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
    const maxMove = 18;
    const ease = 0.12;
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
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 overflow-hidden border-2 border-[#FFD600] bg-gradient-to-br from-black/95 to-gray-900/95 backdrop-blur-sm">
          <DialogTitle className="sr-only">
            {sneaker.name} - Product Details
          </DialogTitle>
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-background/80 hover:bg-background text-white"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Left side - Image container with proper sizing */}
            <div ref={imageContainerRef} className="relative bg-black/20 flex items-center justify-center p-4 h-full">
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  ref={imageRef}
                  src={sneaker.image} 
                  alt={sneaker.name}
                  className="w-full h-full object-contain transition-transform duration-300 will-change-transform select-none pointer-events-none"
                  draggable={false}
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

            {/* Right side - Details (scrollable with yellow scrollbar) */}
            <div className="flex flex-col p-8 overflow-y-auto h-full min-h-0">
              <div className="space-y-6">
                {/* Product info */}
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{sneaker.name}</h1>
                  <p className="text-2xl font-bold text-[#FFD600] mb-1">{sneaker.price}</p>
                  <span className="text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded-full">
                    {sneaker.category}
                  </span>
                </div>

                {/* Size selector */}
                <div>
                  <label className="text-sm font-medium text-white mb-3 block">Size</label>
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
                  <label className="text-sm font-medium text-white mb-3 block">Quantity</label>
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
                    className="flex-1 bg-[#FFD600] text-black hover:bg-[#E6C200] font-semibold"
                  >
                    Add to Cart
                  </Button>
                  <Button 
                    onClick={handleBuyNow}
                    disabled={!selectedSize}
                    variant="outline"
                    className="flex-1 border-[#FFD600] text-[#FFD600] hover:bg-[#FFD600] hover:text-black"
                  >
                    Buy Now
                  </Button>
                </div>

                {/* Reviews */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Reviews</h3>
                  <div className="space-y-4">
                    {reviews.length === 0 && (
                      <div className="text-gray-400 text-sm">No reviews yet. Be the first to review!</div>
                    )}
                    {reviews.map((review) => (
                      <div key={review.id} className="border-l-2 border-[#FFD600]/20 pl-4 bg-gray-900/30 p-3 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-white">
                            {review.profiles?.display_name || 'Anonymous'}
                          </span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < review.rating ? 'fill-[#FFD600] text-[#FFD600]' : 'text-gray-500'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-300">{review.review_text}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Review submission form */}
                  {user && (
                    <form onSubmit={handleReviewSubmit} className="mt-6 p-4 bg-gray-900/40 rounded-lg space-y-3 border border-gray-700">
                      <div className="flex flex-col sm:flex-row gap-3 items-end">
                        <div className="flex-1">
                          <label className="text-sm text-white mb-1 block">Rating</label>
                          <select
                            className="border border-gray-600 rounded px-3 py-2 text-sm bg-gray-800 text-white w-full"
                            value={reviewRating}
                            onChange={e => setReviewRating(Number(e.target.value))}
                            required
                          >
                            {[5,4,3,2,1].map(r => (
                              <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-white mb-1 block">Review</label>
                        <textarea
                          placeholder="Write your review..."
                          className="border border-gray-600 rounded px-3 py-2 text-sm w-full bg-gray-800 text-white min-h-[80px]"
                          value={reviewComment}
                          onChange={e => setReviewComment(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={reviewSubmitting || !reviewComment.trim()}
                          className="bg-[#FFD600] text-black hover:bg-[#E6C200]"
                        >
                          {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </div>
                    </form>
                  )}
                  
                  {!user && (
                    <div className="mt-6 p-4 bg-gray-900/40 rounded-lg border border-gray-700">
                      <p className="text-gray-400 text-sm">Sign in to write a review</p>
                    </div>
                  )}
                </div>

                {/* About this item */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">About This Item</h3>
                  <p className="text-gray-300">
                    This premium sneaker combines style and comfort with high-quality materials and expert craftsmanship. 
                    Perfect for both casual wear and athletic activities, featuring breathable materials and superior cushioning 
                    for all-day comfort. Each pair is carefully designed to provide the perfect balance of durability and style.
                  </p>
                </div>
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