/**
 * Strategy 2 · Module 1 · Lesson 9 intro video: "Supply vs. Demand"
 * Scenes: sd2-mirror-lake, sd2-weathervane-floor (see scenes-sd2.js).
 */
window.LESSON_VIDEO = {
  "slug": "sl-m1-9",
  "eyebrow": "Strategy 2 · Module 1 · Lesson 9",
  "duration": 84,
  "sources": "From Strategy 2, Module 1, Lesson 9 (\"Supply vs. Demand\", lessons-data/sl-m1-9.json): same sequence, mirrored; demand belongs to the bullish model, its zone is the last bearish candle of Correction #2 before BOS #3; supply belongs to the bearish model, its zone is the last bullish candle of Correction #2 before BOS #3; the higher-timeframe ICC direction tells you which one you’re looking for; for demand the lower boundary matters for invalidation, for supply the upper boundary; \"Read the story first. Then you’ll know which zone you’re hunting.\" Rules per strategy-lab/SUPPLY_DEMAND_MASTER.md §3 and §5 (\"If price violates the opposite boundary of the supply or demand zone, the setup is invalid. For demand, this concerns the lower boundary. For supply, this concerns the upper boundary.\"). Left out on purpose: wick vs candle close for invalidation (RULES_STATUS.md #2, needs confirmation) and the exact zone boundaries (#1, working rule).",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Strategy 2: Supply & Demand, Powered by Higher-Timeframe ICC™",
      "title": "Supply vs. Demand",
      "quote": "Same sequence, mirrored. Demand belongs to the bullish model, supply to the bearish one.",
      "lines": [
        {
          "at": 0.6,
          "text": "Welcome to Module One, Lesson Nine: Supply versus Demand.",
          "screen": "Aristella waves; title *Supply vs. Demand*"
        },
        {
          "at": 4.8,
          "text": "Same sequence, mirrored."
        }
      ]
    },
    {
      "type": "sd2-mirror-lake",
      "start": 8,
      "end": 34,
      "kicker": "Side by side",
      "beats": {
        "up": 8.4,
        "down": 10.6,
        "steps": 13.6,
        "dem": 19.6,
        "sup": 26.4,
        "same": 31.2
      },
      "headlines": [
        {
          "at": 8.4,
          "html": "Demand ≠ <span class=\"mark\">supply.</span>",
          "out": 31
        },
        {
          "at": 31.2,
          "html": "Same sequence. <span class=\"mark\">Mirrored.</span>"
        }
      ],
      "lines": [
        {
          "at": 8.4,
          "text": "Demand belongs to the bullish model. Supply belongs to the bearish model.",
          "screen": "A bullish 5M sequence on the bank (\"DEMAND · the bullish model\"); its reflection in the lake (\"SUPPLY · the bearish model\")"
        },
        {
          "at": 13.6,
          "text": "The steps don’t change. Only the direction does, like a reflection in a lake.",
          "screen": "\"BOS #2\" and \"BOS #3\" tagged on both charts"
        },
        {
          "at": 19.6,
          "text": "Demand: the last bearish candle of Correction two before BOS three, the third break of structure.",
          "screen": "Top chart: the last bearish candle ringed, its zone drawn: \"zone: last bearish candle\""
        },
        {
          "at": 26.4,
          "text": "Supply: the last bullish candle of Correction two before BOS three.",
          "screen": "Reflection: the last bullish candle ringed: \"zone: last bullish candle\""
        },
        {
          "at": 31.2,
          "text": "Same sequence. Mirrored.",
          "screen": "\"Same sequence. Mirrored.\""
        }
      ]
    },
    {
      "type": "sd2-weathervane-floor",
      "start": 34,
      "end": 62,
      "kicker": "Which one are you hunting?",
      "beats": {
        "house": 34.4,
        "spin": 38.8,
        "bull": 42,
        "bear": 43.4,
        "floor": 49.2,
        "ceil": 53.2,
        "inval": 57
      },
      "headlines": [
        {
          "at": 34.4,
          "html": "Read <span class=\"mark\">the story first.</span>",
          "out": 45
        },
        {
          "at": 45.2,
          "html": "Floor for demand. <span class=\"mark\">Ceiling for supply.</span>"
        }
      ],
      "lines": [
        {
          "at": 34.4,
          "text": "So which one are you hunting? Read the story first.",
          "screen": "A house with an \"HTF ICC\" sign and a weathervane; a DEMAND room and a SUPPLY room"
        },
        {
          "at": 38.8,
          "text": "The higher-timeframe ICC direction, or HTF ICC, tells you. Bullish means demand. Bearish means supply.",
          "screen": "The vane spins, points up: \"bullish → hunt demand\", then down: \"bearish → hunt supply\""
        },
        {
          "at": 45.2,
          "text": "Each zone has one boundary that matters for invalidation.",
          "screen": "Demand zone with price returning from above; supply zone with price returning from below"
        },
        {
          "at": 49.2,
          "text": "For demand, it’s the lower boundary, like a floor.",
          "screen": "\"lower boundary · the floor\", \"matters for invalidation\""
        },
        {
          "at": 53.2,
          "text": "For supply, it’s the upper boundary, like a ceiling. If price moves past it, the setup is invalid.",
          "screen": "\"upper boundary · the ceiling\"; price pushes up through it: INVALID stamp"
        }
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
        {
          "at": 63.4,
          "text": "Read the story first."
        },
        {
          "at": 66.2,
          "html": "Then you’ll know <span class=\"mark\">which zone you’re hunting.</span>"
        }
      ],
      "lines": [
        {
          "at": 62.2,
          "text": "Here’s the big takeaway.",
          "screen": "Aristella thinks"
        },
        {
          "at": 64.2,
          "text": "Read the story first. Then you’ll know which zone you’re hunting.",
          "screen": "Aristella points"
        }
      ]
    },
    {
      "type": "host-mission",
      "start": 72,
      "end": 84,
      "kicker": "Your mission",
      "question": {
        "at": 74.4,
        "text": "How does the higher-timeframe direction decide whether you look for supply or demand?"
      },
      "cta": {
        "at": 81,
        "text": "Let’s find out"
      },
      "lines": [
        {
          "at": 72.2,
          "text": "Your mission.",
          "screen": "\"Your mission\""
        },
        {
          "at": 74.4,
          "text": "Your question: how does the higher-timeframe direction decide whether you look for supply or demand?",
          "screen": "Mission question"
        },
        {
          "at": 81,
          "text": "Let’s find out.",
          "screen": "Aristella cheers; \"Let’s find out →\""
        }
      ]
    }
  ]
};
