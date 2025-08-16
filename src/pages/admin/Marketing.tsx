import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  DollarSign,
  Eye,
  Target,
  Plus,
  Filter,
  Download
} from "lucide-react";

export default function Marketing() {
  const [loading] = useState(true);

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
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">0x</p>}
                  {loading ? <Skeleton className="h-3 w-8" /> : <p className="text-xs text-muted-foreground">No data</p>}
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
                  {loading ? <Skeleton className="h-6 w-16" /> : <p className="text-2xl font-bold">$0</p>}
                  {loading ? <Skeleton className="h-3 w-8" /> : <p className="text-xs text-muted-foreground">No data</p>}
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
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">0</p>}
                  {loading ? <Skeleton className="h-3 w-8" /> : <p className="text-xs text-muted-foreground">No data</p>}
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
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">0%</p>}
                  {loading ? <Skeleton className="h-3 w-8" /> : <p className="text-xs text-muted-foreground">No data</p>}
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