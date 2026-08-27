# components/messages

## Purpose

Component module for messages UI and feature concerns.

## Business Purpose

Supports Brancy messages workflows or shared UI.

## Responsibilities

Owns the folder/module concerns described by its file tree and exports.

## Architecture

Follows existing Next/React/TypeScript project conventions.

## Folder Structure

components/messages/.

## Execution Flow

Execution starts from imports, route rendering, or helper calls depending on the module.

## Data Flow

Data enters through props, Next route params, session state, browser state, or backend API responses.

## Dependencies

See imports in related files and dependency docs.

## Reverse Dependencies

Used by routes, components, helpers, or build tooling where imported.

## Public APIs

Exports are defined by source files in the module.

## Internal APIs

Local helpers and non-exported functions stay module-private.

## Classes

No class inventory was generated for this module during initialization unless listed in related files.

## Functions

See related source files for exported functions and local helpers.

## Components

React components are present when the folder contains `.tsx` UI files.

`popups/selectProduct.tsx` loads product thumbnails through `useInfiniteScroll`. Its pagination callback always applies the hook's `hasMore` result, including an empty terminal page, so a short product grid cannot repeatedly request an exhausted product cursor.

`comment/commentInbox.tsx` memoizes the selected media's auto-reply configuration before passing it to `popups/editAutoReplyForMedia.tsx`. Hover-driven parent renders therefore preserve the child fetch effect dependencies and do not repeat prompt or flow API requests; a media, search-mode, or inbox-data change still supplies updated configuration.

`comment/commentInbox.tsx` returns fetched media pages from its Post and Story `useInfiniteScroll` callbacks. The backend `oldestCursor` is nullable; returning an empty array before the response was processed caused the shared hook to stop pagination even when another cursor existed. Post and Story page appends also filter duplicate media IDs.

`aiflow/flowNode/TextNode.tsx` enforces a 1,000-byte UTF-8 limit for text input, paste, and existing node data. The counter reports bytes rather than JavaScript string length, and truncation preserves complete Unicode characters.

`direct/directChatBox.tsx` applies the same 1,000-byte UTF-8 limit to loaded drafts, typed text, emoji insertion, and outgoing text; truncation preserves complete Unicode characters.

`aiflow/popup/AIToolsSettings.tsx` selects each tool parameter's `completeDescription*` field from the active i18next locale. The model's German description serves the `gr` locale, while French and unknown locales fall back to English and then the legacy `description` field.

The same popup selects tool titles from `displayName*` and complete tool explanations from `completeDescription*` using the active locale, with German used for `gr` and English/legacy fallbacks when values are unavailable.

The same popup shows and enables `addTools` for tools with no parameters; parameterized tools still require all required manual values before they can be added.

The sender-username mention entry is a prompt placeholder rather than an `ITool`. In manual mode, selecting it inserts `[SENDER_USERNAME]` into the prompt textbox through `onAddToPrompt`, closes the popup, and never adds it to or inherits state from the selected tools collection. The entry remains visible but is non-focusable and disabled in prompt-analysis mode.

`aiflow/aiPromptBox.tsx` reflects selection directly on the existing clickable tool options below the prompt input in both manual and analysis modes. A selected option is highlighted and replaces its plus icon with an accessible remove button that updates the parent `ITool[]` without opening the settings popup; no separate selected-tool list is rendered.

`aiflow/aiPromptBox.tsx` keeps the Prompt Analysis radio option enabled regardless of the current prompt length and delegates modal ownership to `aiflow/flowAndAIInBox.tsx`. The parent renders the shared modal with a controlled `TextArea`; Accept remains disabled until the text is longer than 20 characters, then calls the child callback to update the prompt and request `GetPromptAnalysis`. Close dismisses the modal without changing the prompt.

Before opening the Prompt Analysis modal, `aiflow/aiPromptBox.tsx` requests `/api/ai/HasPageAnalysis`. The modal opens only when the authenticated backend response value is `true`; otherwise it shows the localized `InternalNotify_PageAnalysisNotCompleted` warning.

`aiflow/aiPromptBox.tsx` displays each AI tool's localized `displayName*` field according to the active i18next locale, using German text for `gr` and falling back to English or the tool name when a localized value is unavailable.

When `aiflow/aiPromptBox.tsx` loads an existing prompt through `GetPrompt`, it synchronizes the response `tools` into the parent tool state by `toolId`; nullable API parameters are normalized to empty arrays so the matching tool option is shown as selected.

`aiflow/flow.tsx` reports successful toolbar saves to `FlowAndAIInbox` only for `newFlow`. The parent adopts the returned master-flow record and selects its ID, causing the editor to reload through `GetMasterFlow`; existing-flow toolbar saves do not request an additional reload.

