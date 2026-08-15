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
- Themes use semantic CSS variables only. Public values are allowlisted and sanitized before server rendering; Admin does not inherit public theme variables.
- There is no visitor-facing theme toggle. Administrators preview privately, then publish one canonical global theme after review.
- Arandi Pro uses source-owned adaptations of 21st.dev Bento Feature Grid, Spotlight Card, Shining Button, and AI Chat Input patterns; Lucide remains the sole icon family.
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
