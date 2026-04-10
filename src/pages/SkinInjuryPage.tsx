import { useState, useRef, useCallback } from 'react';
import { Scan, Camera, Upload, X, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';
import { AIResponseCard } from '@/components/AIResponseCard';
import { FloatingBackground } from '@/components/FloatingBackground';
import { ScrollReveal } from '@/components/ScrollReveal';

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-image`;

export default function SkinInjuryPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const [analysisType, setAnalysisType] = useState<'skin' | 'injury'>('skin');
  const [skinType, setSkinType] = useState('normal');
  const [bodyLocation, setBodyLocation] = useState('');
  const [duration, setDuration] = useState('today');
  const [itching, setItching] = useState('no');
  const [pain, setPain] = useState('no');
  const [changed, setChanged] = useState('no');
  const [age, setAge] = useState('');
  const [allergies, setAllergies] = useState('');
  const [sunExposure, setSunExposure] = useState('moderate');
  const [skinProducts, setSkinProducts] = useState('');
  const [bleedingLevel, setBleedingLevel] = useState('none');
  const [injuryCause, setInjuryCause] = useState('');
  const [tetanusStatus, setTetanusStatus] = useState('unknown');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      if (videoRef.current) { videoRef.current.srcObject = stream; streamRef.current = stream; setCameraActive(true); }
    } catch { toast({ title: 'Camera Error', description: 'Could not access camera.', variant: 'destructive' }); }
  };

  const stopCamera = () => { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; setCameraActive(false); };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current, video = videoRef.current;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    setImage(canvas.toDataURL('image/jpeg', 0.9));
    stopCamera();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onload = () => setImage(reader.result as string); reader.readAsDataURL(file); }
  };

  const clearImage = () => { setImage(null); setAnalysis(null); };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsLoading(true); setAnalysis(null);
    try {
      const context = analysisType === 'skin'
        ? `Analysis type: Skin condition. Skin type: ${skinType}. Body location: ${bodyLocation || 'not specified'}. Duration: ${duration}. Itching: ${itching}. Pain: ${pain}. Changed: ${changed}. Age: ${age || 'not specified'}. Sun exposure: ${sunExposure}. ${allergies ? `Allergies: ${allergies}` : ''} ${skinProducts ? `Products used: ${skinProducts}` : ''}`
        : `Analysis type: Injury/wound. Body location: ${bodyLocation || 'not specified'}. Pain level: ${pain}. Bleeding: ${bleedingLevel}. Cause: ${injuryCause || 'not specified'}. Duration since injury: ${duration}. Age: ${age || 'not specified'}. Tetanus status: ${tetanusStatus}. ${allergies ? `Allergies: ${allergies}` : ''}`;
      
      const response = await fetch(ANALYZE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ imageBase64: image, type: analysisType, context }),
      });
      if (response.status === 429) { toast({ title: 'Rate Limited', variant: 'destructive' }); return; }
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data.analysis);

      const existing = JSON.parse(localStorage.getItem('healthier-reports') || '[]');
      existing.push({
        id: `${analysisType}-${Date.now()}`,
        type: analysisType === 'skin' ? 'skin-analysis' : 'injury-analysis',
        title: `${analysisType === 'skin' ? 'Skin' : 'Injury'} Analysis — ${bodyLocation || 'Unspecified area'}`,
        date: new Date().toISOString().split('T')[0],
        summary: data.analysis.slice(0, 150) + '...',
        details: data.analysis,
      });
      localStorage.setItem('healthier-reports', JSON.stringify(existing));
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to analyze.', variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="relative">
      <FloatingBackground variant="skin" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <PageHeader
            icon={<Scan className="h-8 w-8 text-primary-foreground" />}
            title="Skin & Injury Analyzer"
            description="Upload a photo for AI-powered skin condition or injury assessment"
            gradient="from-primary to-secondary"
          />

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <ScrollReveal delay={0.1}>
                <div className="bg-card rounded-2xl p-4 border border-border shadow-soft hover:shadow-elevated transition-shadow duration-300">
                  <Label className="mb-2 block">What are you analyzing?</Label>
                  <ChipSelect options={['skin', 'injury']} value={analysisType} onChange={v => setAnalysisType(v as 'skin' | 'injury')}
                    formatLabel={v => v === 'skin' ? '🔍 Skin Condition' : '🩹 Injury / Wound'} allowCustom={false} />
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden hover:shadow-elevated transition-shadow duration-300">
                  {cameraActive && (
                    <div className="relative aspect-video bg-muted">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                        <Button onClick={capturePhoto} size="lg" className="hover:scale-105 active:scale-95 transition-transform"><Camera className="mr-2 h-5 w-5" />Capture</Button>
                        <Button onClick={stopCamera} variant="secondary" size="lg" className="hover:scale-105 active:scale-95 transition-transform"><X className="mr-2 h-5 w-5" />Cancel</Button>
                      </div>
                    </div>
                  )}
                  {image && !cameraActive && (
                    <div className="relative aspect-video">
                      <img src={image} alt="Uploaded" className="w-full h-full object-contain bg-muted" />
                      <button onClick={clearImage} className="absolute top-2 right-2 p-2 rounded-full bg-background/80 hover:bg-background hover:scale-110 transition-all"><X className="h-5 w-5" /></button>
                    </div>
                  )}
                  {!image && !cameraActive && (
                    <div className="aspect-video flex flex-col items-center justify-center p-8 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}>
                      <Scan className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground mb-6">Tap here to upload or use the buttons below</p>
                      <div className="flex gap-3">
                        <Button onClick={(e) => { e.stopPropagation(); startCamera(); }} size="lg" className="hover:scale-105 active:scale-95 transition-transform"><Camera className="mr-2 h-5 w-5" />Camera</Button>
                        <Button variant="outline" size="lg" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="hover:scale-105 active:scale-95 transition-transform"><Upload className="mr-2 h-5 w-5" />Upload</Button>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
                    </div>
                  )}
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4 hover:shadow-elevated transition-shadow duration-300">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Details (improves accuracy)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Age</Label><Input type="number" placeholder="30" value={age} onChange={e => setAge(e.target.value)} /></div>
                    <div><Label>Body Location</Label><Input placeholder="Face, arm, leg..." value={bodyLocation} onChange={e => setBodyLocation(e.target.value)} /></div>
                  </div>
                  <div><Label>How Long?</Label><ChipSelect options={['just now', 'today', '2-3 days', '1 week', '2+ weeks', '1+ month']} value={duration} onChange={setDuration} customPlaceholder="Specify duration..." /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Pain?</Label><ChipSelect options={['no', 'mild', 'moderate', 'severe']} value={pain} onChange={setPain} customPlaceholder="Describe pain..." /></div>
                    <div><Label>Itching?</Label><ChipSelect options={['no', 'mild', 'severe']} value={itching} onChange={setItching} customPlaceholder="Describe itching..." /></div>
                  </div>
                  <div><Label>Known Allergies</Label><Input placeholder="Latex, nickel, penicillin..." value={allergies} onChange={e => setAllergies(e.target.value)} /></div>

                  {analysisType === 'skin' && (
                    <>
                      <div><Label>Skin Type</Label><ChipSelect options={['dry', 'normal', 'oily', 'combination', 'sensitive']} value={skinType} onChange={setSkinType} customPlaceholder="Your skin type..." /></div>
                      <div><Label>Changed Recently?</Label><ChipSelect options={['no', 'growing', 'spreading', 'color-change']} value={changed} onChange={setChanged} customPlaceholder="Describe change..." /></div>
                      <div><Label>Sun Exposure</Label><ChipSelect options={['minimal', 'moderate', 'heavy']} value={sunExposure} onChange={setSunExposure} customPlaceholder="Describe exposure..." /></div>
                      <div><Label>Skincare Products</Label><Input placeholder="Retinol, sunscreen..." value={skinProducts} onChange={e => setSkinProducts(e.target.value)} /></div>
                    </>
                  )}

                  {analysisType === 'injury' && (
                    <>
                      <div><Label>Bleeding</Label><ChipSelect options={['none', 'light', 'moderate', 'heavy']} value={bleedingLevel} onChange={setBleedingLevel} customPlaceholder="Describe bleeding..." /></div>
                      <div><Label>Cause of Injury</Label><Input placeholder="Fall, cut, burn, bite..." value={injuryCause} onChange={e => setInjuryCause(e.target.value)} /></div>
                      <div><Label>Tetanus Vaccination</Label><ChipSelect options={['up-to-date', 'overdue', 'unknown']} value={tetanusStatus} onChange={setTetanusStatus} customPlaceholder="Vaccination status..." /></div>
                    </>
                  )}
                </div>
              </ScrollReveal>

              {image && (
                <ScrollReveal delay={0.25}>
                  <div className="flex gap-3">
                    <Button onClick={handleAnalyze} disabled={isLoading} className="flex-1 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200" size="lg">
                      {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Scan className="mr-2 h-4 w-4" />Analyze</>}
                    </Button>
                    <Button variant="outline" size="lg" onClick={clearImage} className="hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"><RefreshCw className="mr-2 h-4 w-4" />New</Button>
                  </div>
                </ScrollReveal>
              )}
            </div>

            <ScrollReveal delay={0.15} direction="right">
              <div className="space-y-4">
                <AIResponseCard
                  content={analysis}
                  isLoading={isLoading}
                  icon={<Scan className="h-5 w-5 text-primary" />}
                  title={analysisType === 'skin' ? 'Skin Analysis' : 'Injury Assessment'}
                  emptyIcon={<Scan className="h-16 w-16" />}
                  emptyTitle="No Image Analyzed"
                  emptyDescription="Upload or capture an image, fill in details, then analyze"
                  showDisclaimer={false}
                />
                <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-semibold text-destructive mb-1">Important</p>
                    <p>This AI analysis is for informational purposes only. For serious injuries with heavy bleeding, call emergency services. For any concerning skin conditions, consult a dermatologist.</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
