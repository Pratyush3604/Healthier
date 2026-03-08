import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, AlertTriangle, Heart, Brain, Flame, Shield, Droplets, Zap, Thermometer, Baby, Bug, Wind, Pill, Search, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';

const emergencyNumbers = [
  // Americas
  { country: 'USA', ambulance: '911', police: '911', fire: '911', continent: 'Americas' },
  { country: 'Canada', ambulance: '911', police: '911', fire: '911', continent: 'Americas' },
  { country: 'Mexico', ambulance: '065', police: '911', fire: '068', continent: 'Americas' },
  { country: 'Brazil', ambulance: '192', police: '190', fire: '193', continent: 'Americas' },
  { country: 'Argentina', ambulance: '107', police: '101', fire: '100', continent: 'Americas' },
  { country: 'Colombia', ambulance: '123', police: '123', fire: '119', continent: 'Americas' },
  { country: 'Chile', ambulance: '131', police: '133', fire: '132', continent: 'Americas' },
  { country: 'Peru', ambulance: '116', police: '105', fire: '116', continent: 'Americas' },
  { country: 'Venezuela', ambulance: '171', police: '171', fire: '171', continent: 'Americas' },
  { country: 'Ecuador', ambulance: '911', police: '911', fire: '911', continent: 'Americas' },
  { country: 'Cuba', ambulance: '104', police: '106', fire: '105', continent: 'Americas' },
  { country: 'Jamaica', ambulance: '110', police: '119', fire: '110', continent: 'Americas' },
  { country: 'Costa Rica', ambulance: '911', police: '911', fire: '911', continent: 'Americas' },
  { country: 'Panama', ambulance: '911', police: '104', fire: '103', continent: 'Americas' },
  { country: 'Uruguay', ambulance: '105', police: '911', fire: '104', continent: 'Americas' },
  { country: 'Bolivia', ambulance: '118', police: '110', fire: '119', continent: 'Americas' },
  { country: 'Paraguay', ambulance: '141', police: '911', fire: '132', continent: 'Americas' },
  { country: 'Dominican Republic', ambulance: '911', police: '911', fire: '911', continent: 'Americas' },
  { country: 'Guatemala', ambulance: '128', police: '120', fire: '122', continent: 'Americas' },
  { country: 'Honduras', ambulance: '195', police: '199', fire: '198', continent: 'Americas' },
  // Europe
  { country: 'UK', ambulance: '999', police: '999', fire: '999', continent: 'Europe' },
  { country: 'Germany', ambulance: '112', police: '110', fire: '112', continent: 'Europe' },
  { country: 'France', ambulance: '15', police: '17', fire: '18', continent: 'Europe' },
  { country: 'Italy', ambulance: '118', police: '113', fire: '115', continent: 'Europe' },
  { country: 'Spain', ambulance: '112', police: '091', fire: '080', continent: 'Europe' },
  { country: 'Netherlands', ambulance: '112', police: '112', fire: '112', continent: 'Europe' },
  { country: 'Belgium', ambulance: '112', police: '101', fire: '112', continent: 'Europe' },
  { country: 'Sweden', ambulance: '112', police: '112', fire: '112', continent: 'Europe' },
  { country: 'Norway', ambulance: '113', police: '112', fire: '110', continent: 'Europe' },
  { country: 'Denmark', ambulance: '112', police: '112', fire: '112', continent: 'Europe' },
  { country: 'Finland', ambulance: '112', police: '112', fire: '112', continent: 'Europe' },
  { country: 'Switzerland', ambulance: '144', police: '117', fire: '118', continent: 'Europe' },
  { country: 'Austria', ambulance: '144', police: '133', fire: '122', continent: 'Europe' },
  { country: 'Portugal', ambulance: '112', police: '112', fire: '112', continent: 'Europe' },
  { country: 'Greece', ambulance: '166', police: '100', fire: '199', continent: 'Europe' },
  { country: 'Ireland', ambulance: '112', police: '112', fire: '112', continent: 'Europe' },
  { country: 'Poland', ambulance: '112', police: '997', fire: '998', continent: 'Europe' },
  { country: 'Czech Republic', ambulance: '155', police: '158', fire: '150', continent: 'Europe' },
  { country: 'Romania', ambulance: '112', police: '112', fire: '112', continent: 'Europe' },
  { country: 'Hungary', ambulance: '104', police: '107', fire: '105', continent: 'Europe' },
  { country: 'Croatia', ambulance: '194', police: '192', fire: '193', continent: 'Europe' },
  { country: 'Iceland', ambulance: '112', police: '112', fire: '112', continent: 'Europe' },
  { country: 'Luxembourg', ambulance: '112', police: '113', fire: '112', continent: 'Europe' },
  { country: 'Russia', ambulance: '103', police: '102', fire: '101', continent: 'Europe' },
  { country: 'Ukraine', ambulance: '103', police: '102', fire: '101', continent: 'Europe' },
  { country: 'Turkey', ambulance: '112', police: '155', fire: '110', continent: 'Europe' },
  { country: 'Serbia', ambulance: '194', police: '192', fire: '193', continent: 'Europe' },
  { country: 'Bulgaria', ambulance: '150', police: '166', fire: '160', continent: 'Europe' },
  { country: 'Slovakia', ambulance: '155', police: '158', fire: '150', continent: 'Europe' },
  // Asia
  { country: 'India', ambulance: '108', police: '100', fire: '101', continent: 'Asia' },
  { country: 'China', ambulance: '120', police: '110', fire: '119', continent: 'Asia' },
  { country: 'Japan', ambulance: '119', police: '110', fire: '119', continent: 'Asia' },
  { country: 'South Korea', ambulance: '119', police: '112', fire: '119', continent: 'Asia' },
  { country: 'Indonesia', ambulance: '118', police: '110', fire: '113', continent: 'Asia' },
  { country: 'Thailand', ambulance: '1669', police: '191', fire: '199', continent: 'Asia' },
  { country: 'Vietnam', ambulance: '115', police: '113', fire: '114', continent: 'Asia' },
  { country: 'Philippines', ambulance: '911', police: '911', fire: '911', continent: 'Asia' },
  { country: 'Malaysia', ambulance: '999', police: '999', fire: '994', continent: 'Asia' },
  { country: 'Singapore', ambulance: '995', police: '999', fire: '995', continent: 'Asia' },
  { country: 'Pakistan', ambulance: '115', police: '15', fire: '16', continent: 'Asia' },
  { country: 'Bangladesh', ambulance: '999', police: '999', fire: '999', continent: 'Asia' },
  { country: 'Sri Lanka', ambulance: '110', police: '119', fire: '110', continent: 'Asia' },
  { country: 'Nepal', ambulance: '102', police: '100', fire: '101', continent: 'Asia' },
  { country: 'Myanmar', ambulance: '192', police: '199', fire: '191', continent: 'Asia' },
  { country: 'Cambodia', ambulance: '119', police: '117', fire: '118', continent: 'Asia' },
  { country: 'Laos', ambulance: '195', police: '191', fire: '190', continent: 'Asia' },
  { country: 'Mongolia', ambulance: '103', police: '102', fire: '101', continent: 'Asia' },
  { country: 'Taiwan', ambulance: '119', police: '110', fire: '119', continent: 'Asia' },
  { country: 'Hong Kong', ambulance: '999', police: '999', fire: '999', continent: 'Asia' },
  // Middle East
  { country: 'UAE', ambulance: '998', police: '999', fire: '997', continent: 'Middle East' },
  { country: 'Saudi Arabia', ambulance: '997', police: '999', fire: '998', continent: 'Middle East' },
  { country: 'Israel', ambulance: '101', police: '100', fire: '102', continent: 'Middle East' },
  { country: 'Qatar', ambulance: '999', police: '999', fire: '999', continent: 'Middle East' },
  { country: 'Kuwait', ambulance: '112', police: '112', fire: '112', continent: 'Middle East' },
  { country: 'Bahrain', ambulance: '999', police: '999', fire: '999', continent: 'Middle East' },
  { country: 'Oman', ambulance: '9999', police: '9999', fire: '9999', continent: 'Middle East' },
  { country: 'Jordan', ambulance: '911', police: '911', fire: '911', continent: 'Middle East' },
  { country: 'Lebanon', ambulance: '140', police: '112', fire: '175', continent: 'Middle East' },
  { country: 'Iraq', ambulance: '122', police: '104', fire: '115', continent: 'Middle East' },
  { country: 'Iran', ambulance: '115', police: '110', fire: '125', continent: 'Middle East' },
  // Africa
  { country: 'South Africa', ambulance: '10177', police: '10111', fire: '10177', continent: 'Africa' },
  { country: 'Egypt', ambulance: '123', police: '122', fire: '180', continent: 'Africa' },
  { country: 'Nigeria', ambulance: '112', police: '112', fire: '112', continent: 'Africa' },
  { country: 'Kenya', ambulance: '999', police: '999', fire: '999', continent: 'Africa' },
  { country: 'Ghana', ambulance: '193', police: '191', fire: '192', continent: 'Africa' },
  { country: 'Tanzania', ambulance: '114', police: '112', fire: '114', continent: 'Africa' },
  { country: 'Ethiopia', ambulance: '907', police: '991', fire: '939', continent: 'Africa' },
  { country: 'Morocco', ambulance: '15', police: '19', fire: '15', continent: 'Africa' },
  { country: 'Tunisia', ambulance: '190', police: '197', fire: '198', continent: 'Africa' },
  { country: 'Uganda', ambulance: '112', police: '999', fire: '112', continent: 'Africa' },
  { country: 'Rwanda', ambulance: '912', police: '112', fire: '112', continent: 'Africa' },
  { country: 'Senegal', ambulance: '15', police: '17', fire: '18', continent: 'Africa' },
  { country: 'Zimbabwe', ambulance: '994', police: '995', fire: '993', continent: 'Africa' },
  // Oceania
  { country: 'Australia', ambulance: '000', police: '000', fire: '000', continent: 'Oceania' },
  { country: 'New Zealand', ambulance: '111', police: '111', fire: '111', continent: 'Oceania' },
  { country: 'Fiji', ambulance: '911', police: '917', fire: '910', continent: 'Oceania' },
  { country: 'Papua New Guinea', ambulance: '111', police: '112', fire: '110', continent: 'Oceania' },
];

