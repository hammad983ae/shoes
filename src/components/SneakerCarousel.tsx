
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { useNavigate } from 'react-router-dom';
import { useDynamicProducts } from '@/hooks/useDynamicProducts';

const SneakerCarousel = () => {
  const { products } = useDynamicProducts();
  const navigate = useNavigate();

  const handleShopAll = () => {
    navigate('/full-catalog?category=Shoes');
  };

  return (
    <div className="w-full">
      {/* Header with title and Shop All button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
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
          className="btn-hover-glow group flex items-center justify-center gap-2 w-full sm:w-auto"
          variant="outline"
        >
          <span>Shop All Sneakers</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      {/* Horizontal Scrollable Container */}
      <div className="relative">
        <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory touch-pan-x scrollbar-thin scrollbar-track-muted/20 scrollbar-thumb-muted-foreground/50 hover:scrollbar-thumb-muted-foreground/80" style={{ touchAction: 'pan-x pan-y' }}>
          {products.map((sneaker, index) => (
            <div key={sneaker.id} className="flex-shrink-0 snap-center w-48 sm:w-56 md:w-64">
              <ProductCard 
                sneaker={sneaker} 
                index={index}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SneakerCarousel;
