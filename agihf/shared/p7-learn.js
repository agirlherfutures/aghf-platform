/* p7-learn.js — A Girl & Her Futures™
 * Phase 7's "Learn with Dayli" step. Dayli's 15 psychology videos are the
 * teaching; the 31 interactive lessons are where students apply it. Each
 * video has one home lesson. A few other lessons recap a video from its
 * home, and the rest are hands-on, with the scenario as the lesson.
 *
 * Once a video is recorded, paste its link (YouTube, Vimeo or a direct
 * .mp4) into `url` in PSYCH_VIDEOS below. Every lesson that uses that
 * video picks it up.
 */
import { videoPlayerHtml, wireVideoPlayer } from './loop-engine.js';
import { VIDEO_BASE } from './lesson-videos.js';

// Videos uploaded to the lesson-videos bucket (<slug>.mp4). A video's own `url` below always wins.
const HOSTED = new Set(['p7-lesson-1', ...Array.from({ length: 15 }, (_, i) => i + 1).map((n) => `p7-psych-${n}`)]);
const hosted = (slug) => (HOSTED.has(slug) ? `${VIDEO_BASE}${slug}.mp4` : null);

export const PSYCH_VIDEOS = {
  1: { title: 'Why Trading Psychology Matters', tagline: 'Why am I doing things I know I shouldn’t do?', rule: 'My emotions are information, not instructions.', url: null },
  2: { title: 'FOMO', tagline: '“I Missed the Trade”', rule: 'If my entry is gone, the trade is gone.', url: null },
  3: { title: 'Revenge Trading', tagline: '“I Need My Money Back”', rule: 'After a full stop loss, I reset before I re-enter.', url: null },
  4: { title: 'Overtrading', tagline: '“Why Am I Still Trading?”', rule: 'I decide my stopping conditions before the session starts.', url: null },
  5: { title: 'Fear of Losing', tagline: '“What If This One Loses Too?”', rule: 'The previous trade doesn’t get a vote.', url: null },
  6: { title: 'Fear of Giving Back Profit', tagline: '“I’m Green… I Don’t Want to Lose It”', rule: 'I manage the trade based on my plan, not my P&L.', url: null },
  7: { title: 'Greed', tagline: '“Why Wasn’t Enough… Enough?”', rule: 'I don’t move the finish line because I’m winning.', url: null },
  8: { title: 'Winning Can Mess With You Too', tagline: '“I Can’t Miss Right Now”', rule: 'Winning does not change my rules.', url: null },
  9: { title: 'Following Your Plan When It Doesn’t Work', tagline: '“But I Did Everything Right”', rule: 'I review my execution before I judge the outcome.', url: null },
  10: { title: 'Separating Outcome From Execution', tagline: '“Good Trade ≠ Winning Trade”', rule: 'I grade the process before I grade the P&L.', url: null },
  11: { title: 'Your Relationship With Money', tagline: '“I Need This Trade to Pay Me”', rule: 'I don’t make the market responsible for my financial obligations.', url: null },
  12: { title: 'Blowing an Account / Breaking Your Rules', tagline: '“Okay… Now What?”', rule: 'I don’t restart until I understand what broke.', url: null },
  13: { title: 'Building Confidence Through Data', tagline: '“Do I Actually Trust My Setup?”', rule: 'I build confidence through evidence, not emotion.', url: null },
  14: { title: 'Your Trading Routine', tagline: '“What Happens Before, During & After I Trade?”', rule: 'I follow a process before, during, and after every trading session.', url: null },
  15: { title: 'Build Your Trading Rules', tagline: '“What Kind of Trader Am I Going to Be?”', rule: 'I don’t rely on how I feel to decide how I trade. I rely on the rules I created when I was thinking clearly.', url: null },
};

for (const [n, v] of Object.entries(PSYCH_VIDEOS)) v.url = v.url || hosted(`p7-psych-${n}`);

// A lesson's own video, shown first with the lesson's psychology video beside it.
export const P7_LESSON_VIDEOS = {
  1: { title: 'The Moment Between', url: hosted('p7-lesson-1') },
};

// Phase 7 is one journey in three parts.
export const P7_PARTS = {
  s18: { n: 1, name: 'Understand Yourself', line: 'Recognize what’s happening inside you before you make a decision.' },
  s19: { n: 2, name: 'Protect Yourself', line: 'Turn self-awareness into rules that protect you from emotional decisions.' },
  s20: { n: 3, name: 'Trust Your Judgment', line: 'Learn when your setup deserves participation, and when doing nothing is the better decision.' },
};

