import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Stethoscope, Activity, Camera, FileText, MessageCircle, Mic,
  BookOpen, Lightbulb, Phone, ArrowRight, Shield, Zap, Heart,
  Sparkles, Apple, Dumbbell, Moon, Pill, Scan, Lock, Calculator,
  Droplets, BookMarked, ClipboardList
} from 'lucide-react';

const features = [
  { icon: Stethoscope, title: 'Symptom Checker', description: 'AI-powered urgency assessment from 100+ symptoms', link: '/symptoms', gradient: 'from-emerald-500 to-teal-500' },
  { icon: Activity, title: 'Vital Signs', description: 'Track heart rate, SpO2, temperature & blood pressure', link: '/vitals', gradient: 'from-red-500 to-pink-500' },
  { icon: Camera, title: 'Injury Detection', description: 'Upload injury photos for AI-powered first aid steps', link: '/injury', gradient: 'from-orange-500 to-amber-500' },
  { icon: Scan, title: 'Skin Analyzer', description: 'AI skin condition analysis from photos', link: '/skin-analyzer', gradient: 'from-fuchsia-500 to-pink-500' },
  { icon: FileText, title: 'Report Analysis', description: 'Plain-language explanations of X-rays, MRIs & labs', link: '/reports', gradient: 'from-blue-500 to-indigo-500' },
  { icon: MessageCircle, title: 'AI Chat', description: 'Text-based medical consultation with streaming AI', link: '/chat', gradient: 'from-violet-500 to-purple-500' },
  { icon: Mic, title: 'Voice Doctor', description: 'Voice-powered consultation with camera & TTS', link: '/ai-doctor', gradient: 'from-cyan-500 to-blue-500' },
  { icon: Apple, title: 'Diet Planner', description: 'Personalized 7-day meal plans for your goals', link: '/diet-planner', gradient: 'from-green-500 to-emerald-500' },
  { icon: Dumbbell, title: 'Workout Planner', description: 'Custom exercise routines for any fitness level', link: '/workout-planner', gradient: 'from-amber-500 to-yellow-500' },
  { icon: Moon, title: 'Sleep Analysis', description: 'Track sleep patterns & get improvement tips', link: '/sleep-analysis', gradient: 'from-indigo-500 to-violet-500' },
  { icon: Pill, title: 'Medicine Info', description: 'Uses, side effects & precautions for medications', link: '/medicine-info', gradient: 'from-teal-500 to-cyan-500' },
  { icon: BookOpen, title: 'First Aid Guide', description: '100+ step-by-step emergency first aid instructions', link: '/first-aid', gradient: 'from-rose-500 to-red-500' },
  { icon: Calculator, title: 'BMI Calculator', description: 'Calculate BMI, daily calories & water intake', link: '/bmi-calculator', gradient: 'from-sky-500 to-blue-500' },
  { icon: Droplets, title: 'Water Tracker', description: 'Track daily water intake with visual progress', link: '/water-tracker', gradient: 'from-blue-400 to-cyan-400' },
  { icon: ClipboardList, title: 'Medication Reminders', description: 'Never miss a dose with smart medication tracking', link: '/medication-reminder', gradient: 'from-teal-500 to-emerald-500' },
  { icon: BookMarked, title: 'Health Journal', description: 'Track mood, symptoms & energy daily', link: '/health-journal', gradient: 'from-violet-500 to-purple-500' },
  { icon: Lightbulb, title: 'Health Tips', description: '160+ wellness tips for a healthier lifestyle', link: '/health-tips', gradient: 'from-yellow-500 to-orange-500' },
  { icon: Phone, title: 'Emergency', description: '100+ country emergency numbers with guides', link: '/emergency', gradient: 'from-red-600 to-rose-600' },
];

const stats = [
  { value: '18+', label: 'Health Tools', icon: Sparkles },
  { value: '24/7', label: 'Available', icon: Zap },
  { value: 'Free', label: 'To Use', icon: Heart },
  { value: 'Secure', label: '& Private', icon: Lock },
];

const howItWorks = [
  { step: '01', title: 'Describe Your Concern', description: 'Enter symptoms, upload images, or talk to our AI doctor about any health question.' },
  { step: '02', title: 'Get AI Analysis', description: 'Our advanced AI processes your input and provides an instant, detailed health assessment.' },
  { step: '03', title: 'Take Action', description: 'Receive clear recommendations, first aid steps, or guidance on when to seek professional care.' },
];

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Animated heartbeat background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
          <svg viewBox="0 0 800 200" className="w-[120%] max-w-none" preserveAspectRatio="none">
            <motion.path
              d="M0,100 L150,100 L180,100 L200,20 L220,180 L240,60 L260,140 L280,100 L350,100 L800,100"
              fill="none" stroke="hsl(172, 66%, 50%)" strokeWidth="3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div className="max-w-4xl mx-auto text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Powered by Advanced AI — 18 Health Tools</span>
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

            {/* Floating icons */}
            <div className="relative mt-12 h-16 hidden md:block">
              {[Stethoscope, Heart, Pill, Activity, Apple, Moon].map((Icon, i) => (
                <motion.div key={i}
                  className="absolute w-10 h-10 rounded-xl glass-card flex items-center justify-center"
                  style={{ left: `${12 + i * 15}%` }}
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 3, delay: i * 0.4, repeat: Infinity }}>
                  <Icon className="w-5 h-5 text-primary" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto" variants={container} initial="hidden" animate="visible">
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

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How <span className="gradient-text">Healtify</span> Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Three simple steps to better health understanding</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {howItWorks.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="glass-card rounded-2xl p-6 text-center relative">
                <div className="text-5xl font-extrabold gradient-text opacity-20 absolute top-4 right-4">{step.step}</div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-primary-foreground">{step.step}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need for <span className="gradient-text">Better Health</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{features.length} powerful tools for health monitoring, AI diagnostics, and wellness guidance</p>
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
