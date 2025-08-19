import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationsModal } from "@/components/NotificationsModal";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  Users, 
  Eye,
  AlertTriangle,
  Clock,
  Download,
  MoreHorizontal
} from "lucide-react";

function KPICard({ title, value, loading = true, isCurrency = false }: {
  title: string;
  value?: number;
  loading?: boolean;
  isCurrency?: boolean;
}) {
  const formatValue = (val: number) => {
    if (isCurrency) return `$${val.toFixed(2)}`;
    if (title === "Conversion Rate" || title === "Cart Abandonment" || title === "Bounce Rate") {
      return `${val.toFixed(1)}%`;
    }
    return val.toString();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {loading ? (
          <Skeleton className="h-4 w-8" />
        ) : (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <span>0%</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{formatValue(value || 0)}</div>
        )}
        <div className="text-xs text-muted-foreground mt-1">
          {loading ? <Skeleton className="h-3 w-24" /> : "No data available"}
        </div>
      </CardContent>
    </Card>
  );
}

function KPIGrid({ loading = true, stats }: { loading?: boolean; stats?: any }) {
  return (
    <>
      {/* Primary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Revenue" value={stats?.revenue} loading={loading} isCurrency={true} />
        <KPICard title="Orders" value={stats?.orders} loading={loading} />
        <KPICard title="Average Order Value" value={stats?.averageOrderValue} loading={loading} isCurrency={true} />
        <KPICard title="Conversion Rate" value={stats?.conversionRate} loading={loading} />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="New Customers" value={stats?.newCustomers} loading={loading} />
        <KPICard title="Returning Customers" value={stats?.returningCustomers} loading={loading} />
        <KPICard title="Cart Abandonment" value={stats?.cartAbandonment} loading={loading} />
        <KPICard title="Bounce Rate" value={stats?.bounceRate} loading={loading} />
      </div>
    </>
  );
}

export default function Dashboard() {
  const { loading: adminLoading, recentOrders, alerts, stats: realStats } = useAdminDashboard();
  const [timeRange, setTimeRange] = useState('today');
  const { loading: analyticsLoading, stats: analyticsStats } = useAnalytics(timeRange);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const navigate = useNavigate();
  
  // Combine real Supabase data with PostHog analytics where needed
  const stats = {
    ...realStats,
    pageViews: analyticsStats.pageViews,
    uniqueVisitors: analyticsStats.uniqueVisitors,
    avgSessionDuration: analyticsStats.avgSessionDuration,
    topSource: analyticsStats.topSource
  };
  
  const loading = adminLoading || analyticsLoading;

  // Mock notifications for the modal
  const notifications = [
    { id: "1", title: "Low Stock Alert", message: "Rick Owens Geobaskets are running low in stock", time: "2 hours ago", type: "warning" as const, read: false },
    { id: "2", title: "New Order", message: "Order #1234 has been placed", time: "5 hours ago", type: "info" as const, read: true },
    { id: "3", title: "Payment Failed", message: "Payment failed for order #1233", time: "1 day ago", type: "error" as const, read: false },
  ];

  const handleExportReport = () => {
    // Generate CSV export
    const csvData = [
      ['Metric', 'Value', 'Date'],
      ['Revenue', stats?.revenue || 0, new Date().toISOString().split('T')[0]],
      ['Orders', stats?.orders || 0, new Date().toISOString().split('T')[0]],
      ['AOV', stats?.averageOrderValue || 0, new Date().toISOString().split('T')[0]],
      ['Conversion Rate', stats?.conversionRate || 0, new Date().toISOString().split('T')[0]]
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  return (
    <DashboardLayout currentPage="dashboard">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your store.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleExportReport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm" onClick={() => navigate('/admin/analytics')}>
              View Analytics
            </Button>
          </div>
        </div>

        {/* Time Period Tabs */}
        <Tabs value={timeRange} onValueChange={setTimeRange} className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-5">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            <KPIGrid loading={loading} stats={stats} />
          </TabsContent>

          <TabsContent value="7d" className="space-y-6">
            <KPIGrid loading={loading} stats={stats} />
          </TabsContent>

          <TabsContent value="30d" className="space-y-6">
            <KPIGrid loading={loading} stats={stats} />
          </TabsContent>

          <TabsContent value="90d" className="space-y-6">
            <KPIGrid loading={loading} stats={stats} />
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <KPIGrid loading={loading} stats={stats} />
          </TabsContent>
        </Tabs>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Orders */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Real-time order activity</CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col space-y-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right space-y-1">
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  ))
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent orders found
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{order.id}</span>
                          <span className="text-sm text-muted-foreground">{order.customer}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium">${order.amount}</div>
                          <div className="text-xs text-muted-foreground">{order.time}</div>
                        </div>
                        <Badge variant="outline">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/admin/orders')}>
                View All Orders
              </Button>
            </CardContent>
          </Card>

          {/* Alerts & Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Alerts</span>
              </CardTitle>
              <CardDescription>Important notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex space-x-3 p-3 rounded-lg border">
                      <Skeleton className="w-2 h-2 rounded-full mt-2" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))
                ) : alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No alerts to display
                  </div>
                ) : (
                alerts.slice(0, 3).map((alert, index) => (
                  <div key={index} className="flex space-x-3 p-3 rounded-lg border">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 bg-muted" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{alert.time}</p>
                    </div>
                  </div>
                ))
                )}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => setShowNotificationsModal(true)}>
                View All Notifications
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                 <div>
                   <p className="text-sm text-muted-foreground">Page Views</p>
                   {loading ? <Skeleton className="h-6 w-16" /> : <p className="text-xl font-bold">{stats.pageViews.toLocaleString()}</p>}
                 </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                 <div>
                   <p className="text-sm text-muted-foreground">Unique Visitors</p>
                   {loading ? <Skeleton className="h-6 w-16" /> : <p className="text-xl font-bold">{stats.uniqueVisitors.toLocaleString()}</p>}
                 </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                 <div>
                   <p className="text-sm text-muted-foreground">Avg. Session</p>
                   {loading ? <Skeleton className="h-6 w-16" /> : <p className="text-xl font-bold">{stats.avgSessionDuration}</p>}
                 </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                 <div>
                   <p className="text-sm text-muted-foreground">Top Source</p>
                   {loading ? <Skeleton className="h-6 w-16" /> : <p className="text-xl font-bold">{stats.topSource}</p>}
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <NotificationsModal 
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        notifications={notifications}
        loading={loading}
      />
    </DashboardLayout>
  );
}
