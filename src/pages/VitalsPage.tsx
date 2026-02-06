import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Wind, Thermometer, Gauge, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { analyzeVitalSigns, VitalSigns } from '@/services/api';

interface VitalRange {
  min: number;
  max: number;
  unit: string;
  label: string;
}

const vitalRanges: Record<string, VitalRange> = {
  heart_rate: { min: 60, max: 100, unit: 'bpm', label: 'Normal: 60-100 bpm' },
  spo2: { min: 95, max: 100, unit: '%', label: 'Normal: 95-100%' },
  temperature: { min: 97, max: 99, unit: '°F', label: 'Normal: 97-99°F' },
};

export default function VitalsPage() {
  const [vitals, setVitals] = useState<VitalSigns>({
    heart_rate: undefined,
    spo2: undefined,
    temperature: undefined,
    blood_pressure: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

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

    try {
      const result = await analyzeVitalSigns(vitals);
      setAnalysis(result.analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysis('Unable to analyze vitals. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasAnyVital = vitals.heart_rate || vitals.spo2 || vitals.temperature || vitals.blood_pressure;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="icon-container-accent w-16 h-16 mx-auto mb-4">
            <Activity className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Vital Signs Monitoring</h1>
          <p className="text-muted-foreground">
            Enter your vital signs for AI-powered analysis and recommendations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-4">
            {/* Heart Rate */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl p-6 border border-border shadow-soft"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-container w-10 h-10 bg-destructive/10">
                  <Heart className="h-5 w-5 text-destructive animate-heartbeat" />
                </div>
                <div>
                  <Label className="text-base font-semibold">Heart Rate</Label>
                  <p className="text-xs text-muted-foreground">
                    {vitalRanges.heart_rate.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  placeholder="72"
                  value={vitals.heart_rate || ''}
                  onChange={(e) => setVitals({ ...vitals, heart_rate: e.target.value ? Number(e.target.value) : undefined })}
                  className="text-lg"
                />
                <span className={`font-medium ${getStatusColor(getVitalStatus('heart_rate', vitals.heart_rate))}`}>
                  bpm
                </span>
              </div>
            </motion.div>

            {/* SpO2 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl p-6 border border-border shadow-soft"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-container w-10 h-10 bg-primary/10">
                  <Wind className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label className="text-base font-semibold">Oxygen Saturation (SpO2)</Label>
                  <p className="text-xs text-muted-foreground">
                    {vitalRanges.spo2.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  placeholder="98"
                  value={vitals.spo2 || ''}
                  onChange={(e) => setVitals({ ...vitals, spo2: e.target.value ? Number(e.target.value) : undefined })}
                  className="text-lg"
                />
                <span className={`font-medium ${getStatusColor(getVitalStatus('spo2', vitals.spo2))}`}>
                  %
                </span>
              </div>
            </motion.div>

            {/* Temperature */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl p-6 border border-border shadow-soft"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-container w-10 h-10 bg-warning/10">
                  <Thermometer className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <Label className="text-base font-semibold">Temperature</Label>
                  <p className="text-xs text-muted-foreground">
                    {vitalRanges.temperature.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="98.6"
                  value={vitals.temperature || ''}
                  onChange={(e) => setVitals({ ...vitals, temperature: e.target.value ? Number(e.target.value) : undefined })}
                  className="text-lg"
                />
                <span className={`font-medium ${getStatusColor(getVitalStatus('temperature', vitals.temperature))}`}>
                  °F
                </span>
              </div>
            </motion.div>

            {/* Blood Pressure */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-2xl p-6 border border-border shadow-soft"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-container w-10 h-10 bg-success/10">
                  <Gauge className="h-5 w-5 text-success" />
                </div>
                <div>
                  <Label className="text-base font-semibold">Blood Pressure</Label>
                  <p className="text-xs text-muted-foreground">
                    Normal: 120/80 mmHg
                  </p>
                </div>
              </div>
              <Input
                type="text"
                placeholder="120/80"
                value={vitals.blood_pressure}
                onChange={(e) => setVitals({ ...vitals, blood_pressure: e.target.value })}
                className="text-lg"
              />
            </motion.div>

            <Button
              onClick={handleSubmit}
              disabled={!hasAnyVital || isLoading}
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
                  <Activity className="mr-2 h-4 w-4" />
                  Analyze Vitals
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {/* Quick Summary */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
              <h3 className="font-semibold mb-4">Quick Summary</h3>
              <div className="space-y-3">
                {[
                  { key: 'heart_rate', label: 'Heart Rate', value: vitals.heart_rate, unit: 'bpm' },
                  { key: 'spo2', label: 'SpO2', value: vitals.spo2, unit: '%' },
                  { key: 'temperature', label: 'Temperature', value: vitals.temperature, unit: '°F' },
                ].map(({ key, label, value, unit }) => {
                  const status = getVitalStatus(key, value);
                  return (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={`font-semibold ${getStatusColor(status)}`}>
                        {value !== undefined ? `${value} ${unit}` : '-'}
                      </span>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Blood Pressure</span>
                  <span className="font-semibold">
                    {vitals.blood_pressure || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Analysis Results */}
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-soft"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold text-lg">AI Analysis</h3>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {analysis}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Warning */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                If any vital signs are significantly outside normal ranges or you feel unwell, 
                please consult a healthcare professional immediately.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
