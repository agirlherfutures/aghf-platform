/**
 * Phase 3 · Section 1 · Lesson 8 intro video — "Sweep vs Structural Break"
 */
window.LESSON_VIDEO = {
  "slug": "p3-lesson-8",
  "eyebrow": "Phase 3 · Section 1 · Lesson 8",
  "duration": 76,
  "sources": "From Phase 3, Lesson 8: the liquidity question vs the structure question, Example A (wick above, close back below) vs Example B (close above, hold, build), and “price took liquidity, so that’s MSS” as the mistake to catch.",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 1: Understanding Liquidity",
      "title": "Sweep vs Structural Break",
      "quote": "Liquidity tells you where something may happen. Structure tells you what price actually did.",
      "lines": [
        {
          "at": 0.6,
          "text": "Welcome to Lesson Eight: Sweep vs Structural Break.",
          "screen": "Aristella waves; title *Sweep vs Structural Break*"
        },
        {
          "at": 4.6,
          "text": "Two lenses. Two questions."
        }
      ]
    },
    {
      "type": "break-chart",
      "start": 8,
      "end": 38,
      "seed": 308,
      "kicker": "A, then B",
      "swings": [
        [
          0,
          0.2
        ],
        [
          0.2,
          0.62
        ],
        [
          0.35,
          0.38
        ],
        [
          0.5,
          0.58
        ],
        [
          0.62,
          0.4
        ],
        [
          0.82,
          0.86
        ],
        [
          0.92,
          0.74
        ]
      ],
      "per": [
        5,
        4,
        4,
        3,
        5,
        2
      ],
      "play": [
        {
          "to": 3,
          "at": 8.6,
          "dur": 2.6
        },
        {
          "to": 4,
          "at": 13.0,
          "dur": 0.8
        },
        {
          "to": 6,
          "at": 18.0,
          "dur": 2.4
        }
      ],
      "headlines": [
        {
          "at": 8.4,
          "html": "Same high. <span class=\"mark\">Two behaviors.</span>",
          "out": 28.3
        },
        {
          "at": 28.5,
          "html": "Two questions. <span class=\"mark\">Ask both.</span>"
        }
      ],
      "lines": [
        {
          "at": 8.4,
          "text": "Here’s a prior high. Watch two attempts.",
          "screen": "Candles build"
        },
        {
          "at": 13.0,
          "text": "Example A: a wick above, then a close back below. Sweep-like.",
          "screen": "\"A\""
        },
        {
          "at": 18.0,
          "text": "Example B: price closes above, holds, and builds higher.",
          "screen": "\"B\""
        },
        {
          "at": 23.0,
          "text": "Both traded through the area above the high."
        },
        {
          "at": 28.5,
          "text": "But only B changed what price is building. Ask the liquidity question and the structure question separately."
        }
      ],
      "levels": [
        {
          "v": 0.62,
          "from": 0.2,
          "label": "Prior high",
          "tone": "purple",
          "at": 9.4
        }
      ],
      "pills": [
        {
          "u": 0.54,
          "v": 0.76,
          "text": "A · wick above, close below",
          "tone": "gold",
          "at": 12.0,
          "fs": 26
        },
        {
          "u": 0.8,
          "v": 0.95,
          "text": "B · close, hold, build",
          "tone": "up",
          "at": 20.0,
          "fs": 26
        }
      ],
      "extra": [
        {
          "u": 0.54,
          "o": 0.58,
          "c": 0.57,
          "hi": 0.68,
          "lo": 0.55,
          "at": 11.4
        }
      ]
    },
    {
      "type": "cards",
      "start": 38,
      "end": 56,
      "kicker": "Two lenses",
      "items": [
        {
          "title": "Liquidity",
          "desc": [
            "did price trade",
            "through the area?"
          ],
          "tone": "gold",
          "at": 40.8
        },
        {
          "title": "Structure",
          "desc": [
            "did price close,",
            "hold and build?"
          ],
          "tone": "up",
          "at": 44.2
        },
        {
          "title": "“Took liquidity",
          "desc": [
            "= MSS”",
            ""
          ],
          "tone": "down",
          "mark": "no",
          "at": 47.6,
          "markAt": 49.6
        }
      ],
      "headlines": [
        {
          "at": 51.0,
          "html": "Two questions. <span class=\"mark\">Not one.</span>"
        }
      ],
      "lines": [
        {
          "at": 38.4,
          "text": "Two lenses.",
          "screen": "\"Two lenses\""
        },
        {
          "at": 40.8,
          "text": "Liquidity asks: did price trade through the area?",
          "screen": "Liquidity did price trade through the area?"
        },
        {
          "at": 44.2,
          "text": "Structure asks: did it close, hold and build?",
          "screen": "Structure did price close, hold and build?"
        },
        {
          "at": 47.6,
          "text": "Took liquidity equals MSS? No.",
          "screen": "Took liquidity = MSS"
        },
        {
          "at": 51.0,
          "text": "Two questions. Not one."
        }
      ]
    },
    {
      "type": "host-hook",
      "start": 56,
      "end": 64,
      "pointAt": 58.6,
      "size": 66,
      "kicker": "Dayli says",
      "parts": [
        {
          "at": 57.6,
          "text": "Liquidity: where it may happen."
        },
        {
          "at": 58.6,
          "html": "<span class=\"mark\">Structure: what price did.</span>"
        }
      ],
      "lines": [
        {
          "at": 56.2,
          "text": "Here’s the big takeaway.",
          "screen": "Aristella thinks"
        },
        {
          "at": 58.0,
          "text": "Liquidity tells you where something may happen. Structure tells you what price actually did.",
          "screen": "Aristella points"
        }
      ]
    },
    {
      "type": "host-mission",
      "start": 64,
      "end": 76,
      "kicker": "Your mission",
      "question": {
        "at": 67,
        "text": "Price took liquidity. Is that an MSS?"
      },
      "cta": {
        "at": 72.4,
        "text": "Let’s find out"
      },
      "lines": [
        {
          "at": 64.2,
          "text": "Here’s your mission for this lesson.",
          "screen": "\"Your mission\""
        },
        {
          "at": 67,
          "text": "Price took liquidity. Is that an MSS?",
          "screen": "Mission question"
        },
        {
          "at": 72.4,
          "text": "Let’s find out.",
          "screen": "Aristella cheers; \"Let's find out →\""
        }
      ]
    }
  ]
};
