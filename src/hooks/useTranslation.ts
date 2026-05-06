import { useLocalStorage } from './useLocalStorage';

/**
 * Translation system for Healthier.
 *
 * Strategy:
 * - English is the source of truth (master dictionary `EN`).
 * - For supported languages we ship a translated dictionary.
 * - For any other language picked from the 600+ language list, English text is
 *   used in the UI; AI responses still get generated in the chosen language by
 *   `useAIStream` (it appends a "respond in <language>" instruction).
 */

type Dict = Record<string, string>;

// Master English dictionary — every translatable UI string must have a key here.
const EN: Dict = {
  // Nav
  home: 'Home', dashboard: 'Dashboard', symptoms: 'Symptoms', skinInjury: 'Skin & Injury',
  chat: 'Chat', fitness: 'Fitness', medicine: 'Medicine', vitals: 'Vitals',
  reportAnalysis: 'Report Analysis', healthCalculator: 'Health Calculator',
  medReminders: 'Med Reminders', reportsHub: 'Reports Hub', posture: 'Posture',
  firstAid: 'First Aid', healthTips: 'Health Tips', emergency: 'Emergency',
  howToUse: 'How to Use', settings: 'Settings', about: 'About', more: 'More',
  login: 'Login', signOut: 'Sign Out', chatWithAI: 'Chat with AI',
  language: 'Language', analyze: 'Analyze', upload: 'Upload', camera: 'Camera',
  capture: 'Capture', cancel: 'Cancel', search: 'Search',
  allHealthTools: 'All Your Health Tools', tagline: 'Make your life healthier !',

  // Categories
  catDiagnostics: 'AI Diagnostics',
  catConsultation: 'AI Consultation',
  catFitness: 'Fitness & Wellness',
  catTools: 'Tools & Guides',

  // Tool titles & descriptions (homepage cards)
  symptomCheckerT: 'Symptom Checker',
  symptomCheckerD: 'AI urgency assessment from 100+ symptoms',
  skinAnalyzerT: 'Skin & Injury Analyzer',
  skinAnalyzerD: 'Photo-based skin & wound analysis',
  reportAnalysisT: 'Report Analysis',
  reportAnalysisD: 'X-rays, MRIs & labs explained by AI',
  aiChatT: 'AI Chat',
  aiChatD: 'Text-based medical consultation',
  medicineEncyclopediaT: 'Medicine Encyclopedia',
  medicineEncyclopediaD: 'Comprehensive drug analysis',
  dietWorkoutT: 'Diet & Workout Planner',
  dietWorkoutD: 'AI meal plans + exercise routines',
  postureT: 'Posture Corrector',
  postureD: 'Exercises & ergonomic tips',
  healthCalcT: 'Health Calculator',
  healthCalcD: 'BMI, body fat & ideal weight',
  vitalSignsT: 'Vital Signs',
  vitalSignsD: 'Track heart rate, SpO2 & BP',
  medRemindersT: 'Med Reminders',
  medRemindersD: 'Set medication alarms',
  healthReportsT: 'Health Reports',
  healthReportsD: 'Auto-generated from usage',
  firstAidT: 'First Aid Guide',
  firstAidD: '60+ emergency instructions',
  healthTipsT: 'Health Tips',
  healthTipsD: '170+ wellness tips',
  emergencyNumbersT: 'Emergency Numbers',
  emergencyNumbersD: '100+ country numbers',
  howToUseT: 'How to Use',
  howToUseD: 'Detailed guide for every tool',

  // Hero
  heroBadge: '15 AI-Powered Health Tools',
  heroSubtitle: 'Instant health assessments, first aid guidance, and wellness tools — all powered by AI. Know when to seek professional care.',
  toolsByCategory: 'Powerful tools organized by category',

  // Stats
  statHealthTools: 'Health Tools',
  statAvailable: 'Available',
  statFreeToUse: 'To Use',
  statPrivate: '& Secure',
  statFree: 'Free',
  statPrivateLabel: 'Private',

  // Safety panel
  safetyTitle: 'For Basic Diagnostics Only',
  safetyBody: 'Healthier provides preliminary health assessments. It is not a replacement for professional medical care.',
  safetyBullet1: 'For emergencies, call your local emergency number',
  safetyBullet2: 'Always consult a doctor for serious symptoms',
  safetyBullet3: 'Use Healthier for basic questions & wellness',

  // Footer
  medicalDisclaimer: 'Medical Disclaimer:',
  medicalDisclaimerBody: 'Healthier provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.',
  footerTagline: 'Your intelligent health companion powered by cutting-edge AI. Get preliminary assessments, first aid guidance, and wellness tools — available 24/7.',
  coreTools: 'Core Tools',
  resources: 'Resources',
  madeBy: 'Made by Pratyush Dalmia',
  supportTitle: 'If you\'d like to support Healthier and help us keep improving, we\'d truly appreciate it.',
  supportBody: 'Please reach out at',
  supportThanks: '— every bit of support means the world to us. Thank you for your support!',

  // About page
  aboutHeading: 'About Me',
  aboutSubheading: 'The Creator of Healthier',
  aboutSchool: 'Mayo College, Ajmer',
  aboutBio: 'I\'m a student who loves technology, robotics, AI, and innovation. My dream is to build solutions that create real impact and leave a mark that lasts for generations.',
  aboutOrigin: 'originally started as an idea for WRO (World Robot Olympiad), but over time it evolved into a full-fledged AI-powered health assistant.',
  whatHealthierCanDo: 'What Healthier Can Do',
  myMentor: '🙏 My Mentor',
  mentorThanks: 'I sincerely thank Mr. Akash Deep Rawat for his constant support, guidance, and motivation in turning this vision into reality.',
  builtForWRO: 'Built with passion for WRO and beyond',
};

