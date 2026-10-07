"""Phase 7 (v2) · Section 2 · Rules That Protect You. Lessons 14-22.
Your trading rules weren't written for the version of you who feels disciplined.
They were written for the version of you who doesn't."""
import json
from v2lib import *  # noqa: F401,F403
from v2tapes import *  # noqa: F401,F403
from p7lib import pask, lesson, dayli, reflect, write, chk, qq, o, mono, split, col, sort, xchart, mtape, at, E, SL, TP, PIL, P, Tape, bull_setup, check, q, chart

S = 's19'
L = {}
P6_23 = json.load(open('/home/user/aghf-platform/agihf/lessons-data/p6-23.json', encoding='utf-8'))
DAILY_SETUP = next(s for s in P6_23['slides'] if s['type'] == 'daily_stop')['setup']

clean, cm = bull_setup(PIL, seed=3, run=26, after=10)
check(clean, cm)
CLEAN_FAIL = ext(clean[:cm['retest'] + 1], [(PIL - 8, 3), (PIL - 22, 3), (PIL - 29, 2)], 4, cap_hi=PIL + 3)

# “But this one looks good”: Continuation wicked through, never closed
_af, AFM = bull_setup(PIL, seed=55, chop=2, cont_wick=True, run=18, after=5)
check(_af, {k: AFM[k] for k in ('indication', 'correction', 'continuation', 'retest')})
ALMOST_FULL = ext(_af, [(PIL + 30, 3), (PIL + 45, 3)], 56, cap_lo=PIL + 2)
ALMOST = ALMOST_FULL[:AFM['contWick'] + 1]
ALMOST_FAIL = ext(ALMOST, [(PIL - 9, 3), (PIL - 20, 3), (PIL - 28, 2)], 57, cap_hi=PIL)
check(ALMOST_FAIL, {'indication': AFM['indication'], 'correction': AFM['correction']})

# Moving the stop: slides to −30, keeps going (or, the dangerous version, comes back)
STOPA, STOPA_E = mtape([5, 9, 2, -6, -13, -19, -24, -28], seed=95)
STOP_HIT = STOPA + [{'o': STOPA[-1]['c'], 'h': STOPA[-1]['c'] + 1, 'l': SL - 1.5, 'c': SL - 0.5}]
STOP_RUN = ext(STOPA, [(E - 40, 3), (E - 52, 3), (E - 61, 2)], 96)
STOP_BACK = ext(STOPA, [(E - 36, 2), (E - 20, 3), (E - 2, 3), (E + 14, 3)], 97)
STOP_CP = at(STOPA_E, 6)

# The missed fill: your limit at the retest, price stops a tick above it
_mf, MFM = bull_setup(PIL, seed=61, run=12, after=0)
MISS = _mf[:MFM['retest']] + [{'o': _mf[MFM['retest'] - 1]['c'], 'h': q(PIL + 4), 'l': q(PIL + 0.5), 'c': q(PIL + 3)}]
MISS = ext(MISS, [(PIL + 14, 3), (PIL + 26, 3)], 62, cap_lo=PIL + 1)
MISS_AT = len(MISS)
MISS_RUN = ext(MISS, [(PIL + 40, 3), (PIL + 62, 3)], 63, cap_lo=PIL + 18)
MISS_CHASE = ext(MISS, [(PIL + 12, 3), (PIL - 2, 3), (PIL - 6, 2)], 64)

# The news you already knew about: a valid setup at 9:57, a release at 10:00
NEWS_PRE = clean[:cm['retest'] + 1]
_n = Tape(NEWS_PRE[-1]['c'], 65); _n.b = []
_n.bar(PIL + 3, up=1, dn=1); _n.bar(PIL + 2, up=1, dn=1)
_n.b.append({'o': PIL + 2, 'h': PIL + 6, 'l': PIL - 46, 'c': PIL - 38})      # 10:00: the release
_n.p = PIL - 38
_n.drift(PIL - 18, 2); _n.drift(PIL + 10, 3)
NEWS = NEWS_PRE + _n.b
NEWS_BAR = len(NEWS_PRE) + 2

