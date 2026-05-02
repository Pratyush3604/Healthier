import { useState } from 'react';
import { Stethoscope, Search, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';
import { FloatingBackground } from '@/components/FloatingBackground';
import { ParticleBackground } from '@/components/ParticleBackground';
import { ScrollReveal } from '@/components/ScrollReveal';

const symptomCategories = {
  'Head & Neurological': ['Headache','Migraine','Tension headache','Cluster headache','Dizziness','Vertigo','Lightheadedness','Confusion','Memory problems','Difficulty concentrating','Brain fog','Slurred speech','Trouble finding words','Tremors','Twitching','Tics','Blurred vision','Double vision','Light sensitivity','Eye floaters','Tunnel vision','Sudden vision loss','Eye pain','Watery eyes','Dry eyes','Red eyes','Itchy eyes','Drooping eyelid','Bulging eyes','Ringing in ears','Hearing loss','Ear pain','Ear discharge','Ear fullness','Numbness in face','Facial drooping','Facial pain','Tingling in head','Scalp pain','Sensitivity to noise','Sensitivity to smells','Loss of smell','Loss of taste','Metallic taste','Bitter taste','Fainting','Near-fainting','Seizures','Sudden weakness on one side','Pins and needles','Balance problems','Coordination loss','Difficulty walking','Sudden severe headache','Headache with stiff neck','Pulsating headache','Throbbing temple pain','Sinus pressure','Forehead pressure','Eye twitching','Restless legs','Insomnia (with mind racing)','Sleepwalking','Night terrors','Hypnic jerks'],
  'Respiratory & Throat': ['Cough','Dry cough','Wet cough','Productive cough','Persistent cough','Cough at night','Cough with blood','Whooping cough','Shortness of breath','Shortness of breath at rest','Shortness of breath on exertion','Wheezing','Stridor','Chest tightness','Rapid breathing','Slow breathing','Difficulty breathing lying flat','Snoring','Sleep apnea','Runny nose','Stuffy nose','Postnasal drip','Sneezing','Itchy nose','Nosebleed','Loss of smell','Sinus pain','Sinus pressure','Facial congestion','Sore throat','Swollen tonsils','White patches in throat','Hoarse voice','Loss of voice','Difficulty swallowing','Painful swallowing','Lump in throat sensation','Mucus in throat','Coughing up blood','Coughing up green mucus','Coughing up yellow mucus','Throat clearing','Foreign body sensation','Bad breath','Mouth breathing','Dry throat','Tickle in throat','Burning throat'],
  'Digestive & Abdominal': ['Nausea','Vomiting','Vomiting blood','Projectile vomiting','Morning nausea','Diarrhea','Watery diarrhea','Bloody diarrhea','Mucus in stool','Constipation','Hard stool','Straining to defecate','Stomach pain','Upper abdominal pain','Lower abdominal pain','Right side abdominal pain','Left side abdominal pain','Periumbilical pain','Cramping','Abdominal cramps','Bloating','Gas','Belching','Heartburn','Acid reflux','GERD','Indigestion','Loss of appetite','Excessive hunger','Early satiety','Difficulty swallowing','Painful swallowing','Food getting stuck','Regurgitation','Black stool','Tarry stool','Pale stool','Greasy stool','Floating stool','Foul-smelling stool','Stool changes','Rectal pain','Rectal bleeding','Hemorrhoids','Anal itching','Anal fissure','Worms in stool','Pinworm itching','Frequent bowel movements','Urgent bowel movements','Incomplete evacuation','Change in stool caliber','Mouth ulcers','Canker sores','Cold sores','Bleeding gums','Tooth pain','Jaw pain','Dry mouth','Excessive saliva','Bad taste','Tongue pain','White tongue coating','Hairy tongue','Burning mouth','Cracked lips','Swollen lips'],
  'Musculoskeletal & Joints': ['Back pain','Lower back pain','Upper back pain','Mid-back pain','Neck pain','Neck stiffness','Whiplash','Joint pain','Multiple joint pain','Joint swelling','Joint stiffness','Morning stiffness','Knee pain','Knee swelling','Knee instability','Locked knee','Hip pain','Hip clicking','Shoulder pain','Frozen shoulder','Shoulder dislocation','Elbow pain','Tennis elbow','Golfer\'s elbow','Wrist pain','Carpal tunnel symptoms','Hand pain','Finger pain','Trigger finger','Thumb pain','Foot pain','Ankle pain','Heel pain','Plantar fasciitis','Toe pain','Big toe swelling','Bunions','Muscle aches','Generalized muscle pain','Muscle weakness','Muscle cramps','Calf cramps','Leg cramps at night','Muscle spasms','Twitching muscles','Charley horse','Stiffness','Reduced range of motion','Bone pain','Pain with movement','Pain with rest','Pain at night','Joint redness','Joint warmth','Crepitus','Clicking joints','Popping joints','Swollen ankles','Swollen feet','Pitting edema','Sciatica','Tailbone pain','Rib pain','Chest wall pain','Costochondritis','TMJ pain','Jaw clicking','Bruising on bones'],
  'Cardiovascular': ['Chest pain','Crushing chest pain','Squeezing chest pain','Burning chest pain','Sharp chest pain','Chest pain on exertion','Chest pain at rest','Chest pain radiating to arm','Chest pain radiating to jaw','Chest pain radiating to back','Heart palpitations','Rapid heartbeat','Slow heartbeat','Irregular heartbeat','Skipped beats','Pounding heart','Fluttering heart','High blood pressure','Low blood pressure','Sudden BP spike','Dizziness on standing','Swollen legs','Swollen ankles','Swollen feet','Cold hands','Cold feet','Numb hands','Bluish skin','Bluish lips','Pale skin','Sweating with chest pain','Cold sweats','Lightheadedness','Fainting on exertion','Leg pain when walking','Calf pain when walking','Varicose veins','Spider veins','Visible neck veins','Throbbing in neck'],
  'Skin, Hair & Nails': ['Rash','Red rash','Itchy rash','Painful rash','Scaly rash','Bullseye rash','Vesicular rash','Itching','Generalized itching','Hives','Welts','Dry skin','Flaky skin','Cracked skin','Acne','Pimples','Whiteheads','Blackheads','Cystic acne','Bruising easily','Unexplained bruising','Petechiae','Purpura','Skin discoloration','Yellow skin','Yellow eyes','Pale skin','Bluish skin','Wound not healing','Slow wound healing','Excessive sweating','Night sweats','Skin lumps','Skin nodules','Skin tags','Moles changing','New mole','Bleeding mole','Asymmetric mole','Warts','Cold sores','Shingles','Eczema flare','Psoriasis flare','Rosacea flare','Heat rash','Diaper rash','Athlete\'s foot','Jock itch','Ringworm','Fungal infection','Boils','Carbuncles','Abscess','Cellulitis','Impetigo','Hair loss','Patchy hair loss','Receding hairline','Brittle hair','Dandruff','Itchy scalp','Oily scalp','Lice','Brittle nails','Yellow nails','White spots on nails','Nail ridges','Nail pitting','Pulled fingernail','Nail fungus','Ingrown nail','Hangnails','Stretch marks','Cellulite'],
  'General / Systemic': ['Fever','Low-grade fever','High fever','Recurrent fever','Chills','Rigors','Fatigue','Persistent fatigue','Weakness','Generalized weakness','Weight loss','Unexplained weight loss','Weight gain','Sudden weight gain','Loss of appetite','Excessive thirst','Excessive hunger','Frequent urination','Night sweats','Hot flashes','Cold intolerance','Heat intolerance','Swollen lymph nodes','Tender lymph nodes','Generalized swelling','Malaise','Feeling unwell','Chronic tiredness','Brain fog','Body aches','Flu-like symptoms','Dehydration','Dry mouth','Thirst','Heat exhaustion symptoms','Hypothermia symptoms','Easy fatigue','Inability to recover from exercise','Frequent infections','Slow recovery from illness','Recurrent infections'],
  'Mental Health & Mood': ['Anxiety','Generalized anxiety','Health anxiety','Social anxiety','Panic attacks','Hyperventilation','Depression','Sad mood','Hopelessness','Suicidal thoughts','Self-harm thoughts','Mood swings','Irritability','Anger outbursts','Sleep problems','Insomnia','Difficulty falling asleep','Difficulty staying asleep','Early morning waking','Excessive sleep','Daytime sleepiness','Nightmares','Stress','Difficulty relaxing','Loss of interest','Loss of motivation','Inability to feel pleasure','Crying spells','Feeling overwhelmed','Feeling numb','Dissociation','Derealization','Depersonalization','Intrusive thoughts','Obsessive thoughts','Compulsive behaviors','Hypervigilance','Flashbacks','Avoidance behavior','Difficulty making decisions','Low self-esteem','Worthlessness','Guilt','Excessive worry','Restlessness','Agitation','Hallucinations','Delusions','Paranoia','Memory loss','Forgetfulness','Difficulty focusing'],
  'Urinary & Kidney': ['Frequent urination','Painful urination','Burning urination','Urgent urination','Difficulty starting urination','Weak urine stream','Dribbling','Inability to urinate','Incomplete bladder emptying','Blood in urine','Cloudy urine','Foamy urine','Dark urine','Strong-smelling urine','Reduced urine output','Bedwetting','Urinary incontinence','Stress incontinence','Urge incontinence','Flank pain','Side pain','Back pain (kidney area)','Pain on urination','Pelvic pain','Lower abdominal pain','Suprapubic pain','Sediment in urine','Kidney stone pain','Difficulty controlling bladder','Recurring UTIs'],
  'Reproductive & Sexual Health (general)': ['Pelvic pain','Lower abdominal pain','Pain during intercourse','Vaginal discharge','Unusual vaginal discharge','Vaginal itching','Vaginal odor','Vaginal dryness','Vaginal bleeding','Heavy menstrual bleeding','Irregular periods','Missed period','Severe menstrual cramps','Spotting between periods','Postmenopausal bleeding','Hot flashes','Breast pain','Breast lump','Nipple discharge','Testicular pain','Testicular swelling','Testicular lump','Erectile difficulties','Low libido','Painful ejaculation','Penile discharge','Penile sores','Genital sores','Genital warts','Genital itching','Pelvic pressure','Pregnancy nausea','Severe pregnancy pain','Reduced fetal movement','Vaginal bleeding in pregnancy'],
  'Endocrine & Metabolic': ['Excessive thirst','Excessive hunger','Frequent urination','Unexplained weight loss','Unexplained weight gain','Cold intolerance','Heat intolerance','Hair thinning','Hair loss','Brittle hair','Skin changes','Dry skin','Sweating excessively','Hot flashes','Night sweats','Fatigue','Mood swings','Tremor','Slow heart rate','Fast heart rate','Hand tremor','Goiter','Neck swelling','Bulging eyes','Voice changes','Menstrual changes','Low libido','Erectile changes','Increased sensitivity to cold','Increased sensitivity to heat','Slowed thinking','Constipation','Difficulty concentrating'],
  'Allergic & Immune': ['Runny nose','Sneezing','Itchy eyes','Watery eyes','Itchy throat','Hives','Swelling of face','Swollen lips','Swollen tongue','Throat closing sensation','Wheezing','Difficulty breathing','Anaphylaxis symptoms','Skin rash after eating','Stomach pain after eating','Diarrhea after eating','Reaction to medication','Reaction to insect sting','Reaction to latex','Reaction to pollen','Reaction to pet dander','Recurrent infections','Slow wound healing','Joint pain (autoimmune)','Butterfly rash on face','Chronic fatigue','Hair loss in patches','Mouth ulcers'],
  'Pediatric / Child-specific': ['High fever in child','Persistent crying','Refusal to feed','Lethargy in child','Poor weight gain','Frequent ear infections','Bedwetting','Tantrums','Speech delay','Walking delay','Excessive drooling','Teething pain','Diaper rash','Cradle cap','Colic','Reflux','Vomiting in infant','Yellowing of newborn','Floppy baby','Stiff neck in child','Bulging soft spot','Excessive sleepiness','Difficulty waking child','Seizure in child','Rapid breathing in child','Grunting breaths','Blue lips in child','Refusal to walk','Limping','Growth concerns','Hyperactivity','Inattention','Behavioral changes'],
  'Senior / Geriatric': ['Memory loss','Confusion','Wandering','Falls','Frequent falls','Difficulty rising from chair','Shuffling gait','Tremor at rest','Trouble swallowing','Loss of appetite','Weight loss','Skin tearing easily','Pressure sores','Bedsores','Incontinence','Difficulty managing medications','Hearing loss','Vision changes','Cataracts symptoms','Glaucoma symptoms','Dental issues','Loose teeth','Loneliness','Social withdrawal','Sleep disturbances','Restless sleep'],
  'Environmental / Exposure': ['Heat exhaustion','Heat stroke','Hypothermia','Frostbite','Sunburn','Insect bite reaction','Tick bite','Bee sting reaction','Snake bite symptoms','Spider bite reaction','Jellyfish sting','Poison ivy rash','Chemical exposure rash','Smoke inhalation','Carbon monoxide symptoms','Mold exposure symptoms','Dust allergy','Air pollution irritation','Altitude sickness','Motion sickness','Seasickness','Jet lag','Travel diarrhea','Foodborne illness','Water-borne illness'],
  'Lifestyle / Substance-related': ['Hangover','Alcohol withdrawal','Caffeine withdrawal','Nicotine withdrawal','Drug withdrawal','Smoking cough','Vaping cough','Sleep deprivation','Excess screen time eye strain','Computer vision syndrome','Text neck','Tech neck','Jet lag','Overtraining','Burnout','Stress eating','Emotional eating','Loss of work-life balance'],
};

export default function SymptomsPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | null>(null);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [duration, setDuration] = useState('today');
  const [severity, setSeverity] = useState('moderate');
  const [medications, setMedications] = useState('');
  const [conditions, setConditions] = useState('');
  const [recentTravel, setRecentTravel] = useState('no');
  const [pregnant, setPregnant] = useState('no');
  const [customSymptoms, setCustomSymptoms] = useState('');
  const [lifestyle, setLifestyle] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');
  const { toast } = useToast();
  const ai = useAIStream({ type: 'symptom-assessment' });

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]);
  };

  const filteredCategories = Object.entries(symptomCategories).reduce((acc, [category, symptoms]) => {
    const filtered = symptoms.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filtered.length > 0) acc[category] = filtered;
    return acc;
  }, {} as Record<string, string[]>);

  const parseUrgency = (text: string): 'low' | 'medium' | 'high' => {
    const lower = text.toLowerCase();
    if (['emergency', 'urgent', 'immediately', 'call 911', 'severe', 'critical', 'life-threatening'].some(k => lower.includes(k))) return 'high';
    if (['soon', 'within 24', 'see a doctor', 'consult', 'moderate', 'concerning'].some(k => lower.includes(k))) return 'medium';
    return 'low';
  };

  const handleAssess = async () => {
    if (selectedSymptoms.length === 0 && !customSymptoms) {
      toast({ title: 'No symptoms selected', description: 'Please select at least one symptom.', variant: 'destructive' });
      return;
    }

    const allSymptoms = [...selectedSymptoms, ...(customSymptoms ? customSymptoms.split(',').map(s => s.trim()) : [])].join(', ');

    const prompt = `I am experiencing the following symptoms: ${allSymptoms}.
${age ? `Age: ${age}` : ''}${gender ? `, Gender: ${gender}` : ''}
Duration: ${duration}
Severity: ${severity}
${medications ? `Current medications: ${medications}` : ''}
${conditions ? `Pre-existing conditions: ${conditions}` : ''}
Recent travel: ${recentTravel}
${pregnant !== 'no' ? `Pregnancy status: ${pregnant}` : ''}
${lifestyle ? `Lifestyle: ${lifestyle}` : ''}
${familyHistory ? `Family history: ${familyHistory}` : ''}
${additionalInfo ? `Additional information: ${additionalInfo}` : ''}

IMPORTANT SAFETY RULES:
- Do NOT prescribe any medications or specific drugs.
- Do NOT diagnose serious conditions definitively.
- For anything that could be serious, clearly state: "Please consult a qualified healthcare provider."

Respond with empathy first (acknowledge their concern), then provide EXACTLY these sections:

## Possible Conditions
List the most likely conditions ranked by likelihood. Briefly explain each.

## Urgency Level
Clearly state: Emergency / Urgent / Non-urgent / Self-care. Explain why.

## Recommended Actions
Include safe home remedies, self-care tips, and lifestyle adjustments all in this section. Do NOT prescribe medicines.

## When to Seek Professional Care
Red flags and warning signs that require immediate professional attention.

## Possible Causes
Explain what might be causing these symptoms (lifestyle, environmental, etc.)`;

    try {
      const result = await ai.stream([{ role: 'user', content: prompt }]);
      if (result) {
        setUrgency(parseUrgency(result));
        const existing = JSON.parse(localStorage.getItem('healthier-reports') || '[]');
        existing.push({ id: `symptoms-${Date.now()}`, type: 'symptoms', title: `Symptom Check: ${allSymptoms.slice(0, 60)}`, date: new Date().toISOString().split('T')[0], summary: `Symptoms: ${allSymptoms}`, details: result });
        localStorage.setItem('healthier-reports', JSON.stringify(existing));
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to get assessment.', variant: 'destructive' });
    }
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setAdditionalInfo('');
    setUrgency(null);
    ai.reset();
  };

  return (
    <div className="relative">
      <ParticleBackground variant="symptoms" />
      <FloatingBackground variant="symptoms" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            icon={<Stethoscope className="h-8 w-8 text-primary-foreground" />}
            title="Symptom Checker"
            description="Select your symptoms for an AI-powered preliminary assessment"
            gradient="from-primary to-secondary"
          />

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ScrollReveal delay={0.1}>
                <div className="bg-card rounded-2xl p-5 border border-border shadow-soft space-y-4 hover:shadow-elevated transition-shadow duration-300">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Patient Info (helps accuracy)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Age</Label><Input type="number" placeholder="30" value={age} onChange={e => setAge(e.target.value)} /></div>
                    <div><Label>Gender</Label><ChipSelect options={['male', 'female', 'other']} value={gender} onChange={setGender} customPlaceholder="Specify..." /></div>
                  </div>
                  <div><Label>How Long Have You Had Symptoms?</Label><ChipSelect options={['today', '2-3 days', '1 week', '2+ weeks', '1+ month', 'recurring']} value={duration} onChange={setDuration} customPlaceholder="Specify duration..." /></div>
                  <div><Label>Severity</Label><ChipSelect options={['mild', 'moderate', 'severe', 'unbearable']} value={severity} onChange={setSeverity} customPlaceholder="Describe severity..." /></div>
                  <div><Label>Current Medications</Label><Input placeholder="Ibuprofen, birth control, etc." value={medications} onChange={e => setMedications(e.target.value)} /></div>
                  <div><Label>Pre-existing Conditions</Label><Input placeholder="Diabetes, asthma, etc." value={conditions} onChange={e => setConditions(e.target.value)} /></div>
                  <div><Label>Lifestyle</Label><Input placeholder="Sedentary, smoker, athlete..." value={lifestyle} onChange={e => setLifestyle(e.target.value)} /></div>
                  <div><Label>Family Medical History</Label><Input placeholder="Heart disease, cancer, diabetes..." value={familyHistory} onChange={e => setFamilyHistory(e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Recent Travel</Label><ChipSelect options={['no', 'domestic', 'international']} value={recentTravel} onChange={setRecentTravel} customPlaceholder="Where..." /></div>
                    <div><Label>Pregnant?</Label><ChipSelect options={['no', 'yes', 'possibly']} value={pregnant} onChange={setPregnant} allowCustom={false} /></div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search symptoms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </ScrollReveal>

              {selectedSymptoms.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>{selectedSymptoms.length} symptom(s) selected</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedSymptoms([])} className="text-muted-foreground">Clear all</Button>
                </div>
              )}

              <ScrollReveal delay={0.2}>
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                  {Object.entries(filteredCategories).map(([category, symptoms]) => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {symptoms.map((symptom) => (
                          <button key={symptom} onClick={() => toggleSymptom(symptom)}
                            className={cn("symptom-chip hover:scale-105 active:scale-95 transition-transform duration-200", selectedSymptoms.includes(symptom) && "selected")}>{symptom}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              <div><Label>Custom Symptoms</Label><Input placeholder="Symptoms not listed above (comma separated)" value={customSymptoms} onChange={e => setCustomSymptoms(e.target.value)} /></div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Additional Information (optional)</label>
                <textarea value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Triggers, what makes it better/worse, time of day, recent diet changes..."
                  className="w-full h-24 px-4 py-3 rounded-xl bg-muted/50 border border-border resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground" />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleAssess} disabled={(selectedSymptoms.length === 0 && !customSymptoms) || ai.isLoading} className="flex-1 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200" size="lg">
                  {ai.isLoading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Analyzing...</> : 'Get Assessment'}
                </Button>
                {ai.response && <Button variant="outline" onClick={handleReset} size="lg" className="hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">Start Over</Button>}
              </div>
            </div>

            <ScrollReveal delay={0.15} direction="right">
              <AIResponseCard
                content={ai.response}
                isLoading={ai.isLoading}
                urgency={urgency}
                icon={<Stethoscope className="h-5 w-5 text-primary" />}
                title="AI Assessment"
                emptyIcon={<Stethoscope className="h-16 w-16" />}
                emptyTitle="Select Your Symptoms"
                emptyDescription='Fill in your info, choose symptoms from the list, and click "Get Assessment" for an AI-powered evaluation.'
              />
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
