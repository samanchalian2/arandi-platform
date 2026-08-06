export type ChatRole = "user" | "assistant";

export type ChatMessagePayload = {
  role: ChatRole;
  content: string;
};

export type AIProvider = "openai";

export type AIChatRequest = {
  locale: "en" | "fa";
  messages: ChatMessagePayload[];
  context: string;
  safetyIdentifier: string;
};

export type AIGateway = {
  readonly provider: AIProvider;
  readonly model: string;
  streamMessage(request: AIChatRequest, signal: AbortSignal): AsyncIterable<string>;
};