const HANDS_ON_S19 = 'Feel the pull. Check your rules. Decide.';
const HANDS_ON_S20 = 'You know the model. Does today’s market deserve it?';

// What each lesson's first step teaches.
//   video   — this lesson is the video's home (`also` adds a supporting video)
//   recap   — the rule from a video whose home is an earlier lesson
//   preview — a taste of a video whose home is a later lesson
//   handsOn — no video; the scenario does the teaching
export const P7_LEARN = {
  1: { mode: 'video', video: 1 },
  2: { mode: 'video', video: 7 },
  3: { mode: 'video', video: 8 },
  4: { mode: 'video', video: 3 },
  5: { mode: 'video', video: 9 },
  6: { mode: 'video', video: 2 },
  7: { mode: 'video', video: 5 },
  8: { mode: 'video', video: 6 },
  9: { mode: 'video', video: 4 },
  10: { mode: 'handsOn', note: 'Waiting is a skill. Sit in it.' },
  11: { mode: 'video', video: 11 },
  12: { mode: 'video', video: 10 },
  13: { mode: 'video', video: 14, also: 13 },
  14: { mode: 'preview', video: 15, home: 22, note: 'Write your rules while you’re calm.' },
  15: { mode: 'handsOn', note: HANDS_ON_S19 },
  16: { mode: 'recap', video: 9, home: 5 },
  17: { mode: 'recap', video: 2, home: 6 },
  18: { mode: 'recap', video: 4, home: 9 },
  19: { mode: 'handsOn', note: HANDS_ON_S19 },
  20: { mode: 'handsOn', note: HANDS_ON_S19 },
  21: { mode: 'video', video: 12 },
  22: { mode: 'video', video: 15 },
  23: { mode: 'handsOn', note: HANDS_ON_S20 },
  24: { mode: 'handsOn', note: HANDS_ON_S20 },
  25: { mode: 'handsOn', note: HANDS_ON_S20 },
  26: { mode: 'handsOn', note: HANDS_ON_S20 },
  27: { mode: 'handsOn', note: HANDS_ON_S20 },
  28: { mode: 'handsOn', note: HANDS_ON_S20 },
  29: { mode: 'recap', video: 14, home: 13 },
  30: { mode: 'handsOn', note: HANDS_ON_S20 },
  31: { mode: 'handsOn', finale: true, note: 'Your state. Your rules. Your read. No trade can be the right answer.' },
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const lessonHref = (n) => `lesson.html?phase=p7&n=${n}`;

/** The rule a Phase 7 lesson leaves the student with, or null. */
export function p7Rule(lessonNumber) {
  const learn = P7_LEARN[lessonNumber];
  if (!learn) return null;
  if (learn.finale) return { from: 'Where we started · Video 1', text: PSYCH_VIDEOS[1].rule };
  if (!learn.video) return null;
  return { from: `Video ${learn.video} · ${PSYCH_VIDEOS[learn.video].title}`, text: PSYCH_VIDEOS[learn.video].rule };
}

/** Card shown on the lesson's reflection slide: Dayli's rule, before the student writes their own. */
export function p7RuleCardHtml(lessonNumber) {
  const rule = p7Rule(lessonNumber);
  if (!rule) return '';
  return `<div class="p7-rule-card"><div class="p7-rule-label">Your rule</div><div class="p7-rule-text">“${esc(rule.text)}”</div><div class="p7-rule-from">${esc(rule.from)}</div></div>`;
}

function videoCardHtml(n, id, { supporting = false } = {}) {
  const v = PSYCH_VIDEOS[n];
  const num = String(n).padStart(2, '0');
  if (v.url) {
    return `
      <div class="p7-video${supporting ? ' is-supporting' : ''}">
        <div class="lw-video-block p7-video-frame">${videoPlayerHtml(v.url).replace('id="dlVideo"', `id="${id}"`)}</div>
        <div class="p7-video-cap"><span class="p7-chip">Video ${n}</span> ${esc(v.title)}</div>
      </div>`;
  }
  return `
    <div class="p7-video p7-poster${supporting ? ' is-supporting' : ''}">
      <div class="p7-poster-num">${num}</div>
      <div class="p7-poster-top"><span class="p7-chip">${supporting ? '+ ' : ''}Video ${n}</span><span class="p7-chip is-soon">Coming soon</span></div>
      <div class="p7-poster-play">▶</div>
      <div class="p7-poster-title"><b>${esc(v.title)}</b><i>${esc(v.tagline)}</i></div>
    </div>`;
}

/** Renders Phase 7's first step in place of the generic Watch step. */
export function renderP7Learn(slide, data, satisfy) {
  const lp = data.launchpad || {};
  const part = P7_PARTS[data.section];
  const learn = P7_LEARN[data.lessonNumber] || { mode: 'handsOn', note: HANDS_ON_S20 };

  let body = '';
  let cta = 'Continue';
  const lead = learn.mode === 'video' && P7_LESSON_VIDEOS[data.lessonNumber]?.url ? P7_LESSON_VIDEOS[data.lessonNumber] : null;
  if (lead) {
    body = `<div class="p7-videos is-pair">
      <div class="p7-video">
        <div class="lw-video-block p7-video-frame">${videoPlayerHtml(lead.url).replace('id="dlVideo"', 'id="p7Lead"')}</div>
        <div class="p7-video-cap"><span class="p7-chip">Lesson ${data.lessonNumber}</span> ${esc(lead.title)}</div>
      </div>${videoCardHtml(learn.video, 'p7Video', { supporting: true })}</div>`;
    cta = '✓ Watched, Continue';
  } else if (learn.mode === 'video') {
    body = `<div class="p7-videos${learn.also ? ' is-pair' : ''}">${videoCardHtml(learn.video, 'p7Video')}${learn.also ? videoCardHtml(learn.also, 'p7VideoAlso', { supporting: true }) : ''}</div>`;
    if (PSYCH_VIDEOS[learn.video].url) cta = '✓ Watched, Continue';
  } else if (learn.mode === 'recap') {
    const v = PSYCH_VIDEOS[learn.video];
    body = `
      <div class="p7-quote">
        <span class="p7-chip">↺ Remember · Video ${learn.video} · ${esc(v.title)}</span>
        <div class="p7-quote-text">“${esc(v.rule)}”</div>
        <a class="p7-quote-link" href="${lessonHref(learn.home)}">▶ Rewatch · Lesson ${learn.home}</a>
      </div>`;
  } else if (learn.mode === 'preview') {
    body = `
      <div class="p7-quote">
        <span class="p7-chip">Coming up · Video ${learn.video} · Lesson ${learn.home}</span>
        <div class="p7-quote-text">${esc(learn.note)}</div>
      </div>`;
  } else {
    body = `
      <div class="p7-handson${learn.finale ? ' is-finale' : ''}">
        <div class="p7-handson-icon">${learn.finale ? '🏁' : '🎯'}</div>
        <div><span class="p7-chip">${learn.finale ? 'Final challenge' : 'Hands-on'}</span><div class="p7-handson-text">${esc(learn.note)}</div></div>
      </div>`;
  }

  slide.innerHTML = `
    <div class="dl-launchpad">
      <div class="lw-eyebrow">${part ? `Part ${part.n} · ${esc(part.name)}` : 'Lesson Launchpad'}</div>
      <h2>${data.title}</h2>
      <div class="dl-launchpad-meta">
        ${lp.estMinutes ? `<span class="lw-pill dur">~${lp.estMinutes} min</span>` : ''}
        <span class="lw-pill gp">+${data.xpValue} GP</span>
      </div>
      ${lp.missionQuestion ? `<div class="dl-mission-q"><div class="dl-mission-q-label">Your mission question</div><div class="dl-mission-q-text">${lp.missionQuestion}</div></div>` : ''}
    </div>
    <div class="p7-learn">
      <div class="p7-step-label">✦ Learn with Dayli</div>
      ${body}
    </div>
    <button type="button" class="lw-continue-btn lw-watched-btn" id="lwWatchedBtn">${cta}</button>
  `;
  slide.querySelector('#lwWatchedBtn').addEventListener('click', satisfy);
  if (lead) wireVideoPlayer(slide, lead.url, [], 'p7Lead');
  for (const [id, n] of [['p7Video', learn.video], ['p7VideoAlso', lead ? null : learn.also]]) {
    const url = n && PSYCH_VIDEOS[n].url;
    if (url && learn.mode === 'video') wireVideoPlayer(slide, url, [], id);
  }
}
