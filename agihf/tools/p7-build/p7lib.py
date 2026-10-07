"""Phase 7 builders, on top of the Phase 6 / Phase 5 libs (real tapes, checked against the model)."""
import sys, os, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'p6'))
from p6lib import *  # noqa: F401,F403
from p6lib import evaluate, check, scen, setup, cp, sim, kc, sort, opt, PIL, CTX  # noqa: F401
from lib import ask, teach, dayli, reflect, lesson, write, check_no_emdash, chart  # noqa: F401
from tape import Tape, bull_setup, q  # noqa: F401

P = 'p7'
E, SL, TP = 20000, 19970, 20060
PLAN = {'entryPrice': E, 'stopPrice': SL, 'targetPrice': TP, 'contractCount': 2, 'managementModel': 'fixed',
        'partialRules': 'None', 'runnerRules': 'None', 'breakEvenRules': 'None', 'structuralRules': 'None', 'earlyInterventionRules': 'A 1M close below the 1H HL'}


def plan(**kw):
    d = dict(PLAN); d.update(kw); return d


def mtape(offsets, seed=1, hit=None, pre=5):
    r = random.Random(seed)
    t = Tape(E + 18, seed); t.b = []
    t.drift(E + 3, pre, cap_lo=E + 1)
    entry_at = t.hl(E + 2.5, l=E - 0.25)
    for o in offsets:
        c = q(E + o)
        o_ = t.p
        hi = max(o_, c) + q(r.uniform(0.25, 2.5)); lo = min(o_, c) - q(r.uniform(0.25, 2.5))
        hi = min(hi, TP - 1); lo = max(lo, SL + 1)
        t.b.append({'o': o_, 'h': q(hi), 'l': q(lo), 'c': c}); t.p = c
    if hit == 'tp':
        t.b.append({'o': t.p, 'h': TP + 1.5, 'l': t.p - 1, 'c': TP + 0.5}); t.p = TP + 0.5
    if hit == 'sl':
        t.b.append({'o': t.p, 'h': t.p + 1, 'l': SL - 1.5, 'c': SL - 0.5}); t.p = SL - 0.5
    return t.b, entry_at


def at(entry_at, i):
    return entry_at + 1 + i


def msim(title, kicker, bars, entry_at, checkpoints, pl=None, **kw):
    d = {'type': 'manage_sim', 'kicker': kicker, 'title': title, 'plan': pl or PLAN, 'bars': bars, 'entryAt': entry_at, 'checkpoints': checkpoints}
    d.update(kw)
    return d


def mcp(i_bar, **kw):
    d = {'at': i_bar}; d.update(kw); return d


def xchart(bars, show=None, pil=PIL, tags=None, head=None, lines=None):
    d = {'bars': bars, 'pil': pil, 'pilAt': next((i for i, b in enumerate(bars) if b['h'] == pil), None)}
    if show is not None: d['show'] = show
    if tags: d['tags'] = tags
    if head: d['head'] = head
    if lines: d['lines'] = lines
    return d


def mono(**kw):
    d = {'type': 'p7_monologue'}; d.update(kw); return d


def pask(kicker, title, asks, **kw):
    d = {'type': 'p7_ask', 'kicker': kicker, 'title': title, 'asks': asks}; d.update(kw); return d


def mirror(title, thought, asks=None, who=None, **kw):
    d = {'type': 'p7_mirror', 'title': title, 'thought': thought}
    if asks: d['asks'] = asks
    if who: d['who'] = who
    d.update(kw)
    return d


def split(kicker, title, left, right, **kw):
    d = {'type': 'p7_split', 'kicker': kicker, 'title': title, 'left': left, 'right': right}; d.update(kw); return d


def col(h, lines, tone='ink', **kw):
    d = {'h': h, 'lines': lines, 'tone': tone}; d.update(kw); return d


def tally(kicker, title, rows, **kw):
    d = {'type': 'p7_tally', 'kicker': kicker, 'title': title, 'rows': rows}; d.update(kw); return d


def o(label, correct=False, **kw):
    """Option with Phase 7 tracking keys (track / rinc / einc)."""
    d = {'label': label}
    if correct: d['correct'] = True
    d.update(kw)
    return d


def qq(prompt, *options, **kw):
    d = {'prompt': prompt, 'options': list(options)}
    d.update(kw)
    return d


def chk(*objs):
    for i, x in enumerate(objs):
        check_no_emdash(x, f'item {i}')
