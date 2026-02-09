import { motion } from 'framer-motion';
import { Phone, AlertTriangle, Heart, Brain, Flame, Shield } from 'lucide-react';

const emergencyNumbers = [
  { country: 'USA', number: '911', label: 'Emergency Services' },
  { country: 'India', number: '112', label: 'National Emergency' },
  { country: 'UK', number: '999', label: 'Emergency Services' },
  { country: 'EU', number: '112', label: 'European Emergency' },
];

const emergencySigns = [
  { icon: Heart, title: 'Heart Attack', signs: ['Chest pain/pressure', 'Pain in arm/jaw', 'Shortness of breath', 'Cold sweats'], color: 'from-red-500 to-rose-500' },
  { icon: Brain, title: 'Stroke (FAST)', signs: ['Face drooping', 'Arm weakness', 'Speech difficulty', 'Time to call emergency'], color: 'from-purple-500 to-indigo-500' },
  { icon: AlertTriangle, title: 'Severe Allergic Reaction', signs: ['Difficulty breathing', 'Swelling of face/throat', 'Rapid pulse', 'Dizziness'], color: 'from-orange-500 to-amber-500' },
  { icon: Flame, title: 'Severe Burns', signs: ['Large area affected', 'Deep tissue damage', 'Burns on face/hands', 'Electrical/chemical burns'], color: 'from-red-600 to-orange-600' },
];

export default function EmergencyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-red-600 to-rose-600 animate-pulse">
            <Phone className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Emergency Contacts</h1>
            <p className="text-muted-foreground">Know when and how to get emergency help</p>
          </div>
        </div>

        {/* Emergency Numbers */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Emergency Numbers</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {emergencyNumbers.map((item, i) => (
              <div key={i} className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground">{item.country}</p>
                <p className="text-3xl font-bold text-destructive">{item.number}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* When to Call */}
        <h2 className="text-xl font-semibold mb-4">🚨 When to Call Emergency Services</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {emergencySigns.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="glass-card rounded-2xl p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${item.color} mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <ul className="space-y-1">
                  {item.signs.map((sign, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive" />{sign}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-destructive/10 border-2 border-destructive/50 rounded-2xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <h3 className="text-xl font-bold text-destructive mb-2">Don't Hesitate to Call</h3>
          <p className="text-muted-foreground">If you're unsure whether it's an emergency, it's always better to call and let professionals assess the situation.</p>
        </div>
      </motion.div>
    </div>
  );
}
