import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar';
import Sidebar from './Sidebar';
import ChatBotWidget from './ChatBotWidget';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isHomePage) return <>{children}</>;

  return (
    <div className="relative min-h-screen bg-background">
      <AnnouncementBar />

      {/* Sidebar (non-sticky) */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main content wrapper */}
      <div className="relative z-10 transition-all duration-300 ml-0 md:ml-16">
        {children}
      </div>

      <ChatBotWidget />
    </div>
  );
};

export default Layout;
