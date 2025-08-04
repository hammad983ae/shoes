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
      image: 'https://images.unsplash.com/photo-1549298916-b41d114d2c36?w=300&h=400&fit=crop',
      color: 'bg-gray-900'
    },
    {
      id: 2,
      name: 'Nike',
      logo: 'NIKE',
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=400&fit=crop',
      color: 'bg-black'
    },
    {
      id: 3,
      name: 'Maison Margiela',
      logo: 'MM',
      image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&h=400&fit=crop',
      color: 'bg-white'
    },
    {
      id: 4,
      name: 'Jordan',
      logo: 'JORDAN',
      image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=300&h=400&fit=crop',
      color: 'bg-red-600'
    },
    {
      id: 5,
      name: 'Louis Vuitton',
      logo: 'LV',
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=400&fit=crop',
      color: 'bg-amber-600'
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
        {brands.map((brand) => (
          <div
            key={brand.id}
            onClick={() => handleBrandClick(brand)}
            className="brand-card-container group cursor-pointer"
          >
            <div className={`relative h-80 rounded-lg overflow-hidden ${brand.color} shadow-lg hover:shadow-xl transition-shadow duration-300`}>
              {/* Brand Logo */}
              <div className="absolute top-4 left-4 z-10">
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  brand.color === 'bg-white' ? 'text-black' : 'text-white'
                }`}>
                  {brand.logo}
                </div>
              </div>

              {/* Brand Image */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${brand.image})`,
                }}
              />

              {/* Brand Name */}
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className={`text-lg font-bold ${
                  brand.color === 'bg-white' ? 'text-black' : 'text-white'
                }`}>
                  {brand.name}
                </h3>
                <p className={`text-sm opacity-75 ${
                  brand.color === 'bg-white' ? 'text-black' : 'text-white'
                }`}>
                  {getBrandFilteredSneakers(brand.name)} sneakers
                </p>
              </div>

              {/* Enhanced Hover Effects with Brand Colors */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent group-hover:from-hsl(var(--brand-yellow))/20 group-hover:via-hsl(var(--brand-charcoal))/10 group-hover:to-hsl(var(--brand-black))/20 transition-all duration-500" />
              
              {/* Dynamic Sparkle Effects */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-1/4 left-1/4 animate-shimmer">
                  <Sparkles className="w-4 h-4" style={{ color: 'hsl(var(--brand-yellow))' }} />
                </div>
                <div className="absolute top-1/3 right-1/3 animate-twinkle delay-100">
                  <Sparkles className="w-3 h-3" style={{ color: 'hsl(var(--brand-yellow))' }} />
                </div>
                <div className="absolute bottom-1/3 left-1/3 animate-shimmer delay-200">
                  <Sparkles className="w-2 h-2" style={{ color: 'hsl(var(--brand-charcoal))' }} />
                </div>
                <div className="absolute bottom-1/4 right-1/4 animate-twinkle delay-300">
                  <Sparkles className="w-3 h-3" style={{ color: 'hsl(var(--brand-yellow))' }} />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-shimmer delay-150">
                  <Sparkles className="w-5 h-5" style={{ color: 'hsl(var(--brand-yellow))' }} />
                </div>
              </div>

              {/* Brand Color Glow Effect */}
              <div className="absolute inset-0 rounded-lg group-hover:shadow-[0_0_30px_hsl(var(--brand-yellow)/0.4)] transition-shadow duration-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandCards;