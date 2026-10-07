"""Phase 7 (v2) · Section 3 · Reading the Environment. Lessons 23-31.
Your model tells you WHAT you're looking for. The environment tells you whether
you should be looking for it at all."""
import copy
import build_s20 as O
from build_s20 import (TREND_BULL, TREND_BULL2, RANGE, RANGE2, MESSY, MIXED_1H, CHOP, crosses, BIG_GREEN, DRIFT, OBJ, clean, cm, wsim, note)
from v2lib import *  # noqa: F401,F403
from v2tapes import ext, trade_lines, HES, HM, WAIT_PRE
from p7lib import lesson, dayli, reflect, write, chk, qq, o, mono, split, col, tally, xchart, PIL, P, Tape, check

S = 's20'
L = {}
old = lambda n, i: copy.deepcopy(O.L[n]['slides'][i])

# ── tapes ──────────────────────────────────────────────────────────────
RET = cm['retest'] + 1
OBJ_NEAR = PIL + 29
ROOM_FAIL = ext(clean[:RET], [(PIL + 18, 3), (PIL + 27, 2), (PIL + 12, 3), (PIL - 8, 3), (PIL - 29, 3)], 101)
ROOM_WAIT = ext(clean[:RET], [(PIL + 18, 3), (PIL + 27, 2), (PIL + 12, 3), (PIL + 4, 3), (PIL + 8, 3)], 102, cap_lo=PIL - 3)
CHOP_FAIL = ext(CHOP, [(PIL - 8, 3), (PIL - 20, 3), (PIL - 29, 2)], 103)
CHOP_WAIT = ext(CHOP, [(PIL + 2, 3), (PIL - 3, 3), (PIL + 1, 3)], 104)
CHOP_AT = crosses[5] + 1
_n = Tape(clean[RET - 1]['c'], 105); _n.b = []
_n.bar(PIL + 3, up=1, dn=1)
_n.b.append({'o': PIL + 3, 'h': PIL + 7, 'l': PIL - 44, 'c': PIL - 36}); _n.p = PIL - 36
_n.drift(PIL - 20, 2); _n.drift(PIL + 6, 3)
ALMOST_NEWS = clean[:RET] + _n.b
VRANGE = O.VRANGE


def first_scene(kicker, title, beats, **kw):
    return scene(kicker, title, beats, **kw)


