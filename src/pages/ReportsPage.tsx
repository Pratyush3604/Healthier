import { authHeaders, handleLimitResponse } from '@/lib/aiFetch';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import { FileText, Upload, X, Loader2, AlertTriangle, RefreshCw, Camera, FileSearch, ClipboardCheck, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ParticleBackground } from '@/components/ParticleBackground';
import { FloatingBackground } from '@/components/FloatingBackground';
import { extractClinicianQuestions, validateReportFile } from '@/lib/reportDocuments';

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-image`;
type ReportMode = 'lab' | 'prescription' | 'unknown';
type SelectedDocument = { dataUrl: string; mimeType: string; name: string };

function saveAnalysisAsPdf(analysis: string, mode: ReportMode) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const margin = 48;
  const title = mode === 'lab' ? 'Lab report summary' : mode === 'prescription' ? 'Prescription reading notes' : 'Document reading notes';

  pdf.setTextColor(20, 70, 82);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text('Healthier', margin, 54);
  pdf.setFontSize(14);
  pdf.text(title, margin, 82);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Created ${new Date().toLocaleDateString()}`, margin, 100);

  let y = 128;
  pdf.setFontSize(11);
  pdf.setTextColor(35, 45, 48);
  const lines = pdf.splitTextToSize(analysis.replace(/[#*`]/g, ''), width - margin * 2);
  for (const line of lines) {
    if (y > height - 100) {
      pdf.addPage();
      y = margin;
    }
    pdf.text(line, margin, y);
    y += 15;
  }

  if (y > height - 125) {
    pdf.addPage();
    y = margin;
  }
  pdf.setDrawColor(180, 140, 50);
  pdf.line(margin, y + 4, width - margin, y + 4);
  pdf.setFontSize(9);
  pdf.setTextColor(100, 80, 40);
  pdf.text(pdf.splitTextToSize('For information only—not a diagnosis or treatment plan. Verify every result and medication instruction against the original document with a qualified clinician or pharmacist. Do not change or start medication based on this summary.', width - margin * 2), margin, y + 22);
  pdf.save(`healthier-${mode}-notes-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export default function ReportsPage() {
  const [searchParams] = useSearchParams();
  const [document, setDocument] = useState<SelectedDocument | null>(null);
  const [mode, setMode] = useState<ReportMode>(() => {
    const kind = searchParams.get('kind');
    return kind === 'lab' || kind === 'prescription' ? kind : 'unknown';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [extraContext, setExtraContext] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  const questions = analysis ? extractClinicianQuestions(analysis) : null;

  useEffect(() => () => streamRef.current?.getTracks().forEach(track => track.stop()), []);

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
    } catch (err) {
      const name = err instanceof DOMException ? err.name : '';
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
    const sourceWidth = video.videoWidth || 1280;
    const sourceHeight = video.videoHeight || 720;
    const scale = Math.min(1, 2200 / Math.max(sourceWidth, sourceHeight));
    canvas.width = Math.round(sourceWidth * scale);
    canvas.height = Math.round(sourceHeight * scale);
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    setDocument({ dataUrl: canvas.toDataURL('image/jpeg', 0.88), mimeType: 'image/jpeg', name: 'camera-photo.jpg' });
    stopCamera();
  }, []);

  const loadFile = (file?: File) => {
    if (!file) return;
    const validationError = validateReportFile(file);
    if (validationError) {
      toast({ title: 'Choose another file', description: validationError, variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        toast({ title: 'Could not open file', description: 'Try another photo or PDF.', variant: 'destructive' });
        return;
      }
      const mimeType = file.type || 'application/pdf';
      setDocument({ dataUrl: reader.result, mimeType, name: file.name });
      setAnalysis(null);
    };
    reader.onerror = () => toast({ title: 'Could not open file', description: 'Try another photo or PDF.', variant: 'destructive' });
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    loadFile(e.dataTransfer.files?.[0]);
  };

  const clearDocument = () => { setDocument(null); setAnalysis(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const handleAnalyze = async () => {
    if (!document) return;
    setIsLoading(true);
    setAnalysis(null);
    try {
      const response = await fetch(ANALYZE_URL, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ imageBase64: document.dataUrl, mimeType: document.mimeType, fileName: document.name, type: 'report', reportMode: mode, context: extraContext }),
      });
      if (await handleLimitResponse(response)) return;
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(typeof errorBody?.error === 'string' ? errorBody.error : 'Could not read this document. Please try again.');
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data.analysis);

      // Auto-save to reports
      const existing = JSON.parse(localStorage.getItem('healthier-reports') || '[]');
      existing.push({
        id: `report-${Date.now()}`,
        type: 'report-analysis',
        title: mode === 'lab' ? 'Lab report summary' : mode === 'prescription' ? 'Prescription reading notes' : 'Health document summary',
        date: new Date().toISOString().split('T')[0],
        summary: data.analysis.slice(0, 150) + '...',
        details: data.analysis,
      });
      localStorage.setItem('healthier-reports', JSON.stringify(existing));
    } catch (error) {
      toast({ title: 'Could not analyze document', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <ParticleBackground variant="reports" />
      <FloatingBackground variant="reports" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
          <div className="mb-8 border-b border-border pb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-5"><ExternalLink className="h-4 w-4" />Healthier</Link>
            <div className="flex items-start gap-4">
              <div className="icon-container w-12 h-12 shrink-0"><FileSearch className="h-6 w-6" /></div>
              <div>
                <h1 className="font-display text-3xl font-bold mb-2">Understand a health document</h1>
                <p className="text-muted-foreground max-w-2xl">Get a careful plain-language summary, see what could not be read, and prepare questions for a qualified professional.</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Document type">
                {([
                  { id: 'lab', label: 'Lab report', icon: FileText },
                  { id: 'prescription', label: 'Prescription', icon: ClipboardCheck },
                  { id: 'unknown', label: 'Not sure', icon: FileSearch },
                ] as const).map(({ id, label, icon: Icon }) => (
                  <Button key={id} variant={mode === id ? 'default' : 'outline'} onClick={() => setMode(id)} aria-pressed={mode === id}>
                    <Icon className="h-4 w-4" />{label}
                  </Button>
                ))}
              </div>

              <div className="bg-card border border-border overflow-hidden">
                {cameraActive ? (
                  <div className="relative aspect-video bg-background">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute inset-4 border-2 border-foreground/40 rounded-lg pointer-events-none" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-destructive text-destructive-foreground text-xs font-medium animate-pulse">LIVE CAMERA</div>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                      <Button onClick={capturePhoto} size="lg" aria-label="Capture document photo" className="rounded-full w-16 h-16 p-0 border-4 border-background/60">
                        <Camera className="h-7 w-7" />
                      </Button>
                      <Button onClick={stopCamera} variant="secondary" size="lg" className="rounded-full"><X className="h-5 w-5" /></Button>
                    </div>
                  </div>
                ) : document ? (
                  <div className="relative min-h-64 flex flex-col items-center justify-center gap-3 p-6 bg-muted/30">
                    {document.mimeType === 'application/pdf' ? <FileText className="h-14 w-14 text-primary" /> : <img src={document.dataUrl} alt="Selected health document" className="max-h-72 max-w-full object-contain" />}
                    <p className="max-w-full break-all text-sm font-medium">{document.name}</p>
                    <Button onClick={clearDocument} variant="outline" size="sm"><X className="h-4 w-4" />Remove</Button>
                  </div>
                ) : (
                  <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
                    className="min-h-64 flex flex-col items-center justify-center p-8 text-center bg-muted/30">
                    <Upload className="h-12 w-12 mb-3 text-primary" />
                    <p className="font-medium mb-1">Add a clear photo or PDF</p>
                    <p className="text-sm text-muted-foreground mb-5">Place the whole page in good light. Files up to 10 MB.</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <Button onClick={startCamera}><Camera className="h-4 w-4" />Use camera</Button>
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" />Choose file</Button>
                    </div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="application/pdf,image/jpeg,image/png,image/webp,.pdf" capture="environment" onChange={(e) => loadFile(e.target.files?.[0])} className="hidden" />
              </div>

              <div className="space-y-2">
                <label htmlFor="document-context" className="text-sm font-medium">Optional note</label>
                <Textarea id="document-context" maxLength={500} value={extraContext} onChange={e => setExtraContext(e.target.value)} placeholder="For example: this is page 2 of my blood test report." />
                <p className="text-xs text-muted-foreground">Don’t add names, dates of birth, or other personal details.</p>
              </div>

              {document && !cameraActive && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleAnalyze} disabled={isLoading} className="flex-1" size="lg">
                    {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Reading document…</> : <><FileSearch className="h-4 w-4" />Explain this document</>}
                  </Button>
                  <Button variant="outline" size="lg" onClick={clearDocument}><RefreshCw className="h-4 w-4" />Start over</Button>
                </div>
              )}

              <p className="text-xs leading-relaxed text-muted-foreground">Your document is sent for analysis and is not saved as an upload. Only the written summary is saved in Health Reports on this device.</p>
            </div>

            <div className="space-y-4">
              {analysis ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-5 sm:p-6 border border-border">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-border">
                    <div className="flex items-center gap-3"><FileText className="h-6 w-6 text-primary" /><h2 className="font-semibold text-lg">Your reading notes</h2></div>
                    <Button variant="outline" size="sm" onClick={() => saveAnalysisAsPdf(analysis, mode)}><FileText className="h-4 w-4" />Save PDF</Button>
                  </div>
                  <div data-no-translate className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </div>
                  {questions && (
                    <div className="mt-6 pt-5 border-t border-border">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <h3 className="font-semibold">Questions to take to your clinician</h3>
                        <Button variant="outline" size="sm" onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(questions);
                            toast({ title: 'Questions copied' });
                          } catch {
                            toast({ title: 'Copy unavailable', description: 'Select the questions above and copy them.' });
                          }
                        }}><Copy className="h-4 w-4" />Copy</Button>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-muted-foreground prose-li:text-muted-foreground"><ReactMarkdown>{questions}</ReactMarkdown></div>
                    </div>
                  )}
                  <div className="mt-6 p-4 border border-warning/30 bg-warning/5 text-sm text-muted-foreground">
                    <p className="font-semibold text-warning mb-1">Check against the original</p>
                    <p>This AI summary may miss or misread details. It does not diagnose or prescribe. Confirm results with a qualified clinician; confirm every medicine name and instruction with your pharmacist or prescriber before acting.</p>
                  </div>
                </motion.div>
              ) : (
                <div className="min-h-64 border border-dashed border-border p-6 flex flex-col items-center justify-center text-center">
                  <FileSearch className="h-12 w-12 mb-3 text-primary/60" />
                  <h2 className="font-semibold mb-2">Your notes will appear here</h2>
                  <p className="text-sm text-muted-foreground max-w-sm">We’ll separate readable information from uncertain text and suggest questions for a healthcare professional.</p>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 border border-warning/20 bg-warning/5">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-semibold text-warning mb-1">Not a substitute for professional care</p>
                  <p>Never change a medicine or treatment based on an AI reading. If you feel seriously unwell, seek urgent medical care instead of waiting for an analysis.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