TREND_CHOP = chart([[20, 290], [80, 230], [120, 255], [190, 180], [230, 205], [300, 130], [330, 160], [360, 128], [390, 158], [420, 126],
                    [450, 156], [480, 124], [510, 154], [540, 128], [570, 152], [600, 132]], seed=11)

# ── 14 · Written While Calm ───────────────────────────────────────────
L[14] = lesson(P, S, 14, 'Written While Calm', 'Your rules weren’t written for the disciplined you.',
  'See why you write rules while calm that you’ll want to break while emotional, and how strategy rules differ from personal ones.',
  'Who was this rule written for?', [
    scene('Phase 7 · Section 2', 'Sunday night', [
        say('Sunday night. Coffee. Calm.', 'You write three lines in your plan:'),
        cards('MAXIMUM 2 TRADES', 'STOP FOR THE DAY AT −2R', 'NO CHASING'),
        say('Easy. Obviously. Who would ever break those?'),
        say('<b>Thursday. 10:40.</b>', 'Two valid losses. −2R. Your daily stop.'),
        ch(clean, play=(cm['indication'] - 2, cm['retest'] + 1), head={'tf': '1M', 'label': '10:40'}),
        say('And now the cleanest setup you’ve seen all week.'),
        th('“That rule was for a normal day.”', '“This one is different.”', '“Just this once.”'),
        choice('What do you do?',
            op('Just this once', track=['overtradeCount', 'emotionalTradesTaken'],
               chart=ch(CLEAN_FAIL, play=(cm['retest'] + 1, len(CLEAN_FAIL)), head={'tf': '1M', 'label': 'Just this once'}, tags=[{'at': len(CLEAN_FAIL) - 1, 'text': '−1R', 'tone': 'warn'}]),
               say=['−3R. A day your plan capped at −2.', 'And if it had won? “Just this once” would become “just this kind of day”.'], tally=[['DAY', '−3R', 'mind'], ['RULES BROKEN', '1', 'mind']]),
            op('Session over. Close the platform.', track='ruleBasedResponses',
               chart=ch(clean, play=(cm['retest'] + 1, len(clean)), head={'tf': '1M', 'label': 'Without you'}),
               say=['It worked. Without you.', 'You followed a rule while the chart made it look wrong. <b>That’s the only time a rule is ever tested.</b>'], tally=[['DAY', '−2R · capped', 'neutral'], ['RULES BROKEN', '0', 'ok']])),
        say('Sunday-you saw this coming.', 'She knew Thursday-you would feel exactly like this.'),
        pr('YOUR TRADING RULES WEREN’T WRITTEN FOR THE VERSION OF YOU WHO FEELS DISCIPLINED. THEY WERE WRITTEN FOR THE VERSION OF YOU WHO DOESN’T.'),
    ], cta='Start →'),
    split('Two kinds of rules', 'Two different questions', col('YOUR MODEL’S RULES', ['Correct PIL', 'Candle-close Indication', 'Correction', 'Continuation', 'Valid retest'], 'ink', sub='Does the setup exist?'),
          col('YOUR PERSONAL RULES', ['Risk per trade', 'Daily stop', 'Maximum trades', 'Session', 'No chasing', 'News'], 'mind', sub='Am I allowed to participate?'), together=True,
          verdict='A VALID SETUP DOESN’T OUTRANK YOUR RISK RULES.'),
    {'type': 'p7_gate', 'kicker': 'Before every trade', 'title': 'The gates, in order',
     'layers': [{'key': 'strategy', 'label': 'MY MODEL', 'q': 'Is the setup actually valid?', 'state': 'yes'},
                {'key': 'risk', 'label': 'MY ACCOUNT', 'q': 'Risk fits? Daily stop? Size?', 'state': 'no', 'note': 'Daily stop reached.'},
                {'key': 'rulebook', 'label': 'MY RULEBOOK', 'q': 'Session · news · max trades · no chase · environment', 'state': 'yes'}],
     'status': 'SESSION OVER', 'verdict': 'VALID SETUP. NO PARTICIPATION.'},
    dayli('Calm-you is smarter than heated-you. <em>Let her write the rules. Let them speak when you can’t.</em>'),
    reflect('Which rule do you most want to break when you’re emotional?',
            'The one that stops me: my daily stop or my max trades. I wrote it calm for exactly the moment I’ll want to break it.'),
  ], ['Rules are written for the emotional you.', 'Model rules: does the setup exist?', 'Personal rules: may I participate?'],
  'YOUR RULES WERE WRITTEN FOR THE VERSION OF YOU WHO DOESN’T FEEL DISCIPLINED.', 85)

