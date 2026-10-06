# Instagram Management

## Priority

Critical

## Business Impact

High

## AI Reading Priority

1

## Source Of Truth

- `legacy-pages/home/`, `legacy-pages/page/`, `legacy-pages/message/`
- `components/`
- `helper/apiRouteMap.ts`
- `helper/clientFetchApi.ts`

## Depends On

- Authentication
- API proxy routes
- Localization

## Used By

- Instagramer dashboard
- Post, story, message, comment, ads, and market flows
- Automation and AI-oriented features

## Change Impact

Changing this feature may affect dashboard navigation, API mapping, messaging, ads, market flows, and any Instagram-specific UI state.

## Notes

Use this doc when the requested work is described as an Instagramer capability instead of a folder path.

The `/page/tools` hashtag capability is presented in one collapsible `hashtagManager` card with a shared toggle for saved hashtags and trend/search hashtags. Its shared header hides the manager content and reduces the card height while closed.

Live media auto-replies do not expose the must-follow-page option for AI and Flow modes.

General and media auto-replies do not expose the must-follow-page option for AI mode, and AI replies save that setting as disabled.
When an auto-reply is inactive, its settings are disabled while the activation switch remains interactive.
General and media keyword auto-replies use the localized `Contain` switch to choose between substring matching (`isContain: true`) and exact whole-comment matching (`isContain: false`); missing legacy values default to `true`.

Message Properties displays phone numbers collected through Flows and has a download-icon action beside the card heading. It opens the shared localized calendar in a modal; choosing a date and time within the past six calendar months and pressing Export downloads the Excel file. The export currently covers all Flows; the unused `masterFlowId` query is omitted. The browser timezone offset is sent in seconds, and a returned media path is downloaded from the media host.
Each collected number has a compact external-navigation icon next to its Flow name for opening that Flow; the empty state offers the same control to open the Flow list.
