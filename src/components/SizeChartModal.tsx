import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SizeChartModal = ({ isOpen, onClose }: SizeChartModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>EU to US Size Chart</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <img 
            src="/lovable-uploads/b131ed29-de14-4148-83ef-b260e79e4692.png" 
            alt="EU to US Size Chart"
            className="w-full h-auto rounded-lg"
          />
          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SizeChartModal;