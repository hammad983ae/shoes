import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface MainCatalogNavBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const MainCatalogNavBar = ({
  searchTerm,
  setSearchTerm,
}: MainCatalogNavBarProps) => {
  return (
    <div className="sticky top-0 z-50 w-full -ml-16 px-8 py-4">
      <div className="flex justify-center">
        {/* Floating Search Bar */}
        <div className="relative max-w-md w-full backdrop-blur-md bg-background/60 rounded-lg border border-border/50 shadow-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search sneakers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full bg-transparent border-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>
    </div>
  );
};

export default MainCatalogNavBar;