/**
 * Phase 6 · Section 16 · Lesson 14 intro video: "Over-Managing the Trade"
 * Scenes: s16-seed-digger, s16-turbulence-pilot (see scenes-s16.js).
 */
window.LESSON_VIDEO = {
  "slug": "p6-lesson-14",
  "eyebrow": "Phase 6 · Section 16 · Lesson 14",
  "duration": 84,
  "sources": "From Phase 6, Section 16, Lesson 14 (\"Over-Managing the Trade\"): \"Activity is not the same as management.\"; the micromanagement simulator (MOVE STOP! · CLOSE? · TAKE PARTIAL? · MOVE TARGET? · ADD CONTRACT?); the touch counter: planned, rule-based or unplanned (holding to the fixed target = planned; trailing because the plan’s HL condition triggered = rule-based; moving the stop because the candle looked scary = unplanned); \"Not every touch is bad. Unplanned touching is.\"; \"Sometimes the best management decision is to stop touching things.\"",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 16: Managing the Trade",
      "title": "Over-Managing the Trade",
      "quote": "Activity is not the same as management.",
      "lines": [
        { "at": 0.6, "text": "Welcome to Lesson Fourteen: Over-Managing the Trade.", "screen": "Aristella waves; title *Over-Managing the Trade*" },
        { "at": 4.6, "text": "This one might feel a little familiar." }
      ]
    },
    {
      "type": "s16-seed-digger",
      "start": 8,
      "end": 34,
      "kicker": "Two gardeners",
      "beats": { "beds": 8.4, "plant": 9.6, "digs": [11.6, 13.6, 15.4, 17.2, 20.6, 22.4], "water": 19.2, "calm": 23.4, "bloom": 27.6 },
      "headlines": [
        { "at": 8.4, "html": "Checking isn’t <span class=\"mark\">growing.</span>", "out": 26.4 },
        { "at": 26.6, "html": "Activity <span class=\"mark\">isn’t management.</span>" }
      ],
      "lines": [
        { "at": 8.4, "text": "Two gardeners plant the same seed.", "screen": "Two garden beds behind a white fence" },
        { "at": 10.8, "text": "One checks on it. And checks. And checks again.", "screen": "She digs it up with a magnifier: \"Is it growing? 🔍\" · TOUCHES climbs" },
        { "at": 14.6, "text": "Dig it up, look, put it back. Move it a bit. Dig again.", "screen": "A worm pops up: \"Again?! 😤\"" },
        { "at": 19, "text": "The other follows her plan: water on schedule, then leave it alone.", "screen": "PLAN: water 8:00 · TOUCHES: 1 · planned" },
        { "at": 23.4, "text": "Six touches. One plan. Guess which seed grew.", "screen": "The right plant grows and blooms; the left seed is still a seed" },
        { "at": 26.6, "text": "Activity is not the same as management." },
        { "at": 29.4, "text": "Sometimes the best thing you can do is stop touching things." }
      ]
    },
    {
      "type": "s16-turbulence-pilot",
      "start": 34,
      "end": 62,
      "kicker": "The micromanagement simulator",
      "beats": { "buttons": [37.2, 38, 38.8, 39.6, 40.4], "hands": 44.4, "sort": 49, "tokens": [52.4, 54, 55.4] },
      "headlines": [
        { "at": 34.4, "html": "Turbulence <span class=\"mark\">isn’t an instruction.</span>", "out": 48.8 },
        { "at": 49, "html": "Count <span class=\"mark\">your touches.</span>", "out": 57.4 },
        { "at": 57.6, "html": "Unplanned touching <span class=\"mark\">is the problem.</span>" }
      ],
      "lines": [
        { "at": 34.4, "text": "Turbulence. Price wiggles, and buttons start flashing.", "screen": "A shaking cockpit; clouds rush past; AUTOPILOT · PLAN · ON" },
        { "at": 37.2, "text": "Move stop! Close? Take partial? Move target? Add a contract?", "screen": "Alerts flash: MOVE STOP! · CLOSE? · TAKE PARTIAL? · MOVE TARGET? · ADD CONTRACT?" },
        { "at": 41.2, "text": "The co-pilot hits every one. That’s over-managing.", "screen": "A monkey co-pilot slaps every button: touches: 5" },
        { "at": 44.4, "text": "The pilot keeps her hands off. The flight plan is already set.", "screen": "Pilot, hands behind head: \"Hands off. Plan’s set. ✈️\"" },
        { "at": 49, "text": "Count your touches: planned, rule-based, or unplanned.", "screen": "Three bins: PLANNED · RULE-BASED · UNPLANNED" },
        { "at": 52.4, "text": "Holding to target: planned. Trailing by your rule: rule-based. A scary candle: unplanned.", "screen": "hold to target ✓ · trail by HL rule ✓ · scary candle: move stop ✗" },
        { "at": 57.8, "text": "Not every touch is bad. Unplanned touching is." }
      ]
    },
    {
      "type": "host-hook",
      "start": 62,
      "end": 72,
      "pointAt": 66.2,
      "size": 52,
      "kicker": "Dayli says",
      "parts": [
        { "at": 63.4, "text": "Sometimes the best management decision" },
        { "at": 66.2, "html": "is to <span class=\"mark\">stop touching things.</span>" }
      ],
      "lines": [
        { "at": 62.2, "text": "Here’s the big takeaway.", "screen": "Aristella thinks" },
        { "at": 63.6, "text": "Sometimes the best management decision is to stop touching things.", "screen": "Aristella points" }
      ]
    },
    {
      "type": "host-mission",
      "start": 72,
      "end": 84,
      "kicker": "Your mission",
      "question": { "at": 74.4, "text": "What plan am I actually trading?" },
      "cta": { "at": 80, "text": "Let’s find out" },
      "lines": [
        { "at": 72.2, "text": "Here’s your mission.", "screen": "\"Your mission\"" },
        { "at": 74.4, "text": "Count your touches, and ask: what plan am I actually trading?", "screen": "Mission question" },
        { "at": 80, "text": "Let’s find out.", "screen": "Aristella cheers; \"Let's find out →\"" }
      ]
    }
  ]
};
