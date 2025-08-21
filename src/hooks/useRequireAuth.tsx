import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useRequireAuth = () => {
  const { session, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      const next = encodeURIComponent(loc.pathname + loc.search);
      nav(`/signin?next=${next}`, { replace: true });
    }
  }, [session, loading, nav, loc]);
};