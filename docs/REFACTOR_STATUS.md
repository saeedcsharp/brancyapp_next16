# Refactor Status

Behavior-preserving refactor of the Brancy Next.js app. Rules: no runtime, UI, route, API-contract, data-flow, caching, or client/server-boundary changes; small phases; `tsc`, `eslint`, and `next build` must pass before and after every commit; generated files (`next-env.d.ts`, `public/sw.js`, `public/sw.js.map`, `tsconfig.tsbuildinfo`) are restored after builds and never committed. The knowledge base in `.ai-memory/` wins over refactor plans when they conflict.

## Phase 0 — Audit: complete

Audit report delivered in chat (folder structure, dead code via knip, duplication via jscpd, oversized files, anti-patterns, prioritized plan). No code changes.

## Phase 1 — Safe cleanup: CLOSED (early, 2026-09-30)

Branch `saeedDev` (local commits, not pushed).

| Commit     | Scope                                                                                                                                                                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0bcf6ea5` | ESLint 9 flat config (`eslint.config.mjs`, `eslint-config-next@16.2.12`, all rules `warn`); `npm run lint` = `eslint .`                                                                                                                         |
| `28b2de9d` | Removed 71 unreferenced files (components, models, unrouted `legacy-pages` index/API files, unreachable legacy Meta redirect copy) and their exclusive stylesheets; archived module docs                                                        |
| `7e0472ea` | Removed unused landing sections `page3`, `page6`, `page7`, `page10`                                                                                                                                                                             |
| `9481edf8` | Removed unused dependencies (`jotai`, `lodash.throttle`, `pdf-lib`, `react-leaflet`, `react-select`, `@types/wavesurfer.js`, `@types/react-beautiful-dnd`, `@types/react-i18next`, `next-router-mock`); declared `clsx` and `react-date-object` |
| `7c216993` | Knowledge-base merge-conflict markers resolved; verified stale claims corrected                                                                                                                                                                 |
| `d9e26741` | Removed 6 unused helpers and their `/dev/systemDesign` rows; synchronized `/dev/package` report; removed redundant `tsconfig.json` includes                                                                                                     |
| `1de40abc` | Debug `console.log` / commented-out code removed in `helper/`, `context/`, `models/`                                                                                                                                                            |
| `69232bed` | Same for `app/`; removed unused `node:module` import                                                                                                                                                                                            |
| `b3b67653` | Same for the smaller `components/` folders                                                                                                                                                                                                      |
| `97cef004` | `bankCard` and `verificationForm` reuse `convertDigitsToEnglish` (verified identical for every BMP character)                                                                                                                                   |
| `e16c3baa` | Security: removed logs printing credentials, verification codes with `Authorization`, access tokens, refresh-token responses, and session objects                                                                                               |
| `0e72c326` | Debug logs / commented-out code removed in `components/market`                                                                                                                                                                                  |
| `afaea888` | Docs: `/feature` audit-only section is currently disabled                                                                                                                                                                                       |
| `8de62395` | Debug logs / commented-out code removed in `components/page`                                                                                                                                                                                    |
| `4707e769` | `.github/copilot-instructions.md`: never log credentials, codes, `Authorization` headers, tokens, or session objects                                                                                                                            |
| `88ba624e` | Security (second pass, AST scan): removed null-session `"session ", session` logs in the direct/comment/ticket inboxes and the RefreshToken response log in `legacy-pages/user/setting`                                                         |

### Final verification (HEAD `88ba624e`)

- `npx tsc --noEmit`: pass.
- `npm run lint` (`eslint .`): 0 errors, 4,482 warnings (baseline after tooling: 4,632).
- `npm run build` (`next build --webpack`): pass; route table identical to the pre-refactor baseline.
- Docker build (`docker build .` with the repository `Dockerfile`: `npm ci --legacy-peer-deps` added 705 packages, `next build` compiled with warnings only, TypeScript passed, 158/158 static pages generated, image exported): pass in 12m33s. Only Docker warning: `FromPlatformFlagConstDisallowed` (pre-existing `FROM --platform=linux/amd64`).

### Deferred: clean opportunistically when a file is touched in Phase 3

- Debug `console.log` and commented-out code in `components/store` (~52 logs, ~186 comment lines), `components/messages` (~195 logs, ~200 comment lines), and `legacy-pages` (~205 logs, ~580 comment lines).
- Leftover commented-out blocks in already-cleaned folders: `components/homeIndex/postSummary.tsx` (`fetchPosts`), `components/signIn/faceBook.tsx` (`handleSubmit`), commented SVGs in `components/sidebar/instagramerSidbar/instagramerSidbar.tsx` and `components/hambergurMenu/leftHamMenu.tsx`, `components/userPanel/message/ticketInbox.tsx`, `components/userPanel/orders/popups/updateAddress.tsx`, the `lastOrder.tsx` JSX fragment, and `WalletTile.tsx`.
- ESLint `@typescript-eslint/no-unused-vars` (1,036 warnings) and other warning-level findings. When cleaning, skip hook return values, CSS/SCSS module imports, side-effect imports, and anything that could change hook order or global styles.

Cleanup rules for deferred work: remove only debug `console.log`; keep `console.error`/`console.warn`, `catch`/`.catch` logging, and server-side operational logging; remove only commented-out code (keep explanatory comments); never log secrets (see `.github/copilot-instructions.md`).

## Open needs-review items

1. `helper/clientFetchApi.ts` falls back to `/api/health/check`, which has no route; `legacy-pages/api/health.ts` is kept but not served.
2. `legacy-pages/Accessibility/OrgChart.tsx` is not routed while `AccessibilityHeader` links to `/Accessibility/OrgChart` four times.
3. The `/feature` audit-only section is commented out in `app/feature/FeatureKnowledgeBase.tsx` (only consumer of `auditRecords`); decide whether to re-enable or retire it.
4. The `AIWithPrompt` commented usage example is kept intentionally.
5. MyLink doc lines ("static presentation coupon", Best Sellers sorting) await owner review.
6. PII (not secrets) is still logged by `console.log` in `legacy-pages/Accessibility/Contact-Us.tsx` (contact form) and `Support.tsx` (ticket form); browser production builds strip `console.*` via Terser.
7. Security items owned separately: tracked `.env`, hard-coded fallback auth secret in `middleware.ts` and the NextAuth route, ungated `/dev/*` and `/test` routes.
8. `types/next-auth.d.ts` is excluded from ESLint (parser rejects `extends DefaultSession["user"]`).
9. `middleware.ts` → `proxy.ts` rename (Next 16 deprecation) intentionally not done.
10. Dependency placement (`@types/*`, `typescript`, `sass` in `dependencies`) intentionally unchanged.

## Next step: Phase 2 — Structure (planning only)

Produce a plan before any code change. Constraints from the knowledge base: keep the `brancy/*` alias (no `@/`), keep the App Router → `legacy-pages` bridge, keep shared UI in `components/design/` (no parallel `components/ui`), keep utilities in `helper/` and hooks in `hook/`, keep `app/_compat/next-router.ts` in place (webpack alias), and do not change any client/server boundary.