# ── 15 · “But This One Looks Good.” ───────────────────────────────────
L[15] = lesson(P, S, 15, '“But This One Looks Good.”', 'The setup that almost meets your rules.',
  'Feel the pull of an almost-valid setup and see why “almost” isn’t a rule.',
  'Does it meet my rules, or does it just look good?', [
    scene('“But This One Looks Good.”', '10:09', [
        ch(ALMOST, play=(AFM['indication'] - 2, len(ALMOST)), head={'tf': '1M', 'label': '10:09'}, tags=[{'at': AFM['contWick'], 'text': 'WICK, NO CLOSE', 'tone': 'warn'}]),
        say('Indication. Correction.', 'Then a candle spikes through the PIL… and closes back below.'),
        say('Your model needs a <b>close</b> for Continuation. You don’t have one.'),
        th('“It’s basically there.”', '“That wick counts. Kind of.”', '“But this one looks GOOD.”'),
        choice('What do you do?',
            op('Take it. It’s basically there.', track=['emotionalTradesTaken'],
               chart=ch(ALMOST_FAIL, play=(len(ALMOST), len(ALMOST_FAIL)), head={'tf': '1M', 'label': 'Basically there'}, tags=[{'at': len(ALMOST_FAIL) - 1, 'text': '−1R', 'tone': 'warn'}]),
               say=['It never closed through.', '“Basically” isn’t in your model. <b>It’s in your mood.</b>']),
            op('Wait for the close', track='ruleBasedResponses',
               chart=ch(ALMOST_FULL, play=(len(ALMOST), len(ALMOST_FULL)), head={'tf': '1M', 'label': 'You waited'}, tags=[{'at': AFM['continuation'], 'text': 'CLOSED', 'tone': 'gold'}, {'at': AFM['retest'], 'text': 'RETEST', 'tone': 'gold'}]),
               say=['This time it closed, retested, and became the trade.', 'Some days it never closes. Either way, <b>the rule decided, not the look.</b>'])),
        say('Your plan doesn’t have a rule called “it looks good”.', 'If it did, every setup would qualify.'),
        pr('ALMOST MEETING YOUR RULES IS NOT MEETING YOUR RULES.'),
    ]),
    mono(kicker='The exception trap', lines=['Rule: “I only enter after a Continuation close.”', 'A beautiful setup appears.', 'FREEZE.', '<b>UNLESS WHAT? 😂</b>']),
    pask('When can an exception exist?', 'UNLESS WHAT?', [
        qq('When is a legitimate exception to your rule allowed?', o('When the setup feels special', feedback='That’s the exception being invented in real time.', rinc='exceptions'),
           o('Only if it was written into your rulebook before the session', True, why='Defined in advance. Not created because this one looks good.'), rcat='daily')]),
    dayli('“Unless” is the most expensive word in trading. 😂'),
    reflect('What does “but this one looks good” usually mean for you?',
            'It means the setup is almost there and I want it to count. Almost meeting my rules is not meeting them. Exceptions only exist if I wrote them in advance.'),
  ], ['Almost isn’t a rule.', 'A wick isn’t a close.', 'Exceptions are written in advance, never live.'],
  'ALMOST MEETING YOUR RULES IS NOT MEETING YOUR RULES.', 85)

