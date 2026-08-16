import { useState } from 'react';
import { Eye, EyeOff, Lock, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const passwordRules = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'One number', test: (v: string) => /[0-9]/.test(v) },
  { label: 'One symbol', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export function passwordScore(value: string) {
  return passwordRules.filter((r) => r.test(value)).length;
}

export function PasswordField({
  id,
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative mt-1.5">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  const score = passwordScore(value);
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-destructive', 'bg-destructive', 'bg-warning', 'bg-primary', 'bg-success'];
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden flex gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`flex-1 rounded-full ${i < score ? colors[score - 1] : 'bg-muted'}`} />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{labels[Math.max(0, score - 1)]}</span>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {passwordRules.map((r) => {
          const ok = r.test(value);
          return (
            <li key={r.label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-success' : 'text-muted-foreground'}`}>
              {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              {r.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
