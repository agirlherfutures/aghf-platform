"""Phase 7 · Section 20 checkpoint: Market Conditions Lab, Knowledge Check, Check-In, Phase 7 Final Gate,
final reflection, Phase 7 completion and the Phase 8 transition."""
import copy
import v2tapes as B
from p7lib import PIL as _PIL
B.wait_c = B.chop(26, 51, center=_PIL - 12, amp=5)
from build_s20 import (TREND_BULL, TREND_BULL2, TREND_BEAR, RANGE, RANGE2, UNCLEAR, MESSY, ORDERLY, LOW_VOL, HIGH_VOL, HIGH_VOL_DN,
                       MIXED_1H, CHOP, clean, cm, DRIFT, OBJ, mid, wsim, note)
from p7lib import *  # noqa: F401,F403

S = 's20'
RET = xchart(clean, show=cm['retest'] + 1, head={'tf': '1M', 'label': 'MNQ'})


def lvl(name, concept, slide, **kw):
    d = dict(slide); d.update({'name': name, 'concept': concept}); d.update(kw); return d


def rc(check_, title, situation, setup_='valid', **kw):
    d = {'type': 'p7_rulecheck', 'title': title, 'check': check_, 'situation': situation, 'setup': setup_,
         'rcat': check_ if check_ in ('news', 'session') else {'environment': 'environment', 'maxTrades': 'maxTrades'}.get(check_, check_),
         'ecat': {'news': 'news', 'session': 'session', 'environment': 'clarity'}.get(check_)}
    d.update(kw)
    return d


def part(title, steps, decision, whys=None, why_correct=None, **kw):
    d = {'type': 'p7_participation', 'title': title, 'steps': steps, 'decision': decision}
    if whys: d['whys'] = whys; d['whyCorrect'] = why_correct
    d.update(kw)
    return d


def st(key, prompt, *opts, **kw):
    return {'key': key, 'ask': qq(prompt, *opts, **kw)}


T_OK = st('trader', 'TRADER?', o('Calm. No personal stop triggered.', True, short='CLEARED'), o('I need a trade today', feedback='Not in this session. Read what’s actually true.'))
RB_OK = lambda text='First trade · in window · nothing scheduled': st('rulebook', f'RULEBOOK: {text}', o('ALLOWED', True), o('BLOCKED', feedback='Which rule would block it?'))
ENV = lambda correct, prompt, cat='clarity': st('environment', f'ENVIRONMENT: {prompt}', *[o(x, x == correct, feedback=None if x == correct else 'Read the layers again: structure, room, news, volatility.') for x in ('SUPPORTIVE', 'MIXED', 'POORLY DEFINED')], ecat=cat)
SET = lambda correct, prompt: st('setup', f'SETUP: {prompt}', *[o(x, x == correct, feedback=None if x == correct else 'Read the closes again.') for x in ('VALID', 'INCOMPLETE', 'NOT FORMED', 'INVALID')])
DEC = lambda correct, why, opts=('TAKE', 'WAIT', 'PASS'), fb=None, skill=None: {k: v for k, v in {'correct': correct, 'options': list(opts), 'ecat': 'pass', 'why': why, 'feedback': fb or {}, 'skill': skill}.items() if v is not None}
WHYS = ['ICC valid, HTF clear, within rules, room available', 'ICC developing, Continuation not confirmed', 'Technically valid, but a personal rule blocks entry', 'Structure too unclear for my plan', 'Nothing met my full participation framework']

# A session where nothing forms (from Section 18's waiting simulator)
nothing = wsim('The whole session', '9:45 → 11:00', B.wait_c, 3,
               [note(8, '<b>10:00.</b> Nothing.'), note(16, '<b>10:30.</b> Messy.'), note(len(B.wait_c) - 1, '<b>11:00.</b> No clarity. Session closes.')], 600,
               end={'card': 'SESSION COMPLETE ✓'})
nothing['clock'] = {'start': '9:45', 'step': 3, 'from': 3}
mid_lab = copy.deepcopy(mid); mid_lab['speed'] = 520

NEAR = PIL + 30
FAR = PIL + 140
room_pair = [{'label': 'A · 4H high right above', 'chart': xchart(clean, show=cm['retest'] + 1, lines=[{'price': NEAR, 'label': '4H HIGH', 'tone': 'warn', 'at': 0}])},
             {'label': 'B · plenty of room', 'chart': xchart(clean, show=cm['retest'] + 1, lines=[{'price': FAR, 'label': '4H HIGH', 'tone': 'ok', 'at': 0}])}]

# ── Final Boss: SHOULD YOU EVEN BE TRADING THIS? Seven randomized sessions ─────────────
def boss(name, events, hud_time='9:40'):
    return {'type': 'p7_session', 'title': f'Session {name}', 'hud': {'time': hud_time, 'status': 'SESSION MODE · rules read-only'}, 'events': events,
            'review': 'env', 'reviewKicker': '🌡️ Your environment reasoning review', 'reviewTitle': 'Observable decisions only',
            'reviewClean': 'You read the conditions in front of you, not the ones you wanted. That’s selectivity.'}


PRE = {'title': 'Before the session · 9:40', 'slide': pask('', '4H and 1H, before anything forms', [
    qq('ENVIRONMENT READ?', o('SUPPORTIVE', True, why='Clear HTF story, readable progression.'), o('POORLY DEFINED', feedback='Both timeframes progress cleanly.'), ecat='clarity')], chart=TREND_BULL2)}
