# Design System

## Version

Design System v1.0

Status:

Initial Foundation


---

# Design Philosophy

The Arandi Platform design should communicate:

- Innovation
- Technology leadership
- Enterprise trust
- Simplicity
- Intelligence


The visual language should be:

- Minimal
- Premium
- Modern
- Professional
- Clean


---

# Design Principles

## 1. Simplicity

Avoid unnecessary visual complexity.

Every element must have a purpose.


## 2. Premium Enterprise Feel

The interface should feel suitable for a high-level technology company.


## 3. Consistency

All pages and components must follow shared design rules.


## 4. Motion With Purpose

Animations should improve understanding and user experience.

Avoid decorative animations without value.


---

# UI Framework

Primary:

shadcn/ui


Additional:

21st.dev components when appropriate.

Motion:

- `motion` for React with `LazyMotion`, `domAnimation`, and `MotionConfig reducedMotion="user"`.
- Non-essential motion must preserve the final state for `prefers-reduced-motion` visitors.

---

# Public Theme Variants

- **Arandi Classic** (`default`) remains the existing public baseline and is never replaced by a visual experiment.
- **Arandi Pro** (`arandi-pro`) is a light Enterprise Glass variant: navy authority surfaces, blue CTA accent, high-contrast readable text, controlled translucency, and spacious 4/8px rhythm.
- **Arandi Scrollwise** (`scrollwise`) is an additive editorial narrative variant for Home: warm ivory canvas, graphite technical illustration, restrained Arandi blue/cyan signals, nine native-scroll chapters across three acts, minimal fixed story navigation, and CMS-derived evidence. It must never imitate another brand's artwork, copy, logo, or exact composition.
- Themes use semantic CSS variables only. Public values are allowlisted and sanitized before server rendering; Admin does not inherit public theme variables.
- There is no visitor-facing theme toggle. Administrators preview privately, then publish one canonical global theme after review.
- Arandi Pro uses source-owned adaptations of 21st.dev Bento Feature Grid, Spotlight Card, Shining Button, and AI Chat Input patterns; Lucide remains the sole icon family.
- Scrollwise scene art is stored as governed Prisma Media in paired desktop/mobile WebP variants. Nine private `site.scrollwise.scene.*` fields accept only the fixed named local image pairs; arbitrary hosts, SVG, extra keys, and secret-bearing values are rejected. Desktop images are 3200×900; mobile images are separately composed at 900×1200.
- Scrollwise motion uses native scrolling with one viewport-sticky Canvas: continuous camera travel within each governed illustration and eased crossfades between chapters are driven by scroll progress. It must not hijack the wheel/trackpad. A visible pause control, quantized `prefers-reduced-motion` rendering, semantic heading order, readable overlay contrast, bounded device-pixel ratio, and requestAnimationFrame cleanup are required.
- Scrollwise desktop art should begin as a near-complete 32:9 panorama, then combine reversible end-to-end horizontal focus travel, restrained depth zoom, and minimal vertical drift. Text panels alternate between logical content-start/end and enter laterally. Every scene is followed by a semantic contextual-menu interlude; its warm-white veil may peak near 0.94 before receding into the next scene. Interface surfaces must be brighter warm white with controlled translucency; do not stack opaque cream panels over cream artwork.
- The fixed Canvas sequence explicitly loads the active scene and two forward scenes as native scroll progresses. Do not rely on browser lazy loading for programmatic, detached `Image` sources and do not eagerly transfer all nine scenes at first paint. The Canvas exposes current scene and image-state data attributes for QA while remaining hidden from the accessibility tree.
- Admin Theme editing uses progressive disclosure: bounded heading/motion/pacing controls first, bilingual narrative copy second, then nine collapsible image groups with visible desktop/mobile previews and 44px controls. Narrative editing uses explicit Persian/English tabs, locale direction, required visible labels, nearby character counts, and separate chapter/contextual-card title/body fields. At the 100% default, Scrollwise chapter headings use 26–48px, interlude headings 18–32px, and the closing heading 22–40px; the single 90–115% control must preserve this hierarchy. Linked evidence-card content remains in Published CMS Card editing.
- Focus states, labels, 44px touch controls, RTL/LTR behavior, no horizontal overflow, and reduced motion are non-negotiable acceptance criteria.


---

# Styling System

Framework:

Tailwind CSS


Rules:

- Use reusable utility patterns.
- Avoid duplicated styles.
- Maintain responsive design.


---

# Typography

## Font System

The platform uses a bilingual typography system.

### English

Primary Font:

Exo

Usage:

- English content
- Latin headings
- Brand elements
- Technical terminology


### Persian

Primary Font:

Vazirmatn

Usage:

- Persian content
- RTL interfaces
- Persian headings and body text


## Typography Rules

- The font system must support both LTR and RTL layouts.
- Typography hierarchy must remain consistent across languages.
- Font weights should be selected based on readability and enterprise appearance.
- Avoid mixing multiple font families.
---

# Color System

Brand colors:

To be finalized during Phase 1.

Initial direction:

- Light sky blue
- Dark gray
- White


Design should support:

- Light mode
- Future dark mode compatibility


---

# Layout Principles

Preferred characteristics:

- Generous whitespace
- Clear hierarchy
- Responsive layouts
- Strong visual focus


---

# Components

All reusable UI components should be:

- Modular
- Documented
- Accessible
- Tested


---

# Animation Rules

Library:

Framer Motion


Use cases:

- Page transitions
- Hero interactions
- Micro interactions
- Content reveal


Avoid:

- Excessive movement
- Distracting effects


---

# Responsive Design

The website must support:

- Desktop
- Tablet
- Mobile


Mobile experience is not a reduced version of desktop.

It must be intentionally designed.

## Scrollwise Narrative Rhythm

- Public chapter numbering is limited to six transformation chapters; prelude, nested industry episodes, and finale remain unnumbered.
- Narrative sections may use unequal heights. Canvas state must follow measured chapter geometry, not equal scroll fractions.
- Major chapters may use the warm-white veil; nested episodes use compact bridges and shorter image handoffs.
- Keep one sparse graphite/ink-wash technical editorial language, but vary palette, negative space, focus direction, panel alignment, and content density by narrative role.
- Desktop scenes are true 32:9 panoramas. Mobile scenes are independently composed 3:4 artwork, never automatic crops.
- Chapter headings target approximately 25px at 390px and 36px at desktop under the 100% setting; nested episode headings remain one tier smaller.
- Project-proof artwork must be explicitly illustrative. Claims and routes must come from Published CMS project records, and unsupported KPI values are prohibited.
- The contextual assistant defaults to a 44px collapsed control on mobile and may suggest the active chapter's governed prompt without changing the secure handoff boundary.


---

# Future AI Interface

The design system should support future components:

- AI chat interface
- Knowledge search
- Intelligent assistants
- Interactive dashboards

---

# Admin Experience

- Admin routes use a dedicated application shell and must not render the public Header/Footer.
- A page must expose one primary `main` landmark.
- Mobile Admin navigation must:
  - be absent from the accessibility tree while closed
  - use dialog/modal semantics while open
  - lock background scrolling
  - move focus into the menu
  - contain Tab focus
  - close with Escape
  - return focus to the trigger
- Responsive acceptance widths include 390px mobile and desktop.
- No horizontal overflow is permitted.
- Loading, error, empty, and populated states require separate QA.
- Destructive actions require an explicit confirmation and dependency-aware messaging.