# ── 16 · Moving the Stop ──────────────────────────────────────────────
L[16] = lesson(P, S, 16, 'Moving the Stop', 'When −1R feels harder than abandoning the plan.',
  'Feel the urge to give a losing trade more room, and see what a moved stop really costs.',
  'Is my stop a plan, or a suggestion?', [
    scene('Moving the Stop', 'In a valid long', [
        ch(STOPA, play=(STOPA_E, STOP_CP + 1), **dict(pil=None, lines=trade_lines(STOPA_E), head={'tf': '1M', 'label': 'Long 2 MNQ'})),
        say('Valid entry. It never really got going.', '−13. −19. <b>−24.</b>', 'Your stop is at −30.'),
        th('“Just give it a little more room.”', '“It’s going to come back.”', '“I can’t take another loss today.”'),
        say('Accepting −1R suddenly feels harder than abandoning the entire plan.'),
        choice('What do you do?',
            op('Move the stop down. Give it room.', track=['fearDrivenManagementCount', 'emotionalTradesTaken'],
               chart=ch(STOP_RUN, play=(STOP_CP + 1, len(STOP_RUN)), pil=None, lines=trade_lines(STOPA_E, stop_label='STOP −30 (moved)'), head={'tf': '1M', 'label': 'Long 2 MNQ'}),
               say=['It kept going.', '<b>−2R.</b> The stop you moved was the only thing between you and this.'], tally=[['RESULT', '−2R', 'mind'], ['RULES BROKEN', '1 · stop moved', 'mind']]),
            op('Move the stop down (and this time it comes back)', track=['fearDrivenManagementCount'],
               chart=ch(STOP_BACK, play=(STOP_CP + 1, len(STOP_BACK)), pil=None, lines=trade_lines(STOPA_E, stop_label='STOP −30 (moved)'), head={'tf': '1M', 'label': 'Long 2 MNQ'}),
               say=['It came back. +14.', '<b>This is the most dangerous outcome in this lesson.</b>', 'Now your stop is a suggestion. The day it doesn’t come back, there’s no floor.']),
            op('Let the stop do its job', track='ruleBasedResponses',
               chart=ch(STOP_HIT, play=(STOP_CP + 1, len(STOP_HIT)), pil=None, lines=trade_lines(STOPA_E), head={'tf': '1M', 'label': 'Long 2 MNQ'}),
               say=['−1R. Exactly what you planned to risk.', 'Not fun. <b>Completely survivable.</b>'], tally=[['RESULT', '−1R · valid', 'neutral'], ['RULES BROKEN', '0', 'ok']])),
        who('THE TRADER', ['Decided the price of being wrong before entry.'], 'THE HOPE', ['Renegotiates it every tick.']),
        pr('−1R IS THE PRICE OF BEING WRONG. A MOVED STOP MAKES THE PRICE UNLIMITED.'),
    ]),
    dayli('A stop you move isn’t a stop. <em>It’s a wish with a number on it.</em>'),
    reflect('What makes you want to move a stop?',
            'Hope that it comes back, not wanting another loss, not wanting to be wrong. My stop is the price of being wrong, decided before entry. Moving it removes the limit.'),
  ], ['The stop is decided before entry.', 'The worst outcome is when moving it works.', '−1R is survivable. Unlimited isn’t.'],
  'A MOVED STOP MAKES THE PRICE OF BEING WRONG UNLIMITED.', 85)

