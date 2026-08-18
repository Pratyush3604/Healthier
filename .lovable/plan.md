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
- Grant the `admin` role to exactly one account — pratyush3604@gmail.com — and to no one else; `/admin/users` opens only for it
- The "Make admin" button is removed so no second admin can ever be created from the UI
- Verify the directory loads, search/CSV export work, and every non-admin account is refused

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

---

## Technical notes

- Header: import `Shield`, use `useAuth()`; drop any leftover local session state.
- Settings: new `'profile'` tab in the existing `Tab` union; reuse `ProfileForm`; password change via re-auth with `signInWithPassword` then `auth.updateUser`; account deletion through a new authenticated edge function that deletes the caller's own auth user (never accepting a target id from the client).
- Admin role granted by a one-off SQL insert into `user_roles` for the user id behind pratyush3604@gmail.com only; the `set_role` action is dropped from `admin-list-users` so the role cannot be handed out at runtime.
- Rate limiting: a small `ai_usage` table plus a check at the top of `medical-chat`, `analyze-image`, `elevenlabs-tts`.
- Verification: `tsgo` typecheck, security scan, database linter, and a Playwright pass over signup → profile → admin directory.
