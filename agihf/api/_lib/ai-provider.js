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
 * process.env.ANTHROPIC_API_KEY. Never import this from agihf/shared/ or
 * any file the browser loads.
 */

import Anthropic from '@anthropic-ai/sdk';

const DEFAULT_MODEL = 'claude-sonnet-5'; // override via ANTHROPIC_MODEL env var, e.g. to 'claude-haiku-4-5' for lower cost

export function isAIConfigured() {
  return !!process.env.ANTHROPIC_API_KEY;
}

// Constructed lazily, only when actually invoked and the key is present —
// never at module load time, so importing this file never throws even
// when the key is absent (the "not configured" state is a normal,
// expected runtime condition, not an error).
function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

/**
 * Maps one Anthropic streaming SDK event to this app's small wire
 * protocol (see agihf/api/agent-chat.js). Keeping this mapping in one
 * place means the rest of the codebase never touches Anthropic's raw
 * event shape directly — swapping providers later only touches this file.
 */
function mapAnthropicEvent(event) {
  if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
    return { type: 'text_delta', text: event.delta.text };
  }
  if (event.type === 'content_block_start' && event.content_block?.type === 'tool_use') {
    return { type: 'tool_use_start', toolCallId: event.content_block.id, toolName: event.content_block.name };
  }
  if (event.type === 'content_block_delta' && event.delta?.type === 'input_json_delta') {
    return { type: 'tool_use_delta', partialJson: event.delta.partial_json };
  }
  if (event.type === 'message_delta' && event.delta?.stop_reason) {
    return { type: 'message_delta', stopReason: event.delta.stop_reason };
  }
  return { type: 'noop' };
}

/**
 * Async generator yielding wire-protocol events. Never throws — every
 * failure path (missing key, network error, provider error) yields a
 * structured event instead, so a caller can always safely `for await`
 * this without a surrounding try/catch that could leak an unhandled
 * rejection mid-stream into the serverless function.
 *
 * @param {{systemPrompt: string, messages: Array, tools?: Array, maxTokens?: number, signal?: AbortSignal}} opts
 */
export async function* streamChatCompletion({ systemPrompt, messages, tools, maxTokens = 1200, signal }) {
  if (!isAIConfigured()) {
    yield { type: 'unavailable' };
    return;
  }
  try {
    const client = getClient();
    const stream = client.messages.stream(
      {
        model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        system: systemPrompt,
        messages,
        max_tokens: maxTokens,
        ...(tools && tools.length ? { tools } : {}),
      },
      { signal }
    );
    for await (const event of stream) {
      const mapped = mapAnthropicEvent(event);
      if (mapped.type !== 'noop') yield mapped;
    }
    const finalMessage = await stream.finalMessage();
    yield { type: 'final_message', message: finalMessage };
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
    const client = getClient();
    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
      system: systemPrompt,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: userMessage }],
    });
    return message.content.find((b) => b.type === 'text')?.text?.trim() || null;
  } catch (err) {
    console.error('AI provider short-completion error:', err);
    return null;
  }
}
