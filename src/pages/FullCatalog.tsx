import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import ProductCard from '@/components/ProductCard'
import ViewProductModal from '@/components/ViewProductModal'
import SignupIncentiveModal from '@/components/SignupIncentiveModal'
import MainCatalogNavBar from '@/components/MainCatalogNavBar'
import RequestNewItemsCard from '@/components/RequestNewItemsCard'
import { sneakerCatalog } from '@/components/SneakerCatalog'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useAuth } from '@/contexts/AuthContext'
import { isFirstProductView } from '@/utils/authUtils'
import InteractiveParticles from '@/components/InteractiveParticles'
import { Sneaker } from '@/types/global'
import { Button } from '@/components/ui/button'
import { Heart, ArrowLeft } from 'lucide-react'
import EnhancedFilterPanel from '@/components/EnhancedFilterPanel'

const extendedCatalog = sneakerCatalog.map(s => ({ ...s, category: 'Shoes' }))

const FullCatalog = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { getFavoriteProducts } = useFavorites()
  const { user } = useAuth()

  const [searchTerm, setSearchTerm] = useState('')
  const [showFavorites, setShowFavorites] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Sneaker | null>(null)
  const [showIncentiveModal, setShowIncentiveModal] = useState(false)
  const [pendingProduct, setPendingProduct] = useState<Sneaker | null>(null)
  const [filters, setFilters] = useState({
    categories: [] as string[],
    brands: [] as string[],
    colors: [] as string[],
    priceRange: [0, 1000] as [number, number],
  })

  useEffect(() => {
    const param = searchParams.get('product')
    if (param) {
      const found = extendedCatalog.find(p => p.id.toString() === param)
      if (found) handleViewProduct(found)
    }
  }, [searchParams])

  const handleViewProduct = (product: Sneaker) => {
    if (isFirstProductView(!!user)) {
      setPendingProduct(product)
      setShowIncentiveModal(true)
    } else {
      setSelectedProduct(product)
    }
  }

  const handleContinueToProduct = () => {
    if (pendingProduct) {
      setSelectedProduct(pendingProduct)
      setPendingProduct(null)
    }
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const filteredProducts = extendedCatalog.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filters.categories.length || filters.categories.includes(p.category)
    const matchesBrand = !filters.brands.length || filters.brands.includes(p.brand)
    const matchesColor = !filters.colors.length || (p.colors && p.colors.some(c => filters.colors.includes(c)))
    const price = parseInt(p.price.replace('$', ''))
    const matchesPrice = price >= filters.priceRange[0] && price <= filters.priceRange[1]
    return matchesSearch && matchesCategory && matchesBrand && matchesColor && matchesPrice
  })

  const visibleProducts = showFavorites ? getFavoriteProducts(filteredProducts as any) : filteredProducts

  return (
    <div className="min-h-screen page-gradient relative">
      <InteractiveParticles isActive />
      <Sidebar isOpen onToggle={() => {}} onBackToHome={() => {}} />

      <div className="relative z-10 ml-0 md:ml-16">
        <div className="sticky top-0 z-40 w-full px-4 md:px-8 py-1">
          <div className="flex items-center justify-center gap-2 max-w-screen-lg mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/catalog')}
              className="flex items-center gap-2 hover:bg-muted/50 backdrop-blur-md bg-background/60 rounded-full border border-border/50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <MainCatalogNavBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            <Button
              variant={showFavorites ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFavorites(!showFavorites)}
              className={`${showFavorites ? 'bg-primary text-primary-foreground' : 'btn-hover-glow backdrop-blur-md bg-background/60 rounded-full'}`}
            >
              <Heart className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline ml-2">
                {showFavorites ? 'All Items' : 'Favorites'}
              </span>
            </Button>

            <EnhancedFilterPanel onFiltersChange={handleFiltersChange} />
          </div>
        </div>

        <div className="flex justify-center px-2 sm:px-4 py-4 sm:py-8 w-full">
          {visibleProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6 max-w-screen-2xl w-full">
              {visibleProducts.map((product, i) => (
                <ProductCard key={product.id} sneaker={product} index={i} onViewProduct={handleViewProduct} />
              ))}
              <div className="animate-fade-in" style={{ animationDelay: `${(visibleProducts.length + 1) * 0.1}s` }}>
                <RequestNewItemsCard />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 w-full max-w-screen-2xl">
              <p className="text-muted-foreground text-lg mb-4 text-center">No products found matching your criteria.</p>
              <div className="animate-fade-in">
                <RequestNewItemsCard />
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedProduct && (
        <ViewProductModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          sneaker={selectedProduct}
        />
      )}

      <SignupIncentiveModal
        isOpen={showIncentiveModal}
        onClose={() => setShowIncentiveModal(false)}
        onContinue={handleContinueToProduct}
      />
    </div>
  )
}

export default FullCatalog