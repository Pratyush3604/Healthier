import { Link } from 'react-router-dom';
import { Hospital, Stethoscope, Pill, Baby, HeartPulse, Siren, Smile, Eye, Navigation } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';

const SHORTCUTS = [
  { kind: 'hospital', label: 'Hospitals', icon: Hospital },
  { kind: 'general physician', label: 'General physician', icon: Stethoscope },
  { kind: '24/7 pharmacy', label: '24/7 pharmacy', icon: Pill },
  { kind: 'pediatrician', label: 'Child doctor', icon: Baby },
  { kind: 'cardiologist', label: 'Heart specialist', icon: HeartPulse },
  { kind: 'dentist', label: 'Dentist', icon: Smile },
  { kind: 'ophthalmologist', label: 'Eye doctor', icon: Eye },
  { kind: 'emergency', label: 'Emergency', icon: Siren },
];

export function HomeNearbyCare() {
  return (
    <section className="py-16 border-t border-border relative z-10">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="bg-card rounded-3xl border border-border p-6 md:p-10 shadow-soft">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-bold">Find care near you</h2>
                <p className="text-muted-foreground">Hospitals, doctors, specialists and pharmacies around your location.</p>
              </div>
              <Link to="/nearby-care?locate=1" className="btn-primary inline-flex items-center gap-2"><Navigation className="h-4 w-4" /> Use my location</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SHORTCUTS.map(({ kind, label, icon: Icon }) => (
                <Link key={kind} to={`/nearby-care?kind=${encodeURIComponent(kind)}&locate=1`} className="flex items-center gap-2 rounded-xl border border-border p-3 hover:border-primary hover:bg-primary/5 transition-colors">
                  <Icon className="h-5 w-5 text-primary" /><span className="text-sm font-medium">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
