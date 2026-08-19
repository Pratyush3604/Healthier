import { motion } from 'framer-motion';
import { Heart, Sparkles, School } from 'lucide-react';
import pratyushImg from '@/assets/pratyush.png.asset.json';
import { useTranslation } from '@/hooks/useTranslation';


export default function AboutPage() {
  const { t } = useTranslation();
  const capabilities = [
    'Symptom Checker (100+ symptoms)', 'Injury Detection with Camera', 'AI Skin Analyzer',
    'Vital Signs Monitoring', 'Medical Report Analysis',
    'AI Chat Consultation', 'Diet Planner', 'Workout Planner',
    'Medicine Information', 'First Aid Guide (100+ guides)',
    'Health Tips (150+ tips)', 'Emergency Contacts (40+ countries)',
    'Posture Corrector', 'Health Calculator', 'Medication Reminders',
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
            className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden shadow-glow border-4 border-primary/30">
            <img src={pratyushImg.url} alt="Pratyush Dalmia" className="w-full h-full object-cover" loading="lazy" />

          </motion.div>
          <h1 className="font-display text-4xl font-bold mb-2">{t('aboutHeading')}</h1>
          <p className="text-xl text-muted-foreground">{t('aboutSubheading')}</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl p-8 border border-border shadow-elevated mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="shrink-0">
              <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-primary/30">
                <img src={pratyushImg.url} alt="Pratyush Dalmia" className="w-full h-full object-cover" loading="lazy" />

              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-display text-2xl font-bold mb-2">Pratyush Dalmia</h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mb-4">
                <School className="h-4 w-4" /><span>{t('aboutSchool')}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">{t('aboutBio')}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-3xl p-8 border border-border shadow-soft mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="font-display text-xl font-bold">{t('whatHealthierCanDo')}</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {capabilities.map((cap, index) => (
              <motion.span key={index} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + index * 0.03 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success border border-success/20 text-sm font-medium">
                ✓ {cap}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8 border border-primary/10">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-accent">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <h2 className="font-display text-xl font-bold mb-4 text-primary">{t('myMentor')}</h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">{t('mentorThanks')}</p>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}

