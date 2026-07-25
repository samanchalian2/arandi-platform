# Architecture Decisions

This file contains important project decisions.

Only major decisions that affect the project direction are recorded here.

---

# Decision 001

## Use Next.js instead of WordPress

Date:

2026-07-23


Decision:

The project will be developed using Next.js App Router instead of WordPress.


Reason:

The project is planned as an AI-ready enterprise platform, not only a traditional company website.

Next.js provides:

- Better scalability
- Modern frontend architecture
- Better AI integration capability
- Full control over user experience
- Strong TypeScript support


Status:

Approved


---

# Decision 002

## Freeze Technology Architecture

Date:

2026-07-23


Decision:

The technology stack is frozen as Architecture Version 1.1.


Stack:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- 21st.dev
- Framer Motion
- Lucide
- Playwright
- Git


Reason:

Avoid unnecessary technology changes during development.


Status:

Approved


---

# Decision 003

## Use AI-Assisted Development Workflow

Date:

2026-07-23


Decision:

The project will use a structured workflow with:

- ChatGPT as Architect
- Codex as Developer
- Cursor as Development Environment


Reason:

Maintain development speed while preserving architecture quality.


Status:

Approved


---

# Decision 004

## Add Automated Browser Testing

Date:

2026-07-23


Decision:

Playwright is included from the beginning of the project.


Reason:

Prevent regression issues and create a reliable development workflow.


Status:

Approved


---

# Decision 005

## Documentation Driven Development

Date:

2026-07-23


Decision:

Project documentation inside .ai is part of the development process.


Reason:

The project must remain understandable regardless of future developers or AI models.


Status:

Approved


---

# Decision: AI_CONTEXT.md as Project-Independent Protocol

Date:

2026-07-23


## Decision

The AI_CONTEXT.md file is defined as a project-independent instruction layer for the AI documentation system.


## Reason

The project knowledge system must be reusable across different projects.

Project-specific information must not be mixed with the instructions that define how the AI should read and use the documentation.


## Rules

AI_CONTEXT.md must contain only:

- Documentation structure
- Reading order
- AI operating rules
- Development workflow
- Continuity instructions


AI_CONTEXT.md must not contain:

- Project name
- Project goals
- Business information
- Technology details
- Current status
- Active tasks


## Result

The `.ai` folder becomes a reusable AI project memory framework that can be copied to future projects.

---
## Typography Decision

Date:
2026-07-25

Decision:

The project will use a bilingual font system:

- Exo for English/LTR content
- Vazirmatn for Persian/RTL content

Reason:

Provides a modern technology-oriented visual identity while maintaining Persian readability.

Status:

Frozen for Version 1.