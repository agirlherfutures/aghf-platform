/**
 * Phase 6 · Section 17 · Lesson 24 intro video: "Maximum Trades & Frequency Risk"
 * Scenes: s17-plate-stack, s17-punch-card (see scenes-s17.js).
 */
window.LESSON_VIDEO = {
  "slug": "p6-lesson-24",
  "eyebrow": "Phase 6 · Section 17 · Lesson 24",
  "duration": 84,
  "sources": "From Phase 6, Section 17, Lesson 24 (\"Maximum Trades & Frequency Risk\"): 1R per trade, now add trades; \"I only risk 1%\" per what? per trade, so the day depends on how many (ten trades is up to 10%); $100 per trade, 6 full losses = −$600, so it needs a daily limit and a maximum number of trades; more trades can mean more commission, slippage, exposure, chances to deviate and potential cumulative loss; \"Risk per trade controls one decision. Maximum trades controls the day.\"",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 17: Protecting Your Account",
      "title": "Maximum Trades & Frequency Risk",
      "quote": "Maximum trades controls the day.",
      "lines": [
        {
          "at": 0.6,
          "text": "Welcome to Lesson Twenty-Four: Maximum Trades & Frequency Risk.",
          "screen": "Aristella waves; title *Maximum Trades & Frequency Risk*"
        },
        {
          "at": 5,
          "text": "Risk per trade is only half of the plan."
        }
      ]
    },
    {
      "type": "s17-plate-stack",
      "start": 8,
      "end": 35,
      "kicker": "Frequency as math",
      "beats": {
        "diner": 8.4,
        "plates": [
          15,
          16.2,
          17.4,
          18.6,
          19.8,
          21
        ],
        "six": 21.4,
        "formula": 25.6,
        "pct": 29.6
      },
      "headlines": [
        {
          "at": 8.4,
          "html": "“Only $100 <span class=\"mark\">per trade.</span>”",
          "out": 14.8
        },
        {
          "at": 15,
          "html": "Per trade <span class=\"mark\">≠ per day.</span>",
          "out": 25.4
        },
        {
          "at": 25.6,
          "html": "Exposure = <span class=\"mark\">risk × trades.</span>"
        }
      ],
      "lines": [
        {
          "at": 8.4,
          "text": "I only risk a hundred dollars per trade. Sounds careful, right?",
          "screen": "A diner: \"I only risk $100 per trade! 😇\""
        },
        {
          "at": 12.6,
          "text": "Per trade. Now add trades.",
          "screen": "A waiter with an empty tray"
        },
        {
          "at": 15,
          "text": "One full loss, a hundred. Two, two hundred. Three, four, five.",
          "screen": "Plates stack up, each −$100; the tally board counts"
        },
        {
          "at": 21.4,
          "text": "Six full losses: minus six hundred dollars in one day.",
          "screen": "TRADES 6 · DAY −$600; the stack wobbles: \"Wait, that’s −$600? 😳\""
        },
        {
          "at": 25.6,
          "text": "Exposure is risk per trade times the number of trades.",
          "screen": "exposure = risk per trade × trades"
        },
        {
          "at": 29.6,
          "text": "One percent per trade can become ten percent in a ten-trade day.",
          "screen": "1% × 10 trades = up to 10%"
        }
      ]
    },
    {
      "type": "s17-punch-card",
      "start": 35,
      "end": 62,
      "kicker": "Cap the trades",
      "beats": {
        "booth": 35.4,
        "card": 38.8,
        "punches": [
          42.6,
          43.4,
          44.2
        ],
        "friends": [
          46.8,
          48.2,
          49.4,
          51
        ],
        "fourth": 53.8,
        "done": 54.8
      },
      "headlines": [
        {
          "at": 35.4,
          "html": "Cap <span class=\"mark\">the trades.</span>",
          "out": 46.4
        },
        {
          "at": 46.6,
          "html": "More trades, <span class=\"mark\">more costs.</span>",
          "out": 53.6
        },
        {
          "at": 53.8,
          "html": "Card full. <span class=\"mark\">Day done.</span>"
        }
      ],
      "lines": [
        {
          "at": 35.4,
          "text": "That’s why the day needs a maximum number of trades.",
          "screen": "A fairground ride-pass booth and a little roller coaster"
        },
        {
          "at": 39,
          "text": "Decide it before the session. Say, three.",
          "screen": "The pass: MAX TRADES ○○○"
        },
        {
          "at": 41.8,
          "text": "Each trade gets punched. One. Two. Three.",
          "screen": "Three punches; a coaster ride after each"
        },
        {
          "at": 46.6,
          "text": "And each extra trade can bring friends: commission, slippage, more exposure,",
          "screen": "Gremlins hop in: commission, slippage, exposure"
        },
        {
          "at": 50.8,
          "text": "and more chances to deviate from your plan.",
          "screen": "deviation; more trades can mean more…"
        },
        {
          "at": 53.8,
          "text": "Card full? The day is done.",
          "screen": "\"One more ride? 🥺\" DAY DONE stamp"
        },
        {
          "at": 56.2,
          "text": "Risk per trade controls one decision. Maximum trades controls the day.",
          "screen": "\"Card’s full. Day’s done.\""
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
          "text": "Risk per trade: one decision."
        },
        {
          "at": 66.2,
          "html": "Maximum trades: <span class=\"mark\">the day.</span>"
        }
      ],
      "lines": [
        {
          "at": 62.2,
          "text": "Here’s what Dayli says.",
          "screen": "Aristella thinks"
        },
        {
          "at": 63.6,
          "text": "Risk per trade controls one decision. Maximum trades controls the day.",
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
        "text": "How many trades is my day allowed?"
      },
      "cta": {
        "at": 80,
        "text": "Let’s set the cap"
      },
      "lines": [
        {
          "at": 72.2,
          "text": "Your mission.",
          "screen": "\"Your mission\""
        },
        {
          "at": 74.4,
          "text": "Before the session, decide: how many trades is my day allowed?",
          "screen": "Mission question"
        },
        {
          "at": 80,
          "text": "Let’s set the cap.",
          "screen": "Aristella cheers; \"Let’s set the cap →\""
        }
      ]
    }
  ]
};
