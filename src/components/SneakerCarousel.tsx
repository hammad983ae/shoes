import { useState, useEffect, useRef } from 'react';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sneakerCatalog } from './SneakerCatalog';
import { Sneaker } from '@/types/global';
import FilterBar from '@/components/FilterBar';

interface SneakerCarouselProps {
  onViewProduct?: (sneaker: Sneaker) => void;
  searchTerm?: string;
  sortBy?: string;
  selectedBrands?: string[];
  selectedColors?: string[];
  priceRange?: [number, number];
}

const SneakerCarousel = ({ 
  onViewProduct, 
  searchTerm = '',
  sortBy = 'newest',
  selectedBrands = [],
  selectedColors = [],
  priceRange = [0, 999999]
}: SneakerCarouselProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Internal filter states for when used standalone
  const [internalSortBy, setInternalSortBy] = useState('newest');
  const [internalSelectedBrands, setInternalSelectedBrands] = useState<string[]>([]);
  const [internalSelectedColors, setInternalSelectedColors] = useState<string[]>([]);
  const [internalPriceRange, setInternalPriceRange] = useState<[number, number]>([0, 999999]);

  // Auto-scroll functionality
  useEffect(() => {
    if (isHovered || !scrollRef.current) return;

    const scrollContainer = scrollRef.current;
    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 0) return;

    const interval = setInterval(() => {
      if (scrollContainer.scrollLeft >= maxScroll) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += 1;
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isHovered]);

  const handleViewProduct = (sneaker: Sneaker) => {
    onViewProduct?.(sneaker);
  };

  // Filter and sort sneakers
  const filteredSneakers = sneakerCatalog.filter(sneaker => {
    // Search filter
    if (searchTerm && !sneaker.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(sneaker.brand || 'Premium')) {
      return false;
    }
    
    // Color filter (placeholder logic - would need color data in sneaker objects)
    if (selectedColors.length > 0) {
      // For now, assume color is in name or use placeholder logic
      const hasMatchingColor = selectedColors.some(color => 
        sneaker.name.toLowerCase().includes(color.toLowerCase())
      );
      if (!hasMatchingColor) return false;
    }
    
    // Price filter
    const price = parseFloat(sneaker.price.replace('$', ''));
    if (price < priceRange[0] || price > priceRange[1]) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    const priceA = parseFloat(a.price.replace('$', ''));
    const priceB = parseFloat(b.price.replace('$', ''));
    
    switch (sortBy) {
      case 'price-low':
        return priceA - priceB;
      case 'price-high':
        return priceB - priceA;
      case 'popular':
        return b.id - a.id; // Placeholder logic
      default: // newest
        return b.id - a.id;
    }
  });

  return (
    <div className="w-full space-y-6">
      {/* Filter Bar - Desktop (only show when used standalone without external props) */}
      {!searchTerm && sortBy === 'newest' && selectedBrands.length === 0 && (
        <div className="hidden md:block">
          <FilterBar
            sortBy={internalSortBy}
            setSortBy={setInternalSortBy}
            selectedBrands={internalSelectedBrands}
            setSelectedBrands={setInternalSelectedBrands}
            selectedColors={internalSelectedColors}
            setSelectedColors={setInternalSelectedColors}
            priceRange={internalPriceRange}
            setPriceRange={setInternalPriceRange}
            className="mb-6"
          />
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 text-center sm:text-left">
        <h2 className="text-xl sm:text-[1.4rem] font-bold text-foreground">Sneaker Collection</h2>
        <Button
          onClick={() => navigate('/full-catalog')}
          className="flex items-center justify-center gap-2 btn-hover-glow text-sm w-full sm:w-auto"
        >
          Shop All Sneakers
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory touch-pan-x scrollbar-thin scrollbar-track-muted/20 scrollbar-thumb-muted-foreground/50 hover:scrollbar-thumb-muted-foreground/80"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          scrollBehavior: 'smooth',
        }}
      >
        {filteredSneakers.map((sneaker, index) => (
          <div key={sneaker.id} className="flex-shrink-0 w-48 sm:w-56 md:w-64 snap-center">
            <ProductCard
              sneaker={sneaker}
              index={index}
              onViewProduct={handleViewProduct}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SneakerCarousel; 