import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  productId: string;
  className?: string;
  size?: number;
}

export const FavoriteButton = ({ productId, className, size = 20 }: FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite, loading } = useFavorites();
  const isProductFavorite = isFavorite(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(productId);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "transition-colors duration-200 hover:scale-110",
        isProductFavorite ? "text-red-500" : "text-muted-foreground hover:text-red-500",
        className
      )}
      aria-label={isProductFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart 
        size={size} 
        className={cn(
          "transition-all duration-200",
          isProductFavorite && "fill-current"
        )} 
      />
    </button>
  );
};