PRE_MESSY = {'title': 'Before the session · 9:40', 'slide': pask('', '4H mixed. 1H overlapping.', [
    qq('ENVIRONMENT READ?', o('SUPPORTIVE', feedback='Overlap and competing swings.'), o('POORLY DEFINED', True, why='Hard to explain without forcing.'), ecat='clarity')], chart=MESSY)}
take_clean = lambda t: {'title': f'{t} · a setup', 'hud': {'time': t}, 'slide': part('', [T_OK, RB_OK(), ENV('SUPPORTIVE', 'clear 4H, readable 1H, room to the objective'), SET('VALID', 'I · C · C closed, first retest')],
                        DEC('TAKE', 'Every layer cleared. A process decision, not a guaranteed win.', fb={'PASS': 'Every layer cleared. What blocked it?', 'WAIT': 'The retest printed. Nothing left to wait for.'}),
                        WHYS, 0, chart=RET), 'after': {'status': 'TRADE TAKEN · PROCESS ✓', 'statusTone': 'ok'}}
VARIANTS = [
    boss('A', [PRE, take_clean('10:06')]),
    boss('B', [PRE,
               {'title': '9:58 · setup 1', 'hud': {'time': '9:58'}, 'slide': rc('news', 'Valid ICC. Event in 3 minutes.', {'minutesToEvent': 3}, chart=RET, facts=[['Event', 'in 3 minutes']])},
               {'title': '10:31 · setup 2', 'hud': {'time': '10:31'}, 'slide': rc('environment', 'Tight consolidation. A technical ICC.', {'env': 'tight-consolidation'}, chart=xchart(CHOP), facts=[['1H', 'Tight consolidation']])},
               {'title': '11:12 · setup 3', 'hud': {'time': '11:12'}, 'slide': rc('session', 'The cleanest one yet. 11:12.', {'time': '11:12'}, chart=RET, facts=[['Clock', '11:12']])}], ),
    boss('C', [PRE_MESSY, {'title': '9:45 → 11:00', 'slide': nothing},
               {'title': '11:00 · result', 'hud': {'time': '11:00'}, 'slide': part('', [ENV('POORLY DEFINED', 'messy all session'), SET('NOT FORMED', 'nothing completed')],
                    DEC('VALID PASS', 'Process followed. No trade taken.', ('TAKE LEAST-BAD', 'DROP A TIMEFRAME', 'FORCE A TRADE', 'VALID PASS'),
                        {'TAKE LEAST-BAD': 'Least bad isn’t your framework.', 'DROP A TIMEFRAME': 'Zooming in until ICC appears is forcing it.', 'FORCE A TRADE': 'The session doesn’t owe you a trade.'}), WHYS, 4,
                    setupState='NOT FORMED', passReason='Nothing met the framework')}]),
    boss('D', [PRE, {'title': '9:45 → 11:00', 'slide': mid_lab},
               {'title': '11:02 · something technical', 'hud': {'time': '11:02'}, 'slide': part('', [T_OK, ENV('POORLY DEFINED', 'objective reached, tight overlap since 10:42', 'reassess'), SET('VALID', 'a tiny I · C · C in the range')],
                    DEC('PASS', 'Technically valid. The morning environment is gone.', fb={'TAKE': 'That’s trading the memory of the market. 😭'}), WHYS, 3, chart=xchart(CHOP))}]),
    boss('E', [PRE_MESSY,
               {'title': '9:52 · something in the mess', 'hud': {'time': '9:52'}, 'slide': part('', [ENV('POORLY DEFINED', 'overlap, competing swings'), SET('INVALID', 'closes keep flipping across the level')],
                    DEC('PASS', 'Nothing clean to participate in yet.', fb={'TAKE': 'Which PIL?', 'WAIT': 'Waiting is fine. But this one won’t become valid: it already flipped.'}), WHYS, 3, chart=xchart(CHOP))},
               {'title': '10:24 · it cleaned up', 'hud': {'time': '10:24'}, 'slide': part('', [T_OK, RB_OK('No trades yet · in window · nothing scheduled'), ENV('SUPPORTIVE', 'a clean breakout, readable progression since 10:05', 'reassess'), SET('VALID', 'I · C · C closed, first retest')],
                    DEC('TAKE', 'Conditions changed. You reassessed, in BOTH directions.', fb={'PASS': 'The morning was messy. Is it still?'}), WHYS, 0, chart=RET)}]),
    boss('F', [PRE, {'title': '11:20 · a beauty', 'hud': {'time': '11:20'}, 'slide': rc('session', 'Clean ICC. Clear environment. 11:20.', {'time': '11:20'}, chart=RET, facts=[['Clock', '11:20'], ['Environment', 'Supportive']])}]),
    boss('G', [PRE, {'title': '9:57 · valid setup', 'hud': {'time': '9:57'}, 'slide': rc('news', 'Valid ICC. High-impact release at 10:00.', {'minutesToEvent': 3}, chart=RET, facts=[['Event', '10:00 · in 3 minutes'], ['Setup', 'valid']])}]),
]

