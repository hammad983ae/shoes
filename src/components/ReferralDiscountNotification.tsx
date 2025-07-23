import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';

export const ReferralDiscountNotification = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false);

  useEffect(() => {
    if (user) {
      checkReferralDiscount();
    }
  }, [user]);

  const checkReferralDiscount = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('referred_by')
        .eq('user_id', user.id)
        .single();

      // Check if user was referred and hasn't made a purchase yet
      if (profile?.referred_by) {
        const { data: purchases } = await supabase
          .from('purchase_history')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (!purchases || purchases.length === 0) {
          setHasDiscount(true);
          setShowModal(true);
        }
      }
    } catch (error) {
      console.error('Error checking referral discount:', error);
    }
  };

  if (!hasDiscount) return null;

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="max-w-md bg-gradient-to-br from-green-900/95 to-emerald-900/95 border-green-500">
        <DialogHeader>
          <DialogTitle className="text-center text-white flex items-center justify-center gap-2">
            <Gift className="w-6 h-6 text-green-400" />
            Welcome Bonus!
          </DialogTitle>
        </DialogHeader>
        <div className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <p className="text-white">
            Your first order checkout will be <span className="font-bold text-green-400">10% off</span> the order total thanks to your referral link!
          </p>
          <Button
            onClick={() => setShowModal(false)}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};