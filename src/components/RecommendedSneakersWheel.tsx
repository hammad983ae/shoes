import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { sneakerCatalog } from './SneakerCatalog';
import { useNavigate } from 'react-router-dom';
import { Sneaker } from '@/types/global';

const RecommendedSneakersWheel = () => {
  const items = sneakerCatalog;
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointer = useRef<{ startX: number; dragging: boolean }>({ startX: 0, dragging: false });
  const wheelCooldown = useRef<number>(0);
  const [radius, setRadius] = useState(300);

  const count = items.length;
  const step = 360 / count;

  // Responsive radius based on container width - smaller for better fit
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth;
      // Reduced radius range for better fit
      const r = Math.max(200, Math.min(350, Math.floor(w * 0.28)));
      setRadius(r);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rotateTo = useCallback(
    (next: number) => {
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const next = useCallback(() => rotateTo(index + 1), [index, rotateTo]);
  const prev = useCallback(() => rotateTo(index - 1), [index, rotateTo]);

  // Wheel/scroll
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      const now = Date.now();
      if (now - wheelCooldown.current < 180) return;
      wheelCooldown.current = now;
      if (e.deltaY > 0 || e.deltaX > 0) next();
      else prev();
    },
    [next, prev],
  );

  // Drag/swipe
  const onPointerDown = (e: React.PointerEvent) => {
    pointer.current = { startX: e.clientX, dragging: true };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointer.current.dragging) return;
    const dx = e.clientX - pointer.current.startX;
    if (Math.abs(dx) > 56) {
      dx < 0 ? next() : prev();
      pointer.current = { startX: e.clientX, dragging: true };
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointer.current.dragging = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  const current: Sneaker = useMemo(() => items[index], [items, index]);

  const handleViewProduct = () => {
    navigate(`/full-catalog?product=${current.id}`);
  };

  return (
    <div className="w-full space-y-4 mb-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Recommended Sneakers</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Discover our top picks just for you</p>
      </div>

      <div
        ref={containerRef}
        className="relative mx-auto w-full max-w-5xl"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        role="region"
        aria-label="Rotating sneaker selector"
      >
        {/* Controls */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between z-10">
          <Button
            aria-label="Previous sneaker"
            variant="ghost"
            size="icon"
            onClick={prev}
            className="pointer-events-auto bg-white/70 hover:bg-white/90 shadow-sm border mr-auto ml-2 md:ml-1"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            aria-label="Next sneaker"
            variant="ghost"
            size="icon"
            onClick={next}
            className="pointer-events-auto bg-white/70 hover:bg-white/90 shadow-sm border ml-auto mr-2 md:mr-1"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* 3D stage - reduced height */}
        <div className="relative mx-auto h-[360px] sm:h-[400px] md:h-[440px] lg:h-[480px] [perspective:1200px] rounded-2xl overflow-hidden">
          {/* Subtle soft background to mimic depth */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/[0.03] to-transparent rounded-2xl"
            aria-hidden="true"
          />

          {/* Ring container - fixed positioning to keep items centered */}
          <div
            className="absolute inset-0 [transform-style:preserve-3d] transition-transform duration-500 ease-out flex items-center justify-center"
            style={{
              transform: `rotateY(${(-index * step).toFixed(2)}deg)`,
            }}
          >
            {items.map((item, i) => {
              const angle = i * step;
              // distance around ring (shortest)
              const raw = Math.abs(i - index);
              const distance = Math.min(raw, items.length - raw);
              // visual treatments
              const blur = Math.min(6, distance * 1.5);
              const opacity = Math.max(0.5, 1 - distance * 0.15);
              const scale = i === index ? 1.1 : 0.85;

              return (
                <figure
                  key={item.id}
                  className="absolute w-[60%] sm:w-[50%] md:w-[45%] lg:w-[40%] aspect-square select-none"
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(${radius}px) scale(${scale})`,
                    filter: `blur(${blur}px)`,
                    opacity,
                    transition: 'filter 300ms, opacity 300ms, transform 400ms',
                    left: '50%',
                    top: '50%',
                    marginLeft: '-30%', // Half of width for centering
                    marginTop: '-25%', // Slightly above center
                  }}
                  aria-hidden={i !== index}
                >
                  <div className="relative w-full h-full">
                    <img
                      src={item.image || item.images[0]}
                      alt={item.name}
                      className={cn(
                        'w-full h-full object-contain',
                        'drop-shadow-[0_20px_35px_rgba(0,0,0,0.15)]',
                        i !== index ? 'grayscale-[5%]' : '',
                      )}
                    />
                  </div>
                </figure>
              );
            })}
          </div>

          {/* Current product meta and CTA */}
          <div className="pointer-events-none absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 w-full px-3">
            <div className="mx-auto max-w-xl text-center">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
                {current.brand.toUpperCase()}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">{current.name}</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="pointer-events-auto rounded-full border bg-white/70 px-3 py-1.5 text-xs sm:text-sm shadow-sm">
                  {current.price}
                </div>
                <Button 
                  onClick={handleViewProduct}
                  className="pointer-events-auto btn-hover-glow text-xs sm:text-sm px-3 py-1.5 h-auto"
                  size="sm"
                >
                  View Product
                </Button>
              </div>
            </div>
          </div>

          {/* Pagination dots */}
          <div className="absolute inset-x-0 bottom-0 pb-1 flex items-center justify-center gap-1" aria-hidden="true">
            {items.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to item ${i + 1}`}
                onClick={() => rotateTo(i)}
                className={cn(
                  'h-1 w-1 rounded-full transition-colors',
                  i === index ? 'bg-foreground' : 'bg-muted-foreground/40 hover:bg-muted-foreground/70',
                )}
              />
            ))}
          </div>
        </div>

        {/* Screen reader live region for announcement */}
        <p className="sr-only" aria-live="polite">
          Showing {current.brand} {current.name}. Price {current.price}
        </p>
      </div>
    </div>
  );
};

export default RecommendedSneakersWheel;
