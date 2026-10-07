/**
 * mind-ui.js — A Girl & Her Futures™
 *
 * The Phase 7 INTERNAL STATE layer, small enough to sit on top of any chart
 * (trigger_sim, manage_sim, Phase 7 scenes) without import cycles:
 *
 *   mindOn(card, thought)   the chart mutes and large thought bubbles appear over it
 *                           (string, or an array that appears line by line)
 *   mindOff(card)           the chart comes back into focus
 *   pauseButton(host, p)    ⏸ PAUSE: a decision interrupt, not a motivational quote.
 *                           MARKET · PLAN · MIND · ACTION
 */

export const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function chartHost(card) {
  return card.querySelector('.ex-chart, .p7-chart, .sc-wrap');
}

export function mindOn(card, thought, opts = {}) {
  const host = chartHost(card);
  if (!host) return null;
  mindOff(card);
  const wrap = host.parentElement;
  wrap.classList.add('p7-has-mind');
  host.classList.add('p7-muted');
  const box = document.createElement('div');
  box.className = `p7-thoughts${opts.side === 'left' ? ' is-left' : ''}`;
  box.setAttribute('aria-live', 'polite');
  const lines = Array.isArray(thought) ? thought : [thought];
  lines.forEach((t, i) => {
    const b = document.createElement('div');
    b.className = 'p7-bubble';
    b.style.setProperty('--d', `${reduced() ? 0 : i * (opts.gap || 0.9)}s`);
    b.innerHTML = `<span>${t}</span>`;
    box.appendChild(b);
  });
  wrap.appendChild(box);
  return box;
}

export function mindOff(card) {
  card.querySelectorAll('.p7-thoughts').forEach((b) => b.remove());
  card.querySelectorAll('.p7-muted').forEach((h) => h.classList.remove('p7-muted'));
}

/** p = { market, plan, mind, action } (strings). */
export function pauseHtml(p) {
  const q = [
    ['MARKET', 'What objectively changed?', p.market],
    ['PLAN', 'What does my rule require?', p.plan],
    ['MIND', 'What am I feeling?', p.mind],
    ['ACTION', 'Does anything actually need to change?', p.action],
  ];
  return `<div class="p7-pause-grid">${q.map(([k, ask, a], i) => `<div class="p7-pq p7-pq-${k.toLowerCase()}" style="--d:${reduced() ? 0 : 0.15 + i * 0.5}s"><b>${k}</b><small>${ask}</small><p>${a || ''}</p></div>`).join('')}</div>`;
}

export function pauseButton(host, p, { label = '⏸ PAUSE', open = false } = {}) {
  if (!p || !host) return null;
  const wrap = document.createElement('div');
  wrap.className = 'p7-pause';
  wrap.innerHTML = `<button type="button" class="p7-pause-btn">${label}</button><div class="p7-pause-panel" hidden></div>`;
  host.appendChild(wrap);
  const btn = wrap.querySelector('.p7-pause-btn');
  const panel = wrap.querySelector('.p7-pause-panel');
  const show = () => { panel.hidden = false; panel.innerHTML = pauseHtml(p); btn.classList.add('is-on'); btn.textContent = '⏸ PAUSED'; };
  btn.addEventListener('click', () => { if (panel.hidden) show(); else { panel.hidden = true; btn.classList.remove('is-on'); btn.textContent = label; } });
  if (open) show();
  return wrap;
}
