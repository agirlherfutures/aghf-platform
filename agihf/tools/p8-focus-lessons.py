"""
Writes the slides for Phase 8 Lessons 2-9 (one lesson, one job) into
lessons-data/p8-2.json … p8-9.json. Everything else in those files
(title, hook, launchpad, takeaways, remember…) is kept.

    python3 tools/p8-focus-lessons.py
"""
import json, os

HERE = os.path.dirname(__file__)
K = lambda n, job: f'Lesson {n} · {job}'
MARKS = ['I', 'C', 'C2', 'R']

L = {}

# ── 2 · A Valid Winning Trade ─────────────────────────────────────────
L[2] = [
    {'type': 'p8_focus', 'kind': 'chart', 'kicker': K(2, 'Judge the process'),
     'headline': 'It won. That’s not why it was good.',
     'line': 'A finished long with Dayli’s marks. The result is hidden. Decide if it was a good trade <b>before</b> you know how it ended.',
     'chips': ['MNQ', 'NY AM · 9:30', 'Long', {'text': '🔒 Outcome hidden', 'tone': 'lock'}],
     'chart': {'scenario': 'valid-win', 'upto': 'R', 'marks': MARKS, 'pil': True, 'trade': True, 'curtain': True},
     'legend': True, 'cta': 'Grade it →'},
    {'type': 'p8_focus', 'kind': 'tick', 'kicker': K(2, 'Judge the process'),
     'headline': 'Tick what made it a good trade.',
     'do': 'Only what you could know <b>before</b> the result. Two of these are traps.',
     'options': [
         {'label': 'The 4H and 1H agreed', 'sub': 'The thesis was there before the open.', 'ok': True, 'icon': 'layers', 'tone': 'teal'},
         {'label': 'The full I → C → C closed', 'sub': 'Every step was a close, not a wick.', 'ok': True, 'icon': 'candle', 'tone': 'teal'},
         {'label': 'Entry on the retest', 'sub': 'Not the chase.', 'ok': True, 'icon': 'target', 'tone': 'teal'},
         {'label': 'Stop beyond the correction', 'sub': 'Size came from the distance.', 'ok': True, 'icon': 'shield', 'tone': 'teal'},
         {'label': 'Room to the objective', 'sub': 'Space to the next 1H level.', 'ok': True, 'icon': 'up', 'tone': 'teal'},
         {'label': 'It hit the target', 'ok': False, 'why': 'Trap: that’s the result. You only knew it after.', 'icon': 'flag', 'tone': 'pink'},
         {'label': 'The candles were big and fast', 'ok': False, 'why': 'Trap: candle size isn’t a rule.', 'icon': 'bolt', 'tone': 'pink'},
     ],
     'trapSay': 'You ticked a result as a reason. “It won” can’t make a trade valid.',
     'goodSay': 'All five reasons, and no traps. Everything you ticked was known before the entry.'},
    {'type': 'p8_focus', 'kind': 'reveal', 'kicker': K(2, 'Judge the process'),
     'headline': 'Watch it play out.',
     'chart': {'scenario': 'valid-win', 'marks': MARKS, 'pil': True, 'trade': True, 'play': True, 'hit': True},
     'tiles': [{'label': 'Process', 'value': 'Valid · A', 'tone': 'good'}, {'label': 'Outcome', 'value': 'Target hit · +2R'}, {'label': 'If it had lost', 'value': 'Still an A', 'tone': 'dayli'}],
     'dayli': 'It deserved to be taken before it won. That’s what makes it a good trade.', 'cta': 'Finish →'},
]

