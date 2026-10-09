"""
Builds shared/icc-walk-scenarios.js: multi-timeframe charts for the Phase 5
ICC walk-through (shared/icc-walk.js).

    python3 tools/build-icc-walks.py

Each scenario has three charts that tell one story:
  4H  bullish (or bearish), an HTF indication through a 4H swing (the 4H PIL), now correcting
  1H  price reacting at a 1H level inside that correction
  1M  a 1M PIL, then Indication -> Correction -> Continuation (each a CLOSE past the PIL),
      then the first retest of the PIL

The 1M sequence comes in two rhythms: 'tight' (I, C, C on three back-to-back
candles) and 'spread' (several candles between each step). Every answer is
derived from the bars and checked; the build fails if a chart doesn't say
what the lesson says.
"""
import json, random, os

TICK = 0.25
q = lambda p: round(p / TICK) * TICK


def leg(bars, to, n, rnd, vol, counter=0, wick=0.35):
    """Walk from the last close to `to` over n bars, mostly in the leg's direction."""
    p = bars[-1]['c'] if bars else to
    up = to > p
    flips = set(rnd.sample(range(1, max(2, n - 1)), min(counter, max(0, n - 2)))) if n > 2 else set()
    for j in range(n):
        o = p
        tgt = p + (to - p) / (n - j)
        if j in flips:
            c = o + (-1 if up else 1) * vol * (0.25 + rnd.random() * 0.35)
        else:
            c = tgt + (rnd.random() - 0.5) * vol * 0.3
            if up and c <= o: c = o + vol * 0.25
            if not up and c >= o: c = o - vol * 0.25
        if j == n - 1: c = to
        hi = max(o, c) + vol * (0.06 + rnd.random() * wick)
        lo = min(o, c) - vol * (0.06 + rnd.random() * wick)
        bars.append({'o': q(o), 'c': q(c), 'h': q(hi), 'l': q(lo)})
        p = q(c)
    return bars


def bar(o, c, hi=None, lo=None, vol=1.0):
    hi = max(o, c) + 0.15 * vol if hi is None else hi
    lo = min(o, c) - 0.15 * vol if lo is None else lo
    return {'o': q(o), 'c': q(c), 'h': q(max(hi, o, c)), 'l': q(min(lo, o, c))}


def mirror(bars, pivot):
    m = lambda v: q(2 * pivot - v)
    return [{'o': m(b['o']), 'c': m(b['c']), 'h': m(b['l']), 'l': m(b['h'])} for b in bars]


# ── Rules (bullish frame; bearish is checked on the mirrored data) ──────────
def side(close, pil, bull):
    return (close > pil) if bull else (close < pil)


def derive_icc(bars, pil, start, bull):
    """First close through the PIL (I), first close back (C), first close through again (C), first retest."""
    out = {}
    phase = 'I'
    for i in range(start, len(bars)):
        b = bars[i]
        if phase == 'I' and side(b['c'], pil, bull): out['I'] = i; phase = 'C'
        elif phase == 'C' and not side(b['c'], pil, bull) and b['c'] != pil: out['C'] = i; phase = 'C2'
        elif phase == 'C2' and side(b['c'], pil, bull): out['C2'] = i; phase = 'R'
        elif phase == 'R':
            touch = b['l'] <= pil if bull else b['h'] >= pil
            if touch and side(b['c'], pil, bull): out['R'] = i; break
            if touch and not side(b['c'], pil, bull): out['broke'] = i; break
    return out


