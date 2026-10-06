/**
 * Phase 6 · Section 16 · Lesson 13 intro video: "Moving Your Stop & Break Even"
 * Scenes: s16-trapeze-net, s16-round-trip-taxi (see scenes-s16.js).
 */
window.LESSON_VIDEO = {
  "slug": "p6-lesson-13",
  "eyebrow": "Phase 6 · Section 16 · Lesson 13",
  "duration": 84,
  "sources": "From Phase 6, Section 16, Lesson 13 (\"Moving Your Stop & Break Even\"): she moved it to break even at +26 with no BE rule, got stopped, and price went to the original target without her (an emotional intervention; not \"never move to BE\", but \"that move wasn’t in the plan\"); the planned version (move SL to entry after a 1M close above +30) is rule-based management; \"break even\" isn’t $0 (fees, fills and slippage, less room); \"Why did the stop move?\"; \"Break even can reduce risk. It can also reduce the room the trade has to move.\"",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 16: Managing the Trade",
      "title": "Moving Your Stop & Break Even",
      "quote": "Why did the stop move?",
      "lines": [
        { "at": 0.6, "text": "Welcome to Lesson Thirteen: Moving Your Stop and Break Even.", "screen": "Aristella waves; title *Moving Your Stop & Break Even*" },
        { "at": 5, "text": "One question matters most here." }
      ]
    },
    {
      "type": "s16-trapeze-net",
      "start": 8,
      "end": 34,
      "kicker": "Under the big top",
      "beats": { "run1": 10, "yank": 13.2, "verdict1": 19.6, "run2": 22.4, "rule": 28.2 },
      "headlines": [
        { "at": 8.4, "html": "The net is <span class=\"mark\">her stop.</span>", "out": 22 },
        { "at": 22.2, "html": "Why did <span class=\"mark\">the stop move?</span>" }
      ],
      "lines": [
        { "at": 8.4, "text": "The safety net is her stop.", "screen": "Circus tent; a tightrope walker on the price wire; net = STOP (−30)" },
        { "at": 10.8, "text": "She climbs to plus twenty-six, and the ringmaster panics: yank it to break even!", "screen": "Ringmaster in a top hat: \"Yank it to BE! 😰\"; the net jumps up to entry" },
        { "at": 15.6, "text": "A normal pullback, and she’s out.", "screen": "She tumbles into the raised net: out at break even 😩" },
        { "at": 18.2, "text": "Then price goes on to the original target. Without her. No rule: emotional.", "screen": "Dashed wire continues: went on without her · no BE rule → emotional" },
        { "at": 22.4, "text": "Rewind. This time her plan says: break even after a 1-minute close above plus thirty.", "screen": "Rewind; the same pullback, net still low: room to move ✓" },
        { "at": 28.2, "text": "The rule triggers. Same move, but rule-based.", "screen": "1M close above +30 · BE rule triggered → rule-based ✓; the seal claps" },
        { "at": 31.2, "text": "So always ask: why did the stop move?" }
      ]
    },
    {
      "type": "s16-round-trip-taxi",
      "start": 34,
      "end": 62,
      "kicker": "“Break even” isn’t $0",
      "beats": { "road": 34.4, "drive": 36.6, "meter": 40.6, "slip": 45.2, "room": 48.6, "end2": 52.2 },
      "headlines": [
        { "at": 34.4, "html": "Break even <span class=\"mark\">isn’t always zero.</span>", "out": 51.8 },
        { "at": 52, "html": "Less risk. <span class=\"mark\">Less room.</span>" }
      ],
      "lines": [
        { "at": 34.4, "text": "And break even isn’t always a literal zero.", "screen": "A taxi at the ENTRY stop; a pink STOP barrier behind" },
        { "at": 37.6, "text": "The trade drives out, comes back to entry, and the meter still shows fees.", "screen": "Meter: BACK AT ENTRY · FEES ≠ $0 · commissions still apply" },
        { "at": 43, "text": "Your stop can also fill worse than entry. That’s slippage.", "screen": "The taxi skids past the stop: filled worse than entry" },
        { "at": 47.2, "text": "And moving the stop up takes away room the trade has to move.", "screen": "The STOP barrier slides up behind the taxi; room to move shrinks" },
        { "at": 52.2, "text": "Break even can reduce risk. It can also reduce the room the trade has to move.", "screen": "\"Less risk. Less room.\"" },
        { "at": 58.2, "text": "Use it by rule, not by fear." }
      ]
    },
    {
      "type": "host-hook",
      "start": 62,
      "end": 72,
      "pointAt": 66.4,
      "size": 52,
      "kicker": "Dayli says",
      "parts": [
        { "at": 63.4, "text": "Break even can reduce risk." },
        { "at": 66.4, "html": "It can also reduce <span class=\"mark\">the room the trade has to move.</span>" }
      ],
      "lines": [
        { "at": 62.2, "text": "Here’s the big takeaway.", "screen": "Aristella thinks" },
        { "at": 63.6, "text": "Break even can reduce risk. It can also reduce the room the trade has to move.", "screen": "Aristella points" }
      ]
    },
    {
      "type": "host-mission",
      "start": 72,
      "end": 84,
      "kicker": "Your mission",
      "question": { "at": 74.4, "text": "Why am I moving my stop?" },
      "cta": { "at": 80, "text": "Let’s find out" },
      "lines": [
        { "at": 72.2, "text": "Here’s your mission.", "screen": "\"Your mission\"" },
        { "at": 74.4, "text": "Before you touch your stop, ask: why am I moving my stop?", "screen": "Mission question" },
        { "at": 80, "text": "Let’s find out.", "screen": "Aristella cheers; \"Let's find out →\"" }
      ]
    }
  ]
};
