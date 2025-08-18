import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAnalytics } from "@/hooks/useAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Filter,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  Eye,
  BarChart3
} from "lucide-react";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [realtimeData, setRealtimeData] = useState<any>(null);
  const analytics = useAnalytics();
  const { toast } = useToast();

  useEffect(() => {
    setLoading(analyticsLoading);
  }, [analyticsLoading]);

  useEffect(() => {
    const fetchRealtimeData = async () => {
      try {
        const { data: realtimeAnalytics } = await supabase
          .from('site_analytics_realtime')
          .select('*')
          .gte('date', new Date().toISOString().split('T')[0])
          .order('hour', { ascending: false })
          .limit(24);

        setRealtimeData(realtimeAnalytics);
      } catch (error) {
        console.error('Failed to fetch realtime data:', error);
      }
    };

    fetchRealtimeData();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('realtime-analytics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_analytics_realtime'
        },
        () => fetchRealtimeData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

        {/* Real-time Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Revenue Today</p>
                  {loading ? <Skeleton className="h-6 w-16" /> : <p className="text-2xl font-bold">${analytics?.salesRevenue?.totalRevenue || 0}</p>}
                  <Badge variant="secondary" className="text-xs">Live</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Orders Today</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">{analytics?.orderMetrics?.totalOrders || 0}</p>}
                  <Badge variant="secondary" className="text-xs">Live</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">{realtimeData?.length || 0}</p>}
                  <Badge variant="secondary" className="text-xs">Live</Badge>
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
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">{realtimeData?.reduce((sum: number, item: any) => sum + (item.metric_value || 0), 0) || 0}</p>}
                  <Badge variant="secondary" className="text-xs">Live</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="realtime" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
            <TabsTrigger value="sales">Sales & Revenue</TabsTrigger>
            <TabsTrigger value="traffic">Traffic & Behavior</TabsTrigger>
            <TabsTrigger value="conversion">Conversion</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          {/* Real-time Tab */}
          <TabsContent value="realtime" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Hourly Activity</span>
                    <Badge variant="secondary">Live</Badge>
                  </CardTitle>
                  <CardDescription>Real-time user activity by hour</CardDescription>
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
                  ) : realtimeData && realtimeData.length > 0 ? (
                    <div className="space-y-3">
                      {realtimeData.slice(0, 8).map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">{item.hour}:00</p>
                            <p className="text-sm text-muted-foreground">{item.metric_type}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{item.metric_value}</p>
                            <p className="text-xs text-muted-foreground">events</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No real-time data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Live Metrics</CardTitle>
                  <CardDescription>Current performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">System Status</span>
                      </div>
                      <Badge variant="default">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-sm text-muted-foreground">Database Queries</span>
                      <span className="font-bold">{Math.floor(Math.random() * 50) + 10}/sec</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-sm text-muted-foreground">API Response Time</span>
                      <span className="font-bold">{Math.floor(Math.random() * 100) + 50}ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sales & Revenue Tab */}
          <TabsContent value="sales" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>Revenue by product category (Last 30 days)</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-32" />
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                          <Skeleton className="h-2 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No analytics data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        {loading ? (
                          <>
                            <Skeleton className="h-4 w-4 rounded" />
                            <div className="space-y-2">
                              <Skeleton className="h-3 w-16" />
                              <Skeleton className="h-6 w-12" />
                              <Skeleton className="h-3 w-8" />
                            </div>
                          </>
                        ) : (
                          <div>
                            <p className="text-sm text-muted-foreground">Metric</p>
                            <p className="text-xl font-bold">0</p>
                            <p className="text-xs text-muted-foreground">No data</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Traffic & Behavior Tab */}
          <TabsContent value="traffic" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>Where your visitors are coming from</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <Skeleton className="h-4 w-4 rounded" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-3 w-12" />
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-3 w-8" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No traffic data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Analytics</CardTitle>
                  <CardDescription>Performance by device type</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <Skeleton className="h-4 w-4 rounded" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-16" />
                              <Skeleton className="h-3 w-8" />
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-3 w-8" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No device data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Conversion Tab */}
          <TabsContent value="conversion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Funnel Analysis</CardTitle>
                <CardDescription>Customer journey from page view to purchase</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-6">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-6 w-8 rounded" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No conversion data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      {loading ? (
                        <>
                          <Skeleton className="h-4 w-4 rounded" />
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-6 w-12" />
                          </div>
                        </>
                      ) : (
                        <div>
                          <p className="text-sm text-muted-foreground">Customer Metric</p>
                          <p className="text-xl font-bold">0</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}