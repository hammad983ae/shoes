import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Users as UsersIcon,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  UserPlus,
  UserCheck,
  Star,
  TrendingUp,
  DollarSign,
  Camera,
  Video,
  Image,
  Heart,
  MessageSquare,
  Share2
} from "lucide-react";

// Mock user data
const usersData = {
  summary: {
    totalUsers: 12847,
    activeUsers: 8234,
    creators: 456,
    newThisMonth: 1247,
    avgLTV: 342
  },
  users: [
    {
      id: 'user-001',
      email: 'sarah.johnson@example.com',
      displayName: 'Sarah Johnson',
      role: 'customer',
      isCreator: false,
      creatorTier: null,
      commissionRate: 0,
      couponCode: null,
      credits: 150,
      totalOrders: 12,
      totalSpent: 2847.50,
      lastOrder: '2024-01-14',
      createdAt: '2023-08-15',
      status: 'active',
      segment: 'VIP'
    },
    {
      id: 'user-002',
      email: 'mike.chen@example.com',
      displayName: 'Mike Chen',
      role: 'creator',
      isCreator: true,
      creatorTier: 'Gold',
      commissionRate: 15,
      couponCode: 'MIKE15',
      credits: 890,
      totalOrders: 34,
      totalSpent: 5690.25,
      lastOrder: '2024-01-15',
      createdAt: '2023-06-20',
      status: 'active',
      segment: 'Creator'
    },
    {
      id: 'user-003',
      email: 'emma.davis@example.com',
      displayName: 'Emma Davis',
      role: 'customer',
      isCreator: false,
      creatorTier: null,
      commissionRate: 0,
      couponCode: null,
      credits: 45,
      totalOrders: 3,
      totalSpent: 567.89,
      lastOrder: '2024-01-10',
      createdAt: '2024-01-05',
      status: 'active',
      segment: 'New'
    },
    {
      id: 'user-004',
      email: 'james.wilson@example.com',
      displayName: 'James Wilson',
      role: 'creator',
      isCreator: true,
      creatorTier: 'Silver',
      commissionRate: 10,
      couponCode: 'JAMES10',
      credits: 234,
      totalOrders: 8,
      totalSpent: 1245.67,
      lastOrder: '2024-01-12',
      createdAt: '2023-11-10',
      status: 'active',
      segment: 'Creator'
    },
    {
      id: 'user-005',
      email: 'alex.rivera@example.com',
      displayName: 'Alex Rivera',
      role: 'creator',
      isCreator: true,
      creatorTier: 'Platinum',
      commissionRate: 20,
      couponCode: 'ALEX20',
      credits: 1450,
      totalOrders: 67,
      totalSpent: 8945.32,
      lastOrder: '2024-01-15',
      createdAt: '2023-03-12',
      status: 'active',
      segment: 'Creator'
    }
  ],
  ugcContent: [
    {
      id: 'ugc-001',
      creatorId: 'user-002',
      creatorName: 'Mike Chen',
      type: 'video',
      title: 'Unboxing the New Wireless Headphones',
      description: 'Amazing sound quality and design!',
      platform: 'Instagram',
      url: 'https://instagram.com/p/abc123',
      views: 45230,
      likes: 3420,
      comments: 234,
      shares: 156,
      conversionRate: 8.7,
      sales: 89,
      revenue: 4450,
      createdAt: '2024-01-10',
      status: 'approved'
    },
    {
      id: 'ugc-002',
      creatorId: 'user-004',
      creatorName: 'James Wilson',
      type: 'image',
      title: 'Perfect workout companion',
      description: 'This fitness watch tracks everything!',
      platform: 'TikTok',
      url: 'https://tiktok.com/p/def456',
      views: 23567,
      likes: 1890,
      comments: 123,
      shares: 89,
      conversionRate: 5.4,
      sales: 34,
      revenue: 2340,
      createdAt: '2024-01-08',
      status: 'approved'
    },
    {
      id: 'ugc-003',
      creatorId: 'user-005',
      creatorName: 'Alex Rivera',
      type: 'video',
      title: 'Daily routine with my favorite products',
      description: 'How these products changed my morning routine',
      platform: 'YouTube',
      url: 'https://youtube.com/watch?v=ghi789',
      views: 89450,
      likes: 7234,
      comments: 567,
      shares: 423,
      conversionRate: 12.3,
      sales: 234,
      revenue: 15670,
      createdAt: '2024-01-05',
      status: 'approved'
    },
    {
      id: 'ugc-004',
      creatorId: 'user-002',
      creatorName: 'Mike Chen',
      type: 'image',
      title: 'Travel essentials pack',
      description: 'Everything I need for my trips',
      platform: 'Instagram',
      url: 'https://instagram.com/p/jkl012',
      views: 15678,
      likes: 1234,
      comments: 89,
      shares: 45,
      conversionRate: 6.8,
      sales: 23,
      revenue: 1890,
      createdAt: '2024-01-12',
      status: 'pending'
    }
  ]
};

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'image': return Image;
      default: return Camera;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const creators = usersData.users.filter(user => user.isCreator);
  const ugcContent = usersData.ugcContent;

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
                  <p className="text-2xl font-bold">{usersData.summary.totalUsers.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold">{usersData.summary.activeUsers.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold">{usersData.summary.creators}</p>
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
                  <p className="text-2xl font-bold">{usersData.summary.newThisMonth.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold">${usersData.summary.avgLTV}</p>
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
                <div className="space-y-4">
                  {usersData.users
                    .filter(user => 
                      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <UsersIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{user.displayName}</span>
                            <Badge variant={
                              user.role === 'creator' ? 'default' :
                              user.segment === 'VIP' ? 'secondary' :
                              user.segment === 'At Risk' ? 'destructive' :
                              'outline'
                            }>
                              {user.segment}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {user.isCreator && (
                            <p className="text-xs text-blue-600">
                              Creator ({user.creatorTier}) - {user.commissionRate}% commission
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-8">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Spent</p>
                          <p className="font-medium">${user.totalSpent.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Orders</p>
                          <p className="font-medium">{user.totalOrders}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
              {creators.map((creator) => (
                <Card key={creator.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground font-medium">
                            {creator.displayName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-base">{creator.displayName}</CardTitle>
                          <CardDescription>{creator.creatorTier} Creator</CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {creator.commissionRate}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Spent</p>
                        <p className="font-medium">${creator.totalSpent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Orders</p>
                        <p className="font-medium">{creator.totalOrders}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Credits</p>
                        <p className="font-medium">{creator.credits}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Code</p>
                        <p className="font-medium font-mono text-xs">{creator.couponCode}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                  Filter by Platform
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* UGC Performance Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Content</p>
                      <p className="text-2xl font-bold">{ugcContent.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Views</p>
                      <p className="text-2xl font-bold">
                        {(ugcContent.reduce((acc, content) => acc + content.views, 0) / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Avg CVR</p>
                      <p className="text-2xl font-bold">
                        {(ugcContent.reduce((acc, content) => acc + content.conversionRate, 0) / ugcContent.length).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">
                        ${ugcContent.reduce((acc, content) => acc + content.revenue, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* UGC Content List */}
            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
                <CardDescription>Track engagement and conversion for creator content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ugcContent.map((content) => {
                    const ContentIcon = getContentIcon(content.type);
                    return (
                      <div key={content.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <ContentIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium">{content.title}</span>
                              <Badge className={getStatusColor(content.status)}>
                                {content.status}
                              </Badge>
                              <Badge variant="outline">{content.platform}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{content.creatorName}</p>
                            <p className="text-xs text-muted-foreground mt-1">{content.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Views</p>
                            <p className="font-medium">{content.views.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Engagement</p>
                            <div className="flex items-center space-x-1 text-xs">
                              <Heart className="w-3 h-3" />
                              <span>{content.likes}</span>
                              <MessageSquare className="w-3 h-3 ml-1" />
                              <span>{content.comments}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">CVR</p>
                            <p className="font-medium text-green-600">{content.conversionRate}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Revenue</p>
                            <p className="font-medium">${content.revenue.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