# ── 23 · Same Model, Different Day ────────────────────────────────────
L[23] = lesson(P, S, 23, 'Same Model, Different Day', 'Same candles. Different market.',
  'See the same setup form on a trending day and a ranging day, and read which market you’re actually in.',
  'What kind of market is my setup forming in?', [
    first_scene('Phase 7 · Section 3', 'Everything about you is ready', [
        cards('RULEBOOK ✓', 'RISK ✓', 'SESSION ✓', 'EMOTIONAL STATE: CALM'),
        ch(clean, play=(cm['indication'] - 2, RET), head={'tf': '1M', 'label': 'A perfect-looking setup'}),
        say('Indication. Correction. Continuation. First retest.', 'You checked yourself. You checked your rules.'),
        th('“So… I take it?”'),
        say('Zoom out.'),
        {'chart': dict(MIXED_1H, head={'tf': '1H', 'label': 'MNQ'}), 'caption': 'The 1H: overlapping, competing swings. A 4H high right above. A release in 2 minutes.'},
        say('<b>You checked yourself. You checked your rules. Did you check the environment?</b>'),
        pr('YOUR MODEL TELLS YOU WHAT YOU’RE LOOKING FOR. THE ENVIRONMENT TELLS YOU WHETHER YOU SHOULD BE LOOKING FOR IT AT ALL.'),
    ], cta='Start →'),
    first_scene('Same Model, Different Day', 'Tuesday and Wednesday', [
        {'chart': dict(TREND_BULL2, head={'tf': '1H', 'label': 'Tuesday'}), 'caption': 'Higher highs. Higher lows. Price is going somewhere.'},
        {'chart': dict(RANGE, head={'tf': '1H', 'label': 'Wednesday'}), 'caption': 'High, low, high, low. Price keeps hitting the same walls.'},
        say('On both days, the 1M printed the exact same setup, near the top of the 1H.'),
        choice('Same setup. Same trade?',
            op('Same setup, same trade', chart=ch(ROOM_FAIL, play=(RET, len(ROOM_FAIL)), head={'tf': '1M', 'label': 'Wednesday'}, lines=[{'price': OBJ_NEAR, 'label': 'RANGE TOP', 'tone': 'warn', 'at': 0}], tags=[{'at': len(ROOM_FAIL) - 1, 'text': '−1R', 'tone': 'warn'}]),
               say=['On Wednesday it walked into the top of the range and turned around.', 'The candles were the same. <b>The market wasn’t.</b>']),
            op('Same setup, different market', track='ruleBasedResponses',
               say=['Tuesday’s setup had somewhere to go. Wednesday’s had a wall right above it.', 'Neither one is automatically a trade or a pass. <b>But you read them differently.</b>'])),
        pr('TREND GIVES YOU PROGRESSION. RANGE GIVES YOU BOUNDARIES. KNOW WHICH PROBLEM YOU’RE SOLVING.'),
    ]),
    old(21, 2),
    old(21, 3),
    dayli('I don’t ask “is it trending?” to get permission. <em>I ask it to know what I’m looking at.</em>'),
    reflect('How do you recognize trending vs ranging?',
            'Trending shows progression: higher highs and higher lows, distinct pullbacks. Ranging shows the same boundaries again and again. If it’s neither, I call it unclear. The label isn’t a trade decision.'),
  ], ['Same setup, different market.', 'Trend = progression. Range = boundaries.', 'UNCLEAR is an honest answer.'],
  'YOUR MODEL TELLS YOU WHAT. THE ENVIRONMENT TELLS YOU WHETHER.', 85)

# ── 24 · Clean Market: Participate ────────────────────────────────────
L[24] = lesson(P, S, 24, 'Clean Market: Participate', 'When everything lines up, you’re allowed to act.',
  'Recognize a clean, readable environment and participate without second-guessing it.',
  'Can I explain what matters here without forcing it?', [
    first_scene('Clean Market: Participate', '10:06', [
        {'chart': dict(TREND_BULL, head={'tf': '4H', 'label': 'Clear story'})},
        say('4H: clear. 1H: progressing. Nothing on the calendar. Room to the objective.', 'You can explain this chart in one breath.'),
        ch(HES, play=(HM['indication'] - 2, HM['retest'] + 1), head={'tf': '1M', 'label': '10:06'}),
        say('And now your setup, complete.'),
        th('“It looks too easy.”', '“What’s the catch?”'),
        choice('What do you do?',
            op('Take it', track='ruleBasedResponses', chart=ch(HES, play=(HM['retest'] + 1, len(HES)), head={'tf': '1M', 'label': 'You participated'}),
               say=['It worked this time. Some clean setups lose.', '<b>Participating here was the process either way.</b>']),
            op('Skip it. It feels too easy.', track='hesitationCount', chart=ch(HES, play=(HM['retest'] + 1, len(HES)), head={'tf': '1M', 'label': 'Without you'}),
               say=['Selectivity isn’t skipping the good ones.', 'When every layer clears, <b>passing is hesitation wearing a selective outfit.</b>'])),
        pr('CLEAN MEANS UNDERSTANDABLE. NOT FLAWLESS. AND NOT GUARANTEED.'),
    ]),
    old(27, 3),
    old(26, 3),
    dayli('Reading the environment isn’t about finding reasons not to trade. <em>It’s about knowing when you’re allowed to.</em>'),
    reflect('What makes an environment clean enough for you?',
            'I can explain the HTF story, the structure, the level and the room without forcing it, and nothing in my rulebook blocks it. Clean isn’t perfect, and it isn’t a guarantee.'),
  ], ['Clean = understandable without forcing.', 'When every layer clears, participate.', 'Still not a guaranteed win.'],
  'CLEAN MEANS UNDERSTANDABLE. NOT FLAWLESS.', 85)

