#!/usr/bin/env node
/**
 * Renders "Save Your Seat", the 45s vertical WAITLIST teaser for
 * A Girl & Her Futures Academy™, to MP4.
 *
 *   node commercial/render-waitlist.cjs                     → out/aghf-waitlist-45s.mp4 (1080x1920, 30 fps, silent)
 *   node commercial/render-waitlist.cjs --stills 3.5,20     → out/waitlist-3.5s.png, … (quick look at single frames)
 *   node commercial/render-waitlist.cjs --stills 5 --guides → same, with the TikTok safe zone overlaid
 *   node commercial/render-waitlist.cjs --cast              → out/waitlist-cast.png (character sheet)
 *   node commercial/render-waitlist.cjs --sheet --center → contact sheet with the x = 540 centre line (layout check)
 *   node commercial/render-waitlist.cjs --sheet             → stills every 1.5 s tiled into out/aghf-waitlist-contact.png
 *
 * Steps commercial/waitlist.html frame by frame with window.render(t) and pipes the
 * screenshots into ffmpeg, so timing is exact no matter how slow the machine is.
 * Needs Playwright (Chromium) and ffmpeg.
 */
const path = require('path');
const fs = require('fs');
const { spawn, spawnSync } = require('child_process');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const guides = args.includes('--guides');
const center = args.includes('--center'); // layout check: red line at x = 540 on stills / sheet
const cast = args.includes('--cast');
const sheet = args.includes('--sheet');
let stillsArg = args.includes('--stills') ? args[args.indexOf('--stills') + 1] : null;
const fps = 30;
const outDir = path.join(__dirname, '..', 'out');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const url = 'file://' + path.join(__dirname, 'waitlist.html') + `?render=1${guides ? '&guides=1' : ''}${center ? '&center=1' : ''}${cast ? '&cast=1' : ''}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => {}))));
  const duration = await page.evaluate(() => window.VIDEO_DURATION);
  // Render a frame, then wait one animation frame so the SVG <image> screens are painted.
  const frame = t => page.evaluate(x => { window.render(x); return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }, t);

  if (cast) {
    await frame(1.2);
    const file = path.join(outDir, 'waitlist-cast.png');
    await page.screenshot({ path: file });
    console.log(file);
    await browser.close();
    return;
  }

  if (center && !stillsArg && !sheet) throw new Error('--center is for --stills / --sheet only');
  if (sheet) {
    const ts = [];
    for (let t = 0.75; t < duration; t += 1.5) ts.push(+t.toFixed(2));
    stillsArg = ts.join(',');
  }
  if (stillsArg) {
    const files = [];
    for (const t of stillsArg.split(',').map(Number)) {
      await frame(t);
      const file = path.join(outDir, `waitlist${guides ? '-guides' : ''}-${t}s.png`);
      await page.screenshot({ path: file });
      files.push(file);
      if (!sheet) console.log(file);
    }
    if (errors.length) console.log('ERRORS:\n' + errors.join('\n'));
    await browser.close();
    if (sheet) {
      const outFile = path.join(outDir, center ? 'waitlist-center-check.png' : 'aghf-waitlist-contact.png');
      const inputs = files.flatMap(f => ['-i', f]);
      const n = files.length;
      const filt = files.map((_, i) => `[${i}]scale=216:384,drawtext=text='${(0.75 + i * 1.5).toFixed(2)}s':x=8:y=8:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.5[v${i}]`).join(';') +
        ';' + files.map((_, i) => `[v${i}]`).join('') + `concat=n=${n}:v=1:a=0,tile=6x5`;
      const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', filt, '-frames:v', '1', outFile], { stdio: 'inherit' });
      if (r.status !== 0) throw new Error('ffmpeg tile failed');
      files.forEach(f => fs.unlinkSync(f));
      console.log(outFile);
    }
    return;
  }

  const outFile = path.join(outDir, 'aghf-waitlist-45s.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps),
    '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium',
    '-r', String(fps), '-movflags', '+faststart', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });

  const frames = Math.round(duration * fps);
  for (let i = 0; i < frames; i++) {
    await frame(i / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % (fps * 6) === 0) console.log(`frame ${i}/${frames}`);
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg exited ' + c)))));
  if (errors.length) console.log('ERRORS:\n' + errors.join('\n'));
  await browser.close();
  console.log(outFile);
})().catch(e => { console.error(e); process.exit(1); });
