import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, X, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { supabase } from '@/integrations/supabase/client';
import CartAnimation from './CartAnimation';
import { useAuth } from '@/contexts/AuthContext';

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

interface PostWithProduct {
  id: string;
  title: string | null;
  author_username: string;
  thumbnail_url: string | null;
  created_at: string;
}

export default function ViewProductModal({ isOpen, onClose, sneaker }: ViewProductModalProps) {
  const { user } = useAuth();
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState('1');
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);

  const sizes = ['6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','12.5','13'];
  const quantities = ['1','2','3','4','5'];

  const [reviews, setReviews] = useState<Review[]>([]);
  const [postsWithProduct, setPostsWithProduct] = useState<PostWithProduct[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false);

  // Load reviews & posts
  useEffect(() => {
    if (isOpen) {
      loadReviews();
      loadPosts();
      if (user) {
        checkPurchase();
      } else {
        setHasPurchased(false);
      }
    }
  }, [isOpen, sneaker.id, user]);

  async function loadReviews() {
    const { data } = await supabase
      .from('product_reviews')
      .select('id,user_id,product_id,rating,review_text,created_at')
      .eq('product_id', sneaker.id.toString());
    if (data) setReviews(data);
  }

  async function loadPosts() {
    const { data: postLinks } = await supabase
      .from('posts_products')
      .select('post_id')
      .eq('product_id', sneaker.id.toString())
      .limit(4);

    if (postLinks && postLinks.length > 0) {
      const ids = postLinks.map((p) => p.post_id);
      const { data: posts } = await supabase
        .from('top_posts')
        .select('id,title,author_username,thumbnail_url,posted_at')
        .in('id', ids)
        .order('posted_at', { ascending: false });
      if (posts) {
        setPostsWithProduct(
          posts.map((p) => ({
            id: p.id,
            title: p.title,
            author_username: p.author_username,
            thumbnail_url: p.thumbnail_url,
            created_at: p.posted_at,
          }))
        );
      }
    }
  }

  async function checkPurchase() {
    if (!user) return;
    const { data } = await supabase
      .from('purchase_history')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', sneaker.id.toString());
    setHasPurchased((data && data.length > 0) || false);
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
    onClose();
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* LEFT: Product Image fills entire area */}
          <div className="relative bg-black flex items-center justify-center h-full overflow-hidden">
            <img
              src={sneaker.image}
              alt={sneaker.name}
              className="w-full h-full object-cover select-none pointer-events-none"
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

          {/* RIGHT: Scrollable content with custom scrollbar */}
          <div
            className="flex flex-col p-8 h-full overflow-y-scroll"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#FFD600 transparent',
            }}
          >
            {/* Ensure custom scrollbars in WebKit browsers */}
            <style>{`
              .custom-scroll::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scroll::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scroll::-webkit-scrollbar-thumb {
                background-color: #FFD600;
                border-radius: 4px;
              }
            `}</style>

            <div className="custom-scroll space-y-6">
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
                            i < Math.round(
                              reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                            )
                              ? 'fill-[#FFD600] text-[#FFD600]'
                              : 'text-gray-500'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-300">
                      {(
                        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                      ).toFixed(1)}{' '}
                      ({reviews.length})
                    </span>
                  </>
                )}
              </div>
              <p className="text-2xl font-bold text-[#FFD600] mb-1">{sneaker.price}</p>
              <span className="text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded-full">
                {sneaker.category}
              </span>

              {/* Size buttons */}
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
                    {['1', '2', '3', '4', '5'].map((q) => (
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

              {/* Posts Featuring This Item */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">Posts Featuring This Item</h3>
                {postsWithProduct.length === 0 ? (
                  <p className="text-gray-400 text-sm">No posts yet.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {postsWithProduct.map((p) => (
                      <div
                        key={p.id}
                        className="relative bg-gray-900/40 rounded-lg p-3 border border-gray-700 hover:border-[#FFD600]/50 transition-colors"
                      >
                        {p.thumbnail_url && (
                          <img
                            src={p.thumbnail_url}
                            alt={p.title || 'Post media'}
                            className="w-full h-20 object-cover rounded mb-2"
                          />
                        )}
                        <div className="text-xs text-gray-300 truncate">@{p.author_username}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(p.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reviews */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">Reviews</h3>
                {!hasPurchased && (
                  <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-3 mb-3">
                    <p className="text-yellow-400 text-sm">
                      You must purchase this product to submit a review.
                    </p>
                  </div>
                )}
                {reviews.length === 0 ? (
                  <p className="text-gray-400 text-sm">No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map((r) => (
                    <div
                      key={r.id}
                      className="border-l-2 border-[#FFD600]/20 pl-4 bg-gray-900/30 p-3 rounded mb-3"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-white">
                          {r.profiles?.display_name || 'Anonymous'}
                        </span>
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
                  ))
                )}
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