/**
 * Phase 6 · Section 15 · Lesson 5 intro video: "Timing the First Retest"
 * Scenes: s15-conductor, s15-fetch (see scenes-s15.js).
 */
window.LESSON_VIDEO = {
  "slug": "p6-lesson-5",
  "eyebrow": "Phase 6 · Section 15 · Lesson 5",
  "duration": 84,
  "sources": "From Phase 6, Section 15, Lesson 5 (\"Timing the First Retest\"): WAIT · PREPARE · EXECUTE; takeaways \"WAIT through I and C.\", \"PREPARE after continuation closes.\", \"EXECUTE at the first valid retest.\"; the entry timing drill (too early, on model, too late); reflect: \"Waiting is doing nothing, preparing is planning the entry at the PIL after continuation, and executing only happens at the first valid retest.\"; curriculum quote \"My entry comes after confirmation. Not before it.\"; mission question \"When does the setup first become executable?\"",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 15: How to Actually Enter",
      "title": "Timing the First Retest",
      "quote": "Wait. Prepare. Execute.",
      "lines": [
        { "at": 0.6, "text": "Welcome to Lesson Five: Timing the First Retest.", "screen": "Aristella waves; title *Timing the First Retest*" },
        { "at": 4.4, "text": "Today is all about when." }
      ]
    },
    {
      "type": "s15-conductor",
      "start": 8,
      "end": 35,
      "kicker": "The count-in",
      "beats": { "stage": 8.4, "b": [12, 15.2, 19.2, 23.2], "itch": 16.4 },
      "headlines": [
        { "at": 8.6, "html": "Wait · wait · <span class=\"mark\">prepare</span> · execute.", "out": 26.4 },
        { "at": 26.6, "html": "Execute at <span class=\"mark\">the first valid retest.</span>" }
      ],
      "lines": [
        { "at": 8.4, "text": "Every entry has a count-in, like an orchestra.", "screen": "A stage; a conductor on a podium; a mouse with a triangle, a robot drummer, a cat with cymbals; four beat circles" },
        { "at": 11.6, "text": "One: indication. We wait.", "screen": "1 · WAIT · indication" },
        { "at": 14.8, "text": "Two: correction. We still wait.", "screen": "2 · WAIT · correction; the cat: \"Now?! 🥁\" · conductor: \"Not yet ✋\"" },
        { "at": 18.8, "text": "Three: continuation closes. Now we prepare.", "screen": "3 · PREPARE · continuation closed" },
        { "at": 22.6, "text": "Four: the first valid retest. Execute.", "screen": "4 · EXECUTE · first valid retest; cymbal crash" },
        { "at": 26.6, "text": "Waiting is doing nothing. Preparing is planning the entry. Executing only happens at the first valid retest." }
      ]
    },
    {
      "type": "s15-fetch",
      "start": 35,
      "end": 62,
      "kicker": "Entry timing drill",
      "beats": { "field": 35.4, "rounds": [38, 44, 50], "final": 56 },
      "headlines": [
        { "at": 35.6, "html": "Too early, <span class=\"mark\">on model,</span> too late.", "out": 55.8 },
        { "at": 56, "html": "My entry comes <span class=\"mark\">after</span> confirmation." }
      ],
      "lines": [
        { "at": 35.4, "text": "Let’s practise the timing with a game of fetch.", "screen": "A kid, a dog, a bird judge with score cards; the catch line is the PIL" },
        { "at": 38.4, "text": "Too early: he jumps before the ball comes back.", "screen": "1 · TOO EARLY ✗" },
        { "at": 44.2, "text": "On model: he waits, and catches it as it comes back to the line.", "screen": "2 · ON MODEL ✓ · score 10" },
        { "at": 50.2, "text": "Too late: it’s already gone, and now he’s chasing it.", "screen": "3 · TOO LATE: chasing ✗" },
        { "at": 56, "text": "My entry comes after confirmation. Not before it.", "screen": "execute as it comes back to the line" },
        { "at": 59.4, "text": "At the first valid retest." }
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
        { "at": 63.4, "text": "My entry comes after confirmation." },
        { "at": 66.2, "html": "<span class=\"mark\">Not before it.</span>" }
      ],
      "lines": [
        { "at": 62.2, "text": "Here’s the big takeaway.", "screen": "Aristella thinks" },
        { "at": 63.6, "text": "My entry comes after confirmation. Not before it.", "screen": "Aristella points" }
      ]
    },
    {
      "type": "host-mission",
      "start": 72,
      "end": 84,
      "kicker": "Your mission",
      "question": { "at": 74.4, "text": "When does the setup first become executable?" },
      "cta": { "at": 80, "text": "Let’s find out" },
      "lines": [
        { "at": 72.2, "text": "Your mission.", "screen": "\"Your mission\"" },
        { "at": 74.4, "text": "On every replay, find the moment: when does the setup first become executable?", "screen": "Mission question" },
        { "at": 80, "text": "Let’s find out.", "screen": "Aristella cheers; \"Let's find out →\"" }
      ]
    }
  ]
};
