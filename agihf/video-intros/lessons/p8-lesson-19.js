/**
 * Phase 8 · Section 22 · Lesson 19 intro video: "Performance Tracking"
 * Scenes: s22b-gauge-dash, s22b-coin-pipes (see scenes-s22b.js).
 */
window.LESSON_VIDEO = {
  "slug": "p8-lesson-19",
  "eyebrow": "Phase 8 · Section 22 · Lesson 19",
  "duration": 84,
  "sources": "From Phase 8, Section 22, Lesson 19 (\"Performance Tracking\"): hook \"Process on top. P&L underneath.\"; read the dashboard in order: process, then performance, then behavior; process is on top because you control process, not individual outcomes; 60% win rate: can't tell profitability from win rate alone, average win vs average loss decides it; expectancy is what the average trade produces in R, labeled as before trading costs; missing rule-adherence entries are not counted as adherent, the dashboard calculates only from entries that recorded it and shows N; principle: \"Win rate is not the first learning metric.\"; remember: \"Win rate alone cannot define profitability.\"; section theme: every number carries its sample size N and \"early sample\" when small; mission question \"What can I actually control?\". Numbers on screen are illustrative.",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 22: Practice Like a Pro",
      "title": "Performance Tracking",
      "quote": "Process on top. P&L underneath.",
      "lines": [
        { "at": 0.6, "text": "Welcome to Lesson Nineteen: Performance Tracking.", "screen": "Aristella waves; title *Performance Tracking*" },
        { "at": 4.4, "text": "Process on top. P and L underneath." }
      ]
    },
    {
      "type": "s22b-gauge-dash",
      "start": 8,
      "end": 35,
      "kicker": "Read it in order",
      "beats": { "set": 8.4, "g1": 10.8, "g2": 13, "sign": 15.4, "cat": 17.4, "tap": 20, "pnl": 23.4, "n": 26.6 },
      "headlines": [
        { "at": 8.6, "html": "Process <span class=\"mark\">on top.</span>", "out": 23.2 },
        { "at": 23.4, "html": "P&amp;L <span class=\"mark\">underneath.</span>" }
      ],
      "lines": [
        { "at": 8.4, "text": "Your performance dashboard works like a car dashboard.", "screen": "A road through the windshield, a dashboard, a bobblehead dog, a driving instructor, a cat passenger" },
        { "at": 11.6, "text": "On top: the gauges you control. Rules followed. Quality mix.", "screen": "PROCESS · you control this: RULES FOLLOWED gauge, QUALITY MIX donut (A, B, C)" },
        { "at": 15.8, "text": "Out the window, a price sign flickers up and down.", "screen": "A roadside P&L sign with jumping numbers" },
        { "at": 19.4, "text": "The cat can’t stop staring. Eyes up here.", "screen": "Cat: \"Ooh, the number!\" · Instructor: \"Eyes up here 👆\"" },
        { "at": 23.4, "text": "P and L is still on the dashboard. It just sits underneath.", "screen": "A small P&L strip below the gauges" },
        { "at": 27.6, "text": "And every gauge carries its N. Twenty-four is an early sample.", "screen": "N = 24 badges · early sample" },
        { "at": 31.8, "text": "Process first. Then performance. Then behavior." }
      ]
    },
    {
      "type": "s22b-coin-pipes",
      "start": 35,
      "end": 62,
      "kicker": "Win rate vs expectancy",
      "beats": { "set": 35.4, "rate": 37.8, "trades": 40.2, "step": 1, "result": 51.4, "costs": 55.6 },
      "headlines": [
        { "at": 35.6, "html": "60% win rate. <span class=\"mark\">Profitable?</span>", "out": 51.2 },
        { "at": 51.4, "html": "Win rate alone <span class=\"mark\">can’t tell you.</span>" }
      ],
      "lines": [
        { "at": 35.4, "text": "Quick quiz. Sixty percent win rate. Is it profitable?", "screen": "Two water tanks with a duck each, a parrot: \"60%! Amazing!\"" },
        { "at": 39.6, "text": "Watch two tanks run ten trades each.", "screen": "Trade chips light up; water pours in or drains out" },
        { "at": 42.4, "text": "Tank one wins often, but small: half an R. Each loss costs a full R.", "screen": "Tank one: win rate 60%, +0.5R in, −1R out" },
        { "at": 47.6, "text": "Tank two wins less, but each win pays two R.", "screen": "Tank two: win rate 40%, +2R in, −1R out" },
        { "at": 51.6, "text": "Sixty percent drains. Forty percent fills.", "screen": "−0.1R per trade · +0.2R per trade · parrot: \"Wait... what?\"" },
        { "at": 54.4, "text": "That’s expectancy: what the average trade produces in R, before trading costs.", "screen": "before trading costs" },
        { "at": 59.2, "text": "Win rate alone can’t tell you." }
      ]
    },
    {
      "type": "host-hook",
      "start": 62,
      "end": 72,
      "pointAt": 65.4,
      "size": 50,
      "kicker": "Dayli says",
      "parts": [
        { "at": 63.4, "text": "Win rate alone" },
        { "at": 65.4, "html": "cannot define <span class=\"mark\">profitability.</span>" }
      ],
      "lines": [
        { "at": 62.2, "text": "Here’s the big takeaway.", "screen": "Aristella thinks" },
        { "at": 63.6, "text": "Win rate alone cannot define profitability.", "screen": "Aristella points" },
        { "at": 66.8, "text": "So start with the part you control: your process." }
      ]
    },
    {
      "type": "host-mission",
      "start": 72,
      "end": 84,
      "kicker": "Your mission",
      "question": { "at": 74.4, "text": "What can I actually control?" },
      "cta": { "at": 80, "text": "Let’s find out" },
      "lines": [
        { "at": 72.2, "text": "Your mission.", "screen": "\"Your mission\"" },
        { "at": 74.4, "text": "Open your dashboard, read it top to bottom, and ask: what can I actually control?", "screen": "Mission question" },
        { "at": 80.6, "text": "Let’s find out.", "screen": "Aristella cheers; \"Let's find out →\"" }
      ]
    }
  ]
};
