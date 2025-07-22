import { useNavigate } from 'react-router-dom';
import AuthModal from '@/components/AuthModal';
import InteractiveParticles from '@/components/InteractiveParticles';

export default function SignIn() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen page-gradient relative">
      <InteractiveParticles isActive={true} />
      <AuthModal open={true} onOpenChange={(open) => { if (!open) navigate('/'); }} fullPage />
    </div>
  );
}