import { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIResponseCardProps {
  content: string | null;
  isLoading?: boolean;
  icon?: React.ReactNode;
  title?: string;
  urgency?: 'low' | 'medium' | 'high' | null;
  className?: string;
  maxHeight?: string;
  showDisclaimer?: boolean;
  disclaimerText?: string;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
}

const urgencyConfig = {
  low: { label: 'Low Urgency — Monitor and home care may help', color: 'text-success', bg: 'bg-success/10 border-success/30' },
  medium: { label: 'Medium Urgency — See a doctor soon', color: 'text-warning', bg: 'bg-warning/10 border-warning/30' },
  high: { label: 'High Urgency — Seek immediate medical attention', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30' },
};

export const AIResponseCard = forwardRef<HTMLDivElement, AIResponseCardProps>(({
  content,
  isLoading = false,
  icon,
  title = 'AI Analysis',
  urgency,
  className,
  maxHeight = '600px',
  showDisclaimer = true,
  disclaimerText = 'This is for informational purposes only and not a medical diagnosis. Always consult a qualified professional.',
  emptyIcon,
  emptyTitle = 'No Analysis Yet',
  emptyDescription = 'Fill in the form and submit to get results',
}, ref) => {
  if (isLoading && !content) {
    return (
      <div ref={ref} className="bg-card rounded-2xl p-12 border border-border text-center animate-pulse">
        <Loader2 className="h-10 w-10 text-primary mx-auto mb-4 animate-spin" />
        <p className="text-muted-foreground">Analyzing...</p>
      </div>
    );
  }

  if (!content && !isLoading) {
    return (
      <div ref={ref} className="space-y-4">
        <div className="bg-card rounded-2xl p-12 border border-border text-center">
          {emptyIcon && <div className="mb-4 flex justify-center opacity-30">{emptyIcon}</div>}
          <h3 className="text-xl font-semibold mb-2">{emptyTitle}</h3>
          <p className="text-muted-foreground">{emptyDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("space-y-4", className)}>
      {urgency && (
        <div className={cn("flex items-center gap-2 px-4 py-3 rounded-xl border", urgencyConfig[urgency].bg)}>
          <AlertTriangle className={cn("h-5 w-5", urgencyConfig[urgency].color)} />
          <span className={cn("font-semibold text-sm", urgencyConfig[urgency].color)}>
            {urgencyConfig[urgency].label}
          </span>
        </div>
      )}

      <div className="bg-card rounded-2xl p-6 border border-border shadow-soft overflow-y-auto" style={{ maxHeight }}>
        {(icon || title) && (
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            {icon}
            {title}
          </h3>
        )}
        <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary">
          <ReactMarkdown>{content ?? ''}</ReactMarkdown>
        </div>
        {isLoading && (
          <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5 rounded-sm" />
        )}
      </div>

      {showDisclaimer && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">{disclaimerText}</p>
        </div>
      )}
    </div>
  );
});

AIResponseCard.displayName = 'AIResponseCard';
