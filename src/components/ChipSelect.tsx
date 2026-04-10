import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface ChipSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  formatLabel?: (value: string) => string;
  className?: string;
  allowCustom?: boolean;
  customPlaceholder?: string;
}

export function ChipSelect({ options, value, onChange, formatLabel, className, allowCustom = true, customPlaceholder = 'Other...' }: ChipSelectProps) {
  const [showCustom, setShowCustom] = useState(false);
  const isCustomValue = value && !options.includes(value);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map(option => (
          <button
            key={option}
            type="button"
            onClick={() => { onChange(option); setShowCustom(false); }}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95",
              value === option
                ? "bg-primary text-primary-foreground shadow-glow"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:shadow-soft"
            )}
          >
            {formatLabel ? formatLabel(option) : option.replace(/-/g, ' ')}
          </button>
        ))}
        {allowCustom && (
          <button
            type="button"
            onClick={() => setShowCustom(!showCustom)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 border border-dashed",
              (showCustom || isCustomValue)
                ? "border-primary text-primary bg-primary/10"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            ✏️ Custom
          </button>
        )}
      </div>
      {(showCustom || isCustomValue) && allowCustom && (
        <Input
          placeholder={customPlaceholder}
          value={isCustomValue ? value : ''}
          onChange={e => onChange(e.target.value)}
          className="mt-1"
        />
      )}
    </div>
  );
}
