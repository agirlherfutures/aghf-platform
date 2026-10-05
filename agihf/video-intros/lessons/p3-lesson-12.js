/**
 * Phase 3 · Section 2 · Lesson 12 intro video — "What Is Imbalance?"
 */
window.LESSON_VIDEO = {
  "slug": "p3-lesson-12",
  "eyebrow": "Phase 3 · Section 2 · Lesson 12",
  "duration": 76,
  "sources": "From Phase 3, Lesson 12: the show-overlap overlay, imbalance as an area where price moved with little two-sided trading, imbalance is not the same as an FVG, and the “price must return here” myth.",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 2: Gaps, Imbalances & Price Delivery",
      "title": "What Is Imbalance?",
      "quote": "Imbalance ≠ FVG. And price doesn’t have to return.",
      "lines": [
        {
          "at": 0.6,
          "text": "Welcome to Lesson Twelve: What Is Imbalance?",
          "screen": "Aristella waves; title *What Is Imbalance?*"
        },
        {
          "at": 4.6,
          "text": "Where did both sides trade?"
        }
      ]
    },
    {
      "type": "break-chart",
      "start": 8,
      "end": 38,
      "seed": 312,
      "kicker": "Show overlap",
      "swings": [
        [
          0,
          0.15
        ],
        [
          0.12,
          0.25
        ],
        [
          0.2,
          0.2
        ],
        [
          0.32,
          0.3
        ],
        [
          0.4,
          0.26
        ],
        [
          0.5,
          0.32
        ],
        [
          0.62,
          0.82
        ],
        [
          0.75,
          0.76
        ],
        [
          0.9,
          0.8
        ]
      ],
      "per": [
        2,
        2,
        2,
        2,
        2,
        3,
        2,
        2
      ],
      "play": [
        {
          "to": 8,
          "at": 8.6,
          "dur": 3.8
        }
      ],
      "headlines": [
        {
          "at": 8.4,
          "html": "Where did both <span class=\"mark\">sides trade?</span>",
          "out": 28.3
        },
        {
          "at": 28.5,
          "html": "Imbalance <span class=\"mark\">isn’t a promise.</span>"
        }
      ],
      "lines": [
        {
          "at": 8.4,
          "text": "Look at how neighboring candles overlap.",
          "screen": "Candles build"
        },
        {
          "at": 13.0,
          "text": "On the left, they share lots of prices. Both sides traded.",
          "screen": "\"Lots of overlap\""
        },
        {
          "at": 18.0,
          "text": "Then the fast move: neighbors barely share any prices.",
          "screen": "\"Imbalanced-looking\""
        },
        {
          "at": 23.0,
          "text": "That’s imbalance: little two-sided trading."
        },
        {
          "at": 28.5,
          "text": "Does price have to come back to it? That’s a myth. It may. It never has to.",
          "screen": "\"MYTH\""
        }
      ],
      "levels": [
        {
          "v": 0.15,
          "from": 0.0,
          "label": "Lots of overlap",
          "tone": "purple",
          "at": 13.0,
          "v2": 0.34,
          "out": 22.6,
          "below": true
        },
        {
          "v": 0.34,
          "from": 0.5,
          "label": "Imbalanced-looking",
          "tone": "gold",
          "at": 18.0,
          "v2": 0.8
        }
      ],
      "pills": [
        {
          "u": 0.75,
          "v": 0.55,
          "text": "PRICE MUST RETURN? MYTH",
          "tone": "down",
          "at": 28.5,
          "fs": 26
        }
      ]
    },
    {
      "type": "cards",
      "start": 38,
      "end": 56,
      "kicker": "Two words",
      "items": [
        {
          "title": "Imbalance",
          "desc": [
            "little two-sided",
            "trading"
          ],
          "tone": "gold",
          "at": 40.8
        },
        {
          "title": "FVG",
          "desc": [
            "one 3-candle",
            "measurement"
          ],
          "tone": "purple",
          "at": 44.2
        },
        {
          "title": "“Price must",
          "desc": [
            "return here”",
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
          "html": "Imbalance ≠ FVG. <span class=\"mark\">No must-return.</span>"
        }
      ],
      "lines": [
        {
          "at": 38.4,
          "text": "Two words, two meanings.",
          "screen": "\"Two words\""
        },
        {
          "at": 40.8,
          "text": "Imbalance: little two-sided trading.",
          "screen": "Imbalance little two-sided trading"
        },
        {
          "at": 44.2,
          "text": "An FVG: one specific three-candle measurement.",
          "screen": "FVG one 3-candle measurement"
        },
        {
          "at": 47.6,
          "text": "Price must return here? No.",
          "screen": "Price must return here"
        },
        {
          "at": 51.0,
          "text": "Imbalance isn’t an FVG. And nothing has to return."
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
          "text": "Imbalance ≠ FVG."
        },
        {
          "at": 58.6,
          "html": "<span class=\"mark\">No must-return.</span>"
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
          "text": "Imbalance is not an FVG. And price doesn’t have to return.",
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
        "text": "Does price have to come back to an imbalance?"
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
          "text": "Does price have to come back to an imbalance?",
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
