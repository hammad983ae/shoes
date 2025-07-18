import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseOpacity: number;
  currentOpacity: number;
}

interface InteractiveParticlesProps {
  isActive: boolean;
}

const InteractiveParticles = ({ isActive }: InteractiveParticlesProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isActive) return;

    // Create initial particles
    const initialParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      baseOpacity: Math.random() * 0.6 + 0.2,
      currentOpacity: Math.random() * 0.6 + 0.2,
    }));

    setParticles(initialParticles);

    // Animation loop
    const animateParticles = () => {
      setParticles(prevParticles =>
        prevParticles.map(particle => {
          let newX = particle.x + particle.vx;
          let newY = particle.y + particle.vy;

          // Wrap around screen edges
          if (newX < 0) newX = window.innerWidth;
          if (newX > window.innerWidth) newX = 0;
          if (newY < 0) newY = window.innerHeight;
          if (newY > window.innerHeight) newY = 0;

          // Calculate distance to mouse
          const dx = mousePos.x - newX;
          const dy = mousePos.y - newY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 150;

          // Increase opacity based on proximity to mouse
          let newOpacity = particle.baseOpacity;
          if (distance < maxDistance) {
            const proximity = 1 - (distance / maxDistance);
            newOpacity = particle.baseOpacity + (proximity * 0.8);
          }

          return {
            ...particle,
            x: newX,
            y: newY,
            currentOpacity: newOpacity,
          };
        })
      );
    };

    const interval = setInterval(animateParticles, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isActive, mousePos]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    if (isActive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-5">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="interactive-particle"
          style={{
            left: particle.x,
            top: particle.y,
            opacity: particle.currentOpacity,
          }}
        />
      ))}
    </div>
  );
};

export default InteractiveParticles;