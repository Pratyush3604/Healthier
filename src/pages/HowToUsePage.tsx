import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HelpCircle, Stethoscope, Scan, MessageCircle, Mic, Pill, Apple, Dumbbell,
  Calculator, Monitor, ClipboardList, TrendingUp, BookOpen, Lightbulb, Phone,
  Activity, FileText, ArrowRight, ChevronRight, CheckCircle2
} from 'lucide-react';

const tools = [
  {
    icon: Stethoscope, title: 'Symptom Checker', path: '/symptoms',
    steps: [
      'Select your symptoms from the categorized list or type custom ones',
      'Add patient context: age, gender, severity, duration, medications',
      'Click "Analyze Symptoms" to get an AI urgency assessment',
      'Review the detailed analysis with severity rating and recommendations',
    ],
    tips: 'The more symptoms and context you provide, the more accurate the assessment.',
  },
  {
    icon: Scan, title: 'Skin & Injury Analyzer', path: '/skin-injury',
    steps: [
      'Choose between "Skin Condition" or "Injury/Wound" analysis',
      'Upload a photo or use your camera to capture the affected area',
      'Fill in details: body location, duration, pain level, allergies',
      'Click "Analyze" — AI will assess the image with your context',
    ],
    tips: 'Use good lighting and capture the area from 15-20cm away for best results.',
  },
  {
    icon: MessageCircle, title: 'AI Chat', path: '/chat',
    steps: [
      'Type any health question in the chat box',
      'The AI responds with detailed medical information',
      'Ask follow-up questions for clarification',
      'Conversations stay in your session for reference',
    ],
    tips: 'Be specific — instead of "headache help", try "I have a headache behind my eyes for 3 days with nausea".',
  },
  {
    icon: Mic, title: 'Voice Doctor', path: '/ai-doctor',
    steps: [
      'Click the microphone button to start speaking',
      'Describe your symptoms or health concern naturally',
      'The AI transcribes and responds with text and optional voice',
      'Continue the conversation hands-free',
    ],
    tips: 'Speak clearly and in complete sentences for the best transcription.',
  },
  {
    icon: Pill, title: 'Medicine Encyclopedia', path: '/medicine-info',
    steps: [
      'Type a medicine name or click a popular medicine chip',
      'Click "Search" or press Enter',
      'Review the comprehensive drug profile: uses, side effects, interactions, food guidance, storage, and alternatives',
    ],
    tips: 'Search generic names (e.g., "ibuprofen" instead of "Advil") for more complete info.',
  },
  {
    icon: Apple, title: 'Diet Planner', path: '/fitness',
    steps: [
      'Select the "Diet Plan" tab',
      'Enter your body stats: age, weight, height, gender',
      'Set diet preferences: goal, diet type, cuisine, cooking skill, budget',
      'Add allergies, disliked foods, or custom preferences',
      'Click "Generate Meal Plan" for a full 7-day plan with macros',
    ],
    tips: 'Include your medical conditions so the AI avoids unsuitable foods.',
  },
  {
    icon: Dumbbell, title: 'Workout Planner', path: '/fitness',
    steps: [
      'Select the "Workout Plan" tab',
      'Enter body stats and select your fitness level',
      'Choose training style, target muscles, equipment, and days per week',
      'Add any custom goals or preferences in the text fields',
      'Click "Generate Workout Plan" for a full weekly program',
    ],
    tips: 'Mention injuries so the AI provides safe exercise alternatives.',
  },
  {
    icon: Calculator, title: 'BMI & Health Calculator', path: '/bmi-calculator',
    steps: [
      'Enter weight (kg) and height (cm)',
      'Add optional measurements: waist, hip, neck, wrist',
      'Click "Calculate" to see BMI, body fat estimate, BMR, ideal weight, and more',
      'View your BMI history chart over time',
    ],
    tips: 'Measure waist at navel level for accurate body fat estimation.',
  },
  {
    icon: Monitor, title: 'Posture Corrector', path: '/posture-corrector',
    steps: [
      'Select your posture issues from the chip list',
      'Choose your occupation and hours seated daily',
      'Mark pain areas and duration',
      'Set exercise level, workspace setup, and add custom notes',
      'Click "Get Exercise Plan" for personalized stretches and routines',
    ],
    tips: 'Be honest about your workspace setup — the AI tailors ergonomic advice to your actual environment.',
  },
  {
    icon: ClipboardList, title: 'Medication Reminders', path: '/medication-reminder',
    steps: [
      'Click "Add Medication" and enter the medicine name',
      'Set reminder times and select which days of the week',
      'Save — the app will alert you with a sound when it\'s time',
      'View all your medications and edit or delete as needed',
    ],
    tips: 'Keep the browser tab open for alarms to work. Set multiple times for medicines taken throughout the day.',
  },
  {
    icon: TrendingUp, title: 'Health Reports', path: '/health-reports',
    steps: [
      'Reports are auto-generated whenever you use any health tool',
      'Search and filter reports by type (skin, medicine, diet, etc.)',
      'Click a report to expand and view full details',
      'Download individual reports or export all as JSON',
      'Delete reports you no longer need',
    ],
    tips: 'Check your reports regularly to track your health journey over time.',
  },
  {
    icon: FileText, title: 'Report Analysis', path: '/reports',
    steps: [
      'Upload a medical report image (X-ray, MRI, blood test, etc.)',
      'The AI analyzes and explains findings in simple language',
      'Review key findings, abnormalities, and recommendations',
    ],
    tips: 'Ensure the text/image on the report is clearly visible for accurate analysis.',
  },
  {
    icon: Activity, title: 'Vital Signs', path: '/vitals',
    steps: [
      'Enter your readings: heart rate, blood pressure, SpO2, temperature',
      'View normal ranges and how your values compare',
      'Track changes over time',
    ],
    tips: 'Measure vitals at the same time each day for consistent tracking.',
  },
  {
    icon: BookOpen, title: 'First Aid Guide', path: '/first-aid',
    steps: [
      'Browse 60+ emergency first aid guides by category',
      'Search for specific injuries or conditions',
      'Follow step-by-step instructions with urgency indicators',
    ],
    tips: 'Bookmark the First Aid page on your phone for quick access during emergencies.',
  },
  {
    icon: Lightbulb, title: 'Health Tips', path: '/health-tips',
    steps: [
      'Browse 170+ health and wellness tips by category',
      'Search for specific topics (sleep, nutrition, stress, etc.)',
      'Read detailed advice with actionable steps',
    ],
    tips: 'Try implementing one new tip each week for gradual lifestyle improvement.',
  },
  {
    icon: Phone, title: 'Emergency Numbers', path: '/emergency',
    steps: [
      'Search for your country from 100+ countries',
      'View police, ambulance, fire, and general emergency numbers',
      'Tap a number to call directly from your phone',
    ],
    tips: 'Save your local emergency numbers in your phone contacts for instant access.',
  },
];

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function HowToUsePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-extrabold font-display mb-3">How to Use Healthier</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete guide to every tool in the app. Learn how to get the most out of each feature with step-by-step instructions and pro tips.
          </p>
        </motion.div>

        {/* Quick nav */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-10">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">Jump to a tool</h2>
          <div className="flex flex-wrap gap-2">
            {tools.map(t => {
              const Icon = t.icon;
              return (
                <a key={t.title} href={`#${t.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors">
                  <Icon className="w-3 h-3" />{t.title}
                </a>
              );
            })}
          </div>
        </div>

        <motion.div className="space-y-6" variants={container} initial="hidden" animate="visible">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div key={i} variants={item} id={tool.title.toLowerCase().replace(/\s+/g, '-')}
                className="bg-card rounded-2xl border border-border overflow-hidden scroll-mt-24">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold font-display">{tool.title}</h2>
                      <Link to={tool.path} className="text-sm text-primary hover:underline flex items-center gap-1 mt-0.5">
                        Open tool <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {tool.steps.map((step, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">{j + 1}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground"><strong className="text-primary">Pro tip:</strong> {tool.tips}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-12 text-center bg-card rounded-2xl border border-border p-8">
          <h2 className="text-2xl font-bold font-display mb-3">Ready to start?</h2>
          <p className="text-muted-foreground mb-6">Pick a tool and try it out — Healthier is free and available 24/7.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/symptoms" className="btn-primary flex items-center gap-2">
              Start Symptom Check <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/chat" className="btn-secondary flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Chat with AI
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
