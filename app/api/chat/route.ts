import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

// Run on the Node.js runtime (not Edge) since the Anthropic SDK needs it.
export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are Ayfasco AI, a general-purpose assistant with a strong coding intellect.
You explain your reasoning clearly rather than dumping code with no context.
When you write code, briefly say what it does and why, then show it.`;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          "AI_API_KEY is not set on the server. Add it to .env.local (see .env.local.example).",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages = body.messages;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "Request body must include a non-empty messages array." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Ayfasco AI /api/chat error:", err);
    return new Response(
      JSON.stringify({ error: "The AI request failed. Check server logs for details." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
