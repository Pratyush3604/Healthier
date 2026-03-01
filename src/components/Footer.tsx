import { Link } from 'react-router-dom';
import { Github, Mail, AlertTriangle } from 'lucide-react';
import { HealtifyLogo } from './HealtifyLogo';

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 mt-auto">
      <div className="bg-warning/5 border-b border-warning/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-warning/80">
              <strong className="text-warning">Medical Disclaimer:</strong> Healtify provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <HealtifyLogo size={40} />
              <div>
                <span className="font-display font-bold text-lg gradient-text">Healtify</span>
                <span className="text-xs text-muted-foreground block -mt-1">AI Health Assistant</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Your intelligent health companion powered by cutting-edge AI. Get preliminary assessments, first aid guidance, and wellness tips.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Features</h4>
            <ul className="space-y-2">
              {[
                { to: '/symptoms', label: 'Symptom Checker' },
                { to: '/vitals', label: 'Vital Signs' },
                { to: '/injury', label: 'Injury Detection' },
                { to: '/skin-analyzer', label: 'Skin Analyzer' },
                { to: '/diet-planner', label: 'Diet Planner' },
                { to: '/workout-planner', label: 'Workout Planner' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">More</h4>
            <ul className="space-y-2">
              {[
                { to: '/chat', label: 'AI Chat' },
                { to: '/ai-doctor', label: 'Voice Consultation' },
                { to: '/sleep-analysis', label: 'Sleep Analysis' },
                { to: '/medicine-info', label: 'Medicine Info' },
                { to: '/first-aid', label: 'First Aid' },
                { to: '/about', label: 'About' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-white/5">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Healtify. Created by Pratyush Dalmia.</p>
          <div className="flex items-center gap-4">
            <a href="mailto:pratyush3604@gmail.com" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Email"><Mail className="w-5 h-5" /></a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub"><Github className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
