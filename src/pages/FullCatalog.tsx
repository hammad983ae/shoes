
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import ProductCard from '@/components/ProductCard';
import ViewProductModal from '@/components/ViewProductModal';
import SignupIncentiveModal from '@/components/SignupIncentiveModal';
import FullCatalogNavBar from '@/components/FullCatalogNavBar';
import RequestNewItemsCard from '@/components/RequestNewItemsCard';
import { sneakerCatalog } from '@/components/SneakerCatalog';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { isFirstProductView } from '@/utils/authUtils';
import InteractiveParticles from '@/components/InteractiveParticles';
import { Sneaker } from '@/types/global';

// Extend sneaker catalog with category data (temporary until DB update)
const extendedCatalog = sneakerCatalog.map(sneaker => ({
  ...sneaker,
  category: 'Shoes' // All current items are shoes
}));

const FullCatalog = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Sneaker | null>(null);
  const [showIncentiveModal, setShowIncentiveModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Sneaker | null>(null);
  const [filters, setFilters] = useState({
    categories: [] as string[],
    brands: [] as string[],
    colors: [] as string[],
    priceRange: [0, 1000] as [number, number]
  });
  const { getFavoriteProducts } = useFavorites();
  const { user } = useAuth();

  // Handle URL parameters for brand filtering and auto-open product modal
  useEffect(() => {
    const productParam = searchParams.get('product');
    
    // Auto-open product modal if product ID is provided
    if (productParam) {
      const product = extendedCatalog.find(s => s.id.toString() === productParam);
      if (product) {
        handleViewProduct(product);
      }
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

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const filteredAndSortedProducts = (() => {
    // Filter products
    let filtered = extendedCatalog.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filters.categories.length === 0 || 
        filters.categories.includes(product.category);
      
      const matchesBrand = filters.brands.length === 0 || 
        filters.brands.includes(product.brand);
      
      const matchesColor = filters.colors.length === 0 || 
        (product.colors && product.colors.some((color: string) => 
          filters.colors.some(filterColor => 
            color.toLowerCase().includes(filterColor.toLowerCase()) ||
            filterColor.toLowerCase().includes(color.toLowerCase())
          )
        ));
      
      const matchesPrice = product.price && 
        parseInt(product.price.replace('$', '')) >= filters.priceRange[0] && 
        parseInt(product.price.replace('$', '')) <= filters.priceRange[1];
      
      return matchesSearch && matchesCategory && matchesBrand && matchesColor && matchesPrice;
    });

    // Apply favorites filter if enabled
    if (showFavorites) {
      filtered = getFavoriteProducts(filtered as any);
    }

    return filtered;
  })();

  return (
    <div className="min-h-screen page-gradient relative">
      <InteractiveParticles isActive={true} />

      {/* Sidebar */}
      <Sidebar isOpen={true} onToggle={() => {}} onBackToHome={() => {}} />

      {/* Main content */}
      <div className="relative z-10 ml-0 md:ml-16">
        {/* Full Catalog Navigation Bar with Enhanced Filters */}
        <FullCatalogNavBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showFavorites={showFavorites}
          setShowFavorites={setShowFavorites}
          onFiltersChange={handleFiltersChange}
        />

        <div className="flex justify-center px-2 sm:px-4 py-4 sm:py-8 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6 max-w-screen-2xl w-full">
            {filteredAndSortedProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                sneaker={product} 
                index={index}
                onViewProduct={handleViewProduct}
              />
            ))}
            
            {/* Request New Items Card - Always appears at the end */}
            <div className="col-span-1">
              <RequestNewItemsCard />
            </div>
          </div>

          {filteredAndSortedProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">
                No products found matching your criteria.
              </p>
              <div className="max-w-sm mx-auto">
                <RequestNewItemsCard />
              </div>
            </div>
          )}
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

export default FullCatalog;
