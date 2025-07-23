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

const ViewProductModal = ({ isOpen, onClose, sneaker }: ViewProductModalProps) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [isAnimating, setIsAnimating] = useState(false);
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const sizes = ['6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','12.5','13'];
  const quantities = ['1','2','3','4','5'];

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [postsWithProduct, setPostsWithProduct] = useState<PostWithProduct[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadReviews();
      loadPostsWithProduct();
      if (user) checkPurchaseHistory();
    }
  }, [isOpen, sneaker.id, user]);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', sneaker.id.toString())
        .order('created_at', { ascending: false });
      if (error) throw error;
      const reviewsWithProfiles = await Promise.all((data || []).map(async review => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', review.user_id)
          .maybeSingle();
        return { ...review, profiles: profile };
      }));
      setReviews(reviewsWithProfiles);
    } catch (err) { console.error(err); }
  };

  const loadPostsWithProduct = async () => {
    try {
      const { data: postsProductsData, error } = await supabase
        .from('posts_products')
        .select('post_id')
        .eq('product_id', sneaker.id.toString())
        .limit(4);
      if (error) throw error;
      if (!postsProductsData || postsProductsData.length === 0) {
        setPostsWithProduct([]);
        return;
      }
      const postIds = postsProductsData.map(p => p.post_id);
      const { data: postsData, error: postsError } = await supabase
        .from('top_posts')
        .select('id,title,description,thumbnail_url,video_url,author_username,platform,original_url,posted_at')
        .in('id', postIds)
        .order('posted_at',{ascending:false});
      if (postsError) throw postsError;
      setPostsWithProduct((postsData||[]).map(post=>({...post, created_at:post.posted_at})));
    } catch (err){ console.error(err); setPostsWithProduct([]);}
  };

  const checkPurchaseHistory = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('purchase_history')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', sneaker.id.toString())
        .maybeSingle();
      setHasPurchased(!!data);
    } catch (err) { console.error(err); }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((a,b)=>a+b.rating,0);
    return sum / reviews.length;
  };

  const handleAddToCart = () => {
    if (!selectedSize) return;
    for (let i = 0; i < parseInt(quantity); i++) {
      addItem({ id: sneaker.id, name: sneaker.name, price: sneaker.price, image: sneaker.image, size: parseFloat(selectedSize) });
    }
    setIsAnimating(true);
    setTimeout(()=>setIsAnimating(false),1000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (user && selectedSize) recordPurchase();
    setTimeout(()=>onClose(),1000);
  };

  const recordPurchase = async () => {
    if (!user || !selectedSize) return;
    try {
      const price = parseFloat(sneaker.price.replace('$',''));
      await supabase.from('purchase_history').insert({
        user_id:user.id,
        product_id:sneaker.id.toString(),
        product_name:sneaker.name,
        purchase_price:price,
        quantity:parseInt(quantity)
      });
      setHasPurchased(true);
    } catch(err){console.error(err);}
  };

  const handleReviewSubmit = async (e:React.FormEvent) => {
    e.preventDefault();
    if (!user) {toast({title:'Authentication required',description:'Sign in to submit a review',variant:'destructive'});return;}
    if (!hasPurchased){toast({title:'Purchase required',description:'You must purchase this product to submit a review',variant:'destructive'});return;}
    if (!reviewComment.trim()){toast({title:'Review text required',description:'Please write a review',variant:'destructive'});return;}
    setReviewSubmitting(true);
    try {
      const imageUrls:string[]=[];
      for (const file of reviewImages){
        const ext=file.name.split('.').pop();
        const fileName=`${Math.random()}.${ext}`;
        const filePath=`review-images/${fileName}`;
        const {error:uploadError}=await supabase.storage.from('avatars').upload(filePath,file);
        if(uploadError)throw uploadError;
        const {data:{publicUrl}}=supabase.storage.from('avatars').getPublicUrl(filePath);
        imageUrls.push(publicUrl);
      }
      const {error}=await supabase.from('product_reviews').insert({
        user_id:user.id,
        product_id:sneaker.id.toString(),
        rating:reviewRating,
        review_text:reviewComment.trim(),
        review_images:imageUrls
      });
      if(error)throw error;
      toast({title:'Review submitted successfully!'});
      setReviewRating(5);setReviewComment('');setReviewImages([]);loadReviews();
    }catch(err:any){toast({title:'Error submitting review',description:err.message,variant:'destructive'});}
    finally{setReviewSubmitting(false);}
  };

// Parallax animation
const imageContainerRef = useRef<HTMLDivElement>(null);
const imageRef = useRef<HTMLImageElement>(null);

useEffect(() => {
  const container = imageContainerRef.current;
  const img = imageRef.current;

  // If refs aren't available yet, exit early with a valid cleanup
  if (!container || !img) {
    return () => {};
  }

  let frame: number | null = null;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
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
    if (!container) return; // ✅ null check
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

  container.addEventListener("mousemove", onMouseMove);
  container.addEventListener("mouseleave", onMouseLeave);
  frame = requestAnimationFrame(animate);

  return () => {
    // ✅ Cleanup with null checks
    if (container) {
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
    }
    if (frame) cancelAnimationFrame(frame);
    if (img) {
      img.style.transform = "";
    }
  };
}, [isOpen]);

return (
  <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-5xl w-[95vw] h-[90vh] p-0 border-2 border-white bg-gradient-to-br from-black/95 to-gray-900/95 backdrop-blur-sm flex flex-col"
        hideClose
      >
        <DialogTitle className="sr-only">{sneaker.name}</DialogTitle>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 bg-background/80 hover:bg-background text-white"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 min-h-0">
          {/* Left side - Image */}
          <div
            ref={imageContainerRef}
            className="relative bg-black/20 flex items-center justify-center p-4 min-h-0"
          >
            <img
              ref={imageRef}
              src={sneaker.image}
              alt={sneaker.name}
              className="max-h-full max-w-full object-contain select-none pointer-events-none"
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

          {/* Right side - Scrollable */}
          <div
            className="flex flex-col p-8 overflow-y-auto min-h-0"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#FFD600 #1a1a1a' }}
          >
            <div className="space-y-6">
              {/* Product info */}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {sneaker.name}
                </h1>
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
                <p className="text-2xl font-bold text-[#FFD600] mb-1">
                  {sneaker.price}
                </p>
                <span className="text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded-full">
                  {sneaker.category}
                </span>
              </div>
              {/* … keep your rest of content here … */}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </>
);


                {/* Sizes */}
                <div>
                  <label className="text-sm font-medium text-white mb-3 block">Size</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {sizes.map(size=>(
                      <Button key={size} variant={selectedSize===size?'default':'outline'} onClick={()=>setSelectedSize(size)} className="h-12 text-sm">
                        <div className="text-center">
                          <div>{size}</div>
                          <div className="text-xs text-muted-foreground">{Math.floor(Math.random()*10)+1} left</div>
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
                      {quantities.map(qty=>(
                        <SelectItem key={qty} value={qty}>{qty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <Button onClick={handleAddToCart} disabled={!selectedSize} className="flex-1 bg-[#FFD600] text-black hover:bg-[#E6C200] font-semibold">
                    Add to Cart
                  </Button>
                  <Button onClick={handleBuyNow} disabled={!selectedSize} variant="outline" className="flex-1 border-[#FFD600] text-[#FFD600] hover:bg-[#FFD600] hover:text-black">
                    Buy Now
                  </Button>
                </div>

                {/* Posts Featuring This Item */}
                {postsWithProduct.length>0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Posts Featuring This Item</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {postsWithProduct.map(post=>(
                        <div key={post.id} className="relative bg-gray-900/40 rounded-lg p-3 border border-gray-700 hover:border-[#FFD600]/50 transition-colors">
                          {(post.thumbnail_url||post.video_url)&&(
                            <img src={post.thumbnail_url||post.video_url||''} alt={post.title||'Post media'} className="w-full h-20 object-cover rounded mb-2" />
                          )}
                          <div className="text-xs text-gray-300 truncate">@{post.author_username}</div>
                          <div className="text-xs text-gray-500">{post.platform} • {new Date(post.created_at).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={()=>navigate(`/feed?product=${sneaker.id}`)} className="w-full border-[#FFD600] text-[#FFD600] hover:bg-[#FFD600] hover:text-black">
                      See all posts with this product
                    </Button>
                  </div>
                )}

                {/* Reviews */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Reviews</h3>
                  <div className="space-y-4">
                    {reviews.length===0 && (
                      <div className="text-gray-400 text-sm">No reviews yet. Be the first to review!</div>
                    )}
                    {reviews.map(review=>(
                      <div key={review.id} className="border-l-2 border-[#FFD600]/20 pl-4 bg-gray-900/30 p-3 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-white">{review.profiles?.display_name||'Anonymous'}</span>
                          <div className="flex">
                            {[...Array(5)].map((_,i)=>(
                              <Star key={i} className={`w-3 h-3 ${i<review.rating?'fill-[#FFD600] text-[#FFD600]':'text-gray-500'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-300">{review.review_text}</p>
                        {review.review_images && review.review_images.length>0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {review.review_images.map((imageUrl,index)=>(
                              <img key={index} src={imageUrl} alt={`Review ${index+1}`} className="w-16 h-16 object-cover rounded border border-gray-600 cursor-pointer hover:opacity-80" onClick={()=>setSelectedImage(imageUrl)} />
                            ))}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">{new Date(review.created_at).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                  {/* Review Submission */}
                  {user ? (
                    <form onSubmit={handleReviewSubmit} className="mt-6 p-4 bg-gray-900/40 rounded-lg space-y-3 border border-gray-700">
                      {!hasPurchased && (
                        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-3 mb-3">
                          <p className="text-yellow-400 text-sm">You must purchase this product to submit a review.</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm text-white mb-2 block">Rating</label>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(rating=>(
                            <button key={rating} type="button" onClick={()=>setReviewRating(rating)} className="focus:outline-none">
                              <Star className={`w-6 h-6 transition-colors ${rating<=reviewRating?'fill-[#FFD600] text-[#FFD600]':'text-gray-500 hover:text-[#FFD600]'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-white mb-1 block">Review</label>
                        <textarea placeholder="Write your review..." className="border border-gray-600 rounded px-3 py-2 text-sm w-full bg-gray-800 text-white min-h-[80px]" value={reviewComment} onChange={e=>setReviewComment(e.target.value)} required disabled={!hasPurchased}/>
                      </div>
                      <div>
                        <label className="text-sm text-white mb-2 block">Upload Images</label>
                        <input type="file" multiple accept="image/*" onChange={e=>{if(e.target.files)setReviewImages(Array.from(e.target.files));}} className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#FFD600] file:text-black hover:file:bg-[#E6C200]" disabled={!hasPurchased}/>
                        {reviewImages.length>0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {reviewImages.map((file,index)=>(
                              <div key={index} className="relative">
                                <img src={URL.createObjectURL(file)} alt={`Review ${index+1}`} className="w-16 h-16 object-cover rounded border border-gray-600"/>
                                <button type="button" onClick={()=>setReviewImages(prev=>prev.filter((_,i)=>i!==index))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" disabled={!hasPurchased||reviewSubmitting||!reviewComment.trim()} className="bg-[#FFD600] text-black hover:bg-[#E6C200]">
                          {reviewSubmitting?'Submitting...':'Submit Review'}
                        </Button>
                      </div>
                    </form>
                  ):(
                    <div className="mt-6 p-4 bg-gray-900/40 rounded-lg border border-gray-700">
                      <p className="text-gray-400 text-sm">Sign in to write a review</p>
                    </div>
                  )}
                </div>

                {/* About This Item */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">About This Item</h3>
                  <p className="text-gray-300">
                    This premium sneaker combines style and comfort with high-quality materials and expert craftsmanship. Perfect for both casual wear and athletic activities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CartAnimation isAnimating={isAnimating} startPosition={{ x: window.innerWidth/2, y: window.innerHeight/2 }} endPosition={{ x:64,y:64 }} onComplete={()=>setIsAnimating(false)}/>

      {/* Lightbox */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={()=>setSelectedImage(null)}>
          <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-4 bg-black/95 border-white">
            <DialogTitle className="sr-only">Review Image</DialogTitle>
            <div className="flex items-center justify-center h-full">
              <img src={selectedImage} alt="Review" className="max-w-full max-h-full object-contain"/>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ViewProductModal;
