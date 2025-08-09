
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import MainCatalogNavBar from '@/components/MainCatalogNavBar';
import HeaderCarousel from '@/components/HeaderCarousel';
import SneakerCarousel from '@/components/SneakerCarousel';
import ClothingCarousel from '@/components/ClothingCarousel';
import BrandCards from '@/components/BrandCards';
import FloatingCart from '@/components/FloatingCart';
import InteractiveParticles from '@/components/InteractiveParticles';

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Handle URL parameters - kept for potential future use
  useEffect(() => {
    const brandParam = searchParams.get('brand');
    // Could be used for search functionality in the future
    if (brandParam) {
      console.log('Brand filter:', brandParam);
    }
  }, [searchParams]);

  const handleUserInteraction = () => {
    if (!userInteracted) {
      setUserInteracted(true);
      setTimeout(() => setShowFloatingCart(true), 2000);
    }
  };

  return (
    <div className="min-h-screen page-gradient relative">
      <InteractiveParticles isActive={true} />

      {/* Sidebar */}
      <Sidebar isOpen={true} onToggle={() => {}} onBackToHome={() => {}} />

      {/* Main content */}
      <div className="relative z-10 ml-0 md:ml-16">
        {/* Main Catalog Navigation Bar - No filters */}
        <MainCatalogNavBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Header Carousel */}
        <HeaderCarousel />

        {/* Sneaker Collection */}
        <div className="px-2 sm:px-4 py-4 sm:py-8" onScroll={handleUserInteraction} onClick={handleUserInteraction}>
          <SneakerCarousel />
        </div>

        {/* Clothing Collection */}
        <div className="px-2 sm:px-4 py-4 sm:py-8" onScroll={handleUserInteraction} onClick={handleUserInteraction}>
          <ClothingCarousel />
        </div>

        {/* Brand Cards Section */}
        <div className="px-2 sm:px-4 py-4 sm:py-8">
          <BrandCards />
        </div>
      </div>
      
      {/* Floating Cart */}
      <FloatingCart show={showFloatingCart} />
    </div>
  );
};

export default Catalog;
