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
- `components/page/ai/popup/CharacterSheetPicker.tsx`
- `app/dev/characterSheet/page.tsx`
- `app/dev/page.tsx`
- `app/feature/featureCatalog.ts`
- `i18n/featureKnowledge.ts`

## Current Scope

The AI workspace (`PageAI`, `legacy-pages/page/ai/index.tsx`) exposes Character sheet as a fourth creator tab next to Images/Videos/Voices (`MediaTab` `charactersheet` → creator tab `createcharactersheet`, query `type=4`) and as a fourth `MediaLibrary` history filter (`PendingMediaType` `charactersheet`). On that tab `PageAI` renders `CharacterSheet` (passing `setActiveTab` so the shared media tabs stay visible) with its own model selection (`characterSheetModelSelection`). The Dev Panel link `/dev/characterSheet` renders `PageAI` with `characterSheet`, which starts on this tab with media tabs and history filters hidden. `PageAI` loads image creators and owns the model-list popup, `hasFeatureCount`/NotFeature popup, `CreateImage` (with `clientContext`), pending generations, and SignalR results. For the character-sheet tab `PageAI` removes Text to Image models (name/displayName normalized to `texttoimage`) from the creators passed to `CharacterSheet` and the model-list popup; creators left with no models are hidden.

`CharacterSheet` renders `MediaCreator` (media tabs shown only when `setActiveTab` is passed) and injects two accordion sections through `headerContent`, after the model selector:

- 01 Choose the subject type: Human, Product, Object, Animal, Custom; Auto/Advanced reference mode; local reset. Identity name (`characterName`, required: usage calculation and Create stay disabled until it is non-empty, via the `MediaCreator` prop `extraFieldsAreValid`) and description (`characterDescription`) inputs live at the top of 03 Write the prompt.
- 02 Add reference images: the limit and accepted file types come from the selected model's first `InputType.ImageArray` input (`maxArrayLength`, `fileTypes`) from `GetImageCreators`, like the AI creator. Files upload immediately via `UploadFile` (progress shown); Advanced mode groups uploads into type-specific slots. If the model has no image input, the section says references are not accepted.

Prompt and output settings are the AI creator's own prompt textarea and dynamic model settings, rendered inside the Character Sheet accordions 03 Write the prompt and 04 Configure the output through the `MediaCreator` render props `renderPromptSection` and `renderSettingsSection` (when `renderSettingsSection` is set, MediaCreator's own settings header/collapse is hidden and fields are always expanded inside the accordion). The reference input is hidden from the settings and filled from `externalMediaValues`; `requestExtras` adds `characterType` (`CharacterType`: All=-1, Human=0, Product=1, Object=2, Animal=3, Custom=4), `characterName`, and `characterDescription` (`null` when empty) to both `GetImageUsage` and `CreateImage`. The selected type's prompt template is applied through `promptToUse` whenever the type or model changes. Identity type, mode, name, description, and open sections persist in localStorage (`character-sheet-local-draft-v2`).

History: the Character sheet history list (`PageAI.fetchCharacterSheets`, first page and infinite scroll) sends `characterType=-1` (`CharacterType.All`) to `GetImages`; the image history does not send it. Character sheet cards open the image modal.

Push results: `IGetMedia.characterType` (optional, not in Swagger) is non-null for character sheet generations. `PageAI.handleGetNotif` adds such `AIImageSuccess` results to the character-sheet list and others to the image list.

Reusing character sheets: in the regular AI creator, every image `InputType.ImageArray` input (reference images) shows a "Character sheet" button beside the upload box (disabled when the input is full). It opens `CharacterSheetPicker` in a `popupLarge` modal (portaled to `document.body`), which calls `GET Instagramer/MediaAi/GetImages` with `mediaCreationStatus=2`, `nextMaxId`, and `characterType=-1` (`CharacterType.All`, the only value sent for now) and supports "Load more". Selecting an item appends its `thumbnailUrl` to the input value (sent as the JSON array value of e.g. `referenceImages`) and shows it as a preview; already-selected items are disabled. The button is not shown inside `CharacterSheet`, whose reference input is supplied by `externalMediaValues`.

The previous attributes, custom prompt/negative/rules, style/lighting/view settings, prompt preview, and undo/redo were removed.

## Explicit Non-Goals

Apart from the Image Generation flow above, the editor does not use a backend model, server action, or database. Selected image files remain in browser memory as object URLs and are revoked on removal or component unmount. Only serializable editor fields may persist in browser localStorage; reference image binaries and object URLs are never persisted.

## Future Architecture Boundary

Future production work must preserve Visual Identity as a provider-agnostic workspace asset and source of truth rather than embedding provider IDs in the identity model. UI state should eventually map to independent identity, reference, normalization, generation gateway, consistency, snapshot/version, asset, permission, queue, usage, and audit contracts. No such contract is implied by the current prototype.

Generation must reference an immutable identity version/snapshot so later identity edits do not alter prior outputs. Heavy files belong in object storage, dynamic attributes may use a flexible schema, and analysis/generation should be asynchronous jobs. Provider/model selection, prompt compilation, negative constraints, reference injection, retries, fallback, usage, and metadata belong behind an AI gateway rather than in this component.

## Change Impact

- The Character sheet tab reuses the image creators (`GetImageCreators`) loaded by the creator-loading effect; keep its model selection separate from the Images tab.
- Keep `CharacterType` mapping (`CHARACTER_TYPE_BY_IDENTITY`) aligned with the backend enum.
- Keep the feature catalog record audit-only while behavior remains local or mocked.
- Preserve Image and Video creation behavior when changing the shared Create toggle.
- Update this document, module docs, `CURRENT_STATE.md`, `CHANGELOG.md`, `TODO.md`, and feature knowledge when the prototype scope changes.

## Known Risks

- Large type-specific schemas can overwhelm the UI; the attributes accordion remains independently collapsible and values are optional.
- Direct navigation between steps currently permits incomplete optional sections; only Identity Name is enforced before the local preview.
- Fixed score values and local lifecycle labels must not be mistaken for real AI validation or persistence.
- Full browser coverage for RTL, mobile, object URL cleanup, and mode/type transitions is pending.
