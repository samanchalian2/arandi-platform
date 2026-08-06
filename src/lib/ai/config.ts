import { prisma } from "@/lib/prisma";

export const DEFAULT_AI_MODEL = "gpt-5.6-sol";
const SAFE_MODEL = /^[a-z0-9][a-z0-9._-]{0,79}$/;

export type AIRuntimeSelection = {
  provider: "openai";
  model: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export function parseAIRuntimeSelection(value: unknown): AIRuntimeSelection {
  const record = asRecord(value);
  if (
    !record
    || record.provider !== "openai"
    || typeof record.model !== "string"
    || !SAFE_MODEL.test(record.model)
    || Object.keys(record).some((key) => key !== "provider" && key !== "model")
  ) {
    throw new Error("AI runtime setting must contain an allowlisted provider and model.");
  }
  return { provider: "openai", model: record.model };
}

export async function getAIRuntimeSelection(): Promise<AIRuntimeSelection> {
  const setting = await prisma.setting.findUnique({
    where: { key: "ai.runtime" },
    select: { value: true, isPublic: true },
  });
  if (!setting) return { provider: "openai", model: DEFAULT_AI_MODEL };
  if (setting.isPublic) throw new Error("AI runtime setting must remain private.");
  return parseAIRuntimeSelection(setting.value);
}
