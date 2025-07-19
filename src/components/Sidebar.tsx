import { useState } from 'react';
import { Menu, X, ShoppingBag, Star, Phone, LogOut, User, ShoppingCart, ChevronDown, ChevronRight, Instagram, MessageCircle, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [socialsOpen, setSocialsOpen] = useState(false);
  const { getTotalItems } = useCart();

  const links = [
    { label: 'Home', href: '/', icon: () => <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">H</div> },
    { label: 'Shop All Sneakers', href: '/catalog', icon: ShoppingBag },
    { label: 'Get Free Credits', href: '/credits', icon: Star },
    { label: 'Contact Us', href: '/contact', icon: Phone },
  ];

  const socialLinks = [
    { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
    { label: 'TikTok', href: 'https://tiktok.com', icon: Music },
    { label: 'Discord', href: 'https://discord.com', icon: MessageCircle },
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
        <div className="md:hidden fixed inset-0 z-[80] bg-background/80 backdrop-blur-sm">
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
            
            <div className="space-y-4">
              {links.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.href}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-all duration-300"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
              
              {/* Socials Section */}
              <div className="space-y-2">
                <button
                  onClick={() => setSocialsOpen(!socialsOpen)}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-all duration-300 w-full"
                >
                  {socialsOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  <span className="font-medium">Socials</span>
                </button>
                
                {socialsOpen && (
                  <div className="pl-6 space-y-2">
                    {socialLinks.map((social, idx) => (
                      <a
                        key={idx}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-2 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-all duration-300"
                      >
                        <social.icon className="w-5 h-5" />
                        <span className="font-medium">{social.label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
              
              {isLoggedIn && (
                <Link
                  to="/logout"
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-destructive/10 text-foreground hover:text-destructive transition-all duration-300"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </Link>
              )}
            </div>

            <div className="border-t border-border mt-8 pt-6 space-y-4">
              <Link
                to="/cart"
                className="flex items-center gap-4 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                onClick={() => setIsMobileOpen(false)}
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </div>
                <span className="text-foreground">Cart ({getTotalItems()})</span>
              </Link>
              
              <Link
                to={isLoggedIn ? "/profile" : "/signin"}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-primary/10 transition-colors"
                onClick={() => setIsMobileOpen(false)}
              >
                <User className="w-5 h-5 text-primary" />
                <span className="text-foreground">
                  {isLoggedIn ? 'Profile' : 'Sign In'}
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex fixed left-0 top-0 h-full bg-card backdrop-blur-md border-r border-border transition-all duration-300 z-[70] ${
          isExpanded ? 'w-60' : 'w-16'
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex flex-col w-full">
          {/* Main Navigation */}
          <div className="flex-1 pt-6 space-y-2">
            {links.map((link, idx) => (
              <Link
                key={idx}
                to={link.href}
                className="flex items-center gap-3 p-3 mx-2 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-all duration-300 group"
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
            
            {/* Socials Section */}
            <div className="mx-2">
              <button
                onClick={() => setSocialsOpen(!socialsOpen)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-all duration-300 w-full"
              >
                {socialsOpen ? <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-primary flex-shrink-0" />}
                <span
                  className={`font-medium whitespace-nowrap transition-all duration-300 ${
                    isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                  }`}
                >
                  Socials
                </span>
              </button>
              
              {socialsOpen && isExpanded && (
                <div className="pl-6 space-y-1 mt-2">
                  {socialLinks.map((social, idx) => (
                    <a
                      key={idx}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-all duration-300"
                    >
                      <social.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium text-sm">{social.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
            
            {isLoggedIn && (
              <Link
                to="/logout"
                className="flex items-center gap-3 p-3 mx-2 rounded-lg hover:bg-destructive/10 text-foreground hover:text-destructive transition-all duration-300 group"
              >
                <LogOut className="w-5 h-5 text-destructive flex-shrink-0" />
                <span
                  className={`font-medium whitespace-nowrap transition-all duration-300 ${
                    isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                  }`}
                >
                  Logout
                </span>
              </Link>
            )}
          </div>

          {/* Bottom Section */}
          <div className="border-t border-border p-3 space-y-3">
            {/* Cart */}
            <Link
              to="/cart"
              className="flex items-center gap-3 p-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-primary flex-shrink-0" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </div>
              <span
                className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                }`}
              >
                Cart
              </span>
            </Link>
            
            {/* Profile / Sign In */}
            <Link
              to={isLoggedIn ? "/profile" : "/signin"}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <User className="w-5 h-5 text-primary flex-shrink-0" />
              <span
                className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                }`}
              >
                {isLoggedIn ? 'Profile' : 'Sign In'}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;