# ── The story ───────────────────────────────────────────────────────────────
def build(seed, rhythm, bull=True):
    rnd = random.Random(seed)
    # 4H: rally to a swing high (the 4H PIL), pull back, indication through it, now correcting.
    h4 = [bar(20900, 20918, vol=10)]
    leg(h4, 20990, 6, rnd, 22, counter=1)
    leg(h4, 20955, 3, rnd, 22, counter=0)
    leg(h4, 21080, 6, rnd, 22, counter=1)          # swing high = 4H PIL
    pil4_at = len(h4) - 1
    h4[pil4_at]['h'] = q(h4[pil4_at]['c'] + 9)
    leg(h4, 21000, 5, rnd, 22, counter=1)
    leg(h4, 21165, 6, rnd, 22, counter=0)          # HTF indication: closes above the 4H PIL
    leg(h4, 21070, 5, rnd, 22, counter=1)          # correction, back toward the 4H PIL
    pil4 = max(b['h'] for b in h4[:pil4_at + 1])
    pil4_at = max(range(pil4_at + 1), key=lambda i: h4[i]['h'])
    minor4 = max(range(2, 8), key=lambda i: h4[i]['h'])          # an earlier, smaller high
    top4 = max(range(len(h4)), key=lambda i: h4[i]['h'])         # the indication high
    # 1H: inside the 4H correction, price falls into a 1H level, reacts twice, holds.
    h1 = [bar(21150, 21142, vol=6)]
    leg(h1, 21110, 6, rnd, 10, counter=1)
    leg(h1, 21125, 3, rnd, 10)
    leg(h1, 21062, 8, rnd, 10, counter=1)          # first touch of the 1H level
    lvl_at = len(h1) - 1
    h1[lvl_at]['l'] = q(21056)
    leg(h1, 21094, 5, rnd, 10, counter=1)
    leg(h1, 21061, 5, rnd, 10, counter=0)          # second reaction at the same level
    h1[-1]['l'] = q(21057)
    leg(h1, 21078, 3, rnd, 10)
    lvl1 = h1[lvl_at]['l']
    mid1 = max(range(lvl_at + 1, lvl_at + 6), key=lambda i: h1[i]['h'])   # the bounce high (not the level)
    hi1 = max(range(0, 6), key=lambda i: h1[i]['h'])
    # 1M: pullback from a 1M swing high (the PIL), then I · C · C, then the retest.
    m = [bar(21073, 21070, vol=1.5)]
    leg(m, 21081, 5, rnd, 2.2, counter=1, wick=0.25)  # up into the 1M swing high
    sw = len(m) - 1
    m[sw]['h'] = q(m[sw]['c'] + 1.25)
    pil = m[sw]['h']
    leg(m, 21072, 5, rnd, 2.2, counter=1, wick=0.25)  # pullback below the PIL
    leg(m, pil - 1.5, 3, rnd, 2.2, counter=0, wick=0.2)
    start = len(m)
    o = m[-1]['c']
    if rhythm == 'tight':
        m += [bar(o, pil + 3, hi=pil + 3.75, lo=o - .5),                 # I: closes above
              bar(pil + 3, pil - 1.75, hi=pil + 3.5, lo=pil - 2.25),     # C: closes back below
              bar(pil - 1.75, pil + 4, hi=pil + 4.5, lo=pil - 2)]        # C: closes back above
    else:
        m += [bar(o, pil + 2.5, hi=pil + 3.25, lo=o - .5)]               # I
        leg(m, pil + 5.5, 2, rnd, 1.6, wick=0.2)
        leg(m, pil + 1.25, 2, rnd, 1.6, wick=0.2)                        # drifts back, stays above
        m += [bar(m[-1]['c'], pil - 2, hi=m[-1]['c'] + .5, lo=pil - 2.5)]  # C
        leg(m, pil - 4, 2, rnd, 1.6, wick=0.2)
        leg(m, pil - 1, 2, rnd, 1.6, wick=0.2)                           # back up, still below
        m += [bar(m[-1]['c'], pil + 3, hi=pil + 3.5, lo=m[-1]['c'] - .5)]  # C
    leg(m, pil + 8, 3, rnd, 1.8, wick=0.2)
    leg(m, pil + 1.5, 3, rnd, 1.8, wick=0.15)
    m += [bar(pil + 1.5, pil + 3.5, hi=pil + 4, lo=pil - .25)]           # first retest: touches, holds
    leg(m, pil + 12, 5, rnd, 2, wick=0.2)
    pre_hi = max(range(1, sw), key=lambda i: m[i]['h'])
    if not bull:
        h4, h1, m = mirror(h4, 21000), mirror(h1, 21000), mirror(m, 21000)
        pil4, lvl1, pil = q(42000 - pil4), q(42000 - lvl1), q(42000 - pil)
    icc = derive_icc(m, pil, start, bull)
    return {
        'dir': 'bullish' if bull else 'bearish', 'rhythm': rhythm,
        'tfs': {
            '4H': {'bars': h4, 'pil': pil4, 'pilAt': pil4_at, 'candidates': [pil4_at, minor4, top4]},
            '1H': {'bars': h1, 'level': lvl1, 'levelAt': lvl_at, 'candidates': [lvl_at, mid1, hi1]},
            '1M': {'bars': m, 'pil': pil, 'pilAt': sw, 'candidates': [sw, pre_hi], 'start': start, 'icc': icc},
        },
    }