levels = [
    lvl('Trend or range?', 'Trend / range recognition', {'type': 'p7_chart_sort', 'ecat': 'trendRange', 'title': 'Rapid fire',
        'buckets': [['bull', '📈 TRENDING BULLISH'], ['bear', '📉 TRENDING BEARISH'], ['range', '↔ RANGING'], ['unclear', '❓ UNCLEAR']],
        'items': [{'chart': TREND_BULL, 'answer': 'bull'}, {'chart': RANGE, 'answer': 'range'}, {'chart': TREND_BEAR, 'answer': 'bear'}, {'chart': UNCLEAR, 'answer': 'unclear', 'why': 'Honest.'},
                  {'chart': RANGE2, 'answer': 'range'}, {'chart': TREND_BULL2, 'answer': 'bull'}]},
        sessionStart='conditions-lab', sessionKind='env', brief='Classification first. UNCLEAR is always allowed.'),
    lvl('Clean or choppy?', 'Structural clarity', {'type': 'p7_chart_sort', 'ecat': 'clarity', 'title': 'Which 1H is easier to explain?',
        'buckets': [['a', 'A'], ['b', 'B']], 'items': [{'pair': [{'label': 'A', 'chart': ORDERLY}, {'label': 'B', 'chart': MESSY}], 'answer': 'a', 'why': 'Clear boundaries, readable reactions.'}],
        'asks': [qq('WHY is A easier?', o('It has more candles', feedback='It’s about readability, not candle count.'), o('Clear boundaries and readable reactions. B overlaps and its levels compete.', True), ecat='clarity')]}),
    lvl('Volatility check', 'Volatility recognition', {'type': 'p7_chart_sort', 'ecat': 'volatility', 'title': 'Same instrument. Two periods.',
        'buckets': [['lower', '🐢 LOWER'], ['higher', '⚡ HIGHER']], 'items': [{'chart': LOW_VOL, 'answer': 'lower'}, {'chart': HIGH_VOL, 'answer': 'higher'}],
        'asks': [qq('Does the higher volatility tell you direction?', o('Yes, up', feedback='Speed isn’t direction.', einc='volAsDirection'), o('NO', True, why='It tells you how aggressively price moves.'), ecat='volatility')]}),
    lvl('News clock', 'News awareness', {'type': 'p7_session', 'events': [
        {'title': 'Your rule', 'slide': {'type': 'p7_rule_form', 'form': 'news', 'onlyIfMissing': True, 'title': 'Your news rule'}},
        {'title': 'The clock', 'slide': rc('news', 'Event in 4 minutes. Valid ICC.', {'minutesToEvent': 4}, chart=RET, facts=[['Event', 'in 4 minutes']])}]}),
    lvl('Session rule', 'Session awareness', {'type': 'p7_session', 'events': [
        {'title': 'Your window', 'slide': {'type': 'p7_rule_form', 'form': 'window', 'onlyIfMissing': True, 'title': 'Your trading window'}},
        {'title': 'The setup', 'slide': rc('session', 'Valid setup at 11:17.', {'time': '11:17'}, chart=RET, facts=[['Clock', '11:17']])}]}),
    lvl('Same model, different environment', 'Valid pass decisions', {'type': 'p7_session', 'events': [
        {'title': 'Sort the factors', 'slide': sort('', 'Supporting or weakening?', [('sup', 'SUPPORTING', 'ink', '✓ SUPPORTING'), ('weak', 'WEAKENING', 'ink', '⚠ WEAKENING')], [
            ('Clear 4H story', 'sup'), ('Tight overlap on the 1H', 'weak'), ('Room to the 4H high', 'sup'), ('High-impact release in 3 minutes', 'weak'), ('Readable PIL', 'sup'), ('Volatility far beyond her usual', 'weak')], track=False)},
        {'title': 'Now: your rulebook', 'slide': rc('news', 'Same valid ICC. Release in 3 minutes.', {'minutesToEvent': 3}, chart=RET)}]}),
    lvl('Room to objective', 'Room-to-objective awareness', {'type': 'p7_chart_sort', 'ecat': 'room', 'title': 'Same bullish ICC',
        'buckets': [['same', 'SAME CONTEXT'], ['diff', 'DIFFERENT CONTEXT']], 'items': [{'pair': room_pair, 'answer': 'diff', 'why': 'Room is part of context.'}],
        'asks': [qq('So you never take A?', o('Never', feedback='Not automatically. Your plan decides what room you need.'), o('Not automatically: room is part of the context I weigh', True), ecat='room')]}),
    lvl('Conditions changed', 'Mid-session reassessment', mid_lab),
    lvl('Technically valid trap', 'Valid pass decisions', part('Perfect ICC.', [
        st('setup', 'DID ICC COMPLETE?', o('YES', True), o('No', feedback='Every step closed.')),
        ENV('POORLY DEFINED', 'news in 1 minute, 4H high 8 points above, messy 1H'),
        st('rulebook', 'DOES THAT FORCE PARTICIPATION?', o('Yes, it completed', feedback='Completion answers validity. Not participation.', einc='forcedTrades'), o('NO', True, short='NOT FORCED'))],
        DEC('PASS', 'Technically valid. The context says no.'), WHYS, 3, chart=RET, facts=[['News', 'in 1 minute'], ['Room', '8 points'], ['1H', 'Messy']])),
    lvl('Valid pass', 'Valid pass decisions', {'type': 'p7_session', 'events': [
        {'title': 'The whole session', 'slide': nothing},
        {'title': 'Result', 'slide': part('', [ENV('POORLY DEFINED', 'messy, all session'), SET('NOT FORMED', 'nothing completed')],
            DEC('VALID PASS', 'Process followed. No trade taken.', ('TAKE LEAST-BAD', 'DROP A TIMEFRAME', 'FORCE A TRADE', 'VALID PASS'),
                {'TAKE LEAST-BAD': 'Least bad isn’t your framework.', 'DROP A TIMEFRAME': 'Zooming in until ICC appears is forcing it.', 'FORCE A TRADE': 'The session doesn’t owe you a trade.'}), WHYS, 4,
            setupState='NOT FORMED', passReason='Nothing met the framework all session')}]}),
    lvl('Build the snapshot', 'Snapshot', {'type': 'p7_snapshot', 'title': 'Describe it. One sentence.', 'charts': [{'label': '4H', 'chart': TREND_BULL}, {'label': '1H', 'chart': RANGE2}],
        'facts': [['Volatility', 'Elevated vs her plan'], ['Calendar', 'High-impact release in 12 minutes'], ['Clock', '10:18 · in her window'], ['Objective', '4H high, close above'], ['1M', 'Nothing formed']],
        'fields': ['htfClarity', 'oneHourStructure', 'volatilityState', 'newsContext', 'sessionContext', 'roomToObjective'],
        'expect': {'htfClarity': 'CLEAR', 'oneHourStructure': 'RANGING', 'volatilityState': 'ELEVATED', 'newsContext': 'EVENT APPROACHING', 'sessionContext': 'IN MY WINDOW', 'roomToObjective': 'LIMITED'},
        'ecat': {'htfClarity': 'clarity', 'oneHourStructure': 'trendRange', 'volatilityState': 'volatility', 'newsContext': 'news', 'sessionContext': 'session', 'roomToObjective': 'room'}}),
    lvl('FINAL BOSS: Should you even be trading this?', 'Full session', {'type': 'p7_random', 'title': 'Should you even be trading this?', 'variants': VARIANTS},
        brief='One of seven sessions. It might give you a trade. It might give you three you can’t take. It might give you nothing.'),
]

