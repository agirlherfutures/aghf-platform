/**
 * Phase 3 · Section 7 · Lesson 2 intro video: "Buy-Side & Sell-Side"
 * Scenes: host-title, s7-balloons-anchors, s7-street-signs, host-hook, host-mission (scene art in scenes-s7.js).
 */
window.LESSON_VIDEO = {
  "slug": "p3-lesson-2",
  "eyebrow": "Phase 3 · Section 7 · Lesson 2",
  "duration": 84,
  "sources": "From Section 7, Lesson 2 (\"Buy-Side & Sell-Side\"): above highs is buy-side liquidity (short stops, breakout buys), below lows is sell-side liquidity (long stops, breakdown sells), and it describes where orders may rest, not where price must go (\"Not a destination\").",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 7: Understanding Liquidity",
      "title": "Buy-Side & Sell-Side",
      "quote": "Above highs: buy-side. Below lows: sell-side.",
      "lines": [
        {
          "at": 0.6,
          "text": "Welcome to Lesson Two: Buy-Side and Sell-Side.",
          "screen": "Aristella waves; title *Buy-Side & Sell-Side*"
        },
        {
          "at": 4.8,
          "text": "Two sides of every range."
        }
      ]
    },
    {
      "type": "s7-balloons-anchors",
      "start": 8,
      "end": 34,
      "kicker": "Two sides of the range",
      "headlines": [
        {
          "at": 8.4,
          "out": 27.8,
          "html": "Above highs. Below lows. <span class=\"mark\">Two sides.</span>"
        },
        {
          "at": 28,
          "html": "Named after <span class=\"mark\">the orders.</span>"
        }
      ],
      "lines": [
        {
          "at": 8.4,
          "text": "Here’s a range: a high and a low, with price moving between them.",
          "screen": "A range draws; price swings inside it"
        },
        {
          "at": 12.8,
          "text": "Above the highs: buy-side liquidity. Short stops and breakout buys, floating up there like balloons.",
          "screen": "Balloons rise above the high; BUY-SIDE ↑"
        },
        {
          "at": 20.4,
          "text": "Below the lows: sell-side liquidity. Long stops and breakdown sells, hanging down there like anchors.",
          "screen": "Anchors drop below the low; SELL-SIDE ↓"
        },
        {
          "at": 28.2,
          "text": "It’s named after the orders that may rest there: buy orders above, sell orders below.",
          "screen": "A bird flies past; balloons and anchors pulse"
        }
      ]
    },
    {
      "type": "s7-street-signs",
      "start": 34,
      "end": 60,
      "kicker": "Read the map",
      "headlines": [
        {
          "at": 34.4,
          "out": 48.8,
          "html": "Does it tell you <span class=\"mark\">where price goes?</span>"
        },
        {
          "at": 49,
          "html": "Describes orders. <span class=\"mark\">Not a destination.</span>"
        }
      ],
      "lines": [
        {
          "at": 34.4,
          "text": "Here’s where people trip up.",
          "screen": "A walker and her dog reach a park map"
        },
        {
          "at": 36.6,
          "text": "You see buy-side above the highs and think: price has to go up there.",
          "screen": "\"So price has to go up there?\""
        },
        {
          "at": 42.6,
          "text": "But look again. That map shows where orders may rest.",
          "screen": "BUY-SIDE and SELL-SIDE zones glow"
        },
        {
          "at": 46.4,
          "text": "It doesn’t draw your route. Price might go up, go down, or keep ranging.",
          "screen": "Three dotted paths, each with a question mark"
        },
        {
          "at": 51.6,
          "text": "Buy-side and sell-side describe orders. They aren’t destinations.",
          "screen": "Stamp: NOT A DESTINATION"
        },
        {
          "at": 55.8,
          "text": "A map, not a route.",
          "screen": "A park ranger: \"It’s a map, not a route!\""
        }
      ]
    },
    {
      "type": "host-hook",
      "start": 60,
      "end": 71,
      "pointAt": 63.8,
      "size": 64,
      "kicker": "Dayli says",
      "parts": [
        {
          "at": 61.2,
          "text": "Above highs: buy-side. Below lows: sell-side."
        },
        {
          "at": 63.8,
          "html": "<span class=\"mark\">Not a destination.</span>"
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
          "text": "Above highs, buy-side. Below lows, sell-side. And neither one is a destination.",
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
        "text": "Does buy-side above a high mean price has to go up?"
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
          "text": "Does buy-side above a high mean price has to go up?",
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
