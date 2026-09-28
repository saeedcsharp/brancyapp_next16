# Visual Identity

## Priority

High

## Business Impact

High when backend contracts exist; prototype only today.

## AI Reading Priority

2

## Source Of Truth

- `components/page/ai/CharacterSheet.tsx`
- `components/page/ai/CharacterSheet.module.css`
- `components/page/ai/mediaCreator.tsx`
- `app/dev/characterSheet/page.tsx`
- `app/dev/page.tsx`
- `app/feature/featureCatalog.ts`
- `i18n/featureKnowledge.ts`

## Current Scope

The Dev Panel links to `/dev/characterSheet`, which renders the full-width Visual Identity editor independently from the AI creator. The AI creator exposes only Images and Videos.

The current implementation is a frontend-only prototype. It supports:

- Auto and Advanced editor modes.
- Human, Product, Object, Animal, and Custom identity types.
- Type-specific appearance, structure, clothing, branding, material, dimension, and detail controls.
- Up to 12 browser-local reference previews with view and purpose metadata.
- Per-attribute and global locks.
- Views, expressions, poses, scale references, style, lighting, background, palette, and sheet layout.
- Independent identity-consistency and creativity controls.
- Output presets, detail level, provider-agnostic model strategy, reference strategy, and custom constraints.
- A local Identity Profile, immutable-context summary, sheet preview, and fixed consistency-score presentation.

## Explicit Non-Goals

This implementation does not call an API and does not use a session, upload helper, backend model, server action, local storage, or database. Auto-Define, generation, consistency scoring, regeneration, publishing, lifecycle status, and version labels are presentation states only. Selected image files remain in browser memory as object URLs and are revoked on removal or component unmount. All editor state is lost when the component unmounts or the page reloads.

## Future Architecture Boundary

Future production work must preserve Visual Identity as a provider-agnostic workspace asset and source of truth rather than embedding provider IDs in the identity model. UI state should eventually map to independent identity, reference, normalization, generation gateway, consistency, snapshot/version, asset, permission, queue, usage, and audit contracts. No such contract is implied by the current prototype.

Generation must reference an immutable identity version/snapshot so later identity edits do not alter prior outputs. Heavy files belong in object storage, dynamic attributes may use a flexible schema, and analysis/generation should be asynchronous jobs. Provider/model selection, prompt compilation, negative constraints, reference injection, retries, fallback, usage, and metadata belong behind an AI gateway rather than in this component.

## Change Impact

- Keep the Character Sheet state out of image/video creator-loading effects until a dedicated contract exists.
- Do not reuse image/video endpoints for Visual Identity behavior.
- Keep the feature catalog record audit-only while behavior remains local or mocked.
- Preserve Image and Video creation behavior when changing the shared Create toggle.
- Update this document, module docs, `CURRENT_STATE.md`, `CHANGELOG.md`, `TODO.md`, and feature knowledge when the prototype scope changes.

## Known Risks

- Large type-specific schemas can overwhelm the UI; Auto mode must remain the reduced path.
- Direct navigation between steps currently permits incomplete optional sections; only Identity Name is enforced before the local preview.
- Fixed score values and local lifecycle labels must not be mistaken for real AI validation or persistence.
- Full browser coverage for RTL, mobile, object URL cleanup, and mode/type transitions is pending.
