import { useState, useEffect } from 'react';
import FloatingCards from '@/components/FloatingCards';
import CTAButtons from '@/components/CTAButtons';
import SneakerCatalog from '@/components/SneakerCatalog';
import ParticleExplosion from '@/components/ParticleExplosion';

type AppState = 'initial' | 'floating' | 'cta' | 'explosion' | 'catalog';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('initial');
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    // Initial sequence
    const timer1 = setTimeout(() => setAppState('floating'), 500);
    const timer2 = setTimeout(() => setAppState('cta'), 3500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleShopNow = () => {
    setShowParticles(true);
    setAppState('explosion');
    
    // Transition to catalog after explosion
    setTimeout(() => {
      setAppState('catalog');
      setShowParticles(false);
    }, 1000);
  };

  const handleViewInstagram = () => {
    window.open('https://instagram.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Floating Cards Background */}
      {(appState === 'floating' || appState === 'cta') && (
        <FloatingCards isBackground={appState === 'cta'} />
      )}

      {/* Call to Action Buttons */}
      {appState === 'cta' && (
        <CTAButtons 
          onShopNow={handleShopNow}
          onViewInstagram={handleViewInstagram}
        />
      )}

      {/* Particle Explosion */}
      {showParticles && (
        <ParticleExplosion />
      )}

      {/* Sneaker Catalog */}
      {appState === 'catalog' && (
        <SneakerCatalog />
      )}
    </div>
  );
};

export default Index;
