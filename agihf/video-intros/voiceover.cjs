#!/usr/bin/env node
/**
 * Generates the narration for a lesson intro video with a text-to-speech
 * service, timed to the video — A Girl & Her Futures™
 *
 *   node voiceover.cjs p2-lesson-13                 → out/p2-lesson-13-voice.m4a
 *   node voiceover.cjs p2-lesson-13 --mux           → also out/p2-lesson-13-narrated.mp4
 *   node voiceover.cjs p2-lesson-01 p2-lesson-02 …  → several lessons in one go
 *   node voiceover.cjs --phase p2 --mux             → every lessons/p2-lesson-*.js
 *
 * Each spoken line is generated on its own and placed at its `at` time from
 * lessons/<slug>.js, so the audio stays in sync with the video whichever voice
 * service reads it. A line that comes back longer than its slot is sped up
 * (up to MAX_TEMPO) and reported, so you can shorten it or slow the video.
 *
 * Provider (env VOICE_PROVIDER, default narakeet):
 *   narakeet    NARAKEET_VOICE (e.g. "Harmony"), plus NARAKEET_API_KEY unless the
 *               environment's network secret adds the x-api-key header itself
 *   elevenlabs  ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, optional ELEVENLABS_MODEL
 *   fake        no network: a tone the length of the line, to test the timing
 * Optional VOICE_SPEED (e.g. 1.1) asks the service to read faster, which
 * helps when lines are flagged as running into the next one.
 *
 * Generated clips are cached in out/voice/<slug>/, so re-running only pays for
 * lines whose text or voice changed. --mux needs the silent render at
 * out/<slug>.mp4 (node render.cjs <slug>). Needs ffmpeg and Node 18+.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync, spawnSync } = require('child_process');

// Node's built-in fetch ignores HTTPS_PROXY unless NODE_USE_ENV_PROXY is set
// (Node 22.21+), so behind a proxy — such as a cloud environment whose proxy
// injects the API key — re-run this script with it set.
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const r = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: 'inherit',
    env: { ...process.env, NODE_USE_ENV_PROXY: '1', NODE_NO_WARNINGS: '1' },
  });
  process.exit(r.status ?? 1);
}

const MAX_TEMPO = 1.25;  // fastest we'll speed a line up to fit its slot
const GAP = 0.15;        // breathing room kept before the next line starts
const outDir = path.join(__dirname, 'out');

const args = process.argv.slice(2);
const mux = args.includes('--mux');
const phase = args.includes('--phase') ? args[args.indexOf('--phase') + 1] : null;
let slugs = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--phase');
if (phase) {
  slugs = fs.readdirSync(path.join(__dirname, 'lessons'))
    .filter(f => f.startsWith(phase + '-lesson-') && f.endsWith('.js'))
    .map(f => f.slice(0, -3))
    .sort((a, b) => parseInt(a.split('-').pop(), 10) - parseInt(b.split('-').pop(), 10));
}
if (!slugs.length) {
  console.error('Usage: node voiceover.cjs <slug> [<slug> …] [--mux]  |  node voiceover.cjs --phase p2 [--mux]');
  process.exit(1);
}

const provider = (process.env.VOICE_PROVIDER || 'narakeet').toLowerCase();
const PROVIDERS = {
  narakeet: {
    voiceKey: () => need('NARAKEET_VOICE') + '@' + (process.env.VOICE_SPEED || 1),
    async speak(text) {
      const speed = process.env.VOICE_SPEED ? `&voice-speed=${process.env.VOICE_SPEED}` : '';
      const url = `https://api.narakeet.com/text-to-speech/mp3?voice=${encodeURIComponent(need('NARAKEET_VOICE'))}${speed}`;
      return fetchAudio(url, {
        // A cloud environment's network secret can inject this header instead.
        ...(process.env.NARAKEET_API_KEY ? { 'x-api-key': process.env.NARAKEET_API_KEY } : {}),
        'Content-Type': 'text/plain; charset=utf-8',
        Accept: 'application/octet-stream',
      }, text);
    },
  },
  elevenlabs: {
    voiceKey: () => need('ELEVENLABS_VOICE_ID') + '/' + elevenModel() + '@' + (process.env.VOICE_SPEED || 1),
    async speak(text, prev, next) {
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${need('ELEVENLABS_VOICE_ID')}?output_format=mp3_44100_128`;
      return fetchAudio(url, {
        'xi-api-key': need('ELEVENLABS_API_KEY'),
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      }, JSON.stringify({
        text,
        model_id: elevenModel(),
        // Neighbouring lines keep the intonation consistent across separately generated clips.
        previous_text: prev || undefined,
        next_text: next || undefined,
        voice_settings: process.env.VOICE_SPEED ? { speed: Number(process.env.VOICE_SPEED) } : undefined,
      }));
    },
  },
  fake: {
    voiceKey: () => 'fake',
    async speak(text, prev, next, file) {
      const secs = Math.max(0.6, text.split(/\s+/).length / 2.5); // ~150 words a minute
      ffmpeg(['-f', 'lavfi', '-i', `sine=frequency=330:duration=${secs.toFixed(2)}`, '-q:a', '4', file]);
      return null;
    },
  },
};
const P = PROVIDERS[provider];
if (!P) { console.error(`Unknown VOICE_PROVIDER "${provider}". Use narakeet, elevenlabs or fake.`); process.exit(1); }

function elevenModel() { return process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2'; }
function need(name) {
  const v = process.env[name];
  if (!v) { console.error(`Missing ${name}. Set it in the environment (see the top of voiceover.cjs).`); process.exit(1); }
  return v;
}
async function fetchAudio(url, headers, body) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { method: 'POST', headers, body });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    const detail = (await res.text()).slice(0, 300);
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await new Promise(r => setTimeout(r, 2000 * 2 ** (attempt - 1)));
      continue;
    }
    throw new Error(`${provider} returned ${res.status}: ${detail}`);
  }
}
function ffmpeg(a) { execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...a]); }
function seconds(file) {
  return parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=nw=1:nk=1', file]).toString());
}
function loadLesson(slug) {
  const window = {};
  new Function('window', fs.readFileSync(path.join(__dirname, 'lessons', slug + '.js'), 'utf8'))(window);
  const V = window.LESSON_VIDEO;
  const lines = V.scenes.flatMap(s => s.lines || []).sort((a, b) => a.at - b.at);
  return { duration: V.duration, lines };
}

async function voiceLesson(slug) {
  const { duration, lines } = loadLesson(slug);
  const cache = path.join(outDir, 'voice', slug);
  fs.mkdirSync(cache, { recursive: true });
  const warnings = [];
  const placed = [];

  for (let i = 0; i < lines.length; i++) {
    const { at, text } = lines[i];
    const prev = lines[i - 1]?.text, next = lines[i + 1]?.text;
    const hash = crypto.createHash('sha1').update(provider + '|' + P.voiceKey() + '|' + text).digest('hex').slice(0, 12);
    const raw = path.join(cache, `${String(i + 1).padStart(2, '0')}-${hash}.mp3`);
    if (!fs.existsSync(raw)) {
      process.stdout.write(`  ${slug} line ${i + 1}/${lines.length}: generating\n`);
      const audio = await P.speak(text, prev, next, raw);
      if (audio) fs.writeFileSync(raw, audio);
    }

    // Trim the silence services add at either end, so each line starts right on its mark.
    const clean = path.join(cache, `${String(i + 1).padStart(2, '0')}-clean.wav`);
    ffmpeg(['-i', raw, '-af',
      'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse',
      '-ar', '44100', '-ac', '1', clean]);

    const slot = (i + 1 < lines.length ? lines[i + 1].at : duration) - at - GAP;
    const len = seconds(clean);
    let file = clean;
    if (len > slot) {
      // Speed the line up in its own pass: mixing atempo with adelay shifts the timeline.
      const tempo = Math.min(len / slot, MAX_TEMPO);
      file = path.join(cache, `${String(i + 1).padStart(2, '0')}-fit.wav`);
      ffmpeg(['-i', clean, '-af', `atempo=${tempo.toFixed(3)}`, file]);
      const over = len / tempo - slot;
      warnings.push(`line ${i + 1} at ${at}s is ${len.toFixed(1)}s for a ${slot.toFixed(1)}s slot: ` +
        (over > 0.05
          ? `runs ${over.toFixed(1)}s into the next line even at ${MAX_TEMPO}x. Try a faster VOICE_SPEED.`
          : `sped up ${tempo.toFixed(2)}x to fit.`) +
        `\n      "${text}"`);
    }
    placed.push({ file, at });
  }

  // Lay every line at its start time on a silent bed exactly as long as the video.
  const inputs = placed.flatMap(p => ['-i', p.file]);
  const chains = placed.map((p, i) => {
    const ms = Math.round(p.at * 1000);
    return `[${i}:a]adelay=${ms}|${ms}[a${i}]`;
  });
  const mix = placed.map((_, i) => `[a${i}]`).join('') +
    `amix=inputs=${placed.length}:normalize=0,apad=whole_dur=${duration},atrim=end=${duration}[out]`;
  const voice = path.join(outDir, `${slug}-voice.m4a`);
  ffmpeg([...inputs, '-filter_complex', [...chains, mix].join(';'), '-map', '[out]',
    '-c:a', 'aac', '-b:a', '160k', voice]);
  console.log(`✓ ${voice} (${seconds(voice).toFixed(2)}s, video is ${duration}s)`);

  if (mux) {
    const video = path.join(outDir, `${slug}.mp4`);
    if (!fs.existsSync(video)) {
      warnings.push(`no ${path.relative(__dirname, video)} to add the voice to. Run: node render.cjs ${slug}`);
    } else {
      const narrated = path.join(outDir, `${slug}-narrated.mp4`);
      ffmpeg(['-i', video, '-i', voice, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'copy',
        '-shortest', '-movflags', '+faststart', narrated]);
      console.log(`✓ ${narrated}`);
    }
  }
  warnings.forEach(w => console.log(`  ⚠ ${w}`));
  return warnings.length;
}

(async () => {
  let flagged = 0;
  for (const slug of slugs) flagged += await voiceLesson(slug);
  if (flagged) console.log(`\n${flagged} line(s) need a look (see ⚠ above).`);
})().catch(e => { console.error(e.message || e); process.exit(1); });
