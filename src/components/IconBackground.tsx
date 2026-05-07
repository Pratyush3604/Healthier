import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Stethoscope, Pill, Syringe, Heart, Activity, Cross,
  Thermometer, HeartPulse, BriefcaseMedical, Bandage, Brain,
  Microscope, FlaskConical, TestTube, Dna, Bone, Eye, Ear,
  Hand, Footprints, Apple, Salad, Dumbbell, Bike,
  Droplet, Leaf, Flower2, Sparkles, Sun, Moon, Snowflake,
  Bed, Coffee, BookOpen, Lightbulb, MessageCircle, FileText,
  ClipboardList, Calculator, Calendar, Clock, Phone, Camera,
  Scan, Shield, Award, Star, Zap, Wind, Compass, Globe,
  Map, Plane, Car, AlertTriangle, BatteryCharging, Wifi,
  Smartphone, Monitor, Watch, Music, Gauge, Scale,
  Atom, Beaker, Lock, Settings, User, Users, Mail,
  Carrot, Cherry, Grape, Banana, Fish, Egg, Milk, Wheat,
  Flame, CloudRain, TreePine, Mountain, Waves, Anchor,
  Tent, Backpack, Glasses, Crown, Gift, PartyPopper,
  Headphones, Mic, Volume2, Image, Film, BookMarked,
  Bookmark, Tag, Flag, MapPin, Navigation, Send,
  Plus, Minus, Check, Search, Bell, Home,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Each page gets a UNIQUE icon set so backgrounds feel custom per-route.
const ICON_PALETTES: Record<string, LucideIcon[]> = {
  home:        [Heart, HeartPulse, Stethoscope, Activity, Cross, Pill, Sparkles, Shield, Award, Star, Sun, Brain],
  dashboard:   [Activity, Gauge, FileText, ClipboardList, Calendar, Clock, Award, BookMarked, Bell, Check, Star, Crown],
  symptoms:    [Stethoscope, Thermometer, Brain, AlertTriangle, Eye, Ear, Bone, Hand, HeartPulse, Wind, Droplet, Activity],
  skin:        [Bandage, Hand, Microscope, Scan, Droplet, Leaf, Sun, Sparkles, Camera, Eye, Flower2, Shield],
  chat:        [MessageCircle, Brain, BookOpen, Sparkles, Lightbulb, Mic, Send, Mail, User, Users, Headphones, Volume2],
  fitness:     [Dumbbell, Bike, Apple, Salad, Footprints, Carrot, Cherry, Grape, Banana, Fish, Egg, Wheat, Flame, Zap],
  medicine:    [Pill, Syringe, FlaskConical, TestTube, BriefcaseMedical, Beaker, Atom, Dna, Microscope, Thermometer, Bandage, Cross],
  vitals:      [HeartPulse, Heart, Activity, Gauge, Thermometer, Watch, Droplet, Wind, Zap, Bell, Clock, BatteryCharging],
  reports:     [FileText, ClipboardList, Microscope, Scan, BookOpen, BookMarked, Bookmark, Image, Film, Tag, Calculator, Award],
  calculator:  [Calculator, Scale, Gauge, Plus, Minus, Apple, Dumbbell, Wheat, Salad, Egg, Milk, Activity],
  posture:     [Bone, Footprints, Hand, Compass, Monitor, Bed, Dumbbell, Activity, Mountain, Anchor, Crown, User],
  firstaid:    [Cross, BriefcaseMedical, Bandage, Heart, AlertTriangle, Phone, Shield, Pill, Flame, Droplet, Thermometer, Syringe],
  tips:        [Lightbulb, Sparkles, Apple, Salad, Sun, Leaf, Flower2, Bed, Moon, Coffee, TreePine, Star],
  emergency:   [AlertTriangle, Phone, Cross, BriefcaseMedical, Heart, Shield, Flame, Bell, MapPin, Navigation, Car, Plane],
  settings:    [Settings, Lock, User, Shield, Wifi, BatteryCharging, Smartphone, Monitor, Bell, Tag, Globe, Check],
  about:       [Award, Star, Sparkles, Heart, Brain, BookOpen, Lightbulb, User, Crown, Gift, PartyPopper, Trophy(),],
  auth:        [Lock, Shield, User, Mail, Heart, Sparkles, Star, Award, Check, Bell, Home, Globe],
  travel:      [Plane, Car, Map, Compass, Globe, Sun, Snowflake, Wind, BriefcaseMedical, Phone, Tent, Backpack, MapPin, Anchor],
  default:     [Heart, Activity, Stethoscope, Pill, Cross, Sparkles, Shield, Star, Sun, Leaf, Brain, Bell],
};

// Trophy isn't always exported; fallback inline
function Trophy() { return Award as unknown as LucideIcon; }

interface IconBackgroundProps {
  count?: number;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function IconBackground({ count = 140 }: IconBackgroundProps) {
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
    const palette = (ICON_PALETTES[variant] || ICON_PALETTES.default).filter(Boolean) as LucideIcon[];
    let seed = 0;
    for (let i = 0; i < variant.length; i++) seed = (seed * 31 + variant.charCodeAt(i)) | 0;
    const rand = mulberry32(seed >>> 0 || 1);

    // Jittered-grid layout — guarantees non-overlapping spread across the page.
    // Choose grid dimensions to roughly match the requested count.
    const cols = Math.ceil(Math.sqrt(count * 1.4));
    const rows = Math.ceil(count / cols);
    const cellW = 100 / cols;
    const cellH = 100 / rows;
    const result: Array<{
      Icon: LucideIcon; top: number; left: number; size: number;
      rotate: number; opacity: number; dur: number; delay: number; key: string;
    }> = [];

    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (result.length >= count) break;
        const Icon = palette[idx % palette.length];
        idx++;
        // Rotate icon order each row so neighbors differ
        const jitterX = (rand() - 0.5) * cellW * 0.55;
        const jitterY = (rand() - 0.5) * cellH * 0.55;
        const left = c * cellW + cellW / 2 + jitterX;
        const top = r * cellH + cellH / 2 + jitterY;
        const size = 16 + rand() * 22; // 16-38px - smaller so they don't overlap
        const rotate = (rand() - 0.5) * 50;
        const opacity = 0.05 + rand() * 0.08;
        const dur = 20 + rand() * 18;
        const delay = rand() * -dur;
        result.push({
          Icon, top, left, size, rotate, opacity, dur, delay,
          key: `${variant}-${r}-${c}`,
        });
      }
    }
    return result;
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
              transform: `translate(-50%, -50%) rotate(${it.rotate}deg)`,
              animation: `iconFloat ${it.dur}s ease-in-out ${it.delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}
