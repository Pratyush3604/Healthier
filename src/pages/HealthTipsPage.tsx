import { motion } from 'framer-motion';
import { Lightbulb, Apple, Moon, Dumbbell, Brain, Heart, Droplets, Sun } from 'lucide-react';

const tips = [
  { icon: Droplets, title: 'Stay Hydrated', tip: 'Drink 8 glasses of water daily. Carry a water bottle and set reminders.', color: 'from-blue-500 to-cyan-500' },
  { icon: Moon, title: 'Quality Sleep', tip: 'Aim for 7-9 hours. Keep a consistent sleep schedule, avoid screens before bed.', color: 'from-indigo-500 to-purple-500' },
  { icon: Dumbbell, title: 'Regular Exercise', tip: '150 minutes of moderate activity weekly. Even a 10-minute walk helps!', color: 'from-green-500 to-emerald-500' },
  { icon: Apple, title: 'Balanced Diet', tip: 'Eat colorful fruits & vegetables. Limit processed foods and sugars.', color: 'from-red-500 to-orange-500' },
  { icon: Brain, title: 'Mental Health', tip: 'Practice mindfulness, take breaks, and stay connected with loved ones.', color: 'from-pink-500 to-rose-500' },
  { icon: Heart, title: 'Heart Health', tip: 'Monitor blood pressure, limit salt, and manage stress levels.', color: 'from-red-600 to-pink-600' },
  { icon: Sun, title: 'Vitamin D', tip: 'Get 15-20 minutes of sunlight daily or consider supplements.', color: 'from-yellow-500 to-orange-500' },
  { icon: Lightbulb, title: 'Preventive Care', tip: 'Schedule regular checkups and stay up to date on vaccinations.', color: 'from-amber-500 to-yellow-500' },
];

export default function HealthTipsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-yellow-500 to-orange-500">
            <Lightbulb className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Health Tips</h1>
            <p className="text-muted-foreground">Daily wellness advice for a healthier lifestyle</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tips.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="glass-card rounded-2xl p-5 hover:scale-105 transition-transform">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${item.color} mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.tip}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
