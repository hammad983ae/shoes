import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface RouteGuardProps {
  children: ReactNode;
  requireRole?: 'admin' | 'creator' | 'user';
  requireCreator?: boolean;
  redirectTo?: string;
}

const RouteGuard = ({ 
  children, 
  requireRole, 
  requireCreator, 
  redirectTo = '/' 
}: RouteGuardProps) => {
  const { user, userRole, isCreator, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/signin');
      return;
    }

    // Check role requirement
    if (requireRole && userRole !== requireRole) {
      navigate(redirectTo);
      return;
    }

    // Check creator requirement
    if (requireCreator && !isCreator && userRole !== 'admin') {
      navigate(redirectTo);
      return;
    }
  }, [user, userRole, isCreator, loading, navigate, requireRole, requireCreator, redirectTo]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (requireRole && userRole !== requireRole) {
    return null;
  }

  if (requireCreator && !isCreator && userRole !== 'admin') {
    return null;
  }

  return <>{children}</>;
};

export default RouteGuard;