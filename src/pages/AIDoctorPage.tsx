import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bot, Mic, MicOff, Camera, FileText, Loader2, Phone, PhoneOff, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  sendChatMessage, 
  analyzeInjury, 
  analyzeReport, 
  ChatMessage,
  playBase64Audio,
  speakText 
} from '@/services/api';
import { cn } from '@/lib/utils';
import '@/types/speech.d.ts';

type SpeechRecognitionType = InstanceType<typeof window.SpeechRecognition> | null;

export default function AIDoctorPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<SpeechRecognitionType>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);

        if (event.results[current].isFinal) {
          handleVoiceMessage(transcript);
          setTranscript('');
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.error('Speech error:', event.error);
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      stopCamera();
      stopListening();
    };
  }, [isListening]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Recognition start error:', e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        setIsListening(false);
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Recognition stop error:', e);
      }
    }
  };

  const startSession = async () => {
    setIsActive(true);
    await startCamera();
    startListening();
    
    const welcomeMsg: ChatMessage = {
      role: 'assistant',
      content: "Hello! I'm Dr. Mediredy, your AI medical assistant. You can speak to me or use the buttons to analyze an injury or medical report. How can I help you today?"
    };
    setMessages([welcomeMsg]);
    speakText(welcomeMsg.content, 10000);
  };

  const endSession = () => {
    stopListening();
    stopCamera();
    setIsActive(false);
    setMessages([]);
    setCapturedImage(null);
    setTranscript('');
  };

  const handleVoiceMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await sendChatMessage(text, history);
      const aiMsg: ChatMessage = { role: 'assistant', content: response.response };
      setMessages(prev => [...prev, aiMsg]);

      // Play audio response
      if (response.audio) {
        playBase64Audio(response.audio);
      } else {
        speakText(response.response, 15000);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = { 
        role: 'assistant', 
        content: 'I apologize, I encountered an error. Please try again.' 
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const captureImage = useCallback((): Blob | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      setCapturedImage(canvas.toDataURL('image/jpeg'));
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
    }) as unknown as Blob;
  }, []);

  const analyzeInjuryFromCamera = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsAnalyzing(true);
    stopListening();

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL('image/jpeg'));

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9);
      });

      const result = await analyzeInjury(blob);
      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: `🔍 **Injury Analysis:**\n\n${result.analysis}`
      };
      setMessages(prev => [...prev, aiMsg]);
      speakText("I've analyzed the image. " + result.analysis.substring(0, 200), 10000);
    } catch (error) {
      console.error('Analysis error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Failed to analyze injury.' }]);
    } finally {
      setIsAnalyzing(false);
      startListening();
    }
  };

  const analyzeReportFromCamera = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsAnalyzing(true);
    stopListening();

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL('image/jpeg'));

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9);
      });

      const result = await analyzeReport(blob);
      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: `📋 **Report Analysis:**\n\n${result.analysis}`
      };
      setMessages(prev => [...prev, aiMsg]);
      speakText("I've analyzed the report. " + result.analysis.substring(0, 200), 10000);
    } catch (error) {
      console.error('Analysis error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Failed to analyze report.' }]);
    } finally {
      setIsAnalyzing(false);
      startListening();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="icon-container w-16 h-16 mx-auto mb-4 bg-success/10">
            <Bot className="h-8 w-8 text-success" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">AI Doctor Consultation</h1>
          <p className="text-muted-foreground">
            Voice-powered medical consultation with real-time image analysis
          </p>
        </div>

        {!isActive ? (
          /* Start Session Screen */
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="bg-card rounded-3xl p-8 border border-border shadow-elevated">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
                <Phone className="h-12 w-12 text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-3">
                Start Voice Consultation
              </h2>
              <p className="text-muted-foreground mb-6">
                Begin a voice-powered session with the AI Doctor. You can speak naturally, 
                show injuries via camera, or present medical reports for analysis.
              </p>
              <Button onClick={startSession} size="lg" className="px-8 shadow-glow">
                <Phone className="mr-2 h-5 w-5" />
                Start Session
              </Button>

              <div className="mt-6 p-4 rounded-xl bg-warning/5 border border-warning/20">
                <p className="text-sm text-muted-foreground">
                  ⚠️ This is for basic diagnostics only. For serious conditions, 
                  please contact a real doctor.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Active Session */
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Video & Controls */}
            <div className="space-y-4">
              <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
                {/* Video Feed */}
                <div className="relative aspect-video bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Listening Indicator */}
                  {isListening && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/90 text-success-foreground text-sm font-medium">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      Listening
                    </div>
                  )}

                  {/* Captured Image Preview */}
                  {capturedImage && (
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="absolute bottom-4 right-4 w-24 h-24 rounded-lg border-2 border-primary shadow-lg object-cover"
                    />
                  )}

                  {/* Analyzing Overlay */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p className="font-medium">Analyzing...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="p-4 flex flex-wrap gap-2">
                  <Button
                    onClick={isListening ? stopListening : startListening}
                    variant={isListening ? 'destructive' : 'default'}
                    className="flex-1"
                  >
                    {isListening ? (
                      <>
                        <MicOff className="mr-2 h-4 w-4" />
                        Stop Listening
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Start Listening
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={analyzeInjuryFromCamera}
                    disabled={isAnalyzing}
                    variant="secondary"
                    className="flex-1"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Analyze Injury
                  </Button>

                  <Button
                    onClick={analyzeReportFromCamera}
                    disabled={isAnalyzing}
                    variant="secondary"
                    className="flex-1"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Analyze Report
                  </Button>
                </div>

                {/* End Session Button */}
                <div className="px-4 pb-4">
                  <Button
                    onClick={endSession}
                    variant="outline"
                    className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <PhoneOff className="mr-2 h-4 w-4" />
                    End Session
                  </Button>
                </div>
              </div>

              {/* Transcript */}
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-muted rounded-xl p-4"
                >
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">
                    You're saying:
                  </p>
                  <p className="text-foreground">{transcript}</p>
                </motion.div>
              )}
            </div>

            {/* Chat History */}
            <div className="bg-card rounded-2xl border border-border shadow-soft flex flex-col h-[600px]">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Conversation
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Start speaking to begin the consultation
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex",
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] px-4 py-3 text-sm",
                          msg.role === 'user'
                            ? 'chat-bubble-user'
                            : 'chat-bubble-ai'
                        )}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
