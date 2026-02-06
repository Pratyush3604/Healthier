import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analyzeInjury, parseUrgencyLevel } from '@/services/api';

export default function InjuryPage() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      alert('Could not access camera. Please check permissions or use file upload.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      setImage(imageData);
      
      // Convert to blob/file
      canvas.toBlob((blob) => {
        if (blob) {
          setImageFile(new File([blob], 'injury.jpg', { type: 'image/jpeg' }));
        }
      }, 'image/jpeg', 0.9);
    }
    
    stopCamera();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImageFile(null);
    setAnalysis(null);
    setUrgency(null);
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    
    setIsLoading(true);
    setAnalysis(null);
    setUrgency(null);

    try {
      const result = await analyzeInjury(imageFile);
      setAnalysis(result.analysis);
      setUrgency(parseUrgencyLevel(result.analysis));
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysis('Unable to analyze image. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyStyles = () => {
    switch (urgency) {
      case 'high': return 'urgent-warning';
      case 'medium': return 'urgency-medium rounded-2xl p-6';
      case 'low': return 'urgency-low rounded-2xl p-6';
      default: return 'bg-card border border-border rounded-2xl p-6';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="icon-container w-16 h-16 mx-auto mb-4 bg-success/10">
            <Camera className="h-8 w-8 text-success" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Injury Detection</h1>
          <p className="text-muted-foreground">
            Take a photo or upload an image of an injury for AI-powered assessment
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Camera/Upload Section */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
              {/* Camera View */}
              {cameraActive && (
                <div className="relative aspect-video bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                    <Button onClick={capturePhoto} size="lg" className="shadow-lg">
                      <Camera className="mr-2 h-5 w-5" />
                      Capture
                    </Button>
                    <Button onClick={stopCamera} variant="secondary" size="lg">
                      <X className="mr-2 h-5 w-5" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {image && !cameraActive && (
                <div className="relative aspect-video">
                  <img
                    src={image}
                    alt="Captured injury"
                    className="w-full h-full object-contain bg-muted"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Upload/Camera Options */}
              {!image && !cameraActive && (
                <div className="aspect-video flex flex-col items-center justify-center p-8 bg-muted/30">
                  <div className="text-center mb-6">
                    <Camera className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Take a photo or upload an image of the injury
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={startCamera} size="lg">
                      <Camera className="mr-2 h-5 w-5" />
                      Use Camera
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      Upload
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Analyze Button */}
            {image && (
              <div className="flex gap-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="flex-1"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Analyze Injury
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={clearImage}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  New Image
                </Button>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {/* Analysis Results */}
            {analysis ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={getUrgencyStyles()}
              >
                <div className="flex items-center gap-3 mb-4">
                  {urgency === 'high' && <AlertTriangle className="h-6 w-6" />}
                  <h3 className="font-semibold text-lg">Injury Analysis</h3>
                  {urgency && (
                    <span className="ml-auto text-sm font-medium uppercase">
                      {urgency} severity
                    </span>
                  )}
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {analysis}
                  </p>
                </div>

                {urgency === 'high' && (
                  <div className="mt-4 p-4 bg-background/50 rounded-xl">
                    <p className="text-sm font-semibold">
                      🚨 This injury appears serious. Please seek professional medical attention immediately.
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-card rounded-2xl p-6 border border-border shadow-soft text-center">
                <Camera className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="font-semibold mb-2">No Image Analyzed</h3>
                <p className="text-sm text-muted-foreground">
                  Upload or capture an image to get an AI-powered injury assessment
                </p>
              </div>
            )}

            {/* Safety Warning */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-destructive mb-1">Important Safety Notice</p>
                <p>
                  This AI analysis is for basic assessment only. For any serious injury, 
                  excessive bleeding, or if you're unsure, please contact emergency services 
                  or visit a healthcare facility immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
