import { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function AnnouncementBanner() {
  const [text, setText] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    void supabase.from('app_settings').select('value').eq('key', 'announcement').maybeSingle()
      .then(({ data }) => setText(data?.value?.trim() || null));
  }, []);

  if (!text || hidden) return null;
  return (
    <div className="relative z-20 bg-primary text-primary-foreground text-sm">
      <div className="container mx-auto px-4 py-2 flex items-center gap-2">
        <Megaphone className="h-4 w-4 shrink-0" />
        <span className="flex-1">{text}</span>
        <button aria-label="Dismiss" onClick={() => setHidden(true)}><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
