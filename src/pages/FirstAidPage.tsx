import { motion } from 'framer-motion';
import { BookOpen, Heart, Flame, Zap, Droplets, Brain, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const firstAidTopics = [
  {
    icon: Heart,
    title: 'CPR & Choking',
    description: 'Life-saving techniques for cardiac arrest and airway obstruction',
    steps: ['Call emergency services', 'Check for responsiveness', 'Begin chest compressions', 'Give rescue breaths'],
    color: 'from-red-500 to-rose-500',
  },
  {
    icon: Flame,
    title: 'Burns',
    description: 'How to treat minor to moderate burns',
    steps: ['Cool the burn under running water for 10-20 min', 'Remove jewelry near the burn', 'Cover with sterile bandage', 'Take pain relievers if needed'],
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: Droplets,
    title: 'Bleeding',
    description: 'Stop bleeding and prevent infection',
    steps: ['Apply direct pressure with clean cloth', 'Elevate the wound above heart level', 'Apply bandage firmly', 'Seek help if bleeding doesn\'t stop'],
    color: 'from-red-600 to-pink-600',
  },
  {
    icon: Zap,
    title: 'Shock',
    description: 'Recognize and respond to shock symptoms',
    steps: ['Call emergency services', 'Lay person flat, elevate legs', 'Keep them warm', 'Monitor breathing'],
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Brain,
    title: 'Head Injuries',
    description: 'Response to bumps, concussions, and trauma',
    steps: ['Keep person still and calm', 'Apply ice pack to swelling', 'Monitor for confusion or vomiting', 'Seek immediate care for severe symptoms'],
    color: 'from-purple-500 to-indigo-500',
  },
];

export default function FirstAidPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-rose-500 to-red-500">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">First Aid Guide</h1>
            <p className="text-muted-foreground">Emergency first aid instructions for common situations</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 mb-8">
          <Phone className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm"><strong className="text-destructive">In emergencies, always call your local emergency number first!</strong> These guides are for reference only.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {firstAidTopics.map((topic, index) => {
            const Icon = topic.icon;
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="glass-card rounded-2xl p-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${topic.color} mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{topic.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{topic.description}</p>
                <ol className="space-y-2">
                  {topic.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link to="/chat" className="btn-primary inline-flex items-center gap-2">Ask AI Doctor for More Help</Link>
        </div>
      </motion.div>
    </div>
  );
}
