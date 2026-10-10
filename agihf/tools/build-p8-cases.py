"""
Builds the charts for the Phase 8 case files (Lessons 1-10 and the Section 21
game), so every case is its own day: its own direction, price, 4H room, 1H
map, 15M pullback and 1M sequence. The lesson text and steps stay as written;
only the chart, the levels and the answers that come from the chart change.

    python3 tools/build-p8-cases.py

Every chart is built "long side up" in points relative to its PIL and mirrored
for shorts. The timeframes agree with each other: the 4H's last 14 candles are
the 1H, and the 1H's last 9 candles are the 15M. The build fails if a chart
doesn't show what its case says, using the Phase 5 ICC rules:
  Indication   = first close through the PIL
  Correction   = the next close back past the PIL
  Continuation = the next close through the PIL again (and beyond the Indication's extreme)
  Retest       = the first later candle to touch the PIL and close on the trade's side
Trade outcomes (target or stop first) are checked against the candles too.
"""
import json, math, os, random, re

ROOT = os.path.join(os.path.dirname(__file__), '..')
TICK = 0.25
q = lambda p: round(p / TICK) * TICK
PT = 2.0  # MNQ: $2 a point per contract


def need(cond, msg):
    if not cond: raise SystemExit(f'build-p8-cases: {msg}')


# ── candles ──────────────────────────────────────────────────────────────

def path(points, n, rng, amp):
    """Closes through the waypoints [(i, v)], with smooth noise that is zero at each waypoint."""
    points = sorted(points)
    out = [0.0] * n
    for (i0, v0), (i1, v1) in zip(points, points[1:]):
        e = 0.0
        for i in range(i0, i1 + 1):
            t = (i - i0) / max(1, i1 - i0)
            e = 0.55 * e + rng.gauss(0, amp)
            out[i] = v0 + (v1 - v0) * t + e * math.sin(math.pi * t)
    return [q(v) for v in out]


def candles(closes, o0, rng, wick):
    bars, o = [], o0
    for c in closes:
        h = max(o, c) + abs(rng.gauss(0, wick * 0.45)) + rng.random() * wick * 0.3
        l = min(o, c) - abs(rng.gauss(0, wick * 0.45)) - rng.random() * wick * 0.3
        bars.append({'o': q(o), 'h': q(h), 'l': q(l), 'c': q(c)})
        o = c
    return bars


def fix(b):
    b['h'] = q(max(b['h'], b['o'], b['c'])); b['l'] = q(min(b['l'], b['o'], b['c']))
    return b


def setc(bars, i, c, h=None, l=None):
    """Set candle i's close (and the next open), optionally its high/low."""
    bars[i]['c'] = q(c)
    if i + 1 < len(bars): bars[i + 1]['o'] = q(c)
    if h is not None: bars[i]['h'] = q(h)
    if l is not None: bars[i]['l'] = q(l)
    fix(bars[i])
    if i + 1 < len(bars): fix(bars[i + 1])


def cap_h(b, top):
    if b['h'] > top:
        b['h'] = q(max(top, b['o'], b['c']))


def floor_l(b, bot):
    if b['l'] < bot:
        b['l'] = q(min(bot, b['o'], b['c']))


def agg(bars, k):
    return [{'o': g[0]['o'], 'h': max(x['h'] for x in g), 'l': min(x['l'] for x in g), 'c': g[-1]['c']}
            for g in (bars[i:i + k] for i in range(0, len(bars), k))]


def mirror(bars, P, short):
    s = -1 if short else 1
    out = []
    for b in bars:
        if short: out.append({'o': q(P - b['o']), 'h': q(P - b['l']), 'l': q(P - b['h']), 'c': q(P - b['c'])})
        else: out.append({k: q(P + b[k]) for k in 'ohlc'})
    return out


# ── the ICC check (long side up, relative to the PIL at 0) ─────────────────

def icc(m1):
    s = {'I': None, 'C': None, 'C2': None, 'R': None}
    for i in range(1, len(m1)):
        b = m1[i]
        if s['I'] is None:
            if b['c'] > 0 and not m1[i - 1]['c'] > 0: s['I'] = i
        elif s['C'] is None:
            if b['c'] < 0: s['C'] = i
        elif s['C2'] is None:
            if b['c'] > 0: s['C2'] = i
        elif s['R'] is None:
            if b['l'] <= 2 and b['c'] > 0: s['R'] = i
    return s


def first_hit(m1, frm, stop, target):
    for i in range(frm + 1, len(m1)):
        b = m1[i]
        hs, ht = b['l'] <= stop, b['h'] >= target
        if hs and ht: return 'both', i
        if hs: return 'stop', i
        if ht: return 'target', i
    return None, None


# ── one day ────────────────────────────────────────────────────────────────