const continents = ['All', ...new Set(emergencyNumbers.map(e => e.continent))];

const emergencySigns = [
  {
    icon: Heart, title: 'Heart Attack', color: 'from-red-500 to-rose-500',
    signs: ['Chest pain or pressure lasting >5 minutes', 'Pain radiating to left arm, jaw, back, or neck', 'Shortness of breath with or without chest discomfort', 'Cold sweats, nausea, lightheadedness', 'Unusual fatigue (especially in women)', 'Feeling of impending doom'],
    actions: ['Call emergency services immediately', 'Have person chew aspirin (if not allergic)', 'Keep them calm and seated', 'Be prepared to perform CPR', 'Note the time symptoms started', 'Do NOT drive them yourself — wait for ambulance'],
  },
  {
    icon: Brain, title: 'Stroke (FAST Method)', color: 'from-purple-500 to-indigo-500',
    signs: ['Face drooping on one side', 'Arm weakness — one arm drifts down', 'Speech difficulty — slurred or confused', 'Sudden severe headache with no known cause', 'Sudden vision problems in one or both eyes', 'Sudden difficulty walking, dizziness, loss of balance'],
    actions: ['Call emergency services IMMEDIATELY — time is critical', 'Note exact time symptoms started (crucial for treatment)', 'Do NOT give food, drink, or medications', 'Keep person lying down with head elevated', 'If vomiting, turn on side', 'Clot-busting treatment works best within 3 hours'],
  },
  {
    icon: AlertTriangle, title: 'Severe Allergic Reaction (Anaphylaxis)', color: 'from-orange-500 to-amber-500',
    signs: ['Difficulty breathing, wheezing, tightness in throat', 'Swelling of face, lips, tongue, or throat', 'Rapid or weak pulse', 'Skin rash, hives, flushing, or pale skin', 'Nausea, vomiting, diarrhea', 'Dizziness, fainting, or loss of consciousness'],
    actions: ['Use EpiPen immediately (inject in outer thigh)', 'Call 911 even if EpiPen used', 'Lay person flat with legs elevated', 'Give second EpiPen after 5-15 min if no improvement', 'Begin CPR if they stop breathing', 'Do NOT give oral medication if throat is swelling'],
  },
  {
    icon: Flame, title: 'Severe Burns (3rd/4th Degree)', color: 'from-red-600 to-orange-600',
    signs: ['White, brown, or black charred skin', 'Skin that looks waxy or leathery', 'Numbness in burn area (nerve damage)', 'Burns covering large body area', 'Burns on face, hands, feet, genitals, or joints', 'Electrical or chemical burns'],
    actions: ['Call 911 immediately', 'Do NOT apply water, ice, or creams to severe burns', 'Do NOT remove clothing stuck to the burn', 'Cover loosely with sterile non-stick bandage or clean sheet', 'Elevate burned area above heart if possible', 'Monitor for shock: pale skin, rapid pulse, shallow breathing'],
  },
  {
    icon: Droplets, title: 'Severe Bleeding (Hemorrhage)', color: 'from-red-600 to-pink-600',
    signs: ['Blood spurting or flowing rapidly from wound', 'Blood soaking through bandages quickly', 'Blood pooling on the ground', 'Person becoming pale, cold, confused', 'Rapid weak pulse', 'Wound too large to close'],
    actions: ['Call 911 immediately', 'Apply direct firm pressure with clean cloth', 'Do NOT remove blood-soaked cloth — add more on top', 'Apply tourniquet above wound on limbs if bleeding won\'t stop', 'Keep person warm and lying down', 'Elevate wound above heart if possible'],
  },
  {
    icon: Zap, title: 'Electrical Emergency', color: 'from-yellow-500 to-amber-500',
    signs: ['Person in contact with live electrical source', 'Burns at entry and exit points', 'Muscle contractions or being "frozen" to source', 'Cardiac arrest or irregular heartbeat', 'Confusion or loss of consciousness', 'Difficulty breathing'],
    actions: ['Do NOT touch the person directly', 'Turn off power source if safe to do so', 'Call 911 immediately', 'Use non-conductive material to separate person from source', 'Check breathing and begin CPR if needed', 'Treat burns after ensuring scene safety'],
  },
  {
    icon: Wind, title: 'Choking (Complete Airway Obstruction)', color: 'from-blue-500 to-indigo-500',
    signs: ['Unable to cough, speak, or breathe', 'Universal choking sign (hands clutching throat)', 'Face turning blue or purple', 'Loss of consciousness', 'High-pitched sounds or complete silence', 'Panicked appearance'],
    actions: ['Ask "Are you choking?" — if they can\'t speak, act immediately', 'Stand behind and give abdominal thrusts (Heimlich)', 'For pregnant/obese: chest thrusts instead', 'For infants: 5 back blows then 5 chest thrusts', 'If person goes unconscious, lower to ground and begin CPR', 'Call 911 if object doesn\'t come out quickly'],
  },
  {
    icon: Thermometer, title: 'Heat Stroke (Medical Emergency)', color: 'from-red-500 to-orange-500',
    signs: ['Body temperature above 104°F (40°C)', 'Hot, red, dry skin (no sweating)', 'Rapid strong pulse', 'Confusion, agitation, slurred speech', 'Nausea, vomiting', 'Loss of consciousness or seizures'],
    actions: ['Call 911 immediately — heat stroke can be fatal', 'Move to coolest area available', 'Cool rapidly: ice packs to neck, armpits, groin', 'Spray with cool water and fan', 'Do NOT give fluids if unconscious', 'Do NOT give aspirin or acetaminophen'],
  },
  {
    icon: Baby, title: 'Infant Not Breathing', color: 'from-pink-500 to-rose-500',
    signs: ['Baby is limp, unresponsive', 'No chest movement visible', 'Lips or face turning blue', 'No sound of breathing', 'Not responding to stimulation', 'Found face-down or in unsafe sleep position'],
    actions: ['Shout for help, call 911 immediately', 'Place baby on firm flat surface', 'Tilt head back slightly, lift chin', 'Give 2 gentle rescue breaths covering mouth AND nose', 'Begin infant CPR: 30 compressions with 2 fingers', 'Continue until emergency services arrive'],
  },
  {
    icon: Bug, title: 'Severe Spider/Snake Bite', color: 'from-green-600 to-emerald-600',
    signs: ['Severe pain at bite site', 'Swelling spreading rapidly', 'Difficulty breathing', 'Nausea, vomiting, abdominal pain', 'Muscle cramps or spasms', 'Changes in heart rate, dizziness'],
    actions: ['Call 911 or poison control', 'Keep person calm and still', 'Immobilize bitten area below heart level', 'Remove rings/jewelry near bite', 'Do NOT cut, suck, or tourniquet', 'Note the snake/spider description for antivenom'],
  },
  {
    icon: Pill, title: 'Drug Overdose', color: 'from-red-500 to-pink-500',
    signs: ['Unconsciousness or extreme drowsiness', 'Slow, shallow, or stopped breathing', 'Blue lips or fingertips', 'Pinpoint or very dilated pupils', 'Gurgling or snoring sounds', 'Seizures or muscle rigidity'],
    actions: ['Call 911 immediately', 'Administer naloxone (Narcan) if available for opioid overdose', 'Place in recovery position if breathing', 'Begin CPR if not breathing', 'Do NOT leave person alone', 'Stay until emergency services arrive'],
  },
  {
    icon: Shield, title: 'Drowning', color: 'from-blue-600 to-indigo-600',
    signs: ['Person submerged or struggling in water', 'Arms flailing, unable to call for help', 'Head tilted back, mouth open', 'Eyes glassy, unfocused', 'Hyperventilating or gasping', 'Not using legs, body vertical'],
    actions: ['Call 911 immediately', 'Reach or throw a flotation device — do NOT jump in unless trained', 'Get person out of water as quickly as possible', 'Check breathing and begin CPR immediately', 'Continue CPR even if person appears dead — drowning victims can recover', 'Remove wet clothing and prevent hypothermia'],
  },
];

