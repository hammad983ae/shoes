
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import RequestItemModal from './RequestItemModal';

const RequestNewItemsCard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card 
        className="group cursor-pointer hover:scale-105 transition-all duration-300 border-dashed border-2 border-muted-foreground/30 hover:border-primary/50 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10"
        onClick={() => setIsModalOpen(true)}
      >
        <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Can't find it?</h3>
          <p className="text-muted-foreground text-sm">
            Request new items and we'll do our best to source them for you.
          </p>
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
