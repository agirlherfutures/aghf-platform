#!/usr/bin/env python3
"""place-voiceover.py: put a voiceover on a commercial and time the captions to it.

The owner records the read script in one take with a short pause between
phrases. This finds the spoken parts, groups them into one phrase per caption,
places each phrase on its shot, and writes vo-<spot>.js so each caption shows
exactly while its words are spoken. Voice only: no music is added.

    python3 place-voiceover.py her-own   <voice file>
    python3 place-voiceover.py waitlist  <voice file>
    python3 place-voiceover.py waitlist  <voice file> --parts   # list the spoken parts found

Steps for a new take:
  1. Run with --parts and check the count matches the phrase list in SPOTS
     (a take can split a phrase on a breath; adjust the part counts if so).
  2. Run it: writes vo-<spot>.js and ../out/<video>-voice.mp4.
  3. Re-render the video (node render-<spot>.cjs) so its captions pick up
     vo-<spot>.js, then run step 2 again to put the voice on the new render.
"""
import os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'out')

# One entry per caption, in CAPTIONS order:
#   (earliest start in the video, spoken parts in the take[, split points])
# A phrase that carries two captions with no pause between them lists the
# take time (s) where the second caption's words begin.
SPOTS = {
    'her-own': {
        'video': 'aghf-a-life-of-her-own-60s.mp4',
        'duration': 63,
        'phrases': [
            (0.3, 1), (2.3, 1), (4.1, 1), (5.6, 1), (8.2, 1),   # mother, shots 1A-1C
            (10.3, 1), (13.1, 1), (16.1, 1),                   # student, shots 2A-2C
            (20.3, 1), (24.1, 1), (27.1, 1),                   # career, shots 3A-3C
            (30.1, 1), (31.1, 1), (32.1, 1),                   # three women
            (35.1, 1, [33.64]),                                # "...on hold" / "just to learn..."
            (42.3, 1), (45.1, 2), (49.1, 1), (53.1, 1), (56.0, 1),
        ],
        'end': (58.2, 2),  # "Go live your life, girl." over the end card, no caption
    },
    'waitlist': {
        'video': 'aghf-waitlist-45s.mp4',
        'duration': 45,
        'phrases': [(0.3, 1), (2.1, 1), (4.3, 1), (7.1, 1), (10.1, 1), (14.1, 1), (18.1, 1),
                    (21.2, 1), (24.1, 1), (27.1, 1), (30.2, 1), (33.1, 1), (35.1, 1)],
        'end': (39.8, 2),  # "HER future. HER way." over the end card, no caption
    },
}
GAP = 0.15    # minimum gap kept between two placed phrases
LEAD = 0.12   # caption appears this long before its first word
HOLD = 0.9    # caption stays up this long after its last word, unless the next one starts


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def duration(path):
    r = run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path])
    return float(r.stdout.strip())


def speech_spans(path, total):
    """Spans of sound between silences (silence = quieter than -38 dB for 0.25 s)."""
    r = run(['ffmpeg', '-i', path, '-af', 'silencedetect=noise=-38dB:d=0.25', '-f', 'null', '-'])
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', r.stderr)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', r.stderr)]
    spans, cur = [], 0.0
    for s, e in zip(starts, ends + [total] * (len(starts) - len(ends))):
        if s > cur + 0.05:
            spans.append([cur, s])
        cur = e
    if cur < total - 0.05:
        spans.append([cur, total])
    return [sp for sp in spans if sp[1] - sp[0] >= 0.1]  # drop clicks and breaths


def main():
    if len(sys.argv) < 3 or sys.argv[1] not in SPOTS:
        sys.exit(__doc__)
    name, voice = sys.argv[1], sys.argv[2]
    spot = SPOTS[name]
    spans = speech_spans(voice, duration(voice))
    if '--parts' in sys.argv:
        for i, (a, b) in enumerate(spans):
            print(f'{i + 1:2d}  {a:6.2f}  {b:6.2f}')
        return
    plan = [(p + ([],))[:3] for p in spot['phrases']] + [spot['end'] + ([],)]
    want = sum(p[1] for p in plan)
    if want != len(spans):
        sys.exit(f'Found {len(spans)} spoken parts but expected {want}. Run with --parts and '
                 'compare against the phrase list in SPOTS.')

    placed, parts, prev_end, i = [], [], 0.0, 0
    for k, (t, n, splits) in enumerate(plan):
        first, last = spans[i], spans[i + n - 1]
        i += n
        s, e = max(0.0, first[0] - 0.06), last[1] + 0.12   # keep breaths and tails
        at = max(t, prev_end + GAP)
        prev_end = at + (e - s)
        shift = at - s
        bounds = [first[0]] + splits + [last[1]]           # each caption's words, in take time
        placed.append({'at': at, 'end': prev_end, 'late': at - t,
                       'words': [(a + shift, b + shift) for a, b in zip(bounds, bounds[1:])]})
        ms = int(at * 1000)
        parts.append(f'[0:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS,adelay={ms}|{ms}[a{k}]')
    if prev_end > spot['duration']:
        sys.exit(f'The voiceover runs to {prev_end:.1f} s but the video is {spot["duration"]} s.')

    # Caption timings: each caption is up while its own words are spoken.
    words = [w for p in placed[:-1] for w in p['words']]
    nexts = [w[0] for w in words[1:]] + [placed[-1]['at']]
    caps = [(round(a - LEAD, 2), round(min(nx - LEAD - 0.04, b + HOLD), 2)) for (a, b), nx in zip(words, nexts)]
    js = os.path.join(HERE, f'vo-{name}.js')
    with open(js, 'w') as f:
        f.write('// Generated by place-voiceover.py from the voiceover take: caption i shows from at to end.\n'
                'window.VO_CAPTIONS = [\n' + ''.join(f'  {{ at: {a}, end: {b} }},\n' for a, b in caps) + '];\n')

    video = os.path.join(OUT, spot['video'])
    vlen = duration(video)
    mix = ''.join(f'[a{k}]' for k in range(len(plan)))
    graph = ';'.join(parts) + f';{mix}amix=inputs={len(plan)}:normalize=0,apad,atrim=0:{vlen:.3f},loudnorm=I=-14:TP=-1.5:LRA=11[v]'
    out = os.path.join(OUT, spot['video'].replace('.mp4', '-voice.mp4'))
    r = run(['ffmpeg', '-y', '-v', 'error', '-i', voice, '-i', video, '-filter_complex', graph,
             '-map', '1:v', '-map', '[v]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
             '-shortest', '-movflags', '+faststart', out])
    if r.returncode:
        sys.exit(r.stderr)
    for k, p in enumerate(placed):
        flag = f'  (+{p["late"]:.2f} s late)' if p['late'] > 0.6 else ''
        print(f'phrase {k + 1:2d}  {p["at"]:6.2f} - {p["end"]:6.2f}{flag}')
    print(f'captions -> {js}\nvideo    -> {out}')


if __name__ == '__main__':
    main()
