import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Star, Check, Loader2, ArrowLeft, Plus } from 'lucide-react';
import { Sneaker } from '@/types/global';
import { useDynamicProducts } from '@/hooks/useDynamicProducts';
import { useCart } from '@/contexts/CartContext';
import MainCatalogNavBar from '@/components/MainCatalogNavBar';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ReviewWidget } from '@/components/ReviewWidget';
import { CreateReviewModal } from '@/components/CreateReviewModal';
import { AllReviewsModal } from '@/components/AllReviewsModal';

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}


const ProductDetail = () => {
  const { slug } = useParams(); // Changed from id to slug
  const navigate = useNavigate();
  const { products } = useDynamicProducts();
  const { user } = useAuth();
  
  const product: Sneaker | undefined = useMemo(() => 
    products.find(s => s.slug === slug), [slug, products]
  );

  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [searchTerm, setSearchTerm] = useState('');
  const [addToCartState, setAddToCartState] = useState<'idle' | 'loading' | 'success'>('idle');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});
  
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showCreateReview, setShowCreateReview] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    if (!product) return;
    document.title = `${product.name} | Product Details`;

    const metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    metaDesc.setAttribute('content', `${product.name} by ${product.brand}. Price ${product.price}. View details, sizes, and reviews.`);
    document.head.appendChild(metaDesc);

    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', window.location.href);
    document.head.appendChild(canonical);

    // Fetch reviews and check if user has purchased this product
    fetchReviewsAndPurchaseStatus();
  }, [product, user]);

  const fetchReviewsAndPurchaseStatus = async () => {
    if (!product) return;

    try {
      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', product.id.toString())
        .order('created_at', { ascending: false })
        .limit(3);

      if (reviewsError) throw reviewsError;

      if (reviewsData && reviewsData.length > 0) {
        setReviews(reviewsData);

        // Fetch user profiles for reviews
        const userIds = [...new Set(reviewsData.map(review => review.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', userIds);

        if (profilesData) {
          const profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.user_id] = profile;
            return acc;
          }, {} as Record<string, any>);
          setUserProfiles(profilesMap);
        }
      }

      // Check if user has purchased this product
      if (user) {
        const { data: purchaseData } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'paid')
          .limit(1);

        if (purchaseData && purchaseData.length > 0) {
          const { data: orderItemData } = await supabase
            .from('order_items')
            .select('id')
            .eq('product_id', product.id.toString())
            .in('order_id', purchaseData.map(o => o.id))
            .limit(1);

          setHasPurchased(!!(orderItemData && orderItemData.length > 0));
        }
      }
    } catch (error) {
      console.error('Error fetching reviews and purchase status:', error);
    }
  };

  useEffect(() => {
    console.log('Selected Size Updated:', selectedSize);
  }, [selectedSize]);

  if (!product) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Product not found.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const sizes = product.sizing === 'EU'
    ? [
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
        { eu: '53', us: '13' },
      ]
    : ['6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','12.5','13'];

  const quantities = ['1','2','3','4','5'];

  const handleAddToCart = async () => {
    if (!selectedSize) return;
    setAddToCartState('loading');
    
    // Add items to cart one by one to ensure proper notification
    for (let i = 0; i < parseInt(quantity); i++) {
      addItem({
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        image: product.images[currentIndex],
        size: selectedSize, // Keep exact selected size string
        size_type: product.sizing === 'EU' ? 'EU' : 'US'
      });
    }
    
    setAddToCartState('success');
    setTimeout(() => setAddToCartState('idle'), 1200);
  };

  const avgRating = reviews.length ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length) : 0;

  return (
    <main className="min-h-screen page-gradient">
      <section className="relative z-10 ml-0 md:ml-16 px-3 sm:px-6 py-4 sm:py-8">
        {/* Main Catalog Navigation Bar */}
        <nav className="sticky top-0 z-40 w-full px-4 md:px-8 py-1">
          <div className="flex items-center justify-start gap-2 max-w-screen-lg mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 hover:bg-muted/50 backdrop-blur-md bg-background/60 rounded-full border border-border/50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <MainCatalogNavBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
        </nav>

        {/* Title */}
        <header className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{product.name}</h1>
          <p className="text-sm text-muted-foreground">{product.brand}</p>
        </header>

        {/* Content */}
        <article className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Images */}
          <div className="relative bg-background/40 border border-border rounded-lg overflow-hidden flex-shrink-0">
            {product.images && product.images.length > 0 && (
              <div className="carousel-container">
                <div
                  className="carousel-track"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {product.images.map((img, i) => (
                    <img key={i} src={img} alt={`${product.name} image ${i+1}`} className="carousel-image" />
                  ))}
                </div>
                {product.images.length > 1 && (
                  <>
                    <button
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 z-20"
                      onClick={() => setCurrentIndex(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                      aria-label="Previous image"
                    >
                      &#8592;
                    </button>
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 z-20"
                      onClick={() => setCurrentIndex(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                      aria-label="Next image"
                    >
                      &#8594;
                    </button>
                  </>
                )}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 left-2 bg-background/80 hover:bg-background z-20"
            >
              <Heart className={`w-5 h-5 ${isFavorite(product.id.toString()) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
            </Button>
          </div>

          {/* Product Details */}
          <div className="flex-1">
            {/* Details content here */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <p className="text-xl sm:text-2xl font-bold text-primary">{product.price}</p>
                <button
                  onClick={() => toggleFavorite(product.id.toString())}
                  className={`transition-colors duration-200 hover:scale-110 ${
                    isFavorite(product.id.toString()) ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                  }`}
                  aria-label={isFavorite(product.id.toString()) ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart 
                    size={24} 
                    className={`transition-all duration-200 ${
                      isFavorite(product.id.toString()) ? "fill-current" : ""
                    }`} 
                  />
                </button>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">{product.stock || 'In Stock'}</span>
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-2 mb-4">
              {reviews.length === 0 ? (
                <span className="text-muted-foreground text-sm">No reviews yet</span>
              ) : (
                <>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{avgRating.toFixed(1)} ({reviews.length})</span>
                </>
              )}
            </div>

            {/* Size Selector */}
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">Size {product.sizing === 'EU' && <span className="text-muted-foreground text-xs">(EU with US conversion)</span>}</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {sizes.map((s: any) => {
                  const isEu = product.sizing === 'EU' && typeof s === 'object';
                  const displayValue = isEu ? `EU ${s.eu} (US ${s.us})` : s;
const selected = selectedSize === displayValue;
return (
  <Button
    key={displayValue}
    variant={selected ? 'default' : 'outline'}
    onClick={() => setSelectedSize(displayValue)}
    className="h-10 text-xs"
  >
    {displayValue}
  </Button>
);
                })}
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-3 mb-6">
              <select value={quantity} onChange={(e) => setQuantity(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-foreground">
                {quantities.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
              <Button onClick={handleAddToCart} disabled={!selectedSize || addToCartState === 'loading'} className="flex-1 gap-2">
                {addToCartState === 'loading' && <Loader2 className="animate-spin w-5 h-5" />}
                {addToCartState === 'success' && <Check className="w-5 h-5" />}
                {addToCartState === 'idle' && 'Add to Cart'}
                {addToCartState === 'loading' && 'Adding...'}
                {addToCartState === 'success' && 'Added!'}
              </Button>
            </div>

            {/* Rich Text Description */}
            {product.description && (
              <div className="mb-6">
                <div 
                  className="prose prose-sm max-w-none text-muted-foreground [&_*]:text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
                />
              </div>
            )}

            {/* Reviews Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Reviews</h3>
                <div className="flex gap-2">
                  {user && hasPurchased && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateReview(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Write Review
                    </Button>
                  )}
                  {reviews.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllReviews(true)}
                    >
                      View All ({reviews.length})
                    </Button>
                  )}
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-lg border border-border/50">
                  <p className="text-muted-foreground">No reviews yet. Be the first to leave a review!</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {reviews.slice(0, 3).map((review) => (
                    <ReviewWidget 
                      key={review.id} 
                      review={review} 
                      userProfile={userProfiles[review.user_id]}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Features */}
            {product.productFeatures && product.productFeatures.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Why you'll want these</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {product.productFeatures.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Includes */}
            {product.productIncludes && product.productIncludes.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">What you get</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {product.productIncludes.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </article>
      </section>

      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          brand: product.brand,
          image: product.images,
          description: product.productDescription || `${product.name} by ${product.brand}`,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: (product.price || '').replace('$',''),
            availability: 'https://schema.org/InStock'
          }
        })
      }} />

      {/* Review Modals */}
      <CreateReviewModal
        isOpen={showCreateReview}
        onClose={() => setShowCreateReview(false)}
        productId={product.id.toString()}
        onReviewCreated={fetchReviewsAndPurchaseStatus}
      />

      <AllReviewsModal
        isOpen={showAllReviews}
        onClose={() => setShowAllReviews(false)}
        productId={product.id.toString()}
      />
    </main>
  );
};

export default ProductDetail;
