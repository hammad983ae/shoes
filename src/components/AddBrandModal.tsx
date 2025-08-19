import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AddBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBrandAdded: (brandName: string) => void;
}

const AddBrandModal = ({ isOpen, onClose, onBrandAdded }: AddBrandModalProps) => {
  const [brandName, setBrandName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!brandName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a brand name",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Call the parent function to add the brand
      onBrandAdded(brandName.trim());
      
      toast({
        title: "Success",
        description: `Brand "${brandName}" added successfully`
      });
      
      setBrandName('');
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add brand",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setBrandName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Brand</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="brandName">Brand Name *</Label>
            <Input
              id="brandName"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Enter brand name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!brandName.trim() || loading}
              className="flex-1"
            >
              {loading ? 'Adding...' : 'Add Brand'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBrandModal;