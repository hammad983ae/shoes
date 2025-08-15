import { ArrowLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import EnhancedFilterPanel from '@/components/EnhancedFilterPanel';

interface FullCatalogNavBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showFavorites: boolean;
  setShowFavorites: (show: boolean) => void;
  onFiltersChange: (filters: {
    categories: string[];
    brands: string[];
    colors: string[];
    priceRange: [number, number];
  }) => void;
}

const FullCatalogNavBar = ({
  showFavorites,
  setShowFavorites,
  onFiltersChange,
}: FullCatalogNavBarProps) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 hover:bg-muted/50 backdrop-blur-md bg-background/60 rounded-lg border border-border/50"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Back</span>
      </Button>

      {/* Favorites toggle */}
      <Button
        variant={showFavorites ? "default" : "outline"}
        size="sm"
        onClick={() => setShowFavorites(!showFavorites)}
        className={`${showFavorites ? "bg-primary text-primary-foreground" : "btn-hover-glow backdrop-blur-md bg-background/60"}`}
      >
        <Heart className={`w-4 h-4 ${showFavorites ? "fill-current" : ""}`} />
        <span className="hidden sm:inline ml-2">
          {showFavorites ? "All Items" : "Favorites"}
        </span>
      </Button>

      {/* Enhanced Filter Panel */}
      <EnhancedFilterPanel onFiltersChange={onFiltersChange} />
    </>
  );
};

export default FullCatalogNavBar;