"""Phase 7 (v2) tapes: every consequence path plays real candles. Checked against the model."""
from p7lib import *  # noqa: F401,F403
from p7lib import mtape, at, E, SL, TP, PIL, Tape, bull_setup, check, q


def ext(bars, moves, seed, cap_hi=None, cap_lo=None):
    """Continue a tape: moves = [(target, n), …]."""
    t = Tape(bars[-1]['c'], seed); t.b = []
    for tgt, n in moves:
        t.drift(tgt, n, cap_hi=cap_hi, cap_lo=cap_lo)
    return bars + t.b


def trade_lines(e_at, entry=E, stop=SL, target=TP, stop_label='STOP −30', tp_label='TP +60'):
    out = [{'price': entry, 'label': 'ENTRY', 'tone': 'ink', 'at': e_at}, {'price': stop, 'label': stop_label, 'tone': 'warn', 'at': e_at}]
    if target is not None:
        out.append({'price': target, 'label': tp_label, 'tone': 'ok', 'at': e_at})
    return out


def first(bars, frm, cond):
    return next(i for i in range(frm, len(bars)) if cond(bars[i]))


# ── in-trade fear: +22, pullback through break even, then the target ──────────
FEAR, FEAR_E = mtape([8, 15, 22, 17, 10, 3, -6, -3, 8, 19, 30, 42, 51, 57], seed=72, hit='tp')
FEAR_CP = at(FEAR_E, 4)                                  # the first pullback candle (+10)
FEAR_BE = first(FEAR, FEAR_CP, lambda b: b['l'] <= E)    # break-even stop taken
FEAR_TP = first(FEAR, FEAR_CP, lambda b: b['h'] >= TP)

# ── after the win: TP, then a mediocre chart ─────────────────────────────────
WIN, WIN_E = mtape([12, 24, 33, 41, 50, 57], seed=83, hit='tp')
_m, _mm = bull_setup(PIL, seed=31, wick_trap=2)
MESS = _m[:_mm['indication']]                          # wicks through the PIL, never a close
check(MESS, {})
MESS_FAIL = ext(MESS, [(PIL - 12, 3), (PIL - 24, 3), (PIL - 31, 2)], 32, cap_hi=PIL)   # she buys the wick: −1R
check(MESS_FAIL, {})
MESS_WAIT = ext(MESS, [(PIL - 6, 3), (PIL - 3, 2), (PIL - 9, 3), (PIL - 5, 3)], 33, cap_hi=PIL)  # never closes through
check(MESS_WAIT, {})

# ── a valid setup that loses (revenge, streaks) ─────────────────────────────
LOSS, LM = bull_setup(PIL, seed=7, run=12, after=0)
LOSS = ext(LOSS, [(PIL - 12, 3), (PIL - 26, 3)], 8, cap_hi=PIL + 2)
_t = Tape(LOSS[-1]['c'], 9); _t.b = []; _t.bar(PIL - 31.5, dn=1.5); LOSS = LOSS + _t.b
check(LOSS, {k: LM[k] for k in ('indication', 'correction', 'continuation', 'retest')})
LOSS_E = PIL + 1.5   # first-retest fill (approx.)

# ── revenge: Indication only, two minutes later ────────────────────────────
_i, _im = bull_setup(PIL, seed=19, stall=True)
INC = _i[:_im['indication'] + 1]
INC = INC + [{'o': INC[-1]['c'], 'h': q(INC[-1]['c'] + 3.25), 'l': q(INC[-1]['c'] - 0.75), 'c': q(INC[-1]['c'] + 2.5)}]
INC_AT = len(INC)
INC_FAIL = ext(INC, [(PIL - 6, 3), (PIL - 18, 3), (PIL - 28, 2)], 20, cap_hi=PIL + 6)      # she gets in now: stopped
INC_WAIT = ext(INC, [(PIL - 4, 3), (PIL - 10, 3), (PIL - 6, 3), (PIL - 12, 3)], 21, cap_hi=PIL + 4)  # never completes
check(INC_WAIT[:INC_AT], {'indication': _im['indication']})

# ── a valid winner (losing streak, hesitation) ─────────────────────────────
HES, HM = bull_setup(PIL, seed=21, run=14, after=3)
HES = ext(HES, [(PIL + 24, 4), (PIL + 42, 4), (PIL + 63, 4)], 22, cap_lo=PIL + 2)
check(HES, {k: HM[k] for k in ('indication', 'correction', 'continuation', 'retest')})
HES_TP = first(HES, HM['retest'], lambda b: b['h'] >= PIL + 61.5)

# ── FOMO: no retest, it runs. Or: you chase, and it comes back ───────────────
_r, RM = bull_setup(PIL, seed=13, retest=False, run=24, after=3)
FOMO = ext(_r, [(PIL + 40, 3), (PIL + 55, 3), (PIL + 64, 2)], 14, cap_lo=PIL + 20)
check(FOMO, {k: RM[k] for k in ('indication', 'correction', 'continuation')})
F_25 = first(FOMO, RM['continuation'], lambda b: b['c'] >= PIL + 25)
F_TOP = first(FOMO, RM['continuation'], lambda b: b['h'] >= PIL + 60)
FOMO_REV = ext(FOMO[:F_25 + 1], [(PIL + 14, 3), (PIL + 2, 3), (PIL - 6, 2)], 15)
CHASE_E = FOMO[F_25]['c']

# ── overtrading: a tiny setup after your day is done ───────────────────────
TINY, TM = bull_setup(PIL, seed=29, run=6, after=0)
check(TINY, {k: TM[k] for k in ('indication', 'correction', 'continuation', 'retest')})
TINY_FAIL = ext(TINY, [(PIL - 10, 3), (PIL - 22, 3), (PIL - 30, 2)], 30, cap_hi=PIL + 3)

# ── waiting: chop all morning, then (or not) a setup ───────────────────────
def chop(n, seed, center=PIL - 9, amp=4):
    tt = Tape(center, seed); tt.b = []
    for k in range(n):
        tt.drift(center + (amp if k % 2 else -amp), 1, cap_hi=PIL - 1.5)
    return tt.b
WAIT_PRE = chop(12, 41)
_wa, _wam = bull_setup(PIL, seed=43, lead=None, run=16, after=4)
WAIT_A = WAIT_PRE + _wa
WAM = {k: v + len(WAIT_PRE) for k, v in _wam.items() if isinstance(v, int)}
check(WAIT_A, {k: WAM[k] for k in ('indication', 'correction', 'continuation', 'retest')})
_ws, _wsm = bull_setup(PIL, seed=47, stall=True)
WAIT_FORCE = WAIT_PRE + _ws[:_wsm['indication'] + 1]
WAIT_FORCE = ext(WAIT_FORCE, [(PIL - 8, 3), (PIL - 20, 3), (PIL - 28, 2)], 48, cap_hi=PIL + 4)

# ── the trade you need to work: valid, and it loses ────────────────────────
NEED, NEED_E = mtape([6, 11, 4, -3, -9, -15, -21, -26], seed=91)
NEED_GREEN = at(NEED_E, 1)       # +11, the first real green
NEED_SL = NEED + [{'o': NEED[-1]['c'], 'h': NEED[-1]['c'] + 1, 'l': SL - 1.5, 'c': SL - 0.5}]
NEED_WIDE = ext(NEED, [(E - 38, 3), (E - 50, 3), (E - 60, 2)], 92)

# ── a heater: valid trade loses at double size, or (the dangerous one) wins ──
HEAT_WIN = HES