# ── 17 · The Missed Trade ─────────────────────────────────────────────
L[17] = lesson(P, S, 17, 'The Missed Trade', 'You did everything right. You just didn’t get filled.',
  'Feel the sting of a missed fill and write a no-chase rule with no loophole.',
  'Is missing it a reason to invent a new entry?', [
    scene('The Missed Trade', '10:12', [
        ch(MISS, play=(MFM['indication'] - 2, MFM['retest'] + 1), head={'tf': '1M', 'label': 'Your limit sits at the PIL'}, tags=[{'at': MFM['retest'], 'text': '1 TICK AWAY', 'tone': 'warn'}]),
        say('Your limit order sits right at the retest.', 'Price comes down… and stops one tick above it.', '<b>You did everything right. You just didn’t get filled.</b>'),
        ch(MISS, play=(MFM['retest'] + 1, MISS_AT), head={'tf': '1M', 'label': 'And it leaves'}),
        th('“That was MY trade.”', '“I can still get in.”', '“It’s only a few points.”'),
        choice('Price is +26 from your level. What do you do?',
            op('Market-buy. It was your trade.', track=['fomoDecisionCount', 'emotionalTradesTaken'],
               chart=ch(MISS_CHASE, play=(MISS_AT, len(MISS_CHASE)), head={'tf': '1M', 'label': 'You chased'}, tags=[{'at': len(MISS_CHASE) - 1, 'text': '−1R', 'tone': 'warn'}]),
               say=['It came back to where your limit was. Through your new stop.', 'The trade you planned had a stop. <b>The trade you chased had a worse one.</b>']),
            op('Let it go. Mark it MISSED ACCORDING TO PLAN.', track='fomoRecognized',
               chart=ch(MISS_RUN, play=(MISS_AT, len(MISS_RUN)), head={'tf': '1M', 'label': 'Without you'}),
               say=['It ran. Without you.'], tally=[['MISSED OPPORTUNITY', 'hypothetical', 'neutral'], ['ACCOUNT CHANGE', '$0', 'ok'], ['RULES BROKEN', '0', 'ok']])),
        pr('MISSING THE ENTRY DOESN’T GIVE YOU PERMISSION TO INVENT A NEW ONE.'),
    ]),
    {'type': 'p7_rule_write', 'kicker': 'Write it while you’re calm', 'title': 'Your no-chase rule', 'weak': 'I won’t chase too much.',
     'critique': ['TOO MUCH = HOW MUCH? 😂', '“I’ll try not to enter late.”', 'TRY? 😭'],
     'options': [{'text': 'I’ll only chase if it really looks strong.', 'feedback': '“Really” is a loophole with a bow on it. 😂'},
                 {'text': 'If my planned entry is missed and price moves away, I do not market-enter late. I wait for a new valid setup.', 'correct': True, 'why': 'Clear. Triggered. Actionable. Decided in advance.'},
                 {'text': 'I’ll be more patient next time.', 'feedback': 'Nothing triggers it and nothing tells you what to do instead.'}],
     'rcat': 'noChase', 'allowCustom': True, 'save': 'noChase', 'customLabel': 'Keep this one, or write it in your words. It saves to MY AGHF RULEBOOK.'},
    dayli('A missed fill stings. <em>A chased fill costs.</em>'),
    reflect('Write your no-chase rule in one sentence.',
            'If my planned entry is missed and price moves away, I do not market-enter late. I mark it missed according to plan and wait for a new valid setup.'),
  ], ['A missed fill isn’t a loss.', 'Missing it isn’t permission.', 'Your no-chase rule, written calm.'],
  'MISSING THE ENTRY DOESN’T GIVE YOU PERMISSION TO INVENT A NEW ONE.', 85)

# ── 18 · Done Means Done ──────────────────────────────────────────────
L[18] = lesson(P, S, 18, 'Done Means Done', 'Stopping is an execution skill.',
  'Treat your maximum trades and daily stop as part of executing, and set your own daily stop.',
  'Is my session over, according to my plan?', [
    scene('Done Means Done', '10:12', [
        cards('TRADE 1 · −1R · valid', 'TRADE 2 · −1R · valid', 'DAILY STOP · −2R · REACHED'),
        say('Two valid losses. Your daily stop.', 'And then…'),
        ch(clean, play=(cm['indication'] - 2, cm['retest'] + 1), head={'tf': '1M', 'label': 'The cleanest setup of the day'}),
        th('“Of COURSE it shows up now.”', '“One trade gets the whole day back.”'),
        choice('What do you do?',
            op('Take it. It’s A+.', track=['overtradeCount', 'emotionalTradesTaken'],
               chart=ch(clean, play=(cm['retest'] + 1, len(clean)), head={'tf': '1M', 'label': 'It worked'}),
               say=['It worked. +2R. Day back to flat.', 'So tomorrow the daily stop is −2R… <b>unless the setup is good.</b>', 'Which is every setup, when you’re down.']),
            op('Done. The plan already decided.', track='ruleBasedResponses',
               chart=ch(clean, play=(cm['retest'] + 1, len(clean)), head={'tf': '1M', 'label': 'Replay mode'}),
               say=['It worked. You watched it in replay.', 'You lost the trade. <b>You kept the rule.</b> The rule is worth more over a year.'])),
        pr('WHEN YOUR TRADING DAY IS OVER, BEING DONE IS THE EXECUTION.'),
    ]),
    {'type': 'p7_rule_form', 'kicker': 'Write it calm', 'title': 'Your daily stop', 'form': 'dailyStop',
     'punch': 'Example: stop after −2R or 2 full losses, whichever comes first. An example, not a prescription.'},
    {'type': 'daily_stop', 'kicker': 'Session lock', 'title': 'When the stop is reached, the session changes', 'setup': DAILY_SETUP,
     'punch': 'TAKE TRADE disabled. REVIEW · JOURNAL · REPLAY · STUDY.'},
    dayli('Some days the best trade I take is <em>closing the platform</em>.'),
    reflect('What is your daily stop, and what happens when you hit it?',
            'My daily stop is decided in advance. When it’s reached, the session is over, even if an A+ setup appears. I switch to review, journal and replay.'),
  ], ['Your max and your daily stop end the session.', 'An A+ setup doesn’t reopen it.', 'Done is part of execution.'],
  'WHEN YOUR TRADING DAY IS OVER, BEING DONE IS THE EXECUTION.', 85)

