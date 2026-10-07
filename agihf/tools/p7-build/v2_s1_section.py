"""Phase 7 (v2) · Section 1 checkpoint: Mindset Mirror (lived moments), Knowledge Check, Check-In, completion."""
import copy
from v2lib import *  # noqa: F401,F403
from v2tapes import *  # noqa: F401,F403
from v2_s1 import L as LES
from p7lib import write, chk, kc, qq, o, mono, sim, cp, setup, ask, opt, xchart, PIL, P, Tape, bull_setup, check

S = 's18'


def choice_of(n, k=0):
    """The k-th decision from lesson n, reused as a fresh moment in the lab."""
    beats = [b for b in LES[n]['slides'][0]['beats'] if 'choice' in b]
    return copy.deepcopy(beats[k])


def moment(name, concept, intro, n, k=0, extra=None, **kw):
    beats = [say(*intro)] + (extra or []) + [choice_of(n, k)]
    d = scene('', '', beats)
    d.update({'name': name, 'concept': concept, 'concept_': concept})
    d.pop('concept_')
    d.update(kw)
    return d


loss2, l2m = bull_setup(PIL, seed=37, run=10, after=0)
t = Tape(loss2[-1]['c'], seed=38); t.b = []
t.drift(PIL - 14, 3, cap_hi=PIL + 2); t.drift(PIL - 27, 3, cap_hi=PIL - 9); t.bar(PIL - 31.5, dn=1.5)
loss2 = loss2 + t.b
check(loss2, {k: l2m[k] for k in ('indication', 'correction', 'continuation', 'retest')})
clean, cm = bull_setup(PIL, seed=3, run=26, after=10)
check(clean, cm)

