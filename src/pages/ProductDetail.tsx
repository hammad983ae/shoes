import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Star, Check, Loader2, ArrowLeft } from 'lucide-react';
import { Sneaker } from '@/types/global';
import { useDynamicProducts } from '@/hooks/useDynamicProducts';
import { useCart } from '@/contexts/CartContext';
import MainCatalogNavBar from '@/components/MainCatalogNavBar';
import { useFavorites } from '@/contexts/FavoritesContext';
import { supabase } from '@/integrations/supabase/client';

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

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useDynamicProducts();
  
  const product: Sneaker | undefined = useMemo(() => 
    products.find(s => s.id.toString() === id), [id, products]
  );

  const { addItem } = useCart();
  const { isFavorite } = useFavorites();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [searchTerm, setSearchTerm] = useState('');
  const [addToCartState, setAddToCartState] = useState<'idle' | 'loading' | 'success'>('idle');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [postsWithProduct, setPostsWithProduct] = useState<PostWithProduct[]>([]);

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

    // Fetch reviews and posts (optional but nice)
    (async () => {
      const { data: rData } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', String(product.id))
        .order('created_at', { ascending: false });
      if (rData) setReviews(rData as any);

      const { data: linkData } = await supabase
        .from('posts_products')
        .select('post_id')
        .eq('product_id', String(product.id))
        .limit(4);
      if (linkData && linkData.length) {
        const ids = linkData.map((l: any) => l.post_id);
        const { data: postsData } = await supabase
          .from('top_posts')
          .select('id,title,thumbnail_url,author_username,posted_at')
          .in('id', ids)
          .order('posted_at', { ascending: false });
        if (postsData) {
          setPostsWithProduct(
            postsData.map((p: any) => ({
              id: p.id,
              title: p.title,
              thumbnail_url: p.thumbnail_url,
              author_username: p.author_username,
              created_at: p.posted_at,
            }))
          );
        }
      }
    })();
  }, [product]);

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
              <p className="text-xl sm:text-2xl font-bold text-primary">{product.price}</p>
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
                <h3 className="font-semibold mb-3 text-foreground">Product Description</h3>
                <div 
                  className="prose prose-sm max-w-none text-muted-foreground [&_*]:text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
                />
              </div>
            )}

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

            {/* Posts Featuring */}
            <div>
              <h3 className="font-semibold mb-2">Posts featuring this item</h3>
              {postsWithProduct.length === 0 ? (
                <p className="text-sm text-muted-foreground">No posts yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {postsWithProduct.map(p => (
                    <div key={p.id} className="bg-background/40 rounded-lg p-3 border border-border">
                      {p.thumbnail_url && <img src={p.thumbnail_url} alt={p.title || 'Post media'} className="w-full h-24 object-cover rounded mb-2" />}
                      <div className="text-xs text-muted-foreground truncate">@{p.author_username}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
    </main>
  );
};

export default ProductDetail;
