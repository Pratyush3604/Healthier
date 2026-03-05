import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus, Minus, RotateCcw, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function WaterTrackerPage() {
  const [goal, setGoal] = useState(2500);
  const [intake, setIntake] = useState(0);
  const [customAmount, setCustomAmount] = useState('250');
  const [log, setLog] = useState<{ time: string; amount: number }[]>([]);
  const { toast } = useToast();

  const percentage = Math.min((intake / goal) * 100, 100);

  const addWater = (amount: number) => {
    setIntake(prev => prev + amount);
    setLog(prev => [{ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), amount }, ...prev]);
    if (intake + amount >= goal) {
      toast({ title: '🎉 Goal Reached!', description: `You've hit your ${goal}ml water goal!` });
    }
  };

  const removeWater = (amount: number) => {
    setIntake(prev => Math.max(0, prev - amount));
  };

  const reset = () => {
    setIntake(0);
    setLog([]);
    toast({ title: 'Reset', description: 'Water intake has been reset.' });
  };

  const quickAmounts = [100, 200, 250, 330, 500, 750];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500">
            <Droplets className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Water Tracker</h1>
          <p className="text-muted-foreground">Stay hydrated — track your daily water intake</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Main tracker */}
          <div className="space-y-6">
            {/* Progress circle */}
            <div className="bg-card rounded-2xl p-8 border border-border text-center">
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                    strokeLinecap="round" strokeDasharray={`${percentage * 2.64} 264`}
                    className="transition-all duration-700 ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Droplets className="w-6 h-6 text-primary mb-1" />
                  <span className="text-3xl font-bold">{intake}</span>
                  <span className="text-sm text-muted-foreground">/ {goal} ml</span>
                </div>
              </div>

              <p className="text-lg font-semibold mb-1">
                {percentage >= 100 ? '🎉 Goal Complete!' : `${Math.round(percentage)}% of daily goal`}
              </p>
              <p className="text-sm text-muted-foreground">
                {percentage < 100 ? `${goal - intake} ml remaining` : 'Great job staying hydrated!'}
              </p>
            </div>

            {/* Quick add buttons */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Quick Add (ml)</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {quickAmounts.map(amt => (
                  <Button key={amt} variant="outline" onClick={() => addWater(amt)} className="text-sm">
                    <Plus className="w-3 h-3 mr-1" /> {amt} ml
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                <Input type="number" placeholder="Custom ml" value={customAmount} onChange={e => setCustomAmount(e.target.value)} />
                <Button onClick={() => addWater(parseInt(customAmount) || 0)} size="icon"><Plus className="w-4 h-4" /></Button>
                <Button variant="outline" onClick={() => removeWater(parseInt(customAmount) || 0)} size="icon"><Minus className="w-4 h-4" /></Button>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={reset} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
              </div>
            </div>

            {/* Set goal */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-primary" />
                <Label className="text-base font-semibold">Daily Goal</Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {[2000, 2500, 3000, 3500, 4000].map(g => (
                  <button key={g} onClick={() => setGoal(g)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${goal === g ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                    {g} ml
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Log */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-primary" /> Today's Log
            </h3>
            {log.length > 0 ? (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {log.map((entry, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Droplets className="w-4 h-4 text-primary" />
                      <span className="font-medium">{entry.amount} ml</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{entry.time}</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Droplets className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No water logged yet today</p>
                <p className="text-sm text-muted-foreground">Start by adding your first glass!</p>
              </div>
            )}

            {log.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total entries</span>
                  <span className="font-semibold">{log.length}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Glasses (~250ml)</span>
                  <span className="font-semibold">{Math.round(intake / 250)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
