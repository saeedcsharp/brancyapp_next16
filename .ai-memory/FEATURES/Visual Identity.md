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

- A subject-type section with an Auto/Advanced mode switch; the type-specific attributes accordion is rendered only in Advanced mode.
- Dynamic section numbering that automatically reindexes when the Advanced-only attributes section is hidden.
- Independently collapsible sections instead of a step-by-step wizard.
- Local Undo and Redo controls for serializable editor changes.
- Human, Product, Object, Animal, and Custom identity types.
- A type-specific attributes accordion restores the available Human appearance, face, hair, body, clothing, Product structure/material/branding, Object scale/material/details, Animal species/fur/markings, and Custom subject options.
- Completion counters, local reset of attribute values, and an individual lock control for every attribute.
- Locked attributes are visually faded, non-editable, and included in the final local prompt payload with an instruction to preserve them exactly from the reference images.
- Up to 14 browser-local reference-image previews with remove controls; Advanced mode groups uploads into type-specific slots such as Human face/style/body and Product brand/logo/packaging/material.
- Each reference stores its slot label in the local prompt payload, while Auto mode keeps the general reference uploader.
- A prepared prompt and identity description that users can edit directly.
- Negative prompt, identity rules, and consistency rules inputs.
- Visual style, lighting, background, views, detail, consistency, creativity, output count, aspect ratio, and resolution settings.
- Type-specific local prompt templates update the prompt, negative prompt, identity rules, and consistency rules when Human, Product, Object, Animal, or Custom is selected.
- Prompt preview modes for Readable and JSON views, with local copy and download actions.
- A local reset-all action that clears the full draft state.
- Safe browser draft persistence with localStorage for serializable state only.
- A live final prompt payload preview that includes mode, editable prompt fields, type-specific attributes, references, and settings.

## Explicit Non-Goals

This implementation does not call an API and does not use a session, upload helper, backend model, server action, or database. The payload output is a local request preview only. Selected image files remain in browser memory as object URLs and are revoked on removal or component unmount. Only serializable editor fields may persist in browser localStorage; reference image binaries and object URLs are never persisted.

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

- Large type-specific schemas can overwhelm the UI; the attributes accordion remains independently collapsible and values are optional.
- Direct navigation between steps currently permits incomplete optional sections; only Identity Name is enforced before the local preview.
- Fixed score values and local lifecycle labels must not be mistaken for real AI validation or persistence.
- Full browser coverage for RTL, mobile, object URL cleanup, and mode/type transitions is pending.
