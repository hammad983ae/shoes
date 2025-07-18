import { useEffect, useState } from 'react';

const ParticleExplosion = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; tx: number; ty: number }>>([]);

  useEffect(() => {
    // Create particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      tx: (Math.random() - 0.5) * 800,
      ty: (Math.random() - 0.5) * 800,
    }));

    setParticles(newParticles);

    // Clean up particles after animation
    const timer = setTimeout(() => {
      setParticles([]);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: particle.x,
            top: particle.y,
            '--tx': `${particle.tx}px`,
            '--ty': `${particle.ty}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default ParticleExplosion;