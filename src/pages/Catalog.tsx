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

  useEffect(() => {
    const brandParam = searchParams.get('brand');
    if (brandParam) {
      console.log('Brand filter:', brandParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen page-gradient relative">
      <InteractiveParticles isActive={true} />

      {/* Sidebar (Persistent) */}
      <Sidebar isOpen={true} onToggle={() => {}} onBackToHome={() => {}} />

      {/* Main Page Content */}
      <div className="relative z-10 ml-0 md:ml-16">
        
        {/* Sticky Search + Cart NavBar with Top Margin for Announcement */}
        <div className="mt-[40px]">
          <MainCatalogNavBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>

        {/* Hero Image Header */}
        <HeaderCarousel />

        {/* Sneaker Collection */}
        <section className="px-2 sm:px-4 py-4 sm:py-8">
          <SneakerCarousel />
        </section>

        {/* Clothing Collection */}
        <section className="px-2 sm:px-4 py-4 sm:py-8">
          <ClothingCarousel />
        </section>

        {/* Brand Cards */}
        <section className="px-2 sm:px-4 py-4 sm:py-8">
          <BrandCards />
        </section>
        
      </div>
    </div>
  );
};

export default Catalog;
