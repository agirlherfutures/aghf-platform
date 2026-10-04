#!/usr/bin/env node
/**
 * Renders a lesson intro video to MP4 — A Girl & Her Futures™
 *
 *   node render.cjs lesson-01                 → out/lesson-01.mp4 (clean, for narrating over)
 *   node render.cjs lesson-01 --captions      → out/lesson-01-captions.mp4 (script on screen, a read-along guide)
 *   node render.cjs lesson-01 --stills 5,20   → out/lesson-01-5s.png, … (quick look at single frames)
 *
 * Steps player.html frame by frame with window.render(t) and pipes the
 * screenshots into ffmpeg, so timing is exact no matter how slow the machine is.
 * Needs Playwright (Chromium) and ffmpeg.
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const slug = args.find(a => !a.startsWith('--')) || 'lesson-01';
const captions = args.includes('--captions');
const stillsArg = args.includes('--stills') ? args[args.indexOf('--stills') + 1] : null;
const fps = 30;
const outDir = path.join(__dirname, 'out');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const url = 'file://' + path.join(__dirname, 'player.html') +
    `?lesson=${slug}&render=1${captions ? '&captions=1' : ''}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const duration = await page.evaluate(() => window.VIDEO_DURATION);

  if (stillsArg) {
    for (const t of stillsArg.split(',').map(Number)) {
      await page.evaluate(x => window.render(x), t);
      const file = path.join(outDir, `${slug}${captions ? '-captions' : ''}-${t}s.png`);
      await page.screenshot({ path: file });
      console.log(file);
    }
    await browser.close();
    return;
  }

  const outFile = path.join(outDir, `${slug}${captions ? '-captions' : ''}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps),
    '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium',
    '-movflags', '+faststart', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });

  const frames = Math.round(duration * fps);
  for (let i = 0; i < frames; i++) {
    await page.evaluate(x => window.render(x), i / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % (fps * 10) === 0) console.log(`frame ${i}/${frames}`);
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg exited ' + c)))));
  await browser.close();
  console.log(outFile);
})().catch(e => { console.error(e); process.exit(1); });
