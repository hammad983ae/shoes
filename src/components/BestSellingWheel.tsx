import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { sneakerCatalog } from '@/components/SneakerCatalog';
import { Button } from '@/components/ui/button';

const BestSellingWheel = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => sneakerCatalog.slice(0, 8), []);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % items.length), 4000);
    return () => clearInterval(id);
  }, [items.length]);

  // Keep active centered on resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ left: active * (el.clientWidth * 0.7), behavior: 'smooth' });
  }, [active]);

  const goPrev = () => setActive((i) => (i - 1 + items.length) % items.length);
  const goNext = () => setActive((i) => (i + 1) % items.length);

  return (
    <section aria-label="Best-Selling Sneakers" className="mb-6 sm:mb-10">
      <header className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Best-Selling Sneakers</h2>
        <div className="hidden sm:flex gap-2">
          <Button variant="outline" size="icon" onClick={goPrev} aria-label="Previous">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goNext} aria-label="Next">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden"
      >
        <div className="flex items-center justify-center">
          {items.map((s, i) => {
            const isCenter = offset === 0;
            const scale = isCenter ? 'scale-100' : 'scale-75';
            const blur = isCenter ? 'blur-0' : 'blur-sm';
            const opacity = isCenter ? 'opacity-100' : 'opacity-60';

            return (
              <div
                key={s.id}
                className={`transition-all duration-500 ease-out ${opacity} ${blur} ${scale} hidden sm:block`}
                style={{ transform: `translateX(${offset * 40}%)`, zIndex: isCenter ? 2 : 1 }}
                aria-hidden={!isCenter}
              >
                <div className="w-[260px] h-[260px] md:w-[320px] md:h-[320px] flex flex-col items-center justify-end">
                  <img src={s.images?.[0] || s.image} alt={`${s.name} best-selling sneaker`} className="object-contain w-full h-full drop-shadow-2xl" />
                  <div className="mt-3 text-center">
                    <div className="text-sm font-semibold text-foreground line-clamp-1">{s.name}</div>
                    <div className="text-primary font-bold">{s.price}</div>
                    <Button className="mt-2 w-full" onClick={() => navigate(`/product/${s.id}`)}>View Product</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile - horizontal scroller */}
        <div className="sm:hidden overflow-x-auto snap-x snap-mandatory flex gap-4 pb-2 -mx-2 px-2">
          {items.map((s) => (
            <div key={s.id} className="min-w-[75%] snap-center flex-shrink-0">
              <div className="rounded-xl border border-border bg-background/40 p-3 text-center">
                <img src={s.images?.[0] || s.image} alt={`${s.name} best-selling sneaker`} className="w-full h-48 object-contain" loading="lazy" />
                <div className="mt-2 text-sm font-semibold text-foreground line-clamp-1">{s.name}</div>
                <div className="text-primary font-bold">{s.price}</div>
                <Button className="mt-2 w-full" onClick={() => navigate(`/product/${s.id}`)}>View Product</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellingWheel;