# ── 19 · The News You Already Knew About ──────────────────────────────
L[19] = lesson(P, S, 19, 'The News You Already Knew About', 'It was on the calendar.',
  'Feel a valid setup three minutes before a scheduled release, and build the news rule you’ll follow.',
  'What does my rule say when an event is scheduled?', [
    scene('The News You Already Knew About', '9:57', [
        cards('CALENDAR · HIGH-IMPACT RELEASE · 10:00', 'YOU SAW IT THIS MORNING'),
        ch(NEWS_PRE, play=(cm['indication'] - 2, len(NEWS_PRE)), head={'tf': '1M', 'label': '9:57'}),
        say('9:57. A valid setup. First retest.', 'The release is in three minutes.'),
        th('“It’ll probably be fine.”', '“I’ll be in and out before it hits.”'),
        choice('What do you do?',
            op('Take it', track=['emotionalTradesTaken'],
               chart=ch(NEWS, play=(len(NEWS_PRE), len(NEWS)), head={'tf': '1M', 'label': '10:00'}, tags=[{'at': NEWS_BAR, 'text': 'RELEASE', 'tone': 'warn'}]),
               say=['10:00. One candle went straight through your stop.', 'Fast candles around a release can fill you <b>worse</b> than your stop price.', 'It wasn’t bad luck. <b>It was on the calendar.</b>']),
            op('Pass. Wait for the release to settle.', track='ruleBasedResponses',
               chart=ch(NEWS, play=(len(NEWS_PRE), len(NEWS)), head={'tf': '1M', 'label': 'From the sidelines'}, tags=[{'at': NEWS_BAR, 'text': 'RELEASE', 'tone': 'warn'}]),
               say=['You watched it from the sidelines.', 'Some days the setup survives the release. You don’t need it to. <b>Your rule already decided.</b>'])),
        say('News doesn’t automatically make every setup invalid.', 'But a scheduled event shouldn’t surprise you <b>just because the candle did</b>.'),
        pr('“I FORGOT NEWS WAS COMING OUT” IS NOT A MARKET CONDITION. IT’S A PREPARATION PROBLEM.'),
    ]),
    {'type': 'p7_rule_form', 'kicker': 'Write it calm', 'title': 'Your news rule', 'form': 'news',
     'punch': 'No template is universally correct. Use the one you’ll actually follow. The Academy never invents news events or rules for you.'},
    dayli('The calendar is public. <em>Read it before the bell, not after the candle.</em>'),
    reflect('What is your news rule, and why that one?',
            'My rule is decided before the session for the events I check on the calendar. I don’t invent it live, and I follow it even when the skipped setup wins.'),
  ], ['Scheduled events are known in advance.', 'Your response is decided before the session.', 'Fast candles can fill worse than your stop.'],
  'A SCHEDULED EVENT SHOULDN’T SURPRISE YOU JUST BECAUSE THE CANDLE DID.', 85)

