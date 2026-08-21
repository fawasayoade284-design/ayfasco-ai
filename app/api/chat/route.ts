import OpenAI from "openai";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are Ayfasco AI, a general-purpose assistant with a strong coding intellect.
You explain your reasoning clearly rather than dumping code with no context.
When you write code, briefly say what it does and why, then show it.`;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "OPENAI_API_KEY is not set on the server." }),
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
  }  const messages = body.messages;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "Request body must include messages." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const openai = new OpenAI({ apiKey });

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_tokens: 2048,
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    });
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) controller.enqueue(encoder.encode(text));
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
      JSON.stringify({ error: "The AI request failed. Check server logs." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
