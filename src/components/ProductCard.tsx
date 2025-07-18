import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';
import { useState } from 'react';

interface Sneaker {
  id: number;
  image: string;
  price: string;
  name: string;
  category: string;
}

interface ProductCardProps {
  sneaker: Sneaker;
  index: number;
}

const ProductCard = ({ sneaker, index }: ProductCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
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
        <div className="relative overflow-hidden">
          <img 
            src={sneaker.image} 
            alt={sneaker.name}
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Heart Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </Button>
          
          {/* Quick Add Button */}
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isAdded}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isAdded ? 'Added!' : 'Add to Cart'}
            </Button>
          </div>
        </div>
        
        {/* Product Info */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {sneaker.name}
            </h3>
            <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              {sneaker.category}
            </span>
          </div>
          <p className="text-xl font-bold text-primary mb-4">
            {sneaker.price}
          </p>
          
          {/* Size Selection */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[7, 8, 9, 10, 11, 12].map(size => (
              <button
                key={size}
                className="w-8 h-8 rounded border border-border hover:border-primary hover:bg-primary/10 text-sm transition-colors"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;