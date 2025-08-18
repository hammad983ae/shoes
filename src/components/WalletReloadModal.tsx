import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWallet } from '@/hooks/useWallet';
import { toast } from '@/hooks/use-toast';

interface WalletReloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PREDEFINED_PLANS = [
  { amount: 400, credits: 42000, bonus: '5% bonus' },
  { amount: 600, credits: 65000, bonus: '8.33% bonus' },
  { amount: 1000, credits: 110000, bonus: '10% bonus' }
];

export const WalletReloadModal = ({ isOpen, onClose }: WalletReloadModalProps) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { calculateCreditsForAmount, reloadWallet } = useWallet();

  const handlePredefinedPlan = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmount = (value: string) => {
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount > 0) {
      setSelectedAmount(amount);
      setCustomAmount(value);
    } else {
      setSelectedAmount(null);
      setCustomAmount(value);
    }
  };

  const handleReload = async () => {
    if (!selectedAmount || selectedAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please select or enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await reloadWallet(selectedAmount);
      if (result.success) {
        onClose();
        setSelectedAmount(null);
        setCustomAmount('');
      }
    } catch (error) {
      console.error('Error reloading wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const creditsToReceive = selectedAmount ? calculateCreditsForAmount(selectedAmount) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reload Wallet</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Predefined Plans */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Predefined Plans</Label>
            <div className="grid gap-3">
              {PREDEFINED_PLANS.map((plan) => (
                <button
                  key={plan.amount}
                  onClick={() => handlePredefinedPlan(plan.amount)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedAmount === plan.amount
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">${plan.amount}</div>
                      <div className="text-sm text-muted-foreground">
                        {plan.credits.toLocaleString()} credits
                      </div>
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      {plan.bonus}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <Label htmlFor="custom-amount">Custom Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="custom-amount"
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => handleCustomAmount(e.target.value)}
                className="pl-8"
                min="1"
                step="0.01"
              />
            </div>
            {customAmount && (
              <div className="text-sm text-muted-foreground">
                You'll receive: {creditsToReceive.toLocaleString()} credits
              </div>
            )}
          </div>

          {/* Summary */}
          {selectedAmount && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">${selectedAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Credits:</span>
                <span className="font-medium">{creditsToReceive.toLocaleString()}</span>
              </div>
              {selectedAmount >= 400 && (
                <div className="flex justify-between text-green-600">
                  <span>Bonus:</span>
                  <span className="font-medium">
                    +{(creditsToReceive - selectedAmount * 100).toLocaleString()} credits
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleReload} 
              disabled={!selectedAmount || loading}
              className="flex-1"
            >
              {loading ? 'Processing...' : 'Reload Wallet'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};