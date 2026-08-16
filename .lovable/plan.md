# Full Account System for Healthier

## Important note on passwords

Passwords cannot be revealed to anyone — not to you, not to me, not to an admin page. The backend only ever stores a one-way hash, so there is no place a plaintext password could be read from. Any app that shows you user passwords is storing them insecurely and would fail every security review.

What you *can* have (and this plan builds): a full admin view of every user's account details and health profile, plus a much stronger login. That is the legitimate version of "user credentials".

## 1. Richer signup + profile data

Extend the existing profile record so each account stores:

- Full name, email, phone number
- Date of birth (age derived), gender
- Height, weight (BMI derived), blood group
- Allergies, chronic conditions, current medications
- Emergency contact name + phone
- Preferred language, avatar, city/country
- Account timestamps (created, last updated, last seen)

Signup collects name, email, password. Everything else is filled in on a new **Complete your profile** step right after signup (skippable) and editable later.

## 2. Better login UX

- Show/hide password toggle
- Live password strength meter with rules (length, upper/lower, number, symbol)
- Inline field validation with clear, friendly error messages (wrong password, unconfirmed email, already registered)
- "Remember me" plus a proper loading/disabled state
- Google sign-in kept as-is
- Leaked-password protection turned on so breached passwords are rejected at signup

## 3. Forgot / reset password

- "Forgot password?" link on the login form sends a reset email
- New `/reset-password` page that verifies the recovery link and sets a new password with the same strength rules
- Confirmation toast + redirect to dashboard

## 4. Profile & account settings

A new **Profile** tab in Settings where the signed-in user can:

- Edit every profile field above, upload an avatar
- Change their password (requires current password)
- Change email address (re-confirmation email)
- Delete their account and all their data

## 5. Admin user directory (your view)

- You get the `admin` role; the roles table already exists
- New `/admin/users` page, visible only to admins
- Table of all users: name, email, phone, age, gender, city, blood group, signup date, last sign-in, email-confirmed status, provider (email/Google)
- Search, sort, and CSV export of the directory
- Click a user to see their full health profile
- Admins can promote/demote roles and delete accounts
- Password fields are absent by design — see the note above

## 6. Login required for main tools

- Home, About, How to Use, Auth, Reset Password stay public
- Every tool route (symptoms, vitals, chat, reports, skin/injury, fitness, dashboard, etc.) requires an account; unauthenticated visitors are redirected to `/auth` with a return path so they land back where they intended
- Guest mode button is removed from the login screen
- Header shows the signed-in user's avatar with a dropdown (Profile, Settings, Admin, Sign out)

---

## Technical notes

- Migration extends `public.profiles` with the new columns, keeps RLS scoped to `auth.uid() = user_id`, and adds admin-read policies via the existing `has_role()` security-definer function. GRANTs included in the same migration.
- `handle_new_user()` trigger is updated to seed the new columns from signup metadata and to insert a default `user` role row.
- Admin-only writes to `user_roles` gated by `has_role(auth.uid(), 'admin')`.
- Auth-level fields the client cannot read (last sign-in, email confirmed, provider) are served by a new `admin-list-users` edge function that verifies the caller's JWT, checks the admin role, then uses the service-role client — no admin data reaches non-admins.
- New `src/hooks/useAuth.ts` context (session + profile + role) plus a `RequireAuth` route wrapper in `App.tsx`.
- New pages: `ResetPasswordPage`, `CompleteProfilePage`, `AdminUsersPage`; new Profile tab in `SettingsPage`.
- Auto-confirm email stays off, so signup shows a "check your inbox" state rather than logging in immediately. Tell me if you'd rather sign users in instantly.
- All new UI text flows through the existing DOM translation engine, so it follows the selected language automatically.
