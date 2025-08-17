import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ProductCard from '@/components/ProductCard';
import FilterPanel from '@/components/FilterPanel';
import ViewProductModal from '@/components/ViewProductModal';
import SignupIncentiveModal from '@/components/SignupIncentiveModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Heart } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { isFirstProductView } from '@/utils/authUtils';
import InteractiveParticles from '@/components/InteractiveParticles';
import { Sneaker } from '@/types/global';
import { useDynamicProducts } from '@/hooks/useDynamicProducts';

import maison1 from '@/assets/Product Images/Mason Margiela Gum Sole Sneakers/Maison Margiela Gum Sole Product IMG 1.png';
import maison2 from '@/assets/Product Images/Mason Margiela Gum Sole Sneakers/Maison Margiela Gum Sole Product IMG 2.png';
import maison3 from '@/assets/Product Images/Mason Margiela Gum Sole Sneakers/Maison Margiela Gum Sole Product IMG 3.png';
import maison4 from '@/assets/Product Images/Mason Margiela Gum Sole Sneakers/Maison Margiela Gum Sole Product IMG 4.png';
import rick1 from '@/assets/Product Images/DRKSHDW Rick Owens Vans/DRKSHDW Rick Owens Vans Product IMG 1.jpeg';
import rick2 from '@/assets/Product Images/DRKSHDW Rick Owens Vans/DRKSHDW Rick Owens Vans Product IMG 2.jpeg';
import rick3 from '@/assets/Product Images/DRKSHDW Rick Owens Vans/DRKSHDW Rick Owens Vans Product IMG 3.jpeg';
import rick4 from '@/assets/Product Images/DRKSHDW Rick Owens Vans/DRKSHDW Rick Owens Vans Product IMG 4.jpeg';
import geobasket1 from '@/assets/Product Images/Rick Owens Geobaskets/Rick Owens Geobaskets Product IMG 1.png';
import geobasket2 from '@/assets/Product Images/Rick Owens Geobaskets/Rick Owens Geobaskets Product IMG 2.png';
import geobasket3 from '@/assets/Product Images/Rick Owens Geobaskets/Rick Owens Geobaskets Product IMG 3.png';
import geobasket4 from '@/assets/Product Images/Rick Owens Geobaskets/Rick Owens Geobaskets Product IMG 4.png';
import geobasket5 from '@/assets/Product Images/Rick Owens Geobaskets/Rick Owens Geobaskets Product IMG 5.png';
import travis1 from '@/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 1.png';
import travis2 from '@/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 2.png';
import travis3 from '@/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 3.png';
import travis4 from '@/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 4.png';
import travis5 from '@/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 5.png';
import travis6 from '@/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 6.png';
import travis7 from '@/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 7.png';

