"""Phase 7 (v2): the lived-moment voice. Helpers for p7_scene."""
from p7lib import *  # noqa: F401,F403
from p7lib import xchart, PIL


def scene(kicker, title, beats, **kw):
    d = {'type': 'p7_scene', 'kicker': kicker, 'title': title, 'beats': beats}
    d.update(kw)
    return d


def say(*lines, big=False):
    d = {'say': list(lines)}
    if big: d['big'] = True
    return d


def ch(bars, play=None, show=None, pil=PIL, lines=None, tags=None, head=None, caption=None, speed=300, range_=None):
    c = xchart(bars, show=show, pil=pil, tags=tags, head=head, lines=lines)
    if play is not None:
        frm, to = play if isinstance(play, tuple) else (play, len(bars))
        c['play'] = {'from': frm, 'to': to, 'speed': speed}
        c.pop('show', None)
    if range_: c['range'] = range_
    d = {'chart': c}
    if caption: d['caption'] = caption
    return d


def th(*thoughts, gap=None):
    d = {'thoughts': list(thoughts)}
    if gap: d['gap'] = gap
    return d


def op(label, track=None, chart=None, thoughts=None, say=None, tally=None, stamp=None):
    path = {}
    if chart: path['chart'] = chart['chart'] if 'chart' in chart else chart
    if thoughts: path['thoughts'] = list(thoughts)
    if say: path['say'] = list(say) if isinstance(say, (list, tuple)) else [say]
    if tally: path['tally'] = tally
    if stamp: path['stamp'] = stamp
    d = {'label': label, 'path': path}
    if track: d['track'] = track
    return d


def choice(prompt, *opts):
    return {'choice': {'prompt': prompt, 'options': list(opts)}}


def who(before_h, before_lines, after_h, after_lines, verdict=None, title=None):
    d = {'who': {'before': {'h': before_h, 'lines': before_lines}, 'after': {'h': after_h, 'lines': after_lines}}}
    if verdict: d['who']['verdict'] = verdict
    if title: d['who']['title'] = title
    return d


def pr(text):
    return {'principle': text}


def cards(*c):
    return {'cards': list(c)}


def tal(rows, stamp=None):
    d = {'tally': rows}
    if stamp: d['stamp'] = stamp
    return d
