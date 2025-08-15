import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  Eye,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from "lucide-react";

// Mock data - in real app this would come from API
const kpiData = {
  today: {
    revenue: { value: 12450, change: 12.5, trend: 'up' },
    orders: { value: 86, change: -2.3, trend: 'down' },
    aov: { value: 144.77, change: 15.2, trend: 'up' },
    conversion: { value: 3.4, change: 8.7, trend: 'up' },
    newCustomers: { value: 24, change: 20.0, trend: 'up' },
    returning: { value: 62, change: -5.1, trend: 'down' },
    abandonment: { value: 68.2, change: -3.2, trend: 'down' },
    bounceRate: { value: 42.1, change: -7.8, trend: 'down' }
  },
  '7d': {
    revenue: { value: 89340, change: 18.4, trend: 'up' },
    orders: { value: 623, change: 5.7, trend: 'up' },
    aov: { value: 143.42, change: 12.1, trend: 'up' },
    conversion: { value: 3.1, change: 6.3, trend: 'up' },
    newCustomers: { value: 156, change: 24.8, trend: 'up' },
    returning: { value: 467, change: 2.4, trend: 'up' },
    abandonment: { value: 69.8, change: -5.2, trend: 'down' },
    bounceRate: { value: 45.3, change: -4.1, trend: 'down' }
  },
  '30d': {
    revenue: { value: 394560, change: 22.3, trend: 'up' },
    orders: { value: 2847, change: 15.6, trend: 'up' },
    aov: { value: 138.67, change: 5.8, trend: 'up' },
    conversion: { value: 2.9, change: 11.2, trend: 'up' },
    newCustomers: { value: 892, change: 31.4, trend: 'up' },
    returning: { value: 1955, change: 8.9, trend: 'up' },
    abandonment: { value: 71.2, change: -8.7, trend: 'down' },
    bounceRate: { value: 47.8, change: -6.3, trend: 'down' }
  },
  '90d': {
    revenue: { value: 1248920, change: 28.7, trend: 'up' },
    orders: { value: 9234, change: 19.3, trend: 'up' },
    aov: { value: 135.23, change: 7.9, trend: 'up' },
    conversion: { value: 2.7, change: 14.8, trend: 'up' },
    newCustomers: { value: 3247, change: 42.1, trend: 'up' },
    returning: { value: 5987, change: 12.6, trend: 'up' },
    abandonment: { value: 73.5, change: -12.4, trend: 'down' },
    bounceRate: { value: 49.2, change: -9.1, trend: 'down' }
  }
};

const recentOrders = [
  { id: '#3492', customer: 'Sarah Johnson', amount: 299.99, status: 'processing', time: '2 min ago' },
  { id: '#3491', customer: 'Mike Chen', amount: 189.50, status: 'shipped', time: '5 min ago' },
  { id: '#3490', customer: 'Emma Davis', amount: 449.99, status: 'delivered', time: '12 min ago' },
  { id: '#3489', customer: 'James Wilson', amount: 89.99, status: 'pending', time: '18 min ago' },
  { id: '#3488', customer: 'Lisa Brown', amount: 329.99, status: 'processing', time: '25 min ago' },
];

const alerts = [
  { type: 'warning', title: 'High cart abandonment', message: 'Abandonment rate increased 15% vs yesterday', time: '1 hour ago' },
  { type: 'success', title: 'Sales goal achieved', message: 'Monthly revenue target reached with 3 days remaining', time: '2 hours ago' },
  { type: 'info', title: 'Low inventory alert', message: '4 products are running low on stock', time: '4 hours ago' },
];

// Get comparison period text
const getComparisonText = (period: string) => {
  switch (period) {
    case 'today': return 'vs yesterday';
    case '7d': return 'vs previous 7 days';
    case '30d': return 'vs previous 30 days';
    case '90d': return 'vs previous 90 days';
    default: return 'vs previous period';
  }
};

function KPICard({ title, value, change, trend, prefix = '', suffix = '', format = 'number', period = 'today' }: {
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
  prefix?: string;
  suffix?: string;
  format?: 'number' | 'currency' | 'percentage';
  period?: string;
}) {
  const formatValue = (val: number) => {
    if (format === 'currency') return `$${val.toLocaleString()}`;
    if (format === 'percentage') return `${val}%`;
    return val.toLocaleString();
  };

  const isPositive = (trend === 'up' && change > 0) || (trend === 'down' && change < 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`flex items-center space-x-1 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          <span>{Math.abs(change)}%</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}{formatValue(value)}{suffix}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {getComparisonText(period)}
        </div>
      </CardContent>
    </Card>
  );
}

function KPIGrid({ period, data }: { period: string; data: any }) {
  return (
    <>
      {/* Primary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Revenue"
          value={data.revenue.value}
          change={data.revenue.change}
          trend={data.revenue.trend}
          format="currency"
          period={period}
        />
        <KPICard
          title="Orders"
          value={data.orders.value}
          change={data.orders.change}
          trend={data.orders.trend}
          period={period}
        />
        <KPICard
          title="Average Order Value"
          value={data.aov.value}
          change={data.aov.change}
          trend={data.aov.trend}
          format="currency"
          period={period}
        />
        <KPICard
          title="Conversion Rate"
          value={data.conversion.value}
          change={data.conversion.change}
          trend={data.conversion.trend}
          format="percentage"
          period={period}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="New Customers"
          value={data.newCustomers.value}
          change={data.newCustomers.change}
          trend={data.newCustomers.trend}
          period={period}
        />
        <KPICard
          title="Returning Customers"
          value={data.returning.value}
          change={data.returning.change}
          trend={data.returning.trend}
          period={period}
        />
        <KPICard
          title="Cart Abandonment"
          value={data.abandonment.value}
          change={data.abandonment.change}
          trend="down"
          format="percentage"
          period={period}
        />
        <KPICard
          title="Bounce Rate"
          value={data.bounceRate.value}
          change={data.bounceRate.change}
          trend="down"
          format="percentage"
          period={period}
        />
      </div>
    </>
  );
}

export default function Dashboard() {
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
            <Button variant="outline" size="sm">
              Export Report
            </Button>
            <Button size="sm">
              View Analytics
            </Button>
          </div>
        </div>

        {/* Time Period Tabs */}
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            <KPIGrid period="today" data={kpiData.today} />
          </TabsContent>

          <TabsContent value="7d" className="space-y-6">
            <KPIGrid period="7d" data={kpiData['7d']} />
          </TabsContent>

          <TabsContent value="30d" className="space-y-6">
            <KPIGrid period="30d" data={kpiData['30d']} />
          </TabsContent>

          <TabsContent value="90d" className="space-y-6">
            <KPIGrid period="90d" data={kpiData['90d']} />
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
                {recentOrders.map((order) => (
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
                      <Badge variant={
                        order.status === 'delivered' ? 'default' :
                        order.status === 'shipped' ? 'secondary' :
                        order.status === 'processing' ? 'outline' : 'destructive'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
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
                {alerts.map((alert, index) => (
                  <div key={index} className="flex space-x-3 p-3 rounded-lg border">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      alert.type === 'warning' ? 'bg-yellow-500' :
                      alert.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
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
                  <p className="text-xl font-bold">24,892</p>
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
                  <p className="text-xl font-bold">8,429</p>
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
                  <p className="text-xl font-bold">4m 32s</p>
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
                  <p className="text-xl font-bold">Google</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
