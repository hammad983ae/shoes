
import { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { useNavigate } from 'react-router-dom';
import { sneakerCatalog } from '@/components/SneakerCatalog';
import { Sneaker } from '@/types/global';

interface SneakerCarouselProps {
  onViewProduct: (sneaker: Sneaker) => void;
}

const SneakerCarousel = ({ onViewProduct }: SneakerCarouselProps) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? sneakerCatalog.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === sneakerCatalog.length - 1 ? 0 : prev + 1));
  };

  const handleShopAll = () => {
    navigate('/full-catalog?category=Shoes');
  };

  return (
    <div className="w-full">
      {/* Header with title and Shop All button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Sneaker Collection
          </h2>
          <p className="text-muted-foreground">
            Discover our curated sneaker selection
          </p>
        </div>
        <Button 
          onClick={handleShopAll}
          className="btn-hover-glow group"
          variant="outline"
        >
          Shop All Sneakers
          <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Navigation Arrows */}
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

        {/* Sneakers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
          {sneakerCatalog.map((sneaker, index) => (
            <ProductCard 
              key={sneaker.id} 
              sneaker={sneaker} 
              index={index}
              onViewProduct={onViewProduct}
            />
          ))}
        </div>

        {/* Dots indicator for mobile */}
        <div className="flex justify-center mt-4 space-x-2 sm:hidden">
          {Array.from({ length: Math.ceil(sneakerCatalog.length / 2) }).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === Math.floor(currentIndex / 2) ? 'bg-primary' : 'bg-muted'
              }`}
              onClick={() => setCurrentIndex(index * 2)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SneakerCarousel;
