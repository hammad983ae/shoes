const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isHomePage) return <>{children}</>;

  return (
    <div className="relative min-h-screen bg-background">
      {/* Sticky announcement bar */}
      <div className="sticky top-0 z-50">
        <AnnouncementBar />
      </div>

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
