

# Healtify — Complete UI Redesign & Feature Expansion Plan

## Current State Assessment
The app already has solid bones: 16 health tools, 100+ first aid guides, 100+ tips, 40 country emergency numbers, working AI edge functions (medical-chat, analyze-image, elevenlabs-tts), auth page, settings, BMI calculator, water tracker, and health dashboard. The UI uses a dark glassmorphism theme with framer-motion animations. Console is clean with zero errors.

**What's actually missing/weak:**
- Emergency page only has ~40 countries (needs 100+)
- Health tips has ~120 (needs 150+)
- Homepage feels generic — no visual wow factor
- Dashboard metrics are static placeholders
- No Google OAuth integration (uses email only)
- Auth page needs polish
- Settings doesn't persist theme/language
- No "Medication Reminder" or "Health Journal" features
- Footer still might reference legacy branding
- No skeleton loaders or loading states on pages

---

## Plan

### 1. Complete UI Overhaul — Every Page Gets Redesigned

**HomePage**: Rebuild with animated hero section using a pulsing heartbeat SVG, floating health icons, and a gradient mesh background. Add testimonial-style stats section and a "How It Works" 3-step flow.

**Header**: Add animated logo pulse on hover, improve mobile drawer with categories, and add user avatar dropdown when logged in.

**All Feature Pages**: Add consistent page headers with breadcrumbs, skeleton loading states, and improved card layouts with better spacing and visual hierarchy.

### 2. Expand Emergency Numbers to 100+ Countries
Add emergency numbers for every continent — expand from 40 to 100+ entries with Ambulance, Police, and Fire numbers per country. Add a search/filter by country name and continent tabs.

### 3. Expand Health Tips to 160+
Add 40+ more tips covering: Women's Health, Men's Health, Senior Health, Travel Health, and Workplace Wellness categories.

### 4. Add Google OAuth
Use `lovable.auth.signInWithOAuth("google")` for one-click sign-in. Redesign auth page with a premium split-screen layout.

### 5. Settings — Theme Persistence
Wire up theme toggle to actually apply light/dark/system using CSS variables and localStorage. Currently it's state-only with no effect.

### 6. New Feature: Medication Reminder
A page where users can add medications with name, dosage time, and frequency. Store in localStorage. Show daily reminders on the dashboard.

### 7. New Feature: Health Journal
A simple daily log page — users can record mood (emoji scale), symptoms, notes, and see a 7-day history. Store in localStorage.

### 8. Dashboard — Live Metrics
Connect dashboard cards to actual data from other pages (BMI from calculator, water from tracker, sleep score from sleep analysis) via localStorage.

### 9. Footer Cleanup & Branding
Verify zero legacy references. Add social links placeholder and "Made with ❤️ by Pratyush" credit.

### 10. Loading States & Error Boundaries
Add React Error Boundary wrapper around routes. Add skeleton loaders for AI-powered pages while waiting for responses.

---

## Technical Approach

**Files to create:**
- `src/pages/MedicationReminderPage.tsx` — new medication tracking page
- `src/pages/HealthJournalPage.tsx` — daily health journal
- `src/components/ErrorBoundary.tsx` — global error boundary
- `src/hooks/useTheme.ts` — theme persistence hook
- `src/hooks/useLocalStorage.ts` — generic localStorage hook

**Files to heavily edit:**
- `src/pages/HomePage.tsx` — complete visual redesign
- `src/pages/EmergencyPage.tsx` — expand to 100+ countries with search
- `src/pages/HealthTipsPage.tsx` — add 40+ more tips
- `src/pages/AuthPage.tsx` — add Google OAuth + redesign
- `src/pages/HealthDashboardPage.tsx` — connect live metrics
- `src/pages/SettingsPage.tsx` — wire theme persistence
- `src/components/Header.tsx` — user avatar dropdown, polish
- `src/components/Footer.tsx` — branding verification
- `src/components/Layout.tsx` — add ErrorBoundary wrapper
- `src/App.tsx` — add new routes
- `src/index.css` — add light theme variables, new animations

**Edge functions:** No changes needed — existing 3 functions cover all AI features.

**Database:** No schema changes needed — new features use localStorage for simplicity.

