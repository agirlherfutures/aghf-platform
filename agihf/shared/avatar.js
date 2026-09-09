/**
 * avatar.js — A Girl & Her Futures™
 *
 * Deterministic initial-letter avatar — no photo asset required, gives
 * every card/review/leaderboard row the same warm "real person" visual
 * language. Promoted out of wins-engine.js (where it started as a private
 * helper) the moment a second feature (the AGHF Monthly Challenge) needed
 * the identical thing — the same extraction call already made this
 * session for resolveDisplayName -> display-name.js.
 *
 * Emits the same `win-avatar`/`win-avatar-{color}` classes wins.css
 * already styles, so this is a pure relocation with zero visible change
 * to Share My Win, and any page using this also needs the matching CSS
 * (see wins.css's `.win-avatar*` rules, mirrored in challenge.css).
 */

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export const AVATAR_PALETTE = ['pink', 'peach', 'teal', 'purple'];

export function renderAvatar(name) {
  const clean = String(name ?? '').trim();
  const letter = clean ? clean[0].toUpperCase() : '✦';
  let hash = 0;
  for (let i = 0; i < clean.length; i += 1) hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
  const color = AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
  return `<span class="win-avatar win-avatar-${color}" aria-hidden="true">${escapeHtml(letter)}</span>`;
}
