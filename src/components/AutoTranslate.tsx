import { useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { startDomTranslation } from '@/i18n/domTranslate';

/**
 * Invisible controller that keeps the entire rendered page in the user's
 * selected language — including any label that was never wrapped in `t()`.
 * Mounted once in Layout.
 */
export function AutoTranslate() {
  const [language] = useLocalStorage<string>('healtify-language', 'English');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stop = startDomTranslation(language);
    return stop;
  }, [language]);

  // A language switch must repaint from the original English source, otherwise
  // previously swapped text would be translated twice.
  useEffect(() => {
    document.documentElement.lang = language === 'English' ? 'en' : language.slice(0, 2).toLowerCase();
  }, [language]);

  return null;
}
