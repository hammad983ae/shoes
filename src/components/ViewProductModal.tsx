import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Heart, X, Star, Check, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CartAnimation from './CartAnimation';

interface Sneaker {
  id: number;
  images: string[];
  price: string;
  name: string;
  brand: string;
  category: string;
  sizing?: string;
  description?: string;
  productDescription?: string;
  productFeatures?: string[];
  productIncludes?: string[];
  keywords?: string[];
  colors?: string[];
  type?: string;
}

interface ViewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  sneaker: Sneaker;
}

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

interface PostWithProduct {
  id: string;
  title: string | null;
  thumbnail_url: string | null;
  author_username: string;
  created_at: string;
}

export default function ViewProductModal({ isOpen, onClose, sneaker }: ViewProductModalProps) {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();

  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isAnimating, setIsAnimating] = useState(false);
  const [addToCartState, setAddToCartState] = useState<'idle' | 'loading' | 'success'>('idle');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [postsWithProduct, setPostsWithProduct] = useState<PostWithProduct[]>([]);

  // Carousel state for modal
  const [currentIndex, setCurrentIndex] = useState(0);

  // Generate sizes based on product sizing type
  const getSizes = () => {
    if (sneaker.sizing === 'EU') {
      // EU sizes with US conversion in parentheses
      return [
        { eu: '39', us: '6' },
        { eu: '40', us: '6.5' },
        { eu: '41', us: '7' },
        { eu: '42', us: '7.5' },
        { eu: '43', us: '8' },
        { eu: '44', us: '8.5' },
        { eu: '45', us: '9' },
        { eu: '46', us: '9.5' },
        { eu: '47', us: '10' },
        { eu: '48', us: '10.5' },
        { eu: '49', us: '11' },
        { eu: '50', us: '11.5' },
        { eu: '51', us: '12' },
        { eu: '52', us: '12.5' },
        { eu: '53', us: '13' }
      ];
    } else {
      // US sizes
      return ['6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','12.5','13'];
    }
  };

  const sizes = getSizes();
  const quantities = ['1','2','3','4','5'];

  useEffect(() => {
    if (isOpen) {
      loadReviews();
      loadPostsWithProduct();
      if (user) checkPurchaseHistory();
    }
  }, [isOpen, user]);

  async function loadReviews() {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', sneaker.id.toString())
      .order('created_at', { ascending: false });
    if (!error && data) setReviews(data as Review[]);
  }

  async function loadPostsWithProduct() {
    const { data: linkData, error } = await supabase
      .from('posts_products')
      .select('post_id')
      .eq('product_id', sneaker.id.toString())
      .limit(4);
    if (error || !linkData || linkData.length === 0) {
      setPostsWithProduct([]);
      return;
    }
    const postIds = linkData.map((p) => p.post_id);
    const { data: postsData } = await supabase
      .from('top_posts')
      .select('id,title,thumbnail_url,author_username,posted_at')
      .in('id', postIds)
      .order('posted_at', { ascending: false });
    if (postsData) {
      setPostsWithProduct(
        postsData.map((p: any) => ({
          id: p.id,
          title: p.title,
          thumbnail_url: p.thumbnail_url,
          author_username: p.author_username,
          created_at: p.posted_at
        }))
      );
    }
  }

  async function checkPurchaseHistory() {
    if (!user) return;
    const { data } = await supabase
      .from('purchase_history')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', sneaker.id.toString())
      .maybeSingle();
    if (data) setHasPurchased(true);
  }

  async function handleAddToCart() {
    if (!selectedSize) return;
    setAddToCartState('loading');
    for (let i = 0; i < parseInt(quantity); i++) {
      addItem({
        id: sneaker.id,
        name: sneaker.name,
        price: sneaker.price,
        image: sneaker.images[currentIndex],
        size: sneaker.sizing === 'EU' ? selectedSize : parseFloat(selectedSize)
      });
    }
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      setAddToCartState('success');
      setTimeout(() => setAddToCartState('idle'), 1200);
    }, 800);
  }

  const avgRating = reviews.length
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent
            className="max-w-5xl w-[95vw] h-[90vh] p-0 border-2 border-white bg-gradient-to-br from-black/95 to-gray-900/95 backdrop-blur-sm overflow-hidden"
            hideClose
          >
            <DialogTitle className="sr-only">{sneaker.name}</DialogTitle>
    
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 z-50 bg-background/80 hover:bg-background text-white"
            >
              <X className="w-5 h-5" />
            </Button>
    
            <div className="grid grid-cols-1 lg:grid-cols-2 h-full w-full">
              {/* LEFT IMAGE */}
              <div className="relative bg-black aspect-[2/3] h-full w-full overflow-hidden border-r border-white/10 p-0 m-0 flex items-center justify-center">
                {/* Carousel for product images */}
                {sneaker.images && sneaker.images.length > 0 && (
                  <>
                    <img
                      src={sneaker.images[currentIndex]}
                      alt={sneaker.name}
                      className="product-image"
                    />
                    {sneaker.images.length > 1 && (
                      <>
                        <button
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 z-10"
                          onClick={() => setCurrentIndex((prev) => (prev === 0 ? sneaker.images.length - 1 : prev - 1))}
                          aria-label="Previous image"
                        >
                          &#8592;
                        </button>
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 z-10"
                          onClick={() => setCurrentIndex((prev) => (prev === sneaker.images.length - 1 ? 0 : prev + 1))}
                          aria-label="Next image"
                        >
                          &#8594;
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                          {sneaker.images.map((_, i) => (
                            <span
                              key={i}
                              className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-primary' : 'bg-gray-400'} inline-block`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 left-0 m-2 bg-background/80 hover:bg-background z-20"
                  onClick={() => toggleFavorite(sneaker.id)}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite(sneaker.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-muted-foreground'
                    }`}
                  />
                </Button>
              </div>
    
              {/* RIGHT PANEL WITH SCROLLBAR */}
              <div className="flex flex-col p-4 sm:p-8 h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scroll scrollbar-thin scrollbar-thumb-[#FFD600] scrollbar-track-[#232323] w-full" style={{ maxHeight: '100vh' }}>
                <style>{`
                  .custom-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: #FFD600 #232323;
                  }
                  .custom-scroll::-webkit-scrollbar {
                    width: 8px;
                  }
                  .custom-scroll::-webkit-scrollbar-thumb {
                    background-color: #FFD600;
                    border-radius: 4px;
                  }
                  .custom-scroll::-webkit-scrollbar-track {
                    background: #232323;
                    border-radius: 4px;
                  }
                `}</style>
    
                <div className="space-y-4 sm:space-y-6 pb-10 w-full">
                  {/* Product Info */}
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{sneaker.name}</h1>
                    <div className="flex items-center gap-2 mb-2">
                      {reviews.length === 0 ? (
                        <span className="text-gray-400 text-sm">No reviews yet</span>
                      ) : (
                        <>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.round(avgRating)
                                    ? 'fill-[#FFD600] text-[#FFD600]'
                                    : 'text-gray-500'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-300">
                            {avgRating.toFixed(1)} ({reviews.length})
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-[#FFD600] mb-1">{sneaker.price}</p>
                    <span className="text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded-full">
                      {sneaker.brand}
                    </span>
                  </div>
    
                  {/* Size Selector */}
                  <div>
                    <label className="text-sm font-medium text-white mb-3 block">
                      Size {sneaker.sizing === 'EU' && <span className="text-gray-400 text-xs">(EU with US conversion)</span>}
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 w-full">
                      {sizes.map((sizeOption) => {
                        const isSelected = sneaker.sizing === 'EU' 
                          ? selectedSize === sizeOption.eu 
                          : selectedSize === sizeOption;
                        
                        return (
                          <Button
                            key={sneaker.sizing === 'EU' ? sizeOption.eu : sizeOption}
                            variant={isSelected ? 'default' : 'outline'}
                            onClick={() => setSelectedSize(sneaker.sizing === 'EU' ? sizeOption.eu : sizeOption)}
                            className="h-12 text-sm"
                          >
                            {sneaker.sizing === 'EU' ? `${sizeOption.eu} (${sizeOption.us})` : sizeOption}
                          </Button>
                        );
                      })}
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
                        {quantities.map((q) => (
                          <SelectItem key={q} value={q}>
                            {q}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
    
                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
                    <Button
                      onClick={handleAddToCart}
                      disabled={!selectedSize || addToCartState === 'loading'}
                      className="flex-1 bg-[#FFD600] text-black hover:bg-[#E6C200] font-semibold flex items-center justify-center gap-2"
                    >
                      {addToCartState === 'loading' && <Loader2 className="animate-spin w-5 h-5" />}
                      {addToCartState === 'success' && <Check className="w-5 h-5 animate-ping-once text-green-600" />}
                      {addToCartState === 'idle' && 'Add to Cart'}
                      {addToCartState === 'loading' && 'Adding...'}
                      {addToCartState === 'success' && 'Added!'}
                    </Button>
                  </div>
    
                  {/* Product Description */}
                  {sneaker.productDescription && (
                    <div className="mt-6">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {sneaker.productDescription}
                      </p>
                    </div>
                  )}
                  
                  {sneaker.productFeatures && sneaker.productFeatures.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-white font-semibold mb-2">🔥 Why You'll Want These:</h4>
                      <ul className="space-y-2">
                        {sneaker.productFeatures.map((feature, index) => (
                          <li key={index} className="text-gray-300 text-sm flex items-start">
                            <span className="text-yellow-400 mr-2">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {sneaker.productIncludes && sneaker.productIncludes.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-white font-semibold mb-2">📦 What You Get:</h4>
                      <ul className="space-y-2">
                        {sneaker.productIncludes.map((item, index) => (
                          <li key={index} className="text-gray-300 text-sm flex items-start">
                            <span className="text-yellow-400 mr-2">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
    
                  {/* Posts Featuring This Item */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 sm:mb-4">Posts Featuring This Item</h3>
                    {postsWithProduct.length === 0 ? (
                      <p className="text-gray-400 text-sm">No posts yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 w-full">
                        {postsWithProduct.map((p) => (
                          <div
                            key={p.id}
                            className="bg-gray-900/40 rounded-lg p-3 border border-gray-700"
                          >
                            {p.thumbnail_url && (
                              <img
                                src={p.thumbnail_url}
                                alt={p.title || 'Post media'}
                                className="w-full h-20 object-cover rounded mb-2"
                              />
                            )}
                            <div className="text-xs text-gray-300 truncate">
                              @{p.author_username}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(p.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
    
                  {/* Reviews */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Reviews</h3>
                    {!hasPurchased && (
                      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-3 mb-3">
                        <p className="text-yellow-400 text-sm">
                          You must purchase this product to submit a review.
                        </p>
                      </div>
                    )}
                    {reviews.length === 0 && (
                      <p className="text-gray-400 text-sm">
                        No reviews yet. Be the first!
                      </p>
                    )}
                    {reviews.map((r) => (
                      <div
                        key={r.id}
                        className="border-l-2 border-[#FFD600]/20 pl-4 bg-gray-900/30 p-3 rounded mb-3"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-white">Anonymous</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < r.rating
                                    ? 'fill-[#FFD600] text-[#FFD600]'
                                    : 'text-gray-500'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-300">{r.review_text}</p>
                      </div>
                    ))}
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
}
    
