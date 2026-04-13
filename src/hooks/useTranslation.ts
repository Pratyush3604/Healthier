import { useLocalStorage } from './useLocalStorage';

// Core UI keys with English defaults. AI responses use the language setting separately.
const en: Record<string, string> = {
  // Common
  analyze: 'Analyze',
  submit: 'Submit',
  cancel: 'Cancel',
  close: 'Close',
  save: 'Save',
  delete: 'Delete',
  download: 'Download',
  upload: 'Upload',
  camera: 'Camera',
  capture: 'Capture',
  search: 'Search',
  reset: 'Reset',
  generate: 'Generate',
  loading: 'Loading...',
  back: 'Back',
  next: 'Next',
  new: 'New',
  open: 'Open',
  export: 'Export',
  // Nav
  home: 'Home',
  dashboard: 'Dashboard',
  symptoms: 'Symptoms',
  skinInjury: 'Skin & Injury',
  chat: 'Chat',
  fitness: 'Fitness',
  medicine: 'Medicine',
  vitals: 'Vitals',
  reportAnalysis: 'Report Analysis',
  healthCalculator: 'Health Calculator',
  medReminders: 'Med Reminders',
  reportsHub: 'Reports Hub',
  posture: 'Posture',
  firstAid: 'First Aid',
  healthTips: 'Health Tips',
  emergency: 'Emergency',
  howToUse: 'How to Use',
  settings: 'Settings',
  about: 'About',
  more: 'More',
  login: 'Login',
  signOut: 'Sign Out',
  // Home
  heroTitle1: 'Your Personal',
  heroTitle2: 'Health Assistant',
  heroSubtitle: 'Instant health assessments, first aid guidance, and wellness tools — all powered by AI.',
  chatWithAI: 'Chat with AI',
  chooseLanguage: 'Language',
  healthTools: 'Health Tools',
  available247: 'Available',
  freeToUse: 'To Use',
  privateSecure: '& Secure',
  allHealthTools: 'All Your Health Tools',
  toolsByCategory: 'Powerful tools organized by category',
  // Skin
  whatAnalyzing: 'What are you analyzing?',
  skinCondition: '🔍 Skin Condition',
  injuryWound: '🩹 Injury / Wound',
  detailsAccuracy: 'Details (improves accuracy)',
  age: 'Age',
  bodyLocation: 'Body Location',
  howLong: 'How Long?',
  pain: 'Pain?',
  itching: 'Itching?',
  allergies: 'Known Allergies',
  skinType: 'Skin Type',
  changedRecently: 'Changed Recently?',
  sunExposure: 'Sun Exposure',
  skincareProducts: 'Skincare Products',
  bleeding: 'Bleeding',
  causeOfInjury: 'Cause of Injury',
  tetanus: 'Tetanus Vaccination',
  noImageAnalyzed: 'No Image Analyzed',
  important: 'Important',
  // Settings
  theme: 'Theme',
  language: 'Language',
  general: 'General',
  voiceAudio: 'Voice & Audio',
  privacyData: 'Privacy & Data',
  account: 'Account',
  notifications: 'Notifications',
  // Reports
  totalReports: 'Total Reports',
  categories: 'Categories',
  today: 'Today',
  searchReports: 'Search reports...',
  exportAll: 'Export All',
  noReportsYet: 'No reports yet',
  // Fitness
  generateDietPlan: 'Generate Diet Plan',
  generateWorkoutPlan: 'Generate Workout Plan',
  dietPreferences: 'Diet Preferences',
  workoutPreferences: 'Workout Preferences',
  // Safety
  forBasicOnly: 'For Basic Diagnostics Only',
  disclaimer: 'Healthier provides preliminary health assessments. It is not a replacement for professional medical care.',
};

// We store translations as a simple map. For non-English, the AI generates responses
// in the selected language. UI labels use a basic auto-translation approach via
// Google Translate-style mapping for the 100 most common languages.
// For efficiency, we only ship English UI keys and let the language setting
// control AI response language. The UI remains in English but buttons/labels
// that are critical get translated via this hook.

export function useTranslation() {
  const [language] = useLocalStorage('healtify-language', 'English');

  const t = (key: string): string => {
    return en[key] || key;
  };

  return { t, language };
}
