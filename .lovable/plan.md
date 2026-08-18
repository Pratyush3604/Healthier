# Wrap up the account system, harden security, and plan monetization

## 1. Fix the build (blocking)

`src/components/Header.tsx` uses `isAdmin` and `Shield` without importing them. Add `Shield` to the lucide import and `const { isAdmin } = useAuth();` inside the component. Then run a full typecheck and fix anything else it surfaces.

## 2. About page cleanup

Remove the WRO origin sentence and the entire "My Mentor" card from the About page, plus the now-unused translation keys (`aboutOrigin`, `myMentor`, `mentorThanks`, `builtForWRO`) across the language dictionaries.

## 3. Profile tab in Settings

New **Account & Profile** tab containing:
- The shared health profile editor (`ProfileForm`) for every field
- Change password (asks for the current password first, same strength rules as signup)
- Change email address (sends a re-confirmation email)
- Delete my account and all my data, behind a typed confirmation

## 4. Finish the admin side

- Deploy the `admin-list-users` function
- Grant your account the `admin` role so `/admin/users` opens for you
- Verify the directory loads, search/CSV export work, and non-admins get refused

## 5. Signup notification email to your Gmail

Requires an email sending domain you own. Once set up, each new signup emails pratyush3604@gmail.com with name, email, phone, provider and signup time. Passwords are never included — the backend stores only a one-way hash, so there is no plaintext to send. If you have no domain yet, I'll skip this step and everything else still ships.

## 6. Make it hard to break into

Nothing is literally "unhackable", but I'll close every practical hole:

- Audit every table: RLS on, policies scoped to `auth.uid()`, admin reads only via `has_role()`, explicit GRANTs — no anonymous access to profiles or roles
- Confirm roles live only in `user_roles` (never on the profile), so no privilege escalation by editing your own row
- Every edge function: verify the JWT in code, re-check the admin role server-side, validate and length-cap all input, never trust a client-sent `user_id`
- Storage: private buckets scoped to the owner's folder; the logo bucket read-only except for admins
- Turn on leaked-password protection, enforce the password strength rules server-side where possible, and keep auto-confirm off
- Add basic abuse protection to the AI/voice functions (per-user rate limiting) so nobody can burn your AI credits
- Strip anything sensitive from error responses and client logs
- Run the security scanner and the database linter at the end and fix real findings; anything intentionally left is written into security memory with the reason

## 7. How to capitalize on Healthier

I'll implement whichever you pick — this section is a proposal, not built yet:

- **Free tier**: symptom checker, first aid, health tips, emergency contacts, BMI
- **Premium (subscription)**: AI chat consultations, report analysis, skin/injury analysis, voice replies, PDF health reports, medication reminders, care-near-me
- Usage limits on the free tier (e.g. 5 AI actions per day) enforced server-side in a `usage` table, not in the browser
- Payments via Stripe or Paddle (Lovable has built-in support for both), a Pricing page, and a subscription state check in the tool routes
- Secondary options: one-off PDF report purchases, a family plan, and a clinic/school licence

Tell me which model you want and I'll wire it in a follow-up.

---

## Technical notes

- Header: import `Shield`, use `useAuth()`; drop any leftover local session state.
- Settings: new `'profile'` tab in the existing `Tab` union; reuse `ProfileForm`; password change via re-auth with `signInWithPassword` then `auth.updateUser`; account deletion through a new authenticated edge function that deletes the caller's own auth user (never accepting a target id from the client).
- Admin role granted by SQL insert into `user_roles`.
- Rate limiting: a small `ai_usage` table plus a check at the top of `medical-chat`, `analyze-image`, `elevenlabs-tts`.
- Verification: `tsgo` typecheck, security scan, database linter, and a Playwright pass over signup → profile → admin directory.
