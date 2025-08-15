import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  ArrowUpRight,
  Mail,
  Share2,
  Target,
  BarChart3,
  ExternalLink,
  Play,
  Pause,
  Plus,
  Filter,
  Download
} from "lucide-react";

// Mock marketing data
const marketingData = {
  overview: {
    totalSpend: 45890,
    totalRevenue: 189450,
    roas: 4.13,
    impressions: 2847392,
    clicks: 48567,
    ctr: 1.71,
    conversions: 1247,
    conversionRate: 2.57
  },
  campaigns: [
    {
      id: 'CAM-001',
      name: 'Summer Electronics Sale',
      type: 'Google Ads',
      status: 'active',
      spend: 12450,
      revenue: 52890,
      roas: 4.25,
      impressions: 789432,
      clicks: 12567,
      conversions: 342,
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    },
    {
      id: 'CAM-002',
      name: 'Facebook Fitness Collection',
      type: 'Meta Ads',
      status: 'active',
      spend: 8950,
      revenue: 34670,
      roas: 3.87,
      impressions: 567890,
      clicks: 9870,
      conversions: 234,
      startDate: '2024-01-05',
      endDate: '2024-02-05'
    },
    {
      id: 'CAM-003',
      name: 'Email Newsletter Campaign',
      type: 'Email',
      status: 'completed',
      spend: 450,
      revenue: 12890,
      roas: 28.64,
      impressions: 45000,
      clicks: 2890,
      conversions: 156,
      startDate: '2024-01-10',
      endDate: '2024-01-17'
    },
    {
      id: 'CAM-004',
      name: 'Instagram Influencer Collab',
      type: 'Social',
      status: 'paused',
      spend: 5600,
      revenue: 18940,
      roas: 3.38,
      impressions: 234567,
      clicks: 4567,
      conversions: 89,
      startDate: '2024-01-12',
      endDate: '2024-01-26'
    }
  ],
  emailCampaigns: [
    {
      name: 'Weekly Newsletter #4',
      sent: 12450,
      opened: 4890,
      clicked: 567,
      purchased: 89,
      revenue: 8945,
      sentDate: '2024-01-15'
    },
    {
      name: 'Flash Sale Alert',
      sent: 8950,
      opened: 4230,
      clicked: 890,
      purchased: 156,
      revenue: 12340,
      sentDate: '2024-01-12'
    },
    {
      name: 'New Product Launch',
      sent: 15670,
      opened: 6780,
      clicked: 1234,
      purchased: 234,
      revenue: 18670,
      sentDate: '2024-01-08'
    }
  ],
  utmSources: [
    { source: 'google_ads', clicks: 12567, conversions: 342, revenue: 52890, roas: 4.21 },
    { source: 'facebook_ads', clicks: 9870, conversions: 234, revenue: 34670, roas: 3.51 },
    { source: 'email_newsletter', clicks: 2890, conversions: 156, revenue: 12890, roas: 28.64 },
    { source: 'instagram_influencer', clicks: 4567, conversions: 89, revenue: 18940, roas: 4.15 }
  ],
  discountCodes: [
    { code: 'SAVE20', uses: 456, revenue: 23450, discount: 20 },
    { code: 'WELCOME10', uses: 789, revenue: 15670, discount: 10 },
    { code: 'FLASH30', uses: 234, revenue: 18940, discount: 30 },
    { code: 'STUDENT15', uses: 567, revenue: 12340, discount: 15 }
  ]
};

