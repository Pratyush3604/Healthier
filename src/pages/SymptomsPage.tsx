import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Stethoscope, Plus, X, Send, AlertTriangle, 
  CheckCircle, AlertCircle, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getSymptomAssessment, parseUrgencyLevel } from '@/services/api';

const commonSymptoms = [
  'Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea',
  'Dizziness', 'Chest pain', 'Shortness of breath', 'Sore throat',
  'Body aches', 'Runny nose', 'Stomach pain', 'Back pain', 'Joint pain'
];

export default function SymptomsPage() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | null>(null);

  const addSymptom = (symptom: string) => {
    if (!symptoms.includes(symptom)) {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !symptoms.includes(customSymptom.trim())) {
      setSymptoms([...symptoms, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  const handleSubmit = async () => {
    if (symptoms.length === 0) return;

    setIsLoading(true);
    setAssessment(null);
    setUrgency(null);

    try {
      const result = await getSymptomAssessment(symptoms, additionalInfo);
      setAssessment(result.assessment);
      setUrgency(parseUrgencyLevel(result.assessment));
    } catch (error) {
      console.error('Assessment error:', error);
      setAssessment('Unable to get assessment. Please check your connection and try again.');
      setUrgency(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyStyles = () => {
    switch (urgency) {
      case 'high':
        return 'urgency-high';
      case 'medium':
        return 'urgency-medium';
      case 'low':
        return 'urgency-low';
      default:
        return 'bg-card border border-border';
    }
  };

  const getUrgencyIcon = () => {
    switch (urgency) {
      case 'high':
        return <AlertTriangle className="h-6 w-6" />;
      case 'medium':
        return <AlertCircle className="h-6 w-6" />;
      case 'low':
        return <CheckCircle className="h-6 w-6" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="icon-container w-16 h-16 mx-auto mb-4">
            <Stethoscope className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Symptom Assessment</h1>
          <p className="text-muted-foreground">
            Select your symptoms and get an AI-powered health assessment
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Symptom Selection */}
          <div className="space-y-6">
            {/* Common Symptoms */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
              <h3 className="font-semibold mb-4">Common Symptoms</h3>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map((symptom) => {
                  const isSelected = symptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      onClick={() => isSelected ? removeSymptom(symptom) : addSymptom(symptom)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-glow'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {isSelected && <span className="mr-1">✓</span>}
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Symptom */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
              <h3 className="font-semibold mb-4">Add Custom Symptom</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a symptom..."
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomSymptom()}
                />
                <Button onClick={addCustomSymptom} size="icon" variant="secondary">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
              <h3 className="font-semibold mb-4">Additional Information</h3>
              <Textarea
                placeholder="Age, medical history, when symptoms started, etc..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Selected Symptoms & Results */}
          <div className="space-y-6">
            {/* Selected Symptoms */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
              <h3 className="font-semibold mb-4">
                Selected Symptoms ({symptoms.length})
              </h3>
              {symptoms.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No symptoms selected. Click on symptoms above to add them.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 mb-4">
                  {symptoms.map((symptom) => (
                    <motion.span
                      key={symptom}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                    >
                      {symptom}
                      <button
                        onClick={() => removeSymptom(symptom)}
                        className="hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={symptoms.length === 0 || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Get Assessment
                  </>
                )}
              </Button>
            </div>

            {/* Assessment Results */}
            {assessment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-6 ${getUrgencyStyles()}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {getUrgencyIcon()}
                  <h3 className="font-semibold text-lg">Assessment Results</h3>
                  {urgency && (
                    <span className="ml-auto text-sm font-medium uppercase">
                      {urgency} Urgency
                    </span>
                  )}
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {assessment}
                  </p>
                </div>

                {urgency === 'high' && (
                  <div className="mt-4 p-4 bg-background/50 rounded-xl">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      🚨 Please contact a healthcare professional or emergency services immediately.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
