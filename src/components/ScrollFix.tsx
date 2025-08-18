import { useEffect } from 'react';

interface ScrollFixProps {
  children: React.ReactNode;
  className?: string;
}

export const ScrollFix = ({ children, className }: ScrollFixProps) => {
  useEffect(() => {
    // Fix for horizontal scroll blocking vertical scroll
    const handleWheel = (e: Event) => {
      const wheelEvent = e as WheelEvent;
      const target = e.currentTarget as HTMLElement;
      if (!target) return;

      const scrollContainer = target.querySelector('[data-scroll-container]');
      if (!scrollContainer) return;

      // If scrolling vertically but container only scrolls horizontally,
      // allow the event to bubble up for vertical scrolling
      if (Math.abs(wheelEvent.deltaY) > Math.abs(wheelEvent.deltaX)) {
        return; // Let parent handle vertical scroll
      }
    };

    // Apply to all scroll containers
    const scrollContainers = document.querySelectorAll('[data-scroll-container]');
    scrollContainers.forEach(container => {
      container.addEventListener('wheel', handleWheel, { passive: true });
    });

    return () => {
      scrollContainers.forEach(container => {
        container.removeEventListener('wheel', handleWheel);
      });
    };
  }, []);

  return (
    <div className={className} data-scroll-container>
      {children}
    </div>
  );
};