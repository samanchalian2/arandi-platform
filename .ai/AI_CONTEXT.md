# AI Context Guide

## Purpose

This file is the entry point for any AI assistant working on the Arandi Platform project.

Before making any analysis, suggestion, or code change, the AI must read and understand this file first.

This document explains:

- What the project is.
- How the project brain works.
- Which files must be read.
- In what order they must be read.
- What rules must be followed.

---

# Project Identity

Project:

Arandi Platform

Type:

AI-first Enterprise Web Platform

Purpose:

Build a premium, scalable, modern enterprise website platform using Next.js and AI-assisted development.

---

# AI Operating Mode

You are working inside an existing engineered project.

Do not behave as a standalone coding assistant.

You must:

- Respect existing architecture.
- Follow project decisions.
- Understand current state before acting.
- Make controlled changes.

---

# Project Brain Structure

The `.ai` folder is the source of project knowledge.

It contains:

## PROJECT.md

Purpose:

Defines project identity, goals, and overall direction.

Read to understand why the project exists.


---

## ARCHITECTURE.md

Purpose:

Defines technical architecture and technology choices.

Read before any technical decision.


---

## CURRENT_STATE.md

Purpose:

Defines the exact current condition of the project.

Always read first before starting work.


---

## NEXT_TASK.md

Purpose:

Defines the single active task.

Do only this task unless explicitly instructed otherwise.


---

## DESIGN_SYSTEM.md

Purpose:

Defines visual language and UI rules.

Read before creating or modifying UI.


---

## DECISIONS.md

Purpose:

Contains important architectural decisions.

Never violate decisions recorded here.


---

## MASTER_PLAN.md

Purpose:

Defines long-term roadmap and phases.


---

## CHANGELOG.md

Purpose:

Contains history of important changes.


---

## SESSION_LOG.md

Purpose:

Contains development session summaries.


---

## PROMPTS.md

Purpose:

Contains proven AI prompts used in development.


---

# Required Reading Order

Every AI session must follow this order:

1. AI_CONTEXT.md

2. CURRENT_STATE.md

3. NEXT_TASK.md

4. ARCHITECTURE.md

5. DESIGN_SYSTEM.md

6. DECISIONS.md

7. PROJECT.md

8. MASTER_PLAN.md

9. CHANGELOG.md

10. SESSION_LOG.md

11. PROMPTS.md


---

# Development Workflow

Every development session:

1. Read project context.

2. Identify the active task.

3. Explain understanding before implementation.

4. Modify only required files.

5. Test changes.

6. Update documentation.

7. Commit changes to Git.


---

# AI Roles

## ChatGPT

Role:

Architect and reviewer.

Responsibilities:

- Architecture decisions.
- Planning.
- Code review.
- Quality control.


---

## Codex

Role:

Developer.

Responsibilities:

- Implement tasks.
- Create and modify code.
- Refactor.
- Fix bugs.


---

## Cursor

Role:

Development environment.

Responsibilities:

- File management.
- Terminal execution.
- Git operations.


---

# Forbidden Actions

Do not:

- Change framework without approval.
- Add unnecessary libraries.
- Create random documentation files.
- Ignore project decisions.
- Work without reading CURRENT_STATE.md.
- Perform large refactors without approval.


---

# Current Project Status

Current Phase:

Phase 0 - Initialization


Completed:

- Architecture setup
- Next.js setup
- UI foundation setup
- Git setup
- GitHub setup
- Playwright verification


Next:

Prepare Codex workflow.

---

# Final Rule

The project brain is the source of truth.

When uncertain:

Read the documentation first.

Do not guess.