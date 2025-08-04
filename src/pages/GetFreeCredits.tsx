import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import InteractiveParticles from '@/components/InteractiveParticles';
import { useAuth } from '@/contexts/AuthContext';
import { useReferral } from '@/hooks/useReferral';
import { useToast } from '@/hooks/use-toast';
import ReferralLeaderboard from '@/components/ReferralLeaderboard';

const GetFreeCredits = () => {
  const { user } = useAuth();
  const { referralData, copyReferralLink, shareReferralLink } = useReferral();
  const { toast } = useToast();
  const [dollarAmount, setDollarAmount] = useState(1);
  const credits = dollarAmount * 100;

  return (
    <div className="min-h-screen page-gradient relative">
      <InteractiveParticles isActive={true} />
      <div className="container mx-auto px-2 sm:px-4 py-8 w-full">
        { !user ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h2 className="text-2xl font-bold text-white mb-4">Please sign in to access referrals</h2>
            <p className="text-gray-400">You need an account to view and share your referral link.</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Get Free Credits</h1>
            </div>
            {/* Start Earning Credits Today UI */}
            <div className="w-full flex justify-center mb-6">
              <Card className="bg-[#0a0a0a] border-[#FFD700] max-w-2xl w-full mx-auto px-4 sm:px-8 py-6 rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-2xl text-center">Start Earning Credits Today!</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-xs sm:text-base text-center">
                    Share your referral link with friends and start earning credits with every purchase they make. The more friends you refer, the more credits you earn!
                  </p>
                  <div className="p-2 sm:p-4 bg-primary/10 rounded-lg overflow-x-auto mb-2">
                    <p className="font-semibold text-primary text-xs sm:text-base">Your Referral Link:</p>
                    <p className="text-xs sm:text-sm text-muted-foreground font-mono bg-background p-2 rounded mt-2 break-all">
                      {referralData.referralCode ? `https://cralluxsells.com/ref/${referralData.referralCode}` : 'Loading...'}
                    </p>
                  </div>
                  <div className="flex flex-row flex-wrap gap-2 justify-center w-full">
                    <Button onClick={shareReferralLink} className="btn-hover-glow text-xs sm:text-base">Share Link</Button>
                    <Button variant="outline" onClick={copyReferralLink} className="btn-hover-glow text-xs sm:text-base">Copy Link</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Referral Leaderboard */}
            <div className="w-full flex justify-center mb-6">
              <div className="max-w-2xl w-full">
                <ReferralLeaderboard />
              </div>
            </div>

            {/* Exchange Rate Calculator */}
            <div className="w-full flex justify-center mb-6">
              <div className="max-w-2xl w-full">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardHeader>
                    <CardTitle className="text-center">Exchange Rate Calculator</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-muted-foreground">Dollar Amount</label>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">$</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={dollarAmount}
                            onChange={(e) => setDollarAmount(parseFloat(e.target.value) || 0)}
                            className="text-lg font-medium"
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-2xl">=</span>
                      </div>
                      <div className="flex-1 text-center">
                        <label className="text-sm font-medium text-muted-foreground">Credits</label>
                        <div className="text-2xl font-bold text-primary">{credits}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Benefits Section - two boxes side by side (responsive) */}
            <div className="w-full flex flex-col sm:flex-row justify-center items-stretch mb-2 max-w-2xl mx-auto">
              <Card className="flex-1 min-w-0 w-full h-full min-h-[140px] bg-[#0a0a0a] border-[#FFD700] flex flex-col justify-center items-center rounded-none sm:first:rounded-l-2xl sm:last:rounded-r-2xl">
                <CardContent className="flex flex-col justify-center items-center w-full h-full min-h-[140px] py-6">
                  <p className="text-xs sm:text-lg font-medium text-foreground text-center">
                    You get <span className="text-primary font-bold">10% back in credits</span> when someone buys using your link.
                  </p>
                </CardContent>
              </Card>
              <Card className="flex-1 min-w-0 w-full h-full min-h-[140px] bg-[#0a0a0a] border-[#FFD700] flex flex-col justify-center items-center rounded-none sm:first:rounded-l-2xl sm:last:rounded-r-2xl">
                <CardContent className="flex flex-col justify-center items-center w-full h-full min-h-[140px] py-6">
                  <p className="text-xs sm:text-lg font-medium text-foreground text-center">
                    They also get <span className="text-primary font-bold">10% off</span> their first purchase after creating an account.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Subtext Below Benefits */}
            <div className="w-full flex justify-center mb-6">
              <p className="text-center text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
                Create content with our products and earn more. We feature our top creators.
              </p>
            </div>

            {/* How to Use Credits Section */}
            <div className="w-full flex justify-center">
              <Card className="max-w-lg w-full mx-auto bg-[#0a0a0a] border-[#FFD700] flex flex-col items-center py-6">
                <CardContent className="flex flex-col items-center">
                  <p className="text-center text-base sm:text-lg font-medium text-foreground mb-4">
                    Save money. Use your credits at checkout to get discounts on any sneaker purchase.
                  </p>
                  <Button className="bg-[#FFD600] text-black hover:bg-[#E6C200] font-semibold px-6 py-2 rounded-xl btn-hover-glow mt-2">
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GetFreeCredits;