import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Stethoscope, Activity, Camera, FileText, MessageCircle, Mic,
  BookOpen, Lightbulb, Phone, ArrowRight, Shield, Zap, Heart,
  Brain, Sparkles
} from 'lucide-react';

const features = [
  {
    icon: Stethoscope,
    title: 'Symptom Checker',
    description: 'Select symptoms from 100+ options and get AI-powered assessment with urgency levels',
    link: '/symptoms',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Activity,
    title: 'Vital Signs Monitor',
    description: 'Track heart rate, SpO2, temperature, and blood pressure with instant analysis',
    link: '/vitals',
    gradient: 'from-red-500 to-pink-500',
  },
  {
    icon: Camera,
    title: 'Injury Detection',
    description: 'Upload photos for AI-powered injury assessment and first aid recommendations',
    link: '/injury',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    icon: FileText,
    title: 'Report Analysis',
    description: 'Analyze X-rays, MRIs, lab reports and get plain-language explanations',
    link: '/reports',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: MessageCircle,
    title: 'AI Chat',
    description: 'Have a text conversation with our AI doctor for health questions',
    link: '/chat',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Mic,
    title: 'Voice Consultation',
    description: 'Talk to the AI doctor with voice input and get spoken responses',
    link: '/ai-doctor',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: BookOpen,
    title: 'First Aid Guide',
    description: 'Step-by-step emergency first aid instructions for common situations',
    link: '/first-aid',
    gradient: 'from-rose-500 to-red-500',
  },
  {
    icon: Lightbulb,
    title: 'Health Tips',
    description: 'Daily wellness tips, nutrition advice, and healthy lifestyle guidance',
    link: '/health-tips',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Phone,
    title: 'Emergency Contacts',
    description: 'Quick access to emergency numbers and when to call for help',
    link: '/emergency',
    gradient: 'from-red-600 to-rose-600',
  },
];

const stats = [
  { value: 'AI', label: 'Powered', icon: Sparkles },
  { value: '24/7', label: 'Available', icon: Zap },
  { value: 'Free', label: 'To Use', icon: Heart },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Powered by Advanced AI</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
              Your Personal
              <span className="block gradient-text">AI Medical Assistant</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Get instant health assessments, first aid guidance, and wellness tips. 
              Mediredy helps you understand your symptoms and know when to seek professional care.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/symptoms" className="btn-primary flex items-center gap-2 text-lg">
                Start Symptom Check
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/chat" className="btn-secondary flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Chat with AI Doctor
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="glass-card rounded-2xl p-6 text-center"
                >
                  <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need for
              <span className="gradient-text"> Better Health</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive health tools designed for basic diagnostics and wellness guidance
            </p>
          </motion.div>

          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Link to={feature.link} className="feature-card block h-full group">
                    <div className={`icon-wrapper bg-gradient-to-br ${feature.gradient}`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn more <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Safety Notice */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto glass-card rounded-3xl p-8 md:p-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500 shrink-0">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-warning">For Basic Diagnostics Only</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Mediredy is designed for preliminary health assessments and general wellness guidance. 
                  It is <strong className="text-foreground">not a replacement</strong> for professional medical care.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                    For emergencies, call your local emergency number immediately
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                    Always consult a doctor for persistent or serious symptoms
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    Use Mediredy for basic questions and wellness tips
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
