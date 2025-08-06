import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

interface Brand {
  id: number;
  name: string;
  logo: string;
  image: string;
  color: string;
}

const BrandCards = () => {
  const navigate = useNavigate();

  const brands: Brand[] = [
    {
      id: 1,
      name: 'Rick Owens',
      logo: 'RO',
      image: '/lovable-uploads/26a26a51-3a01-4611-b2fa-734fba29526b.png',
      color: 'bg-brand-charcoal'
    },
    {
      id: 2,
      name: 'Nike',
      logo: 'NIKE',
      image: '/lovable-uploads/6f2d9f14-f4c9-4f0f-a0f7-7ebbada9cb46.png',
      color: 'bg-brand-black'
    },
    {
      id: 3,
      name: 'Maison Margiela',
      logo: 'MM',
      image: '/lovable-uploads/1e141ffa-8795-4656-9fe4-3fa91464589b.png',
      color: 'bg-brand-yellow'
    },
    {
      id: 4,
      name: 'Jordan',
      logo: 'JORDAN',
      image: '/lovable-uploads/29149801-446e-4423-8a4b-73bad7e16eac.png',
      color: 'bg-brand-charcoal'
    },
    {
      id: 5,
      name: 'Louis Vuitton',
      logo: 'LV',
      image: '/lovable-uploads/5f31d87b-9d4e-4776-869a-7e690b4b196c.png',
      color: 'bg-brand-black'
    }
  ];

  const handleBrandClick = (brand: Brand) => {
    // Navigate to full catalog with brand filter
    navigate(`/full-catalog?brand=${encodeURIComponent(brand.name)}`);
  };

  const getBrandFilteredSneakers = (brandName: string) => {
    // This would be replaced with actual sneaker data filtering
    // For now, return a placeholder count
    return brandName === 'Rick Owens' ? 4 : 
           brandName === 'Nike' ? 2 : 
           brandName === 'Maison Margiela' ? 1 : 
           brandName === 'Jordan' ? 3 : 
           brandName === 'Louis Vuitton' ? 0 : 0;
  };

  return (
    <div className="w-full">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 text-center sm:text-left">Explore By Brand</h2>
      
      {/* Horizontal Scrollable Container */}
      <div className="relative">
        <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory touch-pan-x scrollbar-thin scrollbar-track-muted/20 scrollbar-thumb-muted-foreground/50 hover:scrollbar-thumb-muted-foreground/80">
          {brands.map((brand, index) => (
            <div
              key={brand.id}
              onClick={() => handleBrandClick(brand)}
              className="group cursor-pointer flex-shrink-0 snap-center relative"
              style={{
                '--hover-delay': `${index * 50}ms`
              } as React.CSSProperties}
            >
              <div className="relative h-64 sm:h-72 md:h-80 w-48 sm:w-56 md:w-64 md:group-hover:w-96 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl group-hover:scale-105 transition-all duration-300 ease-in-out">
                {/* Brand Background - Always Full Width */}
                <div 
                  className="absolute inset-0 w-full h-full bg-white"
                  style={{
                    backgroundImage: `url(${brand.image})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="absolute inset-0 bg-black/10" />
                
                {/* Fixed Text Container - Left Side */}
                <div className="absolute left-0 top-0 w-48 sm:w-56 md:w-64 h-full flex flex-col justify-between p-3 sm:p-4 z-30">
                  {/* Brand Logo - Fixed Position */}
                  <div className="flex-shrink-0">
                    <div className="px-2 py-1 sm:px-3 sm:py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-bold text-white">
                      {brand.logo}
                    </div>
                  </div>

                  {/* Brand Name - Fixed Position */}
                  <div className="flex-shrink-0">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-white">
                      {brand.name}
                    </h3>
                    {getBrandFilteredSneakers(brand.name) > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm opacity-75 text-white">
                          {getBrandFilteredSneakers(brand.name)} sneakers
                        </p>
                        <p className="text-xs text-white/80">
                          from $165
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shop Now Button - Bottom Right on Hover */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out transform translate-y-2 group-hover:translate-y-0 z-40">
                  <button 
                    className="bg-white/90 hover:bg-white text-black px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 backdrop-blur-sm transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBrandClick(brand);
                    }}
                  >
                    Shop Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Enhanced Hover Effects with Brand Colors */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-hsl(var(--brand-yellow))/20 group-hover:via-hsl(var(--brand-charcoal))/10 group-hover:to-hsl(var(--brand-black))/20 transition-all duration-300" />
                
                {/* Enhanced Sparkle Effects */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-1/4 left-1/4 animate-twinkle-enhanced">
                    <Sparkles className="w-4 h-4 text-brand-yellow" />
                  </div>
                  <div className="absolute top-1/3 right-1/3 animate-twinkle-enhanced delay-100">
                    <Sparkles className="w-3 h-3 text-brand-yellow" />
                  </div>
                  <div className="absolute bottom-1/3 left-1/3 animate-twinkle-enhanced delay-200">
                    <Sparkles className="w-2 h-2 text-brand-charcoal" />
                  </div>
                  <div className="absolute bottom-1/4 right-1/4 animate-twinkle-enhanced delay-300">
                    <Sparkles className="w-3 h-3 text-brand-yellow" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-twinkle-enhanced delay-150">
                    <Sparkles className="w-5 h-5 text-brand-yellow" />
                  </div>
                  <div className="absolute top-3/4 right-1/3 animate-twinkle-enhanced delay-250">
                    <Sparkles className="w-3 h-3 text-brand-black" />
                  </div>
                </div>

                {/* Brand Color Glow Effect */}
                <div className="absolute inset-0 rounded-lg group-hover:shadow-[0_0_30px_hsl(var(--brand-yellow))/40] transition-shadow duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandCards;