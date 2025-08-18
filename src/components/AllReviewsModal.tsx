import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  display_name: string | null;
}

interface AllReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
}

export const AllReviewsModal = ({ isOpen, productId, onClose }: AllReviewsModalProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && productId) {
      fetchReviews();
    }
  }, [isOpen, productId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      if (reviewsData && reviewsData.length > 0) {
        setReviews(reviewsData);

        // Fetch user profiles for all reviews
        const userIds = [...new Set(reviewsData.map(review => review.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        const profilesMap = (profilesData || []).reduce((acc, profile) => {
          acc[profile.user_id] = profile;
          return acc;
        }, {} as Record<string, UserProfile>);

        setUserProfiles(profilesMap);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>All Reviews</DialogTitle>
          <DialogDescription>
            {reviews.length > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                    />
                  ))}
                </div>
                <span>{avgRating.toFixed(1)} out of 5 ({reviews.length} reviews)</span>
              </div>
            ) : (
              "No reviews yet"
            )}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reviews yet. Be the first to leave a review!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-border/50 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                          />
                        ))}
                      </div>
                      <span className="font-medium text-sm">
                        {userProfiles[review.user_id]?.display_name || 'Anonymous'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  {review.review_text && (
                    <p className="text-sm text-muted-foreground">
                      {review.review_text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};