export type ChatRole = "user" | "assistant" | "system";

export type ChatMessagePayload = {
  role: ChatRole;
  content: string;
  timestamp: string;
};

export type AIProvider = "openai" | "anthropic" | "azure-openai" | "custom";

export type AIChatRequest = {
  sessionId: string;
  locale: "en" | "fa";
  messages: ChatMessagePayload[];
  knowledgeContextIds?: string[];
  provider: AIProvider;
  model?: string;
};

export type AIChatResponse = {
  message: ChatMessagePayload;
  provider: AIProvider;
  model?: string;
  latencyMs?: number;
};

export type AIGateway = {
  sendMessage(request: AIChatRequest): Promise<AIChatResponse>;
};
