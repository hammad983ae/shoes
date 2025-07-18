import { useEffect, useState } from 'react';
import sneaker1 from '@/assets/sneaker-1.jpg';
import sneaker2 from '@/assets/sneaker-2.jpg';
import sneaker3 from '@/assets/sneaker-3.jpg';
import sneaker4 from '@/assets/sneaker-4.jpg';

interface FloatingCardsProps {
  isBackground?: boolean;
}

const sneakerData = [
  { id: 1, image: sneaker1, price: '$180', name: 'Air Jordan Retro' },
  { id: 2, image: sneaker2, price: '$120', name: 'Running Pro' },
  { id: 3, image: sneaker3, price: '$200', name: 'Basketball Elite' },
  { id: 4, image: sneaker4, price: '$140', name: 'Lifestyle Classic' },
];

const FloatingCards = ({ isBackground = false }: FloatingCardsProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [startFloating, setStartFloating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    // Start gentle floating after fade-in completes
    const floatTimer = setTimeout(() => setStartFloating(true), 1000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(floatTimer);
    };
  }, []);

  return (
    <div 
      className={`absolute inset-0 transition-all duration-1000 ${
        isBackground ? 'blur-background' : ''
      }`}
      style={{
        animation: isBackground ? 'blurOut 1s ease-out forwards' : 'none'
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="flex gap-8">
          {sneakerData.map((sneaker, index) => (
            <div
              key={sneaker.id}
              className={`intro-card rounded-2xl p-4 w-64 h-80 transition-all duration-700 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              } ${startFloating ? 'gentle-float' : ''}`}
              style={{
                transform: isVisible ? 'scale(1)' : 'scale(0.8)',
                animationDelay: `${index * 0.2}s`,
                animationName: isVisible ? 'fadeInScale' : 'none',
                animationDuration: '0.8s',
                animationFillMode: 'both'
              }}
            >
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center p-4">
                  <img 
                    src={sneaker.image} 
                    alt={sneaker.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {sneaker.name}
                  </h3>
                  <p className="text-xl font-bold text-primary">
                    {sneaker.price}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FloatingCards;