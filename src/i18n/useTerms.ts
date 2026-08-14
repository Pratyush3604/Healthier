/**
 * Vocabulary translation for long domain word-lists (symptoms, categories,
 * chip options, form questions). Unlike the UI dictionary in useTranslation,
 * these terms are keyed by their English string and translated on demand
 * through the `translate-ui` edge function, then cached in localStorage.
 *
 * The English term always stays the canonical value used in state and in the
 * AI prompt — only the *displayed* label changes with the language.
 */
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const CACHE_PREFIX = 'healtify-terms-v1::';
const CHUNK = 120;

type Dict = Record<string, string>;

const memCache: Record<string, Dict> = {};
const inflight: Record<string, Promise<void>> = {};

function readCache(language: string): Dict {
  if (memCache[language]) return memCache[language];
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + language);
    const parsed = raw ? JSON.parse(raw) : {};
    memCache[language] = parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    memCache[language] = {};
  }
  return memCache[language];
}

function writeCache(language: string, dict: Dict) {
  memCache[language] = dict;
  try {
    localStorage.setItem(CACHE_PREFIX + language, JSON.stringify(dict));
  } catch {
    /* quota — memory cache still serves this session */
  }
}

async function translateChunk(language: string, terms: string[]): Promise<Dict> {
  const dict: Dict = {};
  terms.forEach((term) => { dict[term] = term; });
  const { data, error } = await supabase.functions.invoke('translate-ui', {
    body: { language, dict },
  });
  if (error) throw error;
  const translated = (data as { translated?: Dict } | null)?.translated;
  return translated && typeof translated === 'object' ? translated : {};
}

async function ensureTerms(language: string, terms: string[]): Promise<void> {
  const cache = readCache(language);
  const missing = terms.filter((term) => !cache[term]);
  if (missing.length === 0) return;

  const key = `${language}::${missing.length}::${missing[0]}`;
  if (inflight[key]) return inflight[key];

  inflight[key] = (async () => {
    const next: Dict = { ...cache };
    for (let i = 0; i < missing.length; i += CHUNK) {
      const slice = missing.slice(i, i + CHUNK);
      try {
        Object.assign(next, await translateChunk(language, slice));
      } catch (e) {
        console.warn('term translation failed', e);
      }
      writeCache(language, next);
      window.dispatchEvent(new CustomEvent('healtify-terms-updated', { detail: { language } }));
    }
  })();

  try {
    await inflight[key];
  } finally {
    delete inflight[key];
  }
}

export function useTerms(terms: string[]) {
  const [language] = useLocalStorage('healtify-language', 'English');
  const [version, setVersion] = useState(0);
  const lang = String(language);

  // Stable signature so the effect doesn't refire on every render.
  const signature = useMemo(() => `${terms.length}:${terms[0] ?? ''}:${terms[terms.length - 1] ?? ''}`, [terms]);

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener('healtify-terms-updated', bump);
    return () => window.removeEventListener('healtify-terms-updated', bump);
  }, []);

  useEffect(() => {
    if (lang === 'English') return;
    void ensureTerms(lang, terms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, signature]);

  const dict = lang === 'English' ? null : readCache(lang);

  return useMemo(() => {
    const tt = (term: string) => (dict?.[term] ?? term);
    return {
      /** Localized label for an English term (falls back to English). */
      tt,
      /** True while at least one term is still untranslated. */
      pending: lang !== 'English' && terms.some((term) => !dict?.[term]),
      language: lang,
      /** Search helper: matches the English term or its localized label. */
      matches: (term: string, query: string) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return term.toLowerCase().includes(q) || tt(term).toLowerCase().includes(q);
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, version, signature, dict]);
}