game = {'title': 'Market Conditions Lab 🌡️', 'save': 'p7-s20', 'xp': 0, 'tagline': 'Highly visual. Minimal reading. Read the conditions.',
        'doneHeading': 'MARKET CONDITIONS LAB COMPLETE ✓', 'doneLine': 'You asked what is true right now. Not what was true this morning.',
        'readout': 'YOUR ENVIRONMENT READ',
        'review': {'Trend / range recognition': ['p7', 23, 'Same Model, Different Day'], 'Structural clarity': ['p7', 25, 'Chop: Protect'], 'Volatility recognition': ['p7', 28, 'The Fast Market'],
                   'News awareness': ['p7', 19, 'The News You Already Knew About'], 'Session awareness': ['p7', 29, 'Outside Your Window'], 'Valid pass decisions': ['p7', 31, 'Nothing Is a Position'],
                   'Room-to-objective awareness': ['p7', 26, 'Between Structure: Wait'], 'Mid-session reassessment': ['p7', 30, 'The Morning You Had'], 'Snapshot': ['p7', 24, 'Clean Market: Participate'], 'Full session': ['p7', 27, 'Almost Right: Do Nothing']},
        'levels': levels}

bank = [
    kc('Trend vs range', 'Clear HH / HL progression. What is it?', ['Trending bullish: TAKE', 'Trending bullish (a classification, not a trade)', 'Ranging', 'Unclear'], 1, 'Trending is a read. Participation comes from your plan and the setup.', TREND_BULL),
    kc('Trend vs range', 'Repeated movement within similar boundaries. What is it?', ['Ranging: no trade allowed', 'Ranging (a classification, not a ban)', 'Trending', 'Bearish'], 1, 'Ranging isn’t automatically no trade.', RANGE),
    kc('Volatility', 'Large candles. What does that tell you?', ['Bullish', 'Higher volatility, not direction', 'Take it', 'Safer conditions'], 1, 'Volatility answers speed, not direction.', HIGH_VOL),
    kc('News', 'Valid ICC. Event in 4 minutes. Her rule blocks entries within 5. Decision?', ['TAKE', 'PASS', 'Take smaller', 'Wait 1 minute, then take'], 1, 'Her saved news rule decides.'),
    kc('Session', 'Valid ICC at 11:17. Her window ends at 11:00. What’s true?', ['Setup invalid', 'Setup may be valid · participation blocked', 'Take it, the market is open', 'Extend the window today'], 1, 'The market may be open. Her window is closed.'),
    kc('Valid vs quality', 'Perfect ICC inside messy structure. What can be true at the same time?', ['Nothing, it’s invalid', 'Technically valid AND a mixed or poorly defined environment', 'High quality, because it’s valid', 'Guaranteed loser'], 1, 'Validity and environment are separate reads.', MESSY),
    kc('Clean vs messy', '“It’s clean because I found a reason for every candle.” Correct?', ['Yes', 'No: clean means the relevant context is understandable without excessive forcing', 'Yes, if there are 8 reasons', 'Only on the 4H'], 1, 'Clean means understandable, not over-explained.'),
    kc('Mid-session change', 'Morning trends. Objective reached. Now it consolidates. What do you do?', ['Keep trading the trend', 'REASSESS', 'Short it', 'Double size'], 1, 'Don’t trade the morning you had.'),
    kc('Valid pass', 'No setup all session. What’s the result?', ['Failed day', 'Missed day', 'VALID PASS', 'Incomplete session'], 2, 'No trade is a valid trading result.'),
    kc('Valid pass', 'She took no trades and broke no rules. The session is…', ['Incomplete', 'Complete', 'A loss', 'Wasted'], 1, 'SESSION COMPLETE ✓.'),
    kc('Participation', 'Two identical ICC sequences. Different HTF, news, session and room. What’s true?', ['Identical opportunities', 'Same technical model, not the same opportunity context', 'Take both', 'Skip both'], 1, 'Same model ≠ same context.'),
    kc('Participation', 'Environment SUPPORTIVE. ICC never completes. Entry?', ['Yes', 'No entry: environment cannot create one', 'Half size', 'Market buy'], 1, 'Environment can’t create an entry.'),
    kc('Participation', 'ICC completes. Environment MIXED. Her rulebook still allows it. What should the Academy do?', ['Block it automatically', 'Let her reason from her own framework', 'Force a pass', 'Score it 26/30'], 1, 'MIXED is a description, not a block.'),
    kc('Participation', 'She wants to trade. Environment supportive. ICC incomplete. Decision?', ['TAKE', 'WAIT', 'PASS forever', 'Size up'], 1, 'Incomplete means wait. Wanting it doesn’t complete it.'),
    kc('Participation', 'Calm, rulebook clear, environment clean, ICC valid, risk valid. What is TAKE?', ['A guaranteed win', 'An appropriate process decision, not a guaranteed win', 'Wrong', 'Only allowed in trends'], 1, 'A process decision. Outcomes stay uncertain.'),
]

