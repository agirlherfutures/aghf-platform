"""
Builds shared/p8-focus-scenarios.js: the charts for Phase 8 Lessons 2-9
(shared/p8-focus.js). One lesson, one job, one chart of its own.

    python3 tools/build-p8-focus.py

Each chart is written as a list of closes in points relative to its PIL
(+ = above). Opens are the previous close; wicks are small unless a candle
overrides them. The ICC events are then derived from the bars with the
Phase 5 rules, and the build fails if a chart doesn't show what its lesson
says:
  Indication   = first close through the PIL
  Correction   = the next close back past the PIL
  Continuation = the next close through the PIL again
  Retest       = the first later candle to touch the PIL and close on the trade's side
Trade outcomes (target or stop first) are checked against the bars too.
"""
import json, os

TICK = 0.25
q = lambda p: round(p / TICK) * TICK


def bars_from(closes, pil, wick=1.25, over=None, start=None):
    """Closes are relative to the PIL. `over` = {i: {'h': rel, 'l': rel}} overrides a candle's wicks."""
    over = over or {}
    out = []
    for i, c in enumerate(closes):
        o = closes[i - 1] if i else (start if start is not None else c - 1.5)
        h = max(o, c) + wick * (0.6 + (i % 3) * 0.3)
        l = min(o, c) - wick * (0.6 + (i % 2) * 0.35)
        if i in over:
            h = over[i].get('h', h)
            l = over[i].get('l', l)
        out.append({'o': q(pil + o), 'h': q(pil + h), 'l': q(pil + l), 'c': q(pil + c)})
    return out


def icc(bars, pil, long):
    thr = (lambda b: b['c'] > pil) if long else (lambda b: b['c'] < pil)
    back = (lambda b: b['c'] < pil) if long else (lambda b: b['c'] > pil)
    s = {'I': None, 'C': None, 'C2': None, 'R': None}
    for i in range(1, len(bars)):
        b = bars[i]
        if s['I'] is None:
            if thr(b) and not thr(bars[i - 1]): s['I'] = i
        elif s['C'] is None:
            if back(b): s['C'] = i
        elif s['C2'] is None:
            if thr(b): s['C2'] = i
        elif s['R'] is None:
            touch = b['l'] <= pil + 2 if long else b['h'] >= pil - 2
            if touch and thr(b): s['R'] = i
    return s


def first_hit(bars, frm, long, stop, target):
    """Which level price reaches first after `frm`, and on which candle: ('target' | 'stop' | None, index)."""
    for i in range(frm + 1, len(bars)):
        b = bars[i]
        hit_stop = b['l'] <= stop if long else b['h'] >= stop
        hit_tgt = b['h'] >= target if long else b['l'] <= target
        if hit_stop and hit_tgt: return 'both', i
        if hit_stop: return 'stop', i
        if hit_tgt: return 'target', i
    return None, None


def need(cond, msg):
    if not cond: raise SystemExit(f'build-p8-focus: {msg}')


def trade(sc, entry_at, stop_rel, rr=2.0):
    """Entry at the close of `entry_at`, stop at PIL+stop_rel, target at rr x risk."""
    long = sc['dir'] == 'long'
    e = sc['bars'][entry_at]['c']
    stop = q(sc['pil'] + stop_rel)
    risk = abs(e - stop)
    tgt = q(e + rr * risk if long else e - rr * risk)
    first, hit = first_hit(sc['bars'], entry_at, long, stop, tgt)
    return {'at': entry_at, 'entry': e, 'stop': stop, 'target': tgt, 'risk': risk, 'first': first, 'hit': hit}


def make(name, dir_, pil, closes, over=None, start=None):
    sc = {'name': name, 'dir': dir_, 'pil': pil, 'bars': bars_from(closes, pil, over=over, start=start)}
    sc['icc'] = icc(sc['bars'], pil, dir_ == 'long')
    return sc


S = {}

