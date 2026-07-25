# Next Task

## Current Active Task

Phase 1.4 - RTL & Bilingual Foundation


## Objective

Prepare Arandi Platform for bilingual user experiences with proper RTL/LTR architecture.


## Tasks


### 1. Font System

Implement:

- Exo for English/LTR
- Vazirmatn for Persian/RTL

Ensure Next.js font optimization is maintained.


### 2. Direction Support

Prepare:

- LTR layout support
- RTL layout support
- Language-aware document direction


### 3. Component Compatibility

Review components:

- Header
- Footer
- Container
- Sections
- UI components

Ensure:

- No hardcoded left/right assumptions
- Use logical CSS properties where possible


### 4. CSS Foundation

Implement:

- RTL-safe styles
- Direction variables if required
- Typography consistency


### 5. Verification

Test:

- English LTR rendering
- Persian RTL rendering
- Responsive behavior

Run:

- npm run build
- npm run lint


## Completion Criteria

The application can support both Persian RTL and English LTR interfaces without structural changes.


## Next Phase

AI Interface Foundation