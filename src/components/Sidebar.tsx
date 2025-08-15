import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, Star, Smartphone, LogOut, User, Home, TrendingUp, Laptop, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onBackToHome?: () => void;
}

const Sidebar = ({ onBackToHome }: SidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ avatar_url?: string | null; display_name?: string | null } | null>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, display_name')
        .eq('user_id', user.id)
        .single();
      
      if (data) setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const links = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Catalog', href: '/catalog', icon: ShoppingBag },
    { label: 'Top Posts', href: '/feed', icon: TrendingUp },
    { label: 'Get Free Credits', href: '/credits', icon: Star },
    { label: 'Socials', href: '/socials', icon: Smartphone },
  ];

  // Add conditional dashboard links
  const { userRole, isCreator } = useAuth();
  const dashboardLinks = [];
  
  if (isCreator || userRole === 'admin') {
    dashboardLinks.push({ label: 'Creator Dashboard', href: '/creator', icon: Laptop });
  }
  
  if (userRole === 'admin') {
    dashboardLinks.push({ label: 'Admin Dashboard', href: '/admin', icon: Settings });
  }

  const allLinks = [...links, ...dashboardLinks];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-2 md:top-4 left-4 z-50 h-10 w-10 bg-card/80 backdrop-blur-sm border border-border rounded-lg text-primary hover:bg-card/90 transition-all duration-300 flex items-center justify-center"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-[90] bg-background/80 backdrop-blur-sm">
          <div className="fixed left-0 top-0 h-full w-80 bg-card backdrop-blur-md border-r border-border p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-primary">Menu</h2>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-primary" />
              </button>
            </div>
            
            <div className="space-y-2 md:space-y-4">
              {allLinks.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.href}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-all duration-300"
                  onClick={() => {
                    if (link.href === '/' && onBackToHome) {
                      onBackToHome();
                    }
                    setIsMobileOpen(false);
                  }}
                >
                  <link.icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base font-medium">{link.label}</span>
                </Link>
              ))}
            </div>

            <div className="border-t border-border mt-6 pt-4 space-y-3">
              {user && (
                <button
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-destructive/10 text-foreground hover:text-destructive transition-all duration-300"
                  onClick={() => {
                    handleSignOut();
                    setIsMobileOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              )}
              
              <Link
                to={user ? "/profile" : "/signin"}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 transition-colors"
                onClick={() => setIsMobileOpen(false)}
              >
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">
                  {user ? 'Profile' : 'Sign In'}
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex fixed left-0 top-0 h-full backdrop-blur-md border-r border-border/30 transition-all duration-500 z-[70] ${
          isExpanded ? 'w-60' : 'w-16'
        }`}
        style={{
          background: isExpanded 
            ? 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)'
            : 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)'
        }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex flex-col w-full">
          {/* Main Navigation */}
          <div className="flex-1 pt-6 space-y-2">
            {allLinks.map((link, idx) => (
              <Link
                key={idx}
                to={link.href}
                className="flex items-center gap-3 p-3 mx-2 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-all duration-300 group"
                onClick={() => {
                  if (link.href === '/' && onBackToHome) {
                    onBackToHome();
                  }
                }}
              >
                <link.icon className="w-5 h-5 text-primary flex-shrink-0" />
                <span
                  className={`font-medium whitespace-nowrap transition-all duration-300 ${
                    isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="border-t border-border/50 mx-2 pt-3 p-3 space-y-3">
            {/* Logout Button - positioned above profile */}
            {user && (
              <button
                className="flex items-center gap-3 p-2 mx-0 rounded-lg hover:bg-destructive/10 text-foreground hover:text-destructive transition-all duration-300 group"
                onClick={handleSignOut}
              >
                <LogOut className="w-5 h-5 text-destructive flex-shrink-0" />
                <span
                  className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                  }`}
                >
                  Logout
                </span>
              </button>
            )}
            
            {/* Profile / Sign In */}
            <Link
              to={user ? "/profile" : "/signin"}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 transition-colors"
            >
              {user ? (
                <Avatar className="w-5 h-5 flex-shrink-0 border border-primary/20">
                  <AvatarImage src={userProfile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {userProfile?.display_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <User className="w-5 h-5 text-primary flex-shrink-0" />
              )}
              <span
                className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                }`}
              >
                {user ? 'Profile' : 'Sign In'}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;