import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Stethoscope, Activity, FileText, MessageCircle, Mic,
  BookOpen, Lightbulb, Phone, ArrowRight, Shield, Zap, Heart,
  Sparkles, Pill, Scan, Calculator,
  ClipboardList, TrendingUp, Monitor, Apple, Dumbbell, ChevronRight, Lock
} from 'lucide-react';

const categories = {
  'AI Diagnostics': [
    { icon: Stethoscope, title: 'Symptom Checker', description: 'AI urgency assessment from 100+ symptoms', link: '/symptoms' },
    { icon: Scan, title: 'Skin & Injury Analyzer', description: 'Photo-based skin & wound analysis', link: '/skin-injury' },
    { icon: FileText, title: 'Report Analysis', description: 'X-rays, MRIs & labs explained by AI', link: '/reports' },
  ],
  'AI Consultation': [
    { icon: MessageCircle, title: 'AI Chat', description: 'Text-based medical consultation', link: '/chat' },
    { icon: Mic, title: 'Voice Doctor', description: 'Talk to AI with voice & TTS', link: '/ai-doctor' },
    { icon: Pill, title: 'Medicine Encyclopedia', description: '13-section drug analysis', link: '/medicine-info' },
  ],
  'Fitness & Wellness': [
    { icon: Apple, title: 'Diet & Workout Planner', description: 'AI meal plans + exercise routines', link: '/fitness' },
    { icon: Calculator, title: 'BMI Calculator', description: 'BMI, body fat & ideal weight', link: '/bmi-calculator' },
    { icon: Monitor, title: 'Posture Corrector', description: 'Exercises & ergonomic tips', link: '/posture-corrector' },
    { icon: Activity, title: 'Vital Signs', description: 'Track heart rate, SpO2 & BP', link: '/vitals' },
  ],
  'Tools & Guides': [
    { icon: ClipboardList, title: 'Med Reminders', description: 'Set medication alarms', link: '/medication-reminder' },
    { icon: TrendingUp, title: 'Health Reports', description: 'Auto-generated from usage', link: '/health-reports' },
    { icon: BookOpen, title: 'First Aid Guide', description: '60+ emergency instructions', link: '/first-aid' },
    { icon: Lightbulb, title: 'Health Tips', description: '170+ wellness tips', link: '/health-tips' },
    { icon: Phone, title: 'Emergency Numbers', description: '100+ country numbers', link: '/emergency' },
  ],
};

const stats = [
  { value: '16', label: 'Health Tools', icon: Sparkles },
  { value: '24/7', label: 'Available', icon: Zap },
  { value: 'Free', label: 'To Use', icon: Heart },
  { value: 'Private', label: '& Secure', icon: Lock },
];

const howItWorks = [
  { step: '01', title: 'Describe Your Concern', description: 'Enter symptoms, upload images, or talk to the AI doctor.' },
  { step: '02', title: 'Get AI Analysis', description: 'Advanced AI processes your input for a detailed assessment.' },
  { step: '03', title: 'Take Action', description: 'Clear recommendations and guidance on when to seek care.' },
];

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-radial pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
          <svg viewBox="0 0 800 200" className="w-[120%] max-w-none" preserveAspectRatio="none">
            <motion.path
              d="M0,100 L150,100 L180,100 L200,20 L220,180 L240,60 L260,140 L280,100 L350,100 L800,100"
              fill="none" stroke="hsl(191, 63%, 46%)" strokeWidth="2"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div className="max-w-3xl mx-auto text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <motion.div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 mb-8"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">16 AI-Powered Health Tools</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.05] tracking-tight font-display">
              Your Personal
              <span className="block gradient-text">Health Assistant</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Instant health assessments, first aid guidance, and wellness tools — all powered by AI. Know when to seek professional care.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/symptoms" className="btn-primary flex items-center gap-2 text-base">
                Start Symptom Check <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/chat" className="btn-secondary flex items-center gap-2 text-base">
                <MessageCircle className="w-4 h-4" /> Chat with AI
              </Link>
            </div>
          </motion.div>

          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-16 max-w-2xl mx-auto" variants={container} initial="hidden" animate="visible">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} variants={item} className="bg-card rounded-xl border border-border p-5 text-center">
                  <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-xl font-bold font-display">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-3">How It Works</h2>
            <p className="text-muted-foreground">Three steps to better health understanding</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {howItWorks.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="bg-card rounded-2xl border border-border p-7 text-center relative overflow-hidden group hover:border-primary/20 transition-colors">
                <div className="text-6xl font-extrabold text-muted/30 absolute top-3 right-4 select-none font-display">{step.step}</div>
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-sm font-bold text-primary font-display">{step.step}</span>
                </div>
                <h3 className="font-semibold text-base mb-2 font-display">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorized Features */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-3">All Your Health Tools</h2>
            <p className="text-muted-foreground">Powerful tools organized by category</p>
          </motion.div>

          <div className="space-y-12">
            {Object.entries(categories).map(([categoryName, tools]) => (
              <motion.div key={categoryName} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h3 className="text-lg font-semibold font-display mb-4 flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-primary" />
                  {categoryName}
                  <span className="text-xs text-muted-foreground font-normal ml-1">({tools.length})</span>
                </h3>
                <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3" variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  {tools.map((f, i) => {
                    const Icon = f.icon;
                    return (
                      <motion.div key={i} variants={item}>
                        <Link to={f.link} className="block bg-card rounded-2xl border border-border p-5 hover:border-primary/25 hover:shadow-glow transition-all duration-300 group h-full">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 group-hover:scale-105 transition-all">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold mb-0.5 group-hover:text-primary transition-colors">{f.title}</h3>
                              <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div className="max-w-3xl mx-auto bg-card rounded-2xl border border-border p-8" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
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
          </motion.div>
        </div>
      </section>
    </div>
  );
}
