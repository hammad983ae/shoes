import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface FirstTimeDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDiscount: () => void;
}

export default function FirstTimeDiscountModal({ 
  isOpen, 
  onClose, 
  onApplyDiscount 
}: FirstTimeDiscountModalProps) {
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyDiscount = async () => {
    setIsApplying(true);
    onApplyDiscount();
    onClose();
    setIsApplying(false);
  };

  const handleUseBetterOption = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-primary">
            🎉 First Time Customer?
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-2xl font-bold text-primary">
            Claim 10% Off Your First Purchase!
          </h3>
          <p className="text-muted-foreground">
            Welcome to Crallux! As a first-time customer, you get an exclusive 10% discount on this order.
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm font-medium text-primary">
              ✅ Automatically applied at checkout<br/>
              ✅ Valid for this order only<br/>
              ✅ No minimum purchase required
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button 
            onClick={handleApplyDiscount}
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isApplying}
          >
            {isApplying ? 'Applying...' : 'Continue with 10% Off'}
          </Button>
          <Button 
            onClick={handleUseBetterOption}
            variant="outline"
            className="w-full"
          >
            I have a better coupon / I want to use credits
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}