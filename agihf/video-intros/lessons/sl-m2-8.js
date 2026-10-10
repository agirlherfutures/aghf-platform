/**
 * Strategy 2 · Module 2 · Lesson 8 intro video: "Recognizing Invalid Setups"
 * Scenes: sd4-thin-ice (the active demand zone is ice; a 5M close below its low breaks through, and coming back later doesn’t mend it; then the supply mirror), sd4-missing-plank (a bridge of steps with a missing plank: no BOS #2, or no BOS #3, means you can’t cross) (see scenes-sd4.js).
 */
window.LESSON_VIDEO = {
  "slug": "sl-m2-8",
  "eyebrow": "Strategy 2 · Module 2 · Lesson 8",
  "duration": 84,
  "sources": "From Strategy 2, Module 2, Lesson 8 (\"Recognizing Invalid Setups\"): after BOS #3, a 5M candle closing beyond the zone’s far edge makes the setup invalid (for demand the far edge is the zone’s low, for supply the zone’s high); if price returns to an invalidated zone, it’s still not an entry; if BOS #2 or BOS #3 never happens, the sequence is incomplete (no BOS #2: no Correction #2, no zone; no BOS #3: the potential zone never activates, and a return to it is not a retest); \"Invalid or incomplete = no trade\"; Dayli: \"A dead zone doesn’t come back to life. Let it go.\" Wick vs close invalidation is not settled (RULES_STATUS rule 2, needs confirmation), so the video only shows clear invalidations, a 5M candle CLOSING beyond the far edge, which is invalid under either reading, and states no wick rule. Zone boundaries are a working rule, so no numbers are shown.",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Strategy 2: Supply & Demand, Powered by Higher-Timeframe ICC™",
      "title": "Recognizing Invalid Setups",
      "quote": "Not every setup becomes a trade. Some fail after BOS #3, and some never finish.",
      "lines": [
        {
          "at": 0.6,
          "text": "Welcome to Module Two, Lesson Eight: Recognizing Invalid Setups.",
          "screen": "Aristella waves; title *Recognizing Invalid Setups*"
        },
        {
          "at": 5,
          "text": "Knowing when to walk away."
        }
      ]
    },
    {
      "type": "sd4-thin-ice",
      "start": 8,
      "end": 34,
      "kicker": "Invalidated",
      "beats": {
        "chart": 8.4,
        "pull": 13,
        "inv": 15,
        "dead": 20.4,
        "back": 21,
        "sup": 27.8
      },
      "headlines": [
        {
          "at": 8.4,
          "html": "A close below the zone <span class=\"mark\">ends it.</span>",
          "out": 20.2
        },
        {
          "at": 20.4,
          "html": "A dead zone <span class=\"mark\">stays dead.</span>",
          "out": 27.6
        },
        {
          "at": 27.8,
          "html": "Supply: <span class=\"mark\">a close above.</span>"
        }
      ],
      "lines": [
        {
          "at": 8.4,
          "text": "BOS number three has activated this demand zone. Watch what happens next.",
          "screen": "5M chart: BOS #3, DEMAND ZONE · active; a pond with an ice sheet: DEMAND ZONE · active"
        },
        {
          "at": 13.8,
          "text": "A 5M candle closes below the zone’s low, its far edge. The setup is invalid.",
          "screen": "A bearish candle closes below the zone: \"closed below the zone\"; INVALID; the ice cracks and the candle falls through"
        },
        {
          "at": 20.4,
          "text": "Later, price drifts back into the old zone. It’s a dead zone now. Still not an entry.",
          "screen": "Sign: DEAD ZONE · no entry; \"back inside the old zone\"; \"a dead zone · still not an entry\""
        },
        {
          "at": 27.8,
          "text": "For supply, it’s mirrored: a close above the zone’s high.",
          "screen": "Supply mirror chart: \"closed above the zone\"; INVALID; \"far edge = the zone’s high\""
        }
      ]
    },
    {
      "type": "sd4-missing-plank",
      "start": 34,
      "end": 62,
      "kicker": "Incomplete",
      "beats": {
        "intro": 34.4,
        "case1": 37.4,
        "stop1": 41.6,
        "case2": 44,
        "stop2": 49.4,
        "notRetest": 51.8,
        "stamp": 55
      },
      "headlines": [
        {
          "at": 34.4,
          "html": "Some setups <span class=\"mark\">never finish.</span>",
          "out": 51.6
        },
        {
          "at": 51.8,
          "html": "Invalid or incomplete <span class=\"mark\">= no trade.</span>"
        }
      ],
      "lines": [
        {
          "at": 34.4,
          "text": "Some setups never finish at all.",
          "screen": "A rope bridge of planks: BOS #1, Correction #1, BOS #2, Correction #2, BOS #3, Retest"
        },
        {
          "at": 37.4,
          "text": "If BOS number two never happens, there’s no second correction, no zone, and no trade.",
          "screen": "Bearish chart: Correction #1, then no close below; the walker stops at the gap: \"no BOS #2 · no zone · no trade\""
        },
        {
          "at": 44,
          "text": "If the second correction leaves a potential zone but BOS number three never comes, the zone never activates.",
          "screen": "Bullish chart: potential zone (dashed); \"no close above → no BOS #3\"; \"no BOS #3 · the zone never activates\""
        },
        {
          "at": 51.8,
          "text": "Price trading back into it isn’t a retest. Invalid or incomplete means no trade.",
          "screen": "\"back in the zone ≠ a retest ✗\"; stamp: NO TRADE"
        },
        {
          "at": 57.8,
          "text": "Knowing when to walk away is part of the strategy.",
          "screen": "\"invalid or incomplete = no trade\""
        }
      ]
    },
    {
      "type": "host-hook",
      "start": 62,
      "end": 72,
      "pointAt": 67.2,
      "size": 52,
      "kicker": "Dayli says",
      "parts": [
        {
          "at": 64.2,
          "text": "A dead zone doesn’t come back to life."
        },
        {
          "at": 67.2,
          "html": "<span class=\"mark\">Let it go.</span>"
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
          "text": "A dead zone doesn’t come back to life. Let it go.",
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
        "text": "When does a zone stop being an entry opportunity?"
      },
      "cta": {
        "at": 81.2,
        "text": "Let’s find out"
      },
      "lines": [
        {
          "at": 72.2,
          "text": "Your job now: spot the setups that fail.",
          "screen": "\"Your mission\""
        },
        {
          "at": 76,
          "text": "Ask yourself: when does a zone stop being an entry opportunity?",
          "screen": "Mission question"
        },
        {
          "at": 81.2,
          "text": "Let’s find out.",
          "screen": "Aristella cheers; \"Let's find out →\""
        }
      ]
    }
  ]
};
