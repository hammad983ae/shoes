
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCampaigns } from "@/hooks/useCampaigns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  DollarSign,
  Eye,
  Target,
  Filter,
  Download,
  Facebook,
  Zap,
  Mail,
  Percent,
  Search
} from "lucide-react";

export default function Marketing() {
  useRequireAdmin();
  const { loading, campaigns, summary } = useCampaigns();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleExportCampaigns = async () => {
    try {
      const { data } = await supabase.functions.invoke('export-csv', {
        body: { type: 'campaigns' }
      });
      
      if (data) {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'campaigns_export.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Export successful",
          description: "Campaigns exported to CSV file",
        });
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export campaigns",
        variant: "destructive",
      });
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.platform?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Button variant="outline" size="sm" onClick={handleExportCampaigns}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Select onValueChange={(value) => {
              if (value === 'meta') window.open('https://business.facebook.com/adsmanager', '_blank');
              else if (value === 'tiktok') window.open('https://ads.tiktok.com', '_blank');
              else if (value === 'email') alert('Email campaign builder coming soon!');
              else if (value === 'discount') alert('Discount code generator coming soon!');
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Create Campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meta">Meta Ads Manager</SelectItem>
                <SelectItem value="tiktok">TikTok Ads</SelectItem>
                <SelectItem value="email">Email Campaign</SelectItem>
                <SelectItem value="discount">Discount Codes</SelectItem>
              </SelectContent>
            </Select>
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
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search campaigns..." 
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
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
              ) : filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((campaign) => (
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