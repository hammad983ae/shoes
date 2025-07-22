import { useState, useEffect } from 'react';
import FloatingCards from '@/components/FloatingCards';
import CTAButtons from '@/components/CTAButtons';
import SneakerCatalog from '@/components/SneakerCatalog';
import ParticleExplosion from '@/components/ParticleExplosion';
import InteractiveParticles from '@/components/InteractiveParticles';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

type AppState = 'initial' | 'floating' | 'cta' | 'explosion' | 'catalog';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('initial');
  const [showParticles, setShowParticles] = useState(false);
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  

  useEffect(() => {
    // Faster initial sequence - max 1.5-2 seconds total
    const timer1 = setTimeout(() => setAppState('floating'), 200);
    const timer2 = setTimeout(() => setAppState('cta'), 1500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    if (appState === 'catalog' && !user) {
      setShowAuthModal(true);
    }
  }, [appState, user]);

  const handleShopNow = () => {
    if (!user) {
      setShowParticles(true);
      setAppState('explosion');
      setTimeout(() => {
        setAppState('catalog');
        setShowParticles(false);
        setShowAuthModal(true);
      }, 1000);
      return;
    }
    setShowParticles(true);
    setAppState('explosion');
    
    // Transition to catalog after explosion
    setTimeout(() => {
      setAppState('catalog');
      setShowParticles(false);
    }, 1000);
  };

  const handleBackToHome = () => {
    setAppState('initial');
    setShowParticles(false);
    
    // Restart the initial sequence
    setTimeout(() => setAppState('floating'), 200);
    setTimeout(() => setAppState('cta'), 1500);
  };

  const handleViewInstagram = () => {
    window.open('https://instagram.com', '_blank');
  };

  return (
    <div className="min-h-screen page-gradient relative overflow-hidden">
      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={(open) => {
        setShowAuthModal(open);
        
      }} />
      {/* Background Animation */}
      {(appState === 'floating' || appState === 'cta') && (
        <div className="absolute inset-0 animate-gradientShift bg-gradient-to-br from-background via-background to-background/95" />
      )}

      {/* Interactive Particles */}
      <InteractiveParticles isActive={appState === 'floating' || appState === 'cta'} />

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
        <SneakerCatalog onBackToHome={handleBackToHome} />
      )}
    </div>
  );
};

export default Index;
