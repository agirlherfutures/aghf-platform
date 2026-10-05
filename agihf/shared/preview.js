/**
 * preview.js — A Girl & Her Futures™
 *
 * TEMPORARY "unlock everything" switch while the Academy is being built.
 * With UNLOCK_ALL on, every built lesson, section checkpoint and step can be
 * opened directly, with no completion gates.
 *
 * ⚠️ Set UNLOCK_ALL to false before members get access, so the normal
 * "pass the previous one to move on" gates come back.
 */

export const UNLOCK_ALL = true;

export function isPreviewAll() {
  return UNLOCK_ALL;
}
