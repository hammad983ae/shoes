import { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatBotWidget from './ChatBotWidget';
import AnnouncementBar from './AnnouncementBar';
import { useAuth } from '@/contexts/AuthContext';
import { wakeUpBackend } from '@/lib/backend';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { session } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let ran = false;
    if (!session || ran) return;
    ran = true;
    void wakeUpBackend();
  }, [session]);


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
