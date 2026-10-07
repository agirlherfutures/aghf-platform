"""Phase 7 · Section 20 · Reading the Environment. Lessons 21-29. THIS SECTION TEACHES SELECTIVITY."""
from p7lib import *  # noqa: F401,F403
from lib import flip as flip_sw

S = 's20'
L = {}

# ── structure charts (y down, 0..320) ───────────────────────────────────
TREND_BULL = chart([[20, 290], [90, 220], [130, 250], [220, 160], [260, 195], [350, 110], [390, 145], [480, 60], [520, 90], [600, 40]], seed=21)
TREND_BULL2 = chart([[20, 270], [110, 200], [160, 235], [250, 150], [290, 190], [380, 105], [440, 140], [530, 70], [600, 85]], seed=27)
TREND_BEAR = chart(flip_sw(TREND_BULL['swings']), seed=23)
RANGE = chart([[20, 120], [90, 240], [160, 115], [230, 245], [300, 120], [370, 240], [440, 118], [510, 242], [600, 130]], seed=25,
              hlines=[{'y': 115, 'label': 'boundary', 'tone': 'muted'}, {'y': 244, 'label': 'boundary', 'tone': 'muted'}])
RANGE2 = chart([[20, 230], [100, 110], [180, 225], [250, 105], [330, 235], [410, 112], [480, 228], [600, 150]], seed=29)
UNCLEAR = chart([[20, 200], [80, 120], [140, 230], [190, 150], [240, 260], [300, 90], [350, 210], [400, 170], [460, 240], [520, 110], [600, 190]], seed=31)
MESSY = chart([[20, 150], [60, 185], [95, 140], [130, 178], [165, 150], [200, 190], [235, 145], [270, 175], [305, 152], [340, 188], [375, 142],
               [410, 180], [445, 155], [480, 186], [515, 147], [550, 176], [600, 160]], seed=33, density=1.3)
ORDERLY = chart([[20, 260], [110, 120], [190, 230], [270, 125], [350, 228], [430, 122], [510, 226], [600, 118]], seed=35,
                hlines=[{'y': 120, 'label': 'clear boundary', 'tone': 'muted'}, {'y': 228, 'label': 'clear boundary', 'tone': 'muted'}])
LOW_VOL = chart([[20, 175], [120, 160], [200, 170], [300, 150], [380, 162], [480, 145], [600, 150]], seed=37, density=1.6)
HIGH_VOL = chart([[20, 250], [80, 60], [140, 270], [200, 50], [260, 240], [320, 40], [380, 260], [440, 70], [520, 230], [600, 80]], seed=39, density=0.6)
HIGH_VOL_DN = chart([[20, 60], [90, 250], [150, 90], [220, 280], [290, 120], [360, 290], [440, 150], [520, 300], [600, 220]], seed=41, density=0.6)
MIXED_1H = chart([[20, 250], [100, 150], [150, 210], [210, 140], [260, 200], [320, 150], [370, 205], [430, 145], [500, 195], [600, 160]], seed=43)

# ── 1M tapes (checked against the model) ────────────────────────────────
clean, cm = bull_setup(PIL, seed=3, run=26, after=10)
check(clean, cm)
va, vm = bull_setup(PIL, seed=5, run=14, after=6)
check(va, vm)
# Version B: the same story, every bar's distance from the PIL x2.5 (events are scale-invariant around the PIL)
vb = [{k: q(PIL + (v - PIL) * 2.5) for k, v in b.items() if k in 'ohlc'} for b in va]
check(vb, vm)
VRANGE = [min(b['l'] for b in vb), max(b['h'] for b in vb)]

# ICC-looking sequences in chop: closes keep flipping across the PIL
def chop_cross(seed=61):
    t = Tape(PIL - 6, seed); t.b = []
    t.drift(PIL - 3, 2, cap_hi=PIL)
    t.hl(PIL - 2, h=PIL)
    sides = [1, -1, 1, 1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, -1, -1]
    for k, s in enumerate(sides):
        t.bar(PIL + s * (1.25 + (k % 3) * 0.75), up=1.5, dn=1.5)
    return t.b
CHOP = chop_cross()
crosses = [i for i in range(1, len(CHOP)) if (CHOP[i]['c'] - PIL) * (CHOP[i - 1]['c'] - PIL) < 0]
chop_tags = []
labels = ['I?', 'C?', 'C?', 'I?', 'C?', 'C?', '↓ I?', '↑ again?', 'C?', '???']
for j, i in enumerate(crosses[:len(labels)]):
    chop_tags.append({'at': i, 'text': labels[j], 'tone': 'gold' if j < 6 else 'warn'})

# Big green candle after a down drift
t = Tape(PIL + 30, 71); t.b = []
t.drift(PIL + 10, 8)
t.drift(PIL + 4, 3)
t.bar(PIL + 34, up=2, dn=1)
BIG_GREEN = t.b

# Mid-session: clean trend 9:45 → objective at 10:15 → slows → overlap → tight range by 11:00 (3-minute bars)
t = Tape(PIL - 30, 81); t.b = []
for tgt in (-22, -26, -14, -18, -4, -8, 6, 2, 14, 22):
    t.drift(PIL + tgt, 1, jitter=0.6)
OBJ = q(t.p + 1.5)
t.b[-1]['h'] = OBJ
for tgt in (18, 20, 16, 19):
    t.drift(PIL + tgt, 1, jitter=0.4)
for tgt in (13, 19, 12, 18, 14):
    t.drift(PIL + tgt, 1, jitter=0.5)
for tgt in (15, 17, 14, 16.5, 15, 16, 14.5):
    t.bar(PIL + tgt, up=0.75, dn=0.75)
DRIFT = t.b
assert max(b['h'] for b in DRIFT[10:]) <= OBJ + 2


def note(at, text, **kw):
    d = {'at': at, 'kind': 'note', 'text': text, 'hold': 1700}
    d.update(kw)
    return d


