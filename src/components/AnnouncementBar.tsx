import { Truck, Gift, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AnnouncementBar = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const announcements = [
    {
      text: "FREE 5-9 DAY SHIPPING ON ALL ORDERS",
      icon: Truck,
      onClick: () => navigate('/catalog')
    },
    {
      text: "SHARE YOUR REFERRAL LINK TO GET FREE CREDITS",
      icon: Gift,
      onClick: () => navigate('/credits')
    },
    {
      text: "JOIN OUR TELEGRAM TO GET THE BEST DEALS ON BULK",
      icon: MessageCircle,
      onClick: () => navigate('/contact-us')
    }
  ];

  // Auto-rotate functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        goToNext();
      }
    }, 4000); // Rotate every 4 seconds

    return () => clearInterval(interval);
  }, [isTransitioning, currentIndex]);

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  const currentAnnouncement = announcements[currentIndex];
  const IconComponent = currentAnnouncement.icon;

  return (
    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold text-center py-2 px-12 relative z-10">
      {/* Left Arrow */}
      <button
        onClick={goToPrevious}
        className="absolute md:left-20 left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-all duration-200 z-20 flex items-center justify-center"
        disabled={isTransitioning}
        aria-label="Previous announcement"
      >
        <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
      </button>
      
      {/* Right Arrow */}
      <button
        onClick={goToNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-all duration-200 z-20 flex items-center justify-center"
        disabled={isTransitioning}
        aria-label="Next announcement"
      >
        <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
      </button>

      {/* Current Announcement */}
      <div 
        className="flex items-center justify-center gap-2 cursor-pointer hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300"
        onClick={currentAnnouncement.onClick}
        style={{
          opacity: isTransitioning ? 0.8 : 1,
          transform: isTransitioning ? 'scale(0.98)' : 'scale(1)',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <IconComponent className="w-4 h-4" />
        <span className="text-sm sm:text-base">{currentAnnouncement.text}</span>
        <IconComponent className="w-4 h-4" />
      </div>
    </div>
  );
};

export default AnnouncementBar; 