def build_1h(rng, sp):
    """47 generated 1H candles: a lower-high decline into the swing low, a shift above the MSS,
    a push up to the swing high (the PIL, at 0) and the start of the pullback."""
    S0 = sp.get('s0', rng.uniform(170, 280))
    if sp.get('range'):
        # overlapping swings: highs near 0, lows near the same floor, no clean map
        lo = -rng.uniform(95, 135)
        pts, i, up = [(0, S0)], 0, False
        nxt = [(rng.randint(5, 7), lo + rng.uniform(-6, 8))]
        i = nxt[0][0]
        pts += nxt
        while i < 40:
            i += rng.randint(4, 6)
            pts.append((min(i, 40), (-rng.uniform(4, 14)) if not up else lo + rng.uniform(-8, 10)))
            up = not up
        pts = [p for p in pts if p[0] <= 40]
        if pts[-1][0] != 40: pts.append((40, -rng.uniform(4, 12)))
        h = 40 + rng.randint(1, 3)
        pts += [(h, -rng.uniform(6, 12)), (46, -rng.uniform(16, 28))]
        closes = path(pts, 47, rng, 5)
        bars = candles(closes, S0 - rng.uniform(5, 15), rng, 9)
        bars[h]['h'] = 0.0; fix(bars[h])
        for j in range(8, 47):
            if j != h: cap_h(bars[j], -rng.uniform(1, 6))
        sl_i = min(range(5, 47), key=lambda j: bars[j]['l'])
        mss_i = max(range(sl_i + 1, h), key=lambda j: bars[j]['h']) if h - sl_i > 2 else sl_i + 1
        return bars, {'h': h, 's': sl_i, 'm': mss_i}
    MSS = -rng.uniform(45, 90)
    m = rng.randint(15, 25)                      # the MSS pivot: the last lower high
    s = m + rng.randint(3, 8)                    # the swing low
    legs = rng.choice([1, 2, 2, 3])              # lower highs before the MSS
    SL = -rng.uniform(190, 290)
    pts = [(0, S0)]
    hi_prev, lo_prev = S0, None
    for k in range(legs):
        lo_i = round(m * (2 * k + 1) / (2 * legs + 1)); hi_i = round(m * (2 * k + 2) / (2 * legs + 1))
        lo_v = (hi_prev - rng.uniform(55, 110)) if lo_prev is None else min(lo_prev - rng.uniform(15, 45), hi_prev - 50)
        hi_v = min(lo_v + rng.uniform(35, 75), hi_prev - 20)
        if k == legs - 1: hi_v = max(hi_v, MSS + 20)
        pts += [(lo_i, lo_v), (hi_i, hi_v)] if hi_i < m - 1 else [(lo_i, lo_v)]
        hi_prev, lo_prev = hi_v, lo_v
    low2 = min(lo_prev, MSS - 30)
    if pts[-1][0] >= m - 1: pts = pts[:-1]
    pts = [(i_, v) for i_, v in pts if i_ < m - 4]
    pts += [(m - 3, MSS - rng.uniform(26, 40)), (m - 2, MSS - rng.uniform(18, 32)), (m - 1, MSS - rng.uniform(10, 22)), (m, MSS - rng.uniform(6, 14))]
    SL = min(SL, low2 - rng.uniform(30, 60), MSS - 100)
    style = rng.choice(['direct', 'pause', 'pause', 'double'])
    br = s + rng.randint(2, 4)
    pts += [(s, SL + rng.uniform(4, 12))]
    if style == 'double':                        # a second test of the low before the shift
        pts += [(s + 2, SL + rng.uniform(35, 60)), (s + 4, SL + rng.uniform(8, 20))]; br = s + 4 + rng.randint(2, 3)
    pts += [(br, MSS + rng.uniform(6, 18))]
    if style == 'pause':                         # holds above the MSS for a while
        pk = br + rng.randint(4, 7)
        pts += [(br + 2, MSS + rng.uniform(15, 35)), (pk, MSS + rng.uniform(4, 16))]
        br2 = pk
    else:
        br2 = br
    h = min(44, br2 + rng.randint(4, 9))
    pts += [(h - 1, -rng.uniform(6, 16)), (h, -rng.uniform(6, 14)), (46, -rng.uniform(15, 45))]
    k3 = 1
    need(len(set(i_ for i_, _ in pts)) == len(pts) and h > br2 + 1, '1H waypoints overlap')
    closes = path(pts, 47, rng, 8)
    bars = candles(closes, S0 - rng.uniform(5, 15), rng, rng.uniform(10, 15))
    if bars[m]['o'] > MSS - 3: setc(bars, m - 1, MSS - rng.uniform(4, 9))
    if bars[m]['c'] > MSS - 3: setc(bars, m, MSS - rng.uniform(4, 9))
    bars[m]['h'] = q(MSS); fix(bars[m])
    for j in (m - 2, m - 1):
        if max(bars[j]['o'], bars[j]['c']) > MSS - 2: need(False, '1H: the MSS neighbours sit too high')
        cap_h(bars[j], MSS - rng.uniform(2, 8))
    for j in range(m + 1, s + 1):
        if bars[j]['c'] > MSS - 3: setc(bars, j, MSS - rng.uniform(4, 10))
    for j in range(m + 1, s + 1): cap_h(bars[j], min(bars[j - 1]['h'] - 0.5, MSS - 2))
    bars[s]['l'] = q(SL); fix(bars[s])
    for j in range(m, 47):
        if j != s: floor_l(bars[j], SL + rng.uniform(3, 10))
    bars[h]['h'] = 0.0; fix(bars[h])
    for j in range(s, 47):
        if j != h: cap_h(bars[j], -rng.uniform(1, 6))
    need(any(bars[j]['c'] > MSS for j in range(s + 1, h)), 'the 1H must close above the MSS before the swing high')
    need(bars[m]['h'] == q(MSS) and all(bars[j]['h'] < MSS for j in range(m + 1, s + 1)) and all(bars[j]['h'] < MSS for j in (m - 1, m - 2)), '1H: the MSS must be the last lower high')
    need(bars[h]['h'] == 0 and all(bars[j]['h'] < 0 for j in range(s, 47) if j != h), '1H: the swing high must be the top since the low')
    need(all(bars[j]['l'] > bars[s]['l'] for j in range(m, 47) if j != s), '1H: the swing low must be the low')
    return bars, {'h': h, 's': s, 'm': m}


