import { ArrowLeft, Heart, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

interface FullCatalogNavBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showFavorites: boolean;
  setShowFavorites: (show: boolean) => void;
  hasActiveFilters: boolean;
  toggleFilterPanel: () => void;
}

const FullCatalogNavBar = ({
  showFavorites,
  setShowFavorites,
  hasActiveFilters,
  toggleFilterPanel
}: FullCatalogNavBarProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center gap-2 max-w-screen-lg mx-auto">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 hover:bg-muted/50 backdrop-blur-md bg-background/60 rounded-full border border-border/50"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Back</span>
      </Button>

      {/* Favorites button */}
      <Button
        variant={showFavorites ? 'default' : 'outline'}
        size="sm"
        onClick={() => setShowFavorites(!showFavorites)}
        className={`${showFavorites ? 'bg-primary text-primary-foreground' : 'btn-hover-glow backdrop-blur-md bg-background/60 rounded-full'}`}
      >
        <Heart className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
        <span className="hidden sm:inline ml-2">
          {showFavorites ? 'All Items' : 'Favorites'}
        </span>
      </Button>

      {/* Filter button now acts as the SheetTrigger */}
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFilterPanel}
          className="btn-hover-glow backdrop-blur-md bg-background/60 rounded-full relative"
        >
          <Filter className="w-4 h-4" />
          {hasActiveFilters && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              !
            </Badge>
          )}
        </Button>
      </SheetTrigger>
    </div>
  );
};

export default FullCatalogNavBar;
