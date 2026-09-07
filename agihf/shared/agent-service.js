/**
 * agent-service.js — A Girl & Her Futures™
 *
 * Client for the AGHF Agent (agihf/api/agent-*.js). Same demo-mode
 * fallback shape as psychology-service.js/checklist-service.js: in
 * AGHF_DEMO mode every call resolves against an in-memory store with zero
 * network access — including a scripted, word-by-word "streamed" reply so
 * the workspace is fully clickable in a preview session.
 */

async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (window.AGHF_SESSION_TOKEN) headers.Authorization = `Bearer ${window.AGHF_SESSION_TOKEN}`;
  const res = await fetch(path, { ...opts, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error || `Request failed (${res.status})`), { setupRequired: body.setupRequired });
  return body;
}

/* ── Demo-mode in-memory store ────────────────────────────────────── */

const demoConversations = [];
const demoMessages = new Map(); // conversationId -> AgentMessage[]
const demoMemory = [];
let demoActionSeq = 0;

const DEMO_REPLY = 'Before I answer, I want to separate two possibilities: are you looking for another setup because it genuinely fits your plan — or because ending the session at a loss feels unfinished?\n\nThat distinction matters more than it might seem. One is a new decision; the other is trying to repair how the day feels.\n\nThis is a demo conversation — connect a real AGHF Agent session to get a response grounded in your own trades, checklists, and journal.';

function demoStreamReply(onEvent) {
  const words = DEMO_REPLY.split(' ');
  let i = 0;
  return new Promise((resolve) => {
    onEvent({ type: 'message_start', conversationId: 'demo' });
    const timer = setInterval(() => {
      if (i >= words.length) {
        clearInterval(timer);
        onEvent({ type: 'done', conversationId: 'demo', stopReason: 'end_turn' });
        resolve();
        return;
      }
      onEvent({ type: 'text_delta', text: (i === 0 ? '' : ' ') + words[i] });
      i += 1;
    }, 28);
  });
}

/* ── Streaming chat ───────────────────────────────────────────────── */

/**
 * @param {{conversationId: string|null, savePreference: 'save'|'one_time', responseMode: string, message: string, attachments: Array, clientHistory?: Array}} payload
 * @param {(event: object) => void} onEvent
 * @param {{signal?: AbortSignal}} [opts]
 */
export async function streamChat(payload, onEvent, opts = {}) {
  if (window.AGHF_DEMO) {
    if (!demoMessages.has('demo')) demoMessages.set('demo', []);
    await demoStreamReply(onEvent);
    return;
  }
  const res = await fetch('/api/agent-chat', {
    method: 'POST', signal: opts.signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${window.AGHF_SESSION_TOKEN}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => ({}));
    onEvent({ type: 'error', message: body.error || `Request failed (${res.status})` });
    onEvent({ type: 'done', stopReason: 'error' });
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.trim()) {
        try { onEvent(JSON.parse(line)); } catch { /* ignore a malformed line rather than breaking the whole stream */ }
      }
    }
  }
}

/* ── Conversations ────────────────────────────────────────────────── */

export async function listConversations() {
  if (window.AGHF_DEMO) return demoConversations.slice().reverse();
  const { conversations } = await apiFetch('/api/agent-conversations');
  return conversations || [];
}

export async function renameConversation(id, title) {
  if (window.AGHF_DEMO) {
    const c = demoConversations.find((x) => x.id === id);
    if (c) c.title = title;
    return c;
  }
  const { conversation } = await apiFetch(`/api/agent-conversations?id=${id}`, { method: 'PATCH', body: JSON.stringify({ title }) });
  return conversation;
}

export async function deleteConversation(id) {
  if (window.AGHF_DEMO) {
    const idx = demoConversations.findIndex((c) => c.id === id);
    if (idx >= 0) demoConversations.splice(idx, 1);
    demoMessages.delete(id);
    return;
  }
  await apiFetch(`/api/agent-conversations?id=${id}`, { method: 'DELETE' });
}

export async function listMessages(conversationId) {
  if (window.AGHF_DEMO) return demoMessages.get(conversationId) || [];
  const { messages } = await apiFetch(`/api/agent-messages?conversationId=${conversationId}`);
  return messages || [];
}

export async function setMessageFeedback(id, feedback) {
  if (window.AGHF_DEMO) return;
  await apiFetch(`/api/agent-messages?id=${id}`, { method: 'PATCH', body: JSON.stringify({ feedback }) });
}

/* ── Attachments ──────────────────────────────────────────────────── */

export async function uploadScreenshot(dataUrl, filename, conversationId) {
  if (window.AGHF_DEMO) return { attachmentId: `demo_${Date.now()}`, path: 'demo/path', uploadedAt: new Date().toISOString() };
  return apiFetch('/api/agent-attachment', { method: 'POST', body: JSON.stringify({ dataUrl, filename, conversationId }) });
}

export async function getScreenshotUrl(path) {
  if (window.AGHF_DEMO) return null;
  const { url } = await apiFetch(`/api/agent-attachment?path=${encodeURIComponent(path)}`);
  return url;
}

/* ── Memory ───────────────────────────────────────────────────────── */

export async function listMemory({ includeInactive } = {}) {
  if (window.AGHF_DEMO) return demoMemory.slice();
  const { memories } = await apiFetch(`/api/agent-memory${includeInactive ? '?includeInactive=true' : ''}`);
  return memories || [];
}

export async function saveMemory(memory) {
  if (window.AGHF_DEMO) {
    const idx = memory.id ? demoMemory.findIndex((m) => m.id === memory.id) : -1;
    // Merge onto the existing row (a narrow edit/active-toggle call only
    // sends the field it's changing) rather than replacing it outright.
    const saved = idx >= 0 ? { ...demoMemory[idx], ...memory } : { id: `demo_${Date.now()}`, active: true, memberApproved: true, ...memory };
    if (idx >= 0) demoMemory[idx] = saved; else demoMemory.push(saved);
    return saved;
  }
  const { memory: saved } = await apiFetch('/api/agent-memory', { method: 'POST', body: JSON.stringify(memory) });
  return saved;
}

/** "Save an insight" message action — a plain agent_memory row, its own category so the sidebar/memory panel can group it separately from "what the agent remembers about me." */
export async function saveInsight(content, conversationId) {
  return saveMemory({ category: 'saved_insight', content, sourceConversationId: conversationId || null });
}

export async function deleteMemory(id) {
  if (window.AGHF_DEMO) {
    const idx = demoMemory.findIndex((m) => m.id === id);
    if (idx >= 0) demoMemory.splice(idx, 1);
    return;
  }
  await apiFetch(`/api/agent-memory?id=${id}`, { method: 'DELETE' });
}

export async function clearAllMemory() {
  if (window.AGHF_DEMO) { demoMemory.length = 0; return; }
  await apiFetch('/api/agent-memory?all=true', { method: 'DELETE' });
}

/* ── Actions (write-tool preview/approve) ─────────────────────────── */

export async function listActions(conversationId) {
  if (window.AGHF_DEMO) return [];
  const { actions } = await apiFetch(`/api/agent-actions?conversationId=${conversationId}`);
  return actions || [];
}

export async function decideAction(id, approve) {
  if (window.AGHF_DEMO) return { id, approvalStatus: approve ? 'executed' : 'declined' };
  const { action } = await apiFetch(`/api/agent-actions?id=${id}`, { method: 'PATCH', body: JSON.stringify({ approve }) });
  return action;
}
