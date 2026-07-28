# components/design/phoneInput

## Purpose

Dependency-free, SSR-compatible React phone input with a country selector and a separate national-number input.

## Public API

- `PhoneInput` is exported as both the default export and a named export from `components/design/phoneInput`.
- `PhoneValue` exposes `country`, `countryCode`, `dialCode`, `nationalNumber`, `e164`, `international`, `national`, and `isValid`.
- `PHONE_COUNTRIES` and `countryFlagUrl` are exported for custom selectors and integrations.

## Behavior

- Country flags are loaded from `public/Flag/{ISO2}.svg`.
- The built-in catalog contains the 50 prioritized countries from `preferredCountries`, including `localizedName`, `placeholder`, and `priority` metadata; `PHONE_COUNTRIES` exposes the same records with `format` wired to the placeholder mask. The selected country's `placeholder` is displayed in the national-number input unless an explicit `placeholder` prop overrides it.
- Search matches country name, ISO2, dial code, and fuzzy subsequences.
- Numeric search uses prefix matching (`9` and `98` only match dial codes beginning with those digits). Suggested, preferred, and recently selected countries are promoted above the normal list; recent values are stored under `brancy-phone-recent` when storage is available.
- Suggestions and normal countries are rendered as separate groups with a divider; an unmatched search renders only `No country found` and never falls back to the full list.
- `onlyCountries` and `excludeCountries` constrain the list.
- Persian and Arabic-Indic digits are normalized to ASCII digits. Country masks use `_` as the digit placeholder; formatting and validation normalize the raw number again so typed and pasted values follow the same path.
- The dial code is editable; an incomplete or unknown dial code disables the national-number input and exposes an ARIA error state.
- Clearing the dial code hides the flag, displays a warning icon, marks the country field red, and disables the national-number input until a valid complete dial code is entered.
- An unknown or incomplete dial code also replaces the country flag with the warning icon; the flag is shown only after a complete dial code from the country catalog is entered.
- The callback returns E.164, international, and national representations without requiring a formatting dependency.
- `validate`, `error`, `success`, `loading`, `readOnly`, `disabled`, `autoFocus`, RTL direction, and mobile telephone input mode are supported.
- The country dropdown is rendered through a React portal into `document.body`, uses viewport-fixed positioning, and recalculates its position on resize and scroll so ancestor stacking contexts cannot clip it.

## Integration

Current consumers are `components/signIn/landingSignIn.tsx`, `components/signIn/reactPhoneInput.tsx`, and `components/setting/general/popup/addPartner.tsx`.

The `detectIp`/`detectIpUrl` props use the application-owned `/api/user/ip` endpoint by default; IP detection can be disabled with `detectIp={false}` or replaced with another endpoint. No request is made during SSR.
Automatic detection prioritizes the centralized timezone mapping, then the supplied `defaultCountry`, then the browser locale. IP detection, when enabled, updates the selected country and dial code together.

## Testing

The repository currently has no automated component test harness. TypeScript validation is performed with `npx tsc --noEmit --pretty false`.

## Last Updated

2026-07-28