def wsim(title, kicker, bars, start, cps, speed, **kw):
    """A watch-only playback (no trade): note checkpoints, no decision panel."""
    d = sim(title, kicker, bars, start, [dict(c, watchSay=False, expect='wait') for c in cps], mode='watch', timeline=False, **kw)
    d['speed'] = speed
    d['noStatus'] = True
    return d


def snap_expect(**kw):
    return kw


# ── 21 · Trending vs Ranging ─────────────────────────────────────────
L[21] = lesson(P, S, 21, 'Trending vs Ranging', 'Progression or boundaries?',
  'Classify the environment (trending, ranging or unclear) without turning the label into a trade decision.',
  'Which problem am I solving: progression or boundaries?', [
    mono(kicker='Phase 7 · Section 20', checks=['RULEBOOK ✓', 'RISK ✓', 'SESSION ✓', 'EMOTIONAL STATE: NEUTRAL'],
         chart=xchart(clean, show=cm['retest'] + 1, head={'tf': '1M', 'label': 'A perfect-looking ICC'}),
         thoughts=['“So I take it?”'],
         cards=['ZOOM OUT ↘', '1H: MESSY', 'COMPETING PILs', 'MAJOR OBJECTIVE RIGHT ABOVE', 'SCHEDULED EVENT IN 2 MIN'],
         lines=['YOU CHECKED YOURSELF.', 'YOU CHECKED YOUR RULES.', '<b>DID YOU CHECK THE ENVIRONMENT?</b>'],
         reveal={'eyebrow': 'PHASE 7 · SECTION 3', 'title': 'Reading the Environment 🌡️', 'sub': 'Section 1 read the trader. Section 2 read the rulebook. Section 3 reads the conditions.',
                 'mission': 'DON’T JUST ASK “IS IT VALID?” ASK “WHAT KIND OF ENVIRONMENT IS IT FORMING IN?”'}, cta='Start →'),
    {'type': 'p7_chart_sort', 'kicker': 'Two charts', 'title': 'SAME ENVIRONMENT?', 'ecat': 'trendRange',
     'buckets': [['same', 'SAME'], ['diff', 'NO: DIFFERENT']],
     'items': [{'pair': [{'label': 'A', 'chart': TREND_BULL}, {'label': 'B', 'chart': RANGE}], 'answer': 'diff',
                'why': 'A: HH · HL · HH · HL. Progression. B: high · low · high · low. Boundaries.', 'feedback': 'Look at what the highs and lows are doing in each.'}]},
    {'type': 'p7_chart_sort', 'kicker': 'Environment classifier', 'title': 'What is price doing?', 'ecat': 'trendRange',
     'buckets': [['bull', '📈 TRENDING BULLISH'], ['bear', '📉 TRENDING BEARISH'], ['range', '↔ RANGING'], ['unclear', '❓ UNCLEAR']],
     'items': [{'chart': TREND_BULL2, 'tf': '1H', 'answer': 'bull', 'why': 'Higher highs, higher lows, distinct pullbacks.', 'wrong': {'range': 'Do the highs repeat, or keep getting higher?'}},
               {'chart': RANGE2, 'tf': '1H', 'answer': 'range', 'why': 'Repeated boundaries. Back and forth.', 'wrong': {'bull': 'Is each high higher, or about the same?', 'bear': 'Is each low lower, or about the same?'}},
               {'chart': TREND_BEAR, 'tf': '1H', 'answer': 'bear', 'why': 'Lower highs, lower lows.'},
               {'chart': UNCLEAR, 'tf': '1H', 'answer': 'unclear', 'accept': [], 'why': 'Neither progression nor clean boundaries. UNCLEAR is an honest answer.',
                'wrong': {'bull': 'Is there a clear sequence of higher highs AND higher lows?', 'bear': 'Is there a clear sequence of lower highs AND lower lows?', 'range': 'Are the boundaries actually repeating?'}}],
     'asks': [qq('Chart 1 was TRENDING BULLISH. So… TAKE THE TRADE?', o('Yes, it’s trending', feedback='Trending is a classification. It isn’t a setup and it isn’t permission.'),
                 o('No: that’s a classification, not a decision', True, why='TREND ≠ TRADE. RANGE ≠ NO TRADE. Participation comes from your plan and the setup.'), ecat='trendRange')],
     'punch': '❓ UNCLEAR is always allowed. You never have to force ambiguity into a box because a quiz wants an answer.'},
    split('What each one may include', 'Two different problems', col('📈 TRENDING', ['Clearer progression', 'Directional expansion', 'Distinct pullbacks', 'Relevant swings easier to find'], 'ok'),
          col('↔ RANGING', ['Repeated boundaries', 'Overlap', 'Weaker progression', 'False breaks', 'Back and forth'], 'ink'),
          verdict='TREND GIVES YOU PROGRESSION. RANGE GIVES YOU BOUNDARIES.', together=True),
    pask('Not a shortcut', 'Repeated movement inside similar boundaries.', [
        qq('Correct read?', o('TRENDING', feedback='The highs and lows keep returning to the same areas.'), o('RANGING', True, why='Repeated boundaries.'), o('UNCLEAR', feedback='The boundaries are actually repeating cleanly here.'), ecat='trendRange'),
        qq('So: NO TRADE?', o('Yes, ranges are bad', feedback='Ranging isn’t bad. It’s a different problem.'), o('Not automatically', True, why='Your plan and the setup decide participation. This lesson is classification.')),
    ], chart=RANGE),
    mono(lines=['TREND GIVES YOU PROGRESSION.', 'RANGE GIVES YOU BOUNDARIES.', '<b>KNOW WHICH PROBLEM YOU’RE SOLVING.</b>']),
    dayli('I don’t ask “is it trending?” to get permission. <em>I ask it to know what I’m looking at.</em>'),
    reflect('How do you recognize trending vs ranging?',
            'Trending shows progression: higher highs and higher lows (or lower), distinct pullbacks. Ranging shows repeated boundaries and overlap. If it’s neither, I call it unclear. The label isn’t a trade decision.'),
  ], ['Trend = progression. Range = boundaries.', 'UNCLEAR is a valid answer.', 'Classification ≠ participation.'],
  'TREND GIVES YOU PROGRESSION. RANGE GIVES YOU BOUNDARIES.', 85)

