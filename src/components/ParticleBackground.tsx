import { useCallback, useMemo, useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

const pageConfigs: Record<string, Partial<ISourceOptions>> = {
  home: {
    particles: {
      color: { value: ['#2CA3BF', '#ACF9FD', '#0e7490'] },
      shape: { type: ['circle', 'triangle'] },
      number: { value: 60, density: { enable: true } },
      size: { value: { min: 1, max: 4 } },
      opacity: { value: { min: 0.1, max: 0.4 }, animation: { enable: true, speed: 0.8, sync: false } },
      move: { enable: true, speed: { min: 0.3, max: 1.2 }, direction: 'none' as const, outModes: { default: 'bounce' as const } },
      links: { enable: true, distance: 130, color: '#2CA3BF', opacity: 0.15, width: 1 },
    },
  },
  symptoms: {
    particles: {
      color: { value: ['#2CA3BF', '#22d3ee', '#06b6d4'] },
      shape: { type: ['circle'] },
      number: { value: 45, density: { enable: true } },
      size: { value: { min: 1, max: 3 } },
      opacity: { value: { min: 0.08, max: 0.3 }, animation: { enable: true, speed: 0.5, sync: false } },
      move: { enable: true, speed: { min: 0.2, max: 0.8 }, direction: 'top' as const, outModes: { default: 'out' as const } },
      links: { enable: true, distance: 120, color: '#06b6d4', opacity: 0.12, width: 1 },
    },
  },
  skin: {
    particles: {
      color: { value: ['#2CA3BF', '#ACF9FD', '#67e8f9'] },
      shape: { type: ['circle', 'square'] },
      number: { value: 40, density: { enable: true } },
      size: { value: { min: 1, max: 5 } },
      opacity: { value: { min: 0.06, max: 0.25 } },
      move: { enable: true, speed: { min: 0.3, max: 1 }, direction: 'none' as const, outModes: { default: 'bounce' as const } },
      links: { enable: true, distance: 150, color: '#2CA3BF', opacity: 0.1, width: 1 },
    },
  },
  fitness: {
    particles: {
      color: { value: ['#2CA3BF', '#34d399', '#ACF9FD'] },
      shape: { type: ['circle', 'triangle'] },
      number: { value: 55, density: { enable: true } },
      size: { value: { min: 1, max: 4 } },
      opacity: { value: { min: 0.08, max: 0.35 }, animation: { enable: true, speed: 1, sync: false } },
      move: { enable: true, speed: { min: 0.5, max: 1.5 }, direction: 'none' as const, outModes: { default: 'bounce' as const } },
      links: { enable: true, distance: 140, color: '#34d399', opacity: 0.12, width: 1 },
    },
  },
  default: {
    particles: {
      color: { value: ['#2CA3BF', '#ACF9FD'] },
      shape: { type: 'circle' },
      number: { value: 40, density: { enable: true } },
      size: { value: { min: 1, max: 3 } },
      opacity: { value: { min: 0.05, max: 0.25 } },
      move: { enable: true, speed: { min: 0.2, max: 0.8 }, direction: 'none' as const, outModes: { default: 'bounce' as const } },
      links: { enable: true, distance: 130, color: '#2CA3BF', opacity: 0.1, width: 1 },
    },
  },
};

// Map more variants to existing configs
const variantMap: Record<string, string> = {
  posture: 'fitness', vitals: 'symptoms', medicine: 'default', medication: 'default',
  reports: 'default', chat: 'symptoms', calculator: 'default', firstaid: 'skin',
  tips: 'default', emergency: 'skin',
};

interface ParticleBackgroundProps {
  variant?: string;
}

export function ParticleBackground({ variant = 'default' }: ParticleBackgroundProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  const options: ISourceOptions = useMemo(() => {
    const key = variantMap[variant] || variant;
    const config = pageConfigs[key] || pageConfigs.default;
    return {
      fullScreen: { enable: false },
      fpsLimit: 60,
      detectRetina: true,
      interactivity: {
        events: {
          onHover: { enable: true, mode: 'grab' as const },
          resize: { enable: true },
        },
        modes: {
          grab: { distance: 140, links: { opacity: 0.25 } },
        },
      },
      ...config,
    };
  }, [variant]);

  if (!ready) return null;

  return (
    <Particles
      id={`tsparticles-${variant}`}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      options={options}
    />
  );
}
