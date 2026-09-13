# Authentication

## Priority

Critical

## Business Impact

High

## AI Reading Priority

1

## Source Of Truth

- `app/api/auth/[...nextauth]/route.ts`
- `types/next-auth.d.ts`
- `helper/clientFetchApi.ts`

## Depends On

- `helper/`
- `app/api/`
- backend auth responses

## Used By

- Login and logout flows
- Route guards and redirects
- User and Instagramer dashboards

## Change Impact

Changing this feature may affect sign-in, sign-out, session shape, permission checks, proxy auth, and redirect behavior.

## Notes

Forced API logout now awaits NextAuth session removal with redirects disabled, then navigates to the current origin root. Server-returned callback URLs, including localhost, are ignored. The existing forced-logout condition (401 plus `loginByInsta`) is unchanged for both direct backend and user-proxy requests.

Selected-account session refresh now also runs on every pathname change during client navigation, bypassing the 20-second throttle. Protected/upgrade destinations wait for the current navigation's refresh and persistence; navigation during a pending request is checked after that request finishes. Query/hash-only updates do not trigger refresh.

Keep this doc aligned with session handling, provider configuration, and backend auth contract changes.

`InstaProvider` fetches selected-account information on every document reload regardless of the session's persisted `lastUpdate`, while suppressing duplicate in-flight and immediate session-update requests. Routine token renewal chains account or customer title loading using the returned session. Successful account refresh persists package data before redirecting expired subscriptions from protected Instagramer routes to `/upgrade`; the upgrade page itself is excluded.

The provider withholds dashboard and upgrade children until selected-account initialization and session persistence finish. During that initial wait, sidebar, navbar, route components, and their client effects cannot mount with stale permissions or subscription state. Expiry navigation keeps dashboard children blocked until `/upgrade` is reached. Initialization failures show the shared error view with reload retry. Public/customer routes and server middleware are outside this client-side gate.

The phone verification form accepts English, Persian, and Arabic-Indic digits from typing, paste, and WebOTP. A complete six-digit code is submitted through one guarded path; WebOTP only fills the inputs, so it cannot submit concurrently with the code-change effect. Failed verification preserves the existing shake, error styling, notification, and input reset behavior.

Verification requests use an in-flight guard and `finally` cleanup. WebOTP and animation timers are cleaned up when the form unmounts, while navigation uses the existing Next router flow.

The verification form uses functional state updates for digit edits, memoizes the joined code and completion check, and centralizes code/timer/animation constants. It supports multi-digit browser autofill, selects a digit on focus, returns focus to the first input after an error, uses `router.replace("/home")`, and exposes timer/error relationships through ARIA attributes. The form keeps OTP, countdown, and focus logic local because it has one consumer and the repository has no established UI test harness requiring separate reusable OTP primitives.

The Meta direct-login flow guards its verification request so React Strict Mode effect replays cannot call the API twice. Its loading phrases use a deterministic order for SSR and the initial client render, then shuffle after hydration to avoid text mismatches. After successful verification, it waits 10 seconds and opens a localized AI-analysis notice instead of navigating automatically. Navigation to `/directlogin` occurs only after the user confirms the modal.

The customer shop route distinguishes NextAuth's `loading` session status from an unauthenticated session. It shows the existing loader while a browser reload restores session state, then renders the sign-in landing only when authentication is confirmed absent. Role-based redirection for an authenticated user with a selected current index runs in an effect rather than during render.
