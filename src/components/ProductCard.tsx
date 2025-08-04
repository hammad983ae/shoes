import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Heart } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useState } from 'react';


interface Sneaker {
  id: number;
  images: string[];
  price: string;
  name: string;
  category: string;
}

interface ProductCardProps {
  sneaker: Sneaker;
  index: number;
  onViewProduct?: (sneaker: Sneaker) => void;
}

const ProductCard = ({ sneaker, index, onViewProduct }: ProductCardProps) => {
  const { toggleFavorite, isFavorite } = useFavorites();

  const handleViewProduct = () => {
    onViewProduct?.(sneaker);
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const totalImages = sneaker.images.length;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  return (
    <Card 
      className="product-card group cursor-pointer border-0 overflow-hidden"
      style={{
        animationDelay: `${index * 0.1}s`,
        animationName: 'fadeInUp',
        animationDuration: '0.6s',
        animationFillMode: 'both'
      }}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden" style={{ aspectRatio: '2/3' }}>
          {/* Carousel Container */}
          <div className="carousel-container">
            <div 
              className="carousel-track"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`
              }}
            >
              {sneaker.images.map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt={sneaker.name}
                  className="carousel-image"
                />
              ))}
            </div>
          </div>
          {/* Carousel Controls */}
          {totalImages > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 z-20 transition-transform duration-200 hover:scale-110 active:scale-95"
                onClick={handlePrev}
                aria-label="Previous image"
              >
                &#8592;
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 z-20 transition-transform duration-200 hover:scale-110 active:scale-95"
                onClick={handleNext}
                aria-label="Next image"
              >
                &#8594;
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                {sneaker.images.map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-primary' : 'bg-gray-400'} inline-block`}
                  />
                ))}
              </div>
            </>
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
          {/* Heart Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 btn-hover-glow"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(sneaker.id);
            }}
          >
            <Heart className={`w-4 h-4 ${isFavorite(sneaker.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </Button>
          {/* View Product Button */}
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 z-30">
            <Button
              onClick={(e) => {
                e.stopPropagation();
              handleViewProduct();
              }}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 btn-hover-glow"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Product
            </Button>
          </div>
        </div>
        {/* Product Info */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2 max-h-[2.5em]">
              {sneaker.name}
            </h3>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              {sneaker.brand}
            </span>
          </div>
          <p className="text-lg font-bold text-primary mb-2">
            {sneaker.price}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;