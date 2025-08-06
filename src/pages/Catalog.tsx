import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import ViewProductModal from '@/components/ViewProductModal';
import SignupIncentiveModal from '@/components/SignupIncentiveModal';
import MainCatalogNavBar from '@/components/MainCatalogNavBar';
import HeaderCarousel from '@/components/HeaderCarousel';
import SneakerCarousel from '@/components/SneakerCarousel';
import BrandCards from '@/components/BrandCards';
import FloatingCart from '@/components/FloatingCart';
// import { sneakerCatalog } from '@/components/SneakerCatalog';
// import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { isFirstProductView } from '@/utils/authUtils';
import InteractiveParticles from '@/components/InteractiveParticles';
import { Sneaker } from '@/types/global';

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Sneaker | null>(null);
  const [showIncentiveModal, setShowIncentiveModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Sneaker | null>(null);
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const { user } = useAuth();

  // Handle URL parameters - kept for potential future use
  useEffect(() => {
    const brandParam = searchParams.get('brand');
    // Could be used for search functionality in the future
    if (brandParam) {
      console.log('Brand filter:', brandParam);
    }
  }, [searchParams]);

  const handleViewProduct = (sneaker: Sneaker) => {
    console.log('handleViewProduct called for:', sneaker.name);
    handleUserInteraction();
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

  const handleUserInteraction = () => {
    if (!userInteracted) {
      setUserInteracted(true);
      setTimeout(() => setShowFloatingCart(true), 2000);
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
      <div className="relative z-10 ml-0 md:ml-16">
        {/* Main Catalog Navigation Bar */}
        <MainCatalogNavBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Header Carousel */}
        <HeaderCarousel />

        <div className="px-2 sm:px-4 py-4 sm:py-8" onScroll={handleUserInteraction} onClick={handleUserInteraction}>
          <SneakerCarousel onViewProduct={handleViewProduct} />
        </div>

        {/* Brand Cards Section */}
        <div className="px-2 sm:px-4 py-4 sm:py-8">
          <BrandCards />
        </div>
      </div>
      
      {/* Floating Cart */}
      <FloatingCart show={showFloatingCart} />
      
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