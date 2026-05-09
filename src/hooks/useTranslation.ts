import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { fetchAndCacheTranslation, getCachedTranslation, useTranslationVersion } from './useAutoTranslate';

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
    home: 'Home', dashboard: 'Pannello', symptoms: 'Sintomi', skinInjury: 'Pelle e lesioni', chat: 'Chat',
    fitness: 'Fitness', medicine: 'Medicina', vitals: 'Parametri vitali',
    reportAnalysis: 'Analisi referti', healthCalculator: 'Calcolatore', medReminders: 'Promemoria',
    reportsHub: 'Referti', posture: 'Postura', firstAid: 'Primo soccorso',
    healthTips: 'Consigli', emergency: 'Emergenza', howToUse: 'Come usare',
    settings: 'Impostazioni', about: 'Chi sono', more: 'Altro',
    login: 'Accedi', signOut: 'Esci', chatWithAI: 'Chat con IA', language: 'Lingua',
    analyze: 'Analizza', upload: 'Carica', camera: 'Fotocamera', capture: 'Scatta', cancel: 'Annulla',
    search: 'Cerca', allHealthTools: 'Tutti gli strumenti', tagline: 'Rendi la tua vita più sana!',
    catDiagnostics: 'Diagnostica IA', catConsultation: 'Consultazione IA',
    catFitness: 'Fitness e Benessere', catTools: 'Strumenti e Guide',
    coreTools: 'Strumenti principali', resources: 'Risorse', madeBy: 'Realizzato da Pratyush Dalmia',
    heroBadge: '15 strumenti di salute con IA',
    heroSubtitle: 'Valutazioni di salute istantanee, primo soccorso e benessere — tutto con IA.',
    toolsByCategory: 'Strumenti potenti organizzati per categoria',
  }),
  Portuguese: make({
    home: 'Início', dashboard: 'Painel', symptoms: 'Sintomas', skinInjury: 'Pele e lesões', chat: 'Chat',
    fitness: 'Fitness', medicine: 'Medicina', vitals: 'Sinais vitais',
    reportAnalysis: 'Análise', healthCalculator: 'Calculadora', medReminders: 'Lembretes',
    reportsHub: 'Relatórios', posture: 'Postura', firstAid: 'Primeiros socorros',
    healthTips: 'Dicas', emergency: 'Emergência', howToUse: 'Como usar',
    settings: 'Configurações', about: 'Sobre', more: 'Mais',
    login: 'Entrar', signOut: 'Sair', chatWithAI: 'Conversar com IA', language: 'Idioma',
    analyze: 'Analisar', upload: 'Enviar', camera: 'Câmera', capture: 'Capturar', cancel: 'Cancelar',
    search: 'Buscar', allHealthTools: 'Todas as ferramentas', tagline: 'Torne sua vida mais saudável!',
    catDiagnostics: 'Diagnóstico IA', catConsultation: 'Consulta IA',
    catFitness: 'Fitness e Bem-estar', catTools: 'Ferramentas e Guias',
    coreTools: 'Ferramentas principais', resources: 'Recursos', madeBy: 'Feito por Pratyush Dalmia',
    heroBadge: '15 ferramentas de saúde com IA',
    heroSubtitle: 'Avaliações de saúde instantâneas, primeiros socorros e bem-estar — tudo com IA.',
    toolsByCategory: 'Ferramentas poderosas organizadas por categoria',
  }),
  Russian: make({
    home: 'Главная', dashboard: 'Панель', symptoms: 'Симптомы', skinInjury: 'Кожа и травмы', chat: 'Чат',
    fitness: 'Фитнес', medicine: 'Медицина', vitals: 'Жизненные показатели',
    reportAnalysis: 'Анализ', healthCalculator: 'Калькулятор', medReminders: 'Напоминания',
    reportsHub: 'Отчеты', posture: 'Осанка', firstAid: 'Первая помощь',
    healthTips: 'Советы', emergency: 'Экстренно', howToUse: 'Как использовать',
    settings: 'Настройки', about: 'О нас', more: 'Ещё',
    login: 'Войти', signOut: 'Выйти', chatWithAI: 'Чат с ИИ', language: 'Язык',
    analyze: 'Анализ', upload: 'Загрузить', camera: 'Камера', capture: 'Снять', cancel: 'Отмена',
    search: 'Поиск', allHealthTools: 'Все инструменты', tagline: 'Сделайте свою жизнь здоровее!',
    catDiagnostics: 'ИИ-диагностика', catConsultation: 'ИИ-консультация',
    catFitness: 'Фитнес и здоровье', catTools: 'Инструменты и руководства',
    coreTools: 'Основные инструменты', resources: 'Ресурсы',
    heroBadge: '15 инструментов здоровья с ИИ',
    toolsByCategory: 'Мощные инструменты по категориям',
  }),
  Japanese: make({
    home: 'ホーム', dashboard: 'ダッシュボード', symptoms: '症状', skinInjury: '肌と怪我', chat: 'チャット',
    fitness: 'フィットネス', medicine: '薬', vitals: 'バイタル',
    reportAnalysis: 'レポート分析', healthCalculator: '計算機', medReminders: 'リマインダー',
    reportsHub: 'レポート', posture: '姿勢', firstAid: '応急処置',
    healthTips: '健康のヒント', emergency: '緊急', howToUse: '使い方',
    settings: '設定', about: '私たちについて', more: 'もっと',
    login: 'ログイン', signOut: 'ログアウト', chatWithAI: 'AIとチャット', language: '言語',
    analyze: '分析', upload: 'アップロード', camera: 'カメラ', capture: '撮影', cancel: 'キャンセル',
    search: '検索', allHealthTools: 'すべてのツール', tagline: 'あなたの人生をより健康に！',
    catDiagnostics: 'AI診断', catConsultation: 'AI相談',
    catFitness: 'フィットネスと健康', catTools: 'ツールとガイド',
    coreTools: 'メインツール', resources: 'リソース',
    heroBadge: '15のAI健康ツール',
  }),
  Korean: make({
    home: '홈', dashboard: '대시보드', symptoms: '증상', skinInjury: '피부와 부상', chat: '채팅',
    fitness: '피트니스', medicine: '의약품', vitals: '생체 신호',
    reportAnalysis: '리포트 분석', healthCalculator: '계산기', medReminders: '알림',
    reportsHub: '리포트', posture: '자세', firstAid: '응급처치',
    healthTips: '건강 팁', emergency: '응급', howToUse: '사용 방법',
    settings: '설정', about: '소개', more: '더보기',
    login: '로그인', signOut: '로그아웃', chatWithAI: 'AI와 채팅', language: '언어',
    analyze: '분석', upload: '업로드', camera: '카메라', capture: '촬영', cancel: '취소',
    search: '검색', allHealthTools: '모든 도구', tagline: '당신의 삶을 더 건강하게!',
    catDiagnostics: 'AI 진단', catConsultation: 'AI 상담',
    catFitness: '피트니스와 웰빙', catTools: '도구와 가이드',
    coreTools: '핵심 도구', resources: '리소스',
  }),
  'Chinese (Simplified)': make({
    home: '首页', dashboard: '仪表板', symptoms: '症状', skinInjury: '皮肤和伤害', chat: '聊天',
    fitness: '健身', medicine: '药品', vitals: '生命体征',
    reportAnalysis: '报告分析', healthCalculator: '计算器', medReminders: '提醒',
    reportsHub: '报告', posture: '姿势', firstAid: '急救',
    healthTips: '健康提示', emergency: '紧急', howToUse: '如何使用',
    settings: '设置', about: '关于', more: '更多',
    login: '登录', signOut: '登出', chatWithAI: '与AI聊天', language: '语言',
    analyze: '分析', upload: '上传', camera: '相机', capture: '拍摄', cancel: '取消',
    search: '搜索', allHealthTools: '所有工具', tagline: '让您的生活更健康！',
    catDiagnostics: 'AI 诊断', catConsultation: 'AI 咨询',
    catFitness: '健身与健康', catTools: '工具和指南',
    coreTools: '核心工具', resources: '资源',
  }),
  Arabic: make({
    home: 'الرئيسية', dashboard: 'لوحة التحكم', symptoms: 'الأعراض', skinInjury: 'الجلد والإصابات', chat: 'دردشة',
    fitness: 'لياقة', medicine: 'دواء', vitals: 'العلامات الحيوية',
    reportAnalysis: 'تحليل التقارير', healthCalculator: 'حاسبة', medReminders: 'تذكيرات',
    reportsHub: 'التقارير', posture: 'الوضعية', firstAid: 'الإسعافات الأولية',
    healthTips: 'نصائح', emergency: 'طوارئ', howToUse: 'كيفية الاستخدام',
    settings: 'الإعدادات', about: 'حول', more: 'المزيد',
    login: 'تسجيل الدخول', signOut: 'تسجيل الخروج', chatWithAI: 'دردشة مع الذكاء الاصطناعي', language: 'اللغة',
    analyze: 'تحليل', upload: 'تحميل', camera: 'كاميرا', capture: 'التقاط', cancel: 'إلغاء',
    search: 'بحث', allHealthTools: 'جميع الأدوات', tagline: 'اجعل حياتك أكثر صحة!',
    catDiagnostics: 'تشخيص AI', catConsultation: 'استشارة AI',
    catFitness: 'اللياقة والعافية', catTools: 'أدوات وأدلة',
    coreTools: 'الأدوات الأساسية', resources: 'الموارد',
  }),
  Bengali: make({
    home: 'হোম', dashboard: 'ড্যাশবোর্ড', symptoms: 'লক্ষণ', skinInjury: 'ত্বক ও আঘাত', chat: 'চ্যাট',
    fitness: 'ফিটনেস', medicine: 'ঔষধ', vitals: 'ভাইটাল',
    reportAnalysis: 'রিপোর্ট বিশ্লেষণ', healthCalculator: 'ক্যালকুলেটর', medReminders: 'রিমাইন্ডার',
    reportsHub: 'রিপোর্ট', posture: 'ভঙ্গি', firstAid: 'প্রাথমিক চিকিৎসা',
    healthTips: 'স্বাস্থ্য টিপস', emergency: 'জরুরি', howToUse: 'কিভাবে ব্যবহার করবেন',
    settings: 'সেটিংস', about: 'সম্পর্কে', more: 'আরও',
    login: 'লগইন', signOut: 'সাইন আউট', chatWithAI: 'AI চ্যাট', language: 'ভাষা',
    analyze: 'বিশ্লেষণ', upload: 'আপলোড', camera: 'ক্যামেরা', capture: 'ক্যাপচার', cancel: 'বাতিল',
    search: 'খুঁজুন', allHealthTools: 'সব টুল', tagline: 'আপনার জীবন স্বাস্থ্যকর করুন!',
    catDiagnostics: 'AI নির্ণয়', catConsultation: 'AI পরামর্শ',
    catFitness: 'ফিটনেস ও সুস্থতা', catTools: 'টুল ও গাইড',
    coreTools: 'মূল টুল', resources: 'রিসোর্স',
  }),
  Urdu: make({
    home: 'ہوم', dashboard: 'ڈیش بورڈ', symptoms: 'علامات', skinInjury: 'جلد اور چوٹ', chat: 'چیٹ',
    fitness: 'فٹنس', medicine: 'دوا', vitals: 'حیاتی علامات',
    reportAnalysis: 'رپورٹ تجزیہ', healthCalculator: 'کیلکولیٹر', medReminders: 'یاد دہانی',
    reportsHub: 'رپورٹس', posture: 'پوسچر', firstAid: 'ابتدائی طبی امداد',
    healthTips: 'صحت کے نکات', emergency: 'ایمرجنسی', howToUse: 'استعمال کیسے کریں',
    settings: 'سیٹنگز', about: 'ہمارے بارے میں', more: 'مزید',
    login: 'لاگ ان', signOut: 'سائن آؤٹ', chatWithAI: 'AI چیٹ', language: 'زبان',
    analyze: 'تجزیہ', upload: 'اپ لوڈ', camera: 'کیمرہ', capture: 'تصویر لیں', cancel: 'منسوخ',
    search: 'تلاش', allHealthTools: 'تمام ٹولز', tagline: 'اپنی زندگی کو صحت مند بنائیں!',
    catDiagnostics: 'AI تشخیص', catConsultation: 'AI مشاورت',
    catFitness: 'فٹنس اور تندرستی', catTools: 'ٹولز اور گائیڈز',
  }),
  Turkish: make({
    home: 'Ana Sayfa', dashboard: 'Panel', symptoms: 'Belirtiler', skinInjury: 'Cilt ve Yaralanma', chat: 'Sohbet',
    fitness: 'Fitness', medicine: 'İlaç', vitals: 'Yaşamsal Bulgular',
    reportAnalysis: 'Rapor Analizi', healthCalculator: 'Hesaplayıcı', medReminders: 'Hatırlatıcılar',
    reportsHub: 'Raporlar', posture: 'Duruş', firstAid: 'İlk Yardım',
    healthTips: 'Sağlık İpuçları', emergency: 'Acil', howToUse: 'Nasıl Kullanılır',
    settings: 'Ayarlar', about: 'Hakkında', more: 'Daha Fazla',
    login: 'Giriş', signOut: 'Çıkış', chatWithAI: 'AI ile Sohbet', language: 'Dil',
    analyze: 'Analiz', upload: 'Yükle', camera: 'Kamera', capture: 'Çek', cancel: 'İptal',
    search: 'Ara', allHealthTools: 'Tüm Araçlar', tagline: 'Hayatınızı daha sağlıklı yapın!',
    catDiagnostics: 'AI Teşhis', catConsultation: 'AI Danışmanlık',
    catFitness: 'Fitness ve Sağlık', catTools: 'Araçlar ve Kılavuzlar',
  }),
  Marathi: make({
    home: 'मुख्यपृष्ठ', symptoms: 'लक्षणे', tagline: 'आपले जीवन निरोगी बनवा!',
    catDiagnostics: 'AI निदान', catConsultation: 'AI सल्ला',
    chat: 'चॅट', fitness: 'फिटनेस', medicine: 'औषध', emergency: 'आणीबाणी',
    settings: 'सेटिंग्ज', about: 'आमच्याबद्दल', more: 'अधिक', search: 'शोधा', login: 'लॉगिन',
  }),
  Tamil: make({ home: 'முகப்பு', tagline: 'உங்கள் வாழ்க்கையை ஆரோக்கியமாக்குங்கள்!', symptoms: 'அறிகுறிகள்', chat: 'அரட்டை', settings: 'அமைப்புகள்', about: 'பற்றி', search: 'தேடு' }),
  Telugu: make({ home: 'హోమ్', tagline: 'మీ జీవితాన్ని ఆరోగ్యకరంగా చేసుకోండి!', symptoms: 'లక్షణాలు', chat: 'చాట్', settings: 'సెట్టింగులు', search: 'వెతకండి' }),
  Dutch: make({ home: 'Home', tagline: 'Maak je leven gezonder!', symptoms: 'Symptomen', chat: 'Chat', fitness: 'Fitness', medicine: 'Medicijn', emergency: 'Noodgeval', settings: 'Instellingen', about: 'Over', more: 'Meer', search: 'Zoeken', login: 'Inloggen', language: 'Taal' }),
  Polish: make({ home: 'Start', tagline: 'Zrób swoje życie zdrowszym!', symptoms: 'Objawy', chat: 'Czat', settings: 'Ustawienia', about: 'O nas', search: 'Szukaj', login: 'Zaloguj', language: 'Język' }),
  Indonesian: make({ home: 'Beranda', tagline: 'Buat hidupmu lebih sehat!', symptoms: 'Gejala', chat: 'Obrolan', settings: 'Pengaturan', search: 'Cari', login: 'Masuk' }),
  Vietnamese: make({ home: 'Trang chủ', tagline: 'Làm cuộc sống của bạn khỏe mạnh hơn!', symptoms: 'Triệu chứng', chat: 'Trò chuyện', settings: 'Cài đặt', search: 'Tìm kiếm' }),
  Thai: make({ home: 'หน้าแรก', tagline: 'ทำให้ชีวิตของคุณมีสุขภาพดีขึ้น!', symptoms: 'อาการ', chat: 'แชท', settings: 'การตั้งค่า', search: 'ค้นหา' }),
  Swahili: make({ home: 'Nyumbani', tagline: 'Fanya maisha yako kuwa na afya bora!', symptoms: 'Dalili', chat: 'Mazungumzo', settings: 'Mipangilio', search: 'Tafuta' }),
  Greek: make({ home: 'Αρχική', tagline: 'Κάνε τη ζωή σου πιο υγιή!', symptoms: 'Συμπτώματα', chat: 'Συνομιλία', settings: 'Ρυθμίσεις', search: 'Αναζήτηση' }),
  Hebrew: make({ home: 'בית', tagline: 'הפוך את חייך לבריאים יותר!', symptoms: 'תסמינים', chat: 'צ׳אט', settings: 'הגדרות', search: 'חיפוש' }),
  Persian: make({ home: 'خانه', tagline: 'زندگی خود را سالم‌تر کنید!', symptoms: 'علائم', chat: 'گفتگو', settings: 'تنظیمات', search: 'جستجو' }),
  Ukrainian: make({ home: 'Головна', tagline: 'Зроби своє життя здоровішим!', symptoms: 'Симптоми', chat: 'Чат', settings: 'Налаштування', search: 'Пошук' }),
  Czech: make({ home: 'Domů', tagline: 'Udělejte svůj život zdravější!', symptoms: 'Příznaky', chat: 'Chat', settings: 'Nastavení', search: 'Hledat' }),
  Swedish: make({ home: 'Hem', tagline: 'Gör ditt liv hälsosammare!', symptoms: 'Symptom', chat: 'Chatt', settings: 'Inställningar', search: 'Sök' }),
};

export { EN as MASTER_EN_DICT };

export function useTranslation() {
  const [language] = useLocalStorage('healtify-language', 'English');
  // Re-render when AI translation cache updates.
  useTranslationVersion();

  // Kick off AI translation fetch for unsupported languages (one-time, cached).
  useEffect(() => {
    if (language === 'English') return;
    if (translations[language as string]) return; // we have a static dict
    if (getCachedTranslation(language as string)) return; // already cached
    fetchAndCacheTranslation(language as string, EN);
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    const staticDict = translations[language as string];
    if (staticDict && staticDict[key] !== undefined && staticDict[key] !== EN[key]) {
      return staticDict[key];
    }
    const aiDict = getCachedTranslation(language as string);
    if (aiDict && aiDict[key]) return aiDict[key];
    if (staticDict && staticDict[key] !== undefined) return staticDict[key];
    return EN[key] ?? fallback ?? key;
  };
  return { t, language };
}
