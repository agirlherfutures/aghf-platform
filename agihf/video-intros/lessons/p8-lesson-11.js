/**
 * Phase 8 · Section 22 · Lesson 11 intro video: "What Backtesting Actually Is"
 * Scenes: s22-flight-sim, s22-lab-lock (see scenes-s22.js).
 */
window.LESSON_VIDEO = {
  "slug": "p8-lesson-11",
  "eyebrow": "Phase 8 · Section 22 · Lesson 11",
  "duration": 84,
  "sources": "From Phase 8, Section 22, Lesson 11 (\"What Backtesting Actually Is\"): hook \"Finding winners on a finished chart isn’t a test.\"; backtesting = apply the same defined rule set to historical price, as consistently as possible; the goal isn’t to find winners, it’s to test the rules; study fields (instrument, date range, session, method version, risk model, management model, filters, rulebook version); lock the study rules before the first rep; a rule change mid-study makes a new version; remember: \"Don’t change the test because you don’t like the results so far.\"; mission question \"Am I testing my rules, or finding winners?\"",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 22: Practice Like a Pro",
      "title": "What Backtesting Actually Is",
      "quote": "Finding winners on a finished chart isn’t a test.",
      "lines": [
        { "at": 0.6, "text": "Welcome to Lesson Eleven: What Backtesting Actually Is.", "screen": "Aristella waves; title *What Backtesting Actually Is*" },
        { "at": 4.4, "text": "Finding winners on a finished chart isn’t a test." }
      ]
    },
    {
      "type": "s22-flight-sim",
      "start": 8,
      "end": 35,
      "kicker": "Review vs backtest",
      "beats": { "room": 8.4, "rewind": 11.6, "star": 13.6, "cat": 16.4, "verdict": 18.4, "sim": 19.6, "decide": [22.4, 24.2, 26, 27.6, 29.2] },
      "headlines": [
        { "at": 8.6, "html": "Watching landings <span class=\"mark\">isn’t flying.</span>", "out": 19.4 },
        { "at": 19.6, "html": "A backtest decides <span class=\"mark\">without the future.</span>" }
      ],
      "lines": [
        { "at": 8.4, "text": "Meet two pilots practicing landings.", "screen": "A living room: a pilot with a remote, a TV replaying landings, a cat on the couch" },
        { "at": 10.6, "text": "The first one rewinds old landing videos and stars the smooth ones.", "screen": "The video rewinds; three gold stars land on the smooth landing" },
        { "at": 15.4, "text": "Fun, but she already knew how each one ended.", "screen": "Cat: \"You knew the ending\" · REVIEW: the ending is visible" },
        { "at": 19.6, "text": "The second pilot sits in a simulator, with the runway in fog.", "screen": "A flight simulator; candles print in the windshield; fog over the future; an owl instructor" },
        { "at": 24, "text": "Each moment, she decides with only what’s in front of her.", "screen": "Lights blink: WAIT, WAIT, PASS, WAIT, TAKE" },
        { "at": 29.2, "text": "That’s a backtest: your rules, applied to history, without the future.", "screen": "BACKTEST: decide without the future ✓" }
      ]
    },
    {
      "type": "s22-lab-lock",
      "start": 35,
      "end": 62,
      "kicker": "Lock the study",
      "beats": { "bench": 35.4, "write": [36.6, 37.6, 38.6, 39.6], "lock": 41, "reps": 43, "mouse": 49.2, "bonk": 51.2, "v2": 54 },
      "headlines": [
        { "at": 35.6, "html": "Rules first. <span class=\"mark\">Then lock them.</span>", "out": 53.6 },
        { "at": 53.8, "html": "Change a rule, <span class=\"mark\">start a new study.</span>" }
      ],
      "lines": [
        { "at": 35.4, "text": "A real test starts in the lab notebook.", "screen": "A lab: a scientist writes the study rules; a goldfish in a flask watches" },
        { "at": 38.3, "text": "Instrument, session, risk model, stop rule. Then lock it.", "screen": "Rules written; a glass case with a padlock drops over: STUDY v1 · LOCKED" },
        { "at": 42.4, "text": "Now every rep is tested against exactly those rules.", "screen": "Test tubes fill one by one; the REPS counter climbs to 20" },
        { "at": 46.6, "text": "Twenty reps in, a few losses, and the urge to tweak shows up.", "screen": "A mouse sneaks up with a pencil: \"Just tweak the stop…\"" },
        { "at": 51.4, "text": "But the rules are locked for this study.", "screen": "The mouse bonks the glass: \"Ouch! Locked.\"" },
        { "at": 54.2, "text": "Change a rule, and you’ve started a new version, counting from zero.", "screen": "STUDY v2 · new rules · count from 0" },
        { "at": 58.6, "text": "Test the rules. Don’t hunt for winners." }
      ]
    },
    {
      "type": "host-hook",
      "start": 62,
      "end": 72,
      "pointAt": 65.6,
      "size": 50,
      "kicker": "Dayli says",
      "parts": [
        { "at": 63.4, "text": "Don’t change the test because" },
        { "at": 65.6, "html": "you don’t like <span class=\"mark\">the results so far.</span>" }
      ],
      "lines": [
        { "at": 62.2, "text": "Remember this.", "screen": "Aristella thinks" },
        { "at": 63.6, "text": "Don’t change the test because you don’t like the results so far.", "screen": "Aristella points" }
      ]
    },
    {
      "type": "host-mission",
      "start": 72,
      "end": 84,
      "kicker": "Your mission",
      "question": { "at": 74.4, "text": "Am I testing my rules, or finding winners?" },
      "cta": { "at": 80, "text": "Let’s find out" },
      "lines": [
        { "at": 72.2, "text": "Your mission.", "screen": "\"Your mission\"" },
        { "at": 74.4, "text": "Every time you open a chart to practice, ask: am I testing my rules, or finding winners?", "screen": "Mission question" },
        { "at": 80.6, "text": "Let’s find out.", "screen": "Aristella cheers; \"Let's find out →\"" }
      ]
    }
  ]
};