levels = [
    moment('The red candle', 'Fear', ['You’re long. +22. Then a red candle.', 'Nothing in your plan has triggered.'], 8,
           extra=[ch(FEAR, show=FEAR_CP + 1, pil=None, lines=trade_lines(FEAR_E), head={'tf': '1M', 'label': 'Long 2 MNQ'}), th('“Just lock something in.”')],
           sessionStart='mirror-lab', brief='No grades on the moment. Choose, watch what happens, replay the other paths. Your review comes at the end.'),
    moment('Right after +2R', 'Greed', ['Target hit. +2R. Your plan says done.', 'The next chart wicks through the PIL and never closes.'], 2,
           extra=[ch(MESS, head={'tf': '1M', 'label': 'The next chart'}), th('“I’m locked in today.”')]),
    moment('It’s leaving', 'FOMO', ['No retest. Price is running.'], 6, extra=[ch(FOMO, show=F_25 + 1, head={'tf': '1M', 'label': 'Without you'}), th('“I KNEW it.”')]),
    moment('Two minutes after −1R', 'Revenge', ['A valid loss. Then this.'], 4, extra=[ch(INC, head={'tf': '1M', 'label': 'Indication only'}), th('“I need that back.”')]),
    moment('Max reached', 'Overtrading', ['Two trades. Your maximum is two.'], 9, extra=[ch(TINY, show=TM['retest'] + 1, head={'tf': '1M', 'label': 'Something small'}), th('“Just one more.”')]),
    moment('Everything is there', 'Hesitation', ['Every box is checked. Your last trade lost.'], 7, extra=[ch(HES, show=HM['retest'] + 1, head={'tf': '1M', 'label': 'First retest'}), th('“What if I’m wrong again?”')]),
    moment('Four green days', 'Streaks', ['Monday to Thursday: green. Friday, a valid setup.'], 3, extra=[th('“Let’s go bigger today.”')]),
    moment('The bills', 'Pressure', ['Rent is due. The trade is slipping toward your stop.'], 11,
           extra=[ch(NEED, show=NEED_GREEN + 3, pil=None, lines=trade_lines(NEED_E), head={'tf': '1M', 'label': 'Long 2 MNQ'}), th('“This one HAS to work.”')]),
    moment('Nothing yet', 'Patience', ['10:21. Nothing has formed.'], 10, extra=[ch(WAIT_PRE, head={'tf': '1M', 'label': 'Still nothing'}), th('“This is so boring.”')]),
    dict({'type': 'p7_process', 'title': 'Grade it the way it happened', 'trades': [
        {'name': 'THE TRADE', 'facts': ['Entered before Continuation closed.', 'Price ran anyway.', 'Closed at +2R.'], 'result': '+2R WIN', 'violations': ['Early entry'],
         'answers': {'outcome': 'WIN', 'process': 'VIOLATION'}, 'why': 'The journal stores WIN and RULE VIOLATION side by side. The win doesn’t erase it.'}]},
         name='The winning mistake', concept='Process vs outcome'),
    dict({'type': 'p7_temp', 'title': 'Read you first', 'body': 'Where would you put each thought?',
          'items': [{'thought': 'Plan’s clear. Let’s see what it gives me.', 'state': 'calm'}, {'thought': 'Ugh. That was my third loss.', 'state': 'frustrated'},
                    {'thought': 'I can’t miss today.', 'state': 'elevated'}, {'thought': 'I’m getting it back. NOW.', 'state': 'red'}]},
         name='Your temperature', concept='Emotional temperature'),
    {'type': 'p7_session', 'title': 'One continuous session', 'name': 'FINAL BOSS: Who’s trading now?', 'concept': 'Full session',
     'hud': {'trades': 0, 'maxTrades': 3, 'dailyR': 0, 'dailyStop': '−2R', 'temp': 'calm', 'status': 'SESSION OPEN'},
     'events': [
        {'title': '9:52 · a valid setup', 'slide': sim('', '', LOSS, LM['indication'] - 2, [
            cp(LM['indication'], kind='decide', expect='wait', mind={'wait': 'patienceSuccessCount', 'enter': 'emotionalTradesTaken'}),
            cp(LM['retest'], kind='decide', expect='enter', prompt='First valid retest.', mind={'enter': 'ruleBasedResponses', 'wait': 'hesitationCount', 'pass': 'hesitationCount'})],
            actions=['wait', 'enter', 'pass'], timeline=False, speed=650,
            end={'ask': ask('−1R. Valid loss. What now?', opt('Get it back on the next one', feedback='That’s the revenge loop starting.', track='revengeDecisionCount'), opt('Log it. Continue only if the plan permits.', correct=True, why='A valid loss is logged, not avenged.'), stack=True)}),
         'after': {'trades': 1, 'dailyR': -1, 'temp': 'frustrated'}},
        {'title': '10:04 · it leaves without you', 'slide': sim('', '', FOMO, RM['correction'], [
            cp(F_25, kind='decide', expect='pass', prompt='No retest. Price is running.', thought='“I knew it.”', mind={'enter': ['fomoDecisionCount', 'emotionalTradesTaken'], 'pass': 'fomoRecognized'})],
            setups=[setup(FOMO, missedAt=first(FOMO, RM['continuation'], lambda b: b['c'] >= PIL + 15))], actions=['wait', 'enter', 'pass'], labels={'enter': 'CHASE IT', 'pass': 'LET IT GO'}, timeline=False, playAfterPass=True, speed=650,
            ticker={'from': RM['continuation'], 'label': 'Without you'}, end={'card': 'The market moved without your entry. That’s all.'}),
         'after': {'temp': 'red'}},
        {'title': '10:20 · valid again, and you’re shaky', 'slide': sim('', '', loss2, l2m['correction'], [
            cp(l2m['retest'], kind='decide', expect='enter', prompt='First valid retest. Criteria complete. Rules allow it.', thought='“What if this loses too?”', mind={'enter': 'ruleBasedResponses', 'wait': 'hesitationCount', 'pass': 'hesitationCount'})],
            actions=['wait', 'enter', 'pass'], timeline=False, speed=650, end={'text': '<b>−1R.</b> A valid loss, executed correctly.'}),
         'after': {'trades': 2, 'dailyR': -2, 'status': 'DAILY STOP REACHED', 'statusTone': 'bad'}},
        {'title': '10:41 · the cleanest setup of the day', 'slide': sim('', '', clean, cm['indication'] - 2, [
            cp(cm['retest'], kind='decide', expect='pass', prompt='The cleanest setup of the session. Your daily stop is reached.', thought='“But THIS one is perfect.”',
               mind={'enter': ['overtradeCount', 'emotionalTradesTaken'], 'pass': 'ruleBasedResponses'}, after='SESSION OVER. Review mode.')],
            actions=['enter', 'pass'], labels={'enter': 'TAKE IT', 'pass': 'SESSION OVER'}, timeline=False, playAfterPass=True, speed=650,
            end={'text': 'It went on to win. <b>Without you.</b>', 'card': 'THE CORRECT DECISION CAN MISS MONEY.'}),
         'after': {'status': 'SESSION OVER ✓', 'statusTone': 'ok', 'temp': 'elevated'}},
     ], 'review': 'mind', 'reviewKicker': '🪞 Your mindset review', 'reviewTitle': 'What you actually did',
     'reviewClean': 'You felt the loss, the miss and the hesitation. None of them got to rewrite the model.'},
]