# ── 22 · Consolidation Quality ───────────────────────────────────────
L[22] = lesson(P, S, 22, 'Consolidation Quality', 'Not all consolidation looks the same.',
  'Tell orderly consolidation from messy chop, and notice when every level starts to look important.',
  'If every level looks important, which one actually matters?', [
    split('Side by side', 'NOT ALL CONSOLIDATION LOOKS THE SAME', col('ORDERLY', ['Clear boundaries', 'Readable reactions', 'Structure understandable'], 'ok'),
          col('MESSY', ['Overlapping candles', 'Tiny competing swings', 'Close-through, close-back, again', 'PIL candidates keep changing', 'Weak progression'], 'mind'), together=True),
    {'type': 'p7_pil_click', 'kicker': 'Mark the PIL', 'title': 'Tap the level that matters',
     'clean': {'chart': TREND_BULL, 'label': 'CLEAN STRUCTURE', 'levels': [{'y': 160, 'label': 'swing high'}, {'y': 250, 'label': 'pullback low'}], 'after': 'One or two levels stand out. Easy. Next.'},
     'messy': {'chart': MESSY, 'label': 'MESSY CONSOLIDATION', 'need': 3, 'levels': [{'y': 140, 'label': 'this one?'}, {'y': 147, 'label': 'or this?'}, {'y': 155, 'label': 'this?'}, {'y': 176, 'label': 'maybe?'}, {'y': 186, 'label': 'this one?'}],
               'more': 'And another one that could be argued as important?', 'after': '<b>NOTICE THE PROBLEM?</b>'},
     'asks': [qq('If every tiny swing can be argued as important… which one actually matters?', o('The first one I tapped', feedback='Why that one over the other two?', einc='manyPils'),
                 o('Maybe none of them is clear enough yet', True, why='That’s a read, not a failure.'), ecat='clarity')],
     'punch': 'IF THE CHART MAKES EVERY LEVEL LOOK IMPORTANT, NONE OF THEM MAY BE CLEAR ENOUGH YET.'},
    mono(kicker='ICC in chop', chart=xchart(CHOP, tags=chop_tags, head={'tf': '1M', 'label': 'Tight chop around a level'}),
         lines=['Indication? Correction? Continuation?', 'Then another.', 'Then another.', 'Then the opposite sequence.', '<b>REPEATED OVERLAP CAN REDUCE STRUCTURAL CLARITY.</b>']),
    pask('Careful', 'Not “never trade consolidation”', [
        qq('Tight chop. A sequence that technically reads I → C → C. What’s the honest takeaway?', o('Never trade consolidation', feedback='That’s not the lesson. Your rulebook decides participation.'),
           o('Repeated overlap can reduce structural clarity', True, why='Clarity drops. Your environment rule (Section 2) decides what you do about it.'), o('The ICC model doesn’t work', feedback='The model is fine. The structure is unclear.'), ecat='clarity'),
    ]),
    mono(lines=['IF THE CHART MAKES', 'EVERY LEVEL LOOK IMPORTANT,', '<b>NONE OF THEM MAY BE CLEAR ENOUGH YET.</b>']),
    dayli('When I’m drawing my fourth “PIL” in the same box, <em>the chart is telling me something.</em>'),
    reflect('What’s the difference between orderly and messy consolidation?',
            'Orderly has clear boundaries and readable reactions. Messy has overlapping candles, tiny competing swings and PIL candidates that keep changing. If every level looks important, none may be clear enough yet.'),
  ], ['Orderly vs messy consolidation.', 'Many “important” levels = low clarity.', 'Overlap reduces clarity. It doesn’t ban trading.'],
  'IF EVERY LEVEL LOOKS IMPORTANT, NONE MAY BE CLEAR ENOUGH YET.', 85)

