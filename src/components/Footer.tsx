import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertTriangle } from 'lucide-react';
import { HealtifyLogo } from './HealtifyLogo';

export const Footer = forwardRef<HTMLElement>((_, ref) => {
  return (
    <footer ref={ref} className="relative z-10 border-t border-border mt-auto">
      <div className="bg-warning/5 border-b border-warning/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-warning">Medical Disclaimer:</strong> Healthier provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
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
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Your intelligent health companion powered by cutting-edge AI. Get preliminary assessments, first aid guidance, and wellness tools — available 24/7.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Core Tools</h4>
            <ul className="space-y-2">
              {[
                { to: '/symptoms', label: 'Symptom Checker' },
                { to: '/chat', label: 'AI Chat' },
                { to: '/vitals', label: 'Vital Signs' },
                { to: '/skin-injury', label: 'Skin & Injury' },
                { to: '/fitness', label: 'Fitness & Diet' },
                { to: '/bmi-calculator', label: 'Health Calculator' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Resources</h4>
            <ul className="space-y-2">
              {[
                { to: '/medicine-info', label: 'Medicine Info' },
                { to: '/first-aid', label: 'First Aid' },
                { to: '/health-tips', label: 'Health Tips' },
                { to: '/emergency', label: 'Emergency Numbers' },
                { to: '/how-to-use', label: 'How to Use' },
                { to: '/about', label: 'About' },
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
            © {new Date().getFullYear()} Healthier — Made by Pratyush Dalmia
          </p>
          <a href="https://mail.google.com/mail/?view=cm&to=pratyush3604@gmail.com" target="_blank" rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm" aria-label="Email">
            <Mail className="w-4 h-4" /> pratyush3604@gmail.com
          </a>
        </div>

        <div className="text-center mt-6 pt-6 border-t border-border/50">
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you'd like to support Healthier and help us keep improving, we'd truly appreciate it.
            <br />
            Please reach out at{' '}
            <a href="https://mail.google.com/mail/?view=cm&to=pratyush3604@gmail.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              pratyush3604@gmail.com
            </a>{' '}
            — every bit of support means the world to us. Thank you for your support!
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
