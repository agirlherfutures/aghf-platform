/* p7-v2.js — A Girl & Her Futures™
 * Phase 7 screens in the Phase 1 look: a short headline on the left, one
 * visual on the right.
 *
 *   { type: 'v2_moment', kicker, headline, line, chart, thoughts, check?, cta }
 *       The chart plays (Phase 7 exec bars), her thoughts pop over it, then
 *       either a tap question or a Next button.
 *       Check options may carry `track` (mind counters); lesson-v2's check records them.
 *   { type: 'v2_steps', kicker, headline, line, steps: [{ label, sub }], cta }
 *       Numbered steps; tap each to light it up.
 */
import { shell, nextBtn, check } from './lesson-v2.js';
import { chartBlock } from './mind.js';
import { mindOn } from './mind-ui.js';

export function renderV2Moment(el, slide, satisfy, helpers) {
  const { act, right } = shell(el, slide, '<div class="p7v2-chart"></div>', slide.check ? '<div class="v2-check-slot"></div>' : '', { cls: 'p7v2-moment' });
  const box = chartBlock(right.querySelector('.p7v2-chart'), slide.chart);
  const after = () => {
    if (slide.thoughts?.length && box) mindOn(box, slide.thoughts, { gap: 0.8 });
    const wait = slide.thoughts ? 800 * slide.thoughts.length + 300 : 0;
    setTimeout(() => {
      if (slide.check) check(el.querySelector('.v2-check-slot'), slide.check, helpers, () => nextBtn(act, satisfy, slide.cta || 'Next →'));
      else nextBtn(act, satisfy, slide.cta || 'Next →');
    }, wait);
  };
  (box?.played || Promise.resolve()).then(after);
}

export function renderV2Steps(el, slide, satisfy) {
  const steps = slide.steps.map((s, i) => `
    <button type="button" class="p7v2-step" data-i="${i}">
      <span class="p7v2-step-n">${i + 1}</span>
      <span class="p7v2-step-txt"><b>${s.label}</b><span>${s.sub || ''}</span></span>
    </button>`).join('');
  const { act, right } = shell(el, slide, `<div class="p7v2-steps">${steps}</div>`);
  const lit = new Set();
  right.querySelectorAll('.p7v2-step').forEach((b, i) => b.addEventListener('click', () => {
    b.classList.add('is-on');
    lit.add(i);
    if (lit.size === slide.steps.length) nextBtn(act, satisfy, slide.cta || 'Next →');
  }));
}

export const P7_V2_RENDERERS = { v2_moment: renderV2Moment, v2_steps: renderV2Steps };