const sneakerCatalog = [
  {
    id: 1,
    name: 'DRKSHDW Rick Owens Vans',
    price: '$195',
    image: rick1,
    images: [rick4, rick3, rick2, rick1],
    brand: 'Rick Owens',
    category: 'Rick Owens',
    sizing: 'US',
    description: 'US sizing',
    productDescription: 'This isn\'t just a sneaker — it\'s a rebellion stitched in canvas. The Rick Owens DRKSHDW x Vans turns the classic skate shoe into a bold, brutalist silhouette. Featuring elongated tongues, oversized foxing, and Rick\'s signature monochrome chaos, this collab brings underground luxury to street-level wear. Built on the bones of the Vans Sk8-Hi and Authentic, this is for those who live outside the algorithm.',
    productFeatures: [
      'Iconic Silhouette, Mutated – Classic Vans DNA distorted through Rick\'s dystopian lens',
      'Overbuilt & Overdesigned – Extended rubber midsole, sharp lines, and DRKSHDW patch hits',
      'All Black Everything – A stealth statement with brutalist energy',
      'Streetwear Cred Certified – Worn by fashion disruptors, rockstars, and runway legends'
    ],
    productIncludes: [
      'Replica DRKSHDW Rick Owens Vans (Sk8-Hi or Authentic base, depending on release)',
      'Ships with box, extra laces, and authenticity details (where applicable)',
      'Verified sizing + construction to match original retail pairs'
    ],
    keywords: ['black', 'high-top', 'distressed', 'streetwear', 'avant-garde', 'collaboration'],
    colors: ['black'],
    type: 'high-top',
    availability: 'In Stock',
    shipping: '5-9 days',
    materials: 'Premium leather and canvas construction',
    care: 'Clean with soft brush, avoid water exposure',
    authenticity: 'High-quality alternative with premium materials and construction standards',
    quality: 'Premium materials sourced from quality suppliers'
  },
  {
    id: 2,
    name: 'Maison Margiela Gum Sole Sneakers',
    price: '$170',
    image: maison1,
    images: [maison4, maison3, maison2, maison1],
    brand: 'Maison Margiela',
    category: 'Maison Margiela',
    sizing: 'EU',
    description: 'EU sizing (US conversion in parentheses)',
    productDescription: 'The sneaker that does everything… without screaming for attention. The Maison Margiela Replica Gum Sole Sneakers blend quiet luxury with military precision. Inspired by vintage German Army Trainers (GATs), this silhouette is a minimalist essential elevated by buttery-soft leather, subtle suede overlays, and that signature caramel gum sole. A timeless flex for those who don\'t follow trends — they set them.',
    productFeatures: [
      'Luxury in Disguise – Clean silhouette, neutral tones, iconic blank label. People who know, know',
      'Gum Sole Grip & Style – Adds contrast, character, and traction — pairs effortlessly with cargos or tailored trousers',
      'Staple of Fashion Insiders – Worn by Virgil, Rocky, and top stylists worldwide',
      'Versatile as Hell – Streetwear? Business casual? Airport drip? These go with everything'
    ],
    productIncludes: [
      'Authentic Maison Margiela Gum Sole Replicas',
      'Ships with box, dust bag, and care info (if applicable)',
      'Verified style, sizing accuracy, and fast tracked delivery'
    ],
    keywords: ['white', 'low-top', 'gum sole', 'minimalist', 'deconstructed', 'premium'],
    colors: ['white'],
    type: 'low-top',
    availability: 'In Stock',
    shipping: '5-9 days',
    materials: 'Premium leather and gum sole construction',
    care: 'Clean with soft cloth, avoid harsh chemicals',
    authenticity: 'High-quality alternative with premium materials and construction standards',
    quality: 'Premium materials sourced from quality suppliers'
  },
  {
    id: 3,
    name: 'Rick Owens Geobaskets',
    price: '$200',
    image: geobasket1,
    images: [geobasket5, geobasket4, geobasket3, geobasket2, geobasket1],
    brand: 'Rick Owens',
    category: 'Rick Owens',
    sizing: 'EU',
    description: 'EU sizing (US conversion in parentheses)',
    productDescription: 'Not just sneakers — a statement. The Rick Owens Geobaskets are an underground icon in the fashion world. With their exaggerated silhouette, thick premium sole, and extended tongue design, these kicks scream avant-garde luxury. Whether you\'re street-styling or staying lowkey in black layers, these are for those who know.',
    productFeatures: [
      'Elite Build Quality – Crafted in Italy with genuine leather and unmatched attention to detail',
      'Recognizable Shape, Rare Sighting – The high collar, shark-tooth sole, and side zip scream Rick without ever needing a logo',
      'Worn by the Fashion Elite – Kanye, Playboi Carti, and fashion week regulars swear by these',
      'The Ultimate Flex for Minimalists – Loud design, quiet colorways — this is high fashion with edge'
    ],
    productIncludes: [
      'Authentic Rick Owens Geobasket sneakers',
      'Comes with original box & dust bag (where applicable)',
      'Verified details, accurate sizing, fast tracked shipping'
    ],
    keywords: ['black', 'high-top', 'leather', 'avant-garde', 'statement', 'premium'],
    colors: ['black'],
    type: 'high-top',
    availability: 'In Stock',
    shipping: '5-9 days',
    materials: 'Premium leather construction with signature design elements',
    care: 'Clean with leather cleaner, avoid water exposure',
    authenticity: 'High-quality alternative with premium materials and construction standards',
    quality: 'Premium materials sourced from quality suppliers'
  },
  {
    id: 4,
    name: 'Travis Scott x Jordan 1 Low OG "Reverse Mocha"',
    price: '$165',
    image: travis1,
    images: [travis7, travis6, travis5, travis4, travis3, travis2, travis1],
    brand: 'Nike',
    category: 'Nike',
    sizing: 'US',
    description: 'US sizing',
    productDescription: 'The hype is real — and it\'s not going anywhere. The Travis Scott Reverse Mocha Lows flip the script on one of the most iconic sneaker collabs of all time. Dressed in rich mocha suede, smooth white leather, and that unmistakable oversized reverse Swoosh, this pair is built to turn heads and hold value.',
    productFeatures: [
      'Signature Travis Aesthetic – Distressed earth tones + premium white leather = effortless flex',
      'Rare & Respected – Originally dropped in July 2022 with limited supply, these are one of the most coveted Jordan 1 Lows ever released',
      'Insane Outfits Only – Pairs clean with cargos, denim, or full gallery fits — these don\'t miss',
      'Built to Flip or Keep – Great resale history + long-term cultural clout'
    ],
    productIncludes: [
      'Brand-new pair of Travis Scott Reverse Mocha Lows',
      'Original packaging (box & inserts)',
      'Verified sizing, accurate detailing, and fast shipping'
    ],
    keywords: ['mocha', 'brown', 'low-top', 'collaboration', 'limited-edition', 'suede', 'leather'],
    colors: ['mocha', 'brown'],
    type: 'low-top',
    availability: 'In Stock',
    shipping: '5-9 days',
    materials: 'Premium suede and leather construction',
    care: 'Clean with suede brush, avoid water exposure',
    authenticity: 'High-quality alternative with premium materials and construction standards',
    quality: 'Premium materials sourced from quality suppliers'
  }
];
export { sneakerCatalog };