# ── 23 · Low vs High Volatility ──────────────────────────────────────
L[23] = lesson(P, S, 23, 'Low Volatility vs High Volatility', 'Speed isn’t direction.',
  'Read volatility as how aggressively price moves, never as where it has to go, and check it against your plan.',
  'Does this volatility fit my tested risk and execution plan?', [
    {'type': 'p7_chart_sort', 'kicker': 'Volatility lens', 'title': 'Same instrument. Same scale. LOWER or HIGHER?', 'ecat': 'volatility',
     'buckets': [['lower', '🐢 LOWER'], ['higher', '⚡ HIGHER']],
     'items': [{'chart': LOW_VOL, 'answer': 'lower', 'why': 'Small candles, slower and tighter movement, limited expansion.'},
               {'chart': HIGH_VOL, 'answer': 'higher', 'why': 'Larger candles, rapid movement, aggressive swings through levels.'},
               {'chart': HIGH_VOL_DN, 'answer': 'higher', 'why': 'Higher volatility, heading DOWN. Volatility didn’t tell you that. Structure did.'}],
     'asks': [qq('Charts 2 and 3: both higher volatility. Same direction?', o('Yes', feedback='One climbs, one falls.', einc='volAsDirection'), o('No', True, why='VOLATILITY ≠ DIRECTION.'), ecat='volatility')]},
    pask('Classify it', 'BIG GREEN CANDLE.', [
        qq('BULLISH THESIS CONFIRMED?', o('YES, look at it', feedback='Price is moving FAST. That answers speed. What answers direction?', einc='volAsDirection'),
           o('NOT FROM CANDLE SIZE ALONE', True, why='Size tells you how aggressively price moved. Structure tells you direction.'), ecat='volatility'),
    ], chart=xchart(BIG_GREEN, pil=None, head={'tf': '1M', 'label': 'After a slow drift down'})),
    wsim('VERSION A', 'The same setup, slower', va, vm['indication'] - 2,
         [note(vm['indication'], 'Indication.'), note(vm['correction'], 'Correction.'), note(vm['continuation'], 'Continuation.'), note(vm['retest'], 'Retest. <b>Plenty of time to think.</b>', hold=2200)],
         1500, scen={'range': VRANGE}, intro='Version A: the candles print slowly.', end={'card': 'Same model. Watch the next one.'}),
    wsim('VERSION B', 'The same setup, faster', vb, vm['indication'] - 2,
         [note(vm['retest'], 'Retest. <b>Already?</b> 😳', hold=1400)],
         320, scen={'range': VRANGE}, intro='Version B: the same conceptual setup. Bigger candles. Faster prints.',
         end={'ask': ask('WHAT CHANGED?',
              opt('The direction', feedback='Both are the same bullish ICC.'),
              opt('Speed, movement, potential fills, emotional pressure and risk considerations', correct=True, why='Same model. Different execution experience.'),
              opt('The setup became invalid', feedback='The candle-close story is identical. Only the scale and speed changed.'), stack=True)}),
    pask('Your plan, not a universal rule', 'High volatility. Valid setup.', [
        qq('What do you do about the volatility?', o('Always cut size in high volatility', feedback='Only if YOUR tested plan defines that adjustment. There’s no universal rule here.'),
           o('Check it against my tested risk + execution plan: follow its adjustment if defined, otherwise REASSESS', True, why='DOES THIS VOLATILITY FIT YOUR TESTED PLAN?'),
           o('Size up, it’s moving', feedback='Movement isn’t edge. And size comes from your risk plan.'), ecat='volatility'),
        qq('Low volatility. Is it automatically safer?', o('Yes', feedback='Lower volatility isn’t a safety signal. It’s a speed reading.'), o('No', True, why='Low volatility ≠ safety. High volatility ≠ direction.')),
    ]),
    mono(lines=['VOLATILITY TELLS YOU', 'HOW AGGRESSIVELY PRICE IS MOVING.', '<b>NOT WHERE IT HAS TO GO.</b>']),
    dayli('Fast candles make my heart rate a market indicator. 😂 <em>It isn’t one.</em>'),
    reflect('What changes in high volatility?',
            'Speed, candle size, intrabar swings, potential fills and the emotional pressure. Not the direction. I check whether it fits my tested risk and execution plan, and reassess if my plan doesn’t cover it.'),
  ], ['Volatility = speed, not direction.', 'Same setup, different execution experience.', 'Check it against YOUR plan.'],
  'VOLATILITY TELLS YOU HOW AGGRESSIVELY PRICE IS MOVING. NOT WHERE IT HAS TO GO.', 85)

# ── 24 · News Conditions ─────────────────────────────────────────────
L[24] = lesson(P, S, 24, 'News Conditions', 'Scheduled means known.',
  'See how a scheduled release changes the environment, and apply the news rule you already built.',
  'What does my saved news rule say right now?', [
    {'type': 'p7_timeline', 'kicker': 'The clock', 'title': 'Watch the environment change', 'rule': 'news', 'useMine': True,
     'example': 'No new entries within 5 minutes before selected high-impact events.',
     'rows': [{'t': '9:52', 'text': 'Normal conditions.', 'tone': 'ok'}, {'t': '9:56', 'text': 'A setup is forming.', 'state': 'DEVELOPING', 'tone': 'ink'},
              {'t': '9:59', 'text': 'Scheduled release approaching.', 'state': 'EVENT', 'tone': 'warn'}, {'t': '10:00', 'text': 'Large repricing.', 'state': '⚡', 'tone': 'mind'}],
     'asks': [qq('Did the setup exist in the same environment for the entire sequence?', o('Yes, it’s the same chart', feedback='Same chart. Different conditions minute to minute.'),
                 o('No', True, why='THE SETUP DIDN’T EXIST IN THE SAME ENVIRONMENT FOR THE ENTIRE SEQUENCE.'), ecat='news')]},
    mono(kicker='Scheduled events can temporarily alter', cards=['VOLATILITY', 'LIQUIDITY', 'FILLS / SLIPPAGE', 'CANDLE SIZE', 'STRUCTURAL BEHAVIOR'],
         lines=['But news does NOT automatically invalidate every setup.', '<b>YOUR PREDEFINED RULE DECIDES.</b>']),
    {'type': 'p7_rulecheck', 'kicker': 'Integration', 'title': 'Valid ICC. Event in 4 minutes.', 'check': 'news', 'situation': {'minutesToEvent': 4}, 'rcat': 'news', 'ecat': 'news',
     'facts': [['Current environment', 'NEWS EVENT APPROACHING'], ['Event', 'in 4 minutes'], ['Setup', 'valid Dayli ICC']],
     'punch': 'Your saved rule. Not re-written, not re-negotiated. Just read.'},
    pask('Before the session', 'Where does the event time come from?', [
        qq('Tomorrow there’s a scheduled release. How do you know?', o('The Academy tells me in the simulator', feedback='Simulator events are practice. The Academy never invents real news events.'),
           o('I check a real economic calendar before my session', True, why='Then your news rule already knows what to do.'), o('I’ll notice when the candle gets big', feedback='That’s the surprise this lesson exists to prevent.'), ecat='news'),
    ]),
    mono(lines=['A SCHEDULED EVENT', 'SHOULDN’T SURPRISE YOU', '<b>JUST BECAUSE THE CANDLE DID.</b>']),
    dayli('The calendar is public. <em>Read it before the bell, not after the candle.</em>'),
    reflect('How does a scheduled event change your environment, and what decides your response?',
            'It can change volatility, liquidity, fills and candle size around the release. It doesn’t automatically invalidate a setup. My saved news rule decides, and I check the calendar before the session.'),
  ], ['Events temporarily change the environment.', 'News ≠ automatic invalidation.', 'Your saved rule decides.'],
  'A SCHEDULED EVENT SHOULDN’T SURPRISE YOU JUST BECAUSE THE CANDLE DID.', 85)