# ── 3 · A Valid Losing Trade ──────────────────────────────────────────
L[3] = [
    {'type': 'p8_focus', 'kind': 'chart', 'kicker': K(3, 'A loss isn’t a verdict'),
     'headline': 'Same checks. Different day.',
     'line': 'Room, PIL, a closed I → C → C, the retest entry, a stop beyond the correction. Every check passes.',
     'chips': ['MNQ', 'NY AM · 9:30', 'Long', {'text': '🔒 Outcome hidden', 'tone': 'lock'}],
     'chart': {'scenario': 'valid-loss', 'upto': 'R', 'marks': MARKS, 'pil': True, 'trade': True, 'curtain': True},
     'legend': True, 'cta': 'Play it forward →'},
    {'type': 'p8_focus', 'kind': 'reveal', 'kicker': K(3, 'A loss isn’t a verdict'),
     'headline': 'Watch it play out.',
     'chart': {'scenario': 'valid-loss', 'marks': MARKS, 'pil': True, 'trade': True, 'play': True, 'hit': True},
     'tiles': [{'label': 'Process', 'value': 'Valid · A', 'tone': 'good'}, {'label': 'Outcome', 'value': 'Stop hit · −1R', 'tone': 'work'}, {'label': 'Same trade as Lesson 2?', 'value': 'Yes', 'tone': 'dayli'}],
     'cta': 'Sort it out →'},
    {'type': 'p8_focus', 'kind': 'buckets', 'kicker': K(3, 'A loss isn’t a verdict'),
     'headline': 'Process or outcome?',
     'do': 'Drop each statement in the right place.',
     'buckets': [['process', 'Process', 'check', 'teal'], ['outcome', 'Outcome', 'coin', 'peach']],
     'items': [
         {'text': 'The PIL came from the 1H', 'answer': 'process', 'why': 'Known before the entry.'},
         {'text': 'The stop got hit', 'answer': 'outcome', 'why': 'That’s how it ended.'},
         {'text': 'Entry on the retest', 'answer': 'process', 'why': 'A decision you made.'},
         {'text': 'It lost 1R', 'answer': 'outcome', 'why': 'The result.'},
         {'text': 'Stop beyond the correction', 'answer': 'process', 'why': 'Risk set before the click.'},
     ],
     'dayli': 'The stop getting hit doesn’t rewrite the trade that existed before it.'},
    {'type': 'p8_focus', 'kind': 'pick', 'kicker': K(3, 'A loss isn’t a verdict'),
     'headline': 'After this loss, should the strategy change?',
     'options': [
         {'label': 'Yes, it lost', 'icon': 'swap', 'tone': 'pink', 'ok': False, 'say': 'Based on what? Every check passed. One outcome isn’t a sample.'},
         {'label': 'No, not from one valid loss', 'icon': 'shield', 'tone': 'teal', 'ok': True, 'say': 'Right. Nothing in the process failed.'},
         {'label': 'I need more data first', 'icon': 'bars', 'tone': 'purple', 'ok': True, 'say': 'Fair. And one trade isn’t data.'},
     ],
     'dayli': 'One valid loss is a cost of the method, not evidence against it.', 'cta': 'Finish →'},
]

# ── 4 · An Invalid Winning Trade ──────────────────────────────────────
L[4] = [
    {'type': 'p8_focus', 'kind': 'tap', 'kicker': K(4, 'Spot the rule break'),
     'headline': 'It paid. It was still wrong.',
     'line': 'A trader took this short and made +2R. Somewhere in here, they broke a rule.',
     'chips': ['MNQ', 'NY AM · 9:30', 'Short', 'Result: +2R'],
     'do': 'Tap the candle where the trader broke a rule. The pink tag shows where they got in.',
     'chart': {'scenario': 'early-win', 'pil': True, 'tags': [{'at': 'I', 'text': 'I', 'tone': 'dayli', 'below': True}, {'at': 'early', 'text': 'Their entry', 'tone': 'you'}]},
     'answer': 'early',
     'wrong': 'Not that one. Look at where they got in, and what hadn’t closed yet.',
     'right': '<b>That’s it.</b> They shorted the Correction candle, before the Continuation closed back below the PIL. The right entry was the retest.',
     'then': [{'at': 'C2', 'text': 'Cont', 'tone': 'dayli', 'below': True}, {'at': 'R', 'text': 'Right entry', 'tone': 'match', 'below': True}]},
    {'type': 'p8_focus', 'kind': 'pick', 'kicker': K(4, 'Spot the rule break'),
     'headline': 'So how do you grade it?',
     'options': [
         {'label': 'A', 'sub': 'It won, so it was good', 'icon': 'flag', 'tone': 'pink', 'ok': False, 'say': 'The result can’t upgrade the process. What rule did the entry break?'},
         {'label': 'C · rule break', 'sub': 'It broke the entry rule, even though it won', 'icon': 'stop', 'tone': 'teal', 'ok': True, 'say': 'Right. Grade the process. Record the +2R separately.'},
         {'label': 'Don’t grade it', 'sub': 'It’s in the past', 'icon': 'clock', 'tone': 'purple', 'ok': False, 'say': 'Ungraded wins become habits. Grade it.'},
     ]},
    {'type': 'p8_focus', 'kind': 'pick', 'kicker': K(4, 'Spot the rule break'),
     'headline': 'What would repeating this entry teach you?',
     'options': [
         {'label': 'Early entries can work, so I can use them sometimes', 'icon': 'swap', 'tone': 'pink', 'ok': False, 'say': 'That’s the wrong lesson the win is offering. One paid violation turns into a habit.'},
         {'label': 'That I can break the model and get paid, which is the dangerous part', 'icon': 'eye', 'tone': 'teal', 'ok': True, 'say': 'Exactly. The win is the warning.'},
     ]},
    {'type': 'p8_focus', 'kind': 'reveal', 'kicker': K(4, 'Spot the rule break'),
     'headline': 'A winner you don’t want to repeat.',
     'chart': {'scenario': 'early-win', 'pil': True, 'trade': True, 'hit': True, 'play': True, 'tags': [{'at': 'early', 'text': 'Their entry', 'tone': 'you'}, {'at': 'R', 'text': 'Right entry', 'tone': 'match', 'below': True}]},
     'tiles': [{'label': 'Outcome', 'value': 'Win · +2R'}, {'label': 'Process', 'value': 'C · early entry', 'tone': 'work'}, {'label': 'Journal it as', 'value': 'Rule break', 'tone': 'dayli'}],
     'dayli': 'Profitable rule-breaking isn’t evidence. It’s a warning.', 'cta': 'Finish →'},
]

