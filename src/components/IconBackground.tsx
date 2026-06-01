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
  Plus, Minus, Check, Search, Bell, Home, Accessibility,
  PersonStanding, Baby, HandHeart, HandHelping, HeartHandshake,
  Hospital, Ambulance, CirclePlus, CircleAlert, ClipboardPlus,
  NotepadText, ClipboardCheck, FileHeart, ChartSpline,
  ChartNoAxesCombined, AudioWaveform, BicepsFlexed, Vegan,
  Soup, Beef, Drumstick, Utensils, UtensilsCrossed, Ham,
  Bean, Goal, Medal, Trophy, Timer, AlarmClock, CircleGauge,
  Tablet, Radiation, TestTubes, BrainCircuit, ThermometerSun,
  BadgePlus, ClipboardPenLine, NotebookTabs, BookOpenCheck,
  BadgeAlert, Siren, PhoneCall, MapPinned, Navigation2,
  ShieldPlus, ShieldAlert, BriefcaseBusiness, BaggageClaim,
  PlaneTakeoff, StretchHorizontal, School, KeyRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Each page gets a UNIQUE icon set so backgrounds feel custom per-route.
const ICON_PALETTES: Record<string, LucideIcon[]> = {
  home:        [Heart, HeartPulse, Stethoscope, Activity, Cross, Pill, Sparkles, Shield, Award, Star, Sun, Brain, CirclePlus, HandHeart, HeartHandshake, Hospital, FileHeart, BookOpenCheck, Lightbulb, ChartSpline, Apple, Dumbbell, ThermometerSun, BadgePlus, ClipboardPlus, Baby, Globe, Leaf],
  dashboard:   [Activity, Gauge, CircleGauge, FileText, ClipboardList, Calendar, Clock, Award, BookMarked, NotebookTabs, Bell, Check, Star, Crown, ChartSpline, ChartNoAxesCombined, ClipboardCheck, NotepadText, HeartPulse, Watch, Trophy, Medal, Timer, AlarmClock, ShieldPlus, Sparkles],
  symptoms:    [Stethoscope, Thermometer, ThermometerSun, Brain, BrainCircuit, AlertTriangle, CircleAlert, Eye, Ear, Bone, Hand, Footprints, HeartPulse, Wind, Droplet, Activity, Gauge, ClipboardPenLine, NotepadText, BadgeAlert, AudioWaveform, Pill, Bed, Moon, PhoneCall, ShieldAlert],
  skin:        [Bandage, Hand, Microscope, Scan, Droplet, Leaf, Sun, Sparkles, Camera, Eye, Flower2, Shield, BadgePlus, ClipboardPlus, TestTube, FlaskConical, Heart, ThermometerSun, CirclePlus, HandHelping, FileHeart, Waves, Snowflake, Baby, Lightbulb, Hospital],
  chat:        [MessageCircle, Brain, BrainCircuit, BookOpen, Sparkles, Lightbulb, Mic, Send, Mail, User, Users, Headphones, Volume2, AudioWaveform, ClipboardPenLine, NotepadText, HeartHandshake, Shield, FileText, BookOpenCheck, Globe, Phone, Search, Check, Star, HandHelping],
  fitness:     [Dumbbell, BicepsFlexed, Bike, Footprints, Apple, Salad, Vegan, Soup, Beef, Drumstick, Utensils, UtensilsCrossed, Ham, Carrot, Cherry, Grape, Banana, Fish, Egg, Milk, Wheat, Bean, Flame, Zap, Goal, Medal, Trophy, Timer, HeartPulse, Activity],
  medicine:    [Pill, Tablet, Syringe, FlaskConical, TestTube, TestTubes, BriefcaseMedical, Beaker, Atom, Dna, Microscope, Thermometer, ThermometerSun, Bandage, Cross, CirclePlus, Hospital, Radiation, ShieldPlus, ClipboardPlus, FileHeart, BookMarked, NotepadText, BadgePlus, HeartPulse, Droplet],
  vitals:      [HeartPulse, Heart, Activity, Gauge, CircleGauge, Thermometer, ThermometerSun, Watch, Droplet, Wind, Zap, Bell, Clock, BatteryCharging, AudioWaveform, ChartSpline, ChartNoAxesCombined, Timer, AlarmClock, ClipboardCheck, FileHeart, BrainCircuit, ShieldPlus, BadgeAlert, Smartphone, Monitor],
  reports:     [FileText, ClipboardList, ClipboardPlus, ClipboardCheck, ClipboardPenLine, NotepadText, FileHeart, Microscope, Scan, BookOpen, BookMarked, NotebookTabs, Bookmark, Image, Film, Tag, Calculator, Award, ChartSpline, ChartNoAxesCombined, Search, BadgePlus, ShieldPlus, HeartPulse, Dna, TestTubes],
  calculator:  [Calculator, Scale, Gauge, CircleGauge, Plus, Minus, Apple, Salad, Vegan, Dumbbell, BicepsFlexed, Wheat, Bean, Egg, Milk, Fish, Soup, Utensils, HeartPulse, Activity, ChartSpline, Timer, Goal, Medal, ClipboardCheck, NotepadText],
  posture:     [Accessibility, PersonStanding, StretchHorizontal, Bone, Footprints, Hand, Compass, Monitor, Bed, Dumbbell, BicepsFlexed, Activity, Mountain, Anchor, User, Eye, HeartPulse, ShieldPlus, Goal, Timer, Gauge, CircleGauge, HandHelping, Medal, Crown, Sparkles],
  firstaid:    [Cross, CirclePlus, BriefcaseMedical, Hospital, Ambulance, Bandage, Heart, HeartPulse, AlertTriangle, CircleAlert, Phone, PhoneCall, Shield, ShieldPlus, ShieldAlert, Pill, Tablet, Flame, Droplet, Thermometer, ThermometerSun, Syringe, HandHelping, HandHeart, BadgePlus, Siren, MapPin, Navigation2],
  tips:        [Lightbulb, Sparkles, Apple, Salad, Vegan, Sun, Leaf, Flower2, Bed, Moon, Coffee, TreePine, Star, Heart, HandHeart, BookOpenCheck, Goal, Medal, Timer, Droplet, Waves, Snowflake, Soup, Utensils, BrainCircuit, Footprints],
  emergency:   [AlertTriangle, CircleAlert, Siren, Phone, PhoneCall, Cross, CirclePlus, BriefcaseMedical, Hospital, Ambulance, Heart, HeartPulse, Shield, ShieldAlert, Flame, Bell, MapPin, MapPinned, Navigation, Navigation2, Car, Plane, BadgeAlert, HandHelping, Droplet, ThermometerSun],
  settings:    [Settings, Lock, User, Shield, ShieldPlus, Wifi, BatteryCharging, Smartphone, Monitor, Bell, Tag, Globe, Check, Search, Mail, NotebookTabs, ClipboardCheck, BadgePlus, CircleGauge, Clock, Home, Star, Award, Sparkles],
  about:       [Award, Star, Sparkles, Heart, Brain, BrainCircuit, BookOpen, BookOpenCheck, Lightbulb, User, Crown, Gift, PartyPopper, Music, HandHeart, HeartHandshake, School, Medal, Trophy, NotebookTabs, FileHeart, Globe, Sun, Flower2],
  auth:        [Lock, Shield, ShieldPlus, User, Mail, Heart, Sparkles, Star, Award, Check, Bell, Home, Globe, KeyRound, BadgePlus, CirclePlus, HandHeart, HeartHandshake, Smartphone, Monitor, BookOpenCheck, Lightbulb],
  travel:      [Plane, PlaneTakeoff, Car, Map, MapPinned, Compass, Globe, Sun, Snowflake, Wind, BriefcaseMedical, BriefcaseBusiness, Phone, PhoneCall, Tent, Backpack, BaggageClaim, MapPin, Navigation, Navigation2, Anchor, ShieldPlus, Hospital, Pill, Cross, Droplet],
  default:     [Heart, HeartPulse, Activity, Stethoscope, Pill, Tablet, Cross, CirclePlus, Sparkles, Shield, ShieldPlus, Star, Sun, Leaf, Brain, BrainCircuit, Bell, BookOpenCheck, FileHeart, HandHeart, BadgePlus, ClipboardPlus, ThermometerSun, Droplet],
};

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
        const jitterX = (rand() - 0.5) * cellW * 0.42;
        const jitterY = (rand() - 0.5) * cellH * 0.42;
        const left = c * cellW + cellW / 2 + jitterX;
        const top = r * cellH + cellH / 2 + jitterY;
        const size = 13 + rand() * 16; // 13-29px - dense but non-overlapping
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