// Remove duplicate Sneaker interface - using global type

interface SneakerCatalogProps {
  onBackToHome?: () => void;
}

const SneakerCatalog = ({ onBackToHome }: SneakerCatalogProps) => {
  const { products: dynamicProducts } = useDynamicProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc'); // Default to alphabetical order
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Sneaker | null>(null);
  const [showIncentiveModal, setShowIncentiveModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Sneaker | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const { getFavoriteProducts } = useFavorites();
  const { user } = useAuth();
  
  // Use dynamic products if available, fallback to static catalog
  const catalogProducts = dynamicProducts.length > 0 ? dynamicProducts : sneakerCatalog;

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

  const filteredAndSortedSneakers = (() => {
    // Filter sneakers
    let filtered = (catalogProducts as any[]).filter((sneaker: any) => {
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
      filtered = getFavoriteProducts(filtered) as any[];
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
    <div className="min-h-screen page-gradient relative">
      <InteractiveParticles isActive={true} />

      {/* Sidebar */}
      <Sidebar isOpen={true} onToggle={() => {}} onBackToHome={onBackToHome} />

      {/* Main content */}
      <div className="relative z-10 md:ml-16 md:ml-20">
        <div className="sticky top-0 z-50 w-full flex">
          <div className="backdrop-blur-md border-b border-border/50 w-full flex-1">
            <div className="max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-8 py-6">
              <h1 className="text-3xl font-bold text-foreground mb-4">Sneaker Collection</h1>
              <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search sneakers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={showFavorites ? "default" : "outline"}
                    onClick={() => setShowFavorites(!showFavorites)}
                    className="flex items-center gap-2 btn-hover-glow"
                  >
                    <Heart className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
                    Show Favorites
                  </Button>
                  
                              <FilterPanel
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
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center px-2 sm:px-4 py-8 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 max-w-screen-2xl w-full">
            {filteredAndSortedSneakers.map((sneaker, index) => (
              <ProductCard 
                key={sneaker.id} 
                sneaker={sneaker} 
                index={index}
                onViewProduct={handleViewProduct}
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

export default SneakerCatalog;
