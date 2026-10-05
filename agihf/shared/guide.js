/**
 * guide.js — A Girl & Her Futures™
 *
 * Aristella guides every chart lesson: the step caption under a chart
 * becomes her speech bubble, with her portrait beside it. The caption
 * element itself stays the same, so every slide type keeps working.
 */

import { mountHost } from './lesson-v2.js';

export function wrapGuide(cap, name = 'Aristella') {
  if (!cap || cap.closest('.ag-guide')) return;
  const g = document.createElement('div');
  g.className = 'ag-guide';
  g.innerHTML = `<div class="ag-face" aria-hidden="true"></div><div class="ag-bubble"><div class="ag-name">${name}</div></div>`;
  cap.parentNode.insertBefore(g, cap);
  g.querySelector('.ag-bubble').appendChild(cap);
  mountHost(g.querySelector('.ag-face'), 'idle', '30 20 340 340');
}
