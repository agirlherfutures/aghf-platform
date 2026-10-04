#!/usr/bin/env node
/**
 * Builds a narration script (markdown) from a lesson's data file.
 *   node make-script.cjs lesson-14   → scripts/lesson-14-script.md
 * Each line's "On screen" cell comes from an optional `screen` field on the line.
 */
const fs = require('fs');
const path = require('path');
const slug = process.argv[2];
const window = {};
new Function('window', fs.readFileSync(path.join(__dirname, 'lessons', slug + '.js'), 'utf8'))(window);
const V = window.LESSON_VIDEO;
const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const title = V.scenes[0].title;
const n = parseInt(slug.split('-').pop(), 10);
let md = `# Lesson ${n} intro: "${title}"\n\n`;
md += `**Length:** ${mmss(V.duration)} · **Pace:** relaxed and conversational, about 150 words a minute\n`;
md += `**Tip:** Play \`${slug}-captions.mp4\` while you record, then lay your audio over the clean \`${slug}.mp4\`.\n\n`;
md += `| Time | On screen | Say |\n|---|---|---|\n`;
V.scenes.forEach(s => s.lines.forEach(l => {
  md += `| ${mmss(l.at)} | ${(l.screen || '').replace(/\|/g, '/')} | ${l.text.replace(/[’]/g, "'").replace(/[“”]/g, '"')} |\n`;
}));
if (V.sources) md += `\n## Where the words come from\n${V.sources}\n`;
const out = path.join(__dirname, 'scripts', slug + '-script.md');
fs.writeFileSync(out, md);
console.log(out);
