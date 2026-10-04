# Lesson intro videos

Short animated slide videos (no audio) that open each lesson. Narration gets recorded separately and laid over the top.

- `player.html`: one template for every lesson. Open `player.html?lesson=lesson-01` in a browser to preview it (space pauses). Add `&captions=1` to show the script.
- `lessons/lesson-XX.js`: one lesson's scenes, on-screen text, and narration timings.
- `scripts/lesson-XX-script.md`: the narration script, with timestamps.
- `render.cjs`: renders the MP4s into `out/` (gitignored). You need Playwright and ffmpeg.

```
node render.cjs lesson-01             # clean video, for narrating over
node render.cjs lesson-01 --captions  # read-along version, with the script on screen
node render.cjs lesson-01 --stills 5,30  # check single frames as PNGs
```

Scene types: `title`, `hook`, `longshort`, `grid4`, `compare`, `remember`, `mission`.
