/**
 * Strategy 2 · Module 1 · Lesson 10 intro video: "Bringing the Full Sequence Together"
 * Scenes: sd2-board-game, sd2-stamp-card (see scenes-sd2.js).
 */
window.LESSON_VIDEO = {
  "slug": "sl-m1-10",
  "eyebrow": "Strategy 2 · Module 1 · Lesson 10",
  "duration": 84,
  "sources": "From Strategy 2, Module 1, Lesson 10 (\"Bringing the Full Sequence Together\", lessons-data/sl-m1-10.json): every part in order on one bearish chart; the higher-timeframe story is bearish, so you look for supply; BOS #1: a 15M candle close through (below) the 15M level, in the direction of the higher-timeframe story; Correction #1: a 5M bounce, preferably back toward the original 15M break; BOS #2: a 5M close below the low Correction #1 pulled back from; Correction #2 creates the zone from its last bullish candle; BOS #3: a 5M close below the low Correction #2 pulled back from, it activates the zone; then wait for price to return to the zone, don’t chase; \"3 BREAKS. 2 CORRECTIONS. 1 ZONE. 1 RETEST.\"; \"Every step earns the next one. Skip one and there’s no trade.\" Rules per strategy-lab/SUPPLY_DEMAND_MASTER.md §2–4. Left out on purpose: limit-entry placement at the zone (RULES_STATUS.md #5, needs confirmation) and zone boundaries (#1, working rule).",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Strategy 2: Supply & Demand, Powered by Higher-Timeframe ICC™",
      "title": "Bringing the Full Sequence Together",
      "quote": "Every part you’ve learned, in order, on one bearish chart.",
      "lines": [
        {
          "at": 0.6,
          "text": "Welcome to Module One, Lesson Ten: Bringing the Full Sequence Together.",
          "screen": "Aristella waves; title *Bringing the Full Sequence Together*"
        },
        {
          "at": 5.4,
          "text": "Every step, in order."
        }
      ]
    },
    {
      "type": "sd2-board-game",
      "start": 8,
      "end": 34,
      "kicker": "The full sequence",
      "beats": {
        "board": 8.4,
        "sign": 8.8,
        "pawn": 13.6,
        "counts": [
          19.4,
          21.6,
          22.4,
          23.2
        ],
        "hops": [
          24.4,
          25,
          25.6,
          26.2,
          26.8,
          27.4
        ],
        "skip": 28.8,
        "no": 30.6
      },
      "headlines": [
        {
          "at": 8.4,
          "html": "Six steps. <span class=\"mark\">In this order.</span>",
          "out": 28.6
        },
        {
          "at": 28.8,
          "html": "Skip one, <span class=\"mark\">no trade.</span>"
        }
      ],
      "lines": [
        {
          "at": 8.4,
          "text": "The higher-timeframe story is bearish, so you’re looking for supply.",
          "screen": "A game board; sign: \"HTF STORY: BEARISH ↓ look for supply\""
        },
        {
          "at": 13.2,
          "text": "Think of a board game: six squares, in order. Each one earns the next.",
          "screen": "Six squares: BOS #1 · Correction #1 · BOS #2 · Correction #2 · BOS #3 · Retest"
        },
        {
          "at": 19.2,
          "text": "Three breaks of structure, or BOS. Two corrections. One zone. One retest.",
          "screen": "\"3 BREAKS\" \"2 CORRECTIONS\" \"1 ZONE\" \"1 RETEST\"; the squares light up"
        },
        {
          "at": 24.4,
          "text": "Land on a square only when its requirement is met.",
          "screen": "The pawn hops square by square, each one ticked"
        },
        {
          "at": 28.8,
          "text": "Skip one, and there’s no trade.",
          "screen": "A pink pawn skips a square: \"skipped ✗\", NO TRADE stamp"
        }
      ]
    },
    {
      "type": "sd2-stamp-card",
      "start": 34,
      "end": 62,
      "kicker": "One bearish chart",
      "beats": {
        "m15": 34.4,
        "bos1": 37,
        "m5": 38.8,
        "c1": 39.6,
        "bos2": 42.6,
        "c2": 47.4,
        "zone": 49.4,
        "bos3": 53.2,
        "active": 56,
        "retest": 57.8,
        "chase": 59.6
      },
      "headlines": [
        {
          "at": 34.4,
          "html": "A bearish sequence, <span class=\"mark\">start to finish.</span>"
        }
      ],
      "lines": [
        {
          "at": 34.4,
          "text": "BOS one: a 15M candle closes below the 15M level.",
          "screen": "15M chart: \"15M level\"; a candle closes below it: \"BOS #1 · 15M close\"; card: first BREAK stamped"
        },
        {
          "at": 38.8,
          "text": "Correction one bounces up on the 5M. Then BOS two: a 5M close below the low it pulled back from.",
          "screen": "5M chart: \"Correction #1\" bounce, then \"BOS #2\"; card stamps"
        },
        {
          "at": 47.2,
          "text": "Correction two creates the zone, from its last bullish candle.",
          "screen": "\"Correction #2\"; its last bullish candle ringed: \"potential supply zone\""
        },
        {
          "at": 51.6,
          "text": "BOS three, a 5M close below the low Correction two pulled back from, activates it.",
          "screen": "\"BOS #3\"; \"active supply zone ✓\""
        },
        {
          "at": 58,
          "text": "Then wait for the retest. Don’t chase.",
          "screen": "Price returns to the zone: \"retest\"; \"no return? don’t chase\"; the card is complete"
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
          "text": "Every step earns the next one."
        },
        {
          "at": 66.2,
          "html": "Skip one and <span class=\"mark\">there’s no trade.</span>"
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
          "text": "Every step earns the next one. Skip one and there’s no trade.",
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
        "text": "What does each step of the sequence require before the next one counts?"
      },
      "cta": {
        "at": 80.8,
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
          "text": "Your question: what does each step of the sequence require before the next one counts?",
          "screen": "Mission question"
        },
        {
          "at": 80.8,
          "text": "Let’s find out.",
          "screen": "Aristella cheers; \"Let’s find out →\""
        }
      ]
    }
  ]
};
