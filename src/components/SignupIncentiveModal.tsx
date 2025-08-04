import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { markSignupPromptSeen } from '@/utils/authUtils';

interface SignupIncentiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export default function SignupIncentiveModal({ isOpen, onClose, onContinue }: SignupIncentiveModalProps) {
  const navigate = useNavigate();

  const handleSignUp = () => {
    markSignupPromptSeen();
    onClose();
    navigate('/signup');
  };

  const handleNoThanks = () => {
    markSignupPromptSeen();
    onClose();
    onContinue();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto incentive-modal">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            🎉 Special Offer!
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <div className="text-3xl mb-4">🎯</div>
          <p className="text-lg font-medium">
            Get 10% off your first order when you sign up!
          </p>
          <p className="text-sm text-muted-foreground">
            Create an account to unlock exclusive discounts and track your orders.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button 
            onClick={handleSignUp}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Sign Up for an Account
          </Button>
          <Button 
            onClick={handleNoThanks}
            variant="outline"
            className="w-full"
          >
            No Thanks
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 