import { useEffect, useState, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Heart, Stethoscope, Pill, Activity, Thermometer, Eye, Scan, Apple,
  Dumbbell, Monitor, Brain, Shield, Syringe, Bone, Wind, Droplets,
  Flame, Footprints, Gauge, Calculator, ClipboardList, BookOpen,
  Lightbulb, Phone, MessageCircle, FileText, TrendingUp, Zap
} from 'lucide-react';

const iconSets: Record<string, any[]> = {
  home: [Heart, Stethoscope, Pill, Activity, Shield, Brain, Zap, Syringe, Wind, Thermometer],
  symptoms: [Stethoscope, Thermometer, Brain, Activity, Heart, Eye, Wind, Pill],
  skin: [Scan, Eye, Droplets, Shield, Thermometer, Syringe],
  fitness: [Dumbbell, Apple, Flame, Footprints, Activity, Heart, Wind, Gauge],
  posture: [Monitor, Bone, Footprints, Dumbbell, Activity, Eye],
  vitals: [Activity, Heart, Wind, Thermometer, Gauge, Brain],
  medicine: [Pill, Syringe, BookOpen, Shield, Brain, ClipboardList],
  medication: [Pill, ClipboardList, Activity, Heart, Shield],
  reports: [FileText, TrendingUp, ClipboardList, Activity, Heart],
  chat: [MessageCircle, Brain, Stethoscope, Heart, Shield],
  calculator: [Calculator, Activity, Heart, Gauge, TrendingUp],
  firstaid: [Shield, Heart, Syringe, Phone, Activity, Thermometer],
  tips: [Lightbulb, Heart, Apple, Activity, Brain, Shield],
  emergency: [Phone, Heart, Shield, Activity, Syringe],
  default: [Heart, Stethoscope, Activity, Shield, Brain, Pill],
};

interface FloatingBackgroundProps {
  variant?: keyof typeof iconSets;
  count?: number;
}

interface FloatingIcon {
  id: number;
  Icon: any;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  rotation: number;
}

export function FloatingBackground({ variant = 'default', count = 18 }: FloatingBackgroundProps) {
  const icons = useMemo(() => {
    const set = iconSets[variant] || iconSets.default;
    const items: FloatingIcon[] = [];
    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        Icon: set[i % set.length],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 16 + Math.random() * 20,
        duration: 15 + Math.random() * 25,
        delay: Math.random() * -20,
        opacity: 0.03 + Math.random() * 0.05,
        rotation: Math.random() * 360,
      });
    }
    return items;
  }, [variant, count]);

  const { scrollY } = useScroll();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {icons.map(({ id, Icon, x, y, size, duration, delay, opacity, rotation }) => (
        <motion.div
          key={id}
          className="absolute text-primary"
          style={{ left: `${x}%`, top: `${y}%`, opacity }}
          animate={{
            y: [0, -30, 10, -20, 0],
            x: [0, 15, -10, 20, 0],
            rotate: [rotation, rotation + 45, rotation - 30, rotation + 60, rotation],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay,
          }}
        >
          <Icon style={{ width: size, height: size }} />
        </motion.div>
      ))}
    </div>
  );
}
