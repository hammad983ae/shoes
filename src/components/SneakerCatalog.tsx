import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ProductCard from '@/components/ProductCard';
import FilterPanel from '@/components/FilterPanel';
import ViewProductModal from '@/components/ViewProductModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Heart } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';

import sneaker1 from '@/assets/sneaker-1.jpg';
import sneaker2 from '@/assets/sneaker-2.jpg';
import sneaker3 from '@/assets/sneaker-3.jpg';
import sneaker4 from '@/assets/sneaker-4.jpg';
import sneaker5 from '@/assets/sneaker-5.jpg';
import sneaker6 from '@/assets/sneaker-6.jpg';

const sneakerCatalog = [
  { id: 1, image: sneaker1, price: '$180', name: 'Air Jordan Retro', category: 'Basketball' },
  { id: 2, image: sneaker2, price: '$120', name: 'Running Pro', category: 'Running' },
  { id: 3, image: sneaker3, price: '$200', name: 'Basketball Elite', category: 'Basketball' },
  { id: 4, image: sneaker4, price: '$140', name: 'Lifestyle Classic', category: 'Lifestyle' },
  { id: 5, image: sneaker5, price: '$160', name: 'Tech Runner', category: 'Running' },
  { id: 6, image: sneaker6, price: '$170', name: 'Vintage Court', category: 'Basketball' },
  { id: 7, image: sneaker1, price: '$185', name: 'Air Jordan High', category: 'Basketball' },
  { id: 8, image: sneaker2, price: '$125', name: 'Speed Runner', category: 'Running' },
  { id: 9, image: sneaker3, price: '$210', name: 'Pro Basketball', category: 'Basketball' },
  { id: 10, image: sneaker4, price: '$145', name: 'Urban Classic', category: 'Lifestyle' },
  { id: 11, image: sneaker5, price: '$165', name: 'Ultra Runner', category: 'Running' },
  { id: 12, image: sneaker6, price: '$175', name: 'Retro Court', category: 'Basketball' },
];

interface SneakerCatalogProps {
  onBackToHome?: () => void;
}

const SneakerCatalog = ({ onBackToHome }: SneakerCatalogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<typeof sneakerCatalog[0] | null>(null);
  const { getFavoriteProducts } = useFavorites();

  const filteredAndSortedSneakers = (() => {
    // Filter sneakers
    let filtered = sneakerCatalog.filter((sneaker) => {
      const matchesSearch = sneaker.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || sneaker.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Apply favorites filter if enabled
    if (showFavorites) {
      filtered = getFavoriteProducts(filtered);
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
          return b.id - a.id; // Assuming higher ID means newer
        case 'oldest':
          return a.id - b.id; // Assuming lower ID means older
        default:
          return 0;
      }
    });

    return sorted;
  })();

  return (
    <div className="min-h-screen bg-background relative">

      {/* Sidebar */}
      <Sidebar isOpen={true} onToggle={() => {}} onBackToHome={onBackToHome} />

      {/* Main content */}
      <div className="ml-16 md:ml-60 relative z-10">
        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border/50 z-50">
          <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Sneaker Collection</h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search sneakers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={showFavorites ? "default" : "outline"}
                  onClick={() => setShowFavorites(!showFavorites)}
                  className="flex items-center gap-2"
                >
                  <Heart className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
                  Show Favorites
                </Button>
                
                <FilterPanel 
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedSneakers.map((sneaker, index) => (
              <ProductCard 
                key={sneaker.id} 
                sneaker={sneaker} 
                index={index}
                onViewProduct={setSelectedProduct}
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
      
      {/* View Product Modal */}
      {selectedProduct && (
        <ViewProductModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          sneaker={selectedProduct}
          allSneakers={sneakerCatalog}
        />
      )}
    </div>
  );
};

export default SneakerCatalog;
