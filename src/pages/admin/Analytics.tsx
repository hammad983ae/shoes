import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Filter,
  Download
} from "lucide-react";

export default function Analytics() {
  const [loading] = useState(true);

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