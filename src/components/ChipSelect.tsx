import { cn } from '@/lib/utils';

interface ChipSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  formatLabel?: (value: string) => string;
  className?: string;
}

export function ChipSelect({ options, value, onChange, formatLabel, className }: ChipSelectProps) {
  return (
    <div className={cn("flex flex-wrap gap-2 mt-2", className)}>
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
            value === option
              ? "bg-primary text-primary-foreground shadow-glow"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          {formatLabel ? formatLabel(option) : option.replace(/-/g, ' ')}
        </button>
      ))}
    </div>
  );
}
