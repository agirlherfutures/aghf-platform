/**
 * Phase 3 · Section 7 · Lesson 8 intro video: "Sweep vs Structural Break"
 * Scenes: host-title, s7-frog-ledge, s7-two-clipboards, host-hook, host-mission (scene art in scenes-s7.js).
 */
window.LESSON_VIDEO = {
  "slug": "p3-lesson-8",
  "eyebrow": "Phase 3 · Section 7 · Lesson 8",
  "duration": 84,
  "sources": "From Section 7, Lesson 8 (\"Sweep vs Structural Break\"): the liquidity question (did price trade through an area where orders may rest?) vs the structure question (did price close through the relevant swing, hold and build?), wick above and close back below vs close above, hold and build, and \"Taking liquidity is not an MSS. Neither is an entry.\"",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 7: Understanding Liquidity",
      "title": "Sweep vs Structural Break",
      "quote": "Two lenses. Two questions.",
      "lines": [
        {
          "at": 0.6,
          "text": "Welcome to Lesson Eight: Sweep vs Structural Break.",
          "screen": "Aristella waves; title *Sweep vs Structural Break*"
        },
        {
          "at": 4.8,
          "text": "Same high. Two very different behaviors."
        }
      ]
    },
    {
      "type": "s7-frog-ledge",
      "start": 8,
      "end": 34,
      "kicker": "Two frogs, one ledge",
      "headlines": [
        {
          "at": 8.4,
          "out": 25.8,
          "html": "Same high. <span class=\"mark\">Two behaviors.</span>"
        },
        {
          "at": 26,
          "html": "Only one <span class=\"mark\">changed structure.</span>"
        }
      ],
      "lines": [
        {
          "at": 8.4,
          "text": "Here’s a prior high: the top of that ledge. Two frogs are going to try it.",
          "screen": "Two ponds, two ledges, two frogs"
        },
        {
          "at": 12.2,
          "text": "Frog A jumps above it, then drops right back below. Wick above, close back below. Sweep-like.",
          "screen": "Frog A splashes back down"
        },
        {
          "at": 18.4,
          "text": "Frog B lands on top, stays there, and keeps climbing. Close above, hold, build.",
          "screen": "Frog B lands, holds, and hops up the steps"
        },
        {
          "at": 26.2,
          "text": "Both traded through the area above the high.",
          "screen": "\"traded through ✓\" on both"
        },
        {
          "at": 29.2,
          "text": "But only B changed what price is building.",
          "screen": "\"structure changed ✓\""
        }
      ]
    },
    {
      "type": "s7-two-clipboards",
      "start": 34,
      "end": 60,
      "kicker": "Two inspectors",
      "headlines": [
        {
          "at": 34.4,
          "out": 48.8,
          "html": "Two lenses. <span class=\"mark\">Two questions.</span>"
        },
        {
          "at": 49,
          "html": "Took liquidity <span class=\"mark\">≠ MSS.</span>"
        }
      ],
      "lines": [
        {
          "at": 34.4,
          "text": "So call in two inspectors. Each one asks a single question.",
          "screen": "Two inspectors with clipboards and a scoreboard"
        },
        {
          "at": 36.8,
          "text": "Liquidity asks: did price trade through the area where orders may rest? A, yes. B, yes.",
          "screen": "\"Through the area?\" A ✓ B ✓"
        },
        {
          "at": 43.6,
          "text": "Structure asks: did price close through, hold, and build? A, no. B, yes.",
          "screen": "\"Close, hold, build?\" A ✗ B ✓"
        },
        {
          "at": 49.6,
          "text": "And here’s the classic mistake: price took liquidity, so that’s an MSS.",
          "screen": "\"took liquidity = MSS\""
        },
        {
          "at": 53.8,
          "text": "No. Two questions, not one. And neither one is an entry.",
          "screen": "Crossed out to ≠; \"neither is an entry\""
        }
      ]
    },
    {
      "type": "host-hook",
      "start": 60,
      "end": 71,
      "pointAt": 63.8,
      "size": 56,
      "kicker": "Dayli says",
      "parts": [
        {
          "at": 61.2,
          "text": "Liquidity tells you where something may happen."
        },
        {
          "at": 63.8,
          "html": "Structure tells you <span class=\"mark\">what price actually did.</span>"
        }
      ],
      "lines": [
        {
          "at": 60.4,
          "text": "So here’s the big takeaway.",
          "screen": "Aristella thinks"
        },
        {
          "at": 61.8,
          "text": "Liquidity tells you where something may happen. Structure tells you what price actually did.",
          "screen": "Aristella points"
        }
      ]
    },
    {
      "type": "host-mission",
      "start": 71,
      "end": 84,
      "kicker": "Your mission",
      "question": {
        "at": 73,
        "text": "Price took liquidity. Is that an MSS?"
      },
      "cta": {
        "at": 80,
        "text": "Let’s find out"
      },
      "lines": [
        {
          "at": 71.4,
          "text": "Here’s your mission for this lesson.",
          "screen": "\"Your mission\""
        },
        {
          "at": 73,
          "text": "Price took liquidity. Is that an MSS?",
          "screen": "Mission question"
        },
        {
          "at": 80,
          "text": "Let’s find out.",
          "screen": "Aristella cheers; \"Let's find out →\""
        }
      ]
    }
  ]
};