// Helper to build a partial dictionary while inheriting EN for missing keys.
const make = (overrides: Dict): Dict => ({ ...EN, ...overrides });

const translations: Record<string, Dict> = {
  English: EN,
  Hindi: make({
    home: 'होम', dashboard: 'डैशबोर्ड', symptoms: 'लक्षण', skinInjury: 'त्वचा और चोट', chat: 'चैट',
    fitness: 'फिटनेस', medicine: 'दवा', vitals: 'जीवन संकेत', reportAnalysis: 'रिपोर्ट विश्लेषण',
    healthCalculator: 'स्वास्थ्य कैलकुलेटर', medReminders: 'दवा अनुस्मारक', reportsHub: 'रिपोर्ट हब',
    posture: 'मुद्रा', firstAid: 'प्राथमिक चिकित्सा', healthTips: 'स्वास्थ्य सुझाव', emergency: 'आपातकाल',
    howToUse: 'कैसे उपयोग करें', settings: 'सेटिंग्स', about: 'हमारे बारे में', more: 'और',
    login: 'लॉगिन', signOut: 'साइन आउट', chatWithAI: 'AI से चैट', language: 'भाषा',
    analyze: 'विश्लेषण', upload: 'अपलोड', camera: 'कैमरा', capture: 'कैप्चर', cancel: 'रद्द करें',
    search: 'खोजें', allHealthTools: 'सभी स्वास्थ्य उपकरण', tagline: 'अपने जीवन को स्वस्थ बनाएं!',
    catDiagnostics: 'AI निदान', catConsultation: 'AI परामर्श', catFitness: 'फिटनेस और स्वास्थ्य',
    catTools: 'उपकरण और गाइड',
    symptomCheckerT: 'लक्षण जाँच', symptomCheckerD: '100+ लक्षणों से AI मूल्यांकन',
    skinAnalyzerT: 'त्वचा और चोट विश्लेषक', skinAnalyzerD: 'फोटो-आधारित त्वचा एवं घाव विश्लेषण',
    reportAnalysisT: 'रिपोर्ट विश्लेषण', reportAnalysisD: 'X-ray, MRI और लैब समझाएं AI द्वारा',
    aiChatT: 'AI चैट', aiChatD: 'टेक्स्ट-आधारित चिकित्सा परामर्श',
    medicineEncyclopediaT: 'दवा विश्वकोश', medicineEncyclopediaD: 'व्यापक दवा विश्लेषण',
    dietWorkoutT: 'आहार और व्यायाम योजना', dietWorkoutD: 'AI भोजन योजना और व्यायाम',
    postureT: 'मुद्रा सुधारक', postureD: 'व्यायाम और टिप्स',
    healthCalcT: 'स्वास्थ्य कैलकुलेटर', healthCalcD: 'BMI, बॉडी फैट और आदर्श वजन',
    vitalSignsT: 'जीवन संकेत', vitalSignsD: 'हृदय गति, SpO2 और BP ट्रैक करें',
    medRemindersT: 'दवा अनुस्मारक', medRemindersD: 'दवा अलार्म सेट करें',
    healthReportsT: 'स्वास्थ्य रिपोर्ट', healthReportsD: 'उपयोग से स्वतः निर्मित',
    firstAidT: 'प्राथमिक चिकित्सा गाइड', firstAidD: '60+ आपातकालीन निर्देश',
    healthTipsT: 'स्वास्थ्य सुझाव', healthTipsD: '170+ कल्याण सुझाव',
    emergencyNumbersT: 'आपातकालीन नंबर', emergencyNumbersD: '100+ देशों के नंबर',
    howToUseT: 'कैसे उपयोग करें', howToUseD: 'हर उपकरण के लिए विस्तृत गाइड',
    heroBadge: '15 AI-संचालित स्वास्थ्य उपकरण',
    heroSubtitle: 'त्वरित स्वास्थ्य आकलन, प्राथमिक चिकित्सा मार्गदर्शन और कल्याण उपकरण — AI द्वारा संचालित।',
    toolsByCategory: 'श्रेणी के अनुसार शक्तिशाली उपकरण',
    statHealthTools: 'स्वास्थ्य उपकरण', statAvailable: 'उपलब्ध', statFreeToUse: 'उपयोग के लिए',
    statPrivate: 'और सुरक्षित', statFree: 'मुफ्त', statPrivateLabel: 'निजी',
    safetyTitle: 'केवल बुनियादी निदान के लिए',
    safetyBody: 'Healthier प्रारंभिक स्वास्थ्य आकलन प्रदान करता है। यह पेशेवर चिकित्सा देखभाल का विकल्प नहीं है।',
    safetyBullet1: 'आपात स्थिति में, अपने स्थानीय आपातकालीन नंबर पर कॉल करें',
    safetyBullet2: 'गंभीर लक्षणों के लिए हमेशा डॉक्टर से सलाह लें',
    safetyBullet3: 'बुनियादी प्रश्नों और कल्याण के लिए Healthier का उपयोग करें',
    medicalDisclaimer: 'चिकित्सा अस्वीकरण:',
    medicalDisclaimerBody: 'Healthier केवल सामान्य स्वास्थ्य जानकारी प्रदान करता है और पेशेवर चिकित्सा सलाह, निदान या उपचार का विकल्प नहीं है।',
    footerTagline: 'अत्याधुनिक AI द्वारा संचालित आपका बुद्धिमान स्वास्थ्य साथी — 24/7 उपलब्ध।',
    coreTools: 'मुख्य उपकरण', resources: 'संसाधन', madeBy: 'प्रत्युष दलमिया द्वारा बनाया गया',
    supportTitle: 'यदि आप Healthier का समर्थन करना चाहते हैं, तो हम वास्तव में आभारी होंगे।',
    supportBody: 'कृपया संपर्क करें', supportThanks: '— हर सहयोग हमारे लिए अनमोल है। आपके समर्थन के लिए धन्यवाद!',
    aboutHeading: 'मेरे बारे में', aboutSubheading: 'Healthier के निर्माता',
    aboutSchool: 'मेयो कॉलेज, अजमेर',
    aboutBio: 'मैं एक छात्र हूं जिसे टेक्नोलॉजी, रोबोटिक्स, AI और नवाचार पसंद है।',
    aboutOrigin: 'मूल रूप से WRO के लिए एक विचार के रूप में शुरू हुआ, समय के साथ यह एक AI-संचालित स्वास्थ्य सहायक बन गया।',
    whatHealthierCanDo: 'Healthier क्या कर सकता है', myMentor: '🙏 मेरे गुरु',
    mentorThanks: 'मैं श्री आकाश दीप रावत को उनके निरंतर समर्थन और मार्गदर्शन के लिए हृदय से धन्यवाद देता हूं।',
    builtForWRO: 'WRO और उससे आगे के लिए जुनून से बनाया गया',
  }),
  Spanish: make({
    home: 'Inicio', dashboard: 'Panel', symptoms: 'Síntomas', skinInjury: 'Piel y lesiones', chat: 'Chat',
    fitness: 'Fitness', medicine: 'Medicina', vitals: 'Signos vitales', reportAnalysis: 'Análisis',
    healthCalculator: 'Calculadora', medReminders: 'Recordatorios', reportsHub: 'Informes',
    posture: 'Postura', firstAid: 'Primeros auxilios', healthTips: 'Consejos', emergency: 'Emergencia',
    howToUse: 'Cómo usar', settings: 'Ajustes', about: 'Acerca de', more: 'Más',
    login: 'Iniciar sesión', signOut: 'Cerrar sesión', chatWithAI: 'Chat con IA', language: 'Idioma',
    analyze: 'Analizar', upload: 'Subir', camera: 'Cámara', capture: 'Capturar', cancel: 'Cancelar',
    search: 'Buscar', allHealthTools: 'Todas las herramientas', tagline: '¡Haz tu vida más saludable!',
    catDiagnostics: 'Diagnóstico IA', catConsultation: 'Consulta IA',
    catFitness: 'Fitness y Bienestar', catTools: 'Herramientas y Guías',
    heroBadge: '15 Herramientas de Salud con IA',
    heroSubtitle: 'Evaluaciones de salud instantáneas, primeros auxilios y bienestar — todo con IA.',
    toolsByCategory: 'Herramientas potentes organizadas por categoría',
    coreTools: 'Herramientas principales', resources: 'Recursos',
    madeBy: 'Hecho por Pratyush Dalmia',
    safetyTitle: 'Solo para diagnóstico básico',
    medicalDisclaimer: 'Aviso médico:',
    aboutHeading: 'Sobre mí', aboutSubheading: 'El creador de Healthier',
    whatHealthierCanDo: 'Qué puede hacer Healthier', myMentor: '🙏 Mi Mentor',
  }),
  French: make({
    home: 'Accueil', dashboard: 'Tableau de bord', symptoms: 'Symptômes', skinInjury: 'Peau et blessures',
    chat: 'Chat', fitness: 'Fitness', medicine: 'Médecine', vitals: 'Signes vitaux',
    reportAnalysis: 'Analyse', healthCalculator: 'Calculatrice', medReminders: 'Rappels',
    reportsHub: 'Rapports', posture: 'Posture', firstAid: 'Premiers secours', healthTips: 'Conseils',
    emergency: 'Urgence', howToUse: 'Comment utiliser', settings: 'Paramètres', about: 'À propos',
    more: 'Plus', login: 'Connexion', signOut: 'Déconnexion', chatWithAI: 'Chat IA', language: 'Langue',
    analyze: 'Analyser', upload: 'Téléverser', camera: 'Caméra', capture: 'Capturer', cancel: 'Annuler',
    search: 'Rechercher', allHealthTools: 'Tous les outils', tagline: 'Rendez votre vie plus saine !',
    catDiagnostics: 'Diagnostic IA', catConsultation: 'Consultation IA',
    catFitness: 'Fitness et Bien-être', catTools: 'Outils et Guides',
    coreTools: 'Outils principaux', resources: 'Ressources',
    madeBy: 'Réalisé par Pratyush Dalmia',
    aboutHeading: 'À propos de moi', myMentor: '🙏 Mon Mentor',
  }),
  German: make({
    home: 'Start', dashboard: 'Dashboard', symptoms: 'Symptome', skinInjury: 'Haut & Verletzung',
    chat: 'Chat', fitness: 'Fitness', medicine: 'Medizin', vitals: 'Vitalwerte',
    reportAnalysis: 'Analyse', healthCalculator: 'Rechner', medReminders: 'Erinnerungen',
    reportsHub: 'Berichte', posture: 'Haltung', firstAid: 'Erste Hilfe', healthTips: 'Tipps',
    emergency: 'Notfall', howToUse: 'Anleitung', settings: 'Einstellungen', about: 'Über',
    more: 'Mehr', login: 'Anmelden', signOut: 'Abmelden', chatWithAI: 'KI-Chat', language: 'Sprache',
    analyze: 'Analysieren', upload: 'Hochladen', camera: 'Kamera', capture: 'Aufnehmen',
    cancel: 'Abbrechen', search: 'Suchen', allHealthTools: 'Alle Tools',
    tagline: 'Mache dein Leben gesünder!',
    catDiagnostics: 'KI-Diagnose', catConsultation: 'KI-Beratung',
    catFitness: 'Fitness & Wellness', catTools: 'Tools & Anleitungen',
    coreTools: 'Haupt-Tools', resources: 'Ressourcen',
  }),
  Italian: make({
    home: 'Home', symptoms: 'Sintomi', skinInjury: 'Pelle e lesioni', chat: 'Chat',
    fitness: 'Fitness', medicine: 'Medicina', vitals: 'Parametri vitali',
    reportAnalysis: 'Analisi', healthCalculator: 'Calcolatore', medReminders: 'Promemoria',
    reportsHub: 'Referti', posture: 'Postura', firstAid: 'Primo soccorso',
    healthTips: 'Consigli', emergency: 'Emergenza', howToUse: 'Come usare',
    settings: 'Impostazioni', about: 'Chi sono', more: 'Altro',
    catDiagnostics: 'Diagnostica IA', catConsultation: 'Consultazione IA',
    catFitness: 'Fitness e Benessere', catTools: 'Strumenti e Guide',
    tagline: 'Rendi la tua vita più sana!',
  }),
  Portuguese: make({
    home: 'Início', symptoms: 'Sintomas', chat: 'Chat', fitness: 'Fitness',
    medicine: 'Medicina', vitals: 'Sinais vitais', emergency: 'Emergência',
    settings: 'Configurações', about: 'Sobre', more: 'Mais',
    catDiagnostics: 'Diagnóstico IA', catConsultation: 'Consulta IA',
    tagline: 'Torne sua vida mais saudável!',
  }),
  Russian: make({
    home: 'Главная', symptoms: 'Симптомы', chat: 'Чат', fitness: 'Фитнес',
    medicine: 'Медицина', vitals: 'Жизненные показатели',
    catDiagnostics: 'ИИ-диагностика', catConsultation: 'ИИ-консультация',
    tagline: 'Сделайте свою жизнь здоровее!',
  }),
  Japanese: make({
    home: 'ホーム', symptoms: '症状', chat: 'チャット', fitness: 'フィットネス',
    catDiagnostics: 'AI診断', catConsultation: 'AI相談',
    tagline: 'あなたの人生をより健康に！',
  }),
  Korean: make({
    home: '홈', symptoms: '증상', chat: '채팅', fitness: '피트니스',
    catDiagnostics: 'AI 진단', catConsultation: 'AI 상담',
    tagline: '당신의 삶을 더 건강하게!',
  }),
  'Chinese (Simplified)': make({
    home: '首页', symptoms: '症状', chat: '聊天', fitness: '健身',
    catDiagnostics: 'AI 诊断', catConsultation: 'AI 咨询',
    tagline: '让您的生活更健康！',
  }),
  Arabic: make({
    home: 'الرئيسية', symptoms: 'الأعراض', chat: 'دردشة',
    catDiagnostics: 'تشخيص AI', catConsultation: 'استشارة AI',
    tagline: 'اجعل حياتك أكثر صحة!',
  }),
  Bengali: make({
    home: 'হোম', symptoms: 'লক্ষণ', chat: 'চ্যাট',
    catDiagnostics: 'AI নির্ণয়', catConsultation: 'AI পরামর্শ',
    tagline: 'আপনার জীবন স্বাস্থ্যকর করুন!',
  }),
  Marathi: make({
    home: 'मुख्यपृष्ठ', symptoms: 'लक्षणे', tagline: 'आपले जीवन निरोगी बनवा!',
    catDiagnostics: 'AI निदान',
  }),
  Tamil: make({ home: 'முகப்பு', tagline: 'உங்கள் வாழ்க்கையை ஆரோக்கியமாக்குங்கள்!' }),
  Telugu: make({ home: 'హోమ్', tagline: 'మీ జీవితాన్ని ఆరోగ్యకరంగా చేసుకోండి!' }),
  Urdu: make({ home: 'ہوم', tagline: 'اپنی زندگی کو صحت مند بنائیں!' }),
  Turkish: make({ home: 'Ana Sayfa', tagline: 'Hayatınızı daha sağlıklı yapın!' }),
  Dutch: make({ home: 'Home', tagline: 'Maak je leven gezonder!' }),
  Polish: make({ home: 'Start', tagline: 'Zrób swoje życie zdrowszym!' }),
  Indonesian: make({ home: 'Beranda', tagline: 'Buat hidupmu lebih sehat!' }),
  Vietnamese: make({ home: 'Trang chủ', tagline: 'Làm cuộc sống của bạn khỏe mạnh hơn!' }),
  Thai: make({ home: 'หน้าแรก', tagline: 'ทำให้ชีวิตของคุณมีสุขภาพดีขึ้น!' }),
  Swahili: make({ home: 'Nyumbani', tagline: 'Fanya maisha yako kuwa na afya bora!' }),
  Greek: make({ home: 'Αρχική', tagline: 'Κάνε τη ζωή σου πιο υγιή!' }),
  Hebrew: make({ home: 'בית', tagline: 'הפוך את חייך לבריאים יותר!' }),
  Persian: make({ home: 'خانه', tagline: 'زندگی خود را سالم‌تر کنید!' }),
  Ukrainian: make({ home: 'Головна', tagline: 'Зроби своє життя здоровішим!' }),
  Czech: make({ home: 'Domů', tagline: 'Udělejte svůj život zdravější!' }),
  Swedish: make({ home: 'Hem', tagline: 'Gör ditt liv hälsosammare!' }),
};

export function useTranslation() {
  const [language] = useLocalStorage('healtify-language', 'English');
  const t = (key: string, fallback?: string): string => {
    const dict = translations[language as string] || EN;
    return dict[key] ?? EN[key] ?? fallback ?? key;
  };
  return { t, language };
}
