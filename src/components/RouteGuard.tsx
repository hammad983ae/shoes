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
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }

    // Wait for profile to load before checking role/creator requirements
    if (user && !profile && (requireRole || requireCreator)) {
      return; // Still loading profile
    }

    // Check role requirement
    if (requireRole && profile?.role !== requireRole) {
      navigate(redirectTo);
      return;
    }

    // Check creator requirement
    if (requireCreator && !profile?.is_creator && profile?.role !== 'admin') {
      navigate(redirectTo);
      return;
    }
  }, [user, profile, loading, navigate, requireRole, requireCreator, redirectTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireRole && profile?.role !== requireRole) {
    return null;
  }

  if (requireCreator && !profile?.is_creator && profile?.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
};

export default RouteGuard;