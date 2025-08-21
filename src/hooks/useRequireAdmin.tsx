import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useRequireAdmin = () => {
  const { session, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      const next = encodeURIComponent(loc.pathname + loc.search);
      nav(`/signin?next=${next}`, { replace: true });
      return;
    }
    if (!isAdmin) {
      nav('/'); // or a 403 page
    }
  }, [session, isAdmin, loading, nav, loc]);
};