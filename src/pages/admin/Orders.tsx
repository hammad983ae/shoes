import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Filter,
  Download,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/hooks/useOrders";

export default function Orders() {
  const { loading, orders, summary, fulfillmentStats } = useOrders();
  
  return (
    <DashboardLayout currentPage="orders">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders & Fulfillment</h1>
            <p className="text-muted-foreground">
              Manage orders, track fulfillment, and monitor shipping performance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              Create Order
            </Button>
          </div>
        </div>

        {/* Order Status Summary */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-bold">{summary.total}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold">{summary.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Processing</p>
                  <p className="text-xl font-bold">{summary.processing}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Shipped</p>
                  <p className="text-xl font-bold">{summary.shipped}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="text-xl font-bold">{summary.delivered}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Returned</p>
                  <p className="text-xl font-bold">{summary.returned}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="orders">All Orders</TabsTrigger>
            <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          {/* All Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search orders..." className="pl-10" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Orders Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders and their current status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-5 w-5 rounded" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-8">
                          <div className="text-right space-y-1">
                            <Skeleton className="h-3 w-8" />
                            <Skeleton className="h-4 w-12" />
                          </div>
                          <div className="text-right space-y-1">
                            <Skeleton className="h-3 w-8" />
                            <Skeleton className="h-4 w-8" />
                          </div>
                          <div className="text-right space-y-1">
                            <Skeleton className="h-3 w-8" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <div className="text-right space-y-1">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </div>
                    ))
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No orders found
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fulfillment Tab */}
          <TabsContent value="fulfillment" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Fulfillment Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Fulfillment Performance</CardTitle>
                  <CardDescription>Key metrics for order processing and shipping</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Avg. Processing Time</span>
                      <span className="text-2xl font-bold">{fulfillmentStats.avgProcessingTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Avg. Shipping Time</span>
                      <span className="text-2xl font-bold">{fulfillmentStats.avgShippingTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">On-Time Delivery</span>
                      <span className="text-2xl font-bold text-green-600">{fulfillmentStats.onTimeDelivery}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Return Rate</span>
                      <span className="text-2xl font-bold text-orange-600">{fulfillmentStats.returnRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Pipeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Pipeline</CardTitle>
                  <CardDescription>Orders moving through fulfillment stages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium">Pending Payment</p>
                          <p className="text-sm text-muted-foreground">Awaiting payment confirmation</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{summary.pending}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <Package className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Processing</p>
                          <p className="text-sm text-muted-foreground">Being prepared for shipment</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{summary.processing}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200">
                      <div className="flex items-center space-x-3">
                        <Truck className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">In Transit</p>
                          <p className="text-sm text-muted-foreground">Out for delivery</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{summary.shipped}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span>Low Stock Alerts</span>
                </CardTitle>
                <CardDescription>Products that need restocking soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-orange-200 bg-orange-50">
                        <div className="flex items-center space-x-3">
                          <Package className="h-5 w-5 text-orange-600" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right space-y-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-6 w-8" />
                          </div>
                          <Skeleton className="h-8 w-16 rounded" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No stock alerts
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
