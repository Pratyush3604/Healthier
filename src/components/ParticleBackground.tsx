import { useMemo, useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

// Each page gets a distinct configuration: shapes, motion patterns, colors,
// link styles. The variants below aim to evoke a "medical" feel — DNA helix-like
// upward drift, heartbeat-pulse, cellular grid, etc.
const pageConfigs: Record<string, Partial<ISourceOptions>> = {
  // Home — calm, mixed shapes, gentle network ("network of care")
  home: {
    particles: {
      color: { value: ['#2CA3BF', '#ACF9FD', '#0e7490', '#67e8f9'] },
      shape: { type: ['circle', 'triangle', 'edge'] },
      number: { value: 70, density: { enable: true } },
      size: { value: { min: 1, max: 4 } },
      opacity: { value: { min: 0.1, max: 0.45 }, animation: { enable: true, speed: 0.8, sync: false } },
      move: { enable: true, speed: { min: 0.3, max: 1.2 }, direction: 'none' as const, outModes: { default: 'bounce' as const } },
      links: { enable: true, distance: 140, color: '#2CA3BF', opacity: 0.18, width: 1 },
    },
  },
  // Symptoms — DNA-like upward drift, narrow links (helix vibe)
  symptoms: {
    particles: {
      color: { value: ['#2CA3BF', '#22d3ee', '#06b6d4'] },
      shape: { type: ['circle'] },
      number: { value: 55, density: { enable: true } },
      size: { value: { min: 1, max: 3 } },
      opacity: { value: { min: 0.1, max: 0.35 }, animation: { enable: true, speed: 0.5, sync: false } },
      move: { enable: true, speed: { min: 0.3, max: 0.9 }, direction: 'top' as const, outModes: { default: 'out' as const } },
      links: { enable: true, distance: 100, color: '#06b6d4', opacity: 0.18, width: 1 },
    },
  },
  // Skin/Injury — cellular look with squares/circles
  skin: {
    particles: {
      color: { value: ['#2CA3BF', '#ACF9FD', '#67e8f9', '#fb7185'] },
      shape: { type: ['circle', 'square', 'edge'] },
      number: { value: 50, density: { enable: true } },
      size: { value: { min: 1, max: 5 } },
      opacity: { value: { min: 0.08, max: 0.3 } },
      move: { enable: true, speed: { min: 0.3, max: 1 }, direction: 'none' as const, outModes: { default: 'bounce' as const } },
      links: { enable: true, distance: 150, color: '#2CA3BF', opacity: 0.14, width: 1 },
    },
  },
  // Fitness — energetic triangles bouncing fast
  fitness: {
    particles: {
      color: { value: ['#2CA3BF', '#34d399', '#10b981', '#ACF9FD'] },
      shape: { type: ['triangle', 'circle'] },
      number: { value: 65, density: { enable: true } },
      size: { value: { min: 2, max: 5 } },
      opacity: { value: { min: 0.1, max: 0.4 }, animation: { enable: true, speed: 1.2, sync: false } },
      move: { enable: true, speed: { min: 0.8, max: 2 }, direction: 'none' as const, outModes: { default: 'bounce' as const } },
      links: { enable: true, distance: 130, color: '#34d399', opacity: 0.15, width: 1 },
    },
  },
  // Vitals — heartbeat-pulse: particles oscillate horizontally
  vitals: {
    particles: {
      color: { value: ['#ef4444', '#f87171', '#fca5a5', '#2CA3BF'] },
      shape: { type: ['circle'] },
      number: { value: 50, density: { enable: true } },
      size: { value: { min: 1, max: 3 } },
      opacity: { value: { min: 0.1, max: 0.45 }, animation: { enable: true, speed: 1.5, sync: true } },
      move: { enable: true, speed: { min: 0.8, max: 2 }, direction: 'right' as const, outModes: { default: 'out' as const } },
      links: { enable: true, distance: 120, color: '#ef4444', opacity: 0.15, width: 1 },
    },
  },
  // Medicine — pill-like polygon shapes
  medicine: {
    particles: {
      color: { value: ['#a855f7', '#c084fc', '#2CA3BF', '#ACF9FD'] },
      shape: { type: ['polygon', 'circle'] },
      polygon: { sides: 6 },
      number: { value: 50, density: { enable: true } },
      size: { value: { min: 1, max: 4 } },
      opacity: { value: { min: 0.1, max: 0.35 } },
      move: { enable: true, speed: { min: 0.3, max: 0.9 }, direction: 'none' as const, outModes: { default: 'bounce' as const } },
      links: { enable: true, distance: 140, color: '#a855f7', opacity: 0.13, width: 1 },
    },
  },
  // Reports — analytical grid feel
  reports: {
    particles: {
      color: { value: ['#2CA3BF', '#ACF9FD', '#0ea5e9'] },
      shape: { type: ['edge', 'circle', 'square'] },
      number: { value: 45, density: { enable: true } },
      size: { value: { min: 1, max: 3 } },
      opacity: { value: { min: 0.1, max: 0.3 } },
      move: { enable: true, speed: { min: 0.3, max: 0.7 }, direction: 'none' as const, outModes: { default: 'bounce' as const } },
      links: { enable: true, distance: 160, color: '#0ea5e9', opacity: 0.18, width: 1 },
    },
  },
  // Emergency — urgent red, faster motion
  emergency: {
    particles: {
      color: { value: ['#ef4444', '#dc2626', '#fbbf24'] },
      shape: { type: ['triangle', 'circle'] },
      number: { value: 50, density: { enable: true } },
      size: { value: { min: 1, max: 4 } },
      opacity: { value: { min: 0.15, max: 0.5 }, animation: { enable: true, speed: 2, sync: false } },
      move: { enable: true, speed: { min: 1, max: 2.5 }, direction: 'none' as const, outModes: { default: 'bounce' as const } },
      links: { enable: true, distance: 130, color: '#ef4444', opacity: 0.2, width: 1 },
    },
  },
  // Chat — soft floating circles
  chat: {
    particles: {
      color: { value: ['#2CA3BF', '#ACF9FD', '#67e8f9'] },
      shape: { type: ['circle'] },
      number: { value: 40, density: { enable: true } },
      size: { value: { min: 2, max: 5 } },
      opacity: { value: { min: 0.08, max: 0.3 } },
      move: { enable: true, speed: { min: 0.2, max: 0.6 }, direction: 'top-right' as const, outModes: { default: 'out' as const } },
      links: { enable: true, distance: 130, color: '#2CA3BF', opacity: 0.12, width: 1 },
    },
  },
  // Settings — minimal, slow
  settings: {
    particles: {
      color: { value: ['#94a3b8', '#cbd5e1', '#2CA3BF'] },
      shape: { type: ['circle', 'square'] },
      number: { value: 30, density: { enable: true } },
      size: { value: { min: 1, max: 3 } },
      opacity: { value: { min: 0.05, max: 0.2 } },
      move: { enable: true, speed: { min: 0.1, max: 0.4 }, direction: 'none' as const, outModes: { default: 'bounce' as const } },
      links: { enable: true, distance: 150, color: '#94a3b8', opacity: 0.08, width: 1 },
    },
  },
  // First aid — calming green
  firstaid: {
    particles: {
      color: { value: ['#22c55e', '#86efac', '#2CA3BF'] },
      shape: { type: ['edge', 'circle'] },
      number: { value: 50, density: { enable: true } },
      size: { value: { min: 1, max: 4 } },
      opacity: { value: { min: 0.1, max: 0.3 } },
      move: { enable: true, speed: { min: 0.4, max: 1 }, direction: 'none' as const, outModes: { default: 'bounce' as const } },
      links: { enable: true, distance: 140, color: '#22c55e', opacity: 0.15, width: 1 },
    },
  },
  // Posture — vertical drift
  posture: {
    particles: {
      color: { value: ['#fbbf24', '#fde68a', '#2CA3BF'] },
      shape: { type: ['edge', 'circle'] },
      number: { value: 45, density: { enable: true } },
      size: { value: { min: 1, max: 3 } },
      opacity: { value: { min: 0.1, max: 0.35 } },
      move: { enable: true, speed: { min: 0.3, max: 0.8 }, direction: 'bottom' as const, outModes: { default: 'out' as const } },
      links: { enable: true, distance: 130, color: '#fbbf24', opacity: 0.13, width: 1 },
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

const variantMap: Record<string, string> = {
  medication: 'medicine',
  calculator: 'settings',
  tips: 'firstaid',
  dashboard: 'home',
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
          grab: { distance: 140, links: { opacity: 0.3 } },
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
