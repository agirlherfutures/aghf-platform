/**
 * Phase 2 · Section 2 · Lesson 14 intro video — "Retracement vs. Reversal"
 */
window.LESSON_VIDEO = {
  "slug": "p2-lesson-14",
  "eyebrow": "Phase 2 · Section 2 · Lesson 14",
  "duration": 88,
  "sources": "From Section 2, Lesson 14 (\"Retracement vs. Reversal\"): Scenario A (the supporting swing holds: possible retracement), Scenario B (the supporting swing breaks and a lower high and lower low form: potential reversal / structural transition), levels not candle color, and the direction of the current move is not always the direction of the larger structure.",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 2: Breaks, Shifts & Fakeouts",
      "title": "Retracement vs. Reversal",
      "quote": "Levels decide it. Not candle color.",
      "lines": [
        {
          "at": 0.6,
          "text": "Welcome to Lesson Fourteen: Retracement versus Reversal.",
          "screen": "Aristella waves; title *Retracement vs. Reversal*"
        },
        {
          "at": 4.6,
          "text": "A big move down isn’t automatically a reversal."
        }
      ]
    },
    {
      "type": "break-chart",
      "start": 8,
      "end": 30,
      "seed": 14,
      "kicker": "Scenario A",
      "swings": [
        [
          0,
          0.1
        ],
        [
          0.14,
          0.5
        ],
        [
          0.24,
          0.3
        ],
        [
          0.38,
          0.75
        ],
        [
          0.48,
          0.42
        ],
        [
          0.6,
          0.92
        ],
        [
          0.76,
          0.5
        ],
        [
          0.9,
          0.8
        ]
      ],
      "per": [
        4,
        3,
        4,
        3,
        4,
        6,
        4
      ],
      "play": [
        {
          "to": 5,
          "at": 8.6,
          "dur": 3.0
        },
        {
          "to": 6,
          "at": 13.5,
          "dur": 2.2
        },
        {
          "to": 7,
          "at": 21.0,
          "dur": 1.6
        }
      ],
      "levels": [
        {
          "v": 0.42,
          "from": 0.48,
          "label": "Supporting HL",
          "tone": "up",
          "at": 10.6,
          "below": true
        }
      ],
      "marks": [
        {
          "i": 6,
          "text": "new HL",
          "tone": "up",
          "at": 22.8,
          "below": true
        }
      ],
      "pills": [
        {
          "u": 0.3,
          "v": 0.97,
          "text": "POSSIBLE RETRACEMENT",
          "tone": "up",
          "at": 24.2
        }
      ],
      "headlines": [
        {
          "at": 8.4,
          "html": "A big move down. <span class=\"mark\">Reversal?</span>"
        }
      ],
      "lines": [
        {
          "at": 8.4,
          "text": "Scenario A. Bullish structure, with the supporting higher low marked.",
          "screen": "Candles build; Supporting HL"
        },
        {
          "at": 13.5,
          "text": "Then a run of red candles. A big move down."
        },
        {
          "at": 17.2,
          "text": "But it never closes through the supporting low."
        },
        {
          "at": 21.0,
          "text": "Price turns back up and forms a new higher low.",
          "screen": "\"new HL\""
        },
        {
          "at": 24.2,
          "text": "That reads as a possible retracement.",
          "screen": "\"POSSIBLE RETRACEMENT\""
        }
      ]
    },
    {
      "type": "break-chart",
      "start": 30,
      "end": 54,
      "seed": 15,
      "kicker": "Scenario B",
      "swings": [
        [
          0,
          0.1
        ],
        [
          0.14,
          0.5
        ],
        [
          0.24,
          0.3
        ],
        [
          0.38,
          0.75
        ],
        [
          0.48,
          0.42
        ],
        [
          0.6,
          0.92
        ],
        [
          0.7,
          0.55
        ],
        [
          0.75,
          0.32
        ],
        [
          0.83,
          0.58
        ],
        [
          0.93,
          0.18
        ]
      ],
      "per": [
        4,
        3,
        4,
        3,
        4,
        3,
        2,
        3,
        4
      ],
      "play": [
        {
          "to": 5,
          "at": 30.6,
          "dur": 2.6
        },
        {
          "to": 7,
          "at": 35.0,
          "dur": 1.6
        },
        {
          "to": 8,
          "at": 40.5,
          "dur": 1.2
        },
        {
          "to": 9,
          "at": 45.5,
          "dur": 1.4
        }
      ],
      "levels": [
        {
          "v": 0.42,
          "from": 0.48,
          "label": "Supporting HL",
          "tone": "up",
          "at": 31.0,
          "below": true
        },
        {
          "v": 0.32,
          "from": 0.75,
          "label": "New low",
          "tone": "down",
          "at": 38.4,
          "below": true
        }
      ],
      "marks": [
        {
          "i": 8,
          "text": "LH",
          "tone": "down",
          "at": 42.0
        }
      ],
      "pills": [
        {
          "u": 0.3,
          "v": 0.97,
          "text": "POTENTIAL REVERSAL",
          "tone": "down",
          "at": 47.6
        },
        {
          "u": 0.3,
          "v": 0.85,
          "text": "structural transition",
          "tone": "purple",
          "at": 48.6,
          "fs": 24
        }
      ],
      "headlines": [
        {
          "at": 30.4,
          "html": "Same start. <span class=\"mark\">Different levels.</span>"
        }
      ],
      "lines": [
        {
          "at": 30.4,
          "text": "Scenario B. Same start.",
          "screen": "Same chart"
        },
        {
          "at": 35.0,
          "text": "This time price closes through the supporting low."
        },
        {
          "at": 40.5,
          "text": "It bounces, but only makes a lower high.",
          "screen": "\"LH\""
        },
        {
          "at": 45.5,
          "text": "Then it closes below the new low."
        },
        {
          "at": 47.6,
          "text": "That’s a potential reversal: a structural transition.",
          "screen": "\"POTENTIAL REVERSAL\""
        }
      ]
    },
    {
      "type": "cards",
      "start": 54,
      "end": 68,
      "kicker": "Keep these separate",
      "items": [
        {
          "title": "Current move",
          "desc": [
            "what price is",
            "doing right now"
          ],
          "tone": "gold",
          "at": 56.0
        },
        {
          "title": "Larger structure",
          "desc": [
            "what the relevant",
            "swings show"
          ],
          "tone": "purple",
          "at": 58.4
        }
      ],
      "headlines": [
        {
          "at": 61.2,
          "html": "Current move <span class=\"mark\">≠ larger structure.</span>"
        }
      ],
      "lines": [
        {
          "at": 54.4,
          "text": "So keep two things separate.",
          "screen": "\"Keep these separate\""
        },
        {
          "at": 56.0,
          "text": "The direction of the current move,",
          "screen": "Current move"
        },
        {
          "at": 58.4,
          "text": "and the direction of the larger structure.",
          "screen": "Larger structure"
        },
        {
          "at": 61.2,
          "text": "They aren’t always the same."
        }
      ]
    },
    {
      "type": "host-hook",
      "start": 68,
      "end": 76,
      "pointAt": 70.4,
      "size": 72,
      "kicker": "Dayli says",
      "parts": [
        {
          "at": 69.2,
          "text": "Levels decide it."
        },
        {
          "at": 70.4,
          "html": "<span class=\"mark\">Not candle color.</span> 👀"
        }
      ],
      "lines": [
        {
          "at": 68.4,
          "text": "So remember.",
          "screen": "Aristella thinks"
        },
        {
          "at": 69.2,
          "text": "Levels decide it. Not candle color.",
          "screen": "Aristella points"
        }
      ]
    },
    {
      "type": "host-mission",
      "start": 76,
      "end": 88,
      "kicker": "Your mission",
      "question": {
        "at": 78,
        "text": "Price dropped hard. Retracement or reversal?"
      },
      "cta": {
        "at": 83.5,
        "text": "Let’s find out"
      },
      "lines": [
        {
          "at": 76.4,
          "text": "So here’s your mission for this lesson.",
          "screen": "\"Your mission\""
        },
        {
          "at": 78,
          "text": "Price dropped hard. Retracement or reversal?",
          "screen": "Mission question"
        },
        {
          "at": 83.5,
          "text": "Let’s find out.",
          "screen": "Aristella cheers; \"Let's find out →\""
        }
      ]
    }
  ]
};
