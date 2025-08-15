import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Filter,
  Download
} from "lucide-react";

// Mock analytics data
const salesData = {
  revenue: {
    total: 248750,
    growth: 15.2,
    trend: 'up',
    breakdown: [
      { category: 'Electronics', value: 98450, percentage: 39.6 },
      { category: 'Fashion', value: 76890, percentage: 30.9 },
      { category: 'Home & Garden', value: 45320, percentage: 18.2 },
      { category: 'Sports', value: 28090, percentage: 11.3 },
    ]
  },
  conversionFunnel: [
    { stage: 'Page Views', count: 125890, percentage: 100 },
    { stage: 'Product Views', count: 45670, percentage: 36.3 },
    { stage: 'Add to Cart', count: 12340, percentage: 9.8 },
    { stage: 'Checkout Started', count: 8950, percentage: 7.1 },
    { stage: 'Order Completed', count: 4290, percentage: 3.4 },
  ],
  trafficSources: [
    { source: 'Organic Search', visitors: 32450, percentage: 52.1, change: 8.4 },
    { source: 'Direct', visitors: 15670, percentage: 25.2, change: -2.1 },
    { source: 'Social Media', visitors: 7890, percentage: 12.7, change: 15.8 },
    { source: 'Email', visitors: 4320, percentage: 6.9, change: 12.3 },
    { source: 'Paid Ads', visitors: 1890, percentage: 3.1, change: 22.7 },
  ],
  deviceBreakdown: [
    { device: 'Desktop', icon: Monitor, visitors: 28940, percentage: 46.5, conversionRate: 4.2 },
    { device: 'Mobile', icon: Smartphone, visitors: 26780, percentage: 43.0, conversionRate: 2.8 },
    { device: 'Tablet', icon: Tablet, visitors: 6540, percentage: 10.5, conversionRate: 3.5 },
  ],
  topPages: [
    { page: '/products/wireless-headphones', views: 12890, bounceRate: 32.1, avgTime: '3:45' },
    { page: '/products/smart-watch', views: 9870, bounceRate: 28.7, avgTime: '4:12' },
    { page: '/products/laptop-stand', views: 8790, bounceRate: 41.3, avgTime: '2:38' },
    { page: '/products/phone-case', views: 7650, bounceRate: 35.9, avgTime: '3:21' },
    { page: '/sale', views: 6540, bounceRate: 22.5, avgTime: '5:33' },
  ]
};

export default function Analytics() {
  return (
    <DashboardLayout currentPage="analytics">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Deep insights into sales performance, traffic, and customer behavior
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="sales">Sales & Revenue</TabsTrigger>
            <TabsTrigger value="traffic">Traffic & Behavior</TabsTrigger>
            <TabsTrigger value="conversion">Conversion</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          {/* Sales & Revenue Tab */}
          <TabsContent value="sales" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Revenue Overview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Revenue Breakdown</span>
                    <Badge variant="secondary" className="text-green-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{salesData.revenue.growth}%
                    </Badge>
                  </CardTitle>
                  <CardDescription>Revenue by product category (Last 30 days)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-3xl font-bold">
                      ${salesData.revenue.total.toLocaleString()}
                    </div>
                    {salesData.revenue.breakdown.map((item) => (
                      <div key={item.category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.category}</span>
                          <span className="text-muted-foreground">
                            ${item.value.toLocaleString()} ({item.percentage}%)
                          </span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">AOV</p>
                        <p className="text-xl font-bold">$156.78</p>
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
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-xl font-bold">1,587</p>
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
                      <Users className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Customers</p>
                        <p className="text-xl font-bold">892</p>
                        <p className="text-xs text-purple-600 flex items-center">
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                          +15.2%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Traffic & Behavior Tab */}
          <TabsContent value="traffic" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Traffic Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>Where your visitors are coming from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesData.trafficSources.map((source) => (
                      <div key={source.source} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{source.source}</p>
                            <p className="text-sm text-muted-foreground">{source.percentage}%</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{source.visitors.toLocaleString()}</p>
                          <p className={`text-xs flex items-center ${source.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {source.change > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                            {Math.abs(source.change)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Device Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Device Analytics</CardTitle>
                  <CardDescription>Performance by device type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesData.deviceBreakdown.map((device) => (
                      <div key={device.device} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <device.icon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{device.device}</p>
                            <p className="text-sm text-muted-foreground">{device.percentage}%</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{device.visitors.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {device.conversionRate}% CVR
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Pages */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Pages</CardTitle>
                <CardDescription>Most visited pages and their performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesData.topPages.map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="w-8 h-6 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{page.page}</p>
                          <p className="text-sm text-muted-foreground">{page.views.toLocaleString()} views</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-right">
                        <div>
                          <p className="text-sm font-medium">{page.bounceRate}%</p>
                          <p className="text-xs text-muted-foreground">Bounce Rate</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{page.avgTime}</p>
                          <p className="text-xs text-muted-foreground">Avg Time</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversion Tab */}
          <TabsContent value="conversion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Funnel Analysis</CardTitle>
                <CardDescription>Customer journey from page view to purchase</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {salesData.conversionFunnel.map((stage, index) => (
                    <div key={stage.stage} className="relative">
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="w-8 h-6 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">{stage.stage}</p>
                            <p className="text-sm text-muted-foreground">{stage.percentage}% of total</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{stage.count.toLocaleString()}</p>
                          {index > 0 && (
                            <p className="text-sm text-muted-foreground">
                              {((stage.count / salesData.conversionFunnel[index - 1].count) * 100).toFixed(1)}% conversion
                            </p>
                          )}
                        </div>
                      </div>
                      {index < salesData.conversionFunnel.length - 1 && (
                        <div className="flex justify-center mt-2 mb-2">
                          <ArrowDownRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Conversion Rate</span>
                    <span className="text-2xl font-bold text-green-600">3.4%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Customers</p>
                      <p className="text-xl font-bold">12,847</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">New This Month</p>
                      <p className="text-xl font-bold">1,247</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Avg LTV</p>
                      <p className="text-xl font-bold">$342</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Retention Rate</p>
                      <p className="text-xl font-bold">68.4%</p>
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