# Lesson 2 · a clean, valid long that reaches its target.
s = make('valid-win', 'long', 21150, [-14, -11, -8, -9, -12, -15, -14, -10, -6, -2, 6, -3, 8, 14, 10, 4, 10, 16, 22, 26, 30, 28, 33],
         over={15: {'l': -0.75}, 11: {'l': -6}})
need(s['icc'] == {'I': 10, 'C': 11, 'C2': 12, 'R': 15}, f"valid-win icc {s['icc']}")
s['trade'] = trade(s, 15, -8)
need(s['trade']['first'] == 'target', f"valid-win should hit target: {s['trade']}")
S['valid-win'] = s

# Lesson 3 · the same checks, a different day: valid long, the stop gets hit.
s = make('valid-loss', 'long', 20975, [-6, -9, -13, -16, -12, -8, -11, -7, -4, -2, 5, 9, -2, 7, 12, 9, 3, 6, 1, -5, -10, -13, -12],
         over={12: {'l': -5.5}, 16: {'l': -0.5}})
need(s['icc'] == {'I': 10, 'C': 12, 'C2': 13, 'R': 16}, f"valid-loss icc {s['icc']}")
s['trade'] = trade(s, 16, -7.5)
need(s['trade']['first'] == 'stop', f"valid-loss should stop out: {s['trade']}")
S['valid-loss'] = s

# Lesson 4 · a short that paid, but the trader shorted the Correction candle (before the Continuation closed).
s = make('early-win', 'short', 21310, [18, 14, 16, 10, 12, 8, 6, 8, 4, 2, -6, 4, -4, -2, -8, -14, -18, -16, -22, -24, -28],
         over={13: {'h': 0.5}})
need(s['icc'] == {'I': 10, 'C': 11, 'C2': 12, 'R': 13}, f"early-win icc {s['icc']}")
s['early'] = s['icc']['C']
s['trade'] = trade(s, s['early'], 9, rr=2.0)
need(s['trade']['first'] == 'target', f"early-win should still win: {s['trade']}")
S['early-win'] = s

# Lesson 5 · four charts at one PIL: two clean, two messy.
s = make('clean-long', 'long', 21040, [-12, -8, -10, -6, -8, -4, -2, 6, -4, 8, 14, 12, 16, 22])
need(s['icc']['I'] == 7 and s['icc']['C'] == 8 and s['icc']['C2'] == 9, f"clean-long icc {s['icc']}")
S['clean-long'] = s
s = make('chop', 'long', 21040, [-4, 2, -2, 4, -3, 3, -2, 5, -4, 2, -1, 4, -3, 1], over={2: {'h': 6}, 4: {'h': 7}, 6: {'l': -8}, 9: {'l': -7}})
S['chop'] = s
s = make('clean-short', 'short', 21040, [14, 10, 12, 8, 6, 8, 2, -6, 4, -8, -12, -10, -16, -20])
need(s['icc']['I'] == 7 and s['icc']['C'] == 8 and s['icc']['C2'] == 9, f"clean-short icc {s['icc']}")
S['clean-short'] = s
s = make('wicky', 'long', 21040, [-2, 1.5, -1, 1, -1.5, 2, -1, 1, -1.5, 1.5, -1, 1, -0.5, 1],
         over={1: {'h': 8, 'l': -6}, 3: {'h': 7, 'l': -7}, 5: {'h': 9}, 7: {'l': -8}, 9: {'h': 8}, 11: {'l': -7}})
S['wicky'] = s

# Lesson 6 · a valid long that completes three minutes before CPI. The pass is the rule.
s = make('news-pass', 'long', 21085, [-15, -12, -9, -11, -7, -5, -3, 4, -2, 6, 11, 8, 3, 8, 13, 19, 24, 27, 31, 34],
         over={8: {'l': -5}, 12: {'l': -0.75}})
need(s['icc'] == {'I': 7, 'C': 8, 'C2': 9, 'R': 12}, f"news-pass icc {s['icc']}")
s['trade'] = trade(s, 12, -7)
need(s['trade']['first'] == 'target', f"news-pass would have won: {s['trade']}")
S['news-pass'] = s

