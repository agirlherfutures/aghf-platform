/**
 * Phase 6 · Section 16 · Lesson 10 intro video: "Fixed Targets vs Structure-Based Targets"
 * Scenes: s16-twin-climbers, s16-gadget-robot (see scenes-s16.js).
 */
window.LESSON_VIDEO = {
  "slug": "p6-lesson-10",
  "eyebrow": "Phase 6 · Section 16 · Lesson 10",
  "duration": 84,
  "sources": "From Phase 6, Section 16, Lesson 10 (\"Fixed Targets vs Structure-Based Targets\"): Model A fixed management (predefined 30-point SL and 60-point TP in the Dayli ICC MNQ example); Model B structure-based management (previous highs and lows, external swings, liquidity, new structure; more adaptive, more discretion; \"undefined discretion is where emotion gets in\"); same trade, two plans (the structure trader trails her stop under a new 1M higher low by rule); \"Did the action match the predefined model?\"; \"More flexible does not automatically mean more advanced.\"",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 16: Managing the Trade",
      "title": "Fixed Targets vs Structure-Based Targets",
      "quote": "More flexible does not automatically mean more advanced.",
      "lines": [
        { "at": 0.6, "text": "Welcome to Lesson Ten: Fixed Targets versus Structure-Based Targets.", "screen": "Aristella waves; title *Fixed Targets vs Structure-Based Targets*" },
        { "at": 5.4, "text": "Two ways to manage a trade." }
      ]
    },
    {
      "type": "s16-twin-climbers",
      "start": 8,
      "end": 34,
      "kicker": "Same trade · two plans",
      "beats": { "walls": 8.4, "plans": [10.8, 15], "climb": 17, "hl": 22.2, "trail": 23.4, "ask": 27.2, "verdict": 28.8 },
      "headlines": [
        { "at": 8.4, "html": "Same trade. <span class=\"mark\">Two plans.</span>", "out": 28.6 },
        { "at": 28.8, "html": "Did it match <span class=\"mark\">her plan?</span>" }
      ],
      "lines": [
        { "at": 8.4, "text": "Two climbers, same trade, two different plans.", "screen": "Two cliff walls: TARGET +60 flags, STOP −30 anchors; a referee and a dog" },
        { "at": 10.8, "text": "She’s fixed: hold to the 60-point target or the 30-point stop.", "screen": "FIXED: hold to +60 or −30" },
        { "at": 15, "text": "She’s structure-based: trail the stop under each new 1-minute higher low.", "screen": "STRUCT.: trail under each new HL" },
        { "at": 19.8, "text": "Price pushes up, pulls back, and prints a new higher low.", "screen": "Both climb; a new 1M higher low" },
        { "at": 23.6, "text": "Her rule triggers, so she trails. The other one holds.", "screen": "Right anchor re-clips: STOP +18; left anchor stays" },
        { "at": 27.2, "text": "So who’s wrong?", "screen": "Referee: \"Who’s wrong? 🧐\"" },
        { "at": 28.8, "text": "Neither. Each action matched the plan she started with.", "screen": "\"Neither! ✓\" with a check on each wall" }
      ]
    },
    {
      "type": "s16-gadget-robot",
      "start": 34,
      "end": 62,
      "kicker": "Structure-based management",
      "beats": { "robot": 34.4, "tools": [35.6, 36.8, 38], "gremlin": 43.4, "book": 47, "calm": 48.8, "small": 52, "badges": 53.4 },
      "headlines": [
        { "at": 34.4, "html": "More information. <span class=\"mark\">More adaptive.</span>", "out": 43.2 },
        { "at": 43.4, "html": "Undefined discretion lets <span class=\"mark\">emotion in.</span>", "out": 56.6 },
        { "at": 56.8, "html": "More flexible <span class=\"mark\">isn’t more advanced.</span>" }
      ],
      "lines": [
        { "at": 34.4, "text": "Structure-based management uses market information: previous highs and lows, liquidity, new structure.", "screen": "A robot sprouts tools: highs & lows · liquidity · new structure" },
        { "at": 39.8, "text": "That makes it more adaptive. It also takes more discretion." },
        { "at": 43.6, "text": "And undefined discretion is exactly where emotion gets in.", "screen": "A worry cloud flies into the open hatch; the arms flail: \"MOVE IT! CLOSE IT! 😱\"" },
        { "at": 47.2, "text": "Write the rules down, and the same tool turns calm and rule-based.", "screen": "She slots in RULES; the cloud is pushed out" },
        { "at": 52, "text": "Fixed or structure-based, both are valid when they’re defined before the trade.", "screen": "FIXED · predefined ✓ · STRUCTURE · predefined ✓" },
        { "at": 56.8, "text": "More flexible does not automatically mean more advanced." }
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
        { "at": 63.4, "text": "Different action doesn’t mean somebody’s wrong." },
        { "at": 66.2, "html": "Did it match <span class=\"mark\">the plan she started with?</span>" }
      ],
      "lines": [
        { "at": 62.2, "text": "Here’s the big takeaway.", "screen": "Aristella thinks" },
        { "at": 63.6, "text": "Different action doesn’t mean somebody’s wrong. Ask whether it matched the plan she started with.", "screen": "Aristella points" }
      ]
    },
    {
      "type": "host-mission",
      "start": 72,
      "end": 84,
      "kicker": "Your mission",
      "question": { "at": 74.4, "text": "Did the action match the predefined model?" },
      "cta": { "at": 80, "text": "Let’s find out" },
      "lines": [
        { "at": 72.2, "text": "Here’s your mission.", "screen": "\"Your mission\"" },
        { "at": 74.4, "text": "Watch both traders, and ask: did the action match the predefined model?", "screen": "Mission question" },
        { "at": 80, "text": "Let’s find out.", "screen": "Aristella cheers; \"Let's find out →\"" }
      ]
    }
  ]
};
