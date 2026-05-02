import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, X, Loader2, AlertTriangle, RefreshCw, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ParticleBackground } from '@/components/ParticleBackground';
import { FloatingBackground } from '@/components/FloatingBackground';

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-image`;

export default function ReportsPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast({ title: 'Camera Unavailable', description: 'Browser does not support camera. Use upload instead.', variant: 'destructive' });
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      setCameraActive(true);
      // Defer attaching srcObject until video element is in the DOM
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch (err: any) {
      const name = err?.name || '';
      let msg = 'Could not access camera.';
      if (name === 'NotAllowedError') msg = 'Camera permission denied. Allow camera in browser settings.';
      else if (name === 'NotFoundError') msg = 'No camera found on this device.';
      else if (name === 'NotReadableError') msg = 'Camera is in use by another application.';
      toast({ title: 'Camera Error', description: msg, variant: 'destructive' });
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current, video = videoRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    setImage(canvas.toDataURL('image/jpeg', 0.92));
    stopCamera();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => { setImage(null); setAnalysis(null); };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsLoading(true);
    setAnalysis(null);
    try {
      const response = await fetch(ANALYZE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ imageBase64: image, type: 'report' }),
      });
      if (response.status === 429) { toast({ title: 'Rate Limited', variant: 'destructive' }); return; }
      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data.analysis);

      // Auto-save to reports
      const existing = JSON.parse(localStorage.getItem('healthier-reports') || '[]');
      existing.push({
        id: `report-${Date.now()}`,
        type: 'report-analysis',
        title: `Medical Report Analysis`,
        date: new Date().toISOString().split('T')[0],
        summary: data.analysis.slice(0, 150) + '...',
        details: data.analysis,
      });
      localStorage.setItem('healthier-reports', JSON.stringify(existing));
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to analyze.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <ParticleBackground variant="reports" />
      <FloatingBackground variant="reports" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="icon-container w-16 h-16 mx-auto mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">Medical Report Analysis</h1>
            <p className="text-muted-foreground">Upload or capture X-rays, MRIs, CT scans, or other medical reports for AI-powered analysis</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
                {cameraActive ? (
                  <div className="relative aspect-video bg-black">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                    {/* Camera-style frame overlay */}
                    <div className="absolute inset-4 border-2 border-white/40 rounded-lg pointer-events-none" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-500 text-white text-xs font-medium animate-pulse">● LIVE</div>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                      <Button onClick={capturePhoto} size="lg" className="rounded-full w-16 h-16 p-0 bg-white hover:bg-white/90 text-black border-4 border-white/60">
                        <Camera className="h-7 w-7" />
                      </Button>
                      <Button onClick={stopCamera} variant="secondary" size="lg" className="rounded-full"><X className="h-5 w-5" /></Button>
                    </div>
                  </div>
                ) : image ? (
                  <div className="relative">
                    <img src={image} alt="Medical report" className="w-full object-contain bg-muted max-h-[400px]" />
                    <button onClick={clearImage} className="absolute top-2 right-2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
                    className="aspect-[4/3] flex flex-col items-center justify-center p-8 bg-muted/30">
                    <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium mb-1">Drop your report here</p>
                    <p className="text-sm text-muted-foreground mb-4">or use a button below</p>
                    <div className="flex gap-3">
                      <Button onClick={startCamera}><Camera className="mr-2 h-4 w-4" />Camera</Button>
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Upload</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">Supports: X-rays, MRIs, CT scans, lab reports, etc.</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>

              {image && !cameraActive && (
                <div className="flex gap-3">
                  <Button onClick={handleAnalyze} disabled={isLoading} className="flex-1" size="lg">
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing Report...</> : <><FileText className="mr-2 h-4 w-4" />Analyze Report</>}
                  </Button>
                  <Button variant="outline" size="lg" onClick={clearImage}><RefreshCw className="mr-2 h-4 w-4" />New Report</Button>
                </div>
              )}

              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="font-medium text-sm mb-2">Supported Report Types</h4>
                <div className="flex flex-wrap gap-2">
                  {['X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'Lab Report', 'ECG', 'Blood Test'].map((type) => (
                    <span key={type} className="px-2 py-1 rounded-md bg-background text-xs font-medium">{type}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {analysis ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold text-lg">Report Analysis</h3>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{analysis}</p>
                </motion.div>
              ) : (
                <div className="bg-card rounded-2xl p-6 border border-border shadow-soft text-center">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <h3 className="font-semibold mb-2">No Report Analyzed</h3>
                  <p className="text-sm text-muted-foreground">Upload or capture a medical report to get an AI-powered analysis</p>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-semibold text-warning mb-1">Professional Review Required</p>
                  <p>This AI analysis is for informational purposes only. All medical reports should be reviewed by qualified healthcare professionals.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
