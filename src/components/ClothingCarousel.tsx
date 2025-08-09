
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
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
  
  // For now, just use the placeholder. Later this will fetch from API
  const clothingProducts = [placeholderTee];

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

      {/* Horizontal Scrollable Container */}
      <div className="relative">
        <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory touch-pan-x scrollbar-thin scrollbar-track-muted/20 scrollbar-thumb-muted-foreground/50 hover:scrollbar-thumb-muted-foreground/80">
          {clothingProducts.map((product, index) => (
            <div key={product.id} className="flex-shrink-0 snap-center w-48 sm:w-56 md:w-64">
              <ProductCard
                sneaker={product}
                index={index}
                onViewProduct={onViewProduct}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClothingCarousel;
