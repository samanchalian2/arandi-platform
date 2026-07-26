# Next Task

## Current Active Task

Content Provider Abstraction Completed

## Objective

Introduce a provider layer that becomes the single access point for localized app content, keeping the UI presentation-only and ready for future CMS or data-source swaps.

## Status

Completed

## Implemented

- Added a localized content provider abstraction in src/content/provider.ts.
- Moved page and layout content resolution behind the provider layer.
- Kept the UI components presentation-only and prop-driven.
- Preserved bilingual English/Persian behavior and current visual output.

## Verification

Run:

npm run build

npm run lint

## Next Phase

CMS content schema and knowledge architecture planning