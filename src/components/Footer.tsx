import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertTriangle } from 'lucide-react';
import { HealtifyLogo } from './HealtifyLogo';
import { useTranslation } from '@/hooks/useTranslation';

export const Footer = forwardRef<HTMLElement>((_, ref) => {
  const { t } = useTranslation();
  return (
    <footer ref={ref} className="relative z-10 border-t border-border mt-auto">
      <div className="bg-warning/5 border-b border-warning/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-warning">{t('medicalDisclaimer')}</strong> {t('medicalDisclaimerBody')}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <HealtifyLogo size={40} />
              <div>
                <span className="font-display font-bold text-lg gradient-text">Healthier</span>
                <span className="text-xs text-muted-foreground block -mt-1">AI Health Assistant</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">{t('footerTagline')}</p>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">{t('coreTools')}</h4>
            <ul className="space-y-2">
              {[
                { to: '/symptoms', label: t('symptomCheckerT') },
                { to: '/chat', label: t('aiChatT') },
                { to: '/vitals', label: t('vitalSignsT') },
                { to: '/skin-injury', label: t('skinAnalyzerT') },
                { to: '/fitness', label: t('dietWorkoutT') },
                { to: '/bmi-calculator', label: t('healthCalcT') },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">{t('resources')}</h4>
            <ul className="space-y-2">
              {[
                { to: '/medicine-info', label: t('medicineEncyclopediaT') },
                { to: '/first-aid', label: t('firstAidT') },
                { to: '/health-tips', label: t('healthTipsT') },
                { to: '/emergency', label: t('emergencyNumbersT') },
                { to: '/how-to-use', label: t('howToUseT') },
                { to: '/about', label: t('about') },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Healthier — {t('madeBy')}
          </p>
          <a href="https://mail.google.com/mail/?view=cm&to=pratyush3604@gmail.com" target="_blank" rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm" aria-label="Email">
            <Mail className="w-4 h-4" /> pratyush3604@gmail.com
          </a>
        </div>

        <div className="text-center mt-6 pt-6 border-t border-border/50">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('supportTitle')}
            <br />
            {t('supportBody')}{' '}
            <a href="https://mail.google.com/mail/?view=cm&to=pratyush3604@gmail.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              pratyush3604@gmail.com
            </a>{' '}
            {t('supportThanks')}
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
