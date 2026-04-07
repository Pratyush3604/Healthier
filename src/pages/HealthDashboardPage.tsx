import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Heart, Pill, Activity, TrendingUp, ArrowRight, Settings,
  Stethoscope, Scan, FileText, MessageCircle, Mic, Calculator, BookOpen,
  Lightbulb, Phone, ClipboardList, Apple, Dumbbell, Monitor, HelpCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const quickTools = [
  { icon: Stethoscope, label: 'Symptoms', path: '/symptoms' },
  { icon: Activity, label: 'Vitals', path: '/vitals' },
  { icon: Scan, label: 'Skin & Injury', path: '/skin-injury' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: MessageCircle, label: 'Chat', path: '/chat' },
  { icon: Mic, label: 'AI Doctor', path: '/ai-doctor' },
  { icon: Apple, label: 'Fitness', path: '/fitness' },
  { icon: Pill, label: 'Medicine', path: '/medicine-info' },
  { icon: Calculator, label: 'BMI', path: '/bmi-calculator' },
  { icon: Monitor, label: 'Posture', path: '/posture-corrector' },
  { icon: ClipboardList, label: 'Meds', path: '/medication-reminder' },
  { icon: TrendingUp, label: 'Reports Hub', path: '/health-reports' },
  { icon: BookOpen, label: 'First Aid', path: '/first-aid' },
  { icon: Lightbulb, label: 'Tips', path: '/health-tips' },
  { icon: Phone, label: 'Emergency', path: '/emergency' },
  { icon: HelpCircle, label: 'How To Use', path: '/how-to-use' },
];

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };

export default function HealthDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [greeting, setGreeting] = useState('');
  const [bmiData] = useLocalStorage<{ bmi: string }>('healtify-bmi', { bmi: '--' });
  const [medications] = useLocalStorage<any[]>('healthier-medications', []);
  const [reports] = useLocalStorage<any[]>('healthier-reports', []);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
  }, []);

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  const healthMetrics = [
    { icon: TrendingUp, label: 'BMI', value: bmiData.bmi, unit: '', color: 'text-success', note: 'Calculate BMI' },
    { icon: Pill, label: 'Medications', value: String(medications.length), unit: 'active', color: 'text-primary', note: medications.length ? 'Tracking' : 'Add meds' },
    { icon: FileText, label: 'Reports', value: String(reports.length), unit: 'saved', color: 'text-secondary', note: 'View all' },
    { icon: Heart, label: 'Tools Used', value: String(new Set(reports.map((r: any) => r.type)).size), unit: 'types', color: 'text-destructive', note: 'Keep exploring' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display">{greeting}, {userName}! 👋</h1>
            <p className="text-muted-foreground mt-1">Here's your health overview for today</p>
          </div>
          <Link to="/settings" className="p-3 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {healthMetrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-5 border border-border">
                <Icon className={`w-6 h-6 ${m.color} mb-3`} />
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{m.value}</span>
                  <span className="text-sm text-muted-foreground">{m.unit}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold font-display mb-4">Health Tools</h2>
          <motion.div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3" variants={container} initial="hidden" animate="visible">
            {quickTools.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <motion.div key={i} variants={item}>
                  <Link to={tool.path} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-glow transition-all group">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">{tool.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/symptoms" className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all group">
            <Stethoscope className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1">Check Symptoms</h3>
            <p className="text-sm text-muted-foreground mb-3">Get AI assessment of your symptoms</p>
            <span className="text-sm text-primary flex items-center gap-1 font-medium group-hover:gap-2 transition-all">Start Check <ArrowRight className="w-4 h-4" /></span>
          </Link>
          <Link to="/chat" className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all group">
            <MessageCircle className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1">Chat with AI</h3>
            <p className="text-sm text-muted-foreground mb-3">Ask any health question instantly</p>
            <span className="text-sm text-primary flex items-center gap-1 font-medium group-hover:gap-2 transition-all">Open Chat <ArrowRight className="w-4 h-4" /></span>
          </Link>
          <Link to="/emergency" className="bg-card border border-border rounded-2xl p-6 hover:border-destructive/30 transition-all group">
            <Phone className="w-8 h-8 text-destructive mb-3" />
            <h3 className="font-semibold mb-1">Emergency</h3>
            <p className="text-sm text-muted-foreground mb-3">100+ country emergency numbers</p>
            <span className="text-sm text-destructive flex items-center gap-1 font-medium group-hover:gap-2 transition-all">View Numbers <ArrowRight className="w-4 h-4" /></span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
