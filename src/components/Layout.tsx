import { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatBotWidget from './ChatBotWidget';
import AnnouncementBar from './AnnouncementBar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    console.log(`🛣️ Route: ${location.pathname}`);
    // no backend wake calls here
  }, [location.pathname]);

  const isIndexPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-background">
      {!isIndexPage && <AnnouncementBar />}
      {!isIndexPage && <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />}
      <div className={`transition-all duration-300 ${!isIndexPage ? 'ml-0 md:ml-16' : ''}`}>
        {children}
      </div>
      <ChatBotWidget />
    </div>
  );
};

export default Layout;
