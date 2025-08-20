import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DisabledFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  description?: string;
}

export const DisabledFeatureModal = ({ 
  isOpen, 
  onClose, 
  featureName, 
  description = "This feature is temporarily disabled while we rebuild the authentication system." 
}: DisabledFeatureModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <DialogTitle>Feature Temporarily Disabled</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            <strong>{featureName}</strong> is currently unavailable.
            <br />
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};