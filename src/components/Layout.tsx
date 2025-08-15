// ✅ Cleaned up Layout.tsx: Removed global cart button logic
// Cart button now expected to be rendered inside individual sticky nav bars (e.g., MainCatalogNavBar.tsx)

import { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatBotWidget from './ChatBotWidget';
import AnnouncementBar from './AnnouncementBar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const [sidebarOpen, setSidebarOpen] = useState(false);

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
