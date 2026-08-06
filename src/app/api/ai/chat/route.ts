import { NextResponse } from "next/server";

import { createAIGateway } from "@/integrations/ai/gateway";
import { requireAuthPepper } from "@/lib/auth/secrets";
import { hashSensitiveValue } from "@/lib/auth/tokens";
import {
  AIChatInputError,
  AIChatRateLimitError,
  createAIRequestSignal,
  createAIChatStream,
  enforceAIChatRateLimit,
  parseAIChatInput,
} from "@/lib/ai";

import { isSameOrigin, requestIp } from "@/app/api/auth/_lib/request";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 8_192;
const REQUEST_TIMEOUT_MS = 45_000;

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 403 });
    }
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 415 });
    }
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, message: "Request is too large." }, { status: 413 });
    }
    const input = parseAIChatInput(JSON.parse(rawBody) as unknown);
    const pepper = requireAuthPepper();
    const clientIdentifier = hashSensitiveValue(requestIp(request) ?? "anonymous", pepper);
    enforceAIChatRateLimit(clientIdentifier);
    const gateway = await createAIGateway();
    const signal = createAIRequestSignal(request.signal, REQUEST_TIMEOUT_MS);
    const stream = createAIChatStream(
      input,
      clientIdentifier,
      pepper,
      signal,
      { gateway },
    );
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof AIChatRateLimitError) {
      return NextResponse.json(
        { ok: false, message: "Too many requests. Please wait and try again." },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }
    if (error instanceof AIChatInputError || error instanceof SyntaxError) {
      return NextResponse.json({ ok: false, message: "Invalid chat request." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "The AI assistant is unavailable." }, { status: 503 });
  }
}