# ── 25 · Chop: Protect ────────────────────────────────────────────────
L[25] = lesson(P, S, 25, 'Chop: Protect', 'Indication? Correction? Continuation? Again?',
  'Feel how chop keeps producing almost-setups, and protect your account instead of feeding it.',
  'Is price clear enough for my model right now?', [
    first_scene('Chop: Protect', '10:14', [
        ch(CHOP, play=(1, CHOP_AT), head={'tf': '1M', 'label': 'Around one level'}, tags=[{'at': crosses[j], 'text': t, 'tone': 'gold'} for j, t in enumerate(['I?', 'C?', 'C?', 'I?', 'C?', 'C?'])], speed=480),
        say('Close through. Close back. Close through. Close back.', 'Technically, that reads like a sequence.', '<b>Then another one. Then the opposite one.</b>'),
        th('“Technically it’s valid…”', '“Which PIL is it even?”'),
        choice('What do you do?',
            op('Take the latest sequence. Technically valid.', track=['emotionalTradesTaken'],
               chart=ch(CHOP_FAIL, play=(CHOP_AT, len(CHOP_FAIL)), head={'tf': '1M', 'label': 'Technically valid'}, tags=[{'at': len(CHOP_FAIL) - 1, 'text': '−1R', 'tone': 'warn'}]),
               say=['The chop picked a direction. Not yours.', 'Your model didn’t fail. <b>It just had nothing clear to read.</b>']),
            op('Protect. Wait for clarity.', track='ruleBasedResponses',
               chart=ch(CHOP_WAIT, play=(CHOP_AT, len(CHOP_WAIT)), head={'tf': '1M', 'label': 'You protected'}),
               say=['More chop. Nothing lost.', 'In choppy conditions, <b>protecting the account is the position.</b>'])),
        pr('REPEATED OVERLAP REDUCES CLARITY. IF EVERY LEVEL LOOKS IMPORTANT, NONE OF THEM MAY BE CLEAR ENOUGH YET.'),
    ]),
    old(22, 1),
    {'type': 'p7_rule_form', 'kicker': 'Write it calm', 'title': 'Your chop / environment rule', 'form': 'environment', 'onlyIfMissing': True,
     'punch': 'Example: “I don’t take setups inside tight consolidation when direction and the level are unclear.” Yours can differ. Not “never trade ranges”.'},
    dayli('When I’m drawing my fourth “PIL” in the same box, <em>the chart is telling me something.</em>'),
    reflect('What does chop look like to you, and what do you do in it?',
            'Overlapping candles, closes flipping across a level, PIL candidates that keep changing. My model can technically fire, but clarity is low. My environment rule decides, and usually I protect.'),
  ], ['Chop keeps producing almost-setups.', 'Many “important” levels = low clarity.', 'In chop, protect.'],
  'IN CHOPPY CONDITIONS, PROTECTING THE ACCOUNT IS THE POSITION.', 85)

# ── 26 · Between Structure: Wait ──────────────────────────────────────
ROOM_PAIR = [{'label': 'A · a wall right above', 'chart': xchart(clean, show=RET, lines=[{'price': OBJ_NEAR, 'label': '4H HIGH', 'tone': 'warn', 'at': 0}])},
             {'label': 'B · room to run', 'chart': xchart(clean, show=RET, lines=[{'price': PIL + 140, 'label': '4H HIGH', 'tone': 'ok', 'at': 0}])}]
