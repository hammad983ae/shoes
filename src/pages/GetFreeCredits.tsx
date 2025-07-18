import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Users, DollarSign } from 'lucide-react';

const GetFreeCredits = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Get Free Credits</h1>
      </div>

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