game = {'title': 'Mindset Mirror 🪞', 'save': 'p7-s18', 'xp': 0, 'tagline': 'Not “what is fear?”. Who’s trading right now?',
        'doneHeading': 'MINDSET MIRROR COMPLETE ✓', 'doneLine': 'You felt it, noticed it, and chose the behavior. Over and over.',
        'readout': 'YOUR MINDSET READ',
        'review': {'Fear': ['p7', 8, 'The Candle You Can’t Stop Watching'], 'Greed': ['p7', 2, 'After the Win'], 'FOMO': ['p7', 6, 'I Knew It'], 'Revenge': ['p7', 4, 'After the Loss'],
                   'Overtrading': ['p7', 9, 'Just One More'], 'Hesitation': ['p7', 7, 'Frozen'], 'Streaks': ['p7', 3, 'On a Heater'], 'Pressure': ['p7', 11, 'The Trade You Need to Work'],
                   'Patience': ['p7', 10, 'Waiting Is the Work'], 'Process vs outcome': ['p7', 12, 'You Are Not Your P&L'], 'Emotional temperature': ['p7', 13, 'Who’s Trading Now?'], 'Full session': ['p7', 13, 'Who’s Trading Now?']},
        'levels': levels}

bank = [
    kc('Feeling vs action', 'You feel nervous in a trade. The plan and the market are unchanged. What does the feeling require?', ['Close the trade', 'Move the stop closer', 'Nothing by itself', 'Take a partial'], 2, 'A feeling is information. With no rule triggered and nothing changed, no action is required.'),
    kc('Greed', 'You just hit +2R and feel locked in. The next chart has no valid setup. What changed?', ['The market', 'You', 'The model', 'Nothing'], 1, 'Confidence is not confirmation.'),
    kc('Streaks', 'Four green days. You want to double size Friday. What changed?', ['Your risk plan', 'How you feel about the last four days', 'The model', 'The market'], 1, 'A streak is a result, not a new risk plan.'),
    kc('Revenge', '−1R, valid. Two minutes later: Indication only. You want in. The test?', ['Is it moving?', 'Would I take this exact trade if the last one never happened?', 'Can I size up?', 'How much do I need?'], 1, 'If not, the last trade is still trading you.'),
    kc('Streaks', 'Three valid losses in a row. A full valid setup forms. What’s true?', ['The model is broken', 'Three trades can’t judge the model: judge this setup on its own', 'Take half size', 'Skip it'], 1, 'Judge behavior fast, the model slowly.'),
    kc('FOMO', 'No retest. Price ran to where your target would be. You did nothing. How is it recorded?', ['A loss', 'Missed opportunity · $0 account change · 0 rules broken', 'A mistake', 'Hesitation'], 1, 'Missed profit is not lost money.'),
    kc('Hesitation', 'Everything is complete and your rules allow it. You wait “one more candle”. What is it?', ['Patience', 'Hesitation', 'Discipline', 'Risk management'], 1, 'Patience waits FOR the criteria. Hesitation waits AFTER them.'),
    kc('Fear', 'You moved to break even at +22 with no break-even rule. What changed the plan?', ['A management rule', 'New structure', 'Fear', 'The target'], 2, 'No rule triggered and structure didn’t change.'),
    kc('Overtrading', 'Max two trades. Both done. A small setup forms. What is being done?', ['Optional', 'The execution', 'A failure to find trades', 'A warm-up'], 1, 'When the day is over, being done is the execution.'),
    kc('Patience', 'Nothing has formed by 10:21. You drop to a 30-second chart to find something. What is that?', ['Finding a setup', 'Searching for permission', 'Top-down analysis', 'Patience'], 1, 'Boredom doesn’t complete a setup.'),
    kc('Pressure', 'Rent is due and a trade slips toward your stop. You widen it. What decided?', ['The plan', 'The pressure', 'The model', 'The market'], 1, 'The market doesn’t know what you need.'),
    kc('Process vs outcome', 'A trade wins after an early entry. How is it journaled?', ['Win · good trade', 'Outcome: win · Process: violation', 'Loss', 'Not journaled'], 1, 'A win doesn’t erase a violation.'),
    kc('Process vs outcome', 'A red day with every rule followed. What is it?', ['A bad day', 'A good day of process', 'Proof you’re bad at this', 'A reason to change the model'], 1, 'Your P&L isn’t a verdict about you.'),
    kc('Emotional temperature', 'You’re in a red revenge state. A valid setup forms. What’s true?', ['The setup is invalid', 'The setup can be valid; your personal rule for this state matters', 'You must take it', 'Emotion and setup are the same'], 1, 'Setup validity and trader readiness are different dimensions.'),
]

