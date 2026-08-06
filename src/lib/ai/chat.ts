import type { AIGateway, ChatMessagePayload } from "@/integrations/ai/types";
import { hashSensitiveValue } from "@/lib/auth/tokens";

import { getPublishedAIContext, type PublishedAIContext } from "./published-context";

const MAX_MESSAGES = 8;
const MAX_MESSAGE_CHARACTERS = 1_000;
const MAX_TOTAL_CHARACTERS = 6_000;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const requestWindows = new Map<string, { count: number; expiresAt: number }>();

export class AIChatInputError extends Error {}
export class AIChatRateLimitError extends Error {}

export type AIChatInput = {
  locale: "en" | "fa";
  messages: ChatMessagePayload[];
};

type ChatDependencies = {
  gateway: AIGateway;
  loadContext?: (query: string, locale: "en" | "fa") => Promise<PublishedAIContext>;
  now?: () => number;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export function parseAIChatInput(value: unknown): AIChatInput {
  const record = asRecord(value);
  if (!record || (record.locale !== "en" && record.locale !== "fa") || !Array.isArray(record.messages)) {
    throw new AIChatInputError("Invalid chat request.");
  }
  if (record.messages.length < 1 || record.messages.length > MAX_MESSAGES) {
    throw new AIChatInputError("Invalid chat history.");
  }
  let total = 0;
  const messages: ChatMessagePayload[] = record.messages.map((item): ChatMessagePayload => {
    const message = asRecord(item);
    if (
      !message
      || (message.role !== "user" && message.role !== "assistant")
      || typeof message.content !== "string"
    ) throw new AIChatInputError("Invalid chat message.");
    const content = message.content.trim();
    if (!content || content.length > MAX_MESSAGE_CHARACTERS) {
      throw new AIChatInputError("Invalid chat message.");
    }
    total += content.length;
    return { role: message.role, content };
  });
  if (total > MAX_TOTAL_CHARACTERS || messages.at(-1)?.role !== "user") {
    throw new AIChatInputError("Invalid chat history.");
  }
  return { locale: record.locale, messages };
}

export function enforceAIChatRateLimit(identifier: string, now = Date.now()): void {
  if (requestWindows.size > 5_000) {
    for (const [key, window] of requestWindows) {
      if (window.expiresAt <= now) requestWindows.delete(key);
    }
  }
  const current = requestWindows.get(identifier);
  if (!current || current.expiresAt <= now) {
    requestWindows.set(identifier, { count: 1, expiresAt: now + WINDOW_MS });
    return;
  }
  if (current.count >= MAX_REQUESTS_PER_WINDOW) throw new AIChatRateLimitError("Rate limit exceeded.");
  current.count += 1;
}

export function createAIRequestSignal(requestSignal: AbortSignal, timeoutMs = 45_000): AbortSignal {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60_000) {
    throw new Error("AI request timeout is invalid.");
  }
  return AbortSignal.any([requestSignal, AbortSignal.timeout(timeoutMs)]);
}

export function createAIChatStream(
  input: AIChatInput,
  clientIdentifier: string,
  pepper: string,
  signal: AbortSignal,
  dependencies: ChatDependencies,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const write = (controller: ReadableStreamDefaultController<Uint8Array>, value: unknown) =>
    controller.enqueue(encoder.encode(`${JSON.stringify(value)}\n`));
  const loadContext = dependencies.loadContext ?? getPublishedAIContext;

  return new ReadableStream({
    async start(controller) {
      try {
        const query = input.messages.at(-1)?.content ?? "";
        const context = await loadContext(query, input.locale);
        for (const citation of context.citations) write(controller, { type: "citation", citation });
        if (!context.text) {
          write(controller, {
            type: "delta",
            delta: input.locale === "fa"
              ? "اطلاعات کافی برای پاسخ به این پرسش در محتوای منتشرشده آرندی وجود ندارد."
              : "The published Arandi knowledge does not contain enough information to answer this question.",
          });
          write(controller, { type: "done" });
          controller.close();
          return;
        }
        const safetyIdentifier = hashSensitiveValue(clientIdentifier, pepper);
        for await (const delta of dependencies.gateway.streamMessage({
          locale: input.locale,
          messages: input.messages,
          context: context.text,
          safetyIdentifier,
        }, signal)) {
          write(controller, { type: "delta", delta });
        }
        write(controller, { type: "done" });
        controller.close();
      } catch (error) {
        if (!signal.aborted) {
          write(controller, {
            type: "error",
            message: error instanceof AIChatRateLimitError
              ? "Too many requests. Please wait and try again."
              : "The AI assistant is temporarily unavailable.",
          });
        }
        controller.close();
      }
    },
    cancel() {
      // The route links this stream to the request signal.
    },
  });
}
