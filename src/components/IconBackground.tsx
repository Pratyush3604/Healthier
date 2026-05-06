import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Stethoscope, Pill, Syringe, Heart, Activity, Cross,
  Thermometer, HeartPulse, BriefcaseMedical, Bandage, Brain,
  Microscope, FlaskConical, TestTube, Dna, Bone, Eye, Ear,
  Smile, Hand, Footprints, Apple, Salad, Dumbbell, Bike,
  Droplet, Leaf, Flower2, Sparkles, Sun, Moon, Snowflake,
  Bed, Coffee, BookOpen, Lightbulb, MessageCircle, FileText,
  ClipboardList, Calculator, Calendar, Clock, Phone, Camera,
  Scan, Shield, Award, Star, Zap, Wind, Compass, Globe,
  Map, Plane, Car, AlertTriangle, BatteryCharging, Wifi,
  Smartphone, Monitor, Radio, Watch, Music, Gauge, Scale,
  Atom, Beaker, Lock, Settings, User, Users, Mail
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Page-specific icon palettes — each route gets different medical/wellness symbols
// so the background patterns feel custom and clearly distinct from page to page.
const ICON_PALETTES: Record<string, LucideIcon[]> = {
  home:        [Heart, HeartPulse, Stethoscope, Activity, Cross, Pill, Sparkles, Shield],
  dashboard:   [Activity, HeartPulse, Gauge, FileText, ClipboardList, Calendar, Clock, Award],
  symptoms:    [Stethoscope, Thermometer, Brain, AlertTriangle, Activity, HeartPulse, Eye, Ear],
  skin:        [Bandage, Hand, Microscope, Scan, Droplet, Leaf, Sun, Sparkles],
  chat:        [MessageCircle, Brain, BookOpen, Sparkles, Lightbulb, User, Users, Mail],
  fitness:     [Dumbbell, Bike, Apple, Salad, Footprints, Activity, Heart, Zap],
  medicine:    [Pill, Syringe, FlaskConical, TestTube, BriefcaseMedical, Beaker, Atom, Dna],
  vitals:      [HeartPulse, Heart, Activity, Gauge, Thermometer, Watch, Droplet, Wind],
  reports:     [FileText, ClipboardList, Microscope, Scan, Brain, BookOpen, Calculator, Award],
  calculator:  [Calculator, Scale, Gauge, Activity, Apple, Heart, Dna, Bone],
  posture:     [Bone, User, Activity, Footprints, Hand, Compass, Monitor, Bed],
  firstaid:    [Cross, BriefcaseMedical, Bandage, Heart, AlertTriangle, Phone, Shield, Pill],
  tips:        [Lightbulb, Sparkles, Apple, Salad, Sun, Leaf, Flower2, Bed, Moon, Coffee],
  emergency:   [AlertTriangle, Phone, Cross, BriefcaseMedical, Heart, Shield, Activity, Zap],
  settings:    [Settings, Lock, User, Shield, Wifi, BatteryCharging, Smartphone, Monitor],
  about:       [Award, Star, Sparkles, Heart, Brain, BookOpen, Lightbulb, User],
  auth:        [Lock, Shield, User, Mail, Heart, Sparkles, Star, Award],
  travel:      [Plane, Car, Map, Compass, Globe, Sun, Snowflake, Wind, BriefcaseMedical, Phone],
  default:     [Heart, Activity, Stethoscope, Pill, Cross, Sparkles, Shield, Star],
};

interface IconBackgroundProps {
  count?: number;
}

// Deterministic pseudo-random so icon layout is stable per variant (no jitter on re-renders).
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function IconBackground({ count = 90 }: IconBackgroundProps) {
  const location = useLocation();

  const variant = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/skin')) return 'skin';
    if (path.startsWith('/symptoms')) return 'symptoms';
    if (path.startsWith('/chat') || path.startsWith('/ai-doctor')) return 'chat';
    if (path.startsWith('/fitness')) return 'fitness';
    if (path.startsWith('/medicine') || path.startsWith('/medication')) return 'medicine';
    if (path.startsWith('/vitals')) return 'vitals';
    if (path.startsWith('/reports') || path.startsWith('/health-reports')) return 'reports';
    if (path.startsWith('/bmi')) return 'calculator';
    if (path.startsWith('/posture')) return 'posture';
    if (path.startsWith('/first-aid')) return 'firstaid';
    if (path.startsWith('/health-tips')) return 'tips';
    if (path.startsWith('/emergency')) return 'emergency';
    if (path.startsWith('/settings')) return 'settings';
    if (path.startsWith('/about') || path.startsWith('/how-to-use')) return 'about';
    if (path.startsWith('/auth')) return 'auth';
    if (path.startsWith('/travel')) return 'travel';
    if (path.startsWith('/dashboard')) return 'dashboard';
    return 'default';
  }, [location.pathname]);

  const items = useMemo(() => {
    const palette = ICON_PALETTES[variant] || ICON_PALETTES.default;
    // Hash the variant name to a seed for deterministic positions per page.
    let seed = 0;
    for (let i = 0; i < variant.length; i++) seed = (seed * 31 + variant.charCodeAt(i)) | 0;
    const rand = mulberry32(seed >>> 0 || 1);

    return Array.from({ length: count }, (_, i) => {
      const Icon = palette[Math.floor(rand() * palette.length)];
      const top = rand() * 100;
      const left = rand() * 100;
      const size = 14 + rand() * 32; // 14-46px
      const rotate = rand() * 360;
      const opacity = 0.05 + rand() * 0.10; // very subtle so content stays readable
      const dur = 18 + rand() * 22;
      const delay = rand() * -dur; // start mid-animation
      return { Icon, top, left, size, rotate, opacity, dur, delay, key: `${variant}-${i}` };
    });
  }, [variant, count]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      style={{ contain: 'strict' }}
    >
      {items.map((it) => {
        const I = it.Icon;
        return (
          <I
            key={it.key}
            className="absolute text-primary will-change-transform"
            style={{
              top: `${it.top}%`,
              left: `${it.left}%`,
              width: it.size,
              height: it.size,
              opacity: it.opacity,
              transform: `rotate(${it.rotate}deg)`,
              animation: `iconFloat ${it.dur}s ease-in-out ${it.delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}
