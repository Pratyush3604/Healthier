import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ErrorBoundary } from './ErrorBoundary';
import { ParticleBackground } from './ParticleBackground';
import { IconBackground } from './IconBackground';
import { AutoTranslate } from './AutoTranslate';

interface LayoutProps {
  children: ReactNode;
}

// Map every route to a unique medical-themed particle variant.
// Each variant draws different shapes/colors so every page feels distinct.
const routeToVariant: Record<string, string> = {
  '/': 'home',
  '/dashboard': 'dashboard',
  '/symptoms': 'symptoms',
  '/skin-injury': 'skin',
  '/chat': 'chat',
  '/fitness': 'fitness',
  '/medicine-info': 'medicine',
  '/vitals': 'vitals',
  '/reports': 'reports',
  '/bmi-calculator': 'calculator',
  '/medication-reminder': 'medicine',
  '/health-reports': 'reports',
  '/posture-corrector': 'posture',
  '/first-aid': 'firstaid',
  '/health-tips': 'tips',
  '/emergency': 'emergency',
  '/how-to-use': 'home',
  '/about': 'about',
  '/settings': 'settings',
  '/auth': 'auth',
  '/travel-health': 'travel',
  '/ai-doctor': 'chat',
};

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const variant = routeToVariant[location.pathname] || 'default';

  return (
    <div className="min-h-screen flex flex-col relative bg-background">
      {/* Subtle particle layer (light, low density) */}
      <ParticleBackground key={variant} variant={variant} />
      {/* Dense per-page medical icon background (jittered grid, no overlap) */}
      <IconBackground count={180} />

      {/* Subtle ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-radial pointer-events-none opacity-60 z-0" />

      <Header />
      <main className="flex-1 relative z-10">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