# ── 20 · The Rule You Keep Negotiating ────────────────────────────────
L[20] = lesson(P, S, 20, 'The Rule You Keep Negotiating', 'Optional rules don’t protect you.',
  'Spot the rule you keep bending, close its loophole, and change rules only in review.',
  'Is this rule protecting me, or am I negotiating with it?', [
    scene('The Rule You Keep Negotiating', 'Your journal, this week', [
        cards('MON · chased “just a little”', 'TUE · 3rd trade “it was A+”', 'WED · stop moved “just this once”', 'THU · chased “it was different”'),
        say('Four days. Four different reasons.', '<b>The same rule, every time.</b>'),
        th('“It’s not really breaking it.”', '“The rule doesn’t fit this situation.”'),
        say('If a rule becomes optional when you’re emotional, it isn’t protecting you.', 'It’s just decorating your plan.'),
        choice('What do you do with this rule?',
            op('Delete it. It doesn’t fit me.', track='feelingAsReason',
               say=['Maybe it really doesn’t fit. But you decided that on Thursday, mid-chase.', 'That’s the worst possible moment to judge a rule.']),
            op('Close the loophole and keep it', track='ruleBasedResponses',
               say=['Find the word you keep hiding behind. “Really”. “Basically”. “Just”.', 'Write the rule so live-trading-you can’t argue with it.']),
            op('Flag it for review. Follow it until then.', track='ruleBasedResponses',
               say=['Maybe it needs changing. That happens in review, calm, with your journal open.', '<b>Not mid-session.</b>'])),
        pr('IF A RULE BECOMES OPTIONAL WHEN YOU’RE EMOTIONAL, IT ISN’T PROTECTING YOU.'),
    ]),
    {'type': 'p7_rule_write', 'kicker': 'Close the loophole', 'title': 'Find the escape hatch', 'weak': 'I won’t chase unless it looks really good.',
     'critique': ['“UNLESS IT LOOKS REALLY GOOD” 😭', 'Every setup looks really good when you want in.'],
     'options': [{'text': 'I won’t chase unless I’m really sure.', 'feedback': 'Same loophole, new outfit. 😂'},
                 {'text': 'If my planned entry is missed and price moves away, I do not market-enter late. I wait for a new valid setup.', 'correct': True, 'why': 'No loophole left.'}],
     'rcat': 'noChase', 'allowCustom': True, 'save': 'noChase'},
    {'type': 'p7_rule_queue', 'kicker': 'Rules change in review', 'title': 'Flagged rules wait here', 'body': 'In a session, rules are read-only. Flag a rule and it waits here until you review it calmly.'},
    dayli('If I have to argue with my rule, <em>the rule already won the argument. I wrote it for this.</em>'),
    reflect('Which rule do you negotiate with most, and what’s your favorite excuse?',
            'I notice the word I use to escape it. I close the loophole, and if the rule truly needs changing I flag it and change it in review, never mid-session.'),
  ], ['Optional rules don’t protect you.', 'Find the loophole word.', 'Change rules in review, never live.'],
  'IF A RULE BECOMES OPTIONAL WHEN YOU’RE EMOTIONAL, IT ISN’T PROTECTING YOU.', 85)

