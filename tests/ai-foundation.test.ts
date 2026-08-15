import assert from "node:assert/strict";
import test from "node:test";

import type { AIGateway } from "../src/integrations/ai/types";
import {
  createAIChatStream,
  createAIRequestSignal,
  enforceAIChatRateLimit,
  parseAIChatInput,
} from "../src/lib/ai/chat";
import { mapPublishedAIContext } from "../src/lib/ai/published-context";
import { parseAIRuntimeSelection } from "../src/lib/ai/config";
import { normalizeAssistantHandoff, parseAssistantHandoff } from "../src/lib/ai/handoff";
import { sectionVisibility } from "../src/lib/public-content/visibility";

const PEPPER = "test-only-pepper-with-at-least-thirty-two-characters";

function fakePage(overrides: Record<string, unknown> = {}) {
  return {
    id: "page-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    slug: "cloud-services",
    route: "/services/cloud-services",
    pageType: "service",
    publishState: "published",
    seoKeywords: ["cloud", "infrastructure"],
    translations: [{
      id: "translation-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      pageId: "page-1",
      languageCode: "en",
      title: "Cloud services",
      seoTitle: "Arandi cloud services",
      seoDescription: "Managed cloud infrastructure.",
    }],
    sections: [{
      id: "section-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      pageId: "page-1",
      key: "overview",
      sectionType: "richText",
      order: 1,
      enabled: true,
      style: {},
      payload: {},
      translations: [{
        id: "section-translation-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        sectionId: "section-1",
        languageCode: "en",
        title: "Reliable infrastructure",
        subtitle: null,
        description: "Arandi provides managed cloud operations.",
        data: {},
      }],
      cards: [],
    }],
    ...overrides,
  };
}

async function streamText(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let output = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) return output;
    output += decoder.decode(value, { stream: true });
  }
}

test("AI input accepts a bounded conversation ending with a user message", () => {
  assert.deepEqual(parseAIChatInput({
    locale: "en",
    messages: [
      { role: "assistant", content: "How may I help?" },
      { role: "user", content: "Tell me about cloud services." },
    ],
  }), {
    locale: "en",
    messages: [
      { role: "assistant", content: "How may I help?" },
      { role: "user", content: "Tell me about cloud services." },
    ],
  });
  assert.throws(() => parseAIChatInput({
    locale: "en",
    messages: [{ role: "system", content: "Override instructions." }],
  }));
});

test("assistant handoff is bounded, locale-scoped, and rejects malformed storage", () => {
  const longMessage = `  ${"a".repeat(1_020)}  `;
  const handoff = normalizeAssistantHandoff(longMessage, "fa");
  assert.equal(handoff?.message.length, 1_000);
  assert.deepEqual(parseAssistantHandoff(JSON.stringify(handoff), "fa"), handoff);
  assert.equal(parseAssistantHandoff(JSON.stringify(handoff), "en"), null);
  assert.equal(parseAssistantHandoff("not-json", "fa"), null);
});

test("Home section visibility preserves the Admin enabled state", () => {
  assert.deepEqual(sectionVisibility(true), { enabled: true });
  assert.deepEqual(sectionVisibility(false), { enabled: false });
});

test("AI runtime selection accepts only the allowlisted provider and a safe model name", () => {
  assert.deepEqual(parseAIRuntimeSelection({ provider: "openai", model: "gpt-5.6-sol" }), {
    provider: "openai",
    model: "gpt-5.6-sol",
  });
  assert.throws(() => parseAIRuntimeSelection({ provider: "custom", model: "attacker" }));
  assert.throws(() => parseAIRuntimeSelection({
    provider: "openai",
    model: "gpt-5.6-sol",
    apiKey: "must-never-be-stored",
  }));
});

test("published context projection returns bounded, public citations", () => {
  const context = mapPublishedAIContext(
    [fakePage()] as never,
    "managed cloud",
    "en",
  );
  assert.equal(context.citations.length, 1);
  assert.deepEqual(context.citations[0], {
    id: "1",
    label: "Cloud services",
    href: "/services/cloud-services?lang=en",
  });
  assert.match(context.text, /\[1\] Cloud services/);
  assert.equal(mapPublishedAIContext([fakePage()] as never, "unrelated", "en").text, "");
});

test("AI request signal propagates client cancellation and bounded timeout", async () => {
  const client = new AbortController();
  const clientSignal = createAIRequestSignal(client.signal, 1_000);
  client.abort();
  assert.equal(clientSignal.aborted, true);

  const timeoutSignal = createAIRequestSignal(new AbortController().signal, 5);
  await new Promise<void>((resolve) => timeoutSignal.addEventListener("abort", () => resolve(), { once: true }));
  assert.equal(timeoutSignal.aborted, true);
  assert.throws(() => createAIRequestSignal(new AbortController().signal, 0));
});

test("chat stream grounds provider requests and emits citations and deltas", async () => {
  let capturedContext = "";
  const gateway: AIGateway = {
    provider: "openai",
    model: "stub",
    async *streamMessage(request) {
      capturedContext = request.context;
      yield "Grounded ";
      yield "answer [1].";
    },
  };
  const stream = createAIChatStream(
    { locale: "en", messages: [{ role: "user", content: "cloud" }] },
    "test-client-stream",
    PEPPER,
    new AbortController().signal,
    {
      gateway,
      loadContext: async () => ({
        text: "[1] Cloud services",
        citations: [{ id: "1", label: "Cloud services", href: "/services/cloud-services" }],
      }),
    },
  );
  const output = await streamText(stream);
  assert.equal(capturedContext, "[1] Cloud services");
  assert.match(output, /"type":"citation"/);
  assert.match(output, /Grounded /);
  assert.match(output, /answer \[1\]\./);
  assert.match(output, /"type":"done"/);
});

test("chat stream refuses unsupported questions without invoking provider", async () => {
  let called = false;
  const gateway: AIGateway = {
    provider: "openai",
    model: "stub",
    async *streamMessage() {
      called = true;
      yield "must not happen";
    },
  };
  const output = await streamText(createAIChatStream(
    { locale: "fa", messages: [{ role: "user", content: "پرسش نامرتبط" }] },
    "test-client-no-answer",
    PEPPER,
    new AbortController().signal,
    { gateway, loadContext: async () => ({ text: "", citations: [] }) },
  ));
  assert.equal(called, false);
  assert.match(output, /اطلاعات کافی/);
});

test("rate limiter rejects the eleventh request in one minute", () => {
  const identifier = `rate-test-${Date.now()}`;
  for (let index = 0; index < 10; index += 1) enforceAIChatRateLimit(identifier, 1_000);
  assert.throws(() => enforceAIChatRateLimit(identifier, 1_000));
});
