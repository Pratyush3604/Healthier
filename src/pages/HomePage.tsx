import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Activity, FileText, MessageCircle,
  BookOpen, Lightbulb, Phone, Shield, Zap, Heart,
  Sparkles, Pill, Scan, Calculator,
  ClipboardList, TrendingUp, Monitor, Apple, Dumbbell, ChevronRight, Lock, HelpCircle, Globe, X
} from 'lucide-react';
import { FloatingBackground } from '@/components/FloatingBackground';
import { ParticleBackground } from '@/components/ParticleBackground';
import { ScrollReveal } from '@/components/ScrollReveal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import { allLanguages } from '@/i18n/languages';
import { LANG_NATIVE, displayLang } from '@/i18n/nativeNames';

// Tool data uses translation keys; resolved at render time so language changes apply.
const buildCategories = (t: (k: string) => string) => ({
  [t('catDiagnostics')]: [
    { icon: Stethoscope, title: t('symptomCheckerT'), description: t('symptomCheckerD'), link: '/symptoms' },
    { icon: Scan, title: t('skinAnalyzerT'), description: t('skinAnalyzerD'), link: '/skin-injury' },
    { icon: FileText, title: t('reportAnalysisT'), description: t('reportAnalysisD'), link: '/reports' },
  ],
  [t('catConsultation')]: [
    { icon: MessageCircle, title: t('aiChatT'), description: t('aiChatD'), link: '/chat' },
    { icon: Pill, title: t('medicineEncyclopediaT'), description: t('medicineEncyclopediaD'), link: '/medicine-info' },
  ],
  [t('catFitness')]: [
    { icon: Apple, title: t('dietWorkoutT'), description: t('dietWorkoutD'), link: '/fitness' },
    { icon: Monitor, title: t('postureT'), description: t('postureD'), link: '/posture-corrector' },
    { icon: Calculator, title: t('healthCalcT'), description: t('healthCalcD'), link: '/bmi-calculator' },
    { icon: Activity, title: t('vitalSignsT'), description: t('vitalSignsD'), link: '/vitals' },
  ],
  [t('catTools')]: [
    { icon: ClipboardList, title: t('medRemindersT'), description: t('medRemindersD'), link: '/medication-reminder' },
    { icon: TrendingUp, title: t('healthReportsT'), description: t('healthReportsD'), link: '/health-reports' },
    { icon: BookOpen, title: t('firstAidT'), description: t('firstAidD'), link: '/first-aid' },
    { icon: Lightbulb, title: t('healthTipsT'), description: t('healthTipsD'), link: '/health-tips' },
    { icon: Phone, title: t('emergencyNumbersT'), description: t('emergencyNumbersD'), link: '/emergency' },
    { icon: HelpCircle, title: t('howToUseT'), description: t('howToUseD'), link: '/how-to-use' },
  ],
});

const buildStats = (t: (k: string) => string) => [
  { value: '15', label: t('statHealthTools'), icon: Sparkles },
  { value: '24/7', label: t('statAvailable'), icon: Zap },
  { value: t('statFree'), label: t('statFreeToUse'), icon: Heart },
  { value: t('statPrivateLabel'), label: t('statPrivate'), icon: Lock },
];

// allLanguages now imported from @/i18n/languages (500+ languages)

export default function HomePage() {
  const { t } = useTranslation();
  const categories = buildCategories(t);
  const stats = buildStats(t);
  const [langOpen, setLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [language, setLanguage] = useLocalStorage('healtify-language', 'English');
  const filteredLangs = allLanguages.filter(l => {
    const q = langSearch.toLowerCase();
    return l.toLowerCase().includes(q) || (LANG_NATIVE[l] ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen relative">
      <ParticleBackground variant="home" />
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
              <span className="text-xs font-medium text-primary">{t('heroBadge')}</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.05] tracking-tight font-display">
              <span className="gradient-text">Healthier</span>
            </h1>

            <p className="text-2xl sm:text-3xl font-display font-semibold text-foreground/90 mb-4 italic">
              "{t('tagline')}"
            </p>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/how-to-use" className="btn-primary flex items-center gap-2 text-base">
                <HelpCircle className="w-4 h-4" /> {t('howToUse')}
              </Link>
              <Link to="/chat" className="btn-secondary flex items-center gap-2 text-base">
                <MessageCircle className="w-4 h-4" /> {t('chatWithAI')}
              </Link>
              <button onClick={() => setLangOpen(true)} className="btn-secondary flex items-center gap-2 text-base">
                <Globe className="w-4 h-4" /> {language}
              </button>
            </div>
          </motion.div>

          {/* Language Picker Modal */}
          <AnimatePresence>
            {langOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setLangOpen(false)}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-lg max-h-[70vh] overflow-hidden flex flex-col"
                  onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> {t('language')}</h3>
                    <button onClick={() => setLangOpen(false)} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="p-3 border-b border-border">
                    <Input placeholder={`${t('search')} ${allLanguages.length}+ ${t('language').toLowerCase()}...`} value={langSearch} onChange={e => setLangSearch(e.target.value)} autoFocus />
                  </div>
                  <div className="p-3 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filteredLangs.map(l => (
                      <button key={l} onClick={() => { setLanguage(l); setLangOpen(false); setLangSearch(''); }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-all card-hover-pop ${language === l ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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
              <h2 className="text-3xl sm:text-4xl font-bold font-display mb-3">{t('allHealthTools')}</h2>
              <p className="text-muted-foreground">{t('toolsByCategory')}</p>
            </div>
          </ScrollReveal>

          <div className="space-y-12">
            {(Object.entries(categories) as [string, Array<{icon: any; title: string; description: string; link: string}>][]).map(([categoryName, tools], catIdx) => (
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
                          <Link to={f.link} className="block bg-card rounded-2xl border border-border p-5 tilt-card card-hover-pop group h-full">
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
                  <h3 className="font-bold text-base mb-2 font-display">{t('safetyTitle')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t('safetyBody')}</p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-destructive" />{t('safetyBullet1')}</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-warning" />{t('safetyBullet2')}</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-success" />{t('safetyBullet3')}</li>
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
