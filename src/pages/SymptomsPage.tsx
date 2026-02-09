import { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Search, AlertTriangle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const symptomCategories = {
  'Head & Neurological': [
    'Headache', 'Migraine', 'Dizziness', 'Vertigo', 'Confusion', 'Memory problems',
    'Difficulty concentrating', 'Blurred vision', 'Double vision', 'Light sensitivity',
    'Ringing in ears', 'Numbness in face', 'Fainting', 'Seizures'
  ],
  'Respiratory': [
    'Cough', 'Dry cough', 'Wet cough', 'Shortness of breath', 'Wheezing', 'Chest tightness',
    'Rapid breathing', 'Difficulty breathing', 'Runny nose', 'Stuffy nose', 'Sneezing',
    'Sore throat', 'Hoarse voice', 'Coughing up blood'
  ],
  'Digestive': [
    'Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Stomach pain', 'Bloating',
    'Heartburn', 'Acid reflux', 'Loss of appetite', 'Excessive hunger', 'Difficulty swallowing',
    'Blood in stool', 'Black stool', 'Abdominal cramps'
  ],
  'Musculoskeletal': [
    'Back pain', 'Lower back pain', 'Upper back pain', 'Neck pain', 'Joint pain',
    'Muscle aches', 'Muscle weakness', 'Stiffness', 'Swollen joints', 'Leg cramps',
    'Arm pain', 'Shoulder pain', 'Hip pain', 'Knee pain'
  ],
  'Cardiovascular': [
    'Chest pain', 'Heart palpitations', 'Rapid heartbeat', 'Slow heartbeat', 'Irregular heartbeat',
    'High blood pressure symptoms', 'Low blood pressure symptoms', 'Swollen legs', 'Swollen ankles',
    'Cold hands and feet', 'Bluish skin'
  ],
  'Skin': [
    'Rash', 'Itching', 'Hives', 'Dry skin', 'Acne', 'Bruising easily', 'Skin discoloration',
    'Wound not healing', 'Excessive sweating', 'Night sweats', 'Skin lumps', 'Moles changing'
  ],
  'General': [
    'Fever', 'Chills', 'Fatigue', 'Weakness', 'Weight loss', 'Weight gain', 'Loss of appetite',
    'Excessive thirst', 'Frequent urination', 'Night sweats', 'Swollen lymph nodes', 'Malaise'
  ],
  'Mental Health': [
    'Anxiety', 'Depression', 'Mood swings', 'Irritability', 'Sleep problems', 'Insomnia',
    'Excessive sleep', 'Panic attacks', 'Stress', 'Difficulty relaxing', 'Loss of interest'
  ],
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

export default function SymptomsPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [assessment, setAssessment] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const filteredCategories = Object.entries(symptomCategories).reduce((acc, [category, symptoms]) => {
    const filtered = symptoms.filter(s => 
      s.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, string[]>);

  const parseUrgency = (text: string): 'low' | 'medium' | 'high' => {
    const lowerText = text.toLowerCase();
    const highKeywords = ['emergency', 'urgent', 'immediately', 'call 911', 'severe', 'critical', 'life-threatening'];
    const mediumKeywords = ['soon', 'within 24', 'see a doctor', 'consult', 'moderate', 'concerning'];
    
    if (highKeywords.some(k => lowerText.includes(k))) return 'high';
    if (mediumKeywords.some(k => lowerText.includes(k))) return 'medium';
    return 'low';
  };

  const handleAssess = async () => {
    if (selectedSymptoms.length === 0) {
      toast({ title: 'No symptoms selected', description: 'Please select at least one symptom.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setAssessment(null);
    
    const prompt = `I am experiencing the following symptoms: ${selectedSymptoms.join(', ')}. ${additionalInfo ? `Additional information: ${additionalInfo}` : ''}`;

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          type: 'symptom-assessment',
        }),
      });

      if (!response.ok || !response.body) throw new Error('Failed to get assessment');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '' || !line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              setAssessment(fullContent);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      setUrgency(parseUrgency(fullContent));
    } catch (error) {
      console.error('Assessment error:', error);
      toast({ title: 'Error', description: 'Failed to get assessment. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500">
            <Stethoscope className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Symptom Checker</h1>
            <p className="text-muted-foreground">
              Select your symptoms for an AI-powered preliminary assessment
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Symptom Selection */}
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>

            {/* Selected count */}
            {selectedSymptoms.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>{selectedSymptoms.length} symptom(s) selected</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSymptoms([])}
                  className="text-muted-foreground"
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Symptom Categories */}
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
              {Object.entries(filteredCategories).map(([category, symptoms]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {symptoms.map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => toggleSymptom(symptom)}
                        className={cn(
                          "symptom-chip",
                          selectedSymptoms.includes(symptom) && "selected"
                        )}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Additional Information (optional)
              </label>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Duration, severity, when symptoms started, medications..."
                className="w-full h-24 px-4 py-3 rounded-xl bg-white/5 border border-white/10 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Assess Button */}
            <Button
              onClick={handleAssess}
              disabled={selectedSymptoms.length === 0 || isLoading}
              className="w-full btn-primary text-lg py-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Get Assessment'
              )}
            </Button>
          </div>

          {/* Assessment Results */}
          <div className="space-y-4">
            {assessment ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Urgency Badge */}
                {urgency && (
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-xl",
                    urgency === 'high' && "bg-destructive/10 border border-destructive/30",
                    urgency === 'medium' && "bg-warning/10 border border-warning/30",
                    urgency === 'low' && "bg-success/10 border border-success/30"
                  )}>
                    {urgency === 'high' && <AlertTriangle className="h-5 w-5 text-destructive" />}
                    {urgency === 'medium' && <Clock className="h-5 w-5 text-warning" />}
                    {urgency === 'low' && <CheckCircle className="h-5 w-5 text-success" />}
                    <span className={cn(
                      "font-semibold",
                      urgency === 'high' && "text-destructive",
                      urgency === 'medium' && "text-warning",
                      urgency === 'low' && "text-success"
                    )}>
                      {urgency === 'high' && 'High Urgency - Seek immediate medical attention'}
                      {urgency === 'medium' && 'Medium Urgency - See a doctor soon'}
                      {urgency === 'low' && 'Low Urgency - Monitor and home care may help'}
                    </span>
                  </div>
                )}

                {/* Assessment Content */}
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-semibold text-lg mb-4">AI Assessment</h3>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                      {assessment}
                    </p>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <p className="text-sm text-warning/80">
                    This is a preliminary AI assessment and not a medical diagnosis. 
                    Always consult a healthcare professional for proper evaluation.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card rounded-2xl p-12 text-center">
                <Stethoscope className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select Your Symptoms</h3>
                <p className="text-muted-foreground">
                  Choose symptoms from the list and click "Get Assessment" to receive 
                  an AI-powered preliminary evaluation.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
