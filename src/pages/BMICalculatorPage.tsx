import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Droplets, Flame, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BMIResult {
  bmi: number;
  category: string;
  color: string;
  water: number;
  calories: number;
}

export default function BMICalculatorPage() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activity, setActivity] = useState('moderate');
  const [result, setResult] = useState<BMIResult | null>(null);

  const activities = [
    { key: 'sedentary', label: 'Sedentary', factor: 1.2 },
    { key: 'light', label: 'Light', factor: 1.375 },
    { key: 'moderate', label: 'Moderate', factor: 1.55 },
    { key: 'active', label: 'Active', factor: 1.725 },
    { key: 'very-active', label: 'Very Active', factor: 1.9 },
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

    setResult({ bmi: Math.round(bmi * 10) / 10, category, color, water, calories });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500">
            <Calculator className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Health Calculator</h1>
          <p className="text-muted-foreground">BMI, daily calories, and water intake calculator</p>
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
              <div className="flex flex-wrap gap-2 mt-2">
                {activities.map(a => (
                  <button key={a.key} onClick={() => setActivity(a.key)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${activity === a.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {a.label}
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card rounded-2xl p-6 text-center">
                    <Flame className="h-8 w-8 text-warning mx-auto mb-2" />
                    <p className="text-2xl font-bold">{result.calories}</p>
                    <p className="text-sm text-muted-foreground">Daily Calories</p>
                  </div>
                  <div className="glass-card rounded-2xl p-6 text-center">
                    <Droplets className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{result.water}L</p>
                    <p className="text-sm text-muted-foreground">Daily Water</p>
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
          </div>
        </div>
      </motion.div>
    </div>
  );
}
