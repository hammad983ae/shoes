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

  // Remove forced authentication - allow browsing without sign-in
  // if (!isAuthenticated(user)) {
  //   return (
  //     <>
  //       <AuthModal open={true} onOpenChange={setShowAuthModal} />
  //     </>
  //   );
  // }

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="transition-all duration-300 ml-0 md:ml-16 pt-20 md:pt-0">
        {children}
      </div>
      <ChatBotWidget />
    </div>
  );
};

export default Layout;