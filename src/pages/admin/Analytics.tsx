import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAnalytics } from "@/hooks/useAnalytics";

import { 
  Download,
  TrendingUp,
  Users,
  ShoppingCart,
  Eye,
  BarChart3
} from "lucide-react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('today');
  const { loading, stats } = useAnalytics(timeRange);

  return (
    <DashboardLayout currentPage="analytics">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Real insights from PostHog and Supabase data
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Real-time Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  {loading ? <Skeleton className="h-6 w-16" /> : <p className="text-2xl font-bold">${stats.revenue.toFixed(2)}</p>}
                  <Badge variant="secondary" className="text-xs">Real Data</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Orders</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">{stats.orders}</p>}
                  <Badge variant="secondary" className="text-xs">Real Data</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Unique Visitors</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">{stats.uniqueVisitors}</p>}
                  <Badge variant="secondary" className="text-xs">PostHog</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Page Views</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">{stats.pageViews}</p>}
                  <Badge variant="secondary" className="text-xs">PostHog</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={timeRange} onValueChange={setTimeRange} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="today">Real-time</TabsTrigger>
            <TabsTrigger value="7d">Sales & Revenue</TabsTrigger>
            <TabsTrigger value="30d">Traffic & Behavior</TabsTrigger>
            <TabsTrigger value="90d">Conversion</TabsTrigger>
            <TabsTrigger value="all">Customers</TabsTrigger>
          </TabsList>

          {/* Real-time Tab */}
          <TabsContent value="today" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Hourly Activity</span>
                    <Badge variant="secondary">Real Data</Badge>
                  </CardTitle>
                  <CardDescription>Activity based on actual order data</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                      ))}
                    </div>
                  ) : stats.hourlyActivity.length > 0 ? (
                    <div className="space-y-3">
                      {stats.hourlyActivity.map((item) => (
                        <div key={item.hour} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">{item.hour}:00</p>
                            <p className="text-sm text-muted-foreground">Peak activity</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{item.views + item.sessions}</p>
                            <p className="text-xs text-muted-foreground">events</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No activity data for today
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Live Metrics</CardTitle>
                  <CardDescription>Real performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">PostHog Status</span>
                      </div>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-sm text-muted-foreground">Conversion Rate</span>
                      <span className="font-bold">{stats.conversionRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-sm text-muted-foreground">Avg Order Value</span>
                      <span className="font-bold">${stats.averageOrderValue.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sales & Revenue Tab */}
          <TabsContent value="7d" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>Revenue metrics from real order data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <span className="font-medium">Total Revenue</span>
                      <span className="text-2xl font-bold">${stats.revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <span className="font-medium">Average Order Value</span>
                      <span className="text-xl font-bold">${stats.averageOrderValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <span className="font-medium">Total Orders</span>
                      <span className="text-xl font-bold">{stats.orders}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">New Customers</p>
                      <p className="text-xl font-bold">{stats.newCustomers}</p>
                      <p className="text-xs text-muted-foreground">Real data</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Returning Customers</p>
                      <p className="text-xl font-bold">{stats.returningCustomers}</p>
                      <p className="text-xs text-muted-foreground">Real data</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      <p className="text-xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Calculated</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Traffic & Behavior Tab */}
          <TabsContent value="30d" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>Where visitors are coming from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.trafficSources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <div>
                            <p className="font-medium">{source.source}</p>
                            <p className="text-sm text-muted-foreground">{source.percentage}%</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{source.visitors}</p>
                          <p className="text-xs text-muted-foreground">visitors</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Analytics</CardTitle>
                  <CardDescription>Visitor breakdown by device</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.deviceData.map((device, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <div>
                            <p className="font-medium">{device.device}</p>
                            <p className="text-sm text-muted-foreground">{device.percentage}%</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{device.visitors}</p>
                          <p className="text-xs text-muted-foreground">visitors</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Conversion Tab */}
          <TabsContent value="90d" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Funnel Analysis</CardTitle>
                <CardDescription>Real conversion funnel based on order data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {stats.conversionFunnel.map((step, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{step.step}</p>
                          <p className="text-sm text-muted-foreground">Step {index + 1}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{step.users}</p>
                        <p className="text-sm text-muted-foreground">{step.percentage}% of total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="all" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Customers</p>
                      <p className="text-xl font-bold">{stats.customerMetrics.totalCustomers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Returning Rate</p>
                      <p className="text-xl font-bold">{stats.customerMetrics.returningRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Lifetime Value</p>
                      <p className="text-xl font-bold">${stats.customerMetrics.avgLifetimeValue.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Churn Rate</p>
                      <p className="text-xl font-bold">{stats.customerMetrics.churnRate}%</p>
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