# ── 5 · Clean vs Messy Setups ─────────────────────────────────────────
L[5] = [
    {'type': 'p8_focus', 'kind': 'sort', 'kicker': K(5, 'Clean or messy'),
     'headline': 'Valid isn’t the same as wanted.',
     'line': 'Four 1-minute charts at a PIL. Is each one a clean setup you want, or a messy one you leave alone?',
     'buckets': [['clean', 'Clean ✓'], ['messy', 'Messy ✕']],
     'minis': [
         {'scenario': 'clean-long', 'title': 'Chart A · Long', 'ctx': '1H trending up · room to the next high', 'answer': 'clean', 'why': 'One close through, one pullback, one Continuation. The level is respected.'},
         {'scenario': 'chop', 'title': 'Chart B · Long', 'ctx': '1H in a range · between structure', 'answer': 'messy', 'why': 'Price closes across the PIL over and over. Nothing is holding.'},
         {'scenario': 'clean-short', 'title': 'Chart C · Short', 'ctx': '1H trending down · room to the next low', 'answer': 'clean', 'why': 'Close below, pullback above, close below again, then follow-through.'},
         {'scenario': 'wicky', 'title': 'Chart D · Long', 'ctx': '1H flat · no clear room', 'answer': 'messy', 'why': 'Long wicks both ways and no direction. Your stop would sit inside the noise.'},
     ]},
    {'type': 'p8_focus', 'kind': 'grades', 'kicker': K(5, 'Clean or messy'),
     'headline': 'Three labels. Keep them separate.',
     'do': 'Chart B technically printed an I → C → C. Give it all three labels.',
     'chart': {'scenario': 'chop', 'pil': 'PIL', 'marks': ['I', 'C', 'C2'], 'h': 240},
     'rows': [
         {'label': 'Validity', 'icon': 'check', 'tone': 'teal', 'options': ['Valid', 'Invalid'], 'answer': 'Valid', 'why': 'The closes happened, so the rules were met.'},
         {'label': 'Quality', 'icon': 'eye', 'tone': 'peach', 'options': ['A', 'B', 'C'], 'answer': 'C', 'why': 'A choppy level and no room: questionable.'},
         {'label': 'Decision', 'icon': 'flag', 'tone': 'purple', 'options': ['Take', 'Wait', 'Pass'], 'answer': 'Pass', 'why': 'Valid isn’t the same as wanted.'},
     ],
     'after': 'VALID + C + PASS is a real combination.'},
    {'type': 'p8_focus', 'kind': 'note', 'kicker': K(5, 'Clean or messy'),
     'headline': 'What makes it messy',
     'cards': [
         {'icon': 'swap', 'tone': 'pink', 'title': 'Closes back and forth across the PIL', 'text': 'The level isn’t holding, so an Indication means very little.'},
         {'icon': 'candle', 'tone': 'peach', 'title': 'Long wicks, no direction', 'text': 'Your stop would sit in the middle of the noise.'},
         {'icon': 'layers', 'tone': 'purple', 'title': 'The 1H is between structure', 'text': 'No clear room to run, so no clean target.'},
     ],
     'dayli': 'The goal isn’t to find ICC everywhere. It’s to know which ICC you actually want.', 'cta': 'Finish →'},
]