# Lesson 7 · a planned retest entry that got missed. Price retested, then ran to target without you.
s = make('missed', 'long', 21200, [-10, -13, -9, -6, -8, -4, -2, 5, -3, 7, 12, 9, 4, 10, 16, 22, 27, 31, 36, 40, 44],
         over={8: {'l': -6}, 12: {'l': -0.5}})
need(s['icc'] == {'I': 7, 'C': 8, 'C2': 9, 'R': 12}, f"missed icc {s['icc']}")
s['trade'] = trade(s, 12, -8)
need(s['trade']['first'] == 'target', f"missed should reach target: {s['trade']}")
s['late'] = 18  # where you came back to the screen
S['missed'] = s

# Lesson 8 · same chart, two traders: one chased the Continuation candle, one waited for the retest.
s = make('two-traders', 'long', 21120, [-11, -8, -12, -9, -6, -7, -3, 6, -2, 9, 14, 10, 4, 9, 15, 20, 18, 24, 28, 30],
         over={8: {'l': -6}, 12: {'l': -0.75}, 10: {'h': 16}})
need(s['icc'] == {'I': 7, 'C': 8, 'C2': 9, 'R': 12}, f"two-traders icc {s['icc']}")
s['chase'] = 10            # entered at the top of the push after the Continuation
s['patient'] = s['icc']['R']
need(s['bars'][s['chase']]['c'] > s['bars'][s['patient']]['c'] + 6, 'the chase should be well above the retest entry')
S['two-traders'] = s

# Lesson 9 · the 1H map. The 1H swing price pulled back from is the PIL;
# an indicator would anchor on the smaller, internal swing below it.
closes = [-40, -52, -61, -70, -66, -74, -82, -78, -70, -63, -55, -58, -50, -42, -34, -38, -30, -22, -14, -6, 0, -8, -16, -22, -18, -24]
s = make('map-1h', 'long', 21165, closes, over={20: {'h': 1.5}})
hi_i = max(range(len(s['bars'])), key=lambda i: s['bars'][i]['h'])
need(hi_i == 20, f"map-1h: the 1H swing high should be bar 20, got {hi_i}")
s['swing'] = {'at': hi_i, 'price': s['bars'][hi_i]['h']}
# the internal swing: bar 14's high, a smaller pullback inside the leg up
s['internal'] = {'at': 14, 'price': s['bars'][14]['h']}
need(s['internal']['price'] < s['swing']['price'] - 20, 'map-1h: the internal swing should be clearly lower')
s['tf'] = '1H'
S['map-1h'] = s

# Lesson 6 · the same setup, three possible endings after the decision candle. The pass is right in all three.
pre = [-15, -12, -9, -11, -7, -5, -3, 4, -2, 6, 11, 8, 3]
for key, tail, want in [('end-run', [8, 13, 19, 24, 27, 31, 34], 'target'), ('end-reverse', [1, -3, -6, -9, -12, -10, -14], 'stop'), ('end-chop', [5, 2, 6, 3, 5, 2, 4], None)]:
    s = make(key, 'long', 21085, pre + tail, over={8: {'l': -5}, 12: {'l': -0.75}})
    need(s['icc'] == {'I': 7, 'C': 8, 'C2': 9, 'R': 12}, f"{key} icc {s['icc']}")
    s['trade'] = trade(s, 12, -7)
    need(s['trade']['first'] == want, f"{key} should end {want}: {s['trade']}")
    s['decision'] = 12
    S[key] = s

out = os.path.join(os.path.dirname(__file__), '..', 'shared', 'p8-focus-scenarios.js')
with open(out, 'w') as f:
    f.write('/* Generated by tools/build-p8-focus.py — do not edit by hand. */\n')
    f.write('export const P8_FOCUS = ' + json.dumps(S, separators=(',', ':')) + ';\n')
print('wrote', os.path.relpath(out), '·', ', '.join(f"{k}: I{v['icc']['I']} C{v['icc']['C']} C{v['icc']['C2']} R{v['icc']['R']}" for k, v in S.items()))