# ── 25 · Session Behavior ────────────────────────────────────────────
L[25] = lesson(P, S, 25, 'Session Behavior', 'Open market. Closed window.',
  'Apply market sessions to your own trading window, without session stereotypes.',
  'How does my strategy behave during the time I actually trade?', [
    {'type': 'p7_timeline', 'kicker': 'Phase 1, applied', 'title': 'Participation changes through the day', 'rule': 'session', 'useMine': True, 'example': 'My trading window: 9:45–11:00',
     'rows': [{'t': 'PREMARKET', 'text': 'Participation building.', 'tone': 'ink'}, {'t': 'OPEN', 'text': 'Activity often expands around opens.', 'tone': 'warn'},
              {'t': 'MID-MORNING', 'text': 'Can stay active, can settle.', 'tone': 'ok'}, {'t': 'MIDDAY', 'text': 'Participation can thin out.', 'tone': 'ink'},
              {'t': 'AFTERNOON', 'text': 'Can pick back up. Or not.', 'tone': 'ink'}],
     'asks': [qq('Which session ALWAYS trends?', o('New York', feedback='“Always” is a stereotype. Sessions vary day to day.'), o('London', feedback='Same problem: “always”.'),
                 o('None of them always does anything', True, why='Times differ in participation, volume and volatility. Not in guarantees.'), ecat='session')],
     'punch': 'Not “trade here”. Just: the market you trade at 9:50 isn’t the market at 12:30.'},
    mono(lines=['THE REAL QUESTION:', '<b>HOW DOES YOUR STRATEGY BEHAVE DURING THE TIME YOU ACTUALLY TRADE?</b>']),
    pask('Example plan', 'MY TRADING WINDOW: 9:45–11:00. Valid setup at 11:17.', [
        qq('VALID DAYLI ICC?', o('Potentially, yes', True, why='Time doesn’t change the candle-close story.'), o('No, it’s late', feedback='The model doesn’t check the clock. Your plan does.')),
        qq('ALLOWED BY MY PLAN?', o('Yes, it’s valid', feedback='Valid setup. The window closed 17 minutes ago.'), o('NO', True, why='Valid setup. Window closed.'), ecat='session'),
    ], chart=xchart(clean, show=cm['retest'] + 1, head={'tf': '1M', 'label': 'MNQ', 'time': '11:17'})),
    {'type': 'p7_rulecheck', 'kicker': 'Now with YOUR rulebook', 'title': 'Valid setup at 11:17', 'check': 'session', 'situation': {'time': '11:17'}, 'rcat': 'session', 'ecat': 'session',
     'facts': [['Clock', '11:17'], ['Setup', 'valid Dayli ICC']]},
    mono(lines=['THE MARKET MAY BE OPEN.', '<b>YOUR TRADING WINDOW CAN STILL BE CLOSED.</b>']),
    dayli('The market trades almost all day. <em>I don’t have to.</em>'),
    reflect('How does time of day affect your trading?',
            'Participation, volume and volatility can change around opens and through the day, without guarantees. My plan defines my window. A valid setup outside it is still outside my plan.'),
  ], ['Sessions differ in participation, not guarantees.', 'No session stereotypes.', 'Market open ≠ window open.'],
  'THE MARKET MAY BE OPEN. YOUR TRADING WINDOW CAN STILL BE CLOSED.', 85)

# ── 26 · Clean vs Messy Environment ──────────────────────────────────
L[26] = lesson(P, S, 26, 'Clean vs Messy Environment', 'Understandable, not flawless.',
  'Bring the factors together and practice explaining what matters without forcing it.',
  'Can I explain what matters without forcing it?', [
    split('Not a magic status', 'What each MAY have', col('CLEANER', ['Clear 4H story', 'Readable 1H', 'Relevant levels identifiable', 'Progression understandable', 'Volatility manageable for the plan', 'Room toward the objective'], 'ok'),
          col('MESSIER', ['Unclear HTF', 'Tight chop', 'Conflicting swings', 'Competing PILs', 'Fakeouts', 'Unfamiliar volatility', 'Limited room'], 'mind'),
          verdict='NOT “IS THIS CHART PERFECT?” BUT “CAN I EXPLAIN WHAT MATTERS WITHOUT FORCING IT?”', together=True),
    {'type': 'p7_explain', 'kicker': 'Explain the chart', 'title': 'Three observations. That’s all.', 'chart': MIXED_1H, 'acceptAll': True, 'prompt': 'Explain what matters in 3 observations.',
     'punch': 'Not auto-marked. If you needed eight caveats, ask: is the chart unclear… or am I trying to force clarity?'},
    pask('Check the definition', '“It’s clean because I found a reason for every candle.”', [
        qq('Clean?', o('Yes, every candle is explained', feedback='Finding a reason for every candle can be forcing it.'),
           o('Clean means the relevant context is understandable without excessive forcing', True, why='Understandable, not over-explained.'), ecat='clarity'),
    ]),
    {'type': 'p7_snapshot', 'kicker': 'Environment Snapshot', 'title': 'Describe it. Don’t score it.',
     'charts': [{'label': '4H', 'chart': TREND_BULL}, {'label': '1H', 'chart': TREND_BULL2}],
     'facts': [['Volatility', 'Typical for her tested plan'], ['Calendar', 'Nothing scheduled in her window'], ['Clock', '9:58 · her window 9:45–11:00'], ['Objective', '4H high, well above'], ['1M', 'Indication closed. Correction not yet.']],
     'expect': snap_expect(htfClarity='CLEAR', oneHourStructure='PROGRESSING', volatilityState='NORMAL FOR PLAN', newsContext='CLEAR', sessionContext='IN MY WINDOW', roomToObjective='AVAILABLE', setupCleanliness='DEVELOPING'),
     'ecat': {'htfClarity': 'clarity', 'oneHourStructure': 'trendRange', 'volatilityState': 'volatility', 'newsContext': 'news', 'sessionContext': 'session', 'roomToObjective': 'room'},
     'why': {'setupCleanliness': 'Indication only. It’s still developing.', 'roomToObjective': 'The 4H high is well above.', 'volatilityState': 'Typical for her plan.'},
     'asks': [qq('Supportive environment, ICC still developing. Entry?', o('Yes, the environment is great', feedback='The environment can’t create an entry.'), o('WAIT', True, why='ENVIRONMENT CANNOT CREATE AN ENTRY. The model still has to complete.'), ecat='pass')],
     'punch': 'Descriptive states, one honest sentence. More useful than “Environment score 87”.'},
    mono(lines=['CLEAN MEANS UNDERSTANDABLE.', '<b>NOT FLAWLESS.</b>']),
    dayli('If I need a paragraph to justify the chart, <em>the chart already answered.</em>'),
    reflect('What does “clean” mean to you now?',
            'Clean means I can explain what matters, the HTF story, the structure, the level and the room, without forcing it. It doesn’t mean perfect, and it doesn’t mean guaranteed.'),
  ], ['Clean = understandable, not flawless.', 'Too many caveats is information.', 'Environment can’t create an entry.'],
  'CLEAN MEANS UNDERSTANDABLE. NOT FLAWLESS.', 85)

