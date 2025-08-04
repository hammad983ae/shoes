import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import ViewProductModal from '@/components/ViewProductModal';
import SignupIncentiveModal from '@/components/SignupIncentiveModal';
import StickyNavBar from '@/components/StickyNavBar';
import HeaderCarousel from '@/components/HeaderCarousel';
import SneakerCarousel from '@/components/SneakerCarousel';
import BrandCards from '@/components/BrandCards';
// import { sneakerCatalog } from '@/components/SneakerCatalog';
// import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { isFirstProductView } from '@/utils/authUtils';
import InteractiveParticles from '@/components/InteractiveParticles';
import { Sneaker } from '@/types/global';

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Sneaker | null>(null);
  const [showIncentiveModal, setShowIncentiveModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Sneaker | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  // const { getFavoriteProducts } = useFavorites();
  const { user } = useAuth();

  // Handle URL parameters for brand filtering
  useEffect(() => {
    const brandParam = searchParams.get('brand');
    if (brandParam) {
      setSelectedBrands([brandParam]);
    }
  }, [searchParams]);

  const handleViewProduct = (sneaker: Sneaker) => {
    console.log('handleViewProduct called for:', sneaker.name);
    // Check if this is the first product view by an unsigned user
    if (isFirstProductView(!!user)) {
      console.log('Showing incentive modal for unsigned user');
      setPendingProduct(sneaker);
      setShowIncentiveModal(true);
    } else {
      console.log('Setting selected product:', sneaker.name);
      setSelectedProduct(sneaker);
    }
  };

  const handleContinueToProduct = () => {
    if (pendingProduct) {
      setSelectedProduct(pendingProduct);
      setPendingProduct(null);
    }
  };

  // Removed unused filteredAndSortedSneakers variable
  // Component renders SneakerCarousel instead of filtering logic

  return (
    <div className="min-h-screen page-gradient relative">
      <InteractiveParticles isActive={true} />

      {/* Sidebar */}
      <Sidebar isOpen={true} onToggle={() => {}} onBackToHome={() => {}} />

      {/* Main content */}
      <div className="relative z-10 md:ml-16">
        {/* Sticky Navigation Bar */}
        <StickyNavBar
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

        {/* Header Carousel */}
        <HeaderCarousel />

        <div className="px-4 py-8">
          <SneakerCarousel onViewProduct={handleViewProduct} />
        </div>

        {/* Brand Cards Section */}
        <div className="px-4 py-8">
          <BrandCards />
        </div>
      </div>
      
      {/* View Product Modal */}
      {selectedProduct && (
        <ViewProductModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          sneaker={selectedProduct}
        />
      )}

      {/* Signup Incentive Modal */}
      <SignupIncentiveModal
        isOpen={showIncentiveModal}
        onClose={() => setShowIncentiveModal(false)}
        onContinue={handleContinueToProduct}
      />
    </div>
  );
};

export default Catalog; 