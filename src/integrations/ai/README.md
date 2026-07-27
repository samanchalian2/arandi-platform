# AI Integration Placeholder

This module defines the application-side integration boundary for AI chat.

Current status:

- Placeholder only
- No external API calls
- No runtime wiring to UI yet

## Intended Flow

1. Chat UI collects user input.
2. Application service builds a normalized request payload.
3. AI gateway forwards the request to an external provider API.
4. Gateway returns a normalized response payload.
5. Chat UI renders the response.

## Files

- types.ts: shared request and response contracts for AI chat integration.
- gateway.ts: placeholder gateway with a not-implemented sendMessage method.

## Notes

Knowledge Base remains part of the content domain and can be passed as context IDs to the AI request payload.