# ── 6 · Why I Passed This Trade ───────────────────────────────────────
L[6] = [
    {'type': 'p8_focus', 'kind': 'pick', 'kicker': K(6, 'Passing is a decision'),
     'headline': 'A beautiful setup. Three minutes before CPI.',
     'line': 'Your news rule: no entries 5 minutes either side of a major release.',
     'chips': ['MNQ', 'NY AM', {'text': '⚠ CPI release in 3 minutes', 'tone': 'stop'}],
     'chart': {'scenario': 'news-pass', 'upto': 'R', 'marks': MARKS, 'pil': True, 'curtain': 'What happens next is hidden'},
     'q': 'The retest is here. What do you do?',
     'options': [
         {'label': 'Take it', 'sub': 'Everything lines up', 'icon': 'target', 'tone': 'pink', 'ok': False, 'say': 'The setup is valid. Your news rule still says no. Rules don’t bend for pretty charts.'},
         {'label': 'Wait for CPI, then enter', 'sub': 'Enter after the release', 'icon': 'clock', 'tone': 'peach', 'ok': False, 'say': 'By then this entry is gone. Entering later means chasing a different trade.'},
         {'label': 'Pass', 'sub': 'My news rule blocks it', 'icon': 'shield', 'tone': 'teal', 'ok': True, 'say': 'Yes. The setup is valid. It just isn’t yours.'},
     ]},
    {'type': 'p8_focus', 'kind': 'minis', 'kicker': K(6, 'Passing is a decision'),
     'headline': 'Three ways it could have ended.',
     'line': 'Your pass is graded on what you knew at the decision, not on how it ended.',
     'minis': [
         {'title': 'It runs', 'chart': {'scenario': 'end-run', 'trade': True, 'play': True, 'hit': True}, 'note': '<b>Pass ✓</b> Still correct.', 'tone': 'good'},
         {'title': 'It reverses', 'chart': {'scenario': 'end-reverse', 'trade': True, 'play': True, 'hit': True}, 'note': '<b>Pass ✓</b> Still correct.', 'tone': 'good'},
         {'title': 'It chops', 'chart': {'scenario': 'end-chop', 'trade': True, 'play': True, 'hit': True}, 'note': '<b>Pass ✓</b> Still correct.', 'tone': 'good'},
     ]},
    {'type': 'p8_focus', 'kind': 'reveal', 'kicker': K(6, 'Passing is a decision'),
     'headline': 'It would have won. The pass was still right.',
     'chart': {'scenario': 'news-pass', 'marks': MARKS, 'pil': True, 'trade': True, 'play': True, 'hit': True},
     'tiles': [{'label': 'Your decision', 'value': 'Pass ✓', 'tone': 'good'}, {'label': 'Would have been', 'value': '+2R'}, {'label': 'Grade', 'value': 'Correct pass', 'tone': 'dayli'}],
     'dayli': 'Passing isn’t failing to find a trade. It can be executing the rule that says: this one isn’t mine.', 'cta': 'Finish →'},
]

# ── 7 · The Missed Trade ──────────────────────────────────────────────
L[7] = [
    {'type': 'p8_focus', 'kind': 'pick', 'kicker': K(7, 'Don’t chase it'),
     'headline': 'You came back at 10:04. It’s gone.',
     'line': 'Your plan: long on the retest of the PIL. The retest came while your phone was on silent in the other room.',
     'chips': ['MNQ', 'NY AM', 'Alert set at the PIL retest', {'text': 'Phone in the other room', 'tone': 'stop'}],
     'chart': {'scenario': 'missed', 'upto': 'late', 'play': True, 'playFrom': 'C2', 'marks': MARKS, 'pil': True, 'tags': [{'at': 'R', 'text': 'Your planned entry', 'tone': 'you', 'below': True}]},
     'q': 'Price is far above your planned entry. Now what?',
     'options': [
         {'label': 'Chase it now', 'sub': 'Get in before it runs more', 'icon': 'bolt', 'tone': 'pink', 'ok': False, 'say': 'That isn’t your setup any more. Your stop and target were built for the retest.'},
         {'label': 'Find any reason to get in', 'sub': 'A smaller pullback, maybe', 'icon': 'zoom', 'tone': 'peach', 'ok': False, 'say': 'That’s inventing an entry because you missed one.'},
         {'label': 'Let it go', 'sub': 'The planned entry is gone', 'icon': 'check', 'tone': 'teal', 'ok': True, 'say': 'Yes. A missed trade costs nothing. A chase can.'},
     ]},
    {'type': 'p8_focus', 'kind': 'pick', 'kicker': K(7, 'Don’t chase it'),
     'headline': '“Next time I’ll enter earlier.” What actually failed?',
     'options': [
         {'label': 'The strategy', 'icon': 'layers', 'tone': 'pink', 'ok': False, 'say': 'It produced exactly the trade it was supposed to.'},
         {'label': 'The analysis', 'icon': 'eye', 'tone': 'pink', 'ok': False, 'say': 'The read was right. Price reached the target.'},
         {'label': 'The entry model', 'sub': 'I should enter before the retest', 'icon': 'target', 'tone': 'pink', 'ok': False, 'say': 'The retest came, exactly as planned. You weren’t there for it.'},
         {'label': 'Access and attention', 'sub': 'I wasn’t at the screen', 'icon': 'clock', 'tone': 'teal', 'ok': True, 'say': 'Yes. The method worked. The miss was access and attention.'},
     ]},
    {'type': 'p8_focus', 'kind': 'note', 'kicker': K(7, 'Don’t chase it'),
     'headline': 'A pass and a miss are different things.',
     'cards': [
         {'icon': 'shield', 'tone': 'teal', 'title': 'A pass is a decision', 'text': 'You chose not to participate, for a reason.'},
         {'icon': 'clock', 'tone': 'peach', 'title': 'A miss is an execution gap', 'text': 'A valid, planned trade that didn’t get placed.'},
         {'icon': 'bolt', 'tone': 'purple', 'title': 'Fix the gap, not the method', 'text': 'An alert you can hear. Being at the screen in your window.'},
     ],
     'dayli': 'Don’t change the method just because hindsight gave you perfect vision.', 'cta': 'Finish →'},
]

# ── 8 · Right Analysis. Wrong Execution. ──────────────────────────────
L[8] = [
    {'type': 'p8_focus', 'kind': 'pick', 'kicker': K(8, 'Execution is its own skill'),
     'headline': 'Same read. Two traders.',
     'line': 'Both read this long correctly. Both made money. Only one followed the plan.',
     'chips': ['MNQ', 'NY AM · 9:30', 'Long'],
     'chart': {'scenario': 'two-traders', 'pil': True, 'marks': ['I', 'C', 'C2'], 'tags': [{'at': 'chase', 'text': 'Trader A', 'tone': 'you'}, {'at': 'patient', 'text': 'Trader B', 'tone': 'match', 'below': True}]},
     'q': 'Who executed the plan?',
     'options': [
         {'label': 'Trader A', 'sub': 'Bought the push after the Continuation', 'icon': 'bolt', 'tone': 'pink', 'ok': False, 'say': 'That’s a chase. The plan was the retest.'},
         {'label': 'Trader B', 'sub': 'Waited for the retest of the PIL', 'icon': 'target', 'tone': 'teal', 'ok': True, 'say': 'Yes. Same read, executed as planned.'},
     ]},
    {'type': 'p8_focus', 'kind': 'grades', 'kicker': K(8, 'Execution is its own skill'),
     'headline': 'Grade Trader A, one part at a time.',
     'do': 'Trader A: bought the push, used 3× normal size, moved the stop once. Hit a small win.',
     'rows': [
         {'label': 'Analysis', 'icon': 'eye', 'tone': 'teal', 'options': ['Good', 'Poor'], 'answer': 'Good', 'why': 'The read was right.'},
         {'label': 'Execution', 'icon': 'target', 'tone': 'pink', 'options': ['Good', 'Poor'], 'answer': 'Poor', 'why': 'Chased instead of waiting for the retest.'},
         {'label': 'Risk', 'icon': 'shield', 'tone': 'pink', 'options': ['Good', 'Poor'], 'answer': 'Poor', 'why': '3× size is outside the plan.'},
         {'label': 'Management', 'icon': 'swap', 'tone': 'pink', 'options': ['Good', 'Poor'], 'answer': 'Poor', 'why': 'Moving the stop breaks the plan you set.'},
         {'label': 'Outcome', 'icon': 'coin', 'tone': 'peach', 'options': ['Win', 'Loss'], 'answer': 'Win', 'why': 'A win, and it doesn’t fix the other four.'},
     ],
     'after': 'Five separate grades. A win in one doesn’t erase the others.'},
    {'type': 'p8_focus', 'kind': 'reveal', 'kicker': K(8, 'Execution is its own skill'),
     'headline': 'Right about the market. Wrong about the trade.',
     'tiles': [{'label': 'Analysis', 'value': 'Good', 'tone': 'good'}, {'label': 'Execution · risk · management', 'value': 'Poor', 'tone': 'work'}, {'label': 'Outcome', 'value': 'Small win'}],
     'dayli': 'Being right about the market doesn’t erase being wrong about the execution.', 'cta': 'Finish →'},
]

# ── 9 · Indicator vs No Indicator ─────────────────────────────────────
L[9] = [
    {'type': 'p8_focus', 'kind': 'level', 'kicker': K(9, 'Your eyes first'),
     'headline': 'Indicator off. Find the PIL yourself.',
     'line': 'This is the 1H. Price rallied, then pulled back.',
     'do': 'Tap the price of the 1H swing high price pulled back from. That’s your PIL.',
     'chart': {'scenario': 'map-1h'},
     'answer': 'swing', 'tolerance': 15,
     'wrong': 'Not quite. Look for the highest swing, the one the pullback started from.',
     'right': '<b>Yes.</b> The 1H swing price pulled back from. That’s the level the session will test.'},
    {'type': 'p8_focus', 'kind': 'pick', 'kicker': K(9, 'Your eyes first'),
     'headline': 'Now switch the indicator on.',
     'line': 'It marked a different level: a smaller swing inside the rally.',
     'chart': {'scenario': 'map-1h', 'levels': [{'ref': 'swing', 'label': 'Dayli · PIL', 'tone': 'dayli', 'from': 'swing'}, {'ref': 'internal', 'label': 'Indicator', 'tone': 'muted', 'dash': True, 'from': 'internal'}]},
     'q': 'Which one is the PIL?',
     'options': [
         {'label': 'The indicator’s level', 'sub': 'It’s automatic, so it’s right', 'icon': 'bolt', 'tone': 'pink', 'ok': False, 'say': 'The indicator anchored on an internal swing. A difference isn’t automatically your mistake.'},
         {'label': 'The 1H swing', 'sub': 'The level price pulled back from', 'icon': 'eye', 'tone': 'teal', 'ok': True, 'say': 'Yes. The 1H swing comes first because it’s the level on the map.'},
     ]},
    {'type': 'p8_focus', 'kind': 'pick', 'kicker': K(9, 'Your eyes first'),
     'headline': 'How should the indicator help you?',
     'line': 'Your choice is saved. You can change it any time.',
     'pref': 'indicatorAssist',
     'options': [
         {'label': 'Show it after I mark', 'sub': 'Recommended: my eyes first, then check my work', 'icon': 'check', 'tone': 'teal', 'value': 'AFTER', 'say': 'Saved. You mark first, then the indicator checks you.'},
         {'label': 'Show it from the start', 'sub': 'Faster, but it can do the thinking for me', 'icon': 'eye', 'tone': 'peach', 'value': 'ON', 'say': 'Saved. Keep checking that you can explain the read without it.'},
         {'label': 'Keep it off', 'sub': 'Raw charts only', 'icon': 'lock', 'tone': 'purple', 'value': 'OFF', 'say': 'Saved. Raw charts it is.'},
     ],
     'dayli': 'The indicator should make your process faster, not replace your eyes.', 'cta': 'Finish →'},
]

for n, slides in L.items():
    p = os.path.join(HERE, '..', 'lessons-data', f'p8-{n}.json')
    d = json.load(open(p))
    d['slides'] = slides
    with open(p, 'w') as f:
        json.dump(d, f, ensure_ascii=False, separators=(',', ':'))
    print(f'p8-{n}: {len(slides)} slides')
