import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Droplets, Flame, ArrowRight, TrendingUp, Scale, Target, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface BMIResult {
  bmi: number;
  category: string;
  color: string;
  water: number;
  calories: number;
  idealWeightLow: number;
  idealWeightHigh: number;
  bodyFatEstimate: string;
}

interface BMIHistory {
  date: string;
  bmi: number;
  weight: number;
  category: string;
}

export default function BMICalculatorPage() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activity, setActivity] = useState('moderate');
  const [result, setResult] = useState<BMIResult | null>(null);
  const [bmiStorage, setBmiStorage] = useLocalStorage<{ bmi: string }>('healtify-bmi', { bmi: '--' });
  const [history, setHistory] = useLocalStorage<BMIHistory[]>('healtify-bmi-history', []);

  const activities = [
    { key: 'sedentary', label: 'Sedentary', factor: 1.2, desc: 'Desk job, no exercise' },
    { key: 'light', label: 'Light', factor: 1.375, desc: '1-3 days/week' },
    { key: 'moderate', label: 'Moderate', factor: 1.55, desc: '3-5 days/week' },
    { key: 'active', label: 'Active', factor: 1.725, desc: '6-7 days/week' },
    { key: 'very-active', label: 'Very Active', factor: 1.9, desc: 'Athlete/physical job' },
  ];

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    const a = parseInt(age);
    if (!w || !h || !a) return;

    const bmi = w / (h * h);
    let category = '', color = '';
    if (bmi < 18.5) { category = 'Underweight'; color = 'text-warning'; }
    else if (bmi < 25) { category = 'Normal'; color = 'text-success'; }
    else if (bmi < 30) { category = 'Overweight'; color = 'text-warning'; }
    else { category = 'Obese'; color = 'text-destructive'; }

    const bmr = gender === 'male'
      ? 10 * w + 6.25 * parseFloat(height) - 5 * a + 5
      : 10 * w + 6.25 * parseFloat(height) - 5 * a - 161;

    const actFactor = activities.find(a => a.key === activity)?.factor || 1.55;
    const calories = Math.round(bmr * actFactor);
    const water = Math.round(w * 0.033 * 10) / 10;
    const idealWeightLow = Math.round(18.5 * h * h * 10) / 10;
    const idealWeightHigh = Math.round(24.9 * h * h * 10) / 10;

    // Body fat estimate (Navy method approximation)
    const bodyFatEstimate = gender === 'male'
      ? bmi < 18.5 ? '8-12%' : bmi < 25 ? '13-20%' : bmi < 30 ? '21-28%' : '28%+'
      : bmi < 18.5 ? '15-20%' : bmi < 25 ? '21-28%' : bmi < 30 ? '29-35%' : '35%+';

    const res = { bmi: Math.round(bmi * 10) / 10, category, color, water, calories, idealWeightLow, idealWeightHigh, bodyFatEstimate };
    setResult(res);

    // Persist to localStorage
    setBmiStorage({ bmi: String(res.bmi) });
    setHistory(prev => [
      { date: new Date().toISOString().split('T')[0], bmi: res.bmi, weight: w, category },
      ...prev.slice(0, 19),
    ]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500">
            <Calculator className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Health Calculator</h1>
          <p className="text-muted-foreground">BMI, daily calories, water intake & ideal weight range</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Weight (kg)</Label><Input type="number" placeholder="70" value={weight} onChange={e => setWeight(e.target.value)} /></div>
              <div><Label>Height (cm)</Label><Input type="number" placeholder="175" value={height} onChange={e => setHeight(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Age</Label><Input type="number" placeholder="25" value={age} onChange={e => setAge(e.target.value)} /></div>
              <div>
                <Label>Gender</Label>
                <div className="flex gap-2 mt-1.5">
                  {(['male', 'female'] as const).map(g => (
                    <button key={g} onClick={() => setGender(g)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${gender === g ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Label>Activity Level</Label>
              <div className="space-y-2 mt-2">
                {activities.map(a => (
                  <button key={a.key} onClick={() => setActivity(a.key)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activity === a.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                    <span>{a.label}</span>
                    <span className={`text-xs ${activity === a.key ? 'opacity-80' : 'opacity-50'}`}>{a.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={calculate} className="w-full" size="lg">
              <Calculator className="mr-2 h-4 w-4" />Calculate
            </Button>
          </div>

          <div className="space-y-4">
            {result ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="glass-card rounded-2xl p-8 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Your BMI</p>
                  <p className={`text-6xl font-bold ${result.color}`}>{result.bmi}</p>
                  <p className={`text-lg font-semibold mt-2 ${result.color}`}>{result.category}</p>
                  {/* BMI Scale */}
                  <div className="mt-6 relative h-3 rounded-full overflow-hidden bg-muted">
                    <div className="absolute inset-0 flex">
                      <div className="h-full bg-blue-400" style={{ width: '18.5%' }} />
                      <div className="h-full bg-green-500" style={{ width: '31.5%' }} />
                      <div className="h-full bg-yellow-500" style={{ width: '25%' }} />
                      <div className="h-full bg-red-500" style={{ width: '25%' }} />
                    </div>
                    <div className="absolute top-0 h-full w-1 bg-foreground rounded-full transition-all" style={{ left: `${Math.min(Math.max((result.bmi / 40) * 100, 2), 98)}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Under</span><span>Normal</span><span>Over</span><span>Obese</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card rounded-2xl p-5 text-center">
                    <Flame className="h-7 w-7 text-warning mx-auto mb-2" />
                    <p className="text-2xl font-bold">{result.calories}</p>
                    <p className="text-sm text-muted-foreground">Daily Calories</p>
                  </div>
                  <div className="glass-card rounded-2xl p-5 text-center">
                    <Droplets className="h-7 w-7 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{result.water}L</p>
                    <p className="text-sm text-muted-foreground">Daily Water</p>
                  </div>
                  <div className="glass-card rounded-2xl p-5 text-center">
                    <Scale className="h-7 w-7 text-success mx-auto mb-2" />
                    <p className="text-lg font-bold">{result.idealWeightLow}-{result.idealWeightHigh}</p>
                    <p className="text-sm text-muted-foreground">Ideal Weight (kg)</p>
                  </div>
                  <div className="glass-card rounded-2xl p-5 text-center">
                    <Activity className="h-7 w-7 text-accent mx-auto mb-2" />
                    <p className="text-2xl font-bold">{result.bodyFatEstimate}</p>
                    <p className="text-sm text-muted-foreground">Est. Body Fat</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card rounded-2xl p-12 text-center">
                <Calculator className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Enter Your Details</h3>
                <p className="text-muted-foreground">Fill in the form to calculate BMI, calorie needs, and water intake</p>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="bg-card rounded-2xl p-5 border border-border">
                <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> BMI History</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 text-sm">
                      <span className="text-muted-foreground">{h.date}</span>
                      <span className="font-medium">{h.weight}kg → BMI {h.bmi}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${h.category === 'Normal' ? 'bg-success/15 text-success' : h.category === 'Underweight' || h.category === 'Overweight' ? 'bg-warning/15 text-warning' : 'bg-destructive/15 text-destructive'}`}>
                        {h.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
