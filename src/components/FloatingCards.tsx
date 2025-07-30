import { useEffect, useState } from 'react';

interface FloatingCardsProps {
  isBackground?: boolean;
}

const sneakerData: Array<{ id: number; image: string; price: string; name: string }> = [];

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
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center w-full">
          {sneakerData.map((sneaker) => (
            <div
              key={sneaker.id}
  className={`intro-card rounded-2xl p-4 w-64 h-80 transition-all duration-700 ${
    isVisible ? 'opacity-100' : 'opacity-0'
  } ${startFloating ? 'gentle-float' : ''}`}
  style={{
    transform: isVisible ? 'scale(1)' : 'scale(0.8)',
    animationDelay: '0s',
    animationName: isVisible ? 'fadeInScale' : 'none',
    animationDuration: '0.8s',
    animationFillMode: 'forwards',
    animationIterationCount: 1
  }}
            >
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center p-4">
                  <img 
                    src={sneaker.image} 
                    alt={sneaker.name}
                    className="product-image"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">
                    {sneaker.name}
                  </h3>
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