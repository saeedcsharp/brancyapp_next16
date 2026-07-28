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

Keep this doc aligned with session handling, provider configuration, and backend auth contract changes.

The phone verification form accepts English, Persian, and Arabic-Indic digits from typing, paste, and WebOTP. A complete six-digit code is submitted through one guarded path; WebOTP only fills the inputs, so it cannot submit concurrently with the code-change effect. Failed verification preserves the existing shake, error styling, notification, and input reset behavior.

Verification requests use an in-flight guard and `finally` cleanup. WebOTP and animation timers are cleaned up when the form unmounts, while navigation uses the existing Next router flow.

The verification form uses functional state updates for digit edits, memoizes the joined code and completion check, and centralizes code/timer/animation constants. It supports multi-digit browser autofill, selects a digit on focus, returns focus to the first input after an error, uses `router.replace("/home")`, and exposes timer/error relationships through ARIA attributes. The form keeps OTP, countdown, and focus logic local because it has one consumer and the repository has no established UI test harness requiring separate reusable OTP primitives.
