# Arandi Platform Architecture

## Architecture Version

Frozen v1.3

Status:
Approved

---

# Overview

Arandi Platform is built as a modern AI-ready enterprise web platform.

The architecture prioritizes:

- Scalability
- Maintainability
- Clean code structure
- AI-assisted development
- Automated testing
- Long-term evolution

---

# Technology Stack

## Framework

Next.js

Configuration:

- App Router
- TypeScript
- Server Components where applicable

---

## Language

TypeScript

Purpose:

- Type safety
- Better maintainability
- Reduced runtime errors

---

## Styling

Tailwind CSS

Purpose:

- Utility-first styling
- Responsive design
- Consistent UI development

---

## UI Component System

shadcn/ui

Purpose:

- Reusable components
- Accessible UI primitives
- Maintainable design system

---

## Premium Components

21st.dev

Usage:

- Selected premium UI components
- Enhanced visual quality
- Accelerated development

Rule:

Components must follow the project Design System.

---

## Animation

Framer Motion

Usage:

- Page transitions
- Micro interactions
- Professional animations

Rule:

Animations should be purposeful and not excessive.

---
## Typography

Fonts:

- Exo for English/LTR content
- Vazirmatn for Persian/RTL content

Implementation:

Next.js font optimization system
---
## Icons

Lucide React

Usage:

- Interface icons
- Navigation icons
- UI elements

---

## Testing

Playwright

Responsibilities:

- Browser automation
- User flow testing
- Responsive testing
- Screenshot capture
- Detection of UI/runtime problems

---

## Version Control

Git

Purpose:

- Source control
- Change history
- Safe development

---

# AI Development Architecture

## ChatGPT

Role:

- System architect
- Project manager
- Technical reviewer
- Planning assistant

Responsibilities:

- Define architecture
- Create development tasks
- Review implementation
- Maintain project consistency

---

## Codex

Role:

- AI developer

Responsibilities:

- Create code
- Modify files
- Refactor
- Fix bugs
- Implement tasks

---

## Cursor

Role:

- Development environment

Responsibilities:

- Code editing
- Terminal execution
- Git operations
- Running project

---

# Development Workflow

Every development session follows:

1. Read CURRENT_STATE.md

2. Read NEXT_TASK.md

3. Implement only the active task

4. Test the result

5. Update:

- CURRENT_STATE.md
- CHANGELOG.md
- SESSION_LOG.md

6. Commit changes to Git

---

# Review Process

## Code Review

Performed by:

- ChatGPT
- Codex

Focus:

- Architecture
- Code quality
- Maintainability

---

## Visual Review

Performed by:

- Product Owner
- ChatGPT

Focus:

- User experience
- Design quality
- Brand consistency

---

# Architecture Change Policy

Architecture changes are allowed only when:

1. A serious technical limitation blocks progress.

or

2. A new major version is planned.

Minor preferences or external trends do not justify architecture changes.

---

# Content Domain Architecture (v1.3)

## Goal

The content layer is now entity-first instead of homepage-section-first.

This allows direct CMS mapping to enterprise entities without changing UI components.

## Canonical Entities

- Company
- Services
- Solutions
- Industries
- Projects
- Articles
- KnowledgeBase
- Contact
- Careers
- Pages

## Source of Truth

Canonical domain content is defined in:

- src/content/domain/types.ts
- src/content/domain/localDomainContent.ts

The local adapter projects UI-facing page data from domain entities.

## Provider and Adapter Contract

- ContentAdapter exposes:
	- getDomainContent(lang)
	- getPageContent(lang)
	- getMetadata(lang)
- ContentProvider mirrors the same contract.

getPageContent and getMetadata are projection APIs for current UI compatibility.

getDomainContent is the CMS-ready API for future integrations.

## CMS Integration Readiness

Payload, Strapi, and Directus integration can map directly to domain entities and then feed the adapter projection layer.

No UI changes are required for CMS migration.

## AI Integration Boundary

AI is an application integration service and not a content entity.

Integration flow:

1. Chat UI sends user messages.
2. AI gateway forwards normalized requests to external AI model APIs.
3. Responses are returned to the chat interface.

Placeholder implementation files:

- src/integrations/ai/types.ts
- src/integrations/ai/gateway.ts
- src/integrations/ai/README.md

Note:

Knowledge Base remains part of content domain and can be used as AI context input.