section = {
    'phase': P, 'section': S, 'title': 'Reading the Environment 🌡️',
    'steps': ['game', 'knowledge', 'checkin', 'final', 'reflection', 'phase-complete'],
    'hook': 'Clear the Market Conditions Lab, pass the Knowledge Check, save your Check-In, then the Phase 7 Final Gate.',
    'game': game,
    'knowledgeCheck': {'questionCount': 13, 'passPct': 0.8, 'xp': 0, 'shuffleOptions': True, 'questionBank': bank,
        'reviewLessons': {'Trend vs range': ['p7', 23], 'Volatility': ['p7', 28], 'News': ['p7', 19], 'Session': ['p7', 29], 'Valid vs quality': ['p7', 27], 'Clean vs messy': ['p7', 24],
                          'Mid-session change': ['p7', 30], 'Valid pass': ['p7', 31], 'Participation': ['p7', 27]}},
    'checkin': {'eyebrow': '📓 My Section 3 Check-In · private to you', 'heading': 'How I read the conditions 🌡️',
        'intro': '<p class="p7-fine">Saved to your private Academy Notes. Never shared, never ranked.</p>',
        'fields': [
            {'type': 'text', 'label': 'How do I recognize trend vs range?'},
            {'type': 'text', 'label': 'What changes in high volatility?'},
            {'type': 'text', 'label': 'What does “clean” mean to me?', 'share': True},
            {'type': 'text', 'label': 'Technically valid vs high-quality: the difference'},
            {'type': 'text', 'label': 'When would I pass on a valid ICC?'},
            {'type': 'text', 'label': 'How do I know conditions have changed?'},
            {'type': 'choice', 'label': 'Which area needs another look?', 'options': ['Same Model, Different Day', 'Clean Market: Participate', 'Chop: Protect', 'Between Structure: Wait', 'Almost Right: Do Nothing', 'The Fast Market', 'Outside Your Window', 'The Morning You Had', 'Nothing Is a Position']},
        ], 'saveLabel': 'Save to My Academy Notes →', 'savedLabel': '✓ Saved to your private Academy Notes'},
}

# ── Phase 7 Final Gate ──────────────────────────────────────────────────
def mcq(skill, prompt, options, correct, why):
    return {'kind': 'mcq', 'skill': skill, 'prompt': prompt, 'options': [dict({'label': l}, **({'correct': True, 'why': why} if i == correct else {'feedback': why})) for i, l in enumerate(options)]}


final_bank = [
    mcq('mind', '“I’m nervous, so I’m moving my stop.” What changed?', ['The market', 'The behavior', 'The feeling', 'The setup'], 1, 'The feeling got permission to change the plan.'),
    mcq('mind', 'After two valid losses: “I need that back.” The revenge test asks…', ['Is this setup bigger?', 'Would I take this exact trade if the previous trade never happened?', 'Can I double size?', 'How much do I need?'], 1, 'The next trade doesn’t owe you anything.'),
    mcq('mind', 'Missed a +$500 hypothetical move by not chasing. How is it recorded?', ['−$500', 'Missed opportunity · $0 account change · 0 rules broken', 'A mistake', 'A loss'], 1, 'Missed profit is not lost money.'),
    mcq('rules', 'Valid ICC. Daily stop reached. What’s true?', ['Take it, it’s valid', 'Setup valid · participation not allowed', 'Setup invalid', 'Half size'], 1, 'A valid setup doesn’t outrank your risk rules.'),
    mcq('rules', 'Mid-session she thinks her max trades should be 3. What does she do?', ['Change it now', 'Flag it for review after the session', 'Ignore it today', 'Delete the rule'], 1, 'Rules change in Review Mode, with evidence.'),
    mcq('rules', 'Event in 3 minutes. No news rule defined. What happens?', ['A 5-minute rule is assumed', 'Flag it: NEWS RESPONSE NOT DEFINED', 'News doesn’t matter', 'Take it'], 1, 'Undefined is flagged, never invented.'),
    mcq('env', 'Large candles everywhere. What does that answer?', ['Direction', 'Speed', 'Entry', 'Safety'], 1, 'Volatility tells you how aggressively price moves.'),
    mcq('env', 'Morning trend, objective reached at 10:15, tight range by 11:00. Current environment?', ['Still trending', 'Changed: reassess', 'Bearish', 'Supportive'], 1, 'Don’t trade the memory of the market.'),
    mcq('env', 'Clean means…', ['Flawless', 'Understandable without forcing', 'Trending', 'Low volatility'], 1, 'Clean means understandable, not perfect.'),
    mcq('setup', 'Supportive environment. ICC has Indication and Correction only. Entry?', ['Yes', 'No: the model isn’t complete', 'Half size', 'Market buy'], 1, 'Environment can’t create an entry.'),
    mcq('setup', 'Calm and confident. Setup invalid. Decision?', ['Take it', 'No trade', 'Half size', 'Wait for news'], 1, 'Psychological readiness doesn’t create technical validity.'),
    mcq('decision', 'ICC valid, rulebook allows, environment supportive, calm. TAKE is…', ['A guaranteed win', 'An appropriate process decision', 'Wrong', 'Only for trends'], 1, 'Still not a guaranteed win.'),
    mcq('decision', 'No trades. No rules broken. Session over. Result?', ['Incomplete', 'VALID PASS · session complete', 'Failed day', 'Missed day'], 1, 'No trade is a valid trading result.'),
    mcq('decision', 'Win, loss, pass. What’s the one standard?', ['Win more', 'Follow the process', 'Avoid losses', 'Trade daily'], 1, 'Three possible outcomes. One standard.'),
]

