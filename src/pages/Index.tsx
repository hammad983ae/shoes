import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  

  useEffect(() => {
    // Faster initial sequence - max 1.5-2 seconds total
    const timer1 = setTimeout(() => setAppState('floating'), 200);
    const timer2 = setTimeout(() => setAppState('cta'), 1500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Remove auto-showing AuthModal on catalog state, now handled by Shop Now logic

  const handleShopNow = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowParticles(true);
    setAppState('explosion');
    setTimeout(() => {
      navigate('/catalog');
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
