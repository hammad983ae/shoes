import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Copy,
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  Download,
  Play,
  Eye,
  Heart,
  MessageCircle,
  ChevronRight,
  Flame,
  Star,
  Trophy,
  Camera,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreatorDashboard() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [checklistItems, setChecklistItems] = useState([
    { id: 1, text: "Post a story with your code", completed: true },
    { id: 2, text: "Record 1 UGC", completed: false },
    { id: 3, text: "Comment on another creator's post", completed: false }
  ]);
  const [loading] = useState(false);
  
  // Mock data - in real app this would come from APIs
  const creator = {
    name: "Jessica Martinez",
    profileImage: "/placeholder.svg",
    tier: 2,
    couponCode: "JESS10",
    commissionRate: 15,
    followers: 45000
  };

  const stats = {
    totalOrders: loading ? 0 : 1247,
    averageOrderValue: loading ? 0 : 89.50,
    customersAcquired: loading ? 0 : 892,
    totalCommission: loading ? 0 : 12450.75,
    totalSalesDriven: loading ? 0 : 8750.00
  };

  const credits = {
    balance: loading ? 0 : 485
  };

  const tierThresholds: Record<number, { min: number; max: number; commission: number }> = {
    1: { min: 0, max: 5000, commission: 10 },
    2: { min: 5000, max: 15000, commission: 15 },
    3: { min: 15000, max: Infinity, commission: 20 }
  };

  const getCreditTier = (followers: number) => {
    if (followers >= 500000) return { tier: "Diamond", rate: 100 };
    if (followers >= 100000) return { tier: "Platinum", rate: 75 };
    if (followers >= 50000) return { tier: "Gold", rate: 50 };
    if (followers >= 10000) return { tier: "Silver", rate: 35 };
    return { tier: "Bronze", rate: 20 };
  };

  const currentCreditTier = getCreditTier(creator.followers);
  const progressToNext = (stats.totalSalesDriven / tierThresholds[creator.tier].max) * 100;

  const addGoal = () => {
    if (newGoal.trim()) {
      const newItem = {
        id: Math.max(...checklistItems.map(item => item.id), 0) + 1,
        text: newGoal.trim(),
        completed: false
      };
      setChecklistItems([...checklistItems, newItem]);
      setNewGoal("");
    }
  };

  const deleteGoal = (id: number) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id));
  };

  const toggleGoal = (id: number) => {
    setChecklistItems(checklistItems.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const copyCode = () => {
    navigator.clipboard.writeText(creator.couponCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const creditsHistory = [
    { date: "Dec 10", action: "Posted TikTok video", credits: 35, type: "in" },
    { date: "Dec 9", action: "Used credits on Order #3001", credits: -50, type: "out" },
    { date: "Dec 8", action: "Posted Instagram Reel", credits: 35, type: "in" },
    { date: "Dec 7", action: "Story mention bonus", credits: 10, type: "in" },
  ];

  const payoutHistory = [
    { date: "Dec 1", amount: 450.00, method: "PayPal", status: "Complete" },
    { date: "Nov 1", amount: 320.50, method: "Cash App", status: "Complete" },
    { date: "Oct 1", amount: 275.25, method: "PayPal", status: "Pending" },
  ];

  const recentVideos = [
    { title: "Unboxing New Jordan 4s", platform: "TikTok", views: 12500, likes: 890, comments: 45 },
    { title: "OOTD with Air Force 1s", platform: "Instagram", views: 8200, likes: 650, comments: 32 },
    { title: "Sneaker Collection Tour", platform: "TikTok", views: 15600, likes: 1200, comments: 78 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Creator Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your earnings and track your performance
          </p>
        </div>

        {/* Section 1: Creator Overview Hero */}
        <Card className="mb-8 bg-gradient-to-r from-primary/20 to-primary/10 border-primary/20">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/30">
                  <AvatarImage src={creator.profileImage} alt={creator.name} />
                  <AvatarFallback className="bg-primary/20 text-primary">JM</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{creator.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                      Tier {creator.tier}
                    </Badge>
                    <span className="text-muted-foreground">{creator.commissionRate}% Commission</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-muted-foreground text-sm mb-2">Your Coupon Code</p>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-4 py-2 rounded-lg text-xl font-mono font-bold text-foreground">
                    {creator.couponCode}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyCode}
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    {copiedCode ? "Copied!" : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <p className="text-muted-foreground mt-6 text-center md:text-left">
              Track your impact, climb the ranks, and earn more with every post.
            </p>
          </CardContent>
        </Card>

        {/* Section 2: Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">${stats.averageOrderValue}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers Acquired</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats.customersAcquired.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">${stats.totalCommission.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Section 3: Tier Progression Tracker */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Tier Progression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Sales Driven: ${stats.totalSalesDriven.toLocaleString()}</span>
                  <span>Next Tier: ${tierThresholds[creator.tier].max.toLocaleString()}</span>
                </div>
                <Progress value={progressToNext} className="h-3" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {Object.entries(tierThresholds).map(([tier, data]) => (
                  <div
                    key={tier}
                    className={cn(
                      "p-4 rounded-lg border-2",
                      creator.tier === parseInt(tier)
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/50"
                    )}
                  >
                    <div className="text-center">
                      <h3 className="font-bold">Tier {tier}</h3>
                      <p className="text-sm text-muted-foreground">
                        {data.commission}% Commission
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ${data.min.toLocaleString()}+ sales
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                Drive more sales to unlock bigger payouts. This resets never.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Section 4: Creator Credits Module */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Creator Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                  {loading ? (
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{credits.balance}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Follower Tier Breakdown:</h4>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>&lt;10K followers</span>
                      <span>$20/video</span>
                    </div>
                    <div className="flex justify-between">
                      <span>10K–50K</span>
                      <span>$35/video</span>
                    </div>
                    <div className="flex justify-between">
                      <span>50K–100K</span>
                      <span>$50/video</span>
                    </div>
                    <div className="flex justify-between">
                      <span>100K–500K</span>
                      <span>$75/video</span>
                    </div>
                    <div className="flex justify-between">
                      <span>500K+</span>
                      <span>$100/video</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Social API Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                Social Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-2xl font-bold text-foreground">{creator.followers.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">TikTok Followers</p>
                  <Badge className="mt-2 bg-primary text-primary-foreground">${currentCreditTier.rate}/video</Badge>
                </div>
                
                <p className="text-sm text-center text-muted-foreground">
                  Post more videos to upgrade your credit tier.
                </p>
                
                <Button className="w-full" variant="outline">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Connect More Socials
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 6: Credits History Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Credits History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))
              ) : (
                creditsHistory.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{transaction.action}</p>
                      <p className="text-xs text-muted-foreground">{transaction.date}</p>
                    </div>
                    <div className={cn(
                      "font-bold",
                      transaction.type === "in" ? "text-green-600" : "text-red-600"
                    )}>
                      {transaction.type === "in" ? "+" : ""}{transaction.credits}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Section 7: Payouts Module */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Payouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    {loading ? (
                      <Skeleton className="h-6 w-20 mx-auto mb-1" />
                    ) : (
                      <p className="text-lg font-bold text-green-600">$1,245.50</p>
                    )}
                    <p className="text-xs text-muted-foreground">Lifetime Withdrawn</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    {loading ? (
                      <Skeleton className="h-6 w-20 mx-auto mb-1" />
                    ) : (
                      <p className="text-lg font-bold text-blue-600">$450.75</p>
                    )}
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                </div>
                
                <Button className="w-full">
                  Request Payout
                </Button>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Recent Payouts:</h4>
                  {loading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex justify-between text-xs p-2 bg-muted rounded">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    ))
                  ) : (
                    payoutHistory.slice(0, 2).map((payout, index) => (
                      <div key={index} className="flex justify-between text-xs p-2 bg-muted rounded">
                        <span>{payout.date}</span>
                        <span>${payout.amount}</span>
                        <Badge variant={payout.status === "Complete" ? "default" : "secondary"} className="text-xs">
                          {payout.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 8: Content Vault */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Content Toolkit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">• Product Images</p>
                  <p className="text-sm text-muted-foreground">• Brand Assets</p>
                  <p className="text-sm text-muted-foreground">• Color Palette</p>
                  <p className="text-sm text-muted-foreground">• Winning Creatives</p>
                </div>
                <Button className="w-full">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Open Vault
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 9: Checklist */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Create your own goals and track your daily progress</p>
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleGoal(item.id)}
                      className="rounded border-border"
                    />
                    <span className={cn("text-sm", item.completed && "line-through text-muted-foreground")}>
                      {item.text}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteGoal(item.id)}
                    className="text-destructive hover:text-destructive px-2"
                  >
                    ×
                  </Button>
                </div>
              ))}

              <div className="mt-4 pt-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a new goal..."
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button size="sm" onClick={addGoal}>
                    Add Goal
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Section 10: Video Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Recent Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-16 mb-2" />
                      <div className="flex gap-4">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-8" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                    </div>
                  ))
                ) : (
                  recentVideos.map((video, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm">{video.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{video.platform}</p>
                      <div className="flex gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {video.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {video.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {video.comments}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Want to boost views? Try new product hooks from the vault!
              </p>
            </CardContent>
          </Card>

          {/* Section 11: Dynamic Recognition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Recognition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-lg font-bold">🔥 You ranked #4 in total sales this week!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You earned $245 in the last 7 days — keep going!
                  </p>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Your Creator Stats (.csv)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}