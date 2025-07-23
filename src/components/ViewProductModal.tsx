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
import { useNavigate } from 'react-router-dom';
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
  review_images: string[] | null;
  created_at: string;
  profiles?: {
    display_name: string | null;
  } | null;
}

interface PostWithProduct {
  id: string;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  author_username: string;
  platform: string;
  original_url: string;
  created_at: string;
}

export default function ViewProductModal({
  isOpen,
  onClose,
  sneaker,
}: ViewProductModalProps) {
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isAnimating, setIsAnimating] = useState(false);
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const sizes = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13'];
  const quantities = ['1', '2', '3', '4', '5'];

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [postsWithProduct, setPostsWithProduct] = useState<PostWithProduct[]>([]);

  // image refs
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadReviews();
      loadPostsWithProduct();
      if (user) checkPurchaseHistory();
    }
  }, [isOpen, sneaker.id, user]);

  async function loadReviews() {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', sneaker.id.toString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const withProfiles = await Promise.all(
        (data || []).map(async (rev) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', rev.user_id)
            .maybeSingle();
          return { ...rev, profiles: profile };
        })
      );
      setReviews(withProfiles);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadPostsWithProduct() {
    try {
      const { data: rel } = await supabase
        .from('posts_products')
        .select('post_id')
        .eq('product_id', sneaker.id.toString())
        .limit(4);
      if (!rel || rel.length === 0) {
        setPostsWithProduct([]);
        return;
      }
      const ids = rel.map((i) => i.post_id);
      const { data: posts } = await supabase
        .from('top_posts')
        .select('id,title,description,thumbnail_url,video_url,author_username,platform,original_url,posted_at')
        .in('id', ids)
        .order('posted_at', { ascending: false });

      if (posts) {
        setPostsWithProduct(posts.map((p) => ({ ...p, created_at: p.posted_at })));
      }
    } catch (e) {
      console.error(e);
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
    setHasPurchased(!!data);
  }

  function handleAddToCart() {
    if (!selectedSize) return;
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
    setTimeout(() => setIsAnimating(false), 1000);
  }

  function handleBuyNow() {
    handleAddToCart();
    setTimeout(() => onClose(), 1000);
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    return total / reviews.length;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="max-w-5xl w-[95vw] h-[90vh] p-0 border-2 border-white bg-gradient-to-br from-black/95 to-gray-900/95 backdrop-blur-sm overflow-hidden"
          hideClose
        >
          <DialogTitle className="sr-only">{sneaker.name}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 bg-background/80 hover:bg-background text-white"
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Left side image */}
            <div
              ref={imageContainerRef}
              className="relative bg-black flex items-center justify-center p-4 h-full overflow-hidden"
            >
              <img
                ref={imageRef}
                src={sneaker.image}
                alt={sneaker.name}
                className="max-w-full max-h-full object-contain select-none pointer-events-none"
                draggable={false}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 left-4 bg-background/80 hover:bg-background"
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

            {/* Right side scrollable */}
            <div
              className="flex flex-col p-8 h-full overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#FFD600 #1a1a1a',
              }}
            >
              {/* === Product info === */}
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
                            i < Math.round(getAverageRating())
                              ? 'fill-[#FFD600] text-[#FFD600]'
                              : 'text-gray-500'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-300">
                      {getAverageRating().toFixed(1)} ({reviews.length})
                    </span>
                  </>
                )}
              </div>
              <p className="text-2xl font-bold text-[#FFD600] mb-1">{sneaker.price}</p>
              <span className="text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded-full">
                {sneaker.category}
              </span>

              {/* Size selector */}
              <div className="mt-6">
                <label className="text-sm font-medium text-white mb-3 block">Size</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {sizes.map((s) => (
                    <Button
                      key={s}
                      variant={selectedSize === s ? 'default' : 'outline'}
                      onClick={() => setSelectedSize(s)}
                      className="h-12 text-sm"
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-6">
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
              <div className="flex gap-4 mt-6">
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

              {/* === Keep your Posts Featuring This Item, Reviews, etc. below here === */}
              {/* Your existing posts/reviews code goes here unchanged */}
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

      {/* Review image lightbox */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-4 bg-black/95 border-white">
            <DialogTitle className="sr-only">Review Image</DialogTitle>
            <div className="flex items-center justify-center h-full">
              <img
                src={selectedImage}
                alt="Review image"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
