import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Wind, Thermometer, Gauge, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface VitalSigns {
  heart_rate?: number;
  spo2?: number;
  temperature?: number;
  blood_pressure: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

const vitalRanges: Record<string, { min: number; max: number; label: string }> = {
  heart_rate: { min: 60, max: 100, label: 'Normal: 60-100 bpm' },
  spo2: { min: 95, max: 100, label: 'Normal: 95-100%' },
  temperature: { min: 97, max: 99, label: 'Normal: 97-99°F' },
};

export default function VitalsPage() {
  const [vitals, setVitals] = useState<VitalSigns>({ heart_rate: undefined, spo2: undefined, temperature: undefined, blood_pressure: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const { toast } = useToast();

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
    setIsLoading(true);
    setAnalysis(null);

    const prompt = `Please analyze these vital signs:\n- Heart Rate: ${vitals.heart_rate || 'Not provided'} bpm\n- SpO2: ${vitals.spo2 || 'Not provided'}%\n- Temperature: ${vitals.temperature || 'Not provided'}°F\n- Blood Pressure: ${vitals.blood_pressure || 'Not provided'}`;

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          type: 'vitals-analysis',
        }),
      });

      if (response.status === 429) {
        toast({ title: 'Rate Limited', description: 'Please wait a moment and try again.', variant: 'destructive' });
        return;
      }
      if (!response.ok || !response.body) throw new Error('Failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ') || line.trim() === '') continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) { fullContent += content; setAnalysis(fullContent); }
          } catch { buffer = line + '\n' + buffer; break; }
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({ title: 'Error', description: 'Failed to analyze vitals.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const hasAnyVital = vitals.heart_rate || vitals.spo2 || vitals.temperature || vitals.blood_pressure;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
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
              <motion.div key={key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (i + 1) * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-soft">
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
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="bg-card rounded-2xl p-6 border border-border shadow-soft">
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-container w-10 h-10 bg-success/10"><Gauge className="h-5 w-5 text-success" /></div>
                <div><Label className="text-base font-semibold">Blood Pressure</Label><p className="text-xs text-muted-foreground">Normal: 120/80 mmHg</p></div>
              </div>
              <Input type="text" placeholder="120/80" value={vitals.blood_pressure} onChange={(e) => setVitals({ ...vitals, blood_pressure: e.target.value })} className="text-lg" />
            </motion.div>

            <Button onClick={handleSubmit} disabled={!hasAnyVital || isLoading} className="w-full" size="lg">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Activity className="mr-2 h-4 w-4" />Analyze Vitals</>}
            </Button>
          </div>

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

            {analysis && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                <div className="flex items-center gap-3 mb-4"><Activity className="h-6 w-6 text-primary" /><h3 className="font-semibold text-lg">AI Analysis</h3></div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{analysis}</p>
              </motion.div>
            )}

            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">If any vital signs are significantly outside normal ranges or you feel unwell, please consult a healthcare professional immediately.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
