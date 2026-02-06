// API Configuration - connects to the existing Mediredy backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.com';

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {};
  
  // Don't set Content-Type for FormData (browser handles it)
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
  audio?: string;
  timestamp: string;
}

export interface SymptomRequest {
  symptoms: string[];
  additional_info?: string;
}

export interface SymptomAssessment {
  symptoms: string[];
  assessment: string;
  timestamp: string;
  disclaimer: string;
}

export interface VitalSigns {
  heart_rate?: number;
  spo2?: number;
  temperature?: number;
  blood_pressure?: string;
}

export interface VitalSignsAnalysis {
  vitals: VitalSigns;
  analysis: string;
  timestamp: string;
}

export interface InjuryAnalysis {
  filename: string;
  analysis: string;
  analyzed_by: string;
  timestamp: string;
  disclaimer: string;
}

export interface ReportAnalysis {
  filename: string;
  analysis: string;
  analyzed_by: string;
  timestamp: string;
  disclaimer: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  apis: {
    openai: string;
    elevenlabs: string;
  };
}

// API Functions

/**
 * Check backend health status
 */
export async function checkHealth(): Promise<HealthStatus> {
  return fetchAPI<HealthStatus>('/health');
}

/**
 * Send a chat message to the AI doctor
 */
export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = []
): Promise<ChatResponse> {
  return fetchAPI<ChatResponse>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
}

/**
 * Get symptom assessment from AI
 */
export async function getSymptomAssessment(
  symptoms: string[],
  additionalInfo?: string
): Promise<SymptomAssessment> {
  return fetchAPI<SymptomAssessment>('/api/symptom-assessment', {
    method: 'POST',
    body: JSON.stringify({
      symptoms,
      additional_info: additionalInfo,
    }),
  });
}

/**
 * Analyze vital signs
 */
export async function analyzeVitalSigns(
  vitals: VitalSigns
): Promise<VitalSignsAnalysis> {
  return fetchAPI<VitalSignsAnalysis>('/api/vital-signs', {
    method: 'POST',
    body: JSON.stringify(vitals),
  });
}

/**
 * Analyze an injury from image
 */
export async function analyzeInjury(
  imageFile: File | Blob
): Promise<InjuryAnalysis> {
  const formData = new FormData();
  formData.append('file', imageFile, 'injury.jpg');

  return fetchAPI<InjuryAnalysis>('/api/injury-detection', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Analyze a medical report from image
 */
export async function analyzeReport(
  imageFile: File | Blob
): Promise<ReportAnalysis> {
  const formData = new FormData();
  formData.append('file', imageFile, 'report.jpg');

  return fetchAPI<ReportAnalysis>('/api/report-analysis', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Convert base64 to blob for audio playback
 */
export function base64ToBlob(base64: string, mimeType: string = 'audio/mp3'): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Play audio from base64 string
 */
export function playBase64Audio(base64Audio: string): HTMLAudioElement {
  const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
  audio.play().catch(console.error);
  return audio;
}

/**
 * Use browser's speech synthesis as fallback
 */
export function speakText(text: string, maxDuration: number = 30000): void {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.1;
  utterance.pitch = 1;

  // Set a timeout to stop speech after maxDuration
  const timeoutId = setTimeout(() => {
    window.speechSynthesis.cancel();
  }, maxDuration);

  utterance.onend = () => clearTimeout(timeoutId);
  utterance.onerror = () => clearTimeout(timeoutId);

  window.speechSynthesis.speak(utterance);
}

/**
 * Determine urgency level from assessment text
 */
export function parseUrgencyLevel(text: string): 'low' | 'medium' | 'high' {
  const lowerText = text.toLowerCase();
  
  // High urgency keywords
  const highUrgency = [
    'emergency', 'urgent', 'immediately', 'call 911', 
    'seek immediate', 'life-threatening', 'severe', 'critical'
  ];
  
  // Medium urgency keywords
  const mediumUrgency = [
    'soon', 'within 24 hours', 'see a doctor', 'consult',
    'moderate', 'concerning', 'recommend seeing'
  ];

  if (highUrgency.some(keyword => lowerText.includes(keyword))) {
    return 'high';
  }
  
  if (mediumUrgency.some(keyword => lowerText.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
}