scenario = {'kind': 'capstone', 'skill': 'decision', 'slide': {'type': 'p7_session', 'kicker': 'Phase 7 Final · part 1', 'title': 'The scenario: MIND · RULE · ENVIRONMENT · SETUP · DECISION',
    'hud': {'time': '10:04', 'status': 'SESSION MODE'}, 'events': [
        {'title': 'PART 1 · MIND', 'slide': pask('', 'Indication just closed.', [
            qq('“It’s going to leave without me.” What changed?', o('Price: it’s leaving', feedback='Price closed through the PIL. That’s all it did.'), o('My emotion. Price is just forming.', True, why='Did price change… or did my emotion change?'), skill='mind')],
            chart=xchart(clean, show=cm['indication'] + 1, head={'tf': '1M', 'label': 'MNQ'}), thought='“It’s going to leave without me.”')},
        {'title': 'PART 2 · RULE', 'slide': rc('news', 'Your rulebook, loaded. A release in 20 minutes.', {'minutesToEvent': 20}, skill='rules', facts=[['Event', 'in 20 minutes']])},
        {'title': 'PART 3 · ENVIRONMENT', 'slide': {'type': 'p7_snapshot', 'title': 'Read it', 'skill': 'env', 'charts': [{'label': '4H', 'chart': TREND_BULL}, {'label': '1H', 'chart': TREND_BULL2}],
            'facts': [['Volatility', 'Typical for her plan'], ['Clock', '10:04 · in window'], ['Objective', 'Well above']], 'fields': ['htfClarity', 'oneHourStructure', 'volatilityState', 'roomToObjective'],
            'expect': {'htfClarity': 'CLEAR', 'oneHourStructure': 'PROGRESSING', 'volatilityState': 'NORMAL FOR PLAN', 'roomToObjective': 'AVAILABLE'}}},
        {'title': 'PART 4 · SETUP', 'slide': pask('', '10:16', [qq('DID DAYLI ICC COMPLETE?', o('Yes: I · C · C closed and the first retest printed', True), o('No', feedback='Read the closes again.'), o('It completed at Indication', feedback='Indication is step one.'), skill='setup')], chart=RET)},
        {'title': 'PART 5 · DECISION', 'slide': pask('', 'Put it together', [qq('What decides TAKE or PASS here?', o('ICC completed, so TAKE', feedback='Completion is one layer of four.'),
            o('TAKE only if Part 2 said ALLOWED (and FLAG if undefined); otherwise PASS', True, why='Mind noticed, environment supportive, ICC complete: your rulebook is the deciding layer.'),
            o('PASS, I felt nervous in Part 1', feedback='Noticing the feeling was the job. It doesn’t get to decide.'), skill='decision', stack=True)])},
    ]}}

