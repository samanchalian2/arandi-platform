import type { AIChatRequest, AIChatResponse, AIGateway } from "./types";

export class PlaceholderAIGateway implements AIGateway {
  async sendMessage(_request: AIChatRequest): Promise<AIChatResponse> {
    throw new Error("AI gateway is not implemented yet.");
  }
}

export function createAIGateway(): AIGateway {
  return new PlaceholderAIGateway();
}
