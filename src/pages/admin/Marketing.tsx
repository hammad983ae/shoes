import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  DollarSign,
  Eye,
  Target,
  Plus,
  Filter,
  Download,
  Facebook,
  Zap,
  Mail,
  Percent
} from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";

export default function Marketing() {
  const { loading, campaigns, summary, createCampaign } = useCampaigns();
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [campaignType, setCampaignType] = useState<'meta_ads' | 'tiktok_ads' | 'email' | 'discount'>('meta_ads');
  const [campaignName, setCampaignName] = useState('');
  const [campaignPlatform, setCampaignPlatform] = useState('');
  const [campaignSpend, setCampaignSpend] = useState('');

  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) return;
    
    const campaignData = {
      type: campaignType,
      platform: campaignPlatform || campaignType.replace('_', ' '),
      name: campaignName,
      spend: parseFloat(campaignSpend) || 0,
      revenue: 0,
      roas: 0,
      clicks: 0,
      conversions: 0,
      status: 'active' as const
    };
    
    const result = await createCampaign(campaignData);
    if (result.success) {
      setShowNewCampaignModal(false);
      setCampaignName('');
      setCampaignPlatform('');
      setCampaignSpend('');
    }
  };

  return (
    <DashboardLayout currentPage="marketing">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
            <p className="text-muted-foreground">
              Track campaigns, measure ROAS, and optimize marketing performance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Dialog open={showNewCampaignModal} onOpenChange={setShowNewCampaignModal}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Campaign</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Tabs value={campaignType} onValueChange={(v) => setCampaignType(v as any)}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="meta_ads" className="text-xs">
                        <Facebook className="w-3 h-3 mr-1" />
                        Meta
                      </TabsTrigger>
                      <TabsTrigger value="tiktok_ads" className="text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        TikTok
                      </TabsTrigger>
                      <TabsTrigger value="email" className="text-xs">
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </TabsTrigger>
                      <TabsTrigger value="discount" className="text-xs">
                        <Percent className="w-3 h-3 mr-1" />
                        Discount
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="meta_ads" className="space-y-3">
                      <div>
                        <Label htmlFor="meta-name">Campaign Name</Label>
                        <Input 
                          id="meta-name"
                          value={campaignName}
                          onChange={(e) => setCampaignName(e.target.value)}
                          placeholder="Meta Ads Campaign"
                        />
                      </div>
                      <div>
                        <Label htmlFor="meta-spend">Initial Budget</Label>
                        <Input 
                          id="meta-spend"
                          type="number"
                          value={campaignSpend}
                          onChange={(e) => setCampaignSpend(e.target.value)}
                          placeholder="100"
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="tiktok_ads" className="space-y-3">
                      <div>
                        <Label htmlFor="tiktok-name">Campaign Name</Label>
                        <Input 
                          id="tiktok-name"
                          value={campaignName}
                          onChange={(e) => setCampaignName(e.target.value)}
                          placeholder="TikTok Ads Campaign"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tiktok-spend">Initial Budget</Label>
                        <Input 
                          id="tiktok-spend"
                          type="number"
                          value={campaignSpend}
                          onChange={(e) => setCampaignSpend(e.target.value)}
                          placeholder="100"
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="email" className="space-y-3">
                      <div>
                        <Label htmlFor="email-name">Campaign Name</Label>
                        <Input 
                          id="email-name"
                          value={campaignName}
                          onChange={(e) => setCampaignName(e.target.value)}
                          placeholder="Email Campaign"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email-platform">Email Platform</Label>
                        <Select value={campaignPlatform} onValueChange={setCampaignPlatform}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="resend">Resend</SelectItem>
                            <SelectItem value="mailchimp">Mailchimp</SelectItem>
                            <SelectItem value="klaviyo">Klaviyo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="discount" className="space-y-3">
                      <div>
                        <Label htmlFor="discount-name">Campaign Name</Label>
                        <Input 
                          id="discount-name"
                          value={campaignName}
                          onChange={(e) => setCampaignName(e.target.value)}
                          placeholder="Discount Campaign"
                        />
                      </div>
                      <div>
                        <Label htmlFor="discount-type">Discount Type</Label>
                        <Select value={campaignPlatform} onValueChange={setCampaignPlatform}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage Off</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                            <SelectItem value="bogo">Buy One Get One</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewCampaignModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateCampaign}>
                      Create Campaign
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Marketing Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total ROAS</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">{summary.totalROAS.toFixed(2)}x</p>}
                  {loading ? <Skeleton className="h-3 w-8" /> : <p className="text-xs text-muted-foreground">{campaigns.length} campaigns</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Ad Spend</p>
                  {loading ? <Skeleton className="h-6 w-16" /> : <p className="text-2xl font-bold">${summary.totalSpend.toLocaleString()}</p>}
                  {loading ? <Skeleton className="h-3 w-8" /> : <p className="text-xs text-muted-foreground">Total budget</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Impressions</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">{summary.totalImpressions.toLocaleString()}</p>}
                  {loading ? <Skeleton className="h-3 w-8" /> : <p className="text-xs text-muted-foreground">Est. views</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">{summary.totalConversionRate.toFixed(1)}%</p>}
                  {loading ? <Skeleton className="h-3 w-8" /> : <p className="text-xs text-muted-foreground">Avg rate</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="utm">UTM Tracking</TabsTrigger>
            <TabsTrigger value="discounts">Discounts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Active Campaigns</h3>
                <p className="text-muted-foreground">Manage and monitor your advertising campaigns</p>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </div>
                      <div className="grid grid-cols-6 gap-4 mt-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="space-y-1">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-5 w-16" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <Card key={campaign.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            {campaign.type === 'meta_ads' && <Facebook className="h-5 w-5 text-primary" />}
                            {campaign.type === 'tiktok_ads' && <Zap className="h-5 w-5 text-primary" />}
                            {campaign.type === 'email' && <Mail className="h-5 w-5 text-primary" />}
                            {campaign.type === 'discount' && <Percent className="h-5 w-5 text-primary" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{campaign.name}</h3>
                            <p className="text-muted-foreground">{campaign.platform}</p>
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                              {campaign.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-6 gap-4 mt-6">
                        <div>
                          <p className="text-xs text-muted-foreground">Spend</p>
                          <p className="font-bold">${campaign.spend}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                          <p className="font-bold">${campaign.revenue}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">ROAS</p>
                          <p className="font-bold">{campaign.roas.toFixed(2)}x</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Clicks</p>
                          <p className="font-bold">{campaign.clicks}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Conversions</p>
                          <p className="font-bold">{campaign.conversions}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Type</p>
                          <p className="font-bold capitalize">{campaign.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No campaigns found
                </div>
              )}
            </div>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Campaign Performance</CardTitle>
                <CardDescription>Track opens, clicks, and conversions from email marketing</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                        <Skeleton className="h-5 w-64" />
                        <div className="grid grid-cols-5 gap-6">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="text-right space-y-1">
                              <Skeleton className="h-3 w-8" />
                              <Skeleton className="h-4 w-12" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No email campaigns found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* UTM Tracking Tab */}
          <TabsContent value="utm" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>UTM Source Performance</CardTitle>
                <CardDescription>Track traffic and conversions by UTM parameters</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                        <Skeleton className="h-4 w-32" />
                        <div className="grid grid-cols-4 gap-6">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-4 w-16" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No UTM data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discounts Tab */}
          <TabsContent value="discounts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Discount Code Performance</CardTitle>
                <CardDescription>Track usage and effectiveness of discount codes</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                        <Skeleton className="h-4 w-24" />
                        <div className="grid grid-cols-3 gap-6">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-4 w-12" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No discount codes found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Channel Performance</CardTitle>
                  <CardDescription>Performance metrics by marketing channel</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No channel data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Attribution Analysis</CardTitle>
                  <CardDescription>Multi-touch attribution insights</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No attribution data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}