`aiflow/flow.tsx` refreshes connection paths in `useLayoutEffect` after node transforms commit. Zoom no longer schedules a delayed connection refresh, preventing SVG paths from lagging behind scaled nodes. The DOM-measurement fallback uses the CSS node width of `280px`.

`aiflow/flowAndAIInBox.tsx` opens a localized new-flow settings modal before selecting `newFlow`. The modal requires a title, collects follower, snap-grid, and panning-boundary settings, accepts an imported JSON editor state, and mounts the editor only after Continue.

The same component keeps the continued new flow in `userslist` as a local `newFlow` Draft item. A successful manual save removes that item and prepends the backend-returned `ITotalMasterFlow`; `aiflow/flow.tsx` treats a new flow as unsaved until that save succeeds.

`aiflow/flowNode/GenericItemNode.tsx` and `aiflow/flowNode/WeblinkNode.tsx` validate web links on blur. A valid HTTP(S) link must have a non-empty final hostname segment after a dot (for example, `.com` or `.ir`); the suffix is not restricted to a fixed list. Invalid non-empty links set the shared `InputBox` danger status and replay its shake animation once; editing the value clears the error state.

`popups/sendFile.tsx` and `popups/sendVideoFile.tsx` use the shared `UploadFile` helper for progress-aware uploads, so direct-message image and video URLs are released only after the global one-second media-availability delay.

<<<<<<< HEAD
`direct/directInbox.tsx` returns the fetched thread page from its `fetchData` pagination callback. This is required by `useInfiniteScroll`; returning an empty array would make the hook mark pagination as exhausted even when the inbox API returns a non-null `nextMaxId`. `IInbox.nextMaxId` is nullable because the backend uses `null` to indicate the final page.

`direct/directInbox.tsx` keeps HTTP/API and initial-load failures local to the inbox so an unavailable category does not crash the whole route. Notifications retain the HTTP status and backend-provided reason when available.

`direct/directInbox.tsx` resolves a `threadId` deep link from the browser URL after either inbox category has loaded. Reading `window.location.search` avoids the mixed App Router/legacy-router query timing issue; matching General and Business threads select their category and conversation, so links from the home Last Messages card open the requested chat.

# Direct inbox rendering tolerates terminal pages containing threads with an empty `items` array. Message previews, timestamps, and unread counts use empty fallbacks instead of reading `sentByOwner`, `text`, or `createdTime` from an absent first item.

`popups/editAutoReply.tsx` and `popups/editAutoReplyForMedia.tsx` show the Create Automation AI and Create Automation Flow actions whenever the active AI prompt or flow has not been selected, even when the corresponding `DragDrop` list contains options. Existing saved prompts and flows count as selected and keep the actions hidden.

`components/page/popup/quickReply.tsx` renders a localized Instagram comment-permission state with an inline SVG and an Enable Permission action only when `session.user.commentPermission === false`; the action checks `/api/user/ip`, opens `InvalidIpModalContent` for Iranian IPs, and otherwise follows the existing Instagram redirect flow. The existing media auto-reply editor remains unchanged when access is available.

> > > > > > > sepehr

## Hooks

React hooks are present when named `use*` functions/files exist.

## Utilities

Utility functions live in local files where applicable.

## Services

Service integration happens through helper APIs or route handlers when applicable.

## Providers

Providers are documented where the module defines React providers.

## Repositories

No repository pattern implementation was discovered in this module.

## Types

Types are in local files or shared `models/` and `types/`.

## Interfaces

Interfaces are in local files or shared `models/interfaces.ts`.

## Enums

Enums are in local files or shared `models/enums.ts`.

## Configuration

Configuration is local to the folder unless documented in `CONFIGURATIONS.md`.

## Database Usage

No local database objects were discovered. Data persists through external backend APIs where applicable.

## State Management

Mostly React local state, context, NextAuth session, or external state from backend APIs.

## External Integrations

External services are accessed through Brancy backend APIs unless this module documents another integration.

## Security

Do not expose tokens, secrets, or user data. Follow auth and redirect rules.

## Permission Rules

Use `RoleAccess`, session permission flags, and backend authorization where relevant.

## Performance

Keep renders and network calls scoped; avoid unnecessary broad fetches.

## Caching

PWA, Next, browser, or backend caching applies only where configured.

## Environment Variables

No module-specific env vars documented unless related files read them.

## Related Files

components/messages/.

## Related Modules

Parent module: `components`.

## Known Issues

No confirmed module-specific issue recorded at initialization.

## Technical Debt

Needs deeper per-feature enrichment during future work.

## Future Improvements

Add examples, endpoint schemas, and diagrams when this module is changed.

## Last Updated

2026-08-02

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