L[26] = lesson(P, S, 26, 'Between Structure: Wait', 'Stuck between two walls.',
  'Notice when price sits between meaningful levels with no room to work, and let it pick a side first.',
  'Does this setup have room to work?', [
    first_scene('Between Structure: Wait', '10:22', [
        ch(clean, show=RET, head={'tf': '1M', 'label': '10:22'}, lines=[{'price': OBJ_NEAR, 'label': '4H HIGH', 'tone': 'warn', 'at': 0}]),
        say('A valid setup.', 'And 29 points above it: the 4H high. Your target is +60.', '<b>The trade needs to go through a wall to work.</b>'),
        th('“It’ll probably break it.”'),
        choice('What do you do?',
            op('Take it. It’ll break the high.', track=['emotionalTradesTaken'],
               chart=ch(ROOM_FAIL, play=(RET, len(ROOM_FAIL)), head={'tf': '1M', 'label': 'Into the wall'}, lines=[{'price': OBJ_NEAR, 'label': '4H HIGH', 'tone': 'warn', 'at': 0}], tags=[{'at': len(ROOM_FAIL) - 1, 'text': '−1R', 'tone': 'warn'}]),
               say=['It tagged the 4H high and turned.', 'Some days it breaks through. <b>Room was part of the context either way.</b>']),
            op('Wait for price to pick a side', track='ruleBasedResponses',
               chart=ch(ROOM_WAIT, play=(RET, len(ROOM_WAIT)), head={'tf': '1M', 'label': 'You waited'}, lines=[{'price': OBJ_NEAR, 'label': '4H HIGH', 'tone': 'warn', 'at': 0}]),
               say=['It rejected the high and drifted back into the middle.', 'Nothing to do yet. <b>Between two walls, waiting is the read.</b>'])),
        pr('PRICE SITTING BETWEEN MEANINGFUL STRUCTURE IS A REASON TO WAIT, NOT A REASON TO GUESS.'),
    ]),
    {'type': 'p7_chart_sort', 'kicker': 'Room is context', 'title': 'Same bullish setup', 'ecat': 'room',
     'buckets': [['same', 'SAME CONTEXT'], ['diff', 'DIFFERENT CONTEXT']], 'items': [{'pair': ROOM_PAIR, 'answer': 'diff', 'why': 'Same model. One has room to work.'}],
     'asks': [qq('So you never take A?', o('Never', feedback='Not automatically. Your plan decides how much room you need.'), o('Not automatically: room is part of the context I weigh', True), ecat='room')]},
    old(26, 1),
    dayli('A trade between two walls has to win twice: <em>once to exist, once to get through.</em>'),
    reflect('How do you know when you’re between structure?',
            'When meaningful levels sit just above and below and there isn’t room for my target. I let price pick a side before I commit.'),
  ], ['Room is part of the context.', 'Between walls, wait.', 'Let price pick a side.'],
  'BETWEEN MEANINGFUL STRUCTURE, WAITING IS THE READ.', 85)

# ── 27 · Almost Right: Do Nothing ─────────────────────────────────────
L[27] = lesson(P, S, 27, 'Almost Right: Do Nothing', 'Technically valid isn’t the same as worth it.',
  'Feel a setup that technically completes in a weak context, and separate validity from participation.',
  'Did the model complete? And what surrounds it?', [
    first_scene('Almost Right: Do Nothing', '9:58', [
        ch(clean, play=(cm['indication'] - 2, RET), head={'tf': '1M', 'label': '9:58'}),
        say('Every step of your model closed. Technically perfect.'),
        cards('1H · MESSY', '4H HIGH · 12 POINTS ABOVE', 'RELEASE · 10:00'),
        say('Everything <b>technically</b> looks almost right.'),
        th('“It’s valid though.”', '“I can’t skip a valid setup.”'),
        choice('What do you do?',
            op('Take it. Valid is valid.', track=['emotionalTradesTaken'],
               chart=ch(ALMOST_NEWS, play=(RET, len(ALMOST_NEWS)), head={'tf': '1M', 'label': '10:00'}, tags=[{'at': RET + 1, 'text': 'RELEASE', 'tone': 'warn'}]),
               say=['The release went straight through the setup.', '<b>Valid asked “did the model complete?”. It never asked what surrounded it.</b>']),
            op('Do nothing', track='ruleBasedResponses',
               chart=ch(ALMOST_NEWS, play=(RET, len(ALMOST_NEWS)), head={'tf': '1M', 'label': 'From the sidelines'}, tags=[{'at': RET + 1, 'text': 'RELEASE', 'tone': 'warn'}]),
               say=['You watched it from the sidelines.', 'Doing nothing when almost everything is right <b>is a skill.</b>'])),
        pr('VALID ASKS: “DID THE MODEL COMPLETE?” QUALITY ASKS: “WHAT SURROUNDS THE MODEL?”'),
    ]),
    old(27, 1),
    old(27, 2),
    old(27, 4),
    dayli('Same candles, different neighborhood. 😂 <em>The neighborhood matters.</em>'),
    reflect('When would you pass on a setup that technically completed?',
            'When my rulebook blocks it, or the context is poorly defined: messy structure, no room, news right on top of it. Technical validity doesn’t force participation.'),
  ], ['Technically valid ≠ worth participating.', 'Validity, environment and rulebook are separate reads.', 'Doing nothing is a skill.'],
  'TECHNICAL VALIDITY DOESN’T FORCE PARTICIPATION.', 85)

