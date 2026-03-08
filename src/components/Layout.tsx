import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ErrorBoundary } from './ErrorBoundary';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative bg-background">
      {/* Subtle ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-radial pointer-events-none opacity-60" />
      <div
        className="bg-blob animate-blob"
        style={{
          top: '5%',
          left: '15%',
          width: '350px',
          height: '350px',
          background: 'hsla(160, 84%, 39%, 0.08)',
        }}
      />
      <div
        className="bg-blob animate-blob"
        style={{
          top: '50%',
          right: '10%',
          width: '300px',
          height: '300px',
          background: 'hsla(200, 80%, 55%, 0.06)',
          animationDelay: '-4s',
        }}
      />

      <Header />
      <main className="flex-1 relative z-10">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
