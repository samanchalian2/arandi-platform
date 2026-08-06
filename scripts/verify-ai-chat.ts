import "dotenv/config";

import { PrismaClient } from "@prisma/client";

import type { AIGateway } from "../src/integrations/ai/types";
import { createAIChatStream } from "../src/lib/ai/chat";
import { getAIRuntimeSelection } from "../src/lib/ai/config";
import { getPublishedAIContext } from "../src/lib/ai/published-context";

const prisma = new PrismaClient();
const VERIFIER_PEPPER = "ai-verifier-only-pepper-with-at-least-thirty-two-characters";

async function readStream(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let output = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) return output;
    output += decoder.decode(value, { stream: true });
  }
}

async function main() {
  const setting = await prisma.setting.findUnique({
    where: { key: "ai.runtime" },
    select: { isPublic: true },
  });
  if (!setting || setting.isPublic) throw new Error("Private AI runtime setting is not ready.");
  const selection = await getAIRuntimeSelection();
  if (selection.provider !== "openai" || !selection.model) {
    throw new Error("AI runtime selection is invalid.");
  }

  const source = await prisma.page.findFirst({
    where: {
      publishState: "published",
      translations: { some: { languageCode: "en" } },
    },
    select: {
      translations: {
        where: { languageCode: "en" },
        select: { title: true },
      },
    },
  });
  const query = source?.translations[0]?.title.trim().split(/\s+/).find((term) => term.length >= 2);
  if (!query) throw new Error("A Published English source is required for AI verification.");
  const context = await getPublishedAIContext(query, "en");
  if (!context.text || context.citations.length === 0) {
    throw new Error("Published AI context projection returned no grounded source.");
  }

  let gatewayCalls = 0;
  const gateway: AIGateway = {
    provider: "openai",
    model: "deterministic-verifier-stub",
    async *streamMessage(request) {
      gatewayCalls += 1;
      if (!request.context.includes("[1]")) throw new Error("Grounding context was not supplied.");
      if (request.safetyIdentifier === "verifier-client") {
        throw new Error("Raw client identifier crossed the gateway boundary.");
      }
      yield "Verified grounded answer [1].";
    },
  };
  const groundedOutput = await readStream(createAIChatStream(
    { locale: "en", messages: [{ role: "user", content: query }] },
    "verifier-client",
    VERIFIER_PEPPER,
    new AbortController().signal,
    { gateway, loadContext: async () => context },
  ));
  if (!groundedOutput.includes('"type":"citation"') || !groundedOutput.includes("Verified grounded answer")) {
    throw new Error("Grounded stream frames are incomplete.");
  }

  const noAnswerOutput = await readStream(createAIChatStream(
    { locale: "en", messages: [{ role: "user", content: "unsupported-verifier-query" }] },
    "verifier-no-answer",
    VERIFIER_PEPPER,
    new AbortController().signal,
    { gateway, loadContext: async () => ({ text: "", citations: [] }) },
  ));
  if (!noAnswerOutput.includes("does not contain enough information") || gatewayCalls !== 1) {
    throw new Error("Grounded no-answer behavior failed.");
  }

  console.log(JSON.stringify({
    ok: true,
    provider: selection.provider,
    model: selection.model,
    runtimeSettingPublic: setting.isPublic,
    publishedCitations: context.citations.length,
    stubGatewayCalls: gatewayCalls,
    realProviderConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
  }, null, 2));
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "AI verifier failed.");
    process.exitCode = 1;
  });
