
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

interface EnhancedFilterPanelProps {
  onFiltersChange: (filters: {
    categories: string[];
    brands: string[];
    colors: string[];
    priceRange: [number, number];
  }) => void;
}

const CATEGORIES = [
  'Shoes', 'Shirts', 'Hoodies', 'Jackets', 'Pants', 'Jeans', 
  'Sweatpants', 'Shorts', 'Sweaters/Knits', 'Hats', 'Accessories', 'Socks'
];

const BRANDS = ['Nike', 'Rick Owens', 'Maison Margiela', 'Jordan', 'Adidas', 'Stone Island'];

const COLORS = [
  'Black', 'White', 'Grey', 'Silver', 'Charcoal', 'Off-White/Cream',
  'Brown', 'Tan', 'Beige', 'Navy', 'Blue', 'Light Blue', 'Green',
  'Olive', 'Yellow', 'Orange', 'Red', 'Burgundy', 'Pink', 'Purple',
  'Gold', 'Multicolor/Pattern'
];

const EnhancedFilterPanel = ({ onFiltersChange }: EnhancedFilterPanelProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Initialize from URL params
  useEffect(() => {
    const categories = searchParams.get('category')?.split(',').filter(Boolean) || [];
    const brands = searchParams.get('brand')?.split(',').filter(Boolean) || [];
    const colors = searchParams.get('color')?.split(',').filter(Boolean) || [];
    const priceMin = parseInt(searchParams.get('priceMin') || '0');
    const priceMax = parseInt(searchParams.get('priceMax') || '1000');

    setSelectedCategories(categories);
    setSelectedBrands(brands);
    setSelectedColors(colors);
    setPriceRange([priceMin, priceMax]);
  }, [searchParams]);

  // Update URL and notify parent when filters change
  const updateFilters = (
    categories: string[],
    brands: string[],
    colors: string[],
    range: [number, number]
  ) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    // Clear existing filter params
    newSearchParams.delete('category');
    newSearchParams.delete('brand');
    newSearchParams.delete('color');
    newSearchParams.delete('priceMin');
    newSearchParams.delete('priceMax');
    
    if (categories.length > 0) {
      newSearchParams.set('category', categories.join(','));
    }
    if (brands.length > 0) {
      newSearchParams.set('brand', brands.join(','));
    }
    if (colors.length > 0) {
      newSearchParams.set('color', colors.join(','));
    }
    if (range[0] > 0) {
      newSearchParams.set('priceMin', range[0].toString());
    }
    if (range[1] < 1000) {
      newSearchParams.set('priceMax', range[1].toString());
    }

    setSearchParams(newSearchParams);
    onFiltersChange({
      categories,
      brands,
      colors,
      priceRange: range
    });
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter(c => c !== category);
    
    setSelectedCategories(newCategories);
    // Force immediate update
    setTimeout(() => {
      updateFilters(newCategories, selectedBrands, selectedColors, priceRange);
    }, 0);
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...selectedBrands, brand]
      : selectedBrands.filter(b => b !== brand);
    
    setSelectedBrands(newBrands);
    // Force immediate update
    setTimeout(() => {
      updateFilters(selectedCategories, newBrands, selectedColors, priceRange);
    }, 0);
  };

  const handleColorChange = (color: string, checked: boolean) => {
    const newColors = checked
      ? [...selectedColors, color]
      : selectedColors.filter(c => c !== color);
    
    setSelectedColors(newColors);
    updateFilters(selectedCategories, selectedBrands, newColors, priceRange);
  };

  const handlePriceChange = (values: number[]) => {
    const newRange: [number, number] = [values[0], values[1]];
    setPriceRange(newRange);
    updateFilters(selectedCategories, selectedBrands, selectedColors, newRange);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedColors([]);
    setPriceRange([0, 1000]);
    setSearchParams(new URLSearchParams());
    onFiltersChange({
      categories: [],
      brands: [],
      colors: [],
      priceRange: [0, 1000]
    });
  };

  const hasActiveFilters = selectedCategories.length > 0 || 
    selectedBrands.length > 0 || 
    selectedColors.length > 0 ||
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
            Filter Products
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
          {/* Category Filter */}
          <div>
            <Label className="text-base font-semibold">Category</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {CATEGORIES.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                  />
                  <Label 
                    htmlFor={`category-${category}`} 
                    className="text-sm cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Brand Filter */}
          <div>
            <Label className="text-base font-semibold">Brand</Label>
            <div className="space-y-2 mt-2">
              {BRANDS.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                  />
                  <Label 
                    htmlFor={`brand-${brand}`} 
                    className="text-sm cursor-pointer"
                  >
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Color Filter */}
          <div>
            <Label className="text-base font-semibold">Color</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {COLORS.map((color) => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color}`}
                    checked={selectedColors.includes(color)}
                    onCheckedChange={(checked) => handleColorChange(color, checked as boolean)}
                  />
                  <Label 
                    htmlFor={`color-${color}`} 
                    className="text-sm cursor-pointer"
                  >
                    {color}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price Range Filter */}
          <div>
            <Label className="text-base font-semibold">Price Range</Label>
            <div className="mt-2 space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
              <Slider
                value={priceRange}
                onValueChange={handlePriceChange}
                max={1000}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0]}
                  onChange={(e) => handlePriceChange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="flex-1 border rounded px-2 py-1 text-sm bg-background"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange([priceRange[0], parseInt(e.target.value) || 1000])}
                  className="flex-1 border rounded px-2 py-1 text-sm bg-background"
                />
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <>
              <Separator />
              <div>
                <Label className="text-base font-semibold">Active Filters</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCategories.map((category) => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleCategoryChange(category, false)} />
                    </Badge>
                  ))}
                  {selectedBrands.map((brand) => (
                    <Badge key={brand} variant="secondary" className="text-xs">
                      {brand}
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleBrandChange(brand, false)} />
                    </Badge>
                  ))}
                  {selectedColors.map((color) => (
                    <Badge key={color} variant="secondary" className="text-xs">
                      {color}
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleColorChange(color, false)} />
                    </Badge>
                  ))}
                  {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                    <Badge variant="secondary" className="text-xs">
                      ${priceRange[0]} - ${priceRange[1]}
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handlePriceChange([0, 1000])} />
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EnhancedFilterPanel;
