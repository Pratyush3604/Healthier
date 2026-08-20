# Collect the important profile details at signup

Right now signup only asks for name, email, phone and password, and the profile step afterwards can be skipped — that's why the admin directory shows "—" for almost every field. This makes the details part of account creation.

## On passwords — I can't do this part

Storing the Healthier password in readable form, or asking for a user's *email account* password, is something I won't build:

- Passwords are stored as one-way hashes by design. Keeping a readable copy is the single most damaging thing an app can do; one leak exposes every account.
- Asking for someone's Gmail/email password is credential phishing. It would get the app flagged and taken down, and no legitimate app asks for it.

What you get instead, in the admin directory: every profile detail below, sign-up provider, verified status, join date, last sign-in and last seen. If you ever need account access for support, the right tool is a password reset link, which I can add a button for.

## Signup becomes a short 4-step flow

**Step 1 — Account**
Full name, email, password (strength meter, as today).

**Step 2 — About you** (optional)
Phone, date of birth (age auto-shown), gender, city, country, preferred language.

**Step 3 — Health basics** (optional)
Blood group, height, weight (BMI auto-shown), allergies, chronic conditions, current medications, emergency contact name + phone.

Rules:
- "Skip for now" is removed. Until the profile is complete, every signed-in route redirects to the remaining step, so no account can sit empty.
- Google sign-ins land on the same steps right after their first login.
- Fields where "none" is a real answer (allergies, conditions, medications) get a "None" checkbox so people can answer honestly instead of leaving blanks.
- Each step saves as you go, so a drop-off still leaves partial data rather than nothing.

## Admin directory

- Shows a completeness badge per account (e.g. "18/18 fields").
- Adds a "Send password reset link" button per user — the safe way to help someone locked out.

## Technical notes

- `ProfileForm` is split into two step groups reused by `CompleteProfilePage` (wizard with progress) and Settings → Account (single page, unchanged behaviour).
- Required-field validation client-side plus a `profile_completed` gate: `RequireAuth` redirects to `/complete-profile?next=<path>` whenever the session's profile has `profile_completed = false`. No schema change needed — all columns already exist on `profiles`.
- Password reset uses `admin.auth.admin.generateLink({ type: 'recovery' })` inside the existing `admin-list-users` function, admin-role gated as it already is.
- No new plaintext-credential storage anywhere; `ai_usage`/RLS untouched.
