// ✅ Cleaned up Layout.tsx: Removed global cart button logic
// Cart button now expected to be rendered inside individual sticky nav bars (e.g., MainCatalogNavBar.tsx)

import { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatBotWidget from './ChatBotWidget';
import AnnouncementBar from './AnnouncementBar';
import { useAuth } from '@/contexts/AuthContext';
import { validateSession, wakeUpBackend } from '@/integrations/supabase/client';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { session } = useAuth();
  const isHomePage = location.pathname === '/';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔄 SESSION VALIDATION ON ROUTE CHANGES
  useEffect(() => {
    const handleRouteChange = async () => {
      if (!session) return;
      
      console.log(`🛣️ Route changed to: ${location.pathname}`);
      await wakeUpBackend();
      
      const isValid = await validateSession();
      if (!isValid) {
        console.warn("⚠️ Session invalid after route change");
      }
    };

    handleRouteChange();
  }, [location.pathname, session]);

  if (isHomePage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="transition-all duration-300 ml-0 md:ml-16">
        {children}
      </div>
      <ChatBotWidget />
    </div>
  );
};

export default Layout;
