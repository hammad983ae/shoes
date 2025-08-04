import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sneakerCatalog } from '@/components/SneakerCatalog';
import { Sneaker } from '@/types/global';

interface MainCatalogNavBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const MainCatalogNavBar = ({
  searchTerm,
  setSearchTerm,
}: MainCatalogNavBarProps) => {
  const [showResults, setShowResults] = useState(false);
  const [filteredResults, setFilteredResults] = useState<Sneaker[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchTerm.trim()) {
      const results = sneakerCatalog.filter(sneaker =>
        sneaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sneaker.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sneaker.keywords?.some(keyword => 
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        )
      ).slice(0, 5); // Limit to 5 results
      
      setFilteredResults(results);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if click is outside search container
      if (searchRef.current && !searchRef.current.contains(target)) {
        // Also check if it's not clicking on the search results container
        if (!target.closest('.search-results-container')) {
          setShowResults(false);
        }
      }
    };

    // Handle clicks on the dim overlay specifically
    const handleDimOverlayClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('search-dim-overlay')) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('click', handleDimOverlayClick);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleDimOverlayClick);
    };
  }, []);

  const handleProductClick = (sneaker: Sneaker) => {
    setShowResults(false);
    setSearchTerm('');
    // Navigate to catalog/sneakers with product ID to auto-open modal
    navigate(`/catalog/sneakers?product=${sneaker.id}`);
  };

  const handleShopAll = () => {
    setShowResults(false);
    navigate('/full-catalog');
  };

  return (
    <>
      {/* Background Dim Overlay - positioned fixed to cover entire screen but behind search */}
      {showResults && (
        <div className="search-dim-overlay fixed inset-0 bg-black/50 z-40 cursor-pointer" />
      )}
      
      <div className="sticky top-0 z-50 w-full -ml-16 px-8 py-4">
        <div className="flex justify-center">
          {/* Search Container - elevated above dim overlay */}
          <div ref={searchRef} className="relative max-w-md w-full z-50">
            {/* Floating Search Bar */}
            <div className="relative backdrop-blur-md bg-background/60 rounded-lg border border-border/50 shadow-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search sneakers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full bg-transparent border-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                onFocus={() => {
                  if (searchTerm.trim()) {
                    setShowResults(true);
                  }
                }}
              />
            </div>

            {/* Search Results Dropdown - also elevated above dim overlay */}
            {showResults && (
              <div className="search-results-container absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border border-border/50 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                {filteredResults.length > 0 ? (
                  <>
                    {/* Results */}
                    <div className="p-2">
                      {filteredResults.map((sneaker) => (
                        <button
                          key={sneaker.id}
                          onClick={() => handleProductClick(sneaker)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                        >
                          <img 
                            src={sneaker.image} 
                            alt={sneaker.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{sneaker.name}</h4>
                            <p className="text-sm text-muted-foreground">{sneaker.brand} • {sneaker.price}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {/* Bottom Button */}
                    <div className="border-t border-border/50 p-3">
                      <Button 
                        onClick={handleShopAll}
                        className="w-full btn-hover-glow"
                      >
                        Shop All Sneakers
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    No sneakers found for "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MainCatalogNavBar;