import { motion } from 'framer-motion';
import { User, Award, Heart, Sparkles, Github, Mail, School } from 'lucide-react';

export default function AboutPage() {
  const capabilities = [
    'Analysing symptoms',
    'Detecting injuries',
    'Monitoring vital signs',
    'Analysing radiology reports',
    'Voice-based medical assistance',
    'Chat-based medical assistance'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow"
          >
            <User className="h-16 w-16 text-primary-foreground" />
          </motion.div>
          <h1 className="font-display text-4xl font-bold mb-2">About Me</h1>
          <p className="text-xl text-muted-foreground">The Creator of Mediredy</p>
        </div>

        {/* Creator Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl p-8 border border-border shadow-elevated mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Photo */}
            <div className="shrink-0">
              <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/30">
                <User className="h-20 w-20 text-primary" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-display text-2xl font-bold mb-2">
                Pratyush Dalmia
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mb-4">
                <School className="h-4 w-4" />
                <span>Mayo College, Ajmer</span>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">
                I'm a student who loves technology, robotics, AI, and innovation. 
                My dream is to build solutions that create real impact and leave a mark 
                that lasts for generations.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Mediredy</strong> originally started 
                as an idea for WRO (World Robot Olympiad), but over time it evolved into 
                a full-fledged AI-powered medical system.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Capabilities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-3xl p-8 border border-border shadow-soft mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="icon-container w-12 h-12">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="font-display text-xl font-bold">
              What Mediredy Can Do
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {capabilities.map((cap, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success border border-success/20 text-sm font-medium"
              >
                <span className="text-lg">✓</span>
                {cap}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Mentors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8 border border-primary/10"
        >
          <div className="text-center">
            <div className="icon-container-accent w-14 h-14 mx-auto mb-4">
              <Heart className="h-7 w-7" />
            </div>
            <h2 className="font-display text-xl font-bold mb-4 text-primary">
              🙏 My Mentors
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              I sincerely thank{' '}
              <strong className="text-foreground">Mr. Akash Deep Rawat</strong>{' '}
              and{' '}
              <strong className="text-foreground">Mr. Chirag Saraswat</strong>{' '}
              for their constant support, guidance, and motivation in turning this 
              vision into reality.
            </p>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12 text-muted-foreground"
        >
          <p className="flex items-center justify-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Built with passion for WRO and beyond
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