# ── 21 · When You Break One ───────────────────────────────────────────
L[21] = lesson(P, S, 21, 'When You Break One', 'Investigate. Don’t punish.',
  'Break a rule (it happens), skip the shame spiral, and turn it into an IF / THEN response.',
  'What will I do when this trigger shows up again?', [
    scene('When You Break One', 'It happened', [
        say('You missed a winner this morning.', 'Then you chased the next one.', 'It lost.'),
        th('“I’m SO undisciplined.”', '“What is wrong with me?”', '“I don’t deserve to trade.”'),
        say('Stop there.'),
        choice('What do you do now?',
            op('Punish yourself: no trading for a week', track='feelingAsReason',
               say=['Punishment feels like responsibility.', 'But it teaches you nothing about <b>next Tuesday at 10:04</b>, when the same trigger shows up.']),
            op('Ignore it. Tomorrow’s a new day.', track='feelingAsReason',
               say=['Then the trigger stays exactly where it is, waiting for you.']),
            op('Investigate it like a detective', track='ruleBasedResponses',
               say=['Which rule? What happened right before? What were you trying to get or avoid?', 'What will you do <b>next time</b> that trigger shows up?'])),
        pr('DON’T JUST JOURNAL WHAT YOU DID WRONG. JOURNAL WHAT YOU’LL DO WHEN THE TRIGGER RETURNS.'),
    ]),
    {'type': 'p7_violation', 'kicker': 'Your violation review', 'title': 'You chased.',
     'scenario': ['You missed the previous winner (no retest).', 'Thought: “I can’t miss another.”', 'Next move: you market-entered late.'],
     'thought': 'I can’t miss another.', 'violationType': 'Chase', 'behavior': 'chase',
     'steps': {'rule': {'options': ['No-chase rule', 'Daily stop', 'News rule', 'Max trades'], 'correct': 'No-chase rule'},
               'before': {'options': ['Missed a winner', 'A big win', 'News', 'Boredom'], 'correct': 'Missed a winner'},
               'goal': {'options': ['Avoid missing out', 'Recover money', 'Protect profit', 'Avoid a loss'], 'correct': 'Avoid missing out'},
               'action': {'options': ['No market entry after a missed retest', 'Enter smaller', 'Wait one candle, then enter'], 'correct': 'No market entry after a missed retest'}},
     'ifPrefill': 'I miss a winner', 'thenPrefill': 'screenshot it, mark it MISSED ACCORDING TO PLAN, and wait for a new valid setup',
     'punch': 'Saved. The next time a missed winner shows up, your answer is already written.'},
    {'type': 'p7_seen', 'kicker': 'The electric part ⚡', 'source': 'trigger',
     'fallbackLine': 'A missed winner often creates an urge to chase the next one.', 'punch': 'This is what the Academy shows you whenever this trigger comes back.'},
    dayli('A broken rule is data about a trigger. <em>Turn it into a plan, not a punishment.</em>'),
    reflect('What will you do the next time your trigger shows up?',
            'I review it: which rule, what happened right before, what I wanted, and IF this trigger happens again THEN what I’ll do. No shame, just a plan.'),
  ], ['Investigate, don’t punish.', 'Find the trigger.', 'Finish with IF / THEN.'],
  'JOURNAL WHAT YOU’LL DO WHEN THE TRIGGER RETURNS.', 85)

# ── 22 · Your Rulebook ────────────────────────────────────────────────
L[22] = lesson(P, S, 22, 'Your Rulebook', 'Calm-you, writing for emotional-you.',
  'Assemble MY AGHF RULEBOOK: your model’s rules, your risk, your session and your five non-negotiables.',
  'What will I read before every session?', [
    scene('Your Rulebook', '', [
        say('Everything you’ve felt in this phase, you’ll feel again.', 'After a win. After a loss. On a slow Tuesday. With rent due.'),
        say('So right now, while you’re calm, you’re going to write the voice that speaks for you then.'),
        pr('THIS ISN’T A LIST OF RULES. IT’S A LETTER FROM CALM-YOU TO EMOTIONAL-YOU.'),
    ], cta='Build it →'),
    {'type': 'p7_rulebook', 'kicker': 'A milestone', 'title': '📕 MY AGHF RULEBOOK',
     'intro': ['PHASE 1: MARKET FOUNDATIONS ✓', 'PHASE 2: STRUCTURE ✓', 'PHASE 3: PRICE READING ✓', 'PHASE 4: DIRECTION ✓', 'PHASE 5: YOUR MODEL ✓', 'PHASE 6: EXECUTION ✓', 'PHASE 7: THE TRADER ✓'],
     'parts': ['intro', 'method', 'risk', 'session', 'behavior', 'five', 'when']},
    {'type': 'p7_rulebook_view', 'kicker': 'Your rulebook', 'title': 'MY AGHF RULEBOOK', 'mode': 'review',
     'punch': 'REVIEW MODE: editable. SESSION MODE: read-only. Open it any time from your Academy.'},
    dayli('Read it before every session. <em>Out loud, if you have to.</em> 😂'),
    reflect('What are your five non-negotiables?',
            'My five are the rules I don’t negotiate during a session. They change only in review, with evidence.'),
  ], ['Your rulebook speaks when you can’t.', 'Five non-negotiables.', 'Read it before every session.'],
  'A LETTER FROM CALM-YOU TO EMOTIONAL-YOU.', 85)

if __name__ == '__main__':
    for n, d in L.items():
        chk(d)
        write(f'p7-{n}.json', d)
