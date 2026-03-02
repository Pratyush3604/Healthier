import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Stethoscope, Activity, Camera, FileText, MessageCircle, Mic,
  BookOpen, Lightbulb, Phone, ArrowRight, Shield, Zap, Heart,
  Sparkles, Apple, Dumbbell, Moon, Pill, Scan, Lock, Calculator
} from 'lucide-react';

const features = [
  { icon: Stethoscope, title: 'Symptom Checker', description: 'Select from 100+ symptoms and get AI-powered urgency assessment', link: '/symptoms', gradient: 'from-emerald-500 to-teal-500' },
  { icon: Activity, title: 'Vital Signs', description: 'Track heart rate, SpO2, temperature and blood pressure with analysis', link: '/vitals', gradient: 'from-red-500 to-pink-500' },
  { icon: Camera, title: 'Injury Detection', description: 'Upload injury photos for AI assessment and first aid steps', link: '/injury', gradient: 'from-orange-500 to-amber-500' },
  { icon: Scan, title: 'Skin Analyzer', description: 'AI-powered skin condition analysis from photos', link: '/skin-analyzer', gradient: 'from-fuchsia-500 to-pink-500' },
  { icon: FileText, title: 'Report Analysis', description: 'Get plain-language explanations of X-rays, MRIs, and lab reports', link: '/reports', gradient: 'from-blue-500 to-indigo-500' },
  { icon: MessageCircle, title: 'AI Chat', description: 'Text-based medical consultation with streaming responses', link: '/chat', gradient: 'from-violet-500 to-purple-500' },
  { icon: Mic, title: 'Voice Doctor', description: 'Voice-powered consultation with camera and TTS', link: '/ai-doctor', gradient: 'from-cyan-500 to-blue-500' },
  { icon: Apple, title: 'Diet Planner', description: 'Personalized meal plans based on your goals and preferences', link: '/diet-planner', gradient: 'from-green-500 to-emerald-500' },
  { icon: Dumbbell, title: 'Workout Planner', description: 'Custom exercise routines for your fitness level', link: '/workout-planner', gradient: 'from-amber-500 to-yellow-500' },
  { icon: Moon, title: 'Sleep Analysis', description: 'Track sleep patterns and get actionable improvement tips', link: '/sleep-analysis', gradient: 'from-indigo-500 to-violet-500' },
  { icon: Pill, title: 'Medicine Info', description: 'Learn about uses, side effects, and precautions of medications', link: '/medicine-info', gradient: 'from-teal-500 to-cyan-500' },
  { icon: BookOpen, title: 'First Aid Guide', description: '100+ step-by-step emergency first aid instructions', link: '/first-aid', gradient: 'from-rose-500 to-red-500' },
  { icon: Calculator, title: 'BMI Calculator', description: 'Calculate BMI, daily calories, and water intake needs', link: '/bmi-calculator', gradient: 'from-sky-500 to-blue-500' },
  { icon: Lightbulb, title: 'Health Tips', description: '150+ wellness tips for nutrition, fitness, and mental health', link: '/health-tips', gradient: 'from-yellow-500 to-orange-500' },
  { icon: Phone, title: 'Emergency', description: 'Emergency numbers for 40+ countries with when-to-call guides', link: '/emergency', gradient: 'from-red-600 to-rose-600' },
];

const stats = [
  { value: 'AI', label: 'Powered', icon: Sparkles },
  { value: '24/7', label: 'Available', icon: Zap },
  { value: 'Free', label: 'To Use', icon: Heart },
  { value: 'Secure', label: '& Private', icon: Lock },
];

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div className="max-w-4xl mx-auto text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Powered by Advanced AI</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
              Your Personal
              <span className="block gradient-text">AI Health Assistant</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Get instant health assessments, first aid guidance, and wellness tips. 
              Healtify helps you understand your symptoms and know when to seek professional care.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/symptoms" className="btn-primary flex items-center gap-2 text-lg">
                Start Symptom Check <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/chat" className="btn-secondary flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> Chat with AI Doctor
              </Link>
            </div>
          </motion.div>

          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto" variants={container} initial="hidden" animate="visible">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} variants={item} className="glass-card rounded-2xl p-6 text-center">
                  <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold gradient-text">{s.value}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need for <span className="gradient-text">Better Health</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">15 powerful tools for health monitoring, AI diagnostics, and wellness guidance</p>
          </motion.div>

          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i} variants={item}>
                  <Link to={f.link} className="feature-card block h-full group">
                    <div className={`icon-wrapper bg-gradient-to-br ${f.gradient}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base font-semibold mb-1.5 group-hover:text-primary transition-colors">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                    <div className="mt-3 flex items-center gap-2 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore <ArrowRight className="w-3 h-3" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Safety */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div className="max-w-4xl mx-auto glass-card rounded-3xl p-8 md:p-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500 shrink-0">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-warning">For Basic Diagnostics Only</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Healtify is designed for preliminary health assessments and general wellness guidance. 
                  It is <strong className="text-foreground">not a replacement</strong> for professional medical care.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-destructive" />For emergencies, call your local emergency number immediately</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-warning" />Always consult a doctor for persistent or serious symptoms</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-success" />Use Healtify for basic questions and wellness tips</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
