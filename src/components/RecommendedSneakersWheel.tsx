
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
  const [radius, setRadius] = useState(420);

  const count = items.length;
  const step = 360 / count;

  // Responsive radius based on container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth;
      // clamp between 260 and 520
      const r = Math.max(260, Math.min(520, Math.floor(w * 0.38)));
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
    <div className="w-full space-y-6 mb-8">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Recommended Sneakers</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Discover our top picks just for you</p>
      </div>

      <div
        ref={containerRef}
        className="relative mx-auto w-full max-w-6xl"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        role="region"
        aria-label="Rotating sneaker selector"
      >
        {/* Controls */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between">
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

        {/* 3D stage */}
        <div
          className="relative mx-auto h-[480px] sm:h-[520px] md:h-[560px] lg:h-[600px] [perspective:1400px] rounded-2xl"
        >
          {/* Subtle soft background to mimic depth */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/[0.03] to-transparent rounded-2xl"
            aria-hidden="true"
          />

          {/* Ring container */}
          <div
            className="absolute inset-0 [transform-style:preserve-3d] transition-transform duration-500 ease-out"
            style={{
              transform: `translateZ(-${radius}px) rotateY(${(-index * step).toFixed(2)}deg)`,
            }}
          >
            {items.map((item, i) => {
              const angle = i * step;
              // distance around ring (shortest)
              const raw = Math.abs(i - index);
              const distance = Math.min(raw, items.length - raw);
              // visual treatments
              const blur = Math.min(8, distance * 2);
              const opacity = Math.max(0.45, 1 - distance * 0.18);
              const scale = i === index ? 1.08 : 0.94;

              return (
                <figure
                  key={item.id}
                  className="absolute left-1/2 top-1/2 w-[70%] sm:w-[60%] md:w-[52%] lg:w-[46%] -translate-x-1/2 -translate-y-1/2 select-none"
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(${radius}px) scale(${scale})`,
                    filter: `blur(${blur}px)`,
                    opacity,
                    transition: 'filter 300ms, opacity 300ms, transform 400ms',
                  }}
                  aria-hidden={i !== index}
                >
                  <div className="relative w-full aspect-square">
                    <img
                      src={item.image || item.images[0]}
                      alt={item.name}
                      className={cn(
                        'w-full h-full object-contain',
                        'drop-shadow-[0_24px_40px_rgba(0,0,0,0.18)]',
                        i !== index ? 'grayscale-[10%]' : '',
                      )}
                    />
                  </div>
                </figure>
              );
            })}
          </div>

          {/* Current product meta and CTA */}
          <div className="pointer-events-none absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 w-full px-3">
            <div className="mx-auto max-w-2xl text-center">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                {current.brand.toUpperCase()}
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">{current.name}</p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="pointer-events-auto rounded-full border bg-white/70 px-4 py-2 text-sm shadow-sm">
                  {current.price}
                </div>
                <Button 
                  onClick={handleViewProduct}
                  className="pointer-events-auto btn-hover-glow"
                >
                  View Product
                </Button>
              </div>
            </div>
          </div>

          {/* Pagination dots */}
          <div className="absolute inset-x-0 bottom-0 pb-2 flex items-center justify-center gap-1.5" aria-hidden="true">
            {items.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to item ${i + 1}`}
                onClick={() => rotateTo(i)}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-colors',
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
