import { AlertTriangle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-6">
        {/* Disclaimer */}
        <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-warning/5 border border-warning/20">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-warning">Disclaimer:</span> This is an AI-powered medical assistant for basic diagnostics only. 
            Always consult healthcare professionals for medical advice. If you have a serious or urgent condition, 
            please contact a real doctor or emergency services immediately.
          </p>
        </div>

        {/* Footer Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-foreground">Mediredy</span>
            <span>v2.0</span>
            <span className="text-muted-foreground/50">•</span>
            <span>Powered by GPT-4o Vision & ElevenLabs</span>
          </div>
          <div className="text-center sm:text-right">
            <p>Created by Pratyush Dalmia • Mayo College Ajmer</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
