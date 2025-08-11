import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  img: string;           // raw src, not css url()
  link: string;
  brightness?: number;   // 1 = normal
  objectPosition?: string; // e.g., 'center 52%'
}

const HeaderCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  // Tweak these if needed
  const slides: Slide[] = [
    {
      id: 1,
      title: '',
      img: '/lovable-uploads/527a6055-20eb-4ac2-b9bb-b1038a398229.png',
      link: 'shop',
      brightness: 1.12,           // lift Slide 1 so it’s not darker
      objectPosition: 'center',   // centered framing
    },
    {
      id: 2,
      title: '',
      subtitle: '',
      img: '/lovable-uploads/ad6c6d80-e7d0-43f4-9393-b6bfb668d517.png',
      link: '/socials',
      brightness: 1,              // leave as-is
      objectPosition: 'center 52%'// tiny downward bias to avoid top crop
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) goToNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [isTransitioning, currentSlide]);

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
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
    const link = slides[currentSlide].link;
    if (link === 'shop') navigate('/full-catalog');
    else navigate(link);
  };

  return (
    <div className="relative w-screen h-[480px] overflow-hidden ml-0 md:-ml-16">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                isActive
                  ? 'opacity-100 translate-x-0'
                  : index < currentSlide
                  ? 'opacity-0 -translate-x-full'
                  : 'opacity-0 translate-x-full'
              }`}
            >
              {/* Image layer: edge-to-edge, centered, no overlays */}
              <img
                src={slide.img}
                alt=""
                className="absolute inset-0 -z-10 w-full h-full object-cover"
                style={{
                  objectPosition: slide.objectPosition ?? 'center',
                  filter: `brightness(${slide.brightness ?? 1})`,
                }}
                draggable={false}
              />

              {/* Content (unchanged layout) */}
              <div
                className={`relative z-10 flex flex-col h-full text-white px-4 md:px-8 max-w-4xl mx-auto ${
                  slide.id === 1
                    ? 'items-center justify-center text-center'
                    : 'items-center justify-end pb-20 text-center' // lower on slide 2
                }`}
              >
                {slide.title && (
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                    {slide.title}
                  </h2>
                )}
                {slide.subtitle && (
                  <p className="text-base md:text-lg opacity-90 mb-6 max-w-2xl">
                    {slide.subtitle}
                  </p>
                )}

                {slide.id === 1 ? (
                  <button
                    onClick={handleSlideClick}
                    className="px-6 py-2 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    Shop Now
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSlideClick}
                      className="px-6 py-2 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 mb-4"
                    >
                      Join for Exclusive Access
                    </button>
                    <div className="text-white/80 text-sm">
                      Trusted by 1,000+ members
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots + Arrows */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
        <button
          onClick={goToPrevious}
          className="text-white hover:text-white/75 transition-all duration-200 flex items-center justify-center"
          disabled={isTransitioning}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
        </button>

        <div className="flex space-x-1 md:space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-colors duration-200 ${
                index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
              }`}
              style={{ width: 12, height: 12, minWidth: 12, minHeight: 12 }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          className="text-white hover:text-white/75 transition-all duration-200 flex items-center justify-center"
          disabled={isTransitioning}
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
        </button>
      </div>
    </div>
  );
};

export default HeaderCarousel;