# ── 28 · The Fast Market ──────────────────────────────────────────────
L[28] = lesson(P, S, 28, 'The Fast Market', 'Speed isn’t direction.',
  'Feel a fast market speed up your heart rate, and read volatility as speed, never direction.',
  'Does this speed fit my tested plan?', [
    first_scene('The Fast Market', '9:41', [
        ch(BIG_GREEN, play=(4, len(BIG_GREEN)), pil=None, head={'tf': '1M', 'label': 'After a slow drift down'}, speed=420),
        say('Slow, slow, slow… then one giant green candle.'),
        th('“IT’S GOING!”', '“Get in, get in, get in.”'),
        choice('What does that candle tell you?',
            op('Bullish. Get in.', track=['emotionalTradesTaken'], say=['That candle told you how <b>fast</b> price moved.', 'It didn’t tell you where it goes next. Structure does.']),
            op('Speed. Not direction.', track='ruleBasedResponses', say=['Exactly. A fast candle is information about speed.', 'Your model still decides direction and entry.'])),
        pr('VOLATILITY TELLS YOU HOW AGGRESSIVELY PRICE IS MOVING. NOT WHERE IT HAS TO GO.'),
    ]),
    old(23, 2), old(23, 3), old(23, 4),
    old(24, 0), old(24, 2),
    dayli('Fast candles make my heart rate a market indicator. 😂 <em>It isn’t one.</em>'),
    reflect('What changes in a fast market, and what doesn’t?',
            'Speed, candle size, fills and pressure change. Direction doesn’t come from speed. I check whether the speed fits my tested plan, and around scheduled news my news rule decides.'),
  ], ['Volatility = speed, not direction.', 'Same setup, different execution experience.', 'Check it against YOUR plan.'],
  'VOLATILITY TELLS YOU HOW FAST. NOT WHERE.', 85)

# ── 29 · Outside Your Window ──────────────────────────────────────────
L[29] = lesson(P, S, 29, 'Outside Your Window', 'Open market. Closed window.',
  'Feel a beautiful setup appear after your trading window, and let your window stay closed.',
  'Is this inside the time I actually trade?', [
    first_scene('Outside Your Window', '11:17', [
        say('Your window closed at 11:00. You were cleaning up your journal.'),
        ch(clean, play=(cm['indication'] - 2, RET), head={'tf': '1M', 'label': 'MNQ', 'time': '11:17'}),
        say('11:17. The cleanest setup of the day.'),
        th('“The market’s still open.”', '“17 minutes doesn’t matter.”'),
        choice('What do you do?',
            op('Take it. The market is open.', track=['emotionalTradesTaken'], chart=ch(CHOP_FAIL, play=(CHOP_AT, len(CHOP_FAIL)), head={'tf': '1M', 'label': '11:30'}),
               say=['Midday participation thinned out and it chopped you out.', 'Some days it works. <b>Your window exists because of the days it doesn’t.</b>']),
            op('Window’s closed', track='ruleBasedResponses', say=['You screenshot it for your journal and close the platform.', 'You traded your plan’s session. <b>That’s the whole job.</b>'])),
        pr('THE MARKET MAY BE OPEN. YOUR TRADING WINDOW CAN STILL BE CLOSED.'),
    ]),
    old(25, 0), old(25, 3),
    dayli('The market trades almost all day. <em>I don’t have to.</em>'),
    reflect('Why does your trading window exist?',
            'Because my strategy behaves best during the time I tested and actually trade. A valid setup outside my window is still outside my plan.'),
  ], ['Sessions differ in participation, not guarantees.', 'Market open ≠ window open.', 'Trade your plan’s session.'],
  'THE MARKET MAY BE OPEN. YOUR WINDOW CAN STILL BE CLOSED.', 85)