# ── 27 · Technically Valid vs High-Quality ───────────────────────────
PSTEPS_A = [
    {'key': 'trader', 'ask': qq('TRADER: what’s happening with me?', o('Calm. No personal stop triggered.', True, short='CLEARED'), o('I need this trade', feedback='Not in this scenario. She’s calm.'))},
    {'key': 'rulebook', 'ask': qq('RULEBOOK: her news rule blocks entries within 5 minutes. Event in 2.', o('Within rules', feedback='2 minutes is inside her 5-minute window.'), o('BLOCKED', True, why='Her news rule.'), rcat='news', ecat='news')},
    {'key': 'environment', 'ask': qq('ENVIRONMENT: tight chop, objective 12 points above, conflicting 4H.', o('SUPPORTIVE', feedback='Chop, no room, conflicting HTF.'), o('MIXED', feedback='Close. Every factor is weakening here.'), o('POORLY DEFINED', True), ecat='clarity')},
    {'key': 'setup', 'ask': qq('SETUP: PIL · I · C · C · retest, all closed.', o('VALID', True), o('INVALID', feedback='Every step closed. It’s technically valid.'), o('INCOMPLETE', feedback='The retest printed.'))},
]
PSTEPS_B = [
    {'key': 'trader', 'ask': qq('TRADER?', o('Calm. No personal stop triggered.', True, short='CLEARED'))},
    {'key': 'rulebook', 'ask': qq('RULEBOOK: first trade, in her window, nothing scheduled, risk within plan.', o('ALLOWED', True), o('BLOCKED', feedback='Which rule would block it?')), },
    {'key': 'environment', 'ask': qq('ENVIRONMENT: clear 4H, readable 1H, room to the objective.', o('SUPPORTIVE', True), o('POORLY DEFINED', feedback='Everything here is readable.')), },
    {'key': 'setup', 'ask': qq('SETUP: the same closed sequence.', o('VALID', True), o('INVALID', feedback='Same sequence as Setup A.'))},
]
PSTEPS_B[1]['ask']['ecat'] = 'pass'
L[27] = lesson(P, S, 27, 'Technically Valid vs High-Quality', 'Same model. Different context.',
  'Separate setup validity, the environment read and your rulebook, then decide.',
  'Did the model complete? And what surrounds it?', [
    split('One of the most important lessons', 'Setup A vs Setup B',
          col('SETUP A', ['PIL ✓ · Indication ✓', 'Correction ✓ · Continuation ✓', 'Retest ✓', '<b>But:</b> tight chop', 'Objective close', 'News imminent', 'Conflicting HTF'], 'mind'),
          col('SETUP B', ['PIL ✓ · Indication ✓', 'Correction ✓ · Continuation ✓', 'Retest ✓', '<b>And:</b> clear thesis', 'Readable structure', 'Room to objective', 'Within plan'], 'ok'), together=True,
          asks=[qq('SAME MODEL?', o('YES', True), o('No', feedback='Both completed every step.')),
                qq('SAME CONTEXT?', o('Yes', feedback='Look at what surrounds each one.'), o('NO', True)),
                qq('DOES TECHNICAL VALIDITY FORCE PARTICIPATION?', o('Yes, valid is valid', feedback='Valid answers “did the model complete?”. Not “should I participate?”.', einc='forcedTrades'), o('NO', True, why='Same technical model ≠ identical opportunity.'), ecat='pass')]),
    mono(kicker='Not A / B / C grades', cards=['SETUP VALIDITY · VALID / INVALID / INCOMPLETE', 'ENVIRONMENT READ · SUPPORTIVE / MIXED / POORLY DEFINED', 'MY RULEBOOK · ALLOWED / BLOCKED'],
         lines=['Three separate reads.', '<b>THEN YOU DECIDE: TAKE · WAIT · PASS.</b>', 'No grade does it for you.']),
    {'type': 'p7_participation', 'kicker': 'The AGHF Participation Check', 'title': 'Setup A', 'chart': xchart(clean, show=cm['retest'] + 1, head={'tf': '1M', 'label': 'Setup A'}),
     'facts': [['1H', 'Tight chop'], ['Objective', '4H high 12 points above'], ['News', 'High-impact in 2 minutes'], ['Her news rule', 'No new entries within 5 minutes']],
     'steps': PSTEPS_A, 'decision': {'correct': 'PASS', 'options': ['TAKE', 'WAIT', 'PASS'], 'ecat': 'pass', 'why': 'Valid setup. Blocked by her rule, in a poorly defined environment.',
        'feedback': {'TAKE': 'Did the model complete? Yes. Does that force participation? No.', 'WAIT': 'Nothing is left to form. The question is participation.'}},
     'whys': ['ICC valid, HTF clear, within rules, room available', 'Technically valid, but her news rule blocks entry', 'ICC developing, Continuation not confirmed'], 'whyCorrect': 1,
     'setupState': 'VALID', 'passReason': 'News rule + poorly defined environment', 'rulebookContext': 'News rule blocks entries within 5 minutes'},
    {'type': 'p7_participation', 'kicker': 'The AGHF Participation Check', 'title': 'Setup B', 'chart': xchart(clean, show=cm['retest'] + 1, head={'tf': '1M', 'label': 'Setup B'}),
     'facts': [['4H', 'Clear bullish story'], ['1H', 'Readable progression'], ['Objective', 'Plenty of room'], ['Calendar', 'Nothing scheduled'], ['Clock', '10:06 · in window']],
     'steps': PSTEPS_B, 'decision': {'correct': 'TAKE', 'options': ['TAKE', 'WAIT', 'PASS'], 'ecat': 'pass', 'why': 'TAKE can be an appropriate process decision. Still not a guaranteed win.',
        'feedback': {'PASS': 'Every layer cleared. Passing here isn’t selectivity, it’s hesitation.', 'WAIT': 'What are you waiting for? The retest printed.'}},
     'whys': ['ICC valid, HTF clear, within rules, room available', 'Technically valid, but the news rule blocks entry', 'Structure too unclear for my consolidation rule'], 'whyCorrect': 0,
     'punch': 'A process decision. Not a guaranteed win.'},
    pask('Two edge cases', 'Environment can’t do the model’s job', [
        qq('Environment SUPPORTIVE. ICC never completes. Entry?', o('Yes, conditions are great', feedback='Conditions can’t complete the model.', einc='forcedTrades'), o('NO ENTRY', True, why='Environment cannot create an entry.'), ecat='pass'),
        qq('ICC completes. You read the environment as MIXED. Your rulebook still allows it. What now?', o('Automatic PASS: it says MIXED', feedback='MIXED is a description, not a block. Reason from YOUR framework.'),
           o('Reason from my framework: my rules allow it, so it’s my call to make', True, why='The label doesn’t decide. Your plan and your read do.'), ecat='pass'),
    ]),
    mono(lines=['VALID ASKS: “DID THE MODEL COMPLETE?”', '<b>QUALITY ASKS: “WHAT SURROUNDS THE MODEL?”</b>']),
    dayli('Same candles, different neighborhood. 😂 <em>The neighborhood matters.</em>'),
    reflect('What’s the difference between technically valid and high-quality?',
            'Valid means the model completed: PIL, Indication, Correction, Continuation, retest. Quality is what surrounds it: HTF, structure, room, news, session and my rules. Technical validity doesn’t force participation.'),
  ], ['Validity, environment and rulebook are separate reads.', 'Same model ≠ same opportunity.', 'TAKE is a process decision, not a guarantee.'],
  'VALID ASKS “DID THE MODEL COMPLETE?” QUALITY ASKS “WHAT SURROUNDS THE MODEL?”', 85)

