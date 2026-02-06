import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, X, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analyzeReport } from '@/services/api';

export default function ReportsPage() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const clearImage = () => {
    setImage(null);
    setImageFile(null);
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    
    setIsLoading(true);
    setAnalysis(null);

    try {
      const result = await analyzeReport(imageFile);
      setAnalysis(result.analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysis('Unable to analyze report. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
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
          <div className="icon-container w-16 h-16 mx-auto mb-4">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Medical Report Analysis</h1>
          <p className="text-muted-foreground">
            Upload X-rays, MRIs, CT scans, or other medical reports for AI-powered analysis
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
              {/* Image Preview */}
              {image ? (
                <div className="relative">
                  <img
                    src={image}
                    alt="Medical report"
                    className="w-full object-contain bg-muted max-h-[400px]"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[4/3] flex flex-col items-center justify-center p-8 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="text-center">
                    <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium mb-1">Drop your report here</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse files
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports: X-rays, MRIs, CT scans, lab reports, etc.
                    </p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
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
                      Analyzing Report...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Analyze Report
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={clearImage}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  New Report
                </Button>
              </div>
            )}

            {/* Supported Formats */}
            <div className="bg-muted/30 rounded-xl p-4">
              <h4 className="font-medium text-sm mb-2">Supported Report Types</h4>
              <div className="flex flex-wrap gap-2">
                {['X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'Lab Report', 'ECG', 'Blood Test'].map((type) => (
                  <span key={type} className="px-2 py-1 rounded-md bg-background text-xs font-medium">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {/* Analysis Results */}
            {analysis ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-soft"
              >
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold text-lg">Report Analysis</h3>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {analysis}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="bg-card rounded-2xl p-6 border border-border shadow-soft text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="font-semibold mb-2">No Report Analyzed</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a medical report to get an AI-powered analysis
                </p>
              </div>
            )}

            {/* Analysis Tips */}
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
              <h4 className="font-medium text-sm mb-2 text-primary">Tips for Better Analysis</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ensure the image is clear and well-lit</li>
                <li>• Include the entire report in the frame</li>
                <li>• Make sure text and images are readable</li>
                <li>• Higher resolution images produce better results</li>
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-warning mb-1">Professional Review Required</p>
                <p>
                  This AI analysis is for informational purposes only. All medical reports 
                  should be reviewed and interpreted by qualified healthcare professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
