import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Check } from 'lucide-react';
import { StarRating } from '@/components/StarRating';
import ImageUpload from '@/components/ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  id: string;
  product_id: string;
  product_title: string;
  quantity: number;
  price_per_item: number;
  size?: string;
  image?: string;
}

interface ProductReview {
  product_id: string;
  rating: number;
  review_text: string;
  review_images: string[];
  submitted: boolean;
}

export default function ReviewOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [reviews, setReviews] = useState<{ [productId: string]: ProductReview }>({});

  useEffect(() => {
    if (orderId && user) {
      fetchOrderItems();
      fetchExistingReviews();
    }
  }, [orderId, user]);

  const fetchOrderItems = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          order_items(
            id,
            product_id,
            quantity,
            price_per_item,
            size,
            products(title, images)
          )
        `)
        .eq('id', orderId!)
        .eq('user_id', user!.id)
        .single();

      if (orderError) throw orderError;

      const items: OrderItem[] = (orderData.order_items || []).map(item => ({
        id: item.id,
        product_id: item.product_id,
        product_title: (item.products as any)?.title || 'Unknown Product',
        quantity: item.quantity,
        price_per_item: item.price_per_item,
        size: item.size || undefined,
        image: ((item.products as any)?.images as string[])?.[0]
      }));

      setOrderItems(items);

      // Initialize reviews state
      const initialReviews: { [productId: string]: ProductReview } = {};
      items.forEach(item => {
        initialReviews[item.product_id] = {
          product_id: item.product_id,
          rating: 0,
          review_text: '',
          review_images: [],
          submitted: false
        };
      });
      setReviews(initialReviews);

    } catch (error) {
      console.error('Error fetching order items:', error);
      toast({
        title: "Error",
        description: "Failed to load order items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('user_id', user!.id);

      if (error) throw error;

      if (data) {
        const existingReviews: { [productId: string]: ProductReview } = {};
        data.forEach(review => {
          existingReviews[review.product_id] = {
            product_id: review.product_id,
            rating: review.rating,
            review_text: review.review_text || '',
            review_images: review.review_images || [],
            submitted: true
          };
        });

        setReviews(prev => ({ ...prev, ...existingReviews }));
      }
    } catch (error) {
      console.error('Error fetching existing reviews:', error);
    }
  };

  const updateReview = (productId: string, updates: Partial<ProductReview>) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], ...updates }
    }));
  };

  const submitReview = async (productId: string) => {
    const review = reviews[productId];
    if (!review || review.rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('product_reviews')
        .upsert({
          user_id: user!.id,
          product_id: productId,
          rating: review.rating,
          review_text: review.review_text,
          review_images: review.review_images
        });

      if (error) throw error;

      updateReview(productId, { submitted: true });
      
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Utility function for checking reviews status
  // const hasAnyReviews = () => {
  //   return Object.values(reviews).some(review => review.submitted);
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Order Details
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Review Your Order</h1>
            <p className="text-muted-foreground">
              Share your experience with the products you received
            </p>
          </div>
        </div>

        {/* Review Items */}
        <div className="space-y-4">
          {orderItems.map((item) => {
            const review = reviews[item.product_id];
            const isSubmitted = review?.submitted;

            return (
              <Card key={item.id} className="relative">
                {isSubmitted && (
                  <div className="absolute top-4 right-4 bg-green-100 text-green-800 rounded-full p-2">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-4">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.product_title}
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-medium">{item.product_title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Size: {item.size} | Quantity: {item.quantity}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Star Rating */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Rating *
                    </label>
                    <StarRating
                      rating={review?.rating || 0}
                      onRatingChange={(rating) => updateReview(item.product_id, { rating })}
                      size="lg"
                      readonly={isSubmitted}
                    />
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Review (Optional)
                    </label>
                    <Textarea
                      placeholder="Share your thoughts about this product..."
                      value={review?.review_text || ''}
                      onChange={(e) => updateReview(item.product_id, { review_text: e.target.value })}
                      disabled={isSubmitted}
                      rows={3}
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Add Photos (Optional)
                    </label>
                    {!isSubmitted ? (
                      <ImageUpload
                        onImageUploaded={(url: string) => {
                          const currentImages = review?.review_images || [];
                          updateReview(item.product_id, { 
                            review_images: [...currentImages, url] 
                          });
                        }}
                        bucketName="user-posts"
                      />
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        {review?.review_images?.map((image, index) => (
                          <img 
                            key={index}
                            src={image}
                            alt={`Review ${index + 1}`}
                            className="w-20 h-20 rounded object-cover"
                          />
                        ))}
                        {(!review?.review_images || review.review_images.length === 0) && (
                          <p className="text-sm text-muted-foreground">No images uploaded</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  {!isSubmitted && (
                    <Button 
                      onClick={() => submitReview(item.product_id)}
                      disabled={submitting || !review?.rating}
                      className="w-full"
                    >
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}