H15 = chart([[20, 250], [120, 150], [200, 200], [300, 110], [380, 160], [480, 120], [600, 140]], seed=51)
simulation = {'kind': 'capstone', 'skill': 'decision', 'slide': {'type': 'p7_session', 'kicker': 'Phase 7 Final Simulation', 'title': 'THE PARTICIPATION DECISION',
    'hud': {'time': '9:40', 'trades': 0, 'maxTrades': 2, 'dailyR': 0, 'temp': 'calm', 'status': 'SESSION MODE'}, 'events': [
        {'title': '9:40 · 4H → 1H → 15M', 'slide': {'type': 'p7_snapshot', 'title': 'Top-down first', 'skill': 'env', 'charts': [{'label': '4H', 'chart': TREND_BULL}, {'label': '1H', 'chart': TREND_BULL2}, {'label': '15M', 'chart': H15}],
            'facts': [['Calendar', 'A release at 11:30, after her window'], ['Clock', '9:40 · window 9:45–11:00'], ['Objective', '4H high, well above']], 'fields': ['htfClarity', 'oneHourStructure', 'newsContext', 'sessionContext', 'roomToObjective'],
            'expect': {'htfClarity': 'CLEAR', 'oneHourStructure': 'PROGRESSING', 'newsContext': 'CLEAR', 'sessionContext': 'IN MY WINDOW', 'roomToObjective': 'AVAILABLE'}}},
        {'title': '10:02 · environment change', 'hud': {'time': '10:02'}, 'slide': pask('', 'A quiet open. Now the candles get bigger.', [
            qq('Volatility picked up. Direction?', o('Up, look at those candles', feedback='That answers speed.'), o('Not from volatility alone: structure answers direction', True), skill='env')])},
        {'title': '10:05 · 1M', 'hud': {'time': '10:05', 'temp': 'elevated'}, 'slide': sim('', '', clean, cm['indication'] - 2, [
            cp(cm['indication'], kind='decide', expect='wait', prompt='Indication closed. What do you do?', thought=['“Just get in.”', '“It’s leaving.”'], mind={'wait': 'patienceSuccessCount', 'enter': 'emotionalTradesTaken'}),
            {'at': cm['retest'] + 1, 'kind': 'ask', 'goal': True, 'ask': qq('The first retest closed above. DID DAYLI ICC COMPLETE?', o('YES', True), o('No', feedback='I · C · C closed, then the first retest.'), skill='setup')}],
            actions=['wait', 'enter'], timeline=False, speed=650, noStatus=False)},
        {'title': '10:16 · six questions', 'hud': {'time': '10:16', 'temp': 'calm'}, 'slide': part('', [
            st('see', '1 · WHAT DO I SEE?', o('A completed bullish ICC at the first retest, in a progressing 1H', True, short='VALID ICC'), o('A guaranteed move', feedback='Nothing on a chart is guaranteed.'), skill='setup'),
            st('feel', '2 · WHAT AM I FEELING?', o('Some urgency from earlier. Noticed, not driving.', True, short='NOTICED'), o('Nothing, I’m a machine', feedback='😂 Name it. That’s the skill.'), skill='mind'),
            st('rulebook', '3 · WHAT DOES MY RULEBOOK SAY? First trade · in window · no event until 11:30.', o('ALLOWED', True), o('BLOCKED', feedback='Which rule?'), skill='rules'),
            st('environment', '4 · WHAT IS THE ENVIRONMENT?', o('SUPPORTIVE', True), o('POORLY DEFINED', feedback='Clear 4H, progressing 1H, room.'), skill='env'),
            st('setup', '5 · DID DAYLI ICC COMPLETE?', o('YES', True), o('NO', feedback='The retest printed.'), skill='setup')],
            DEC('TAKE', 'Every layer aligned. A process decision, not a guaranteed win.', ('TAKE', 'WAIT', 'PASS', 'STOP'), {'PASS': 'What blocked it?', 'WAIT': 'Nothing left to wait for.', 'STOP': 'No stop rule triggered.'}, skill='decision'),
            WHYS, 0, chart=RET), 'after': {'trades': 1, 'status': 'PROCESS ✓', 'statusTone': 'ok'}},
        {'title': '10:41 · another one', 'hud': {'time': '10:41'}, 'slide': part('', [
            st('environment', 'WHAT IS TRUE RIGHT NOW? Objective tagged at 10:30. Tight overlap since.', *[o(x, x == 'POORLY DEFINED') for x in ('SUPPORTIVE', 'MIXED', 'POORLY DEFINED')], skill='env'),
            st('setup', 'A tiny I · C · C inside the range.', o('Technically valid', True), o('Invalid', feedback='It technically closed through.'))],
            DEC('PASS', 'What was true this morning isn’t true now.', ('TAKE', 'WAIT', 'PASS', 'STOP'), {'TAKE': 'That’s the memory of the market.'}, skill='decision'), WHYS, 3, chart=xchart(CHOP))},
    ]}}

section['final'] = {'title': 'The Mindset Behind the Model: Final Gate', 'eyebrow': 'Phase 7 final gate', 'stepLabel': 'Phase 7 Final', 'passPct': 0.8, 'storeId': 'p7-final', 'notesId': 'p7-final',
    'intro': ['Not twenty disconnected questions. Twelve supporting questions, then a five-part scenario and the Phase 7 Final Simulation: 4H → 1H → 15M → 1M, with her thoughts, her rulebook, the clock and a changing environment.',
              'Ask what is TRUE RIGHT NOW. Not what was true this morning, not what you want, not what the last trade did. 80% to pass.'],
    'covers': ['Your Mind Is the Market', 'Rules That Protect You', 'Reading the Environment'],
    'mix': {'visual': 0, 'mcq': 12, 'written': 0}, 'capstone': [len(final_bank), len(final_bank) + 1], 'bank': final_bank + [scenario, simulation],
    'skills': [{'key': 'mind', 'label': 'Mind', 'review': ['p7', 1]}, {'key': 'rules', 'label': 'Rules', 'review': ['p7', 14]}, {'key': 'env', 'label': 'Environment', 'review': ['p7', 27]},
               {'key': 'setup', 'label': 'Setup', 'review': ['p6', 1]}, {'key': 'decision', 'label': 'Decision', 'review': ['p7', 31]}],
    'adaptive': True, 'reviewTitle': 'Your review, by layer'}

section['reflection'] = {'eyebrow': '📓 Phase 7 Final Reflection · private to you', 'heading': 'Before Phase 8 ✦', 'fields': [
    {'type': 'text', 'label': 'The emotional pattern I recognize most'},
    {'type': 'text', 'label': 'The rule that protects me most'},
    {'type': 'text', 'label': 'What makes an environment worth participating in'},
    {'type': 'text', 'label': 'What a successful no-trade day means to me now'},
    {'type': 'choice', 'label': 'Confidence', 'profile': 'confidence', 'options': ['Still shaky', 'Getting there', 'Pretty confident', 'Show me the charts 🔥']}],
    'saveLabel': 'Save to My Academy Notes →', 'savedLabel': '✓ Saved to your private Academy Notes'}

