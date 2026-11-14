import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Activity, FileText, MessageCircle,
  BookOpen, Lightbulb, Phone, Shield, Zap, Heart,
  Sparkles, Pill, Scan, Calculator,
  ClipboardList, TrendingUp, Monitor, Apple, Dumbbell, ChevronRight, Lock, HelpCircle, Globe, X,
  FileSearch, ArrowRight, ClipboardCheck
} from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { HomeNearbyCare } from '@/components/HomeNearbyCare';
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

// allLanguages now imported from @/i18n/languages (500+ languages)

export default function HomePage() {
  const { t } = useTranslation();
  const categories = buildCategories(t);
  const [langOpen, setLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [language, setLanguage] = useLocalStorage('healtify-language', 'English');
  const filteredLangs = allLanguages.filter(l => {
    const q = langSearch.toLowerCase();
    return l.toLowerCase().includes(q) || (LANG_NATIVE[l] ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen relative">
      {/* Hero */}
      <section className="relative py-14 sm:py-20 lg:py-24 overflow-hidden">
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
          <motion.div className="max-w-4xl mx-auto text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <motion.div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 mb-8"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <FileSearch className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">LAB REPORTS · PRESCRIPTIONS · PLAIN LANGUAGE</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-5 leading-tight font-display">
              Make sense of your <span className="gradient-text">health documents.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Get a clear summary of what’s readable, what isn’t, and what to ask your doctor or pharmacist. No guessing at doses or diagnoses.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 max-w-2xl mx-auto">
              <Button asChild size="lg" className="h-auto min-h-12 justify-between px-5 py-3 text-base">
                <Link to="/reports?kind=lab">
                  <span className="flex items-center gap-2"><FileText className="h-5 w-5" />Understand a lab report</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-auto min-h-12 justify-between px-5 py-3 text-base">
                <Link to="/reports?kind=prescription">
                  <span className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5" />Read a prescription</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <button onClick={() => setLangOpen(true)} className="btn-secondary flex items-center gap-2 text-base">
                <Globe className="w-4 h-4" /> {LANG_NATIVE[language] ?? language}
              </button>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3 text-left border-y border-border py-6">
              {[
                { step: '01', title: 'Add a photo or PDF', detail: 'Use your camera or choose a document.' },
                { step: '02', title: 'Review what’s clear', detail: 'Uncertain text is called out—not filled in.' },
                { step: '03', title: 'Take questions with you', detail: 'Save a summary and discuss it with a professional.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <span className="font-mono text-xs text-primary pt-1">{item.step}</span>
                  <div>
                    <h2 className="font-semibold text-sm mb-1">{item.title}</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
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
                    <Input placeholder={`${t('search')} 600+ ${t('language').toLowerCase()}...`} value={langSearch} onChange={e => setLangSearch(e.target.value)} autoFocus />
                  </div>
                  <div data-no-translate className="p-3 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filteredLangs.map(l => {
                      const native = LANG_NATIVE[l];
                      const isActive = language === l;
                      return (
                        <button key={l} onClick={() => { setLanguage(l); setLangOpen(false); setLangSearch(''); }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-all card-hover-pop ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>
                          <div className="leading-tight">
                            <div className={`font-semibold ${native && native !== l ? '' : ''}`}>{native ?? l}</div>
                            {native && native !== l && (
                              <div className={`text-[10px] opacity-70`}>{l}</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      <HomeNearbyCare />

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
