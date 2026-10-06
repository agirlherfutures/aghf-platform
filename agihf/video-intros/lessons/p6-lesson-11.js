/**
 * Phase 6 · Section 16 · Lesson 11 intro video: "Understanding the Dayli ICC Management Example"
 * Scenes: s16-blueprint, s16-balloon-pump (see scenes-s16.js).
 */
window.LESSON_VIDEO = {
  "slug": "p6-lesson-11",
  "eyebrow": "Phase 6 · Section 16 · Lesson 11",
  "duration": 84,
  "sources": "From Phase 6, Section 16, Lesson 11 (\"Understanding the Dayli ICC Management Example\"): the Dayli ICC MNQ example (30-point SL, 60-point TP, 1:2; with 4 MNQ: 30 × $2 × 4 = $240 risk, 60 × $2 × 4 = $480 gross reward, before fees and slippage) is an example, not universal and not what every student should risk; the risk ladder (2 MNQ = $120 risk; 4 → 8 contracts: the setup didn’t change, the exposure doubled from $240 to $480); \"Points describe the chart. Contracts decide what the chart costs you.\"; \"Don’t memorize my dollar amount. Understand my risk structure.\"",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 16: Managing the Trade",
      "title": "Understanding the Dayli ICC Management Example",
      "quote": "Understand the structure, not the dollars.",
      "lines": [
        { "at": 0.6, "text": "Welcome to Lesson Eleven: Understanding the Dayli ICC Management Example.", "screen": "Aristella waves; title *Understanding the Dayli ICC Management Example*" },
        { "at": 5.6, "text": "Let’s read it properly." }
      ]
    },
    {
      "type": "s16-blueprint",
      "start": 8,
      "end": 34,
      "kicker": "The Dayli ICC MNQ example",
      "beats": { "board": 8.4, "lines": [12.4, 13.8], "ratio": 15.2, "math": [16.8, 19.2], "example": 22.6, "parrot": 27.4, "owl": 29.6 },
      "headlines": [
        { "at": 8.4, "html": "A blueprint, <span class=\"mark\">not a price tag.</span>", "out": 27.2 },
        { "at": 27.4, "html": "Understand <span class=\"mark\">the risk structure.</span>" }
      ],
      "lines": [
        { "at": 8.4, "text": "Here’s the Dayli ICC MNQ example, drawn like a blueprint.", "screen": "An architect in a beret at a blueprint board" },
        { "at": 12.2, "text": "A 30-point stop. A 60-point target. That’s one to two.", "screen": "30 pts · 60 pts · 1:2 stamp" },
        { "at": 16.4, "text": "With four MNQ, that’s 240 dollars of risk and 480 dollars of gross reward, before fees.", "screen": "30 pts × $2 × 4 MNQ = $240 risk · 60 pts × $2 × 4 MNQ = $480 gross reward" },
        { "at": 22.6, "text": "But it’s an example. Not universal, and not what every student should risk.", "screen": "EXAMPLE sticky note · not universal · not a recommendation" },
        { "at": 27.4, "text": "A parrot memorizes the dollars.", "screen": "Parrot: \"$240! $240! 🦜\"" },
        { "at": 29.6, "text": "An owl learns the structure. Be the owl.", "screen": "Owl: \"Learn the structure 🦉\"" }
      ]
    },
    {
      "type": "s16-balloon-pump",
      "start": 34,
      "end": 62,
      "kicker": "The risk ladder",
      "beats": { "panel": 34.4, "pump": 35.4, "counts": [37.6, 41.4, 44.6], "setup": 48.4, "exposure": 54.4 },
      "headlines": [
        { "at": 34.4, "html": "Change the size. <span class=\"mark\">Watch what moves.</span>", "out": 57.4 },
        { "at": 57.6, "html": "Same points. <span class=\"mark\">Different dollars.</span>" }
      ],
      "lines": [
        { "at": 34.4, "text": "Now change the size, and watch what moves.", "screen": "Chart panel with 30 pts / 60 pts; a pump and a contracts sign" },
        { "at": 37.6, "text": "Two MNQ: 120 dollars at risk.", "screen": "MNQ × 2 · RISK $120 balloon" },
        { "at": 41.4, "text": "Four MNQ: 240.", "screen": "MNQ × 4 · $240" },
        { "at": 44.6, "text": "Eight MNQ: 480. The balloon doubled.", "screen": "MNQ × 8 · $480; the dog backs away" },
        { "at": 48.4, "text": "Did the setup change? No. The stop is still 30 points. The target is still 60.", "screen": "setup: no change · mouse: \"Still 30 / 60 ✓\"" },
        { "at": 54.4, "text": "Did the financial exposure change? Yes. It doubled.", "screen": "exposure: doubled ×2" },
        { "at": 57.6, "text": "Points describe the chart. Contracts decide what the chart costs you." }
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
        { "at": 63.4, "text": "Don’t memorize my dollar amount." },
        { "at": 66.4, "html": "Understand <span class=\"mark\">my risk structure.</span>" }
      ],
      "lines": [
        { "at": 62.2, "text": "Here’s the big takeaway.", "screen": "Aristella thinks" },
        { "at": 63.6, "text": "Don’t memorize my dollar amount. Understand my risk structure.", "screen": "Aristella points" }
      ]
    },
    {
      "type": "host-mission",
      "start": 72,
      "end": 84,
      "kicker": "Your mission",
      "question": { "at": 74.4, "text": "What changes when I change the size?" },
      "cta": { "at": 80, "text": "Let’s find out" },
      "lines": [
        { "at": 72.2, "text": "Here’s your mission.", "screen": "\"Your mission\"" },
        { "at": 74.4, "text": "Climb the risk ladder, and ask: what changes when I change the size?", "screen": "Mission question" },
        { "at": 80, "text": "Let’s find out.", "screen": "Aristella cheers; \"Let's find out →\"" }
      ]
    }
  ]
};