section['phaseComplete'] = {
    'phaseKey': 'p7', 'eyebrow': 'Phase 7 complete', 'heading': '✦ YOU BUILT THE TRADER BEHIND THE MODEL.', 'sub': 'The Mindset Behind the Model · Complete',
    'cinema': mono(kicker='', chart=dict(MIXED_1H, head={'tf': '1H', 'label': 'MNQ · 10:12'}), thoughts=['“I want a trade.”'],
                   cards=['MIND · recognized', 'RULEBOOK · checked', 'ENVIRONMENT · read', 'MODEL · evaluated', 'DECISION · PASS'],
                   lines=['The chart runs. Nothing happens.', 'No dramatic winner missed. No punishment.', 'The session closes.',
                          'TRADES 0 · RULE VIOLATIONS 0 · FORCED SETUPS 0 · ACCOUNT PROTECTED ✓', 'THIS COUNTS.',
                          'Another session. A valid trade. A loss.', 'THIS COUNTS TOO.', 'Another. A valid trade. A win.', 'AND THIS COUNTS.',
                          'WIN. LOSS. PASS.', '<b>THREE POSSIBLE OUTCOMES. ONE STANDARD: FOLLOW THE PROCESS.</b>']),
    'framework': {'groups': [{'title': 'BEFORE EVERY CLICK', 'items': ['TRADER', 'RULEBOOK', 'ENVIRONMENT', 'SETUP', 'DECISION']}]},
    'stats': [{'value': '31', 'label': 'Lessons lived'}, {'value': '✓', 'label': 'Mindset Mirror'}, {'value': '✓', 'label': 'Personal Rulebook'}, {'value': '✓', 'label': 'Market Conditions Lab'},
              {'value': '{final}%', 'label': 'Phase 7 Final Gate'}, {'value': '✓', 'label': 'Reflection'}],
    'badge': {'id': 'disciplined-trader', 'title': 'DISCIPLINED TRADER', 'emoji': '🧠', 'mark': 'target',
              'quote': '“You learned that trading isn’t only reading the market. It’s knowing whether you, your rules, the environment, and the model are aligned enough to participate.”'},
    'skills': [{'key': 'mind', 'label': 'Mind', 'review': ['p7', 1], 'keys': ['mind', 'Emotional temperature', 'FOMO', 'Fear', 'Feeling vs action', 'Feeling vs behavior', 'Greed', 'Hesitation', 'Overconfidence', 'Overtrading', 'Patience', 'Patience vs hesitation', 'Revenge', 'Streaks', 'Pressure']},
               {'key': 'rules', 'label': 'Rules', 'review': ['p7', 14], 'keys': ['rules', 'Max trades', 'News rule', 'No chase', 'Risk', 'Rule changes', 'Rule writing', 'Violation review', 'Violations', 'Daily stop', 'Environment rule', 'Real-time exceptions', 'Response planning', 'Risk rule adherence', 'Strategy rule recognition', 'Trigger identification', 'Violation recognition']},
               {'key': 'env', 'label': 'Environment', 'review': ['p7', 27], 'keys': ['env', 'Environment', 'Trend vs range', 'Volatility', 'News', 'Session', 'Clean vs messy', 'Valid vs quality', 'Mid-session change', 'Trend / range recognition', 'Structural clarity', 'Volatility recognition', 'News awareness', 'Session awareness', 'Room-to-objective awareness', 'Mid-session reassessment', 'Snapshot']},
               {'key': 'decision', 'label': 'Participation decisions', 'review': ['p7', 31], 'keys': ['decision', 'setup', 'Participation', 'Valid pass', 'Valid pass decisions', 'Process vs outcome', 'Strategy sample', 'Full session']}],
    'masteryTitle': 'My learning · The trader behind the model', 'masteryNote': 'Observable decisions across Phase 7. Not a mindset score, and private to you. Skills without enough answers yet say so instead of guessing.',
    'pause': {'lines': ['Phases 1–6 taught you how to read the market.', 'Phase 7 taught you how to read yourself while you’re reading it.',
                        'You know how to read yourself, your rulebook, the conditions and the model.', 'TRAINING COMPLETE.'],
              'ready': 'NOW PROVE YOU CAN USE IT.'},
    'next': {'eyebrow': 'Phase 8 unlocked · the capstone', 'title': 'SHE’S IN STRUCTURE ✦', 'huge': True,
             'lines': ['No more “next lesson”. Fewer instructional screens. More real charts, unknown outcomes, backtesting, journaling, independent decisions and full top-down analysis.'],
             'cinema': {'type': 'p7_transition', 'kicker': '',
                        'old': ['LESSON', 'WATCH WITH DAYLI', 'BREAK IT DOWN', 'LOCK IT IN'],
                        'learned': ['the concepts', 'structure', 'liquidity', 'context', 'Dayli ICC', 'execution', 'management', 'risk', 'discipline'],
                        'pause': 'TRAINING COMPLETE.', 'prove': 'NOW PROVE YOU CAN USE IT.',
                        'flow': ['CASE FILE', 'CHART', 'ANALYZE', 'DECIDE', 'EXECUTE', 'REVIEW'],
                        'close': ['Now we’re taking the training wheels off.', 'NO MORE “WHAT IS THE ANSWER?”', '<b>NOW: “SHOW ME HOW YOU THINK.” 🔥</b>'],
                        'reveal': {'eyebrow': 'PHASE 8 · THE CAPSTONE', 'title': 'SHE’S IN STRUCTURE ✦', 'mission': 'SHOW ME HOW YOU THINK. 🔥'}},
             'note': 'Phase 8 is on its way. It appears on your Academy map the moment it opens.',
             'cta': 'Back to my Academy →', 'href': 'lessons.html'},
}

chk(section)
section['checkin']['fields'].insert(0, {'type': 'text', 'label': 'What does “nothing is a position” mean to me now?'})
write('p7-s20-section.json', section)