def check(sc):
    tf = sc['tfs']; bull = sc['dir'] == 'bullish'
    icc = tf['1M']['icc']
    assert all(k in icc for k in ('I', 'C', 'C2', 'R')), f'incomplete ICC {icc}'
    assert 'broke' not in icc
    if sc['rhythm'] == 'tight':
        assert icc['C'] == icc['I'] + 1 and icc['C2'] == icc['C'] + 1, f'tight rhythm broken {icc}'
    else:
        assert icc['C'] - icc['I'] >= 3 and icc['C2'] - icc['C'] >= 3, f'spread rhythm too tight {icc}'
    m = tf['1M']['bars']; pil = tf['1M']['pil']
    # Nothing before the start may have closed through the PIL.
    assert not any(side(b['c'], pil, bull) for b in m[tf['1M']['pilAt'] + 1:tf['1M']['start']]), 'early close through PIL'
    # The 4H indication really closed through the 4H PIL after it formed.
    h4 = tf['4H']['bars']; p4 = tf['4H']['pil']
    assert any(side(b['c'], p4, bull) for b in h4[tf['4H']['pilAt'] + 1:]), 'no 4H indication'
    assert len(set(tf['4H']['candidates'])) == 3 and len(set(tf['1H']['candidates'])) == 3
    return True


SPECS = [('bull-tight', 11, 'tight', True), ('bull-spread', 23, 'spread', True), ('bear-tight', 37, 'tight', False), ('bear-spread', 41, 'spread', False)]
out = {}
for name, seed, rhythm, bull in SPECS:
    for s in range(seed, seed + 500):
        try:
            sc = build(s, rhythm, bull); check(sc); break
        except AssertionError as e:
            last = e
    else:
        raise SystemExit(f'{name}: no valid seed ({last})')
    out[name] = sc
    i = sc['tfs']['1M']['icc']
    print(f"{name:12} seed {s}  4H PIL {sc['tfs']['4H']['pil']}  1H level {sc['tfs']['1H']['level']}  1M PIL {sc['tfs']['1M']['pil']}  I {i['I']} C {i['C']} C {i['C2']} retest {i['R']}  bars 4H {len(sc['tfs']['4H']['bars'])} 1H {len(sc['tfs']['1H']['bars'])} 1M {len(sc['tfs']['1M']['bars'])}")

path = os.path.join(os.path.dirname(__file__), '..', 'shared', 'icc-walk-scenarios.js')
with open(path, 'w') as f:
    f.write('/* icc-walk-scenarios.js — GENERATED by tools/build-icc-walks.py. Do not edit by hand.\n * Multi-timeframe charts for the Phase 5 ICC walk-through; every answer is derived from the bars and checked.\n */\n')
    f.write('export const ICC_WALKS = ' + json.dumps(out) + ';\n')
print('wrote shared/icc-walk-scenarios.js')
