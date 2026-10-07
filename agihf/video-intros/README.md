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

## Generated narration

`voiceover.cjs` reads each spoken line with a text-to-speech service and places it at its `at` time, so the audio lines up with the video. It writes `out/<slug>-voice.m4a` at the video's exact length, and with `--mux` it also writes `out/<slug>-narrated.mp4` from `out/<slug>.mp4`.

```
NARAKEET_API_KEY=… NARAKEET_VOICE=Hannah node voiceover.cjs p2-lesson-13 --mux
VOICE_PROVIDER=elevenlabs ELEVENLABS_API_KEY=… ELEVENLABS_VOICE_ID=… node voiceover.cjs --phase p2 --mux
VOICE_PROVIDER=fake node voiceover.cjs p2-lesson-13   # no network: checks the timing with tones
```

A line that comes back longer than its slot is sped up (up to 1.25x) and listed at the end. Set `VOICE_SPEED=1.1` if lines still run into the next one. Generated clips are cached in `out/voice/`, so re-runs only pay for changed lines.

Scene types: `title`, `hook`, `longshort`, `grid4`, `compare`, `remember`, `mission`.
