/**
 * Phase 8 · Section 21 · Lesson 4 intro video: "An Invalid Winning Trade"
 * Scenes: s21-thin-ice, s21-warning-museum (see scenes-s21.js).
 */
window.LESSON_VIDEO = {
  "slug": "p8-lesson-4",
  "eyebrow": "Phase 8 · Section 21 · Lesson 4",
  "duration": 84,
  "sources": "From Phase 8, Section 21, Lesson 4 (\"An Invalid Winning Trade\"): hook \"It paid. It was still wrong.\"; Case 04: \"Continuation had not closed. At this candle the model says wait.\"; violations NO CONTINUATION, EARLY ENTRY; \"Price is pushing back up. It looks like it wants to go.\"; direction correct is not setup valid; outcome WIN +$464, process VIOLATION, \"OUTCOME (no celebration)\"; \"This win is trying to teach you the wrong lesson.\"; \"One paid violation turns into a habit.\"; \"Profitable rule-breaking is not evidence. It's a warning.\"; store the outcome and the process separately; never celebrate a violation; remember: \"A winner can still be a warning.\"; mission question \"Can a winner be a warning?\"",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 21: Real Trade Breakdown Lab",
      "title": "An Invalid Winning Trade",
      "quote": "It paid. It was still wrong.",
      "lines": [
        { "at": 0.6, "text": "Welcome to Lesson Four: An Invalid Winning Trade.", "screen": "Aristella waves; title *An Invalid Winning Trade*" },
        { "at": 4.4, "text": "It paid. It was still wrong." }
      ]
    },
    {
      "type": "s21-thin-ice",
      "start": 8,
      "end": 35,
      "kicker": "The model said wait",
      "beats": { "set": 8.3, "lamps": [12.0, 13.2], "tempt": 14.6, "go": 16.4, "arrive": 20.4, "open": 21.2, "verdict": 24.2, "penguin": 27.6, "crack": 29.4, "whistle": 30.0, "habit": 32.0 },
      "headlines": [
        { "at": 8.6, "html": "Two lights on. <span class=\"mark\">One still off.</span>", "out": 24 },
        { "at": 24.2, "html": "Direction right. <span class=\"mark\">Entry invalid.</span>" }
      ],
      "lines": [
        { "at": 8.4, "text": "A frozen pond, and a ranger with three ice lights.", "screen": "A frozen pond; a ranger by a board of three lights; a skater; a penguin; a gift on the far bank" },
        { "at": 11.8, "text": "Indication, lit. Correction, lit. Continuation hasn’t closed. The model says wait.", "screen": "IND and CORR light up; CONT blinks: \"not closed: wait\"" },
        { "at": 16.2, "text": "But it looks like it wants to go, so she skates across anyway.", "screen": "Skater: \"It wants to go!\"; she skates; the ice cracks behind her" },
        { "at": 21.0, "text": "She makes it, and the prize pays out.", "screen": "The gift opens: +$464" },
        { "at": 24.2, "text": "Still wrong. Direction right doesn’t make the entry valid.", "screen": "\"Made it. Still invalid.\"" },
        { "at": 27.6, "text": "And the penguin learns the wrong lesson: early works, me next.", "screen": "Penguin: \"Early works! Me next!\"; the ice cracks; the ranger waves it back" },
        { "at": 32.0, "text": "That’s the danger of a paid violation.", "screen": "\"a paid violation teaches habits\"" }
      ]
    },
    {
      "type": "s21-warning-museum",
      "start": 35,
      "end": 62,
      "kicker": "File it correctly",
      "beats": { "set": 35.3, "trophy": 38.2, "warn": 40.6, "peacock": 44.4, "fire": 46.2, "stop": 47.8, "sweep": 50.0, "plaque": 54.0 },
      "headlines": [
        { "at": 35.6, "html": "Store them <span class=\"mark\">separately.</span>", "out": 47.6 },
        { "at": 47.8, "html": "Never celebrate <span class=\"mark\">a violation.</span>" }
      ],
      "lines": [
        { "at": 35.4, "text": "Now a museum curator files the case.", "screen": "A museum hall: two display cases, a curator" },
        { "at": 38.2, "text": "The win goes in one case. The violation goes in another.", "screen": "Trophy into OUTCOME · WIN; warning sign into PROCESS · VIOLATION (early entry · no continuation)" },
        { "at": 42.6, "text": "Stored separately. Never blended." },
        { "at": 44.4, "text": "Then the peacock shows up with a confetti cannon.", "screen": "A peacock with a confetti cannon: \"Party time!\"" },
        { "at": 47.8, "text": "No. Never celebrate a violation.", "screen": "NO PARTY stamp" },
        { "at": 50.0, "text": "The mouse sweeps up the confetti, and the label stays: warning.", "screen": "A mouse sweeps the confetti away" },
        { "at": 54.2, "text": "Profitable rule-breaking isn’t evidence. It’s a warning.", "screen": "Plaque: \"A winner can still be a warning\"" },
        { "at": 57.4, "text": "This win is trying to teach you the wrong lesson." }
      ]
    },
    {
      "type": "host-hook",
      "start": 62,
      "end": 72,
      "pointAt": 66.0,
      "size": 64,
      "kicker": "Dayli says",
      "parts": [
        { "at": 63.4, "text": "A winner can still be" },
        { "at": 66.0, "html": "<span class=\"mark\">a warning.</span>" }
      ],
      "lines": [
        { "at": 62.2, "text": "Here’s the big takeaway.", "screen": "Aristella thinks" },
        { "at": 63.6, "text": "A winner can still be a warning. Never celebrate a violation.", "screen": "Aristella points" }
      ]
    },
    {
      "type": "host-mission",
      "start": 72,
      "end": 84,
      "kicker": "Your mission",
      "question": { "at": 74.4, "text": "Can a winner be a warning?" },
      "cta": { "at": 80, "text": "Let’s find out" },
      "lines": [
        { "at": 72.2, "text": "Your mission.", "screen": "\"Your mission\"" },
        { "at": 74.4, "text": "Spot the entry that broke the model, watch it win anyway, and ask: can a winner be a warning?", "screen": "Mission question" },
        { "at": 81.2, "text": "Let’s find out.", "screen": "Aristella cheers; \"Let's find out →\"" }
      ]
    }
  ]
};
