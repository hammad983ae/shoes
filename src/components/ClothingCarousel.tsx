
import { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { useNavigate } from 'react-router-dom';
import { Sneaker } from '@/types/global';

// Placeholder t-shirt product
const placeholderTee: Sneaker = {
  id: 999,
  name: 'Placeholder Tee',
  price: '$0',
  image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center',
  images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center'],
  brand: 'TBD',
  category: 'Shirts',
  description: 'Coming soon - placeholder item',
  inStock: false,
  sizing: 'US',
  colors: ['black'],
  type: 'shirt'
};

interface ClothingCarouselProps {
  onViewProduct: (product: Sneaker) => void;
}

const ClothingCarousel = ({ onViewProduct }: ClothingCarouselProps) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // For now, just use the placeholder. Later this will fetch from API
  const clothingProducts = [placeholderTee];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? clothingProducts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === clothingProducts.length - 1 ? 0 : prev + 1));
  };

  const handleShopAll = () => {
    const clothingCategories = [
      'Shirts', 'Hoodies', 'Jackets', 'Pants', 'Jeans', 
      'Sweatpants', 'Shorts', 'Sweaters/Knits', 'Hats', 'Accessories', 'Socks'
    ];
    const categoryParam = clothingCategories.join(',');
    navigate(`/full-catalog?category=${encodeURIComponent(categoryParam)}`);
  };

  return (
    <div className="w-full">
      {/* Header with title and Shop All button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Clothing Collection
          </h2>
          <p className="text-muted-foreground">
            Discover our curated clothing selection
          </p>
        </div>
        <Button 
          onClick={handleShopAll}
          className="btn-hover-glow group"
          variant="outline"
        >
          Shop All Clothing
          <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Navigation Arrows */}
        {clothingProducts.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background/90 btn-hover-glow"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background/90 btn-hover-glow"
              onClick={handleNext}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
          {clothingProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              sneaker={product}
              index={index}
              onViewProduct={onViewProduct}
            />
          ))}
        </div>

        {/* Dots indicator for mobile */}
        {clothingProducts.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2 sm:hidden">
            {clothingProducts.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary' : 'bg-muted'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClothingCarousel;
