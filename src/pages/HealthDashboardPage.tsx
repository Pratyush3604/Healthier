import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Heart, Droplets, Moon, Dumbbell, Apple, Activity,
  Stethoscope, Camera, Scan, FileText, MessageCircle, Mic, Pill,
  Calculator, BookOpen, Lightbulb, Phone, TrendingUp, ArrowRight, Settings,
  ClipboardList, BookMarked
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const quickTools = [
  { icon: Stethoscope, label: 'Symptoms', path: '/symptoms', color: 'from-emerald-500 to-teal-500' },
  { icon: Activity, label: 'Vitals', path: '/vitals', color: 'from-red-500 to-pink-500' },
  { icon: Camera, label: 'Injury', path: '/injury', color: 'from-orange-500 to-amber-500' },
  { icon: Scan, label: 'Skin AI', path: '/skin-analyzer', color: 'from-fuchsia-500 to-pink-500' },
  { icon: FileText, label: 'Reports', path: '/reports', color: 'from-blue-500 to-indigo-500' },
  { icon: MessageCircle, label: 'Chat', path: '/chat', color: 'from-violet-500 to-purple-500' },
  { icon: Mic, label: 'AI Doctor', path: '/ai-doctor', color: 'from-cyan-500 to-blue-500' },
  { icon: Apple, label: 'Diet', path: '/diet-planner', color: 'from-green-500 to-emerald-500' },
  { icon: Dumbbell, label: 'Workout', path: '/workout-planner', color: 'from-amber-500 to-yellow-500' },
  { icon: Dumbbell, label: 'Exercises', path: '/exercise-library', color: 'from-orange-500 to-red-500' },
  { icon: Moon, label: 'Sleep', path: '/sleep-analysis', color: 'from-indigo-500 to-violet-500' },
  { icon: Pill, label: 'Medicine', path: '/medicine-info', color: 'from-teal-500 to-cyan-500' },
  { icon: Calculator, label: 'BMI', path: '/bmi-calculator', color: 'from-sky-500 to-blue-500' },
  { icon: Droplets, label: 'Water', path: '/water-tracker', color: 'from-blue-400 to-cyan-400' },
  { icon: ClipboardList, label: 'Meds', path: '/medication-reminder', color: 'from-teal-500 to-emerald-500' },
  { icon: BookMarked, label: 'Journal', path: '/health-journal', color: 'from-violet-500 to-purple-500' },
  { icon: FileText, label: 'Reports Hub', path: '/health-reports', color: 'from-emerald-500 to-cyan-500' },
  { icon: BookOpen, label: 'First Aid', path: '/first-aid', color: 'from-rose-500 to-red-500' },
  { icon: Lightbulb, label: 'Tips', path: '/health-tips', color: 'from-yellow-500 to-orange-500' },
  { icon: Phone, label: 'Emergency', path: '/emergency', color: 'from-red-600 to-rose-600' },
];

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };

export default function HealthDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [greeting, setGreeting] = useState('');
  const [waterData] = useLocalStorage<{ glasses: number; goal: number }>('healtify-water', { glasses: 0, goal: 8 });
  const [bmiData] = useLocalStorage<{ bmi: string }>('healtify-bmi', { bmi: '--' });
  const [journalEntries] = useLocalStorage<any[]>('healtify-journal', []);
  const [medications] = useLocalStorage<any[]>('healtify-medications', []);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
  }, []);

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';
  const todayMood = journalEntries.find((e: any) => e.date === new Date().toISOString().split('T')[0]);

  const healthMetrics = [
    { icon: Droplets, label: 'Water Today', value: `${waterData.glasses}/${waterData.goal}`, unit: 'glasses', color: 'text-primary', note: 'Track intake' },
    { icon: TrendingUp, label: 'BMI', value: bmiData.bmi, unit: '', color: 'text-success', note: 'Calculate BMI' },
    { icon: Heart, label: 'Mood', value: todayMood ? ['😞','😐','🙂','😊','🤩'][todayMood.mood - 1] : '--', unit: '', color: 'text-destructive', note: todayMood ? 'Logged today' : 'Log in journal' },
    { icon: Pill, label: 'Medications', value: String(medications.length), unit: 'active', color: 'text-accent', note: medications.length ? 'Tracking' : 'Add meds' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{greeting}, {userName}! 👋</h1>
            <p className="text-muted-foreground mt-1">Here's your health overview for today</p>
          </div>
          <Link to="/settings" className="p-3 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Link>
        </div>

        {/* Health Metrics */}
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
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{m.note}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Access Tools */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Health Tools</h2>
          <motion.div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-3" variants={container} initial="hidden" animate="visible">
            {quickTools.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <motion.div key={i} variants={item}>
                  <Link to={tool.path} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all group">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${tool.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">{tool.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/symptoms" className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/40 transition-all group">
            <Stethoscope className="w-8 h-8 text-emerald-500 mb-3" />
            <h3 className="font-semibold mb-1">Check Symptoms</h3>
            <p className="text-sm text-muted-foreground mb-3">Get AI assessment of your symptoms</p>
            <span className="text-sm text-emerald-500 flex items-center gap-1 font-medium group-hover:gap-2 transition-all">Start Check <ArrowRight className="w-4 h-4" /></span>
          </Link>
          <Link to="/chat" className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-2xl p-6 hover:border-violet-500/40 transition-all group">
            <MessageCircle className="w-8 h-8 text-violet-500 mb-3" />
            <h3 className="font-semibold mb-1">Chat with AI</h3>
            <p className="text-sm text-muted-foreground mb-3">Ask any health question instantly</p>
            <span className="text-sm text-violet-500 flex items-center gap-1 font-medium group-hover:gap-2 transition-all">Open Chat <ArrowRight className="w-4 h-4" /></span>
          </Link>
          <Link to="/emergency" className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/20 rounded-2xl p-6 hover:border-red-500/40 transition-all group">
            <Phone className="w-8 h-8 text-red-500 mb-3" />
            <h3 className="font-semibold mb-1">Emergency</h3>
            <p className="text-sm text-muted-foreground mb-3">100+ country emergency numbers</p>
            <span className="text-sm text-red-500 flex items-center gap-1 font-medium group-hover:gap-2 transition-all">View Numbers <ArrowRight className="w-4 h-4" /></span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
