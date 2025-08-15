import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sneakerCatalog } from '@/components/SneakerCatalog';
import { Sneaker } from '@/types/global';
import CartSidebar from '@/components/CartSidebar';

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
      ).slice(0, 5);
      
      setFilteredResults(results);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (searchRef.current && !searchRef.current.contains(target)) {
        if (!target.closest('.search-results-container') && !target.closest('.search-dim-overlay')) {
          setShowResults(false);
        }
      }
    };

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
    navigate(`/product/${sneaker.id}`);
  };

  const handleShopAll = () => {
    setShowResults(false);
    navigate('/full-catalog');
  };

  return (
    <>
      {showResults && (
        <div className="search-dim-overlay fixed inset-0 bg-black/50 z-40 cursor-pointer" />
      )}

      <div className="sticky top-0 z-40 w-full px-4 md:px-8 py-2 md:py-4">
        <div className="flex justify-center items-center gap-4">
          <div ref={searchRef} className="relative max-w-[240px] sm:max-w-md w-full z-50">
            <div className="relative backdrop-blur-md bg-background/60 rounded-lg border border-border/50 shadow-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search sneakers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full bg-transparent border-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                onFocus={() => {
                  if (searchTerm.trim()) {
                    setShowResults(true);
                  }
                }}
              />
            </div>

            {showResults && (
              <div className="search-results-container absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border border-border/50 rounded-lg shadow-xl max-h-64 sm:max-h-96 overflow-y-auto z-50">
                {filteredResults.length > 0 ? (
                  <>
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
                    <div className="border-t border-border/50 p-3">
                      <Button 
                        onClick={handleShopAll}
                        className="w-full btn-hover-glow flex items-center justify-center gap-2"
                      >
                        <span>Shop All Sneakers</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
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

          {/* Cart button aligned with search bar */}
          <div className="z-50">
            <CartSidebar alignWithStickyNav={true} />
          </div>
        </div>
      </div>
    </>
  );
};

export default MainCatalogNavBar;
