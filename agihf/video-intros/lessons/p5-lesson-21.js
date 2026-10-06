/**
 * Phase 5 · Section 13 · Lesson 21 intro video: "When the Sequence Resets"
 * Scenes: s13-deli-ticket, s13-weigh-dial (see scenes-s13.js).
 */
window.LESSON_VIDEO = {
  "slug": "p5-lesson-21",
  "eyebrow": "Phase 5 · Section 13 · Lesson 21",
  "duration": 84,
  "sources": "From Phase 5, Section 13, Lesson 21 (\"When the Sequence Resets\"), old setup: PIL A, I ✓ C ✓ C ✓, no retest, while price builds new structure; a new swing means reassess, not \"always cancel\": keep the current PIL if the new swing doesn’t change what matters, reassess the PIL if a newer reference now controls the move, mark the setup replaced if a newer sequence took over; \"Don’t wait forever for an old setup while price builds a new one in front of you.\"",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 13: The Dayli ICC 1-Minute Entry Model™",
      "title": "When the Sequence Resets",
      "quote": "Execution is dynamic.",
      "lines": [
        {
          "at": 0.6,
          "text": "Welcome to Lesson Twenty-One: When the Sequence Resets.",
          "screen": "Aristella waves; title *When the Sequence Resets*"
        },
        {
          "at": 5,
          "text": "What if the retest never comes?"
        }
      ]
    },
    {
      "type": "s13-deli-ticket",
      "start": 8,
      "end": 34,
      "kicker": "Old setup",
      "beats": {
        "counter": 8.4,
        "wait": 15.4,
        "cobweb": 18.6,
        "flip": 21.6,
        "realize": 25.4,
        "newt": 28.4
      },
      "headlines": [
        {
          "at": 8.4,
          "html": "Don’t wait forever <span class=\"mark\">for an old setup.</span>",
          "out": 25.2
        },
        {
          "at": 25.4,
          "html": "Execution is <span class=\"mark\">dynamic.</span>"
        }
      ],
      "lines": [
        {
          "at": 8.4,
          "text": "Here’s a sneaky one: waiting forever for an old setup.",
          "screen": "A deli counter; a customer holds ticket PIL A"
        },
        {
          "at": 12.4,
          "text": "PIL A. Indication, correction, continuation. All confirmed.",
          "screen": "NOW SERVING: SETUP A"
        },
        {
          "at": 15.4,
          "text": "But the retest never comes. So you wait…",
          "screen": "The clock spins: \"Still waiting for PIL A… 😴\""
        },
        {
          "at": 18.6,
          "text": "and wait. Meanwhile, price keeps building structure.",
          "screen": "Cobwebs grow"
        },
        {
          "at": 21.6,
          "text": "A new relevant swing forms. A newer sequence takes over.",
          "screen": "The board flips: SETUP B · new swing"
        },
        {
          "at": 25.4,
          "text": "Execution is dynamic. Your old ticket may not be the one being served.",
          "screen": "Butcher: \"That one’s been replaced!\""
        },
        {
          "at": 29.8,
          "text": "So you reassess.",
          "screen": "Old ticket tossed; new ticket: REASSESS"
        }
      ]
    },
    {
      "type": "s13-weigh-dial",
      "start": 34,
      "end": 62,
      "kicker": "Principles, not a switch",
      "beats": {
        "sw": 34.4,
        "xsw": 38,
        "scale": 39.6,
        "w": [
          42,
          46.8,
          51.2
        ],
        "done": 55.8
      },
      "headlines": [
        {
          "at": 34.4,
          "html": "Not <span class=\"mark\">a switch.</span>",
          "out": 55.6
        },
        {
          "at": 55.8,
          "html": "A new swing means: <span class=\"mark\">reassess.</span>"
        }
      ],
      "lines": [
        {
          "at": 34.4,
          "text": "But careful: a new swing doesn’t automatically cancel everything.",
          "screen": "A light switch: new swing = cancel"
        },
        {
          "at": 38,
          "text": "It’s not a switch. It’s a judgment, made with principles.",
          "screen": "The switch is crossed out; a weighing scale with a dial appears"
        },
        {
          "at": 42,
          "text": "Does the new swing change what matters? No? Keep the current PIL.",
          "screen": "Small block: dial → KEEP PIL"
        },
        {
          "at": 46.8,
          "text": "Does a newer reference now control the move? Reassess the PIL.",
          "screen": "Medium block: dial → REASSESS"
        },
        {
          "at": 51.2,
          "text": "Did a newer sequence take over? Then the old setup is replaced.",
          "screen": "Big block: dial → REPLACED"
        },
        {
          "at": 55.8,
          "text": "New structure means: reassess.",
          "screen": "principles, not a switch"
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
          "text": "Don’t wait forever for an old setup"
        },
        {
          "at": 66.2,
          "html": "while price <span class=\"mark\">builds a new one.</span>"
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
          "text": "Don’t wait forever for an old setup while price builds a new one in front of you.",
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
        "text": "Did the new swing change what price must prove itself through?"
      },
      "cta": {
        "at": 80,
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
          "text": "When a new swing forms, ask: did it change what price must prove itself through?",
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