function getStatusColor(status: string) {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200';
    case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getCampaignIcon(type: string) {
  switch (type) {
    case 'Google Ads': return Target;
    case 'Meta Ads': return Share2;
    case 'Email': return Mail;
    case 'Social': return Users;
    default: return BarChart3;
  }
}

export default function Marketing() {
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
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
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
                  <p className="text-2xl font-bold">{marketingData.overview.roas}x</p>
                  <p className="text-xs text-green-600 flex items-center">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +12.4%
                  </p>
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
                  <p className="text-2xl font-bold">${marketingData.overview.totalSpend.toLocaleString()}</p>
                  <p className="text-xs text-blue-600 flex items-center">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +8.7%
                  </p>
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
                  <p className="text-2xl font-bold">{(marketingData.overview.impressions / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-purple-600 flex items-center">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +15.2%
                  </p>
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
                  <p className="text-2xl font-bold">{marketingData.overview.conversionRate}%</p>
                  <p className="text-xs text-orange-600 flex items-center">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +3.4%
                  </p>
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
              {marketingData.campaigns.map((campaign) => {
                const CampaignIcon = getCampaignIcon(campaign.type);
                return (
                  <Card key={campaign.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-muted rounded-lg">
                            <CampaignIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold">{campaign.name}</h4>
                              <Badge className={getStatusColor(campaign.status)}>
                                {campaign.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{campaign.type} • {campaign.id}</p>
                            <p className="text-xs text-muted-foreground">
                              {campaign.startDate} - {campaign.endDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {campaign.status === 'active' ? (
                            <Button variant="outline" size="sm">
                              <Pause className="w-3 h-3 mr-1" />
                              Pause
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm">
                              <Play className="w-3 h-3 mr-1" />
                              Resume
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
                        <div>
                          <p className="text-xs text-muted-foreground">Spend</p>
                          <p className="text-lg font-bold">${campaign.spend.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                          <p className="text-lg font-bold">${campaign.revenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">ROAS</p>
                          <p className="text-lg font-bold text-green-600">{campaign.roas}x</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Impressions</p>
                          <p className="text-lg font-bold">{campaign.impressions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Clicks</p>
                          <p className="text-lg font-bold">{campaign.clicks.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Conversions</p>
                          <p className="text-lg font-bold">{campaign.conversions}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
                <div className="space-y-4">
                  {marketingData.emailCampaigns.map((email, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{email.name}</p>
                          <p className="text-sm text-muted-foreground">Sent {email.sentDate}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-6 text-right">
                        <div>
                          <p className="text-sm text-muted-foreground">Sent</p>
                          <p className="font-medium">{email.sent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Opened</p>
                          <p className="font-medium">{email.opened.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {((email.opened / email.sent) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Clicked</p>
                          <p className="font-medium">{email.clicked.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {((email.clicked / email.opened) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Purchased</p>
                          <p className="font-medium">{email.purchased}</p>
                          <p className="text-xs text-muted-foreground">
                            {((email.purchased / email.clicked) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Revenue</p>
                          <p className="font-medium text-green-600">${email.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-4">
                  {marketingData.utmSources.map((source, index) => (
                    <div key={source.source} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="w-8 h-6 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{source.source.replace(/_/g, ' ').toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">UTM Source</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-6 text-right">
                        <div>
                          <p className="text-sm text-muted-foreground">Clicks</p>
                          <p className="font-medium">{source.clicks.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Conversions</p>
                          <p className="font-medium">{source.conversions}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Revenue</p>
                          <p className="font-medium">${source.revenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">ROAS</p>
                          <p className="font-medium text-green-600">{source.roas}x</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discounts Tab */}
          <TabsContent value="discounts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Discount Code Performance</CardTitle>
                <CardDescription>Monitor usage and effectiveness of promotional codes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketingData.discountCodes.map((code) => (
                    <div key={code.code} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg font-mono text-sm">
                          {code.code}
                        </div>
                        <div>
                          <p className="font-medium">{code.discount}% Discount</p>
                          <p className="text-sm text-muted-foreground">Promotional Code</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-6 text-right">
                        <div>
                          <p className="text-sm text-muted-foreground">Uses</p>
                          <p className="text-xl font-bold">{code.uses}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Revenue</p>
                          <p className="text-xl font-bold">${code.revenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Avg Order</p>
                          <p className="text-xl font-bold">${Math.round(code.revenue / code.uses)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Channel Performance</CardTitle>
                  <CardDescription>Compare ROAS across different marketing channels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Email Marketing</span>
                        <span className="font-medium">28.6x ROAS</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Google Ads</span>
                        <span className="font-medium">4.2x ROAS</span>
                      </div>
                      <Progress value={15} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Meta Ads</span>
                        <span className="font-medium">3.9x ROAS</span>
                      </div>
                      <Progress value={14} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Social Media</span>
                        <span className="font-medium">3.4x ROAS</span>
                      </div>
                      <Progress value={12} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget Allocation</CardTitle>
                  <CardDescription>Monthly marketing spend by channel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Google Ads</span>
                      <span className="text-lg font-bold">$12,450</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Meta Ads</span>
                      <span className="text-lg font-bold">$8,950</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Email Tools</span>
                      <span className="text-lg font-bold">$450</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Influencers</span>
                      <span className="text-lg font-bold">$5,600</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Spend</span>
                        <span className="text-xl font-bold">${marketingData.overview.totalSpend.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
