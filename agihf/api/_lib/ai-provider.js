/**
 * ai-provider.js — A Girl & Her Futures™
 *
 * Server-only AI provider abstraction for the AGHF Agent. Deliberately
 * lives under agihf/api/_lib/, not agihf/shared/ — everything in
 * agihf/shared/ is a publicly fetchable static file today (every existing
 * module there is loaded via <script type="module" src="./shared/...">
 * directly in the browser), so "server-only" would only be a convention
 * there. A leading-underscore folder inside api/ is never served as a
 * static asset and never routed as a function by Vercel, so this file's
 * key never reaches the client by construction, not just by promise.
 *
 * Only this file (and callers that never re-export it) may reference
 * process.env.GEMINI_API_KEY. Never import this from agihf/shared/ or
 * any file the browser loads.
 *
 * Uses Google Gemini's free tier (no credit card required at
 * aistudio.google.com) rather than a paid provider — a deliberate cost
 * choice, not a technical limitation. Talks to Gemini's REST API with a
 * plain fetch() rather than an SDK, matching every other service file in
 * this codebase (agihf/shared/*-service.js) and avoiding a new npm
 * dependency for what's a handful of HTTP calls.
 */

const DEFAULT_MODEL = 'gemini-2.0-flash'; // override via GEMINI_MODEL env var
const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta/models';

export function isAIConfigured() {
  return !!process.env.GEMINI_API_KEY;
}

function currentModel() {
  return process.env.GEMINI_MODEL || DEFAULT_MODEL;
}

/**
 * Translates this app's Anthropic-shaped message content (a plain string,
 * or an array of {type:'text',text} / {type:'image',source:{type:'base64',
 * media_type,data}} blocks — exactly what agent-chat.js's buildUserContent
 * already builds) into Gemini's `parts` shape. This is the one piece of
 * real provider-specific translation in the file, kept here so a future
 * provider swap again only touches this module, not agent-chat.js.
 */
function toGeminiParts(content) {
  if (typeof content === 'string') return [{ text: content }];
  if (Array.isArray(content)) {
    return content.map((block) => {
      if (block.type === 'image') return { inlineData: { mimeType: block.source.media_type, data: block.source.data } };
      return { text: block.text || '' };
    });
  }
  return [{ text: String(content ?? '') }];
}

/** Anthropic's 'assistant' role becomes Gemini's 'model' role — 'user' is the same in both. */
function toGeminiContents(messages) {
  return messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: toGeminiParts(m.content) }));
}

function extractText(candidateResponse) {
  return (candidateResponse?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
}

/** Buffers a fetch() SSE body into parsed `data:` JSON chunks, one per yield. */
async function* readSseChunks(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line.startsWith('data:')) continue;
      const jsonStr = line.slice(5).trim();
      if (!jsonStr) continue;
      try { yield JSON.parse(jsonStr); } catch { /* ignore a malformed chunk rather than breaking the whole stream */ }
    }
  }
}

/**
 * Async generator yielding wire-protocol events. Never throws — every
 * failure path (missing key, network error, provider error) yields a
 * structured event instead, so a caller can always safely `for await`
 * this without a surrounding try/catch that could leak an unhandled
 * rejection mid-stream into the serverless function.
 *
 * Only `text_delta`/`unavailable`/`error` are emitted — agent-chat.js
 * (the only caller) never reads anything else; the old Anthropic
 * tool-use event types are dropped rather than reimplemented, since
 * there is no live tool-calling loop in this single-call-per-turn
 * architecture (see agent-chat.js's own docblock).
 *
 * @param {{systemPrompt: string, messages: Array, maxTokens?: number, signal?: AbortSignal}} opts
 */
export async function* streamChatCompletion({ systemPrompt, messages, maxTokens = 1200, signal }) {
  if (!isAIConfigured()) {
    yield { type: 'unavailable' };
    return;
  }
  try {
    const url = `${API_ROOT}/${currentModel()}:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`;
    const body = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: toGeminiContents(messages),
      generationConfig: { maxOutputTokens: maxTokens },
    };
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal });
    if (!res.ok || !res.body) {
      const errBody = await res.json().catch(() => ({}));
      console.error('Gemini streaming error:', res.status, errBody?.error?.message || errBody);
      yield { type: 'error', message: 'The AGHF Agent ran into a problem generating a response.' };
      return;
    }
    for await (const chunk of readSseChunks(res.body)) {
      const text = extractText(chunk);
      if (text) yield { type: 'text_delta', text };
    }
  } catch (err) {
    if (err?.name === 'AbortError') return; // member clicked Stop Generating — not an error
    console.error('AI provider streaming error:', err);
    yield { type: 'error', message: 'The AGHF Agent ran into a problem generating a response.' };
  }
}

/**
 * Non-streaming helper for short, structured one-shot calls (e.g. a
 * conversation-title generator) that don't need the chat protocol.
 * Returns null instead of throwing when the provider is unavailable.
 */
export async function generateShortCompletion({ systemPrompt, userMessage, maxTokens = 60 }) {
  if (!isAIConfigured()) return null;
  try {
    const url = `${API_ROOT}/${currentModel()}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const body = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: { maxOutputTokens: maxTokens },
    };
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.error('Gemini short-completion error:', res.status, errBody?.error?.message || errBody);
      return null;
    }
    const data = await res.json();
    return extractText(data).trim() || null;
  } catch (err) {
    console.error('AI provider short-completion error:', err);
    return null;
  }
}
