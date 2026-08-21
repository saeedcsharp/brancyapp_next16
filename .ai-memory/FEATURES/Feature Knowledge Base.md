# Feature Knowledge Base

## Priority

High

## Business Impact

Medium

## AI Reading Priority

2

## Source Of Truth

- `app/feature/featureCatalog.ts`
- `app/feature/FeatureKnowledgeBase.tsx`
- `app/feature/page.tsx`
- `i18n/featureKnowledge.ts`
- `helper/apiRouteMap.ts`
- `models/enums.ts`
- `types/next-auth.d.ts`

## Purpose

`/feature` is a public, noindex internal reference for the Brancy content team. It documents only source-backed frontend capabilities and makes known access dependencies, limitations, and content-production angles searchable.

## Catalog Rules

- A catalog row requires route, component, API, permission, enum/type, or translation evidence.
- Every added, changed, completed, renamed, or removed user-facing option or capability must trigger a catalog review in the same task.
- New or changed active capabilities belong in `app/feature/featureCatalog.ts` with matching text in `i18n/featureKnowledge.ts`.
- Incomplete, local-only, mocked, unmapped, or removed capabilities must be updated in the audit-only records instead of being shown as active.
- The page does not fetch backend data and does not expose account or business-sensitive data.
- It does not invent prices, package quantities, token quantities, follower thresholds, or backend limits.
- `unknown` access is rendered as `Needs Business Logic review`.
- Routes with local mock data, TODO API markers, unmapped calls, or local-only actions belong in the audit-only section instead of the active catalog.
- On mobile, expanded feature details keep the expand control in the card's top corner, while role and access values share one row.

## Current Coverage

- 41 evidence-backed catalog records.
- Instagramer: 26 records when filtering by that role.
- Shopper: 21 records when filtering by that role.
- Advertiser: 8 records when filtering by that role.
- Multi-role: 9 records.
- AI-related: 5 records.
- Confirmed frontend-free: 1 record.
- Package, feature-entitlement, or AI-token controlled: 27 records.

Role totals overlap because a single record can serve more than one role.

## Access Model

The catalog reflects frontend checks only. `LoginStatus` requires a selected Instagram account and `loginByInsta`; `packageStatus` checks the package expiry; `RoleAccess` grants owners broad access and restricts partners by `PartnerRole`. Pages can also use `messagePermission`, `commentPermission`, `insightPermission`, and `publishPermission`. Backend authorization remains authoritative.

Known feature entitlements are `PsgFeatureType.AI`, `PsgFeatureType.Lottery`, and `PsgFeatureType.CustomDomain`. The page labels them as entitlements rather than assigning a price or quota.

## UI Behavior

- Role tabs filter Instagramer, Shopper, and Advertiser records.
- Search is deferred and searches translated title, description, category, access, and role text.
- Category and access filters operate locally; sorting supports title, category, and access.
- Each row expands to display usage route, prerequisites, access, known limit, content angle, and source-kind evidence.
- The usage instruction and its technical route are rendered on separate lines; long routes wrap safely on narrow screens.
- Mobile uses stacked records instead of a horizontally overflowing table.
- Direction follows `DirectionContext`; themes use existing CSS variables.
- The `/page/tools` hashtag capability is presented as one collapsible `hashtagManager` card with a shared toggle between saved hashtags and trend/search hashtags.
- Persian display copy uses plain Persian equivalents or Persian transliteration for unavoidable brand names; technical route and identifier values remain unchanged.
- Persian display copy uses a conversational, short, non-technical tone for general and younger audiences.
- Feature descriptions should explain the user's goal, the main steps, and the expected result clearly enough to understand the option without technical knowledge.

## Audit-Only Findings

The page explicitly keeps advertising calendar/list/properties/report screens, customer-ads lifecycle UI, store properties, store statistics, the static MyLink coupon display, incomplete AI video creation, market-home mock data, buyer wallet/payment-status shells, Telegram/WhatsApp download prompts, and password/help-center stubs out of the live catalog. Their visible frontend surfaces are useful audit clues but do not prove a backend-supported Brancy capability.

## Validation

`npx tsc --noEmit` passed after implementation. Browser validation confirmed live search, expand/collapse, role filtering, a 390px Persian RTL dark-mode layout, and no horizontal overflow.

## Change Impact

When a route, access guard, entitlement, API mapping, or user-facing workflow changes, update `featureCatalog.ts`, `i18n/featureKnowledge.ts`, this document, `CURRENT_STATE.md`, `CHANGELOG.md`, and the related domain feature document.

## Maintenance Rule

The feature catalog is a required synchronization step for every implementation task. Before marking work complete, compare the changed source behavior with `/feature`, update the matching active or audit-only record, and confirm the page still describes the current product.
