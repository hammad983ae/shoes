import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  BarChart3, 
  Package, 
  ShoppingCart,
  Megaphone,
  Users
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

const navigation = [
  { 
    id: 'dashboard', 
    name: 'Dashboard', 
    icon: LayoutDashboard, 
    color: 'text-blue-500',
    description: 'Overview & KPIs'
  },
  { 
    id: 'analytics', 
    name: 'Analytics', 
    icon: BarChart3, 
    color: 'text-green-500',
    description: 'Sales & Traffic'
  },
  { 
    id: 'orders', 
    name: 'Orders', 
    icon: ShoppingCart, 
    color: 'text-orange-500',
    description: 'Fulfillment'
  },
  { 
    id: 'products', 
    name: 'Products', 
    icon: Package, 
    color: 'text-purple-500',
    description: 'Inventory'
  },
  { 
    id: 'marketing', 
    name: 'Marketing', 
    icon: Megaphone, 
    color: 'text-yellow-500',
    description: 'Campaigns'
  },
  { 
    id: 'users', 
    name: 'Users', 
    icon: Users, 
    color: 'text-cyan-500',
    description: 'UGC & Creators'
  },
];

export function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Page content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg px-4 py-3">
          <div className="flex items-center space-x-2">
            {navigation.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <div key={item.id} className="relative group">
                  <Link
                    to={item.id === 'dashboard' ? `/admin` : `/admin/${item.id}`}
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg scale-110"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105"
                    )}
                  >
                    <item.icon className={cn(
                      "h-6 w-6 transition-colors",
                      isActive ? "text-primary-foreground" : item.color
                    )} />
                  </Link>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap">
                      {item.name}
                      <div className="text-xs text-gray-300 dark:text-gray-600">{item.description}</div>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}