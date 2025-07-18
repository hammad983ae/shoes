import { useState } from 'react';
import { Menu, X, ShoppingBag, Star, Phone, LogOut, User, ShoppingCart } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const links = [
    { label: 'Shop All Sneakers', href: '#', icon: ShoppingBag },
    { label: 'Get Free Credits', href: '#', icon: Star },
    { label: 'Contact Us', href: '#', icon: Phone },
  ];

  const isLoggedIn = false; // Replace with actual auth state

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg text-primary hover:bg-card/90 transition-all duration-300"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-0 top-0 h-full w-80 bg-card/95 backdrop-blur-md border-r border-border p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-primary">Menu</h2>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-primary" />
              </button>
            </div>
            
            <div className="space-y-4">
              {links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-all duration-300"
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </a>
              ))}
              
              {isLoggedIn && (
                <a
                  href="#"
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-destructive/10 text-foreground hover:text-destructive transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </a>
              )}
            </div>

            <div className="border-t border-border mt-8 pt-6 space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/5">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <span className="text-foreground">Cart (0)</span>
              </div>
              
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-primary/10 transition-colors">
                <User className="w-5 h-5 text-primary" />
                <span className="text-foreground">
                  {isLoggedIn ? 'Profile' : 'Sign In'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex fixed left-0 top-0 h-full bg-card/80 backdrop-blur-md border-r border-border transition-all duration-300 z-30 ${
          isExpanded ? 'w-60' : 'w-16'
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex flex-col w-full">
          {/* Main Navigation */}
          <div className="flex-1 pt-6 space-y-2">
            {links.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="flex items-center gap-3 p-3 mx-2 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-all duration-300 group"
              >
                <link.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <span
                  className={`font-medium whitespace-nowrap transition-all duration-300 ${
                    isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                  }`}
                >
                  {link.label}
                </span>
              </a>
            ))}
            
            {isLoggedIn && (
              <a
                href="#"
                className="flex items-center gap-3 p-3 mx-2 rounded-lg hover:bg-destructive/10 text-foreground hover:text-destructive transition-all duration-300 group"
              >
                <LogOut className="w-5 h-5 text-destructive group-hover:scale-110 transition-transform" />
                <span
                  className={`font-medium whitespace-nowrap transition-all duration-300 ${
                    isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                  }`}
                >
                  Logout
                </span>
              </a>
            )}
          </div>

          {/* Bottom Section */}
          <div className="border-t border-border p-3 space-y-3">
            {/* Cart */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/5">
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  0
                </span>
              </div>
              <span
                className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                }`}
              >
                Cart
              </span>
            </div>
            
            {/* Profile / Sign In */}
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
              <User className="w-5 h-5 text-primary" />
              <span
                className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                }`}
              >
                {isLoggedIn ? 'Profile' : 'Sign In'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;