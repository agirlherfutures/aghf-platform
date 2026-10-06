/**
 * Phase 6 · Section 17 · Lesson 21 intro video: "1:1 vs 1:2"
 * Scenes: s17-hoops, s17-garden-pots (see scenes-s17.js).
 */
window.LESSON_VIDEO = {
  "slug": "p6-lesson-21",
  "eyebrow": "Phase 6 · Section 17 · Lesson 21",
  "duration": 84,
  "sources": "From Phase 6, Section 17, Lesson 21 (\"1:1 vs 1:2\"): 1:1 = risk 1R to make 1R, 1:2 = risk 1R to make 2R; expectancy = win% × average win − loss% × average loss; 40% wins at +2R vs −1R is +0.20R per trade, in theory; a strategy doesn’t need to win most trades to have positive expectancy; 1:2 doesn’t automatically give positive expectancy: you need the real win rate, average win and loss, consistent execution, costs and a big enough sample (25% at 1:2 = −0.25R illustrates it); \"Win rate is not the whole edge.\"; Dayli: \"1:2 isn’t an edge by itself. It’s a structure. The edge is in what actually happens over a real sample.\"",
  "scenes": [
    {
      "type": "host-title",
      "start": 0,
      "end": 8,
      "nameTag": true,
      "phase": "Section 17: Protecting Your Account",
      "title": "1:1 vs 1:2",
      "quote": "Win rate is not the whole edge.",
      "lines": [
        {
          "at": 0.6,
          "text": "Welcome to Lesson Twenty-One: 1:1 vs 1:2.",
          "screen": "Aristella waves; title *1:1 vs 1:2*"
        },
        {
          "at": 5,
          "text": "Two ratios, one honest formula."
        }
      ]
    },
    {
      "type": "s17-hoops",
      "start": 8,
      "end": 35,
      "kicker": "Two ratios, one formula",
      "beats": {
        "court": 8.4,
        "signs": [
          8.6,
          10.8
        ],
        "shots": 14.4,
        "tally": 22.6,
        "total": 26.6
      },
      "headlines": [
        {
          "at": 8.4,
          "html": "1:1 vs <span class=\"mark\">1:2</span>",
          "out": 22.4
        },
        {
          "at": 22.6,
          "html": "40% wins, <span class=\"mark\">+0.2R in theory.</span>"
        }
      ],
      "lines": [
        {
          "at": 8.4,
          "text": "One to one: risk 1R to make 1R. One to two: risk 1R to make 2R.",
          "screen": "Rule cards: 1:1 risk 1R → make 1R · 1:2 risk 1R → make 2R"
        },
        {
          "at": 14.4,
          "text": "Watch this player. Four baskets out of ten: a forty percent win rate.",
          "screen": "A player shoots ten; the scoreboard counts wins and losses"
        },
        {
          "at": 19.2,
          "text": "Each basket scores plus 2R. Each miss costs 1R.",
          "screen": "+2R on a make, −1R on a miss"
        },
        {
          "at": 22.6,
          "text": "Four times two is plus eight. Six misses: minus six.",
          "screen": "WINS 4: +8R · LOSSES 6: −6R"
        },
        {
          "at": 26.6,
          "text": "Net plus 2R over ten shots. About plus 0.2R per trade, in theory, before costs.",
          "screen": "NET +2R / 10 shots ≈ +0.2R per trade; in theory, before costs"
        }
      ]
    },
    {
      "type": "s17-garden-pots",
      "start": 35,
      "end": 62,
      "kicker": "Is 1:2 automatically profitable?",
      "beats": {
        "pots": 35.4,
        "label": 38.6,
        "wilt": 45,
        "items": [
          51.2,
          52.4,
          53.6,
          56
        ],
        "grow": 56.6,
        "punch": 58.6
      },
      "headlines": [
        {
          "at": 35.4,
          "html": "1:2 is <span class=\"mark\">a structure.</span>",
          "out": 51
        },
        {
          "at": 51.2,
          "html": "The edge is in <span class=\"mark\">the real sample.</span>"
        }
      ],
      "lines": [
        {
          "at": 35.4,
          "text": "So is one to two automatically profitable? No.",
          "screen": "Two flower pots on a bench, both labelled 1:2"
        },
        {
          "at": 38.6,
          "text": "One to two is a structure, like a pot. The edge is what actually grows in it.",
          "screen": "Both sprout"
        },
        {
          "at": 45,
          "text": "With a twenty-five percent win rate, the same one to two loses about a quarter R per trade.",
          "screen": "Pot A, 25% wins, wilts: ≈ −0.25R per trade"
        },
        {
          "at": 51.2,
          "text": "It needs a real win rate, real average wins and losses, consistent execution,",
          "screen": "Checklist: real win rate, real avg win & loss, consistent execution"
        },
        {
          "at": 56,
          "text": "costs included, and a big enough sample.",
          "screen": "costs + big sample; a snail labelled costs; pot B grows"
        },
        {
          "at": 58.6,
          "text": "Neither win rate nor ratio is the whole edge.",
          "screen": "the real sample decides"
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
          "text": "1:2 isn’t an edge by itself."
        },
        {
          "at": 66.2,
          "html": "The edge is in <span class=\"mark\">what actually happens.</span>"
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
          "text": "One to two isn’t an edge by itself. It’s a structure. The edge is in what actually happens over a real sample.",
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
        "text": "Does my real data support this ratio?"
      },
      "cta": {
        "at": 80,
        "text": "Let’s check the sample"
      },
      "lines": [
        {
          "at": 72.2,
          "text": "Your mission.",
          "screen": "\"Your mission\""
        },
        {
          "at": 74.4,
          "text": "Before you trust a ratio, ask: does my real data support it?",
          "screen": "Mission question"
        },
        {
          "at": 80,
          "text": "Let’s check the sample.",
          "screen": "Aristella cheers; \"Let’s check the sample →\""
        }
      ]
    }
  ]
};
