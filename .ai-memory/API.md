# API

## Local Route Handlers

- `GET|POST /api/auth/[...nextauth]`: NextAuth credentials handlers for Google OAuth, phone verification, and direct token flows.
- `POST /api/user/signIn`: proxy to `sso/signIn`.
- `POST /api/user/signout`: proxy to `sso/signout`.
- `POST /api/user/refreshToken`: proxy to `sso/RefreshToken`.
- `POST /api/user/verifyCode`: proxy to `sso/verifyCode`.
- `POST /api/user/getMyInstagramers`: proxy to `sso/GetMyInstagramers`.
- `GET /api/user/ip`: returns country code from CDN headers, null on localhost.
- `GET /api/pricing`: fetches package prices from `MyLink/GetPackagePrices`, cached for 24 hours.
- `GET /22893589.txt`: static text response.
- Legacy API routes: `/api/health`, `/api/get-address`, `/api/hello` under `legacy-pages/api`.

## Mapped Backend API

`helper/apiRouteMap.ts` contains 317 mapped local API paths. Categories include account, address, ai, business, autoacceptfollower, authorize, bio, comment, dayevent, flow, feature, hashtag, home, instagramer, likecomment, likelastpostfollower, link, lottery, message, order, post, preinstagramer, product, psg, session, shop, statistics, story, systemticket, transaction, user, and wallet-style domains.

## Auth And Headers

Requests include `Authorization` and `instagramerId` headers. `/api/user/*` stays server proxied. Most other mapped endpoints are called directly from the browser using `getClientApiBaseUrl()`.

## Error Behavior

Proxy 401 responses delete NextAuth session cookies and return a normalized error result. Client direct calls may sign out on 401 when `loginByInsta` is true.

---

# AI Maintenance Policy

This document is part of the project knowledge base.

Before modifying related code:

- Read this document.
- Understand the documented architecture and rules.

After modifying related code:

- Update this document if information changed.

Keep documentation synchronized with the implementation.

---
