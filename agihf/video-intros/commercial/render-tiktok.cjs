#!/usr/bin/env node
/**
 * Renders the 48s vertical TikTok commercial to MP4: A Girl & Her Futures™
 *
 *   node commercial/render-tiktok.cjs                    → out/aghf-tiktok-48s.mp4 (1080x1920, 30 fps, silent)
 *   node commercial/render-tiktok.cjs --stills 3.5,20    → out/tiktok-3.5s.png, … (quick look at single frames)
 *   node commercial/render-tiktok.cjs --stills 5 --guides → same, with the TikTok safe zone overlaid
 *
 * Steps commercial/tiktok.html frame by frame with window.render(t) and pipes the
 * screenshots into ffmpeg, so timing is exact no matter how slow the machine is.
 * Needs Playwright (Chromium) and ffmpeg.
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const guides = args.includes('--guides');
const stillsArg = args.includes('--stills') ? args[args.indexOf('--stills') + 1] : null;
const fps = 30;
const outDir = path.join(__dirname, '..', 'out');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const url = 'file://' + path.join(__dirname, 'tiktok.html') + `?render=1${guides ? '&guides=1' : ''}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.getElementById('logo').decode());
  const duration = await page.evaluate(() => window.VIDEO_DURATION);

  if (stillsArg) {
    for (const t of stillsArg.split(',').map(Number)) {
      await page.evaluate(x => window.render(x), t);
      const file = path.join(outDir, `tiktok${guides ? '-guides' : ''}-${t}s.png`);
      await page.screenshot({ path: file });
      console.log(file);
    }
    if (errors.length) console.log('ERRORS:\n' + errors.join('\n'));
    await browser.close();
    return;
  }

  const outFile = path.join(outDir, 'aghf-tiktok-48s.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps),
    '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium',
    '-r', String(fps), '-movflags', '+faststart', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });

  const frames = Math.round(duration * fps);
  for (let i = 0; i < frames; i++) {
    await page.evaluate(x => window.render(x), i / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % (fps * 6) === 0) console.log(`frame ${i}/${frames}`);
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg exited ' + c)))));
  if (errors.length) console.log('ERRORS:\n' + errors.join('\n'));
  await browser.close();
  console.log(outFile);
})().catch(e => { console.error(e); process.exit(1); });
