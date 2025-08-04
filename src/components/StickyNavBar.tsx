import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Heart, Filter } from 'lucide-react';
import FilterPanel from '@/components/FilterPanel';

interface StickyNavBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showFavorites: boolean;
  setShowFavorites: (show: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  selectedBrands: string[];
  setSelectedBrands: (brands: string[]) => void;
  selectedColors: string[];
  setSelectedColors: (colors: string[]) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
}

const StickyNavBar = ({
  searchTerm,
  setSearchTerm,
  showFavorites,
  setShowFavorites,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  selectedBrands,
  setSelectedBrands,
  selectedColors,
  setSelectedColors,
  selectedTypes,
  setSelectedTypes,
  priceRange,
  setPriceRange,
}: StickyNavBarProps) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50 -ml-16 -mr-4">
      <div className="px-8 py-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search sneakers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant={showFavorites ? "default" : "outline"}
              onClick={() => setShowFavorites(!showFavorites)}
              className="flex items-center gap-2 btn-hover-glow"
            >
              <Heart className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
              Show Favorites
            </Button>
            
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 btn-hover-glow"
            >
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <FilterPanel
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              selectedTypes={selectedTypes}
              setSelectedTypes={setSelectedTypes}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StickyNavBar; 