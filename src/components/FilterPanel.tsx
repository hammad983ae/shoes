import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface FilterPanelProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

const FilterPanel = ({ selectedCategory, setSelectedCategory, sortBy, setSortBy }: FilterPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const categories = ['All', 'Basketball', 'Running', 'Lifestyle'];
  const sortOptions = [
    { value: 'name-asc', label: 'Name A–Z' },
    { value: 'name-desc', label: 'Name Z–A' },
    { value: 'price-high', label: 'Price High to Low' },
    { value: 'price-low', label: 'Price Low to High' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Filter & Sort</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Sort Options */}
          <div>
            <Label className="text-base font-semibold">Sort By</Label>
            <RadioGroup value={sortBy} onValueChange={setSortBy} className="mt-3">
              {sortOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Category Filter */}
          <div>
            <Label className="text-base font-semibold">Category</Label>
            <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory} className="mt-3">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <RadioGroupItem value={category} id={category} />
                  <Label htmlFor={category} className="text-sm">
                    {category}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Clear Filters */}
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedCategory('All');
              setSortBy('name-asc');
            }}
            className="w-full"
          >
            Clear All Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterPanel;