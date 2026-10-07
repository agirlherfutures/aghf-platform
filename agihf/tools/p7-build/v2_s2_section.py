"""Phase 7 · Section 19 checkpoint: Rulebook Builder Lab, Knowledge Check, Check-In, completion."""
import copy
import v2tapes as B
from v2tapes import *  # noqa: F401,F403
from v2lib import *  # noqa: F401,F403
from v2_s2 import L as LES, clean, cm, TREND_CHOP
from p7lib import *  # noqa: F401,F403
B.loss1, B.lm = B.LOSS, B.LM


def moment(name, concept, n, intro, extra=None):
    beats = [say(*intro)] + (extra or []) + [copy.deepcopy(next(b for b in LES[n]['slides'][0]['beats'] if 'choice' in b))]
    d = scene('', '', beats); d.update({'name': name, 'concept': concept}); return d

S = 's19'

def lvl(name, concept, slide, **kw):
    d = dict(slide); d.update({'name': name, 'concept': concept}); d.update(kw); return d

def rc(check_, title, situation, setup_='valid', thought=None, facts=None, **kw):
    d = {'type': 'p7_rulecheck', 'title': title, 'check': check_, 'situation': situation, 'setup': setup_, 'rcat': {'dailyStop': 'daily', 'maxTrades': 'maxTrades', 'news': 'news', 'environment': 'environment', 'noChase': 'noChase'}[check_]}
    if thought: d['thought'] = thought
    if facts: d['facts'] = facts
    d.update(kw)
    return d

levels = [
    lvl('Strategy or personal?', 'Strategy rule recognition', sort('', 'Sort the rules', [('method', 'MY MODEL', 'ink', '📐 MY MODEL'), ('personal', 'PERSONAL', 'ink', '📕 PERSONAL')], [
        ('Indication requires a candle close through the PIL', 'method'), ('No new entries after 11:00', 'personal'), ('Entry at the first valid retest', 'method'),
        ('Maximum 2 trades per day', 'personal'), ('Continuation must close back through the PIL', 'method'), ('Daily stop after −2R', 'personal')], track=False),
        sessionStart='rulebook-lab', sessionKind='rules', brief='Not “what would a disciplined trader do?”. What does YOUR rulebook say?'),
    lvl('Close the loophole', 'Rule writing', {'type': 'p7_rule_write', 'weak': 'I won’t chase too much.', 'critique': ['TOO MUCH = HOW MUCH? 😂'],
        'options': [{'text': 'I won’t chase unless it looks really good.', 'feedback': 'BUILT-IN LOOPHOLE: “unless it looks really good”.'},
                    {'text': 'If my retest entry is missed and price moves away, I do not market-enter late. I wait for a new valid setup.', 'correct': True, 'why': 'No loophole left.'}],
        'rcat': 'noChase', 'allowCustom': True, 'save': 'noChase'}),
    lvl('Your daily stop', 'Daily stop', {'type': 'p7_session', 'events': [
        {'title': 'Your rule', 'slide': {'type': 'p7_rule_form', 'form': 'dailyStop', 'onlyIfMissing': True, 'title': 'Define your daily stop'}},
        {'title': 'The check', 'slide': rc('dailyStop', 'Two losses today. A valid setup forms.', {'atLimit': True}, facts=[['Today', 'At your daily stop']])}]}),
    lvl('Your news rule', 'News rule', {'type': 'p7_session', 'events': [
        {'title': 'Your rule', 'slide': {'type': 'p7_rule_form', 'form': 'news', 'onlyIfMissing': True, 'title': 'Build your news rule'}},
        {'title': 'The check', 'slide': rc('news', 'High-impact event in 4 minutes. Valid setup.', {'minutesToEvent': 4}, facts=[['Event', 'in 4 minutes'], ['Setup', 'valid']])}]}),
    lvl('Your consolidation rule', 'Environment rule', {'type': 'p7_session', 'events': [
        {'title': 'Your rule', 'slide': {'type': 'p7_rule_form', 'form': 'environment', 'onlyIfMissing': True, 'title': 'Build your environment rule'}},
        {'title': 'The check', 'slide': rc('environment', 'Tight consolidation. A technical setup appears.', {'env': 'tight-consolidation'}, chart=TREND_CHOP, facts=[['Environment', 'Tight consolidation']])}]}),
    moment('The stop', 'Risk rule adherence', 16, ['−24 and your stop is at −30.'], [th('“Just give it a little more room.”')]),
    moment('One tick away', 'No chase', 17, ['Your limit missed by one tick. Price is leaving.'], [th('“That was MY trade.”')]),
    moment('Almost', 'Real-time exceptions', 15, ['A wick through the PIL. No close.'], [th('“But this one looks GOOD.”')]),
    lvl('Identify the violation', 'Violation recognition', {'type': 'p7_process', 'rcat': 'violation', 'trades': [
        {'name': 'THE TRADE', 'facts': ['Entered before Continuation.', 'Won.'], 'result': '+2R WIN', 'violations': ['Early entry'], 'answers': {'outcome': 'WIN', 'process': 'VIOLATION'}}]}),
    lvl('Find the trigger', 'Trigger identification', pask('', 'Missed trade → next trade chased', [
        qq('What’s the likely trigger?', o('The setup quality', feedback='The setup didn’t change. Her state did.'), o('FOMO after a missed opportunity', True, why='The missed winner is the trigger. The chase is the behavior.'), o('News', feedback='Nothing in the sequence points to news.'), rcat='trigger')])),
    lvl('Build the response', 'Response planning', pask('', 'After a loss: the urge to size up', [
        qq('What’s the rule-based response?', o('Size up to recover faster', feedback='Revenge + a risk violation.', track='revengeDecisionCount'),
           o('Next valid trade stays standard planned size, if session rules permit', True, why='Same size. Same rules. The loss doesn’t change the risk model.'), o('Skip every trade for a week', feedback='That’s a feeling, not a rule.'), rcat='response')])),
    lvl('Create your five', 'Response planning', {'type': 'p7_rulebook', 'parts': ['five', 'when']}),
    lvl('FINAL BOSS: Can you follow your own rulebook?', 'Full session', {'type': 'p7_session', 'title': 'Your rulebook, your session',
        'hud': {'trades': 0, 'dailyR': 0, 'temp': 'calm', 'status': 'SESSION MODE · rules read-only'},
        'events': [
            {'title': 'Before the session', 'slide': {'type': 'p7_rulebook_view', 'mode': 'session', 'title': 'Your rulebook, loaded', 'sessionContext': 'Rulebook Builder final session',
                'body': 'Session Mode: read-only. If you want to change a rule, flag it for review. Try it if you like.'}},
            {'title': 'Situation 1 · a valid setup', 'slide': sim('', '', B.loss1, B.lm['indication'] - 2, [
                cp(B.lm['retest'], kind='decide', expect='enter', prompt='First valid retest. Your rules allow a first trade.')], actions=['wait', 'enter', 'pass'], timeline=False, speed=650,
                end={'text': '<b>−1R.</b> Correct trade. Valid loss.'}), 'after': {'trades': 1, 'dailyR': -1}},
            {'title': 'Situation 2 · another valid setup', 'slide': rc('maxTrades', 'Another valid setup. Within limits?', {'tradesTaken': 1}, facts=[['Trades today', '1'], ['Day', '−1R']])},
            {'title': 'Situation 3 · missed retest', 'slide': rc('noChase', 'The retest came and went. Price is running.', {'missedRetest': True}, thought='“I can still catch it.”')},
            {'title': 'Situation 4 · scheduled event', 'slide': rc('news', 'High-impact event in 3 minutes.', {'minutesToEvent': 3})},
            {'title': 'Situation 5 · consolidation', 'slide': rc('environment', 'Tight consolidation. Something technical.', {'env': 'tight-consolidation'})},
            {'title': 'A thought mid-session', 'slide': pask('', '“My two-trade maximum might be too restrictive.”', [
                qq('What do you do with that thought during the session?', o('Change the rule now', feedback='Rules are read-only in Session Mode.', rinc='exceptions'), o('Flag it: REVIEW THIS RULE LATER', True, why='Queued. You’ll see it after the session.'), rcat='maxTrades')])},
            {'title': 'Situation 6 · daily stop reached', 'slide': rc('dailyStop', 'Daily stop reached. Then: the cleanest setup of the session.', {'atLimit': True}, thought='“But THIS one is perfect.”', chart=xchart(clean, show=cm['retest'] + 1)), 'after': {'status': 'SESSION OVER ✓', 'statusTone': 'ok'}},
            {'title': 'After the session', 'slide': {'type': 'p7_rule_queue', 'title': 'Now, calmly'}},
        ], 'review': 'rules', 'reviewKicker': '📕 Your rulebook review', 'reviewTitle': 'Rule adherence',
        'reviewClean': 'The method, the account and YOUR predefined rules outranked FOMO, revenge, boredom and real-time excuses.'}),
]

game = {'title': 'Your Rulebook, Live 📕', 'save': 'p7-s19', 'xp': 0, 'tagline': 'Personalized. Built from YOUR rulebook.',
        'doneHeading': 'YOUR RULEBOOK HELD ✓', 'doneLine': 'You let the method, the account and your own predefined rules decide. Not the moment.',
        'readout': 'YOUR RULES READ',
        'review': {'Strategy rule recognition': ['p7', 14, 'Written While Calm'], 'Rule writing': ['p7', 20, 'The Rule You Keep Negotiating'], 'Daily stop': ['p7', 18, 'Done Means Done'], 'News rule': ['p7', 19, 'The News You Already Knew About'],
                   'Environment rule': ['p7', 25, 'Chop: Protect'], 'Real-time exceptions': ['p7', 15, '“But This One Looks Good.”'], 'Violation recognition': ['p7', 21, 'When You Break One'], 'No chase': ['p7', 17, 'The Missed Trade'],
                   'Trigger identification': ['p7', 21, 'When You Break One'], 'Response planning': ['p7', 21, 'When You Break One'], 'Risk rule adherence': ['p7', 16, 'Moving the Stop'], 'Full session': ['p7', 22, 'Your Rulebook']},
        'levels': levels}

bank = [
    kc('Participation', 'Valid setup. Daily stop reached. What’s true?', ['Take it, it’s valid', 'Setup valid · participation not allowed', 'Setup invalid', 'Take it at half size'], 1, 'Setup validity and participation eligibility are separate.'),
    kc('Participation', 'Invalid setup. Every personal rule is clear. What do you do?', ['Take it: rules allow it', 'No trade', 'Take it small', 'Wait for news'], 1, 'Personal eligibility can never make an invalid setup valid.'),
    kc('No chase', 'Missed retest. Price runs to the target. She didn’t chase. Grade it.', ['Rule broken: she missed money', 'Rule followed', 'Hesitation', 'Overtrading'], 1, 'Following the no-chase rule doesn’t require the market to punish the skipped trade.'),
    kc('Max trades', 'Max trades = 2. Two trades done. The third setup is perfect. What does the session rule say?', ['Take it', 'The session rule blocks it', 'Take half size', 'Ask a friend'], 1, 'Maximum means maximum.'),
    kc('Rule changes', 'Mid-session she believes her max should be 3. What does she do?', ['Change it now', 'Queue it for review, don’t change it live', 'Ignore the rule today', 'Delete the rule'], 1, 'Rules change in Review Mode, with evidence.'),
    kc('News rule', 'High-impact event in 3 minutes. Her saved rule prohibits entries within 5. Valid setup. Decision?', ['TAKE', 'PASS', 'Take it smaller', 'Wait 2 minutes, then take it'], 1, 'Her rule blocks new entries in that window.'),
    kc('News rule', 'High-impact event in 3 minutes. She has NO news rule defined. What happens?', ['The Academy invents a 5-minute rule', 'Flag it: NEWS RESPONSE NOT DEFINED', 'News doesn’t matter', 'Take it'], 1, 'Undefined is flagged and resolved in Review Mode. Never invented.'),
    kc('Violations', 'Trade wins. She entered before Continuation. How is it recorded?', ['Win · followed', 'Win · rule violation', 'Loss', 'Not recorded'], 1, 'Outcome and adherence are separate dimensions.'),
    kc('Violations', 'Trade loses. Every rule was followed. How is it recorded?', ['Loss · violation', 'Loss · valid process', 'A mistake', 'Strategy broken'], 1, 'A loss is not automatically a mistake.'),
    kc('Violation review', 'She chased after missing a winner. What should the violation review connect?', ['Nothing, just move on', 'Trigger: missed winner → behavior: chase → her IF / THEN response', 'Her personality', 'Her P&L'], 1, 'IF trigger X happens, THEN I do Y.'),
    kc('Rule writing', '“I won’t chase unless it looks really good.” What’s the problem?', ['Nothing', 'A built-in loophole', 'It’s too strict', 'It needs a number of trades'], 1, '“Unless it looks really good” is exactly where live-trading-you escapes.'),
    kc('Risk', 'A personal behavior rule says “after a loss I size up”. Her risk limit is 1R. Which wins?', ['The behavior rule', 'The hard risk limit', 'Whichever feels right', 'Both, alternately'], 1, 'A personal rule can never override account safety.'),
    kc('Environment', 'All technical criteria are met, but her environment rule blocks tight consolidation. Decision?', ['Take it', 'Valid setup · PASS under her plan', 'Setup invalid', 'Rewrite the rule'], 1, 'Technically valid can still be outside her participation rules.'),
    kc('Participation', 'She’s calm and confident. The setup is invalid. Decision?', ['Take it, she feels great', 'No trade', 'Half size', 'Wait for news'], 1, 'Psychological readiness doesn’t create technical validity.'),
]

section = {
    'phase': P, 'section': S, 'title': 'Rules That Protect You 📕',
    'steps': ['game', 'knowledge', 'checkin', 'complete'],
    'hook': 'Run your rulebook through a real session, pass the Knowledge Check and save your Check-In to unlock Section 3.',
    'game': game,
    'knowledgeCheck': {'questionCount': 12, 'passPct': 0.8, 'xp': 0, 'shuffleOptions': True, 'questionBank': bank,
        'reviewLessons': {'Participation': ['p7', 14], 'No chase': ['p7', 17], 'Max trades': ['p7', 18], 'Rule changes': ['p7', 20], 'News rule': ['p7', 19], 'Violations': ['p7', 21],
                          'Violation review': ['p7', 21], 'Rule writing': ['p7', 20], 'Risk': ['p7', 16], 'Environment': ['p7', 25]}},
    'checkin': {'eyebrow': '📓 My Section 2 Check-In · private to you', 'heading': 'Your operating system 📕',
        'intro': '<p class="p7-fine">Saved to your private Academy Notes. Never shared, never ranked.</p>',
        'fields': [
            {'type': 'text', 'label': 'Which rule do I most want to break when I’m emotional?'},
            {'type': 'text', 'label': 'What do I tell myself when I move a stop or chase?', 'share': True},
            {'type': 'text', 'label': 'My no-chase rule'},
            {'type': 'text', 'label': 'My daily stop, and what I do when I hit it'},
            {'type': 'text', 'label': 'IF my trigger shows up, THEN I…'},
            {'type': 'text', 'label': 'My five non-negotiables', 'rows': 3},
            {'type': 'choice', 'label': 'Which area needs another look?', 'options': ['Written While Calm', '“But This One Looks Good.”', 'Moving the Stop', 'The Missed Trade', 'Done Means Done', 'The News You Already Knew About', 'The Rule You Keep Negotiating', 'When You Break One', 'Your Rulebook']},
        ], 'saveLabel': 'Save to My Academy Notes →', 'savedLabel': '✓ Saved to your private Academy Notes'},
    'complete': {
        'eyebrow': '🎉 Section complete', 'heading': '✦ YOU HAVE RULES THAT SPEAK LOUDER THAN YOUR EMOTIONS.', 'badge': 'Rules That Protect You: Complete', 'gp': 850,
        'cinema': mono(kicker='', chart=xchart(clean, show=cm['retest'] + 1, head={'tf': '1M', 'label': 'A tempting setup'}), thoughts=['“Just this once?”'],
                       cards=['NO CHASE ✓', 'MAX TRADES ✓', 'DAILY STOP ✓', 'NEWS RULE ✓', 'RISK RULE ✓'],
                       lines=['YOU DON’T HAVE TO', 'MAKE EVERY DECISION', 'FROM SCRATCH ANYMORE.']),
        'stats': [{'label': 'Lessons', 'value': '{lessons} ✓'}, {'label': 'Rulebook, Live', 'value': '✓'}, {'label': 'Knowledge Check', 'value': '{kc}% ✓'}, {'label': 'Personal Rulebook', 'value': 'Saved ✓'}],
        'badgeUnlock': {'icon': '📕', 'title': 'RULE KEEPER', 'line': '“You stopped relying on willpower and built an operating system.”'},
        'phase': {'title': 'PHASE 7 STATUS', 'pct': 67, 'sections': [{'icon': '✓', 'label': 'Your Mind Is the Market'}, {'icon': '✓', 'label': 'Rules That Protect You'}, {'icon': '🔓', 'label': 'Reading the Environment'}]},
        'nextUp': {'title': 'Section 3: Reading the Environment 🌡️',
            'cinema': mono(kicker='', lines=['Your model tells you WHAT you’re looking for.', '<b>THE ENVIRONMENT TELLS YOU WHETHER YOU SHOULD BE LOOKING FOR IT AT ALL.</b>']),
            'lines': ['📕 Your rulebook lives at <a href="rulebook.html">MY AGHF RULEBOOK →</a>. View it before every session.'],
            'questions': ['Same Model, Different Day', 'Clean Market: Participate', 'Chop: Protect', 'Between Structure: Wait', 'Almost Right: Do Nothing', 'The Fast Market', 'Outside Your Window', 'The Morning You Had', 'Nothing Is a Position'],
            'cta': 'READ THE ENVIRONMENT →'},
    },
}
chk(section)
write('p7-s19-section.json', section)
