# Password Reset

Users can reset their password from the login screen without admin help.

## Flow

1. **Login** → click **Forgot password?** → `/login/forgot-password`
2. User enters email → Supabase sends a recovery email
3. Email link opens `/auth/reset-password?code=…` (PKCE) or `/auth/confirm#…&type=recovery` (hash)
4. App establishes a short-lived recovery session
5. User sets a new password → server action calls `updateUser({ password })`
6. User is signed out and redirected to `/login?reset=success`
7. User signs in with the **new** password

## Key files

| Path | Purpose |
|------|---------|
| `components/auth/SignInForm.tsx` | "Forgot password?" link + success message |
| `components/auth/ForgotPasswordForm.tsx` | Sends `resetPasswordForEmail` |
| `components/auth/ResetPasswordForm.tsx` | New password form (client) |
| `app/auth/reset-password/page.tsx` | Exchanges `code` / `token_hash` server-side |
| `app/auth/reset-password/actions.ts` | `updateUser` + audit + sign-out |
| `app/auth/callback/route.ts` | Fallback when link uses `/auth/callback?next=…` |
| `app/auth/confirm/page.tsx` | Fallback for hash-fragment recovery links |
| `lib/auth/site-url.ts` | Base URL for `redirectTo` in reset email |

## Supabase configuration (required)

In **Supabase Dashboard → Authentication → URL Configuration**:

1. **Site URL** — production app URL (e.g. `https://your-app.vercel.app`) or `http://localhost:3000` for local dev
2. **Redirect URLs** — add all of:
   - `http://localhost:3000/auth/reset-password`
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/confirm`
   - Your production equivalents

Optional env var for production redirects:

```env
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

If redirect URLs are missing, reset emails may fail or send users to the wrong page without a valid session.

## Audit events

| Action | When |
|--------|------|
| `auth.password_reset_link` | User opened a valid recovery link |
| `auth.password_reset` | User saved a new password |

## Related docs

- [Security, Authentication & Audit Log](./security-auth-audit-log.md)
- [Deployment & env vars](../deployment.md)
