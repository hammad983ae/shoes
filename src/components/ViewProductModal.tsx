import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, X, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  profiles?: { display_name: string | null } | null;
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

export default function ViewProductModal({ isOpen, onClose, sneaker }: ViewProductModalProps) {
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isAnimating, setIsAnimating] = useState(false);
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();

  const sizes = ['6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','12.5','13'];
  const quantities = ['1','2','3','4','5'];

  const [reviews, setReviews] = useState<Review[]>([]);
  const [postsWithProduct, setPostsWithProduct] = useState<PostWithProduct[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadReviews();
      loadPosts();
    }
  }, [isOpen, sneaker.id]);

  async function loadReviews() {
    const { data } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', sneaker.id.toString())
      .order('created_at', { ascending: false });
    if (data) setReviews(data);
  }

  async function loadPosts() {
    const { data: rel } = await supabase
      .from('posts_products')
      .select('post_id')
      .eq('product_id', sneaker.id.toString())
      .limit(4);
    if (rel && rel.length > 0) {
      const ids = rel.map(r => r.post_id);
      const { data: posts } = await supabase
        .from('top_posts')
        .select('id,title,description,thumbnail_url,video_url,author_username,platform,original_url,posted_at')
        .in('id', ids)
        .order('posted_at', { ascending: false });
      if (posts) {
        setPostsWithProduct(posts.map(p => ({ ...p, created_at: p.posted_at })));
      }
    }
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
    return reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
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
            {/* LEFT IMAGE */}
            <div className="relative bg-black flex items-center justify-center p-4 h-full overflow-hidden">
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

            {/* RIGHT CONTENT */}
            <div
              className="flex flex-col p-8 h-full overflow-y-auto"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#FFD600 #1a1a1a' }}
            >
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

              {/* SIZES */}
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

              {/* QUANTITY */}
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

              {/* BUTTONS */}
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

              {/* POSTS */}
              {postsWithProduct.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Posts Featuring This Item</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {postsWithProduct.map((post) => (
                      <div key={post.id} className="relative bg-gray-900/40 rounded-lg p-3 border border-gray-700 hover:border-[#FFD600]/50 transition-colors">
                        {(post.thumbnail_url || post.video_url) && (
                          <img
                            src={post.thumbnail_url || post.video_url || ''}
                            alt={post.title || 'Post media'}
                            className="w-full h-20 object-cover rounded mb-2"
                          />
                        )}
                        <div className="text-xs text-gray-300 truncate">@{post.author_username}</div>
                        <div className="text-xs text-gray-500">
                          {post.platform} • {new Date(post.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => console.log('See all posts')}
                    className="w-full border-[#FFD600] text-[#FFD600] hover:bg-[#FFD600] hover:text-black"
                  >
                    See all posts with this product
                  </Button>
                </div>
              )}

              {/* REVIEWS */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">Reviews</h3>
                {reviews.length === 0 && (
                  <div className="text-gray-400 text-sm">No reviews yet. Be the first!</div>
                )}
                {reviews.map((rev) => (
                  <div key={rev.id} className="border-l-2 border-[#FFD600]/20 pl-4 bg-gray-900/30 p-3 rounded mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-white">
                        {rev.profiles?.display_name || 'Anonymous'}
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < rev.rating ? 'fill-[#FFD600] text-[#FFD600]' : 'text-gray-500'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{rev.review_text}</p>
                  </div>
                ))}
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
