import { useState } from "react";
import ConnectSocialsModal from "@/components/ConnectSocialsModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "@/components/UserAvatar";
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
  Link as LinkIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreatorDashboard } from "@/hooks/useCreatorDashboard";

export default function CreatorDashboard() {
  const { 
    loading, 
    profile, 
    stats, 
    credits, 
    creditsHistory, 
    payoutHistory, 
    recentVideos, 
    checklistItems,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem
  } = useCreatorDashboard();
  
  const [copiedCode, setCopiedCode] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [showConnectSocials, setShowConnectSocials] = useState(false);

  const tierThresholds: Record<number, { min: number; max: number; commission: number }> = {
    1: { min: 0, max: 5000, commission: 10 },
    2: { min: 5000, max: 15000, commission: 15 },
    3: { min: 15000, max: Infinity, commission: 20 }
  };

  const getCreditTier = (followers: number) => {
    if (followers >= 1000000) return { tier: "Diamond+", rate: 150 };
    if (followers >= 500000) return { tier: "Diamond", rate: 100 };
    if (followers >= 100000) return { tier: "Platinum", rate: 75 };
    if (followers >= 50000) return { tier: "Gold", rate: 50 };
    if (followers >= 10000) return { tier: "Silver", rate: 35 };
    return { tier: "Bronze", rate: 20 };
  };

  // Only show social data if verified connections exist
  const hasVerifiedSocials = profile.socialConnections && profile.socialConnections.length > 0;
  const highestFollowerCount = hasVerifiedSocials 
    ? Math.max(...profile.socialConnections.map(conn => conn.follower_count))
    : 0;
  const currentCreditTier = getCreditTier(highestFollowerCount);
  const progressToNext = (stats.totalSalesDriven / tierThresholds[profile.tier].max) * 100;

  const addGoal = async () => {
    if (newGoal.trim()) {
      await addChecklistItem(newGoal.trim());
      setNewGoal("");
    }
  };

  const deleteGoal = async (id: string) => {
    await deleteChecklistItem(id);
  };

  const toggleGoal = async (id: string) => {
    const item = checklistItems.find(item => item.id === parseInt(id));
    if (item) {
      await toggleChecklistItem(id, !item.completed);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(profile.couponCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

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
                <UserAvatar 
                  avatarUrl={profile.profileImage} 
                  displayName={profile.name} 
                  size="xl"
                  className="border-2 border-primary/30"
                />
                 <div>
                   {loading ? (
                     <Skeleton className="h-8 w-48 mb-2" />
                   ) : (
                     <h2 className="text-2xl font-bold text-foreground">{profile.name || "Creator"}</h2>
                   )}
                   <div className="flex items-center gap-2 mt-1">
                     {loading ? (
                       <>
                         <Skeleton className="h-6 w-16" />
                         <Skeleton className="h-4 w-24" />
                       </>
                     ) : (
                       <>
                         <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                           Tier {profile.tier}
                         </Badge>
                         <span className="text-muted-foreground">{profile.commissionRate}% Commission</span>
                       </>
                     )}
                   </div>
                 </div>
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-muted-foreground text-sm mb-2">Your Coupon Code</p>
                 <div className="flex items-center gap-2">
                   {loading ? (
                     <Skeleton className="h-10 w-24" />
                    ) : (
                      <code className="bg-muted px-4 py-2 rounded-lg text-xl font-mono font-bold text-foreground">
                        {profile.couponCode || "N/A"}
                      </code>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyCode}
                      className="border-primary/30 hover:bg-primary/10"
                      disabled={loading || !profile.couponCode}
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
                 {loading ? (
                   <>
                     <div className="flex justify-between text-sm mb-2">
                       <Skeleton className="h-4 w-32" />
                       <Skeleton className="h-4 w-24" />
                     </div>
                     <Skeleton className="h-3 w-full" />
                   </>
                     ) : (
                       <>
                         <div className="flex justify-between text-sm mb-2">
                           <span>Sales Driven: ${stats.totalSalesDriven.toLocaleString()}</span>
                           <span>Next Tier: ${tierThresholds[profile.tier].max.toLocaleString()}</span>
                         </div>
                         <Progress value={progressToNext} className="h-3" />
                       </>
                     )}
               </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {Object.entries(tierThresholds).map(([tier, data]) => (
                  <div
                    key={tier}
                     className={cn(
                       "p-4 rounded-lg border-2",
                       profile.tier === parseInt(tier)
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
                      <span>500K–1M</span>
                      <span>$100/video</span>
                    </div>
                    <div className="flex justify-between">
                      <span>1M+</span>
                      <span>$150/video</span>
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
                Social Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-24 mx-auto mb-2" />
                    <Skeleton className="h-6 w-20 mx-auto" />
                  </div>
                ) : hasVerifiedSocials ? (
                  <div className="space-y-3">
                    {profile.socialConnections.map((connection, index) => (
                      <div key={index} className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm capitalize">{connection.platform}</p>
                            <p className="text-xs text-muted-foreground">@{connection.username}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{connection.follower_count.toLocaleString()}</p>
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              Verified
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <p className="text-sm font-medium">Current Payout Rate</p>
                      <Badge className="mt-1 bg-primary text-primary-foreground">
                        ${currentCreditTier.rate}/video
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-muted/50 rounded-lg border border-border">
                    <p className="font-medium text-sm mb-2">No Social Connections</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Connect and verify your social accounts to earn credits for videos
                    </p>
                  </div>
                )}
                
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setShowConnectSocials(true)}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  {hasVerifiedSocials ? "Add More Socials" : "Connect Socials"}
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
               ) : creditsHistory.length > 0 ? (
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
               ) : (
                 <div className="text-center py-8 text-muted-foreground">
                   <p>No credit history yet</p>
                   <p className="text-sm">Start posting content to earn credits!</p>
                 </div>
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
                       <p className="text-lg font-bold text-green-600">$0.00</p>
                     )}
                     <p className="text-xs text-muted-foreground">Lifetime Withdrawn</p>
                   </div>
                   <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                     {loading ? (
                       <Skeleton className="h-6 w-20 mx-auto mb-1" />
                     ) : (
                       <p className="text-lg font-bold text-blue-600">$0.00</p>
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
                   ) : payoutHistory.length > 0 ? (
                     payoutHistory.slice(0, 2).map((payout, index) => (
                       <div key={index} className="flex justify-between text-xs p-2 bg-muted rounded">
                         <span>{payout.date}</span>
                         <span>${payout.amount}</span>
                         <Badge variant={payout.status === "Complete" ? "default" : "secondary"} className="text-xs">
                           {payout.status}
                         </Badge>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-2 text-muted-foreground text-xs">
                       No payouts yet
                     </div>
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
                <Button 
                  className="w-full"
                  onClick={() => window.open('https://drive.google.com/drive/folders/1PUiA8n7489DlJpb9xdBvQNHfpE15xbZc?usp=sharing', '_blank')}
                >
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
                      onChange={() => toggleGoal(item.id.toString())}
                      className="rounded border-border"
                    />
                    <span className={cn("text-sm", item.completed && "line-through text-muted-foreground")}>
                      {item.text}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteGoal(item.id.toString())}
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
                 ) : recentVideos.length > 0 ? (
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
                 ) : (
                   <div className="text-center py-8 text-muted-foreground">
                     <p>No videos tracked yet</p>
                     <p className="text-sm">Connect your social accounts to see performance!</p>
                   </div>
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
                 {loading ? (
                   <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                     <Skeleton className="h-6 w-64 mx-auto mb-2" />
                     <Skeleton className="h-4 w-48 mx-auto" />
                   </div>
                 ) : (
                   <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                     <p className="text-lg font-bold">🎯 Start your creator journey!</p>
                     <p className="text-sm text-muted-foreground mt-1">
                       Connect your socials and start earning commissions
                     </p>
                   </div>
                 )}
                 
                 <Button variant="outline" className="w-full" disabled={loading}>
                   <Download className="h-4 w-4 mr-2" />
                   Download Your Creator Stats (.csv)
                 </Button>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConnectSocialsModal 
        isOpen={showConnectSocials}
        onClose={() => setShowConnectSocials(false)}
        onSuccess={() => {
          // Refresh dashboard data when social connection is added
          // This could trigger a refetch of social connections
        }}
      />
    </div>
  );
}