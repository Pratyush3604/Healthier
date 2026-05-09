## Plan

### 1. Universal UI translation (the big one)
Right now only ~20 languages have hand-written translations; the other ~480 fall back to English. Hand-writing 480 dictionaries is impossible. Solution: **runtime AI translation with cache**.

- New edge function `translate-ui` (Lovable AI / Gemini 2.5 Flash) that takes the English master dictionary + target language and returns a JSON dict of translated keys.
- New hook `useAutoTranslate`: on language change, if no static dict exists, call the edge function once, cache result in `localStorage` (`healtify-translations-v1::<lang>`). Subsequent loads are instant (no network).
- Modify `useTranslation` to read from cached AI translations after the static dictionary check, before falling back to English.
- Loading state: while translating, show English (graceful).

This makes **every** UI label translate for **every** language with one Gemini call per language ever.

### 2. Native language names in picker
Build `LANG_NATIVE` map (e.g. `German → Deutsch`, `Hindi → हिन्दी`, `Japanese → 日本語`, `Arabic → العربية`, etc.) for the top ~120 most common languages. Picker displays "English Name (Native)". For obscure ones, show English only.

### 3. Google Search verification / search not working
Explain: verification only confirms ownership — it doesn't index the site. To appear in search:
- Submit sitemap `/sitemap.xml` in Search Console → Sitemaps.
- Use URL Inspection tool → "Request indexing" for the homepage.
- Indexing typically takes 3–14 days for new sites.
- I'll also add `<meta name="robots" content="index,follow">` and ensure the sitemap lists every page.

### 4. Errors & security
- Run TypeScript/lint pass.
- Run security scan, address any high-severity finding.
- Verify edge function secrets are configured.

### 5. Updated PDF
Regenerate the master "everything about Healthier" PDF (v3) covering: tech stack, AI architecture, all 15 tools, security, i18n system, edge functions, deployment. Save to `/mnt/documents/healthier-documentation_v3.pdf`.

### Files touched
- New: `supabase/functions/translate-ui/index.ts`, `src/hooks/useAutoTranslate.ts`, `src/i18n/nativeNames.ts`
- Edited: `src/hooks/useTranslation.ts`, `src/pages/HomePage.tsx` (picker), `public/sitemap.xml`, `index.html`
- Generated: `/mnt/documents/healthier-documentation_v3.pdf`

### Out of scope (let me know if you want any)
- Translating dynamic page content (Symptoms list, FirstAid list etc.) — only "UI chrome" buttons/labels are auto-translated. Adding the long content lists would multiply token cost ~50×.
