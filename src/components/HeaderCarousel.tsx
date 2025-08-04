import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  backgroundImage: string;
  link: string;
}

const HeaderCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const slides: Slide[] = [
    {
      id: 1,
      title: "Website Launched – 20% Off All Sneakers Until August 19th",
      subtitle: "Limited time offer on all premium sneakers",
      backgroundImage: "linear-gradient(135deg, hsl(var(--brand-yellow)) 0%, hsl(var(--brand-charcoal)) 100%)",
      link: "promo"
    },
    {
      id: 2,
      title: "Join Our Telegram for Exclusive Bulk Purchase Deals",
      subtitle: "Get access to wholesale prices and early releases",
      backgroundImage: "linear-gradient(135deg, hsl(var(--brand-charcoal)) 0%, hsl(var(--brand-black)) 100%)",
      link: "/contact-us"
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        goToNext();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isTransitioning, currentSlide]);

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    // Seamless infinite scroll - no visual reset
    setCurrentSlide((prev) => {
      const nextSlide = (prev + 1) % slides.length;
      return nextSlide;
    });
    
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 300);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 300);
  };

  const handleSlideClick = () => {
    const currentLink = slides[currentSlide].link;
    
    if (currentLink === "promo") {
      // 20% Off Promo - check if user is logged in
      if (user) {
        navigate('/full-catalog');
      } else {
        navigate('/signin');
      }
    } else {
      // Direct navigation for other links
      navigate(currentLink);
    }
  };

  return (
    <div className="relative w-screen h-96 overflow-hidden ml-0 md:-ml-16">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              index === currentSlide
                ? 'opacity-100 translate-x-0'
                : index < currentSlide
                ? 'opacity-0 -translate-x-full'
                : 'opacity-0 translate-x-full'
            }`}
            style={{
              background: slide.backgroundImage,
            }}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4 md:px-8 max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p className="text-base md:text-lg opacity-90 mb-6 max-w-2xl">
                  {slide.subtitle}
                </p>
              )}
              <button
                onClick={handleSlideClick}
                className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                Learn More
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dots and Arrows Container */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
        {/* Left Arrow */}
        <button
          onClick={goToPrevious}
          className="text-white hover:text-white/75 transition-all duration-200"
          disabled={isTransitioning}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Dots */}
        <div className="flex space-x-1 md:space-x-2">
          {slides.map((_, index) => (
           <button
  key={index}
  onClick={() => goToSlide(index)}
  className={`rounded-full transition-all duration-200 ${
    index === currentSlide
      ? 'bg-white'
      : 'bg-white/50 hover:bg-white/75'
  } w-[8px] h-[8px] md:w-3 md:h-3`}
  aria-label={`Go to slide ${index + 1}`}
/>

          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={goToNext}
          className="text-white hover:text-white/75 transition-all duration-200"
          disabled={isTransitioning}
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default HeaderCarousel; 