// node tools/read-script.cjs <slug> : writes scripts/<slug>-read.md, the spoken lines only, one per line, for recording.
const fs = require('fs'), path = require('path');
const slug = process.argv[2];
global.window = {}; require(path.join(__dirname, '..', 'lessons', slug + '.js'));
const v = window.LESSON_VIDEO, title = v.scenes[0];
let md = `# ${title.title}\n*${title.quote}*\n\nRead these lines exactly as written. Coaching notes from the script are left out.\n`;
// Every scene with spoken lines, the title scene's welcome included, numbered in order.
v.scenes.filter(s => (s.lines || []).length).forEach((s, i) => { md += `\n## ${i + 1}\n\n` + s.lines.map(l => l.text).join('\n\n') + '\n'; });
fs.writeFileSync(path.join(__dirname, '..', 'scripts', slug + '-read.md'), md);
console.log('wrote scripts/' + slug + '-read.md');
