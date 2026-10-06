/**
 * Phase 5 · Section 13 · Lesson 20 intro video: "Missed Retest = Missed Trade"
 * Scenes: s13-elevator, s13-fridge-cards (see scenes-s13.js).
 */
window.LESSON_VIDEO = {
  "slug": "p5-lesson-20",
  "eyebrow": "Phase 5 · Section 13 · Lesson 20",
  "duration": 84,
  "sources": "From Phase 5, Section 13, Lesson 20 (\"Missed Retest = Missed Trade\"), Scenario A: ICC completes and price runs with no retest; Scenario B: the retest happened and you missed it; setup valid + entry missed ≠ setup invalid; never chase, chasing creates a new rule after price moved; \"A missed trade is not a bad trade. It’s just a trade you didn’t get.\"",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 13: The Dayli ICC 1-Minute Entry Model™",
      "title": "Missed Retest = Missed Trade",
      "quote": "A missed trade is not a bad trade.",
      "lines": [
        {
          "at": 0.6,
          "text": "Welcome to Lesson Twenty: Missed Retest = Missed Trade.",
          "screen": "Aristella waves; title *Missed Retest = Missed Trade*"
        },
        {
          "at": 5,
          "text": "What happens when you miss it?"
        }
      ]
    },
    {
      "type": "s13-elevator",
      "start": 8,
      "end": 34,
      "kicker": "The retest happened",
      "beats": {
        "lobby": 8.4,
        "ding": 12.8,
        "arrive": 15.8,
        "close": 17.6,
        "jam": 20.4,
        "stop": 25,
        "gone": 28.2
      },
      "headlines": [
        {
          "at": 8.4,
          "html": "The retest <span class=\"mark\">happened without you.</span>",
          "out": 24.8
        },
        {
          "at": 25,
          "html": "Missed retest = <span class=\"mark\">missed trade.</span>"
        }
      ],
      "lines": [
        {
          "at": 8.4,
          "text": "Sometimes the whole sequence completes, and you still don’t get in.",
          "screen": "A lobby elevator at floor PIL"
        },
        {
          "at": 12.8,
          "text": "The retest happens. The doors open, right at the PIL.",
          "screen": "DING 🔔 · RETEST inside"
        },
        {
          "at": 16.8,
          "text": "And you’re a second too late.",
          "screen": "She arrives with a coffee as the doors close"
        },
        {
          "at": 19.4,
          "text": "Price runs without you. The urge is to jam the door and chase it.",
          "screen": "The floor counter climbs ▲; friend: \"Jam the door! Chase it! 🏃\""
        },
        {
          "at": 25,
          "text": "Don’t. A missed retest is a missed trade.",
          "screen": "\"Missed is missed. 🙂\""
        },
        {
          "at": 28.2,
          "text": "The setup was valid. You just didn’t get the entry.",
          "screen": "SETUP VALID ✓ · ENTRY MISSED"
        }
      ]
    },
    {
      "type": "s13-fridge-cards",
      "start": 34,
      "end": 62,
      "kicker": "Two different results",
      "beats": {
        "fridge": 34.4,
        "cardA": 38.4,
        "stampA": 44.4,
        "cardB": 46,
        "stampB": 48.6,
        "ask": 50,
        "compare": 52.6,
        "done": 55.4
      },
      "headlines": [
        {
          "at": 34.4,
          "html": "Valid · missed <span class=\"mark\">≠ invalid.</span>",
          "out": 52.4
        },
        {
          "at": 52.6,
          "html": "That distinction <span class=\"mark\">matters.</span>"
        }
      ],
      "lines": [
        {
          "at": 34.4,
          "text": "Here are two results that look alike, but aren’t.",
          "screen": "Two report cards on a fridge; a kid and a parent"
        },
        {
          "at": 38.4,
          "text": "Setup A: the model completed. Every close, in order.",
          "screen": "Setup A: PIL ✓ I ✓ C ✓ C ✓"
        },
        {
          "at": 42,
          "text": "You just didn’t get the retest. Valid setup, missed entry.",
          "screen": "Stamp: VALID · MISSED"
        },
        {
          "at": 46,
          "text": "Setup B: the model never completed. That’s invalid.",
          "screen": "Setup B: correction ✗ · stamp: INVALID"
        },
        {
          "at": 49.6,
          "text": "They are not the same thing.",
          "screen": "Kid: \"Same thing, right?\" Parent: \"Not at all.\""
        },
        {
          "at": 52.6,
          "text": "A missed trade doesn’t mean your analysis was bad. And it’s never a reason to chase.",
          "screen": "≠ · that distinction matters"
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
          "text": "A missed trade is not a bad trade."
        },
        {
          "at": 66.2,
          "html": "It’s just a trade <span class=\"mark\">you didn’t get.</span>"
        }
      ],
      "lines": [
        {
          "at": 62.2,
          "text": "Here’s the big takeaway.",
          "screen": "Aristella thinks"
        },
        {
          "at": 63.6,
          "text": "A missed trade is not a bad trade. It’s just a trade you didn’t get.",
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
        "text": "Was the setup invalid, or did I just miss the entry?"
      },
      "cta": {
        "at": 80.4,
        "text": "Let’s find out"
      },
      "lines": [
        {
          "at": 72.2,
          "text": "Here’s your mission.",
          "screen": "\"Your mission\""
        },
        {
          "at": 74.4,
          "text": "When you miss one, ask: was the setup invalid, or did I just miss the entry?",
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
