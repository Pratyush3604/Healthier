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
import { ScrollReveal } from '@/components/ScrollReveal';

const symptomCategories = {
  'Head & Neurological': ['Headache', 'Migraine', 'Dizziness', 'Vertigo', 'Confusion', 'Memory problems', 'Difficulty concentrating', 'Blurred vision', 'Double vision', 'Light sensitivity', 'Ringing in ears', 'Numbness in face', 'Fainting', 'Seizures'],
  'Respiratory': ['Cough', 'Dry cough', 'Wet cough', 'Shortness of breath', 'Wheezing', 'Chest tightness', 'Rapid breathing', 'Difficulty breathing', 'Runny nose', 'Stuffy nose', 'Sneezing', 'Sore throat', 'Hoarse voice', 'Coughing up blood'],
  'Digestive': ['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Stomach pain', 'Bloating', 'Heartburn', 'Acid reflux', 'Loss of appetite', 'Excessive hunger', 'Difficulty swallowing', 'Blood in stool', 'Black stool', 'Abdominal cramps'],
  'Musculoskeletal': ['Back pain', 'Lower back pain', 'Upper back pain', 'Neck pain', 'Joint pain', 'Muscle aches', 'Muscle weakness', 'Stiffness', 'Swollen joints', 'Leg cramps', 'Arm pain', 'Shoulder pain', 'Hip pain', 'Knee pain'],
  'Cardiovascular': ['Chest pain', 'Heart palpitations', 'Rapid heartbeat', 'Slow heartbeat', 'Irregular heartbeat', 'High blood pressure symptoms', 'Low blood pressure symptoms', 'Swollen legs', 'Swollen ankles', 'Cold hands and feet', 'Bluish skin'],
  'Skin': ['Rash', 'Itching', 'Hives', 'Dry skin', 'Acne', 'Bruising easily', 'Skin discoloration', 'Wound not healing', 'Excessive sweating', 'Night sweats', 'Skin lumps', 'Moles changing'],
  'General': ['Fever', 'Chills', 'Fatigue', 'Weakness', 'Weight loss', 'Weight gain', 'Loss of appetite', 'Excessive thirst', 'Frequent urination', 'Night sweats', 'Swollen lymph nodes', 'Malaise'],
  'Mental Health': ['Anxiety', 'Depression', 'Mood swings', 'Irritability', 'Sleep problems', 'Insomnia', 'Excessive sleep', 'Panic attacks', 'Stress', 'Difficulty relaxing', 'Loss of interest'],
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
