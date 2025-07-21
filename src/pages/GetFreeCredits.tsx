import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Gift, Users, DollarSign } from 'lucide-react';

const GetFreeCredits = () => {
  const [dollarAmount, setDollarAmount] = useState(1);
  const credits = dollarAmount * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Get Free Credits</h1>
      </div>

      {/* Exchange Rate Calculator */}
      <Card className="max-w-md mx-auto mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-center">Exchange Rate Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
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

      {/* Explanations */}
      <div className="max-w-2xl mx-auto mb-8 space-y-4">
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <p className="text-center text-lg font-medium text-foreground">
              You get <span className="text-primary font-bold">10% back in credits</span> when someone buys using your link.
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <p className="text-center text-lg font-medium text-foreground">
              They also get <span className="text-primary font-bold">10% off</span> their first purchase after creating an account.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Creation Section */}
      <Card className="max-w-2xl mx-auto mb-8 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="pt-6 text-center">
          <p className="text-lg font-medium text-foreground">
            Create content with our products and earn more — we feature our top creators.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Exchange Rate Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Exchange Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary mb-2">$1 = 100 Credits</p>
              <p className="text-muted-foreground">
                Every dollar spent earns you 100 credits for future purchases
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Referral System Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Referral System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary mb-2">10% Back</p>
              <p className="text-muted-foreground">
                When a friend uses your referral link and makes a purchase, you earn 10% back in credits
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How to Use Credits Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              How to Use Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary mb-2">Save Money</p>
              <p className="text-muted-foreground">
                Use your credits at checkout to get discounts on any sneaker purchase
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Start Earning Credits Today!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Share your referral link with friends and start earning credits with every purchase they make. 
              The more friends you refer, the more credits you earn!
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="font-semibold text-primary">Your Referral Link:</p>
                <p className="text-sm text-muted-foreground font-mono bg-background p-2 rounded mt-2">
                  https://crallux.com/ref/your-unique-code
                </p>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button>Share Link</Button>
                <Button variant="outline">Copy Link</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GetFreeCredits;