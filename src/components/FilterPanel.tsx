import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';


interface FilterPanelProps {
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

const FilterPanel = ({ 
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
  setPriceRange
}: FilterPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Available filter options
  const brands = ['All', 'Nike', 'Rick Owens', 'Maison Margiela'];
  const colors = ['All', 'black', 'white', 'mocha', 'brown'];
  const types = ['All', 'low-top', 'high-top'];
  const sortOptions = [
    { value: 'name-asc', label: 'Name A–Z' },
    { value: 'name-desc', label: 'Name Z–A' },
    { value: 'price-high', label: 'Price High to Low' },
    { value: 'price-low', label: 'Price Low to High' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
  ];

  const handleBrandChange = (brand: string) => {
    if (brand === 'All') {
      setSelectedBrands([]);
    } else {
      setSelectedBrands([brand]);
    }
  };

  const handleColorChange = (color: string) => {
    if (color === 'All') {
      setSelectedColors([]);
    } else {
      setSelectedColors([color]);
    }
  };

  const handleTypeChange = (type: string) => {
    if (type === 'All') {
      setSelectedTypes([]);
    } else {
      setSelectedTypes([type]);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSortBy('name-asc');
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedTypes([]);
    setPriceRange([0, 1000]);
  };

  const hasActiveFilters = selectedCategory !== 'All' || 
    selectedBrands.length > 0 || 
    selectedColors.length > 0 || 
    selectedTypes.length > 0 ||
    priceRange[0] > 0 || 
    priceRange[1] < 1000;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 btn-hover-glow relative">
          <Filter className="w-4 h-4" />
          Filter
          {hasActiveFilters && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              !
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Filter & Sort
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6 max-h-[calc(100vh-120px)] overflow-y-auto">
          {/* Sort Options */}
          <div>
            <Label className="text-base font-semibold">Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Brand Filter */}
          <div>
            <Label className="text-base font-semibold">Brand</Label>
            <Select value={selectedBrands.length === 0 ? 'All' : selectedBrands[0]} onValueChange={handleBrandChange}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Color Filter */}
          <div>
            <Label className="text-base font-semibold">Color</Label>
            <Select value={selectedColors.length === 0 ? 'All' : selectedColors[0]} onValueChange={handleColorChange}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colors.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Type Filter */}
          <div>
            <Label className="text-base font-semibold">Type</Label>
            <Select value={selectedTypes.length === 0 ? 'All' : selectedTypes[0]} onValueChange={handleTypeChange}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'All' ? 'All Types' : type === 'low-top' ? 'Low-Top' : 'High-Top'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Price Range Filter */}
          <div>
            <Label className="text-base font-semibold">Price Range</Label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                placeholder="Min"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                className="flex-1 border rounded px-3 py-2 text-sm bg-background"
              />
              <span className="text-muted-foreground">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                className="flex-1 border rounded px-3 py-2 text-sm bg-background"
              />
            </div>
          </div>

          <Separator />

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div>
              <Label className="text-base font-semibold">Active Filters</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedCategory !== 'All' && (
                  <Badge variant="secondary" className="text-xs">
                    Category: {selectedCategory}
                    <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSelectedCategory('All')} />
                  </Badge>
                )}
                {selectedBrands.map((brand) => (
                  <Badge key={brand} variant="secondary" className="text-xs">
                    Brand: {brand}
                    <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSelectedBrands([])} />
                  </Badge>
                ))}
                {selectedColors.map((color) => (
                  <Badge key={color} variant="secondary" className="text-xs">
                    Color: {color}
                    <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSelectedColors([])} />
                  </Badge>
                ))}
                {selectedTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    Type: {type === 'low-top' ? 'Low-Top' : 'High-Top'}
                    <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSelectedTypes([])} />
                  </Badge>
                ))}
                {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                  <Badge variant="secondary" className="text-xs">
                    Price: ${priceRange[0]} - ${priceRange[1]}
                    <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setPriceRange([0, 1000])} />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterPanel;