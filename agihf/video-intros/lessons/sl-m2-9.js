/**
 * Strategy 2 · Module 2 · Lesson 9 intro video: "Missed Trades and No-Trade Decisions"
 * Scenes: sd4-boomerang (BOS #3 throws the boomerang: if it comes back to the zone, that’s the retest; if it flies off, you hold the dog’s leash and let it go), sd4-weather-board (fog between the previous 1H swing high and low, then the "stay out when…" board with four no-trade reasons) (see scenes-sd4.js).
 */
window.LESSON_VIDEO = {
  "slug": "sl-m2-9",
  "eyebrow": "Strategy 2 · Module 2 · Lesson 9",
  "duration": 84,
  "sources": "From Strategy 2, Module 2, Lesson 9 (\"Missed Trades and No-Trade Decisions\"): after BOS #3 you wait for price to return to the zone; when it returns, that’s the retest and the entry model can apply; if it never returns, it’s a missed trade, not a trade, so don’t chase (BOS #3 alone is never an entry); the 1H rule (Established): between the previous 1H swing high and low without meaningful directional confirmation, don’t force a trade; the no-trade list: between the 1H swings, sequence incomplete (no BOS #2 or BOS #3), zone invalidated (a 5M close beyond the far edge), no retest; Dayli: \"Missing a trade costs you nothing. Chasing one can.\" No wick rule and no limit-entry placement are stated (both need confirmation).",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Strategy 2: Supply & Demand, Powered by Higher-Timeframe ICC™",
      "title": "Missed Trades and No-Trade Decisions",
      "quote": "Not trading is a decision too. Know when price left without you, and when the chart never earned a trade.",
      "lines": [
        {
          "at": 0.6,
          "text": "Welcome to Module Two, Lesson Nine: Missed Trades and No-Trade Decisions.",
          "screen": "Aristella waves; title *Missed Trades and No-Trade Decisions*"
        },
        {
          "at": 5.6,
          "text": "No trade is a decision."
        }
      ]
    },
    {
      "type": "sd4-boomerang",
      "start": 8,
      "end": 34,
      "kicker": "Entry or missed trade?",
      "beats": {
        "chart": 8.4,
        "throw1": 9.8,
        "ret": 16.6,
        "throw2": 22,
        "missed": 26.6
      },
      "headlines": [
        {
          "at": 8.4,
          "html": "BOS #3 printed. <span class=\"mark\">Now wait.</span>",
          "out": 21.8
        },
        {
          "at": 22,
          "html": "No retest, <span class=\"mark\">no trade.</span>"
        }
      ],
      "lines": [
        {
          "at": 8.4,
          "text": "BOS number three has activated the demand zone. Now you wait for price to come back.",
          "screen": "5M chart: BOS #3, DEMAND ZONE · active; a thrower lets the boomerang fly: \"BOS #3: off it goes\""
        },
        {
          "at": 15.4,
          "text": "When price returns to the zone, that’s the retest, and the entry model can apply.",
          "screen": "Price comes back into the zone: retest; the boomerang returns to her hand"
        },
        {
          "at": 22,
          "text": "But sometimes price just keeps climbing and never comes back.",
          "screen": "A second ending: price climbs away; the boomerang flies off-screen"
        },
        {
          "at": 26.6,
          "text": "That’s a missed trade, not a trade. BOS number three alone isn’t an entry, so don’t chase.",
          "screen": "\"never came back: a missed trade\"; the dog strains on the leash: \"Let it go 🐾\"; DON’T CHASE"
        }
      ]
    },
    {
      "type": "sd4-weather-board",
      "start": 34,
      "end": 62,
      "kicker": "Your no-trade list",
      "beats": {
        "chart": 34.4,
        "lines": 39.4,
        "fog": 41,
        "board": 44.4,
        "rows": [
          45,
          48.8,
          50.2,
          51.8
        ],
        "calm": 53.8
      },
      "headlines": [
        {
          "at": 34.4,
          "html": "Between the 1H swings? <span class=\"mark\">Don’t force it.</span>",
          "out": 47
        },
        {
          "at": 47.2,
          "html": "Four reasons <span class=\"mark\">to stay out.</span>"
        }
      ],
      "lines": [
        {
          "at": 34.4,
          "text": "Before any 5M sequence, check where price sits on the 1H.",
          "screen": "1H chart; a dot: now"
        },
        {
          "at": 39.4,
          "text": "Stuck between the previous 1H swing high and low, with no meaningful directional confirmation? Don’t force a trade.",
          "screen": "Dashed lines: previous 1H swing high / low; fog between them: \"no meaningful directional confirmation\", \"don’t force a trade\""
        },
        {
          "at": 47.2,
          "text": "Stay out when the sequence is incomplete, the zone is invalidated, or price never retests.",
          "screen": "Board \"STAY OUT WHEN…\": between the 1H swings · sequence incomplete · zone invalidated · no retest"
        },
        {
          "at": 53.8,
          "text": "Each one is a confident no-trade decision, and missing a trade is part of the strategy.",
          "screen": "Tea and a sleeping cat: \"no trade = a decision ✓\""
        }
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
        {
          "at": 64.2,
          "text": "Missing a trade costs you nothing."
        },
        {
          "at": 66.4,
          "html": "<span class=\"mark\">Chasing one can.</span>"
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
          "text": "Missing a trade costs you nothing. Chasing one can.",
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
        "at": 76,
        "text": "Why is a missed retest not a trade?"
      },
      "cta": {
        "at": 80.4,
        "text": "Let’s find out"
      },
      "lines": [
        {
          "at": 72.2,
          "text": "Practise telling an entry from a missed trade.",
          "screen": "\"Your mission\""
        },
        {
          "at": 76,
          "text": "Ask yourself: why is a missed retest not a trade?",
          "screen": "Mission question"
        },
        {
          "at": 80.4,
          "text": "Let’s find out.",
          "screen": "Aristella cheers; \"Let's find out →\""
        }
      ]
    }
  ]
};
