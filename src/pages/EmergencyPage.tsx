import { motion } from 'framer-motion';
import { Phone, AlertTriangle, Heart, Brain, Flame, Shield, Droplets, Zap, Thermometer, Baby, Bug, Wind, Pill } from 'lucide-react';

const emergencyNumbers = [
  { country: 'USA', number: '911', label: 'Emergency Services' },
  { country: 'India', number: '112', label: 'National Emergency' },
  { country: 'UK', number: '999', label: 'Emergency Services' },
  { country: 'EU', number: '112', label: 'European Emergency' },
  { country: 'Australia', number: '000', label: 'Emergency Services' },
  { country: 'Canada', number: '911', label: 'Emergency Services' },
  { country: 'Japan', number: '119', label: 'Fire/Ambulance' },
  { country: 'China', number: '120', label: 'Ambulance' },
  { country: 'Brazil', number: '192', label: 'SAMU (Ambulance)' },
  { country: 'South Korea', number: '119', label: 'Fire/Ambulance' },
  { country: 'Russia', number: '112', label: 'Emergency' },
  { country: 'Mexico', number: '911', label: 'Emergency Services' },
  { country: 'South Africa', number: '10177', label: 'Ambulance' },
  { country: 'UAE', number: '999', label: 'Ambulance' },
  { country: 'Saudi Arabia', number: '997', label: 'Ambulance' },
  { country: 'Singapore', number: '995', label: 'Ambulance' },
  { country: 'Malaysia', number: '999', label: 'Emergency' },
  { country: 'Thailand', number: '1669', label: 'Ambulance' },
  { country: 'Indonesia', number: '118', label: 'Ambulance' },
  { country: 'Pakistan', number: '1122', label: 'Rescue (Punjab)' },
  { country: 'Bangladesh', number: '999', label: 'Emergency' },
  { country: 'Philippines', number: '911', label: 'Emergency' },
  { country: 'Turkey', number: '112', label: 'Emergency' },
  { country: 'Egypt', number: '123', label: 'Ambulance' },
  { country: 'Nigeria', number: '112', label: 'Emergency' },
  { country: 'Kenya', number: '999', label: 'Emergency' },
  { country: 'New Zealand', number: '111', label: 'Emergency' },
  { country: 'Germany', number: '112', label: 'Emergency' },
  { country: 'France', number: '15', label: 'SAMU (Medical)' },
  { country: 'Italy', number: '118', label: 'Ambulance' },
  { country: 'Spain', number: '112', label: 'Emergency' },
  { country: 'Netherlands', number: '112', label: 'Emergency' },
  { country: 'Sweden', number: '112', label: 'Emergency' },
  { country: 'Norway', number: '113', label: 'Ambulance' },
  { country: 'Switzerland', number: '144', label: 'Ambulance' },
  { country: 'Israel', number: '101', label: 'Magen David Adom' },
  { country: 'Argentina', number: '107', label: 'SAME (Ambulance)' },
  { country: 'Colombia', number: '123', label: 'Emergency' },
  { country: 'Chile', number: '131', label: 'Ambulance' },
  { country: 'Peru', number: '116', label: 'Emergency' },
];

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
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-red-600 to-rose-600 animate-pulse">
            <Phone className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Emergency Contacts & Guide</h1>
            <p className="text-muted-foreground">Know when and how to get emergency help — worldwide numbers & detailed guides</p>
          </div>
        </div>

        {/* Emergency Numbers — All Countries */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Emergency Numbers Worldwide ({emergencyNumbers.length} Countries)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {emergencyNumbers.map((item, i) => (
              <div key={i} className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground font-medium">{item.country}</p>
                <p className="text-xl font-bold text-destructive">{item.number}</p>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* When to Call — Detailed */}
        <h2 className="text-xl font-semibold mb-4">🚨 When to Call Emergency Services — Detailed Guide</h2>
        <div className="space-y-6 mb-8">
          {emergencySigns.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
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