# ── 28 · When Conditions Change Mid-Session ──────────────────────────
mid_cps = [
    note(2, '<b>9:51.</b> Clear bullish progression. Readable structure. ENVIRONMENT: <b>SUPPORTIVE</b>.'),
    note(10, '<b>10:15.</b> Objective reached. 🎯'),
    note(14, '<b>10:27.</b> Movement slows.'),
    note(19, '<b>10:42.</b> Overlap.'),
    {'at': len(DRIFT) - 1, 'kind': 'ask', 'ask': qq('<b>11:00.</b> Tight consolidation. CURRENT ENVIRONMENT?',
        o('STILL TRENDING: the morning was trending', feedback='YOU’RE TRADING THE MEMORY OF THE MARKET. 😭', einc='forcedTrades'),
        o('Changed: objective reached, now consolidating. REASSESS.', True, why='Don’t trade the morning you had.'),
        o('Bearish now', feedback='Slowing and overlapping isn’t bearish. It’s different.'), ecat='reassess', stack=True), 'goal': True},
]
mid = sim('Live time', '9:45 · the session begins', DRIFT, 1, mid_cps, setups=[{'pil': None, 'pilAt': None}], actions=['wait'], timeline=False,
          intro='9:45. Watch the environment. Not just the candles.', end={'card': 'DON’T TRADE THE MORNING YOU HAD. TRADE THE MARKET IN FRONT OF YOU NOW.'})
