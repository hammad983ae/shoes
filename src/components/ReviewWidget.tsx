import { Star } from 'lucide-react';

interface ReviewWidgetProps {
  review: {
    id: string;
    user_id: string;
    rating: number;
    review_text: string | null;
    created_at: string;
  };
  userProfile?: {
    display_name?: string;
  };
}

export const ReviewWidget = ({ review, userProfile }: ReviewWidgetProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {userProfile?.display_name || 'Anonymous'} • {formatDate(review.created_at)}
          </span>
        </div>
      </div>
      {review.review_text && (
        <p className="text-sm text-muted-foreground line-clamp-3">
          {review.review_text}
        </p>
      )}
    </div>
  );
};