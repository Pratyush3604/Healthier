import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Wind, Thermometer, Gauge, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { FloatingBackground } from '@/components/FloatingBackground';
import { ScrollReveal } from '@/components/ScrollReveal';

interface VitalSigns {
  heart_rate?: number;
  spo2?: number;
  temperature?: number;
  blood_pressure: string;
}

const vitalRanges: Record<string, { min: number; max: number; label: string }> = {
  heart_rate: { min: 60, max: 100, label: 'Normal: 60-100 bpm' },
  spo2: { min: 95, max: 100, label: 'Normal: 95-100%' },
  temperature: { min: 97, max: 99, label: 'Normal: 97-99°F' },
};

export default function VitalsPage() {
  const [vitals, setVitals] = useState<VitalSigns>({ heart_rate: undefined, spo2: undefined, temperature: undefined, blood_pressure: '' });
  const [age, setAge] = useState('');
  const [conditions, setConditions] = useState('');
  const [medications, setMedications] = useState('');
  const [recentActivity, setRecentActivity] = useState('');
  const { toast } = useToast();
  const ai = useAIStream({ type: 'vitals-analysis' });

  const getVitalStatus = (key: string, value: number | undefined) => {
    if (value === undefined) return 'neutral';
    const range = vitalRanges[key];
    if (!range) return 'neutral';
    if (value < range.min) return 'low';
    if (value > range.max) return 'high';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-success';
      case 'low': return 'text-warning';
      case 'high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const handleSubmit = async () => {
    const prompt = `Analyze these vital signs:
- Heart Rate: ${vitals.heart_rate || 'Not provided'} bpm
- SpO2: ${vitals.spo2 || 'Not provided'}%
- Temperature: ${vitals.temperature || 'Not provided'}°F
- Blood Pressure: ${vitals.blood_pressure || 'Not provided'}
${age ? `- Age: ${age}` : ''}
${conditions ? `- Pre-existing conditions: ${conditions}` : ''}
${medications ? `- Current medications: ${medications}` : ''}
${recentActivity ? `- Recent activity: ${recentActivity}` : ''}

IMPORTANT: Do NOT prescribe medications. Only provide lifestyle and self-care suggestions.

Start with empathy, then provide EXACTLY these sections:

## Possible Conditions
What these vital signs might indicate.

## Urgency Level
Emergency / Urgent / Non-urgent / Self-care with explanation.

## Recommended Actions
Safe home remedies and lifestyle adjustments. Do NOT prescribe medicines.

## When to Seek Professional Care
Clear warning signs requiring medical attention.

## Possible Causes
Lifestyle or environmental factors that could explain these readings.`;

    try {
      const result = await ai.stream([{ role: 'user', content: prompt }]);
      if (result) {
        const existing = JSON.parse(localStorage.getItem('healthier-reports') || '[]');
        existing.push({ id: `vitals-${Date.now()}`, type: 'vitals', title: 'Vital Signs Analysis', date: new Date().toISOString().split('T')[0], summary: `HR: ${vitals.heart_rate || '-'}, SpO2: ${vitals.spo2 || '-'}, Temp: ${vitals.temperature || '-'}, BP: ${vitals.blood_pressure || '-'}`, details: result });
        localStorage.setItem('healthier-reports', JSON.stringify(existing));
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to analyze vitals.', variant: 'destructive' });
    }
  };

  const hasAnyVital = vitals.heart_rate || vitals.spo2 || vitals.temperature || vitals.blood_pressure;

  return (
    <div className="relative">
      <FloatingBackground variant="vitals" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="icon-container-accent w-16 h-16 mx-auto mb-4"><Activity className="h-8 w-8" /></div>
            <h1 className="font-display text-3xl font-bold mb-2">Vital Signs Monitoring</h1>
            <p className="text-muted-foreground">Enter your vital signs for AI-powered analysis and recommendations</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[
                { key: 'heart_rate', icon: Heart, label: 'Heart Rate', placeholder: '72', iconClass: 'text-destructive animate-heartbeat', bgClass: 'bg-destructive/10' },
                { key: 'spo2', icon: Wind, label: 'Oxygen Saturation (SpO2)', placeholder: '98', iconClass: 'text-primary', bgClass: 'bg-primary/10' },
                { key: 'temperature', icon: Thermometer, label: 'Temperature', placeholder: '98.6', iconClass: 'text-warning', bgClass: 'bg-warning/10' },
              ].map(({ key, icon: Icon, label, placeholder, iconClass, bgClass }, i) => (
                <ScrollReveal key={key} delay={i * 0.1}>
                  <div className="bg-card rounded-2xl p-6 border border-border shadow-soft hover:shadow-elevated transition-shadow duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`icon-container w-10 h-10 ${bgClass}`}><Icon className={`h-5 w-5 ${iconClass}`} /></div>
                      <div>
                        <Label className="text-base font-semibold">{label}</Label>
                        <p className="text-xs text-muted-foreground">{vitalRanges[key].label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input type="number" step={key === 'temperature' ? '0.1' : undefined} placeholder={placeholder}
                        value={(vitals as any)[key] || ''}
                        onChange={(e) => setVitals({ ...vitals, [key]: e.target.value ? Number(e.target.value) : undefined })}
                        className="text-lg" />
                      <span className={`font-medium ${getStatusColor(getVitalStatus(key, (vitals as any)[key]))}`}>
                        {key === 'heart_rate' ? 'bpm' : key === 'spo2' ? '%' : '°F'}
                      </span>
                    </div>
                  </div>
                </ScrollReveal>
              ))}

              <ScrollReveal delay={0.3}>
                <div className="bg-card rounded-2xl p-6 border border-border shadow-soft hover:shadow-elevated transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="icon-container w-10 h-10 bg-success/10"><Gauge className="h-5 w-5 text-success" /></div>
                    <div><Label className="text-base font-semibold">Blood Pressure</Label><p className="text-xs text-muted-foreground">Normal: 120/80 mmHg</p></div>
                  </div>
                  <Input type="text" placeholder="120/80" value={vitals.blood_pressure} onChange={(e) => setVitals({ ...vitals, blood_pressure: e.target.value })} className="text-lg" />
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.35}>
                <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4 hover:shadow-elevated transition-shadow duration-300">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Additional Context</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Age</Label><Input type="number" placeholder="30" value={age} onChange={e => setAge(e.target.value)} /></div>
                    <div><Label>Recent Activity</Label><Input placeholder="Just exercised, resting..." value={recentActivity} onChange={e => setRecentActivity(e.target.value)} /></div>
                  </div>
                  <div><Label>Pre-existing Conditions</Label><Input placeholder="Hypertension, diabetes..." value={conditions} onChange={e => setConditions(e.target.value)} /></div>
                  <div><Label>Current Medications</Label><Input placeholder="Beta blockers, insulin..." value={medications} onChange={e => setMedications(e.target.value)} /></div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.4}>
                <Button onClick={handleSubmit} disabled={!hasAnyVital || ai.isLoading} className="w-full hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200" size="lg">
                  {ai.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Activity className="mr-2 h-4 w-4" />Analyze Vitals</>}
                </Button>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.15} direction="right">
              <div className="space-y-4">
                <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                  <h3 className="font-semibold mb-4">Quick Summary</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'heart_rate', label: 'Heart Rate', value: vitals.heart_rate, unit: 'bpm' },
                      { key: 'spo2', label: 'SpO2', value: vitals.spo2, unit: '%' },
                      { key: 'temperature', label: 'Temperature', value: vitals.temperature, unit: '°F' },
                    ].map(({ key, label, value, unit }) => (
                      <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="text-muted-foreground">{label}</span>
                        <span className={`font-semibold ${getStatusColor(getVitalStatus(key, value))}`}>
                          {value !== undefined ? `${value} ${unit}` : '-'}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground">Blood Pressure</span>
                      <span className="font-semibold">{vitals.blood_pressure || '-'}</span>
                    </div>
                  </div>
                </div>

                <AIResponseCard
                  content={ai.response}
                  isLoading={ai.isLoading}
                  icon={<Activity className="h-5 w-5 text-primary" />}
                  title="AI Analysis"
                  emptyIcon={<Activity className="h-16 w-16" />}
                  emptyTitle="Enter Your Vitals"
                  emptyDescription="Fill in your vital signs and click Analyze for an AI assessment"
                  showDisclaimer={false}
                />

                <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">If any vital signs are significantly outside normal ranges or you feel unwell, please consult a healthcare professional immediately.</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