mid['clock'] = {'start': '9:45', 'step': 3, 'from': 0}
mid['speed'] = 750
mid['noStatus'] = True
L[28] = lesson(P, S, 28, 'When Conditions Change Mid-Session', 'The morning isn’t the market.',
  'Notice when the environment changes during a session and reassess instead of trading the memory.',
  'Does my original thesis still describe current price?', [
    mid,
    mono(kicker='Environment Check-In', cards=['Objective reached', 'Major structural change', 'New setup after a long gap', 'Volatility change', 'News approaching', 'Session transition'],
         lines=['Not every five minutes.', '<b>When something changes.</b>']),
    pask('Environment Check-In', 'After the objective was reached', [
        qq('HAS PRICE REACHED THE OBJECTIVE?', o('YES', True), o('No', feedback='10:15. 🎯'), ecat='reassess'),
        qq('DID WE ENTER CONSOLIDATION?', o('YES', True), o('No', feedback='Overlap, then a tight range.')),
        qq('DOES MY ORIGINAL THESIS STILL DESCRIBE CURRENT PRICE?', o('Yes, the morning was bullish', feedback='The morning was. Is now?', einc='forcedTrades'),
           o('Not anymore: REASSESS', True, why='New conditions get a new read.'), ecat='reassess'),
    ], chart=xchart(DRIFT, pil=None, head={'tf': '1M', 'label': 'MNQ', 'time': '11:00'}, lines=[{'price': OBJ, 'label': 'OBJECTIVE', 'tone': 'ok', 'at': 9}])),
    mono(lines=['DON’T TRADE', 'THE MORNING YOU HAD.', '<b>TRADE THE MARKET IN FRONT OF YOU NOW.</b>']),
    dayli('The 9:45 chart was beautiful. <em>It’s 11:00.</em> 😂'),
    reflect('How do you know when conditions have changed?',
            'When price reaches the objective, structure shifts, volatility changes, news approaches, the session transitions or a new setup shows up after a long gap. I ask whether my original thesis still describes current price, and reassess if it doesn’t.'),
  ], ['Environments change during a session.', 'Check in when something changes.', 'Don’t trade the memory of the market.'],
  'DON’T TRADE THE MORNING YOU HAD. TRADE THE MARKET IN FRONT OF YOU NOW.', 85)

# ── 29 · Knowing When to Sit Out ─────────────────────────────────────
L[29] = lesson(P, S, 29, 'Knowing When to Sit Out', 'This should feel like freedom.',
  'Recognize the valid pass as a complete trading result, never a missed or failed day.',
  'Did I follow the process, whether or not I traded?', [
    {'type': 'p7_timeline', 'kicker': 'A full session', 'title': 'Analysis done. Then…',
     'rows': [{'t': '9:40', 'text': 'Full top-down analysis completed.', 'state': '✓', 'tone': 'ok'}, {'t': '10:00', 'text': 'Nothing.', 'tone': 'ink'},
              {'t': '10:30', 'text': 'Messy.', 'tone': 'ink'}, {'t': '11:00', 'text': 'No clarity. Session closes.', 'tone': 'ink'}],
     'asks': [qq('RESULT?', o('FAILED DAY', feedback='What failed? You followed every step.'), o('MISSED DAY', feedback='Nothing was missed. Nothing formed.'),
                 o('NO OPPORTUNITY', feedback='True, nothing formed. But the result is about your process.'), o('VALID PASS', True, why='Process followed. No trade taken.'), ecat='pass', stack=True)]},
    tally('The result', 'Not “0 trades 😔”', [['TRADES', '0', 'neutral'], ['RULE VIOLATIONS', '0', 'ok'], ['FORCED SETUPS', '0', 'ok'], ['VALID PASS', '✓', 'big']],
          complete=True, stamp='SESSION COMPLETE ✓', note='No red $0. A no-trade day isn’t incomplete activity. It’s a complete session.'),
    mono(kicker='Three good process outcomes', cards=['VALID WIN', 'VALID LOSS', 'VALID PASS'],
         lines=['Process followed. Trade wins.', 'Process followed. Trade loses.', 'Process followed. No trade taken.', '<b>ALL THREE: PROCESS-COMPLETE.</b>']),
    {'type': 'p7_participation', 'kicker': 'Your turn', 'title': '10:48. Nothing has met your framework all session.', 'chart': MESSY,
     'facts': [['4H', 'Mixed'], ['1H', 'Messy overlap'], ['1M', 'Nothing formed'], ['Clock', '10:48 · window ends 11:00']],
     'thought': ['“I did all that analysis for nothing?”'],
     'steps': [{'key': 'feel', 'ask': qq('WHAT AM I FEELING?', o('Pressure to make the analysis “pay”', True, short='PRESSURE', why='Noticed. It doesn’t get to choose.'), o('Nothing', feedback='The thought bubble says otherwise. 😂'))},
               {'key': 'environment', 'ask': qq('ENVIRONMENT?', o('SUPPORTIVE', feedback='Messy overlap, mixed 4H.'), o('POORLY DEFINED', True), ecat='clarity')},
               {'key': 'setup', 'ask': qq('SETUP?', o('VALID', feedback='Nothing formed.'), o('NOT FORMED', True))}],
     'decision': {'correct': 'PASS', 'options': ['TAKE LEAST-BAD', 'DROP A TIMEFRAME', 'FORCE A TRADE', 'PASS'], 'ecat': 'pass', 'why': 'VALID PASS.',
                  'feedback': {'TAKE LEAST-BAD': 'Least bad is still not your framework.', 'DROP A TIMEFRAME': 'Zooming in until ICC appears is forcing it.', 'FORCE A TRADE': 'The session doesn’t have to produce a trade.'}},
     'whys': ['Nothing met my full participation framework', 'I was bored', 'The analysis has to pay'], 'whyCorrect': 0, 'setupState': 'NOT FORMED', 'passReason': 'Nothing met the framework all session',
     'punch': 'Saved as a VALID PASS. Your journal counts it.'},
    mono(lines=['NO TRADE IS A VALID TRADING RESULT.', '<b>SOMETIMES PROTECTING THE DAY IS THE TRADE.</b>']),
    dayli('Some of my favorite sessions ended with my hands in my lap. <em>They count.</em>'),
    reflect('When would you pass on a valid ICC, or on the whole session?',
            'When my rulebook blocks it, the environment is poorly defined for my plan, or nothing meets my full participation framework. A valid pass is process-complete, same as a valid win or a valid loss.'),
  ], ['Valid win, valid loss, valid pass.', 'A no-trade session is complete.', 'Protecting the day can be the trade.'],
  'SOMETIMES PROTECTING THE DAY IS THE TRADE.', 85)

if __name__ == '__main__':
    for n, d in L.items():
        chk(d)
        write(f'p7-{n}.json', d)
    print('crosses', crosses[:10], 'drift bars', len(DRIFT))
