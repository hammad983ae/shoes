import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingCards from '@/components/FloatingCards';
import CTAButtons from '@/components/CTAButtons';
import SneakerCatalog from '@/components/SneakerCatalog';
import ParticleExplosion from '@/components/ParticleExplosion';
import InteractiveParticles from '@/components/InteractiveParticles';
import AuthModal from '@/components/AuthModal';



type AppState = 'initial' | 'floating' | 'cta' | 'explosion' | 'catalog';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('initial');
  const [showParticles, setShowParticles] = useState(false);
  
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

  // Check for referral code in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');
    if (refParam) {
      // The referral code will be handled by the useReferralCode hook
      console.log('Referral code detected:', refParam);
    }
  }, []);

  // Remove auto-showing AuthModal on catalog state, now handled by Shop Now logic

  const handleShopNow = () => {
    // Always go to catalog, regardless of login status
    setShowParticles(true);
    setAppState('explosion');
    setTimeout(() => {
      navigate('/catalog');
    }, 1200); // Match the explosion animation duration
  };


  const handleViewSocials = () => {
    // Same animation as Shop Now but go to socials
    setShowParticles(true);
    setAppState('explosion');
    setTimeout(() => {
      navigate('/socials');
    }, 1200); // Match the explosion animation duration
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
          onViewSocials={handleViewSocials}
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
