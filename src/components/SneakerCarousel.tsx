import { useState, useEffect, useRef } from 'react';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sneakerCatalog } from './SneakerCatalog';

const SneakerCarousel = () => {
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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


  return (
    <div className="w-full space-y-6">
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
        {sneakerCatalog.map((sneaker, index) => (
          <div key={sneaker.id} className="flex-shrink-0 w-48 sm:w-56 md:w-64 snap-center">
            <ProductCard
              sneaker={sneaker}
              index={index}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SneakerCarousel;
