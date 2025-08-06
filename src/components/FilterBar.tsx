import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

interface FilterBarProps {
  sortBy: string;
  setSortBy: (sort: string) => void;
  selectedBrands: string[];
  setSelectedBrands: (brands: string[]) => void;
  selectedColors: string[];
  setSelectedColors: (colors: string[]) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  className?: string;
}

const FilterBar = ({
  sortBy,
  setSortBy,
  selectedBrands,
  setSelectedBrands,
  selectedColors,
  setSelectedColors,
  priceRange,
  setPriceRange,
  className = ""
}: FilterBarProps) => {
  const brands = ['Nike', 'Rick Owens', 'Maison Margiela', 'Jordan', 'Louis Vuitton'];
  const colors = ['Black', 'White', 'Red', 'Blue', 'Brown', 'Green'];
  const priceRanges = [
    { label: 'Under $200', value: [0, 200] as [number, number] },
    { label: '$200 - $400', value: [200, 400] as [number, number] },
    { label: '$400 - $600', value: [400, 600] as [number, number] },
    { label: 'Over $600', value: [600, 999999] as [number, number] }
  ];

  const hasActiveFilters = selectedBrands.length > 0 || selectedColors.length > 0 || 
    (priceRange[0] !== 0 || priceRange[1] !== 999999);

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedColors([]);
    setPriceRange([0, 999999]);
  };

  return (
    <div className={`bg-background border-b border-border/50 py-4 ${className}`}>
      <div className="px-4 md:px-8">
        {/* Desktop View */}
        <div className="hidden md:flex items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">Filter by:</span>
            
            {/* Brand Filter */}
            <Select value={selectedBrands[0] || "all"} onValueChange={(value) => 
              value === "all" ? setSelectedBrands([]) : setSelectedBrands([value])
            }>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Color Filter */}
            <Select value={selectedColors[0] || "all"} onValueChange={(value) => 
              value === "all" ? setSelectedColors([]) : setSelectedColors([value])
            }>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colors</SelectItem>
                {colors.map(color => (
                  <SelectItem key={color} value={color}>{color}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range Filter */}
            <Select value={`${priceRange[0]}-${priceRange[1]}`} onValueChange={(value) => {
              const range = priceRanges.find(r => `${r.value[0]}-${r.value[1]}` === value);
              if (range) setPriceRange(range.value);
            }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-999999">All Prices</SelectItem>
                {priceRanges.map(range => (
                  <SelectItem 
                    key={`${range.value[0]}-${range.value[1]}`} 
                    value={`${range.value[0]}-${range.value[1]}`}
                  >
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile View - Filter Button */}
        <div className="md:hidden flex items-center justify-between">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters {hasActiveFilters && `(${selectedBrands.length + selectedColors.length + (priceRange[0] !== 0 || priceRange[1] !== 999999 ? 1 : 0)})`}
          </Button>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price ↑</SelectItem>
              <SelectItem value="price-high">Price ↓</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedBrands.map(brand => (
              <Badge key={brand} variant="secondary" className="flex items-center gap-1">
                {brand}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => setSelectedBrands(selectedBrands.filter(b => b !== brand))}
                />
              </Badge>
            ))}
            {selectedColors.map(color => (
              <Badge key={color} variant="secondary" className="flex items-center gap-1">
                {color}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => setSelectedColors(selectedColors.filter(c => c !== color))}
                />
              </Badge>
            ))}
            {(priceRange[0] !== 0 || priceRange[1] !== 999999) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                ${priceRange[0]} - ${priceRange[1] === 999999 ? '∞' : priceRange[1]}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => setPriceRange([0, 999999])}
                />
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;