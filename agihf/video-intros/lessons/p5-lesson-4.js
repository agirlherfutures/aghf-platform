/**
 * Phase 5 · Section 12 · Lesson 4 intro video: "Continuation"
 * Scenes: s12-musical-statues (a party game of musical statues: the music stops after indication and correction, everyone freezes and guesses, "not enough information" until price pushes beyond again), s12-medal-ceremony (an award ceremony: the host holds the continuation medal, the candle on the podium only chops, so the medal goes back in the box and the last C stays open).
 */
window.LESSON_VIDEO = {
  "slug": "p5-lesson-4",
  "eyebrow": "Phase 5 · Section 12 · Lesson 4",
  "duration": 80,
  "sources": "From Phase 5, Section 12, Lesson 4 (\"Continuation\"): freeze after the correction: not enough information; only after price pushed beyond again can the tracker say continuation confirmed; the anticipation trap: bullish indication, correction, then price chopped, no continuation formed so none gets awarded and the last C stays open; each chapter has a job (indication starts the story, correction tests it, continuation supports it); \"Let price prove continuation.\"",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 12: ICC Across the Market",
      "title": "Continuation",
      "quote": "Don’t assume the second C.",
      "lines": [
        {
          "at": 0.6,
          "text": "Welcome to Lesson Four: Continuation.",
          "screen": "Aristella waves; title *Continuation*"
        },
        {
          "at": 3.8,
          "text": "Don’t assume the second C. Let price prove it."
        }
      ]
    },
    {
      "type": "s12-musical-statues",
      "start": 8,
      "end": 32,
      "kicker": "Freeze",
      "beats": {
        "chart": 8.6,
        "freeze": 14,
        "guess": 15.2,
        "nei": 18,
        "resume": 23.8,
        "confirm": 26.4
      },
      "headlines": [
        {
          "at": 8.4,
          "html": "Freeze. <span class=\"mark\">What comes next?</span>",
          "out": 23.6
        },
        {
          "at": 23.8,
          "html": "Now it’s <span class=\"mark\">proven.</span>"
        }
      ],
      "lines": [
        {
          "at": 8.4,
          "text": "The party’s going. Bullish indication, then a correction.",
          "screen": "Party, DJ and a TV chart: indication, correction"
        },
        {
          "at": 12.2,
          "text": "And then the music stops. Freeze!",
          "screen": "Everyone freezes mid-dance; the chart pauses"
        },
        {
          "at": 15.2,
          "text": "Everyone wants to guess what comes next.",
          "screen": "Rabbit: \"Up next!\"; dancer: \"Down?!\""
        },
        {
          "at": 18,
          "text": "The honest answer? Not enough information yet.",
          "screen": "NOT ENOUGH INFORMATION"
        },
        {
          "at": 20.8,
          "text": "So we wait, and let price show us."
        },
        {
          "at": 23.8,
          "text": "Music’s back. Price pushed beyond again.",
          "screen": "Music resumes; price pushes beyond the high"
        },
        {
          "at": 26.4,
          "text": "Now, and only now, continuation is confirmed.",
          "screen": "CONTINUATION CONFIRMED ✓"
        }
      ]
    },
    {
      "type": "s12-medal-ceremony",
      "start": 32,
      "end": 58,
      "kicker": "Anticipation trap",
      "beats": {
        "board": 32.6,
        "chop": 36.4,
        "tracker": 38.4,
        "noaward": 44,
        "rule": 49.6
      },
      "headlines": [
        {
          "at": 32.4,
          "html": "Don’t assume <span class=\"mark\">the second C.</span>",
          "out": 49.4
        },
        {
          "at": 49.6,
          "html": "Let price <span class=\"mark\">prove continuation.</span>"
        }
      ],
      "lines": [
        {
          "at": 32.4,
          "text": "Same start. Bullish indication, then a correction.",
          "screen": "Award stage; the scoreboard chart prints I and C"
        },
        {
          "at": 35.4,
          "text": "Now what?"
        },
        {
          "at": 36.6,
          "text": "It’s tempting to assume the second C and jump ahead.",
          "screen": "Host holds up the CONTINUATION medal"
        },
        {
          "at": 40.4,
          "text": "But look. Price just chops around. Nothing gets proven.",
          "screen": "The candle wiggles side to side; tracker I ✓ C ✓ C ○"
        },
        {
          "at": 44,
          "text": "No continuation formed, so none gets awarded.",
          "screen": "The medal goes back in the box"
        },
        {
          "at": 47,
          "text": "The last C stays open.",
          "screen": "C: stays open"
        },
        {
          "at": 49.6,
          "text": "Each chapter has a job. Continuation has to be proven."
        },
        {
          "at": 53.6,
          "text": "Let price prove continuation."
        }
      ]
    },
    {
      "type": "host-hook",
      "start": 58,
      "end": 68,
      "pointAt": 60.6,
      "size": 60,
      "kicker": "Dayli says",
      "parts": [
        {
          "at": 59.2,
          "text": "Indication starts it. Correction tests it."
        },
        {
          "at": 60.6,
          "html": "<span class=\"mark\">Continuation has to be proven.</span>"
        }
      ],
      "lines": [
        {
          "at": 58.2,
          "text": "Here’s the big takeaway.",
          "screen": "Aristella thinks"
        },
        {
          "at": 59.8,
          "text": "Indication starts the story. Correction tests it. Continuation supports it, and it has to be proven.",
          "screen": "Aristella points"
        }
      ]
    },
    {
      "type": "host-mission",
      "start": 68,
      "end": 80,
      "kicker": "Your mission",
      "question": {
        "at": 70.4,
        "text": "Why do we wait for continuation instead of assuming it?"
      },
      "cta": {
        "at": 76.4,
        "text": "Let’s find out"
      },
      "lines": [
        {
          "at": 68.2,
          "text": "Here’s your mission for this lesson.",
          "screen": "\"Your mission\""
        },
        {
          "at": 70.4,
          "text": "Why do we wait for continuation instead of assuming it?",
          "screen": "Mission question"
        },
        {
          "at": 76.4,
          "text": "Let’s find out.",
          "screen": "Aristella cheers; \"Let’s find out →\""
        }
      ]
    }
  ]
};
