/**
 * Phase 6 · Section 17 · Lesson 19 intro video: "Position Sizing from Risk"
 * Scenes: s17-moving-truck, s17-height-bar (see scenes-s17.js).
 */
window.LESSON_VIDEO = {
  "slug": "p6-lesson-19",
  "eyebrow": "Phase 6 · Section 17 · Lesson 19",
  "duration": 84,
  "sources": "From Phase 6, Section 17, Lesson 19 (\"Position Sizing from Risk\"): max planned risk e.g. $150, stop e.g. 25 MNQ points, risk of one contract 25 × $2 = $50, $150 ÷ $50 = 3 whole contracts; floor it, never round up; the stop changed so the size may need to change; $50 cap with a 30-point stop: no whole contract fits, no trade; the A+ setup trap: the account’s risk cap didn’t change, \"Confidence isn’t capacity\"; \"Setup confidence does not override the risk ceiling.\"; Dayli: \"If no whole contract fits, the trade doesn’t fit the plan. The stop doesn’t shrink to make it fit.\"",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 17: Protecting Your Account",
      "title": "Position Sizing from Risk",
      "quote": "Setup confidence does not override the risk ceiling.",
      "lines": [
        {
          "at": 0.6,
          "text": "Welcome to Lesson Nineteen: Position Sizing from Risk.",
          "screen": "Aristella waves; title *Position Sizing from Risk*"
        },
        {
          "at": 5,
          "text": "Today we flip the order: risk first, then size."
        }
      ]
    },
    {
      "type": "s17-moving-truck",
      "start": 8,
      "end": 35,
      "kicker": "Reverse it",
      "beats": {
        "truck": 8.4,
        "cap": 11.6,
        "box": 15.6,
        "loads": [
          19.4,
          20.4,
          21.4
        ],
        "fourth": 24,
        "phase2": 28,
        "nofit": 29.2
      },
      "headlines": [
        {
          "at": 8.4,
          "html": "Risk first. <span class=\"mark\">Size second.</span>",
          "out": 23.8
        },
        {
          "at": 24,
          "html": "Floor it. <span class=\"mark\">Never round up.</span>",
          "out": 27.8
        },
        {
          "at": 28,
          "html": "No fit = <span class=\"mark\">no trade.</span>"
        }
      ],
      "lines": [
        {
          "at": 8.4,
          "text": "Reverse it. Choose the risk first, then the size.",
          "screen": "A moving truck and a mover with a pile of boxes"
        },
        {
          "at": 11.6,
          "text": "Say your max planned risk is a hundred fifty dollars: the load limit.",
          "screen": "Roof gauge: RISK CAP $150"
        },
        {
          "at": 16.2,
          "text": "Twenty-five points on MNQ: about fifty dollars per contract.",
          "screen": "Boxes: $50 (25 pts × $2)"
        },
        {
          "at": 19.4,
          "text": "One, two, three. A hundred fifty divided by fifty: three contracts.",
          "screen": "Three boxes fly in; $150 / $150; ÷ $50 = 3 contracts"
        },
        {
          "at": 24,
          "text": "A fourth won’t fit. You floor it. You never round up.",
          "screen": "The fourth box bounces out: floor it, never round up"
        },
        {
          "at": 28,
          "text": "Cap of fifty, thirty-point stop? Sixty per contract. Nothing fits, so no trade.",
          "screen": "A $60 box can’t fit a $50 cap: no fit = no trade; squirrel: \"Shrink the stop?\" never shrink the stop"
        }
      ]
    },
    {
      "type": "s17-height-bar",
      "start": 35,
      "end": 62,
      "kicker": "The A+ setup trap",
      "beats": {
        "gate": 35.4,
        "car": 37.4,
        "clank": 41.6,
        "ask": 42.8,
        "no": 46.2,
        "unload": 49.6,
        "through": 52,
        "punch": 56.4
      },
      "headlines": [
        {
          "at": 35.4,
          "html": "Double size <span class=\"mark\">for A+?</span>",
          "out": 46
        },
        {
          "at": 46.2,
          "html": "Confidence <span class=\"mark\">isn’t capacity.</span>"
        }
      ],
      "lines": [
        {
          "at": 35.4,
          "text": "Now, the A-plus setup trap.",
          "screen": "A garage marked THE ACCOUNT, with a height bar: RISK CEILING $150"
        },
        {
          "at": 37.4,
          "text": "This setup is beautiful. Surely it deserves double size?",
          "screen": "An A+ car rolls in with ×2 boxes on the roof"
        },
        {
          "at": 42.8,
          "text": "Here’s the question: did the account’s risk cap change?",
          "screen": "CLANK! The attendant: \"Did the cap change?\""
        },
        {
          "at": 46.2,
          "text": "No. The account sets the ceiling, not the setup.",
          "screen": "Driver: \"…no. 😅\""
        },
        {
          "at": 49.6,
          "text": "So the extra size comes off, and the trade goes in at the size that fits.",
          "screen": "The ×2 boxes come off; the car drives under the bar"
        },
        {
          "at": 56.4,
          "text": "Setup confidence does not override the risk ceiling.",
          "screen": "confidence isn’t capacity"
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
          "text": "If no whole contract fits,"
        },
        {
          "at": 66.2,
          "html": "the trade <span class=\"mark\">doesn’t fit the plan.</span>"
        }
      ],
      "lines": [
        {
          "at": 62.2,
          "text": "Dayli says:",
          "screen": "Aristella thinks"
        },
        {
          "at": 63.6,
          "text": "If no whole contract fits, the trade doesn’t fit the plan. The stop doesn’t shrink to make it fit.",
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
        "text": "Risk first: how many whole contracts fit?"
      },
      "cta": {
        "at": 80,
        "text": "Let’s size it"
      },
      "lines": [
        {
          "at": 72.2,
          "text": "Your mission.",
          "screen": "\"Your mission\""
        },
        {
          "at": 74.4,
          "text": "Before you pick a size, ask: risk first, how many whole contracts fit?",
          "screen": "Mission question"
        },
        {
          "at": 80,
          "text": "Let’s size it.",
          "screen": "Aristella cheers; \"Let’s size it →\""
        }
      ]
    }
  ]
};
