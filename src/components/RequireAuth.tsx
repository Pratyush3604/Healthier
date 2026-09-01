import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function RequireAuth({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { session, profile, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?next=${next}`} replace />;
  }

  // First visit after signing up: offer the optional profile steps once per session.
  const setupSeen = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('healthier.setup-prompted') === '1';
  if (profile && profile.profile_completed === false && !setupSeen && location.pathname !== '/complete-profile') {
    sessionStorage.setItem('healthier.setup-prompted', '1');
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/complete-profile?next=${next}`} replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Admins only</h1>
        <p className="text-muted-foreground">This page is restricted to administrators.</p>
      </div>
    );
  }

  return <>{children}</>;
}
