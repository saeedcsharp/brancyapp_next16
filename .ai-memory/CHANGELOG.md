# Changelog

## 2026-07-20

- Added a responsive bulk product price and discount modal for selected store products, with shared and individual edit modes, percentage and fixed-amount values, price increase/decrease controls, existing price/discount visibility, localized copy, backend persistence, and list refresh after save.
- Updated both shared and individual bulk-product editors to use isolated percentage/amount radio groups that switch between the percentage stepper and fixed-amount input.
- Updated bulk product editor switching to collapse the inactive editor to zero height and animate the active editor's return to the layout.

## 2026-07-19

- Initialized `.ai-memory/` AI Knowledge Base.
- Added project, architecture, API, auth, security, localization, configuration, deployment, and module documentation.
- Added `.github/copilot-instructions.md` to require future assistants to load the knowledge base first.
- Added a reusable SVG brush line chart for date/count statistics and used it in the store total sales statistics card.
- Extended the brush chart to auto-switch between year, month, and day aggregation based on zoom range, and refreshed demo store statistics data to show the transitions.
- Fixed hover bucket selection so the mouse guide line and tooltip use the same displayed coordinates as aggregated series.
- Kept the main line path intact while applying the brush selection as the visible x-domain, matching Apex brush chart behavior.
- Added smooth path redraw animations and animated brush selection movement for chart updates.
- Added transparent per-guide hover zones so tooltips activate across each guide's surrounding interval.
- Updated total sales statistics counters to show the latest report month and separate month-over-month income and sales rates with directional icons.
- Updated total sales statistics month labels and month-over-month comparison keys to honor the user's configured Gregorian, Shamsi, Hijri, or Hindi calendar.
- Reworked the store statistics report into a buyer CRM table ranked by aggregated purchase count and amount, with the latest purchase time.
- Fixed brush chart sizing during route navigation by measuring after the initial layout paint, retrying on the next animation frame, and retaining `ResizeObserver` updates for later layout changes.

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
