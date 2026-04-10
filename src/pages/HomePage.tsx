import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Stethoscope, Activity, FileText, MessageCircle,
  BookOpen, Lightbulb, Phone, Shield, Zap, Heart,
  Sparkles, Pill, Scan, Calculator,
  ClipboardList, TrendingUp, Monitor, Apple, Dumbbell, ChevronRight, Lock, HelpCircle
} from 'lucide-react';
import { FloatingBackground } from '@/components/FloatingBackground';
import { ScrollReveal } from '@/components/ScrollReveal';

const categories = {
  'AI Diagnostics': [
    { icon: Stethoscope, title: 'Symptom Checker', description: 'AI urgency assessment from 100+ symptoms', link: '/symptoms' },
    { icon: Scan, title: 'Skin & Injury Analyzer', description: 'Photo-based skin & wound analysis', link: '/skin-injury' },
    { icon: FileText, title: 'Report Analysis', description: 'X-rays, MRIs & labs explained by AI', link: '/reports' },
  ],
  'AI Consultation': [
    { icon: MessageCircle, title: 'AI Chat', description: 'Text-based medical consultation', link: '/chat' },
    { icon: Pill, title: 'Medicine Encyclopedia', description: 'Comprehensive drug analysis', link: '/medicine-info' },
  ],
  'Fitness & Wellness': [
    { icon: Apple, title: 'Diet & Workout Planner', description: 'AI meal plans + exercise routines', link: '/fitness' },
    { icon: Monitor, title: 'Posture Corrector', description: 'Exercises & ergonomic tips', link: '/posture-corrector' },
    { icon: Calculator, title: 'Health Calculator', description: 'BMI, body fat & ideal weight', link: '/bmi-calculator' },
    { icon: Activity, title: 'Vital Signs', description: 'Track heart rate, SpO2 & BP', link: '/vitals' },
  ],
  'Tools & Guides': [
    { icon: ClipboardList, title: 'Med Reminders', description: 'Set medication alarms', link: '/medication-reminder' },
    { icon: TrendingUp, title: 'Health Reports', description: 'Auto-generated from usage', link: '/health-reports' },
    { icon: BookOpen, title: 'First Aid Guide', description: '60+ emergency instructions', link: '/first-aid' },
    { icon: Lightbulb, title: 'Health Tips', description: '170+ wellness tips', link: '/health-tips' },
    { icon: Phone, title: 'Emergency Numbers', description: '100+ country numbers', link: '/emergency' },
    { icon: HelpCircle, title: 'How to Use', description: 'Detailed guide for every tool', link: '/how-to-use' },
  ],
};

const stats = [
  { value: '15', label: 'Health Tools', icon: Sparkles },
  { value: '24/7', label: 'Available', icon: Zap },
  { value: 'Free', label: 'To Use', icon: Heart },
  { value: 'Private', label: '& Secure', icon: Lock },
];

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      <FloatingBackground variant="home" count={24} />

      {/* Hero */}
      <section className="relative py-24 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary/5 blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-accent/5 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
          <svg viewBox="0 0 800 200" className="w-[120%] max-w-none" preserveAspectRatio="none">
            <motion.path
              d="M0,100 L150,100 L180,100 L200,20 L220,180 L240,60 L260,140 L280,100 L350,100 L800,100"
              fill="none" stroke="hsl(var(--primary))" strokeWidth="2"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div className="max-w-3xl mx-auto text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <motion.div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 mb-8"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">15 AI-Powered Health Tools</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.05] tracking-tight font-display">
              Your Personal
              <span className="block gradient-text">Health Assistant</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Instant health assessments, first aid guidance, and wellness tools — all powered by AI. Know when to seek professional care.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/how-to-use" className="btn-primary flex items-center gap-2 text-base hover:scale-105 active:scale-95 transition-transform">
                <HelpCircle className="w-4 h-4" /> How to Use
              </Link>
              <Link to="/chat" className="btn-secondary flex items-center gap-2 text-base hover:scale-105 active:scale-95 transition-transform">
                <MessageCircle className="w-4 h-4" /> Chat with AI
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-16 max-w-2xl mx-auto">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <ScrollReveal key={i} delay={i * 0.08}>
                  <div className="bg-card rounded-xl border border-border p-5 text-center hover:shadow-glow hover:border-primary/20 hover:scale-105 transition-all duration-300">
                    <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <div className="text-xl font-bold font-display">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categorized Features */}
      <section className="py-20 border-t border-border relative z-10">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold font-display mb-3">All Your Health Tools</h2>
              <p className="text-muted-foreground">Powerful tools organized by category</p>
            </div>
          </ScrollReveal>

          <div className="space-y-12">
            {Object.entries(categories).map(([categoryName, tools], catIdx) => (
              <ScrollReveal key={categoryName} delay={catIdx * 0.05}>
                <div>
                  <h3 className="text-lg font-semibold font-display mb-4 flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-primary" />
                    {categoryName}
                    <span className="text-xs text-muted-foreground font-normal ml-1">({tools.length})</span>
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {tools.map((f, i) => {
                      const Icon = f.icon;
                      return (
                        <ScrollReveal key={i} delay={i * 0.05}>
                          <Link to={f.link} className="block bg-card rounded-2xl border border-border p-5 hover:border-primary/25 hover:shadow-glow hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 group h-full">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                                <Icon className="w-5 h-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-sm font-semibold mb-0.5 group-hover:text-primary transition-colors">{f.title}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                              </div>
                            </div>
                          </Link>
                        </ScrollReveal>
                      );
                    })}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="py-16 border-t border-border relative z-10">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-border p-8 hover:shadow-elevated transition-shadow duration-300">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-2 font-display">For Basic Diagnostics Only</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Healthier provides preliminary health assessments. It is <strong className="text-foreground">not a replacement</strong> for professional medical care.
                  </p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-destructive" />For emergencies, call your local emergency number</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-warning" />Always consult a doctor for serious symptoms</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-success" />Use Healthier for basic questions & wellness</li>
                  </ul>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
