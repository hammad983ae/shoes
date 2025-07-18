import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

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

const SneakerCatalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Basketball', 'Running', 'Lifestyle'];

  const filteredSneakers = sneakerCatalog.filter((sneaker) => {
    const matchesSearch = sneaker.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || sneaker.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar on the left */}
      <Sidebar isOpen={true} onToggle={() => {}} />

      {/* Main content */}
      <div className="flex-1">
        {/* Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border/50 z-50">
          <div className="container mx-auto px-4 py-6 ml-0 md:ml-0">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Sneaker Collection</h1>
            </div>

            {/* Search and Filter */}
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
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-full"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="container mx-auto px-4 py-8">
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            style={{
              animation: 'fadeInUp 0.8s ease-out',
            }}
          >
            {filteredSneakers.map((sneaker, index) => (
              <ProductCard key={sneaker.id} sneaker={sneaker} index={index} />
            ))}
          </div>

          {filteredSneakers.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No sneakers found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SneakerCatalog;
