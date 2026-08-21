# Ayfasco AI — V0.1 (Real AI Chat)

This is stage 1: a working chat UI backed by a real Claude (Anthropic) API call,
streamed back to the browser. No auth, no database, no agents yet — on purpose.

## Run it locally

1. Install dependencies:
   ```
   npm install
   ```
2. Create your local env file:
   ```
   cp .env.local.example .env.local
   ```
   Open `.env.local` and paste in a real Anthropic API key from
   https://console.anthropic.com/ as `AI_API_KEY`.
3. Start the dev server:
   ```
   npm run dev
   ```
4. Open http://localhost:3000 and send a message.

## What to check

- The message you type appears on the right.
- A typing indicator (three bouncing dots) appears while the model responds.
- The response streams in on the left, word by word.
- If `AI_API_KEY` is missing or invalid, you should see a red error banner —
  not a silent failure or a crash.
- Check your terminal for any errors from `npm run dev` and the browser
  console (F12 → Console) for any client-side errors.

If something breaks, copy the exact error text (terminal or browser console)
back to me and I'll help diagnose it before we add anything else.

## Project structure

```
ayfasco-ai/
├── app/
│   ├── layout.tsx        # root HTML shell
│   ├── page.tsx          # renders the chat screen
│   ├── globals.css       # Tailwind + minor custom styles
│   └── api/chat/route.ts # backend: talks to the Anthropic API, streams text back
├── components/
│   ├── ChatInterface.tsx # input box, message list, streaming, loading/error state
│   └── MessageBubble.tsx # renders one message (markdown-aware for the AI's replies)
├── .env.local.example    # template for the required secret
└── .gitignore             # keeps .env.local and node_modules out of git
```

## Why it's built this way

- **The API key never reaches the browser.** `AI_API_KEY` is only read inside
  `app/api/chat/route.ts`, which runs on the server. The frontend only ever
  talks to your own `/api/chat` endpoint.
- **Streaming, not polling.** The backend opens a stream to Anthropic and
  pipes text chunks straight through to the browser as they arrive, so
  responses feel instant rather than appearing all at once after a long wait.
- **One AI call, one file.** All model-calling logic lives in one route file
  for now. When we add tools (`read_file`, `run_tests`, etc.) later, this is
  the file that grows — deliberately, once the foundation is solid.

## Next steps (not built yet, on purpose)

Once this stage runs cleanly for you:
1. Better system prompt / coding-specific instructions.
2. Code block copy button + syntax highlighting.
3. Conversation persistence (Supabase) — only once chat itself is solid.
4. GitHub repo + Vercel deployment.

We'll do these one at a time, same as this stage.
