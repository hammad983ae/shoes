import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import ProductCard from '@/components/ProductCard';
import FullCatalogNavBar from '@/components/FullCatalogNavBar';
import { sneakerCatalog } from '@/components/SneakerCatalog';
import { useFavorites } from '@/contexts/FavoritesContext';
import InteractiveParticles from '@/components/InteractiveParticles';

const FullCatalog = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const { getFavoriteProducts } = useFavorites();

// Handle URL params for brand filtering
useEffect(() => {
  const brandParam = searchParams.get('brand');
  if (brandParam) {
    setSelectedBrands([brandParam]);
  }
}, [searchParams]);


  const filteredAndSortedSneakers = (() => {
    // Filter sneakers
    let filtered = (sneakerCatalog as any[]).filter((sneaker) => {
      const matchesSearch = sneaker.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || sneaker.category === selectedCategory;
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(sneaker.brand);
      const matchesColor = selectedColors.length === 0 || 
        sneaker.colors?.some((color: string) => selectedColors.includes(color));
      const matchesType = selectedTypes.length === 0 || 
        (sneaker.type && selectedTypes.includes(sneaker.type));
      const matchesPrice = sneaker.price && 
        parseInt(sneaker.price.replace('$', '')) >= priceRange[0] && 
        parseInt(sneaker.price.replace('$', '')) <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesBrand && matchesColor && matchesType && matchesPrice;
    });

    // Apply favorites filter if enabled
    if (showFavorites) {
      filtered = getFavoriteProducts(filtered as any);
    }

    // Sort sneakers
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-high':
          return parseInt(b.price.replace('$', '')) - parseInt(a.price.replace('$', ''));
        case 'price-low':
          return parseInt(a.price.replace('$', '')) - parseInt(b.price.replace('$', ''));
        case 'newest':
          return b.id - a.id;
        case 'oldest':
          return a.id - b.id;
        default:
          return 0;
      }
    });

    return sorted;
  })();

  return (
    <div className="min-h-screen page-gradient relative">
      <InteractiveParticles isActive={true} />

      {/* Sidebar */}
      <Sidebar isOpen={true} onToggle={() => {}} onBackToHome={() => {}} />

      {/* Main content */}
      <div className="relative z-10 ml-0 md:ml-16">
        {/* Full Catalog Navigation Bar */}
        <FullCatalogNavBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showFavorites={showFavorites}
          setShowFavorites={setShowFavorites}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          selectedBrands={selectedBrands}
          setSelectedBrands={setSelectedBrands}
          selectedColors={selectedColors}
          setSelectedColors={setSelectedColors}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
        />

        <div className="flex justify-center px-2 sm:px-4 py-4 sm:py-8 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6 max-w-screen-2xl w-full">
            {filteredAndSortedSneakers.map((sneaker, index) => (
              <ProductCard 
                key={sneaker.id} 
                sneaker={sneaker} 
                index={index}
              />
            ))}
          </div>

          {filteredAndSortedSneakers.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No sneakers found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default FullCatalog; 