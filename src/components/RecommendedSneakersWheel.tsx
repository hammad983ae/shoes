
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
  const [radius, setRadius] = useState(160);

  const count = items.length;
  const step = 360 / count;

  // Responsive radius with tighter constraints to prevent overlaps
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth;
      // Much smaller radius to prevent overlaps
      const r = Math.max(120, Math.min(200, Math.floor(w * 0.16)));
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

  const next = useCallback(() => {
    console.log('Next button clicked');
    rotateTo(index + 1);
  }, [index, rotateTo]);

  const prev = useCallback(() => {
    console.log('Previous button clicked');
    rotateTo(index - 1);
  }, [index, rotateTo]);

  // Wheel/scroll with reduced cooldown
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      const now = Date.now();
      if (now - wheelCooldown.current < 120) return;
      wheelCooldown.current = now;
      if (e.deltaY > 0 || e.deltaX > 0) next();
      else prev();
    },
    [next, prev],
  );

  // Drag/swipe with lower threshold and scroll prevention
  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    pointer.current = { startX: e.clientX, dragging: true };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointer.current.dragging) return;
    const dx = e.clientX - pointer.current.startX;
    // Lower threshold for more responsive dragging
    if (Math.abs(dx) > 32) {
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
    navigate(`/product/${current.id}`);
  };

  return (
    <div className="w-full space-y-4 mb-4">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Recommended Sneakers</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Discover our top picks just for you</p>
      </div>

      <div
        ref={containerRef}
        className="relative mx-auto w-full max-w-4xl mt-6 mb-6"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        role="region"
        aria-label="Rotating sneaker selector"
        style={{ touchAction: 'pan-y' }}
      >
        {/* 3D stage with proper z-index and reduced height */}
        <div className="[perspective:1000px] relative z-10 overflow-visible mx-auto h-[220px] sm:h-[260px] md:h-[300px] rounded-2xl">
          {/* Subtle soft background to mimic depth */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/[0.03] to-transparent rounded-2xl"
            aria-hidden="true"
          />

          {/* Ring container - fixed positioning and rotation for perfect centering */}
          <div
            className="absolute inset-0 [transform-style:preserve-3d] transition-transform duration-500 ease-out"
            style={{
              transform: `rotateY(${(-index * step).toFixed(2)}deg)`,
            }}
          >
            {items.map((item, i) => {
              const angle = i * step;
              // distance around ring (shortest)
              const raw = Math.abs(i - index);
              const distance = Math.min(raw, items.length - raw);
              // visual treatments - no scale variance, only opacity and blur
              const blur = Math.min(6, distance * 1.5);
              const opacity = Math.max(0.5, 1 - distance * 0.15);

              return (
                <div
                  key={item.id}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <figure
                    className="w-[38%] sm:w-[34%] md:w-[30%] lg:w-[26%] aspect-square select-none pointer-events-none [transform-style:preserve-3d]"
                    style={{
                      // Fixed positioning: items rotate around Y-axis and translate to fixed radius
                      // All items maintain same depth (same translateZ) for consistent size
                      transform: `rotateY(${angle}deg) translateZ(${radius}px) scale(1)`,
                      filter: `blur(${blur}px)`,
                      opacity,
                      transition: 'filter 300ms, opacity 300ms, transform 400ms',
                    }}
                    aria-hidden={i !== index}
                  >
                    <div className="relative w-full h-full">
                      <img
                        src={item.image || item.images[0]}
                        alt={item.name}
                        className={cn(
                          'w-full h-full object-contain',
                          'drop-shadow-[0_15px_25px_rgba(0,0,0,0.12)]',
                          i !== index ? 'grayscale-[5%]' : '',
                        )}
                      />
                    </div>
                  </figure>
                </div>
              );
            })}
          </div>

          {/* Current product meta and CTA */}
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 w-full px-3 z-30 pointer-events-none">
            <div className="mx-auto max-w-lg text-center">
              <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight">
                {current.brand.toUpperCase()}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">{current.name}</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <div className="pointer-events-auto rounded-full border bg-white/70 px-3 py-1 text-xs sm:text-sm shadow-sm">
                  {current.price}
                </div>
                <Button 
                  onClick={handleViewProduct}
                  className="pointer-events-auto btn-hover-glow text-xs sm:text-sm px-3 py-1 h-auto z-30"
                  size="sm"
                  data-testid="view-product-button"
                >
                  View Product
                </Button>
              </div>
            </div>
          </div>

          {/* Pagination dots */}
          <div className="absolute inset-x-0 bottom-0 pb-0.5 flex items-center justify-center gap-1 z-30" aria-hidden="true">
            {items.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to item ${i + 1}`}
                onClick={() => rotateTo(i)}
                className={cn(
                  'h-1 w-1 rounded-full transition-colors pointer-events-auto',
                  i === index ? 'bg-foreground' : 'bg-muted-foreground/40 hover:bg-muted-foreground/70',
                )}
              />
            ))}
          </div>
        </div>

        {/* Controls - positioned after the stage with proper z-index */}
        <div className="absolute inset-0 flex items-center justify-between z-30 pointer-events-none">
          <Button
            aria-label="Previous sneaker"
            variant="ghost"
            size="icon"
            onClick={prev}
            className="pointer-events-auto bg-white/70 hover:bg-white/90 shadow-sm border mr-auto ml-2 md:ml-1"
            data-testid="prev-button"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            aria-label="Next sneaker"
            variant="ghost"
            size="icon"
            onClick={next}
            className="pointer-events-auto bg-white/70 hover:bg-white/90 shadow-sm border ml-auto mr-2 md:mr-1"
            data-testid="next-button"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
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
