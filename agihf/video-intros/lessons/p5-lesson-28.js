/**
 * Phase 5 · Section 14 · Lesson 28 intro video: "1M: Execute Dayli ICC"
 * Scenes: s14b-close-camera, s14b-bus-stop (see scenes-s14b.js).
 */
window.LESSON_VIDEO = {
  "slug": "p5-lesson-28",
  "eyebrow": "Phase 5 · Section 14 · Lesson 28",
  "duration": 84,
  "sources": "From Phase 5, Section 14, Lesson 28 (\"1M: Execute Dayli ICC\"): finish the 4H and 1H work first; mark the PIL (Pre-Indication Level) before looking for the sequence; Indication = a 1M candle closes through the PIL (a wick alone does not qualify); Correction = a candle closes back through the PIL; Continuation = a candle closes back through in the original direction, completing the sequence; a complete ICC doesn’t guarantee an entry: the planned limit entry sits at the PIL and is considered only if price retests it; MNQ example: 30-point stop, 60-point target (1:2); no retest before target = a missed trade, not a bad trade; \"Is the entry model actually present? Then, and only then, you act.\"",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 14: Making the Timeframes Work Together",
      "title": "1M: Execute Dayli ICC",
      "quote": "Is the entry model actually present? Then, and only then, you act.",
      "lines": [
        {
          "at": 0.6,
          "text": "Welcome to Lesson Twenty-Eight: 1M: Execute Dayli ICC.",
          "screen": "Aristella waves; title *1M: Execute Dayli ICC*"
        },
        {
          "at": 5,
          "text": "Your plan meets the 1-minute chart."
        }
      ]
    },
    {
      "type": "s14b-close-camera",
      "start": 8,
      "end": 34,
      "kicker": "Only closes count",
      "beats": {
        "htf": 8.4,
        "cards": [
          9.2,
          10.2
        ],
        "pil": 11.6,
        "wick": 14.4,
        "ind": 19.6,
        "corr": 23.2,
        "cont": 26.4,
        "done": 30.8
      },
      "headlines": [
        {
          "at": 8.4,
          "html": "Only the <span class=\"mark\">close</span> counts.",
          "out": 30.6
        },
        {
          "at": 30.8,
          "html": "I → C → C: <span class=\"mark\">complete.</span>"
        }
      ],
      "lines": [
        {
          "at": 8.4,
          "text": "Finish your 4H and 1H work first. Then mark your PIL, the Pre-Indication Level.",
          "screen": "4H done ✓ 1H done ✓; a 1M chart; the swing high is marked as the PIL (dashed line)"
        },
        {
          "at": 14.4,
          "text": "A wick that pokes through doesn’t count. Only a candle close does.",
          "screen": "A candle wicks above the PIL but closes below: the owl referee’s close-cam photo says \"wick ✗\""
        },
        {
          "at": 19.6,
          "text": "Indication: a 1M candle closes above the PIL.",
          "screen": "Flash: a candle closes above the PIL, tagged I; photo \"I ✓\""
        },
        {
          "at": 23.2,
          "text": "Correction: a candle closes back below it.",
          "screen": "Flash: a candle closes back below the PIL, tagged C; photo \"C ✓\""
        },
        {
          "at": 26.4,
          "text": "Continuation: a candle closes back above, in the original direction.",
          "screen": "Flash: a candle closes back above the PIL, tagged C; photo \"C ✓\""
        },
        {
          "at": 30.8,
          "text": "Now all three stages are complete.",
          "screen": "\"I → C → C · sequence complete ✓\""
        }
      ]
    },
    {
      "type": "s14b-bus-stop",
      "start": 34,
      "end": 62,
      "kicker": "Plan the entry",
      "beats": {
        "stop": 34.4,
        "run": 40.8,
        "back": 46,
        "risk": 51.2,
        "missed": 56.4
      },
      "headlines": [
        {
          "at": 34.4,
          "html": "A complete ICC <span class=\"mark\">doesn’t guarantee</span> an entry.",
          "out": 56.2
        },
        {
          "at": 56.4,
          "html": "No retest? <span class=\"mark\">Missed, not bad.</span>"
        }
      ],
      "lines": [
        {
          "at": 34.4,
          "text": "A complete ICC doesn’t guarantee an entry. Your planned limit entry waits at the PIL.",
          "screen": "Chart with I, C, C done; \"◆ limit entry waits here\" at the PIL; a rider waits at a bus stop marked PIL"
        },
        {
          "at": 40.8,
          "text": "Price runs away? You don’t chase it. You wait for the retest.",
          "screen": "Price runs up; the PRICE bus drives off. \"I don’t chase. I wait.\""
        },
        {
          "at": 46,
          "text": "When price comes back to the PIL, your entry can be considered.",
          "screen": "Price dips back to the PIL: \"RETEST · ENTRY\"; the bus comes back to the stop: \"Filled ✓\""
        },
        {
          "at": 51.2,
          "text": "In the MNQ example, that’s a 30-point stop and a 60-point target.",
          "screen": "STOP · 30 pts below, TARGET · 60 pts above; price reaches the target ✓"
        },
        {
          "at": 56.4,
          "text": "No retest before target? That’s a missed trade, not a bad trade.",
          "screen": "Ghost path straight to target; the bus zooms past the stop: \"no retest before target = missed trade\""
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
          "text": "Is the entry model actually present?"
        },
        {
          "at": 66.2,
          "html": "Then, and only then, <span class=\"mark\">you act.</span>"
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
          "text": "Is the entry model actually present? Then, and only then, you act.",
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
        "text": "Is the entry model actually present?"
      },
      "cta": {
        "at": 79.4,
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
          "text": "On every 1M chart, ask: is the entry model actually present?",
          "screen": "Mission question"
        },
        {
          "at": 79.4,
          "text": "Let’s find out.",
          "screen": "Aristella cheers; \"Let’s find out →\""
        }
      ]
    }
  ]
};
