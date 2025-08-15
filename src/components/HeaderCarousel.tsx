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

  // Updated slides with new content and styling
  const slides: Slide[] = [
    {
      id: 1,
      title: 'WEBSITE LAUNCHED',
      subtitle: 'It\'s official Crallux Sells is live. Invite your friends, get rewarded.',
      img: '/lovable-uploads/0514b193-6898-4fd5-96ad-078fb325cdae.png',
      link: 'shop',
      brightness: 1.12,           // lift Slide 1 so it's not darker
      objectPosition: 'center',   // centered framing
    },
    {
      id: 2,
      title: 'JOIN OUR TELEGRAM TO UNLOCK WHOLESALE DEALS',
      subtitle: 'Get exclusive access to wholesale pricing and bulk discounts',
      img: '/lovable-uploads/5bf1e999-602b-47ad-9de8-c862124d9496.png',
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

              {/* Content with enhanced styling like the reference image */}
              <div
                className={`relative z-10 flex flex-col h-full text-white px-4 md:px-8 max-w-5xl mx-auto ${
                  slide.id === 1
                    ? 'items-start justify-center'
                    : 'items-start justify-center'
                }`}
              >
                {/* NEW DROP badge for first slide */}
                {slide.id === 1 && (
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-4 py-1 rounded-full text-xs font-bold mb-6 uppercase tracking-wide">
                    NEW DROP
                  </div>
                )}
                
                {slide.title && (
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight tracking-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
                    {slide.id === 1 ? (
                      <>
                        <span className="text-white">WEBSITE</span>
                        <br />
                        <span className="text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
                          LAUNCHED
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-white">JOIN OUR</span>
                        <br />
                        <span className="text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
                          TELEGRAM
                        </span>
                        <br />
                                                 <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent text-2xl md:text-3xl lg:text-4xl">
                           TO UNLOCK WHOLESALE DEALS
                         </span>
                      </>
                    )}
                  </h1>
                )}
                
                {slide.subtitle && (
                  <p className="text-lg md:text-xl text-white/90 mb-8 max-w-lg leading-relaxed" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                    {slide.subtitle}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  {slide.id === 1 ? (
                    <>
                      <button
                        onClick={handleSlideClick}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-4 font-bold rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 group"
                      >
                        Shop Now
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => navigate('/credits')}
                        className="border-2 border-white text-white px-8 py-4 font-semibold rounded-lg hover:bg-white hover:text-black transition-all duration-200"
                      >
                        Refer a Friend
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSlideClick}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-4 font-bold rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 flex items-center gap-2 group"
                      >
                        Join Telegram
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      
                    </>
                  )}
                </div>

                                 {/* Rating and reviews section */}
                 {slide.id === 1 ? (
                   <div className="flex items-center gap-6">
                     <div className="flex items-center gap-2">
                       <div className="flex text-yellow-400">
                         {[1,2,3,4,5].map((star) => (
                           <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                             <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                           </svg>
                         ))}
                       </div>
                       <span className="text-white font-semibold" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>5.0 Rating</span>
                     </div>
                     <div className="text-white/80" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                       <span className="font-bold">250+</span> Reviews
                     </div>
                   </div>
                 ) : (
                   <div className="text-white/90 text-lg md:text-xl font-semibold" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                     Growing to become the best hub for resellers
                   </div>
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