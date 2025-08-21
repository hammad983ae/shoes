import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserAvatar } from '@/components/UserAvatar';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  CreditCard, 
  Plus,
  Coins,
  Wallet as WalletIcon
} from 'lucide-react';
import InteractiveParticles from '@/components/InteractiveParticles';

interface ProfileData {
  display_name: string | null;
  avatar_url: string | null;
  credits: number;
}

interface PaymentMethod {
  id: string;
  type: string;
  last_four: string;
  brand: string;
}

const creditPackages = [
  { amount: 10, credits: 100, popular: false },
  { amount: 25, credits: 300, popular: true },
  { amount: 50, credits: 650, popular: false },
];

const Wallet = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData>({ 
    display_name: '', 
    avatar_url: '', 
    credits: 0
  });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    if (user) fetchWalletData();
  }, [user]);

  const fetchWalletData = async () => {
    if (!user) return;

    try {
      // Fetch profile data with credits
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, credits')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile({
          display_name: profileData.display_name,
          avatar_url: profileData.avatar_url,
          credits: profileData.credits || 0
        });
      }

      // TODO: Fetch payment methods from Stripe or database
      // For now, using mock data
      setPaymentMethods([]);

    } catch (error: any) {
      console.error('Error fetching wallet data:', error);
    }
  };

  const handleAddPaymentMethod = () => {
    toast({
      title: "Coming Soon",
      description: "Payment method management will be available soon!",
    });
  };

  const handlePurchaseCredits = (packageItem: typeof creditPackages[0]) => {
    toast({
      title: "Coming Soon",
      description: `Credit purchase for $${packageItem.amount} → ${packageItem.credits} credits will be available soon!`,
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center page-gradient"><span className="text-lg text-gray-400">Loading...</span></div>;
  if (!user) return <div className="p-8 text-center">Please sign in to access your wallet.</div>;

  return (
    <div className="min-h-screen page-gradient flex flex-col">
      <div className="flex-1 flex items-center justify-center px-2 sm:px-4 py-8 w-full">
        <div className="w-full max-w-md mx-auto relative">
          <InteractiveParticles isActive={true} />
          
          {/* Main Wallet Card */}
          <div className="w-full bg-gradient-to-r from-[#111111] to-[#FFD700]/10 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-2xl border border-yellow-500/50 hover:shadow-yellow-500/20 transition-all duration-300 btn-hover-glow">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <span className="font-bold text-lg text-white">Manage Wallet</span>
              <div></div>
            </div>

            {/* Profile Section */}
            <div className="flex items-center gap-4 mb-6">
              <UserAvatar 
                avatarUrl={profile.avatar_url} 
                displayName={profile.display_name} 
                size="lg"
                className="border-2 border-yellow-500 shadow-lg"
              />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">
                  {profile.display_name || 'Anonymous User'}
                </h2>
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500 font-semibold">
                    {profile.credits} Credits
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Methods Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Payment Methods</h3>
              
              {paymentMethods.length === 0 ? (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm mb-3">No payment methods added</p>
                    <Button
                      onClick={handleAddPaymentMethod}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <Card key={method.id} className="bg-gray-800/50 border-gray-700">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-yellow-500" />
                          <div>
                            <p className="text-white font-medium">{method.brand}</p>
                            <p className="text-gray-400 text-sm">•••• {method.last_four}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    onClick={handleAddPaymentMethod}
                    variant="outline"
                    className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              )}
            </div>

            {/* Reload Credit Wallet Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Reload Credit Wallet</h3>
              
              <div className="space-y-3">
                {creditPackages.map((packageItem, index) => (
                  <Card 
                    key={index} 
                    className={`bg-gray-800/50 border-gray-700 cursor-pointer transition-all hover:border-yellow-500/50 ${
                      packageItem.popular ? 'ring-1 ring-yellow-500/30' : ''
                    }`}
                    onClick={() => handlePurchaseCredits(packageItem)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <WalletIcon className="w-5 h-5 text-yellow-500" />
                          <div>
                            <p className="text-white font-medium">${packageItem.amount}</p>
                            <p className="text-gray-400 text-sm">{packageItem.credits} Credits</p>
                          </div>
                        </div>
                        {packageItem.popular && (
                          <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-semibold">
                            Popular
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;