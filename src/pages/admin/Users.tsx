import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users as UsersIcon,
  Search,
  Filter,
  Download,
  Plus,
  UserPlus,
  UserCheck,
  Star,
  TrendingUp,
  DollarSign
} from "lucide-react";

export default function Users() {
  const [loading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const usersData = {
    summary: {
      totalUsers: 0,
      activeUsers: 0,
      creators: 0,
      newThisMonth: 0,
      avgLTV: 0
    }
  };

  return (
    <DashboardLayout currentPage="users">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users & Creators</h1>
            <p className="text-muted-foreground">
              Manage your community, creators, and user-generated content
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Users
            </Button>
            <Button size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Creator
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UsersIcon className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">{usersData.summary.totalUsers}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">{usersData.summary.activeUsers}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Creators</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">{usersData.summary.creators}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">New This Month</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">{usersData.summary.newThisMonth}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg LTV</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">$0</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="users">All Users</TabsTrigger>
            <TabsTrigger value="creators">Creators</TabsTrigger>
            <TabsTrigger value="ugc">UGC Content</TabsTrigger>
          </TabsList>

          {/* All Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search users by email or name..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts, roles, and segments</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-8">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="text-right space-y-1">
                              <Skeleton className="h-3 w-16" />
                              <Skeleton className="h-4 w-12" />
                            </div>
                          ))}
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Creators Tab */}
          <TabsContent value="creators" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Creator Management</h3>
                <p className="text-muted-foreground">Manage creator partnerships and performance</p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Creator
              </Button>
            </div>

            {/* Creator Performance Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-12 rounded" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="space-y-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-4 w-12" />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2 pt-2">
                        <Skeleton className="h-8 w-16 rounded" />
                        <Skeleton className="h-8 w-16 rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No creators found
                </div>
              )}
            </div>
          </TabsContent>

          {/* UGC Content Tab */}
          <TabsContent value="ugc" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">User-Generated Content</h3>
                <p className="text-muted-foreground">Review and manage creator content performance</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter by Status
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
                <CardDescription>User-generated content and its impact on sales</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-6 text-right">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-1">
                              <Skeleton className="h-3 w-12" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No UGC content found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}