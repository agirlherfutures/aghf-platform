/**
 * Phase 8 · Section 22 · Lesson 13 intro video: "What Counts as One Backtest?"
 * Scenes: s22-hamster-wheel, s22-bowling (see scenes-s22.js).
 */
window.LESSON_VIDEO = {
  "slug": "p8-lesson-13",
  "eyebrow": "Phase 8 · Section 22 · Lesson 13",
  "duration": 84,
  "sources": "From Phase 8, Section 22, Lesson 13 (\"What Counts as One Backtest?\"): hook \"One rep. One evaluated opportunity.\"; one rep = one independently evaluated opportunity; a setup evaluated and taken, logged, is a rep; a setup your rules said no to, passed and logged, is a rep; three screenshots of the same trade belong to the rep and aren’t reps themselves; candles aren’t decisions; imaginary setups aren’t data; re-running a session you’ve already seen is review, not a clean rep; remember: \"A rep only helps if you know exactly what you’re repeating.\"; mission question \"What exactly am I repeating?\"",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 22: Practice Like a Pro",
      "title": "What Counts as One Backtest?",
      "quote": "One rep. One evaluated opportunity.",
      "lines": [
        { "at": 0.6, "text": "Welcome to Lesson Thirteen: What Counts as One Backtest?", "screen": "Aristella waves; title *What Counts as One Backtest?*" },
        { "at": 4.6, "text": "One rep. One evaluated opportunity." }
      ]
    },
    {
      "type": "s22-hamster-wheel",
      "start": 8,
      "end": 35,
      "kicker": "What is one rep?",
      "beats": { "wheel": 8.4, "run": 9.4, "notdec": 11.8, "setups": [15.6, 20.2], "decide": [17.6, 22.4], "ghost": 25.8, "poof": 29 },
      "headlines": [
        { "at": 8.6, "html": "Candles <span class=\"mark\">aren’t reps.</span>", "out": 15.4 },
        { "at": 15.6, "html": "Take or pass: <span class=\"mark\">one rep each.</span>", "out": 30 },
        { "at": 30.2, "html": "One rep = <span class=\"mark\">one evaluated opportunity.</span>" }
      ],
      "lines": [
        { "at": 8.4, "text": "Here’s a hamster doing replay. The candle counter flies.", "screen": "A hamster on a wheel; CANDLES counter racing; REPS at 0; a parrot coach" },
        { "at": 11.8, "text": "But candles aren’t decisions. Stepping through them isn’t a rep.", "screen": "Parrot: \"Candles aren’t decisions!\" · not decisions" },
        { "at": 15.6, "text": "A setup forms. She evaluates it and takes it. That’s one rep.", "screen": "SETUP FORMED · TAKE ✓ · REPS 1" },
        { "at": 20.2, "text": "Next setup, her rules say no. She passes and logs it. Also one rep.", "screen": "SETUP FORMED · PASS ✓ · REPS 2" },
        { "at": 25.6, "text": "And a setup she imagines might have formed? Not data. Not a rep.", "screen": "A soap bubble \"what if it pulled back?\" pops · imaginary, not data" },
        { "at": 30.2, "text": "One rep is one independently evaluated opportunity." }
      ]
    },
    {
      "type": "s22-bowling",
      "start": 35,
      "end": 62,
      "kicker": "Screenshots belong to the rep",
      "beats": { "alley": 35.4, "roll": 37, "frame": 39.2, "photos": [42.2, 43.4, 44.6, 45.8], "still": 47, "replay": 50.4 },
      "headlines": [
        { "at": 35.6, "html": "Four photos, <span class=\"mark\">still one rep.</span>", "out": 50.2 },
        { "at": 50.4, "html": "Seen it before? <span class=\"mark\">That’s review.</span>" }
      ],
      "lines": [
        { "at": 35.4, "text": "Now screenshots. Here’s one rep at the bowling alley.", "screen": "A bowling alley: a bowler, a koala photographer, a crab pinsetter, a five-frame scoreboard" },
        { "at": 38.8, "text": "One opportunity, one decision, logged in frame one.", "screen": "Frame 1: REP 1 · TAKE" },
        { "at": 42, "text": "Snap a before shot, an entry shot, an after shot, even a fourth.", "screen": "Four flashes; four photos clip to frame one: BEFORE, ENTRY, AFTER, EXTRA" },
        { "at": 47, "text": "Still one rep. The screenshots belong to the rep.", "screen": "REPS 1 pulses · still 1" },
        { "at": 50.4, "text": "And re-running a session you’ve already seen? You know the ending.", "screen": "A replay TV rewinds the same throw; SEEN IT stamp; crab: \"You know the ending\"" },
        { "at": 54.6, "text": "That’s review, not a clean rep.", "screen": "Frame 2: ✗ review" },
        { "at": 57, "text": "So be clear about what you’re repeating." }
      ]
    },
    {
      "type": "host-hook",
      "start": 62,
      "end": 72,
      "pointAt": 65.6,
      "size": 50,
      "kicker": "Dayli says",
      "parts": [
        { "at": 63.4, "text": "A rep only helps if you know" },
        { "at": 65.6, "html": "<span class=\"mark\">exactly what you’re repeating.</span>" }
      ],
      "lines": [
        { "at": 62.2, "text": "Remember this.", "screen": "Aristella thinks" },
        { "at": 63.6, "text": "A rep only helps if you know exactly what you’re repeating.", "screen": "Aristella points" }
      ]
    },
    {
      "type": "host-mission",
      "start": 72,
      "end": 84,
      "kicker": "Your mission",
      "question": { "at": 74.4, "text": "What exactly am I repeating?" },
      "cta": { "at": 80, "text": "Let’s find out" },
      "lines": [
        { "at": 72.2, "text": "Your mission.", "screen": "\"Your mission\"" },
        { "at": 74.4, "text": "Before you log your next rep, ask yourself: what exactly am I repeating?", "screen": "Mission question" },
        { "at": 80.6, "text": "Let’s find out.", "screen": "Aristella cheers; \"Let's find out →\"" }
      ]
    }
  ]
};
