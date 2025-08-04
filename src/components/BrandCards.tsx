import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

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
      image: 'linear-gradient(135deg, #FFD600 0%, #212121 50%, #101010 100%)',
      color: 'bg-brand-charcoal'
    },
    {
      id: 2,
      name: 'Nike',
      logo: 'NIKE',
      image: 'linear-gradient(135deg, #101010 0%, #FFD600 50%, #212121 100%)',
      color: 'bg-brand-black'
    },
    {
      id: 3,
      name: 'Maison Margiela',
      logo: 'MM',
      image: 'linear-gradient(135deg, #212121 0%, #101010 50%, #FFD600 100%)',
      color: 'bg-brand-yellow'
    },
    {
      id: 4,
      name: 'Jordan',
      logo: 'JORDAN',
      image: 'linear-gradient(135deg, #FFD600 0%, #101010 50%, #212121 100%)',
      color: 'bg-brand-charcoal'
    },
    {
      id: 5,
      name: 'Louis Vuitton',
      logo: 'LV',
      image: 'linear-gradient(135deg, #212121 0%, #FFD600 50%, #101010 100%)',
      color: 'bg-brand-black'
    }
  ];

  const handleBrandClick = (brand: Brand) => {
    // Navigate to filtered catalog with brand filter
    navigate(`/catalog?brand=${encodeURIComponent(brand.name)}`);
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
      <h2 className="text-2xl font-bold text-foreground mb-6">Explore By Brand</h2>
      <div className="brand-cards-grid">
        {brands.map((brand, index) => (
          <div
            key={brand.id}
            onClick={() => handleBrandClick(brand)}
            className="brand-card-container group cursor-pointer transition-all duration-300"
            style={{
              '--hover-delay': `${index * 50}ms`
            } as React.CSSProperties}
          >
            <div className="relative h-80 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 group-hover:w-[150%] group-hover:z-10">
              <div className="absolute inset-0 w-full h-full">
                {/* Brand Background */}
                <div 
                  className="absolute inset-0 w-full h-full"
                  style={{
                    background: brand.image,
                  }}
                />
                <div className="absolute inset-0 bg-black/30" />
                
                {/* Fixed Text Container */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 z-10">
                  {/* Brand Logo - Fixed Position */}
                  <div className="flex-shrink-0">
                    <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold text-white">
                      {brand.logo}
                    </div>
                  </div>

                  {/* Brand Name - Fixed Position */}
                  <div className="flex-shrink-0">
                    <h3 className="text-lg font-bold text-white">
                      {brand.name}
                    </h3>
                    <p className="text-sm opacity-75 text-white">
                      {getBrandFilteredSneakers(brand.name)} sneakers
                    </p>
                  </div>
                </div>

                {/* Enhanced Hover Effects with Brand Colors */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent group-hover:from-[#FFD600]/20 group-hover:via-[#212121]/10 group-hover:to-[#101010]/20 transition-all duration-500" />
                
                {/* Dynamic Sparkle Effects */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-1/4 left-1/4 animate-twinkle">
                    <Sparkles className="w-4 h-4 text-[#FFD600]" />
                  </div>
                  <div className="absolute top-1/3 right-1/3 animate-twinkle delay-100">
                    <Sparkles className="w-3 h-3 text-[#FFD600]" />
                  </div>
                  <div className="absolute bottom-1/3 left-1/3 animate-twinkle delay-200">
                    <Sparkles className="w-2 h-2 text-[#212121]" />
                  </div>
                  <div className="absolute bottom-1/4 right-1/4 animate-twinkle delay-300">
                    <Sparkles className="w-3 h-3 text-[#FFD600]" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-twinkle delay-150">
                    <Sparkles className="w-5 h-5 text-[#FFD600]" />
                  </div>
                </div>

                {/* Brand Color Glow Effect */}
                <div className="absolute inset-0 rounded-lg group-hover:shadow-[0_0_30px_#FFD600/40] transition-shadow duration-500" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandCards;