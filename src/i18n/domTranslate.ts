/**
 * Whole-page auto translation.
 *
 * The static dictionaries in `useTranslation` only cover strings that were
 * explicitly wrapped in `t()`. This module closes the gap: it walks the
 * rendered DOM, collects every remaining English label (buttons, headings,
 * card copy, placeholders, aria-labels, titles) and swaps it for a translated
 * value produced by the `translate-ui` edge function.
 *
 * Results are cached in localStorage per language, so after the first visit a
 * language switch is instant and offline-safe.
 */
import { supabase } from '@/integrations/supabase/client';

const CACHE_PREFIX = 'healtify-text-cache-v1::';
const MAX_BATCH = 60;
const TRANSLATED_ATTRS = ['placeholder', 'aria-label', 'title', 'alt'] as const;

/** Tags whose text must never be touched. */
const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA', 'SVG', 'PATH', 'CANVAS',
]);

/** Strings that must stay exactly as-is. */
const SKIP_EXACT = new Set(['Healthier', 'AI', 'BMI', 'SpO2', 'BP', 'MRI', 'X-ray', 'WRO']);

type Record$ = Record<string, string>;

const caches: Record<string, Record$> = {};
const pending = new Set<string>();
const failed = new Set<string>();
let flushTimer: number | undefined;
let scanTimer: number | undefined;
let applying = false;
let currentLanguage = 'English';
/** Bumped on every language switch so already-swapped nodes are revisited. */
let generation = 0;
let observer: MutationObserver | undefined;

/* ------------------------------------------------------------------ cache */

function loadCache(language: string): Record$ {
  if (caches[language]) return caches[language];
  let parsed: Record$ = {};
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + language);
    if (raw) {
      const val = JSON.parse(raw);
      if (val && typeof val === 'object') parsed = val;
    }
  } catch {
    /* corrupt cache — start fresh */
  }
  caches[language] = parsed;
  return parsed;
}

function saveCache(language: string) {
  try {
    localStorage.setItem(CACHE_PREFIX + language, JSON.stringify(caches[language] ?? {}));
  } catch {
    /* storage full — memory cache still works for this session */
  }
}

/* ----------------------------------------------------------- eligibility */

/** Only translate strings that actually look like human language. */
function isTranslatable(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 2 || trimmed.length > 400) return false;
  if (SKIP_EXACT.has(trimmed)) return false;
  if (failed.has(trimmed)) return false;
  // Needs at least two consecutive latin letters to be a word.
  if (!/[A-Za-z]{2}/.test(trimmed)) return false;
  // Skip URLs, emails and file paths.
  if (/^(https?:\/\/|www\.|\/)/.test(trimmed)) return false;
  if (/@[\w.-]+\.\w+/.test(trimmed)) return false;
  return true;
}

function isSkippedNode(node: Node): boolean {
  let el: HTMLElement | null =
    node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
  while (el) {
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (el.hasAttribute?.('data-no-translate')) return true;
    if (el.getAttribute?.('translate') === 'no') return true;
    el = el.parentElement;
  }
  return false;
}

/* --------------------------------------------------------------- tracking */

type NodeRecord = { orig: string; out: string; gen: number };
const textState = new WeakMap<Text, NodeRecord>();
const attrState = new WeakMap<Element, Record<string, NodeRecord>>();

/* ---------------------------------------------------------------- network */

async function flushPending() {
  flushTimer = undefined;
  const language = currentLanguage;
  if (language === 'English' || pending.size === 0) return;

  const batch = Array.from(pending).slice(0, MAX_BATCH);
  batch.forEach((t) => pending.delete(t));

  // translate-ui takes a key/value dictionary, so index the batch.
  const dict: Record$ = {};
  batch.forEach((text, i) => { dict['s' + i] = text; });

  try {
    const { data, error } = await supabase.functions.invoke('translate-ui', {
      body: { language, dict },
    });
    if (error) throw error;
    const translated = (data as { translated?: Record$ })?.translated;
    if (!translated) throw new Error('empty translation');

    const cache = loadCache(language);
    batch.forEach((text, i) => {
      const out = translated['s' + i];
      if (typeof out === 'string' && out.trim()) cache[text] = out;
      else failed.add(text);
    });
    saveCache(language);
    scheduleScan();
  } catch {
    // Don't retry these strings this session — they stay in English.
    batch.forEach((text) => failed.add(text));
  }

  if (pending.size > 0) scheduleFlush();
}

function scheduleFlush() {
  if (flushTimer !== undefined) return;
  flushTimer = window.setTimeout(flushPending, 400);
}

/* ------------------------------------------------------------------- scan */

function translateTextNodes(root: Node, cache: Record$) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    nodes.push(node as Text);
    node = walker.nextNode();
  }

  for (const textNode of nodes) {
    const value = textNode.nodeValue ?? '';
    const prev = textState.get(textNode);
    const untouched = prev && value === prev.out;
    // Already translated for the current language — nothing to do.
    if (untouched && prev.gen === generation) continue;

    // On a language switch we must retranslate from the English source.
    const original = untouched ? prev.orig : value;
    if (!isTranslatable(original)) continue;
    if (isSkippedNode(textNode)) continue;

    const trimmed = original.trim();
    const hit = cache[trimmed];
    if (hit) {
      const replaced = original.replace(trimmed, hit);
      if (replaced !== value) textNode.nodeValue = replaced;
      textState.set(textNode, { orig: original, out: replaced, gen: generation });
    } else {
      pending.add(trimmed);
    }
  }
}

function translateAttributes(root: Element, cache: Record$) {
  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
  for (const el of elements) {
    if (!el.getAttribute) continue;
    if (isSkippedNode(el)) continue;
    for (const attr of TRANSLATED_ATTRS) {
      const value = el.getAttribute(attr);
      if (!value) continue;
      const store = attrState.get(el) ?? {};
      const prev = store[attr];
      const untouched = prev && value === prev.out;
      if (untouched && prev.gen === generation) continue;
      const original = untouched ? prev.orig : value;
      if (!isTranslatable(original)) continue;
      const trimmed = original.trim();
      const hit = cache[trimmed];
      if (hit) {
        el.setAttribute(attr, hit);
        store[attr] = { orig: original, out: hit, gen: generation };
        attrState.set(el, store);
      } else {
        pending.add(trimmed);
      }
    }
  }
}

function runScan() {
  scanTimer = undefined;
  if (currentLanguage === 'English') return;
  const cache = loadCache(currentLanguage);
  applying = true;
  try {
    translateTextNodes(document.body, cache);
    translateAttributes(document.body, cache);
  } finally {
    // Let the observer settle before listening again.
    window.setTimeout(() => { applying = false; }, 0);
  }
  if (pending.size > 0) scheduleFlush();
}

function scheduleScan() {
  if (scanTimer !== undefined) return;
  scanTimer = window.setTimeout(runScan, 150);
}

/* ------------------------------------------------------------- lifecycle */

/** Puts every swapped node back to its English source text. */
function restoreOriginals() {
  applying = true;
  touchedText.forEach((node) => {
    const rec = textState.get(node);
    if (rec && node.nodeValue === rec.out) node.nodeValue = rec.orig;
    textState.delete(node);
  });
  touchedText.clear();
  touchedEls.forEach((el) => {
    const store = attrState.get(el);
    if (!store) return;
    Object.entries(store).forEach(([attr, rec]) => {
      if (el.getAttribute(attr) === rec.out) el.setAttribute(attr, rec.orig);
    });
    attrState.delete(el);
  });
  touchedEls.clear();
  window.setTimeout(() => { applying = false; }, 0);
}


/**
 * Starts (or restarts) whole-page translation for `language`.
 * Returns a cleanup function.
 */
export function startDomTranslation(language: string): () => void {
  currentLanguage = language;
  generation += 1;
  failed.clear();
  pending.clear();

  if (language === 'English') {
    observer?.disconnect();
    observer = undefined;
    restoreOriginals();
    return () => {};
  }

  loadCache(language);
  scheduleScan();

  observer?.disconnect();
  observer = new MutationObserver(() => {
    if (applying) return;
    scheduleScan();
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: [...TRANSLATED_ATTRS],
  });

  return () => {
    observer?.disconnect();
    observer = undefined;
    if (scanTimer !== undefined) window.clearTimeout(scanTimer);
    if (flushTimer !== undefined) window.clearTimeout(flushTimer);
    scanTimer = undefined;
    flushTimer = undefined;
  };
}
