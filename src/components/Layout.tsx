import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ErrorBoundary } from './ErrorBoundary';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid opacity-50 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-radial pointer-events-none" />
      
      {/* Animated Blobs */}
      <div 
        className="bg-blob animate-blob"
        style={{
          top: '10%',
          left: '10%',
          width: '400px',
          height: '400px',
          background: 'hsla(172, 66%, 50%, 0.15)',
        }}
      />
      <div 
        className="bg-blob animate-blob"
        style={{
          top: '60%',
          right: '10%',
          width: '350px',
          height: '350px',
          background: 'hsla(217, 91%, 60%, 0.1)',
          animationDelay: '-4s',
        }}
      />
      <div 
        className="bg-blob animate-blob"
        style={{
          bottom: '10%',
          left: '30%',
          width: '300px',
          height: '300px',
          background: 'hsla(280, 65%, 60%, 0.08)',
          animationDelay: '-2s',
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
