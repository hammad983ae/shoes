
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import MainCatalogNavBar from '@/components/MainCatalogNavBar';
import HeaderCarousel from '@/components/HeaderCarousel';
import SneakerCarousel from '@/components/SneakerCarousel';
import ClothingCarousel from '@/components/ClothingCarousel';
import BrandCards from '@/components/BrandCards';

import InteractiveParticles from '@/components/InteractiveParticles';

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  // Handle URL parameters - kept for potential future use
  useEffect(() => {
    const brandParam = searchParams.get('brand');
    // Could be used for search functionality in the future
    if (brandParam) {
      console.log('Brand filter:', brandParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen page-gradient relative">
      <InteractiveParticles isActive={true} />

      {/* Sidebar */}
      <Sidebar isOpen={true} onToggle={() => {}} onBackToHome={() => {}} />

      {/* Main content */}
      <div className="relative z-10 ml-0 md:ml-16">
        {/* Main Catalog Navigation Bar - Sticky */}
        <MainCatalogNavBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Header Carousel */}
        <HeaderCarousel />

        {/* Sneaker Collection */}
        <div className="px-2 sm:px-4 py-4 sm:py-8">
          <SneakerCarousel />
        </div>

        {/* Clothing Collection */}
        <div className="px-2 sm:px-4 py-4 sm:py-8">
          <ClothingCarousel />
        </div>

        {/* Brand Cards Section */}
        <div className="px-2 sm:px-4 py-4 sm:py-8">
          <BrandCards />
        </div>
      </div>
    </div>
  );
};

export default Catalog;
