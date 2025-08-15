import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Search,
  Filter,
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  Eye,
  MoreHorizontal,
  Star,
  ShoppingCart,
  DollarSign
} from "lucide-react";

// Mock products data
const productsData = {
  summary: {
    totalProducts: 847,
    inStock: 623,
    lowStock: 89,
    outOfStock: 135,
    totalValue: 2847392
  },
  topPerformers: [
    {
      id: 'PRD-001',
      name: 'Wireless Bluetooth Headphones Pro',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
      sales: 1247,
      revenue: 124700,
      stock: 89,
      rating: 4.8,
      growth: 15.3,
      price: 99.99
    },
    {
      id: 'PRD-002',
      name: 'Smart Fitness Watch',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
      sales: 892,
      revenue: 178400,
      stock: 124,
      rating: 4.6,
      growth: 8.7,
      price: 199.99
    },
    {
      id: 'PRD-003',
      name: 'Premium Phone Case',
      image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=100&h=100&fit=crop',
      sales: 2156,
      revenue: 86240,
      stock: 456,
      rating: 4.4,
      growth: 22.1,
      price: 39.99
    },
    {
      id: 'PRD-004',
      name: 'Adjustable Laptop Stand',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&h=100&fit=crop',
      sales: 567,
      revenue: 39690,
      stock: 78,
      rating: 4.7,
      growth: -3.2,
      price: 69.99
    }
  ],
  lowPerformers: [
    {
      id: 'PRD-045',
      name: 'Vintage Camera Strap',
      views: 234,
      sales: 12,
      conversionRate: 5.1,
      stock: 234,
      price: 24.99
    },
    {
      id: 'PRD-067',
      name: 'LED Desk Lamp',
      views: 567,
      sales: 23,
      conversionRate: 4.1,
      stock: 156,
      price: 79.99
    },
    {
      id: 'PRD-089',
      name: 'Wireless Mouse Pad',
      views: 189,
      sales: 8,
      conversionRate: 4.2,
      stock: 89,
      price: 29.99
    }
  ],
  stockAlerts: [
    { name: 'Gaming Keyboard RGB', stock: 5, minStock: 20, sku: 'GKR-001' },
    { name: 'USB-C Hub 7-in-1', stock: 8, minStock: 25, sku: 'UCH-002' },
    { name: 'Wireless Charging Pad', stock: 12, minStock: 30, sku: 'WCP-003' },
    { name: 'Bluetooth Speaker Portable', stock: 3, minStock: 15, sku: 'BSP-004' }
  ],
  categoryPerformance: [
    { category: 'Electronics', revenue: 245890, products: 156, growth: 12.4 },
    { category: 'Accessories', revenue: 189670, products: 234, growth: 8.9 },
    { category: 'Home & Office', revenue: 134560, products: 189, growth: 15.7 },
    { category: 'Sports & Fitness', revenue: 98340, products: 123, growth: -2.3 },
    { category: 'Fashion', revenue: 76890, products: 145, growth: 18.2 }
  ]
};

export default function Products() {
  return (
    <DashboardLayout currentPage="products">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products & Inventory</h1>
            <p className="text-muted-foreground">
              Manage your product catalog, track performance, and monitor inventory levels
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-xl font-bold">{productsData.summary.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full" />
                <div>
                  <p className="text-sm text-muted-foreground">In Stock</p>
                  <p className="text-xl font-bold">{productsData.summary.inStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-xl font-bold">{productsData.summary.lowStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full" />
                <div>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                  <p className="text-xl font-bold">{productsData.summary.outOfStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-xl font-bold">${(productsData.summary.totalValue / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="top-performers" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
            <TabsTrigger value="low-performers">Needs Attention</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          {/* Top Performers Tab */}
          <TabsContent value="top-performers" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Best Selling Products</CardTitle>
                  <CardDescription>Products driving the most revenue and sales volume</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search products..." className="pl-10 w-64" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productsData.topPerformers.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="w-8 h-6 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{product.name}</span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-muted-foreground">{product.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{product.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-8">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Sales</p>
                          <p className="font-medium">{product.sales.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Revenue</p>
                          <p className="font-medium">${product.revenue.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Stock</p>
                          <p className="font-medium">{product.stock}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Growth</p>
                          <p className={`font-medium flex items-center ${product.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.growth > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                            {Math.abs(product.growth)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-medium">${product.price}</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Low Performers Tab */}
          <TabsContent value="low-performers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Products Needing Attention</CardTitle>
                <CardDescription>Products with high traffic but low conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productsData.lowPerformers.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 rounded-lg border border-orange-200 bg-orange-50">
                      <div className="flex items-center space-x-4">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-8">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Views</p>
                          <p className="font-medium">{product.views}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Sales</p>
                          <p className="font-medium">{product.sales}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Conversion</p>
                          <p className="font-medium text-orange-600">{product.conversionRate}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Stock</p>
                          <p className="font-medium">{product.stock}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Optimize
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span>Stock Alerts</span>
                </CardTitle>
                <CardDescription>Products running low on inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productsData.stockAlerts.map((item) => (
                    <div key={item.sku} className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50">
                      <div className="flex items-center space-x-4">
                        <Package className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Current Stock</p>
                          <p className="text-xl font-bold text-red-600">{item.stock}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Min Required</p>
                          <p className="font-medium">{item.minStock}</p>
                        </div>
                        <div className="w-32">
                          <Progress 
                            value={(item.stock / item.minStock) * 100} 
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.round((item.stock / item.minStock) * 100)}% of minimum
                          </p>
                        </div>
                        <Button size="sm">
                          Reorder
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Revenue and product distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productsData.categoryPerformance.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="w-8 h-6 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{category.category}</p>
                          <p className="text-sm text-muted-foreground">{category.products} products</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-8">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Revenue</p>
                          <p className="text-xl font-bold">${category.revenue.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Growth</p>
                          <p className={`font-medium flex items-center ${category.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {category.growth > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                            {Math.abs(category.growth)}%
                          </p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