# ── 30 · The Morning You Had ──────────────────────────────────────────
L[30] = lesson(P, S, 30, 'The Morning You Had', 'It’s not 9:45 anymore.',
  'Notice when the market changes mid-session, and trade what’s in front of you instead of the memory.',
  'Does my morning thesis still describe current price?', [
    first_scene('The Morning You Had', '', [
        say('You had a great morning.', 'The thesis was clear. The trend was clean. You read it perfectly.'),
        say('Now watch what happens to the market while you’re still in love with your morning.'),
    ], cta='Watch the session →'),
    old(28, 0), old(28, 1), old(28, 2),
    dayli('The 9:45 chart was beautiful. <em>It’s 11:00.</em> 😂'),
    reflect('How do you know when conditions have changed?',
            'When price reaches the objective, structure shifts, volatility changes, news approaches or the session transitions. I ask whether my morning thesis still describes current price.'),
  ], ['Markets change during a session.', 'Check in when something changes.', 'Don’t trade the memory of the market.'],
  'DON’T TRADE THE MORNING YOU HAD. TRADE THE MARKET IN FRONT OF YOU NOW.', 85)

# ── 31 · Nothing Is a Position ────────────────────────────────────────
L[31] = lesson(P, S, 31, 'Nothing Is a Position', 'This should feel like freedom.',
  'Finish a session with no trades and recognize it as a complete, correct execution.',
  'Did I read today correctly?', [
    first_scene('Nothing Is a Position', '9:40 → 11:00', [
        say('9:40. Full top-down analysis. Done.'),
        ch(WAIT_PRE, head={'tf': '1M', 'label': '10:00 · nothing'}),
        say('10:00. Nothing.', '10:30. Messy.', '11:00. No clarity. The session closes.'),
        th('“I did all that work for nothing?”'),
        choice('How do you describe today?',
            op('“I didn’t trade today.”', say=['True. But it leaves out the part you did right.']),
            op('“A wasted day.”', track='feelingAsReason', say=['Nothing was wasted. You read the market, and the market said no.']),
            op('“I read today’s environment correctly, and my execution was no position.”', track='ruleBasedResponses', say=['<b>That’s it.</b>'])),
        tal([['TRADES', '0', 'neutral'], ['RULE VIOLATIONS', '0', 'ok'], ['FORCED SETUPS', '0', 'ok'], ['VALID PASS', '✓', 'big']], stamp='SESSION COMPLETE ✓'),
        pr('NOTHING IS A POSITION. SOMETIMES PROTECTING THE DAY IS THE TRADE.'),
    ]),
    old(29, 2), old(29, 3),
    dayli('Some of my favorite sessions ended with my hands in my lap. <em>They count.</em>'),
    reflect('What does a successful no-trade day mean to you now?',
            'It means I read the environment correctly and nothing met my framework. My execution was no position. A valid pass is as process-complete as a valid win or loss.'),
  ], ['Valid win, valid loss, valid pass.', 'Nothing is a position.', 'Protecting the day can be the trade.'],
  'NOTHING IS A POSITION.', 85)

if __name__ == '__main__':
    for n, d in L.items():
        chk(d)
        write(f'p7-{n}.json', d)
