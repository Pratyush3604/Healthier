import { useMemo, useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

/**
 * Per-page medical-themed particle backgrounds.
 *
 * Each variant has a distinct visual personality so every page feels unique:
 * - home: gentle network — circles + crosses ("network of care")
 * - symptoms: upward-drifting dots (DNA helix vibe) with vertical pulses
 * - skin: warm cellular grid (skin cells)
 * - fitness: fast bouncing triangles + green tones (energy)
 * - vitals: heartbeat horizontal pulse, deep cyan
 * - medicine: pill-shaped polygons drifting slowly
 * - posture: orderly grid bouncing (alignment)
 * - reports: soft documents — squares falling slowly
 * - chat: dialog circles bobbing
 * - calculator/settings: minimal slow drifting dots
 * - firstaid/tips: red+teal cross-shapes (medical kit)
 * - emergency: urgent red pulses
 * - dashboard: lively mix
 * - default: subtle teal network
 *
 * Shapes use polygon "sides" to vary geometry across pages without bundling
 * extra image assets, so this works offline and keeps the bundle small.
 */
const pageConfigs: Record<string, any> = {
  home: {
    particles: {
      color: { value: ['#2CA3BF', '#ACF9FD', '#0e7490', '#67e8f9'] },
      shape: { type: ['circle', 'polygon'], options: { polygon: { sides: 6 } } },
      number: { value: 80, density: { enable: true } },
      size: { value: { min: 1, max: 4 } },
      opacity: { value: { min: 0.1, max: 0.5 }, animation: { enable: true, speed: 0.8, sync: false } },
      move: { enable: true, speed: { min: 0.3, max: 1.2 }, direction: 'none', outModes: { default: 'bounce' } },
      links: { enable: true, distance: 140, color: '#2CA3BF', opacity: 0.22, width: 1 },
    },
  },
  symptoms: {
    particles: {
      color: { value: ['#2CA3BF', '#22d3ee', '#06b6d4'] },
      shape: { type: ['circle', 'polygon'], options: { polygon: { sides: 3 } } },
      number: { value: 70, density: { enable: true } },
      size: { value: { min: 1, max: 3 } },
      opacity: { value: { min: 0.15, max: 0.45 }, animation: { enable: true, speed: 0.5, sync: false } },
      move: { enable: true, speed: { min: 0.4, max: 1.1 }, direction: 'top', outModes: { default: 'out' } },
      links: { enable: true, distance: 110, color: '#06b6d4', opacity: 0.22, width: 1 },
    },
  },
  skin: {
    particles: {
      color: { value: ['#2CA3BF', '#fb7185', '#fda4af', '#67e8f9'] },
      shape: { type: ['circle', 'polygon'], options: { polygon: { sides: 6 } } },
      number: { value: 60, density: { enable: true } },
      size: { value: { min: 2, max: 6 } },
      opacity: { value: { min: 0.1, max: 0.35 } },
      move: { enable: true, speed: { min: 0.2, max: 0.8 }, direction: 'none', outModes: { default: 'bounce' } },
      links: { enable: true, distance: 150, color: '#2CA3BF', opacity: 0.18, width: 1 },
    },
  },
  fitness: {
    particles: {
      color: { value: ['#34d399', '#10b981', '#2CA3BF', '#ACF9FD'] },
      shape: { type: ['triangle', 'polygon'], options: { polygon: { sides: 5 } } },
      number: { value: 75, density: { enable: true } },
      size: { value: { min: 2, max: 6 } },
      opacity: { value: { min: 0.15, max: 0.5 }, animation: { enable: true, speed: 1.5, sync: false } },
      move: { enable: true, speed: { min: 1.0, max: 2.5 }, direction: 'none', outModes: { default: 'bounce' } },
      links: { enable: true, distance: 120, color: '#34d399', opacity: 0.2, width: 1 },
    },
  },
  vitals: {
    particles: {
      color: { value: ['#ef4444', '#f87171', '#2CA3BF'] },
      shape: { type: 'circle' },
      number: { value: 90, density: { enable: true } },
      size: { value: { min: 1, max: 3 }, animation: { enable: true, speed: 4, startValue: 'min', sync: false } },
      opacity: { value: { min: 0.2, max: 0.6 }, animation: { enable: true, speed: 2.5, sync: false } },
      move: { enable: true, speed: { min: 0.6, max: 1.6 }, direction: 'right', outModes: { default: 'out' } },
      links: { enable: true, distance: 90, color: '#ef4444', opacity: 0.18, width: 1 },
    },
  },
  medicine: {
    particles: {
      color: { value: ['#2CA3BF', '#ACF9FD', '#a78bfa', '#67e8f9'] },
      shape: { type: 'polygon', options: { polygon: { sides: 4 } } },
      number: { value: 55, density: { enable: true } },
      size: { value: { min: 3, max: 7 } },
      opacity: { value: { min: 0.12, max: 0.35 } },
      rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 3, sync: false } },
      move: { enable: true, speed: { min: 0.3, max: 0.9 }, direction: 'top-right', outModes: { default: 'out' } },
      links: { enable: false },
    },
  },
  posture: {
    particles: {
      color: { value: ['#2CA3BF', '#ACF9FD', '#67e8f9'] },
      shape: { type: ['polygon', 'edge'], options: { polygon: { sides: 4 } } },
      number: { value: 50, density: { enable: true } },
      size: { value: { min: 1, max: 4 } },
      opacity: { value: { min: 0.1, max: 0.3 } },
      move: { enable: true, speed: 0.4, direction: 'none', outModes: { default: 'bounce' } },
      links: { enable: true, distance: 160, color: '#2CA3BF', opacity: 0.25, width: 1.2 },
    },
  },
  reports: {
    particles: {
      color: { value: ['#2CA3BF', '#ACF9FD', '#94a3b8'] },
      shape: { type: 'polygon', options: { polygon: { sides: 4 } } },
      number: { value: 45, density: { enable: true } },
      size: { value: { min: 3, max: 8 } },
      opacity: { value: { min: 0.08, max: 0.22 } },
      move: { enable: true, speed: { min: 0.2, max: 0.7 }, direction: 'bottom', outModes: { default: 'out' } },
      links: { enable: false },
    },
  },
  chat: {
    particles: {
      color: { value: ['#2CA3BF', '#ACF9FD', '#a78bfa'] },
      shape: { type: 'circle' },
      number: { value: 60, density: { enable: true } },
      size: { value: { min: 2, max: 5 } },
      opacity: { value: { min: 0.15, max: 0.4 }, animation: { enable: true, speed: 1.2, sync: false } },
      move: { enable: true, speed: { min: 0.4, max: 1.0 }, direction: 'top', outModes: { default: 'out' } },
      links: { enable: true, distance: 120, color: '#a78bfa', opacity: 0.18, width: 1 },
    },
  },
  calculator: {
    particles: {
      color: { value: ['#2CA3BF', '#ACF9FD'] },
      shape: { type: 'polygon', options: { polygon: { sides: 4 } } },
      number: { value: 40, density: { enable: true } },
      size: { value: { min: 1, max: 3 } },
      opacity: { value: { min: 0.08, max: 0.25 } },
      move: { enable: true, speed: 0.3, direction: 'none', outModes: { default: 'bounce' } },
      links: { enable: true, distance: 140, color: '#2CA3BF', opacity: 0.16, width: 1 },
    },
  },
  settings: {
    particles: {
      color: { value: ['#94a3b8', '#2CA3BF'] },
      shape: { type: ['polygon', 'circle'], options: { polygon: { sides: 8 } } },
      number: { value: 35, density: { enable: true } },
      size: { value: { min: 2, max: 5 } },
      opacity: { value: { min: 0.08, max: 0.25 } },
      rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 2, sync: false } },
      move: { enable: true, speed: 0.3, direction: 'none', outModes: { default: 'bounce' } },
      links: { enable: false },
    },
  },
  firstaid: {
    particles: {
      color: { value: ['#ef4444', '#2CA3BF', '#ACF9FD'] },
      shape: { type: ['polygon', 'circle'], options: { polygon: { sides: 4 } } },
      number: { value: 50, density: { enable: true } },
      size: { value: { min: 2, max: 5 } },
      opacity: { value: { min: 0.12, max: 0.35 } },
      move: { enable: true, speed: { min: 0.3, max: 0.9 }, direction: 'none', outModes: { default: 'bounce' } },
      links: { enable: true, distance: 140, color: '#ef4444', opacity: 0.18, width: 1 },
    },
  },
  tips: {
    particles: {
      color: { value: ['#facc15', '#2CA3BF', '#ACF9FD'] },
      shape: { type: ['polygon', 'circle'], options: { polygon: { sides: 5 } } },
      number: { value: 50, density: { enable: true } },
      size: { value: { min: 2, max: 5 } },
      opacity: { value: { min: 0.12, max: 0.35 }, animation: { enable: true, speed: 1, sync: false } },
      move: { enable: true, speed: { min: 0.3, max: 1 }, direction: 'top', outModes: { default: 'out' } },
      links: { enable: true, distance: 130, color: '#facc15', opacity: 0.15, width: 1 },
    },
  },
  emergency: {
    particles: {
      color: { value: ['#ef4444', '#f87171', '#fb923c'] },
      shape: { type: 'circle' },
      number: { value: 80, density: { enable: true } },
      size: { value: { min: 1, max: 4 }, animation: { enable: true, speed: 4, sync: false } },
      opacity: { value: { min: 0.2, max: 0.6 }, animation: { enable: true, speed: 3, sync: false } },
      move: { enable: true, speed: { min: 0.8, max: 2 }, direction: 'none', outModes: { default: 'bounce' } },
      links: { enable: true, distance: 110, color: '#ef4444', opacity: 0.25, width: 1 },
    },
  },
  dashboard: {
    particles: {
      color: { value: ['#2CA3BF', '#ACF9FD', '#a78bfa', '#34d399'] },
      shape: { type: ['circle', 'polygon', 'triangle'], options: { polygon: { sides: 6 } } },
      number: { value: 75, density: { enable: true } },
      size: { value: { min: 1, max: 4 } },
      opacity: { value: { min: 0.12, max: 0.4 } },
      move: { enable: true, speed: { min: 0.4, max: 1.3 }, direction: 'none', outModes: { default: 'bounce' } },
      links: { enable: true, distance: 130, color: '#2CA3BF', opacity: 0.2, width: 1 },
    },
  },
  default: {
    particles: {
      color: { value: ['#2CA3BF', '#ACF9FD'] },
      shape: { type: 'circle' },
      number: { value: 50, density: { enable: true } },
      size: { value: { min: 1, max: 3 } },
      opacity: { value: { min: 0.08, max: 0.28 } },
      move: { enable: true, speed: { min: 0.2, max: 0.8 }, direction: 'none', outModes: { default: 'bounce' } },
      links: { enable: true, distance: 130, color: '#2CA3BF', opacity: 0.14, width: 1 },
    },
  },
};

const variantMap: Record<string, string> = {
  medication: 'medicine',
  bmi: 'calculator',
  travel: 'tips',
  about: 'home',
  auth: 'default',
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

  const options = useMemo(() => {
    const key = variantMap[variant] || variant;
    const config = pageConfigs[key] || pageConfigs.default;
    return {
      fullScreen: { enable: false },
      fpsLimit: 60,
      detectRetina: true,
      interactivity: {
        events: {
          onHover: { enable: true, mode: 'grab' },
          resize: { enable: true },
        },
        modes: {
          grab: { distance: 140, links: { opacity: 0.35 } },
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
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' } as any}
      options={options as any}
    />
  );
}
