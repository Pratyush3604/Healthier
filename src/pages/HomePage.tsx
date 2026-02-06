import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, Activity, Camera, FileText, 
  MessageCircle, Bot, ArrowRight, Heart, Shield, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Stethoscope,
    title: 'Symptom Assessment',
    description: 'Get AI-powered analysis of your symptoms and health concerns',
    link: '/symptoms',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Activity,
    title: 'Vital Signs Monitoring',
    description: 'Track and analyze your vital signs with expert recommendations',
    link: '/vitals',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    icon: Camera,
    title: 'Injury Detection',
    description: 'Upload injury photos for AI-powered assessment and care advice',
    link: '/injury',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    icon: FileText,
    title: 'Report Analysis',
    description: 'Analyze X-rays, MRIs, and other medical reports instantly',
    link: '/reports',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: MessageCircle,
    title: 'Chat with AI Doctor',
    description: 'Have a conversation with our AI medical assistant anytime',
    link: '/chat',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    icon: Bot,
    title: 'Voice Consultation',
    description: 'Have a live voice consultation with the AI medical assistant',
    link: '/ai-doctor',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
];

const stats = [
  { icon: Heart, value: '24/7', label: 'Available' },
  { icon: Shield, value: 'Secure', label: 'Private' },
  { icon: Clock, value: 'Instant', label: 'Analysis' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        {/* Background Gradient */}
        <div className="absolute inset-0 gradient-animated opacity-5" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              AI-Powered Medical Assistant
            </motion.div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Welcome to{' '}
              <span className="text-gradient">Mediredy</span>
              <br />
              <span className="text-muted-foreground">AI Doctor</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Your intelligent medical assistant for basic diagnostics. Get instant AI-powered 
              health assessments, symptom analysis, and medical guidance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="text-base px-8 shadow-glow">
                <Link to="/chat">
                  Start Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8">
                <Link to="/symptoms">
                  Check Symptoms
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-8 mt-12"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <stat.icon className="h-5 w-5 text-primary" />
                    <span className="font-display font-bold text-xl text-foreground">{stat.value}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold mb-4">
              Comprehensive Health Tools
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for basic health assessments, all powered by advanced AI technology
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Link to={feature.link} className="block h-full">
                  <div className="feature-card h-full group">
                    <div className={`icon-container w-14 h-14 mb-4 ${feature.bgColor}`}>
                      <feature.icon className={`h-7 w-7 ${feature.color}`} />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                    <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn more
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="urgent-warning">
              <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                ⚠️ Important Medical Notice
              </h3>
              <p className="text-sm leading-relaxed opacity-90">
                Mediredy AI Doctor is designed for <strong>basic diagnostics only</strong>. This tool provides 
                general health information and preliminary assessments, but is <strong>not a replacement</strong> for 
                professional medical advice, diagnosis, or treatment.
              </p>
              <div className="mt-4 p-3 bg-background/50 rounded-lg">
                <p className="text-sm font-medium">
                  🚨 <strong>If you have a serious or life-threatening condition</strong>, please contact 
                  a real doctor or call emergency services (911) immediately.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
