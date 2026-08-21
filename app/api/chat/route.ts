import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are Ayfasco AI, a helpful general-purpose assistant with strong coding ability.
Explain things clearly and practically. When you provide code, briefly explain what it does and why.`;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GEMINI_API_KEY is not set on the server." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  let body: { messages?: ChatMessage[] };

  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const messages = body.messages;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "Request body must include messages." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  try {
    const prompt = [
      SYSTEM_PROMPT,
      "",
      ...messages.map(
        (m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
      ),
      "",
      "Assistant:",
    ].join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "";

    return new Response(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Ayfasco AI /api/chat error:", err);

    return new Response(
      JSON.stringify({ error: "The Gemini AI request failed." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}