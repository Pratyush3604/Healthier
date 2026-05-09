import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const CACHE_PREFIX = 'healtify-translations-v1::';

// In-memory cache so multiple components don't all hit localStorage.
const memCache: Record<string, Record<string, string>> = {};

export function getCachedTranslation(language: string): Record<string, string> | null {
  if (language === 'English') return null;
  if (memCache[language]) return memCache[language];
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + language);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      memCache[language] = parsed;
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

const inflight: Record<string, Promise<void>> = {};

export async function fetchAndCacheTranslation(language: string, masterDict: Record<string, string>): Promise<Record<string, string> | null> {
  if (language === 'English') return null;
  if (memCache[language]) return memCache[language];
  if (inflight[language]) {
    await inflight[language];
    return memCache[language] ?? null;
  }
  inflight[language] = (async () => {
    try {
      const { data, error } = await supabase.functions.invoke('translate-ui', {
        body: { language, dict: masterDict },
      });
      if (error) {
        console.warn('translate-ui error', error);
        return;
      }
      const translated = (data as any)?.translated;
      if (translated && typeof translated === 'object') {
        memCache[language] = translated;
        try { localStorage.setItem(CACHE_PREFIX + language, JSON.stringify(translated)); } catch { /* quota */ }
        // notify listeners
        window.dispatchEvent(new CustomEvent('healtify-translations-updated', { detail: { language } }));
      }
    } catch (e) {
      console.warn('translate-ui failed', e);
    }
  })();
  await inflight[language];
  delete inflight[language];
  return memCache[language] ?? null;
}

/**
 * Subscribes the calling component to language + cached-translation changes
 * so it re-renders when the AI translation arrives.
 */
export function useTranslationVersion(): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    const handler = () => setV(x => x + 1);
    window.addEventListener('healtify-translations-updated', handler);
    window.addEventListener('healtify-storage-change', handler);
    return () => {
      window.removeEventListener('healtify-translations-updated', handler);
      window.removeEventListener('healtify-storage-change', handler);
    };
  }, []);
  return v;
}