def build_15m(rng, o0, sp_shape=None):
    """36 candles: the pullback from the 1H swing high, a low, a bounce, a higher low, rising into the open."""
    shape = sp_shape or rng.choice(['v', 'stairs', 'flush', 'sweep'])
    L1 = -rng.uniform(75, 125); o1 = o0 - rng.uniform(2, 6)
    if shape == 'v':
        j1 = rng.randint(13, 19); j2 = j1 + rng.randint(4, 6); j3 = j2 + rng.randint(4, 6)
        pts = [(0, o1), (j1, L1 + 3), (j2, L1 + rng.uniform(22, 38)), (j3, L1 + rng.uniform(9, 20))]
    elif shape == 'stairs':                     # lower highs stepping down, the low late
        j1 = rng.randint(22, 26); j3 = j1 + rng.randint(4, 6)
        st = [(round(j1 * f), o1 + (L1 - o1) * g) for f, g in ((0.25, 0.35), (0.38, 0.22), (0.6, 0.7), (0.72, 0.55))]
        pts = [(0, o1)] + st + [(j1, L1 + 3), (j1 + 2, L1 + rng.uniform(18, 30)), (j3, L1 + rng.uniform(8, 16))]
    elif shape == 'flush':                      # a fast drop, a long base, a higher low late
        j1 = rng.randint(6, 10); j3 = rng.randint(26, 30)
        pts = [(0, o1), (j1, L1 + 3), (j1 + 4, L1 + rng.uniform(20, 32)), (j1 + 9, L1 + rng.uniform(8, 18)),
               (j1 + 14, L1 + rng.uniform(18, 30)), (j3, L1 + rng.uniform(10, 18))]
    elif shape == 'band':                       # rotating inside one band: nothing resolves
        mid = o1 - rng.uniform(35, 55); w = rng.uniform(10, 16); L1 = mid - w - 3
        j1 = rng.randint(12, 20); j3 = 30
        pts = [(0, o1), (4, mid + w), (j1, L1 + 3)] + [(k, mid + (w if (k // 4) % 2 else -w) * rng.uniform(0.6, 0.95)) for k in range(8, 34, 4) if abs(k - j1) > 1]
        pts += [(j3, mid - w * 0.5)]
        pts = sorted(dict(pts).items())
        pts.append((35, mid + rng.uniform(-4, 4)))
        closes = path(pts, 36, rng, 3)
        bars = candles(closes, o0, rng, rng.uniform(5, 8))
        bars[j1]['l'] = q(L1); fix(bars[j1])
        for j in range(36):
            if j != j1: floor_l(bars[j], L1 + rng.uniform(1.5, 4))
            cap_h(bars[j], -2)
        return bars, {'low': j1, 'hl': j3, 'shape': shape}
    else:                                       # a slow drift, a sweep of the low, a sharp reclaim
        j1 = rng.randint(18, 23); j3 = j1 + rng.randint(5, 8)
        pts = [(0, o1), (j1 - 3, L1 + rng.uniform(10, 16)), (j1 - 1, L1 + rng.uniform(12, 18)), (j1, L1 + 4),
               (j1 + 2, L1 + rng.uniform(22, 34)), (j3, L1 + rng.uniform(12, 20))]
    L2 = pts[-1][1]
    pts.append((35, L2 + rng.uniform(10, 24)))
    pts = sorted(dict(pts).items())
    closes = path(pts, 36, rng, 4.5)
    bars = candles(closes, o0, rng, rng.uniform(5, 8))
    bars[j1]['l'] = q(L1); fix(bars[j1])
    for j in range(36):
        if j != j1: floor_l(bars[j], L1 + rng.uniform(1.5, 4))
        cap_h(bars[j], -2)
    return bars, {'low': j1, 'hl': j3, 'shape': shape}


def build_4h(rng, o_end, W, EL, short):
    """26 candles before the 1H window: the external high, the external low, then higher lows."""
    EH = EL + W
    shape = rng.choice(['top-first', 'low-first', 'range'])
    A0 = EH - rng.uniform(0.25, 0.4) * W
    if shape == 'top-first':                    # the high, a long drop to the low, then higher lows
        e1 = rng.randint(3, 8); e2 = e1 + rng.randint(8, 11)
        e3 = e2 + rng.randint(3, 4); e4 = min(24, e3 + rng.randint(2, 3))
        pts = [(0, A0), (e1, EH - rng.uniform(15, 40)), (e2, EL + rng.uniform(15, 35)),
               (e3, EL + rng.uniform(0.45, 0.6) * W), (e4, EL + rng.uniform(0.22, 0.34) * W), (25, o_end)]
    elif shape == 'low-first':                  # the low early, a rally to the high, a higher low
        A0 = EL + rng.uniform(0.35, 0.55) * W
        e2 = rng.randint(3, 6); e1 = e2 + rng.randint(8, 11); e4 = min(23, e1 + rng.randint(4, 6))
        pts = [(0, A0), (e2, EL + rng.uniform(15, 35)), (e2 + 4, EL + rng.uniform(0.35, 0.5) * W), (e2 + 6, EL + rng.uniform(0.2, 0.32) * W),
               (e1, EH - rng.uniform(15, 40)), (e4, EL + rng.uniform(0.25, 0.38) * W), (25, o_end)]
    else:                                       # a range: high and low tested twice, the last low higher
        e1 = rng.randint(2, 4); e2 = e1 + rng.randint(5, 7); e5 = e2 + rng.randint(5, 6); e6 = e5 + rng.randint(4, 5)
        pts = [(0, A0), (e1, EH - rng.uniform(15, 40)), (e2, EL + rng.uniform(15, 35)), (e5, EH - rng.uniform(40, 80)),
               (min(e6, 23), EL + rng.uniform(0.12, 0.22) * W), (25, o_end)]
    closes = path(pts, 26, rng, 11)
    bars = candles(closes, A0 + rng.uniform(-20, 20), rng, rng.uniform(13, 20))
    bars[e1]['h'] = q(EH); fix(bars[e1])
    bars[e2]['l'] = q(EL); fix(bars[e2])
    for j in range(26):
        if j != e1: cap_h(bars[j], EH - rng.uniform(4, 20))
        if j != e2: floor_l(bars[j], EL + rng.uniform(4, 20))
    return bars


def build_m1(rng, sp, o0):
    """The session: approach, first touch of the PIL, a higher low, then I-C-C and the retest."""
    kind = sp.get('kind', 'full')
    t = rng.randint(11, 20)                    # first touch of the PIL
    hl = t + rng.randint(3, 7)
    i = hl + rng.randint(3, 6) + (6 if kind == 'messy' else 0)
    c = i + rng.randint(1, 2)
    e = c + 1 if kind == 'early' else None     # the candle the early trader buys
    gap = 2 if kind == 'messy' else rng.choice([0, 0, 1])
    c2 = (e if e else c) + 1 + gap
    r = c2 + rng.randint(3, 6)
    R = r + rng.randint(3, 6)
    HL = -rng.uniform(14, 30)
    Ic = rng.uniform(3.5, 8); Ih = Ic + rng.uniform(0.75, 2.5)
    Cc = -rng.uniform(1.5, 5); Cl = Cc - rng.uniform(1, 4)
    RT = Ih + (rng.uniform(7, 11) if kind == 'noretest' else rng.uniform(9, 18))
    if kind == 'wrongpil': RT = rng.uniform(9, 12)
    approach = rng.choice(['ramp', 'dip', 'stall', 'chop'])
    st = [(0, o0 + rng.uniform(-3, 3))]
    if approach == 'dip':                       # the open sells off first, then turns
        k = rng.randint(3, min(6, t - 4)); st.append((k, o0 - rng.uniform(8, 18)))
    elif approach == 'stall':                   # pushes up, stalls, then goes
        k1 = rng.randint(4, t - 5); st += [(k1, o0 * rng.uniform(0.35, 0.55)), (k1 + 2, o0 * rng.uniform(0.55, 0.75))]
    elif approach == 'chop':                    # sideways at the open before the move
        k1 = rng.randint(5, t - 4); st += [(2, o0 + rng.uniform(4, 9)), (4, o0 - rng.uniform(1, 5)), (k1, o0 + rng.uniform(3, 10))]
    pts = st + [(t - 1, -rng.uniform(6, 12)), (t, -rng.uniform(4, 9)), (hl, HL),
           (i - 1, -rng.uniform(3, 8)), (i, Ic), (c, Cc), (c2, Ih + rng.uniform(1.5, 5)), (r, RT),
           (R, rng.uniform(2, 5.5))]
    if e: pts.append((e, -rng.uniform(0.5, 2.5)))
    if kind == 'noretest':
        pts = [p for p in pts if p[0] <= r]
    N0 = max(p[0] for p in pts) + 1
    closes = path(sorted(dict(pts).items()), N0, rng, 1.6)
    bars = candles(closes, o0, rng, rng.uniform(1.9, 3.3))
    # before the indication: every close below; only the touch candle reaches the PIL
    for j in range(i):
        if bars[j]['c'] >= 0: setc(bars, j, -rng.uniform(1, 4))
        cap_h(bars[j], -rng.uniform(1.5, 4) if j < t else -rng.uniform(0.75, 3))
    bars[t]['h'] = 0.0; fix(bars[t])
    if kind == 'messy':
        w1 = hl + 2; w2 = w1 + rng.randint(2, 3)
        need(w2 < i - 1, 'messy wicks must come before the indication')
        for w in (w1, w2):
            bars[w]['h'] = q(rng.uniform(3.5, 6.5)); setc(bars, w, -rng.uniform(3, 6))
        sp['_wicks'] = [w1, w2]
    bars[hl]['l'] = q(HL - rng.uniform(1, 3)); fix(bars[hl])
    for j in range(t + 1, i):
        if j != hl: floor_l(bars[j], bars[hl]['l'] + rng.uniform(0.5, 3))
    # Indication
    setc(bars, i, Ic, h=Ih); floor_l(bars[i], bars[i]['o'] - 0.5)
    for j in range(i + 1, c):
        setc(bars, j, rng.uniform(0.75, min(Ic, Ih - 1))); cap_h(bars[j], Ih - 0.5); floor_l(bars[j], 0.25)
    # Correction
    setc(bars, c, Cc, l=Cl); cap_h(bars[c], Ih - 0.5)
    if e:
        setc(bars, e, -rng.uniform(0.5, 2.5), h=rng.uniform(3, 5.5)); floor_l(bars[e], Cl + rng.uniform(0.75, 2))
    for j in range(c + 1, c2):
        if j == e: continue
        setc(bars, j, -rng.uniform(1, 4.5)); floor_l(bars[j], Cl + rng.uniform(0.5, 2)); cap_h(bars[j], rng.uniform(1, 3) if kind == 'messy' else -0.5)
    corr = min(bars[j]['l'] for j in range(c, c2))
    # Continuation: closes through again, beyond the Indication's extreme
    C2c = max(bars[c2]['c'], Ih + rng.uniform(1.5, 5))
    setc(bars, c2, C2c); floor_l(bars[c2], corr + 0.5)
    # the run, then the retest
    for j in range(c2 + 1, len(bars)):
        if kind != 'noretest' and j >= R: break
        floor_l(bars[j], rng.uniform(3.25, 6))
        if bars[j]['c'] < 4: setc(bars, j, rng.uniform(4, 7))
    if kind != 'noretest':
        setc(bars, R, rng.uniform(2, 5.5), l=rng.uniform(-0.75, 1))
        cap_h(bars[R], bars[R]['o'] + 0.5)
    run = max(range(c2, (R if kind != 'noretest' else len(bars))), key=lambda j: bars[j]['h'])
    return bars, {'pilBar': t, 'hl': hl, 'indication': i, 'correction': c, 'early': e, 'continuation': c2,
                  'runTop': run, 'retest': None if kind == 'noretest' else R, 'corr': corr, 'Ih': Ih}


def future(rng, bars, frm, stop, target, ending, n_after):
    """Candles after `frm` that end the trade the way the case says: 'target', 'stop' or 'chop'."""
    last = bars[frm]['c']; risk = last - stop
    for _ in range(400):
        L = rng.randint(9, 15)
        if ending == 'target':
            pts = [(0, last), (L // 2, last + risk * rng.uniform(0.5, 1.0)), (L // 2 + 2, last + risk * rng.uniform(0.15, 0.5)), (L, target - rng.uniform(0.5, 2.5))]
        elif ending == 'stop':
            pts = [(0, last), (L // 3, last + risk * rng.uniform(0.2, 0.7)), (L - 1, stop + rng.uniform(1, 3)), (L, stop + rng.uniform(0.5, 2))]
        else:
            L = n_after
            pts = [(0, last)] + [(k, last + risk * rng.uniform(-0.55, 0.85)) for k in range(3, L, 3)] + [(L, last + risk * rng.uniform(-0.3, 0.3))]
        closes = path(pts, L + 1, rng, 1.4)[1:]
        nb = candles(closes, last, rng, 2.4)
        if ending == 'target': nb[-1]['h'] = q(target + rng.uniform(0.25, 2)); fix(nb[-1])
        if ending == 'stop': nb[-1]['l'] = q(stop - rng.uniform(0.25, 2)); fix(nb[-1])
        extra = n_after - len(nb) if ending != 'chop' else 0
        if extra > 0:
            base = nb[-1]['c']
            tail = candles(path([(0, base), (extra, base + (risk if ending == 'target' else -risk) * rng.uniform(-0.3, 0.5))], extra + 1, rng, 1.5)[1:], base, rng, 2.4)
            nb += tail
        trial = bars[:frm + 1] + nb
        got, at = first_hit(trial, frm, stop, target)
        want = None if ending == 'chop' else ending
        if got == want and (want is None or at == frm + L):
            return nb, (None if want is None else frm + L)
    raise SystemExit(f'build-p8-cases: could not draw a {ending} ending')


def day(seed, sp):
    rng = random.Random(seed)
    short = sp['dir'] == 'short'
    P = q(sp.get('pil', rng.uniform(19650, 21950)))
    h1, h1i = build_1h(rng, sp)
    m15, m15i = build_15m(rng, h1[-1]['c'], sp.get('m15'))
    h1 = h1 + agg(m15, 4)[:9]
    # the 15M's 36 candles are 9 hours: they are the 1H's last 9 candles
    T = q(rng.uniform(14, 20)) if sp.get('kind') == 'wrongpil' else 0
    m1, mk = build_m1(rng, sp, m15[-1]['c'] + T)
    kind = sp.get('kind', 'full')
    # risk and the trade
    corr = mk['corr']
    if kind == 'noretest':
        entry = q(rng.uniform(3, 5))       # the planned retest level that never came
        dec = mk['runTop']
    else:
        entry = m1[mk['retest']]['c']
        dec = mk['early'] if kind == 'early' else mk['retest']
    stop = q(corr - rng.uniform(1.25, 3))
    risk = entry - stop
    rr = sp.get('rr', 2.0)
    target = q(entry + rr * risk)
    ending = sp.get('ending', 'target')
    n_after = sp.get('after', rng.randint(4, 8))
    variants = []
    if kind == 'noretest':
        fb, hit = future(rng, m1, len(m1) - 1, stop, target, 'target', n_after)
        m1 = m1 + fb
        dec = mk['runTop']
    else:
        frm = mk['retest']
        base = m1[:frm + 1]
        if sp.get('variants'):
            for lab, end, out in sp['variants']:
                nb, hh = future(rng, base, frm, stop, target, end, rng.randint(14, 20) if end == 'chop' else rng.randint(3, 6))
                variants.append((lab, end, out, nb, hh))
            m1 = base + variants[0][3]; hit = variants[0][4]
        elif kind == 'wrongpil':
            # up into the real level, rejected there without a close through, then down through the stop
            for _ in range(400):
                k = rng.randint(3, 6); L = k + rng.randint(5, 9)
                pts = [(0, base[-1]['c']), (k, T - rng.uniform(2, 5)), (k + 2, T - rng.uniform(8, 12)), (L, stop + rng.uniform(0.5, 2))]
                nb = candles(path(pts, L + 1, rng, 1.2)[1:], base[-1]['c'], rng, 2.2)
                nb[k - 1]['h'] = q(T + rng.uniform(-0.5, 0.75)); fix(nb[k - 1])
                nb[-1]['l'] = q(stop - rng.uniform(0.25, 2)); fix(nb[-1])
                nb += candles(path([(0, nb[-1]['c']), (n_after, nb[-1]['c'] - rng.uniform(2, 8))], n_after + 1, rng, 1.5)[1:], nb[-1]['c'], rng, 2.4)
                got, at = first_hit(base + nb, frm, stop, target)
                if got == 'stop' and at == frm + L and all(b['c'] < T - 0.5 for b in nb): break
            else:
                raise SystemExit('build-p8-cases: could not draw the wrong-PIL ending')
            m1 = base + nb; hit = frm + L
        else:
            nb, hit = future(rng, base, frm, stop, target, ending, n_after)
            m1 = base + nb
    s = icc(m1)
    if kind == 'early':
        need(s['I'] == mk['indication'] and s['C'] == mk['correction'] and s['C2'] == mk['continuation'], f'{sp["key"]} icc {s} vs {mk}')
    elif kind == 'noretest':
        need(s['I'] == mk['indication'] and s['C'] == mk['correction'] and s['C2'] == mk['continuation'], f'{sp["key"]} icc {s} vs {mk}')
        need(all(b['l'] > 2 for b in m1[mk['continuation'] + 1:dec + 1]), f'{sp["key"]}: no retest before the decision')
    else:
        need(s == {'I': mk['indication'], 'C': mk['correction'], 'C2': mk['continuation'], 'R': mk['retest']}, f'{sp["key"]} icc {s} vs {mk}')
    need(m1[mk['continuation']]['c'] > mk['Ih'], f'{sp["key"]}: continuation must close beyond the indication')
    if T:
        need(target > T + 3 and all(b['c'] < T - 0.5 for b in m1), f'{sp["key"]}: price must never close through the real PIL')
        sh = lambda b: {k: q(b[k] - T) for k in 'ohlc'}
        m1 = [sh(b) for b in m1]
        entry, stop, target = q(entry - T), q(stop - T), q(target - T)
        mk = {**mk, 'corr': q(mk['corr'] - T), 'Ih': q(mk['Ih'] - T)}
    upto = dec if kind == 'noretest' else mk['retest']
    need(kind == 'wrongpil' or max(b['h'] for b in m1[:upto + 1]) < target - 2, f'{sp["key"]}: price must not reach the target before the entry')
    need(len(m1) <= 66, f'{sp["key"]}: m1 too long ({len(m1)})')
    # the 4H room
    cur = h1[-1]['c']
    W = sp.get('W', rng.uniform(640, 880))
    pct = sp.get('pct', rng.uniform(0.3, 0.46))
    EL = cur - pct * W
    if sp.get('ceiling'):
        EH = target + rng.uniform(16, 30); EL = EH - W
    h4 = build_4h(rng, h1[0]['o'], W if not sp.get('ceiling') else EH - EL, EL, short) + agg(h1, 4)
    EHv = max(b['h'] for b in h4); ELv = min(b['l'] for b in h4)
    need(EHv - EL >= W - 1 if not sp.get('ceiling') else EHv <= EH + 0.01, f'{sp["key"]}: 4H extremes')
    need(EHv > target + 12, f'{sp["key"]}: the 4H ceiling must sit above the target')
    if not sp.get('ceiling'):
        pl = (h4[-1]['c'] - ELv) / (EHv - ELv)
        need(0.28 <= pl <= 0.47, f'{sp["key"]}: the 4H location should be the lower-middle of the room ({pl:.2f})')
    return dict(P=P, short=short, rng=rng, h4=h4, h1=h1, h1i=h1i, m15=m15, m1=m1, mk=mk, entry=entry, stop=stop, target=target,
                risk=risk, rr=rr, hit=hit, dec=dec, variants=variants, ending=ending, kind=kind, n=len(m1), T=T)


# ── write a case ───────────────────────────────────────────────────────────

LONG_TXT = {
    'thesis': 'Dayli reads this room as bullish: price rejected the range low and is building higher lows on the 4H.',
    'map': 'The 1H closed above the last lower high (MSS), then pulled back. The swing it pulled back from is the level to watch.',
    'obs': 'The 15M pulled back from the 1H level and is coming into the session from a higher low. That’s a correction, not a reversal.',
    'SWING_HIGH': 'The 1H swing high price pulled back from. This is the level the session is building toward.',
    'SWING_LOW': 'The 1H low that produced the shift.',
    'MSS': 'The last lower high before the low. Closing above it shifted the 1H structure.',
}
SHORT_TXT = {
    'thesis': 'Dayli reads this room as bearish: price rejected the range high and is building lower highs on the 4H.',
    'map': 'The 1H closed below the last higher low (MSS), then pulled back. The swing it pulled back from is the level to watch.',
    'obs': 'The 15M pulled back from the 1H level and is coming into the session from a lower high. That’s a correction, not a reversal.',
    'SWING_LOW': 'The 1H swing low price pulled back from. This is the level the session is building toward.',
    'SWING_HIGH': 'The 1H high that produced the shift.',
    'MSS': 'The last higher low before the high. Closing below it shifted the 1H structure.',
}
FMT = lambda p: f'{p:.2f}'


def apply(slide, sp, D):
    c = slide['case']
    P, short = D['P'], D['short']
    sg = -1 if short else 1
    A = lambda rel: q(P + sg * rel)
    c['dir'] = sp['dir']
    c['tf'] = {'4H': mirror(D['h4'], P, short), '1H': mirror(D['h1'], P, short), '15M': mirror(D['m15'], P, short)}
    c['m1'] = mirror(D['m1'], P, short)
    mk = D['mk']
    h4 = c['tf']['4H']; h1 = c['tf']['1H']
    EH = max(b['h'] for b in h4); EL = min(b['l'] for b in h4)
    hi = D['h1i']
    sh, sl, mss = A(D['h1'][hi['h']]['h']), A(D['h1'][hi['s']]['l']), A(D['h1'][hi['m']]['h'])
    entry, stop, target = A(D['entry']), A(D['stop']), A(D['target'])
    marks = {'pilBar': mk['pilBar'], 'hl': mk['hl'], 'indication': mk['indication'], 'correction': mk['correction'],
             'continuation': mk['continuation'], 'runTop': mk['runTop'], 'retest': mk['retest'], 'decision': D['dec'], 'hit': D['hit']}
    if D['kind'] == 'early': marks = {**marks, 'early': mk['early']}
    if D['kind'] == 'noretest': marks.pop('retest'); marks.pop('hit')
    if sp.get('_wicks'): marks['wicks'] = sp['_wicks']
    if D['kind'] == 'messy': marks.pop('hit', None)
    c['marks'] = marks
    c['levels'] = {'pil': P, 'entry': entry, 'stop': stop, 'target': target, 'risk': q(D['risk']),
                   'indHigh': A(mk['Ih']), 'corrLow': A(mk['corr']), 'externalHigh': EH, 'externalLow': EL, 'mss': mss}
    if D['T']:
        c['levels'] = {**c['levels'], 'pil': A(-D['T']), 'truePil': P}
        c['trader']['marks'] = [dict(m, **({'price': A(-D['T'])} if m['type'] == 'PIL' else {'price': entry, 'from': mk['retest']} if m['type'] == 'ENTRY'
                                           else {'index': {'INDICATION': mk['indication'], 'CORRECTION': mk['correction'], 'CONTINUATION': mk['continuation'], 'RETEST': mk['retest']}[m['type']]}))
                                for m in c['trader']['marks']]
    c['decisionIndex'] = D['dec']
    # expert marks: same types as before, recomputed from the candles
    T = SHORT_TXT if short else LONG_TXT
    idx = {'INDICATION': mk['indication'], 'CORRECTION': mk['correction'], 'CONTINUATION': mk['continuation'], 'RETEST': mk['retest']}
    if D['T']: idx = {k: None for k in idx}   # no sequence ever forms at the real PIL
    price = {'EXTERNAL_HIGH': EH, 'EXTERNAL_LOW': EL, 'PIL': P,
             'SWING_HIGH': sh if not short else sl, 'SWING_LOW': sl if not short else sh, 'MSS': mss}
    old = c['expert']['marks']
    types = [m['type'] for m in old]
    if short and 'SWING_HIGH' in types and 'SWING_LOW' in types:
        a, b = types.index('SWING_HIGH'), types.index('SWING_LOW')
        if a < b: old[a], old[b] = old[b], old[a]
    if not short and 'SWING_HIGH' in types and 'SWING_LOW' in types:
        a, b = types.index('SWING_HIGH'), types.index('SWING_LOW')
        if a > b: old[a], old[b] = old[b], old[a]
    new = []
    for m in old:
        m = dict(m)
        if m['type'] in idx:
            if idx[m['type']] is None: continue
            m['index'] = idx[m['type']]
        elif m['type'] in price: m['price'] = price[m['type']]
        if m['type'] in T: m['why'] = T[m['type']]
        new.append(m)
    c['expert']['marks'] = new
    # the indicator layer reads the same 1M marks, unless the case is about the indicator getting it wrong
    if c.get('indicator'):
        im = []
        if sp.get('indicatorLevel') is not None:
            lvl = sp['indicatorLevel']
            rel = [{k: b[k] - lvl for k in 'ohlc'} for b in D['m1']]
            s2 = icc(rel)
            ip = {'PIL': A(lvl), 'INDICATION': s2['I'], 'CORRECTION': s2['C'], 'CONTINUATION': s2['C2'], 'RETEST': s2['R']}
            need(ip['INDICATION'] is not None and (ip['INDICATION'], ip['CORRECTION']) != (mk['indication'], mk['correction']),
                 f'{sp["key"]}: the indicator should anchor differently: {s2}')
        else:
            ip = {'PIL': P, **idx}
        for m in c['indicator']['marks']:
            m = dict(m)
            v = ip.get(m['type'])
            if v is None: continue
            if m['type'] == 'PIL': m['price'] = v
            else: m['index'] = v
            im.append(m)
        c['indicator']['marks'] = im
    # risk text
    if c['expert'].get('risk'):
        c['expert']['risk'].update({'entry': entry, 'stop': stop, 'target': target})
        c['expert']['risk']['why'] = re.sub(r'\(\d+\.\d+\)', f'({FMT(stop)})', c['expert']['risk']['why'])
    # outcome
    out = dict(c['outcome'])
    contracts = sp.get('contracts', 1)
    if D['kind'] == 'messy':
        last = D['m1'][-1]['c']
        pts = q(last - D['entry'])
        out.update({'type': out['type'] if out.get('type') == 'CHOP' else 'OPEN_AT_CLOSE', 'r': round(pts / D['risk'], 2), 'hitIndex': None, 'points': pts, 'pnl': q(pts * PT)})
    elif sp.get('trader'):
        te = sp['_traderEntry']
        pts = q(D['target'] - te)
        out.update({'r': round(pts / (te - D['stop']), 2), 'hitIndex': D['hit'], 'points': pts, 'pnl': round(pts * PT * contracts, 2)})
    else:
        ending = D['ending']
        pts = q(D['target'] - D['entry']) if ending == 'target' else q(D['stop'] - D['entry'])
        r = round(D['rr'], 2) if ending == 'target' else -1.0
        out.update({'r': r, 'hitIndex': D['hit'], 'points': pts, 'pnl': q(pts * PT)})
        if 'hypothetical' in out: out['hypothetical'] = {**out['hypothetical'], 'r': r, 'hitIndex': D['hit'], 'points': pts, 'pnl': q(pts * PT)}
    c['outcome'] = out
    if D['variants']:
        slide['variants'] = [{'label': lab, 'future': mirror(nb, P, short),
                              'outcome': {**o, **({'hitIndex': hh} if hh is not None else {})}}
                             for lab, end, o, nb, hh in D['variants']]
    return c


def asks_update(steps, sp, D, c):
    short = D['short']
    T = SHORT_TXT if short else LONG_TXT
    h4 = c['tf']['4H']
    EH = max(b['h'] for b in h4); EL = min(b['l'] for b in h4)
    pct = (h4[-1]['c'] - EL) / (EH - EL)
    loc = 'discount' if pct < 0.4 else 'eq' if pct <= 0.6 else 'premium'
    alt = []
    if loc == 'eq' and pct < 0.46: alt = ['discount']
    if loc == 'eq' and pct > 0.54: alt = ['premium']
    if loc == 'discount' and pct > 0.34: alt = ['eq']
    if loc == 'premium' and pct < 0.66: alt = ['eq']
    for st in steps:
        for a in st.get('asks', []):
            if a['key'] == 'thesis4h': a['expert'] = 'bear' if short else 'bull'; a['why'] = T['thesis']
            if a['key'] == 'location': a['expert'] = loc; a['alt'] = alt; a['why'] = f'Price sits about {round(pct * 100)}% of the way up the 4H range.'
            if a['key'] == 'map1h' and a.get('expert') != 'range': a['expert'] = 'mss_bear' if short else 'mss_bull'; a['why'] = T['map']
            if a['key'] == 'obs15' and a.get('expert') == 'correcting': a['why'] = T['obs']
        if st.get('t') == 'replay' and st.get('pauses'):
            at = {'Indication': c['marks']['indication'], 'Correction': c['marks']['correction'], 'Continuation': c['marks']['continuation'], 'Retest': c['marks'].get('retest')}
            for p in st['pauses']:
                for k, v in at.items():
                    if f'<b>{k}.</b>' in p['text']: p['at'] = v
    return pct


def text_sub(obj, fn):
    if isinstance(obj, dict): return {k: text_sub(v, fn) for k, v in obj.items()}
    if isinstance(obj, list): return [text_sub(v, fn) for v in obj]
    if isinstance(obj, str): return fn(obj)
    return obj


# ── the cases ─────────────────────────────────────────────────────────────
# key: (file, slide or game case index), seed, and what the chart has to show.

LESSONS = [
    dict(key='L1', file='p8-1', slide=0, seed=101, dir='long', ending='stop', pct=0.38),
    dict(key='L2', file='p8-2', slide=0, seed=202, dir='long', ending='target', pct=0.33),
    dict(key='L3', file='p8-3', slide=0, seed=303, dir='short', ending='stop'),
    dict(key='L4', file='p8-4', slide=0, seed=404, dir='long', kind='early', ending='target', rr=2.0, trader='early', contracts=9),
    dict(key='L5A', file='p8-5', slide=0, seed=505, dir='long', ending='target', rr=2.5),
    dict(key='L5B', file='p8-5', slide=1, seed=515, dir='short', ending='target', rr=1.6, ceiling=True, s0=28,
         text=[('the 4H ceiling sits close above', 'the 4H floor sits close below')]),
    dict(key='L5C', file='p8-5', slide=2, seed=525, dir='long', kind='messy', range=True, ending='chop', after=12),
    dict(key='L5D', file='p8-5', slide=3, seed=535, dir='long', kind='noretest', range=True, ending='target'),
    dict(key='L6', file='p8-6', slide=0, seed=606, dir='short',
         variants=[('Would have hit target', 'target', {'type': 'WOULD_HAVE_WON', 'r': 2.0}),
                   ('Would have hit stop', 'stop', {'type': 'WOULD_HAVE_LOST', 'r': -1.0}),
                   ('Chopped sideways', 'chop', {'type': 'CHOP', 'r': None})]),
    dict(key='L7', file='p8-7', slide=0, seed=707, dir='short', ending='target'),
    dict(key='L8', file='p8-8', slide=0, seed=808, dir='long', ending='target', trader='chase', contracts=6),
    dict(key='L9', file='p8-9', slide=0, seed=909, dir='short', ending='target', indicator=True),
    dict(key='L10', file='p8-10', slide=0, seed=1010, dir='short', ending='target'),
]


GAME = [
    dict(key='G1', game=0, seed=1101, dir='long', ending='target'),
    dict(key='G2', game=1, seed=1202, dir='short', ending='stop'),
    dict(key='G3', game=2, seed=1303, dir='long', kind='early', ending='target', trader='early', contracts=4),
    dict(key='G4', game=3, seed=1404, dir='short', ending='target'),
    dict(key='G5', game=4, seed=1505, dir='long', ending='target'),
    dict(key='G6', game=5, seed=1606, dir='long', kind='wrongpil', ending='stop'),
    dict(key='G7', game=6, seed=1707, dir='short', ending='target', trader='chase', contracts=5),
    dict(key='G8', game=7, seed=1808, dir='long', kind='messy', range=True, m15='band', ending='chop', after=12),
    dict(key='G9', game=8, seed=1909, dir='long', ending='target', indicator=True),
    dict(key='G10', game=9, seed=2010, dir='short', ending='stop'),
]


def build_case(slide, sp):
    sp = dict(sp)
    for attempt in range(60):
        try:
            D = day(sp['seed'] * 100 + attempt, sp)
        except SystemExit as e:
            last = e; continue
        if sp.get('indicator'):
            # the indicator anchors on an internal swing inside the approach, under the real PIL,
            # and runs the same rules from there: a full sequence, at different candles
            m1 = D['m1']; t, i = D['mk']['pilBar'], D['mk']['indication']
            real = (D['mk']['indication'], D['mk']['correction'])
            pick = None
            for j in sorted(range(t + 1, i), key=lambda j: -m1[j]['h']):
                lvl = m1[j]['h']
                if lvl > -4 or lvl < -16: continue
                s2 = icc([{k: b[k] - lvl for k in 'ohlc'} for b in m1])
                if None not in s2.values() and (s2['I'], s2['C']) != real and s2['R'] <= D['dec'] + 2:
                    pick = lvl; break
            if pick is None:
                last = SystemExit(f'build-p8-cases: {sp["key"]}: no internal swing for the indicator'); continue
            sp['indicatorLevel'] = pick
        break
    else:
        raise last
    if sp.get('trader') == 'early':
        b = D['m1'][D['mk']['early']]
        sp['_traderEntry'] = q(b['h'] - D['rng'].uniform(0.5, 1.5))
    if sp.get('trader') == 'chase':
        sp['_traderEntry'] = D['m1'][D['mk']['runTop']]['c']
        need(sp['_traderEntry'] < D['target'] - 3, 'the chase entry must sit under the target')
    c = apply(slide, sp, D)
    steps = slide.get('steps') or c.get('steps') or []
    pct = asks_update(steps, sp, D, c)
    if 'steps' in c and c['steps'] is not steps: asks_update(c['steps'], sp, D, c)
    # prices and amounts quoted in the case text
    P, sg = D['P'], (-1 if D['short'] else 1)
    if sp.get('trader'):
        te = sp['_traderEntry']; A_te = q(P + sg * te)
        dist = abs(te)
        def fn(s):
            s = re.sub(r'(bought|sold)( the run)? at <b>\d+\.\d+</b>', lambda m: f'{m.group(1)}{m.group(2) or ""} at <b>{FMT(A_te)}</b>', s)
            s = re.sub(r'\d+(\.\d+)? points', f'{dist:g} points', s)
            s = re.sub(r'WIN · \+\$\d+', f'WIN · +${round(c["outcome"]["pnl"])}', s)
            return s
        for k in ('steps',):
            if k in slide: slide[k] = text_sub(slide[k], fn)
        c.update(text_sub({k: c[k] for k in ('steps', 'expert', 'reveal') if k in c}, fn))
        mk = 'early' if sp['trader'] == 'early' else 'runTop'
        at = D['mk'][mk]
        c['trader']['marks'] = [dict(m, **({'price': A_te, 'from': at} if m['type'] == 'ENTRY' else {'index': at}),
                                     **({'label': re.sub(r'[\d.]+', f'{dist:g}', m['label'])} if m['type'] != 'ENTRY' and sp['trader'] == 'chase' else {}))
                                for m in c['trader']['marks']]
    for old, new in sp.get('text', []):
        fn2 = lambda s, o=old, n=new: s.replace(o, n)
        if 'steps' in slide: slide['steps'] = text_sub(slide['steps'], fn2)
        c.update(text_sub({k: c[k] for k in ('steps', 'expert', 'reveal') if k in c}, fn2))
    if c.get('trader') and not sp.get('trader'):
        c['trader']['marks'] = [dict(m, index=D['mk']['retest']) if 'index' in m else m for m in c['trader']['marks']]
    return D, pct


def main():
    files = {}
    report = []
    for sp in LESSONS:
        f = sp['file']
        if f not in files: files[f] = json.load(open(os.path.join(ROOT, 'lessons-data', f + '.json')))
        d = files[f]
        slides = [s for s in d['slides'] if s['type'] == 'p8_case']
        D, pct = build_case(slides[sp['slide']], sp)
        mk = D['mk']
        report.append(f"{sp['key']:4} {sp['dir']:5} PIL {D['P']:.2f}  I{mk['indication']} C{mk['correction']} C{mk['continuation']} R{mk['retest']} dec{D['dec']} hit{D['hit']}  risk {D['risk']:.2f}  4H {round(pct*100)}%  1M {D['n']}")
    f = 'p8-s21-section'
    files[f] = d = json.load(open(os.path.join(ROOT, 'lessons-data', f + '.json')))
    cases = d['game']['levels'][0]['cases']
    for sp in GAME:
        D, pct = build_case(cases[sp['game']], sp)
        mk = D['mk']
        report.append(f"{sp['key']:4} {sp['dir']:5} PIL {D['P']:.2f}  I{mk['indication']} C{mk['correction']} C{mk['continuation']} R{mk['retest']} dec{D['dec']} hit{D['hit']}  risk {D['risk']:.2f}  4H {round(pct*100)}%  1M {D['n']}" + (f"  trader PIL {D['T']:g} under" if D['T'] else ''))
    for f, d in files.items():
        with open(os.path.join(ROOT, 'lessons-data', f + '.json'), 'w') as fh:
            fh.write(json.dumps(d, ensure_ascii=False, separators=(',', ':')))
    print('\n'.join(report))


if __name__ == '__main__':
    main()
