import { Link } from 'react-router-dom';
import { Heart, Github, Mail, AlertTriangle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 mt-auto">
      {/* Medical Disclaimer */}
      <div className="bg-warning/5 border-b border-warning/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-warning/80">
              <strong className="text-warning">Medical Disclaimer:</strong> Mediredy AI provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-bold text-lg gradient-text">Mediredy</span>
                <span className="text-xs text-muted-foreground block -mt-1">AI Doctor v2.0</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Your intelligent medical assistant powered by cutting-edge AI technology. 
              Get preliminary health assessments, first aid guidance, and wellness tips.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Features</h4>
            <ul className="space-y-2">
              {[
                { to: '/symptoms', label: 'Symptom Checker' },
                { to: '/vitals', label: 'Vital Signs' },
                { to: '/injury', label: 'Injury Detection' },
                { to: '/first-aid', label: 'First Aid Guide' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">More</h4>
            <ul className="space-y-2">
              {[
                { to: '/chat', label: 'AI Chat' },
                { to: '/ai-doctor', label: 'Voice Consultation' },
                { to: '/health-tips', label: 'Health Tips' },
                { to: '/about', label: 'About' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-white/5">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Mediredy. Created by Pratyush Dalmia.
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="mailto:pratyush3604@gmail.com" 
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
