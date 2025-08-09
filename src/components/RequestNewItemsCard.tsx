
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import RequestItemModal from './RequestItemModal';

const RequestNewItemsCard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card 
        className="group cursor-pointer hover:scale-105 transition-all duration-300 border-dashed border-2 border-muted-foreground/30 hover:border-primary/50 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 overflow-hidden"
        style={{ height: '400px' }}
        onClick={() => setIsModalOpen(true)}
      >
        <CardContent className="p-0 h-full">
          {/* Image Area - matches ProductCard image height */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center" style={{ height: '260px' }}>
            <div className="w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center group-hover:bg-primary/40 transition-colors">
              <Plus className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          {/* Product Info Area - matches ProductCard info area */}
          <div className="p-3 sm:p-4 flex flex-col justify-center h-[140px]">
            <div className="flex flex-col gap-1 text-center">
              <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                Can't find it?
              </h3>
              <span className="text-xs text-muted-foreground font-medium">
                Request new items
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2 line-clamp-2">
              We'll do our best to source them for you.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <RequestItemModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default RequestNewItemsCard;
