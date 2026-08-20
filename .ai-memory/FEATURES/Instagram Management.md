# Instagram Management

## Priority

Critical

## Business Impact

High

## AI Reading Priority

1

## Source Of Truth

- `legacy-pages/instagramer/`
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