section = {
    'phase': P, 'section': S, 'title': 'Your Mind Is the Market 🪞',
    'steps': ['game', 'knowledge', 'checkin', 'complete'],
    'hook': 'Live through the Mindset Mirror, pass the Knowledge Check and save your Check-In to unlock Section 2.',
    'game': game,
    'knowledgeCheck': {'questionCount': 12, 'passPct': 0.8, 'xp': 0, 'shuffleOptions': True, 'questionBank': bank,
        'reviewLessons': {'Feeling vs action': ['p7', 1], 'Greed': ['p7', 2], 'Streaks': ['p7', 3], 'Revenge': ['p7', 4], 'FOMO': ['p7', 6], 'Hesitation': ['p7', 7], 'Fear': ['p7', 8],
                          'Overtrading': ['p7', 9], 'Patience': ['p7', 10], 'Pressure': ['p7', 11], 'Process vs outcome': ['p7', 12], 'Emotional temperature': ['p7', 13]}},
    'checkin': {'eyebrow': '📓 My Section 1 Check-In · private to you', 'heading': 'What did you notice about yourself? 🪞',
        'intro': '<p class="p7-fine">These reflections are yours. Saved to your private Academy Notes. Never shared, never ranked, never compared.</p>',
        'fields': [
            {'type': 'choice', 'label': 'Which moment pulls you off your plan most easily?', 'options': ['After a win', 'A winning streak', 'After a loss', 'A losing streak', 'A move I missed', 'Freezing on a valid setup', 'Watching an open trade', 'Wanting one more', 'Boredom', 'Money pressure'], 'profile': 'p7emotion'},
            {'type': 'text', 'label': 'What do you tell yourself right before you break a rule?'},
            {'type': 'text', 'label': 'What does a win do to you? A loss?'},
            {'type': 'text', 'label': 'What’s the difference between patience and hesitation, for you?', 'share': True},
            {'type': 'text', 'label': 'What pressure comes into the trade with you?'},
            {'type': 'text', 'label': 'How do you want to talk to yourself after a red day?'},
            {'type': 'choice', 'label': 'Which lesson do you want to revisit?', 'options': ['The Moment Between', 'After the Win', 'On a Heater', 'After the Loss', 'Three in a Row', 'I Knew It', 'Frozen', 'The Candle You Can’t Stop Watching', 'Just One More', 'Waiting Is the Work', 'The Trade You Need to Work', 'You Are Not Your P&L', 'Who’s Trading Now?'], 'profile': 'p7review'},
        ], 'saveLabel': 'Save to My Academy Notes →', 'savedLabel': '✓ Saved to your private Academy Notes'},
    'complete': {
        'eyebrow': '🎉 Section complete', 'heading': '✦ YOU CAN SEE WHO’S MAKING THE DECISION.', 'badge': 'Your Mind Is the Market: Complete', 'gp': 850,
        'cinema': mono(kicker='', steps=[
            {'thought': '“What if it loses?”', 'act': '✓ Executes the plan. −1R.'},
            {'thought': '“I need that back.”', 'act': '✓ Waits for the full model.'},
            {'thought': '“I knew it.”', 'act': '✓ Lets it go.'},
            {'thought': '“I’m on fire.”', 'act': '✓ Same size.'},
            {'thought': '“But this one is beautiful.”', 'act': '✓ Done means done.'},
        ], freeze=True, lines=['NOTICE SOMETHING?', 'You felt every one of them.', 'And none of them got the mouse.']),
        'stats': [{'label': 'Lessons', 'value': '{lessons} ✓'}, {'label': 'Mindset Mirror', 'value': '✓'}, {'label': 'Knowledge Check', 'value': '{kc}% ✓'}, {'label': 'Academy Notes', 'value': 'Saved ✓'}],
        'badgeUnlock': {'icon': '🪞', 'title': 'MINDSET MIRROR', 'line': '“Discipline doesn’t mean feeling nothing. It means your feelings don’t get to rewrite the model.”'},
        'phase': {'title': 'PHASE 7 STATUS', 'pct': 33, 'sections': [{'icon': '✓', 'label': 'Your Mind Is the Market'}, {'icon': '🔓', 'label': 'Rules That Protect You'}, {'icon': '🔒', 'label': 'Reading the Environment'}]},
        'nextUp': {'title': 'Section 2: Rules That Protect You 📕',
            'cinema': mono(kicker='', lines=['Your trading rules weren’t written for the version of you who feels disciplined.', '<b>THEY WERE WRITTEN FOR THE VERSION OF YOU WHO DOESN’T.</b>']),
            'lines': ['Section 1 showed you who shows up. Section 2 gives the calm version of you a voice in the room.'],
            'questions': ['Written While Calm', '“But This One Looks Good.”', 'Moving the Stop', 'The Missed Trade', 'Done Means Done', 'The News You Already Knew About', 'The Rule You Keep Negotiating', 'When You Break One', 'Your Rulebook'],
            'cta': 'BUILD MY RULEBOOK →'},
    },
}
chk(section)
write('p7-s18-section.json', section)