export default function EmergencyPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('All');

  const filtered = emergencyNumbers.filter(e => {
    const matchesSearch = !searchTerm || e.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesContinent = selectedContinent === 'All' || e.continent === selectedContinent;
    return matchesSearch && matchesContinent;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-red-600 to-rose-600 animate-pulse">
            <Phone className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Emergency Contacts & Guide</h1>
            <p className="text-muted-foreground">{emergencyNumbers.length} countries — Ambulance, Police & Fire numbers</p>
          </div>
        </div>

        {/* Emergency Numbers */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Emergency Numbers Worldwide</h2>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search country..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {continents.map(c => (
              <button key={c} onClick={() => setSelectedContinent(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedContinent === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {c} {c !== 'All' ? `(${emergencyNumbers.filter(e => e.continent === c).length})` : `(${emergencyNumbers.length})`}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Country</th>
                  <th className="text-center py-2 px-3 font-semibold text-destructive">🚑 Ambulance</th>
                  <th className="text-center py-2 px-3 font-semibold text-secondary">👮 Police</th>
                  <th className="text-center py-2 px-3 font-semibold text-warning">🚒 Fire</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-3 font-medium">{e.country}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-destructive">{e.ambulance}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-secondary">{e.police}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-warning">{e.fire}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No countries found matching "{searchTerm}"</p>
          )}
        </div>

        {/* When to Call — Detailed */}
        <h2 className="text-xl font-semibold mb-4">🚨 When to Call Emergency Services — Detailed Guide</h2>
        <div className="space-y-6 mb-8">
          {emergencySigns.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
                className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${item.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-destructive mb-2">⚠️ Warning Signs</h4>
                    <ul className="space-y-1.5">
                      {item.signs.map((sign, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0 mt-1.5" />{sign}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-success mb-2">✅ What To Do</h4>
                    <ol className="space-y-1.5">
                      {item.actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-5 h-5 rounded-full bg-success/20 text-success text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          {action}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-destructive/10 border-2 border-destructive/50 rounded-2xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <h3 className="text-xl font-bold text-destructive mb-2">Don't Hesitate to Call</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            If you're unsure whether it's an emergency, it's always better to call and let professionals assess the situation.
            Emergency dispatchers are trained to help you determine the right level of care. <strong>You will never be penalized for calling when in doubt.</strong>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
