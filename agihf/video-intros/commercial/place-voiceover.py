#!/usr/bin/env python3
"""place-voiceover.py: put a voiceover on a commercial, each line on its caption.

The owner records the read script in one take with a short pause between lines.
This finds the pauses, splits the take into lines at the N-1 longest pauses (so
pauses inside a sentence stay inside it), and places each line at its caption
time. Voice only: no music is added. The video stream is copied, not re-encoded.

    python3 place-voiceover.py her-own   <voice file> [--with-last-line]
    python3 place-voiceover.py waitlist  <voice file> [--with-last-line]

--with-last-line: the take includes the optional end-card line.
Output: ../out/<video>-voice.mp4
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'out')

SPOTS = {
    # caption start times in seconds, one per read-script line, in order
    'her-own': {
        'video': 'aghf-a-life-of-her-own-60s.mp4',
        'times': [0.3, 3, 7, 10.3, 13, 16, 20.3, 24, 27, 30.3, 35, 42.3, 45, 49, 53, 56],
        'last': 58.2,
    },
    'waitlist': {
        'video': 'aghf-waitlist-45s.mp4',
        'times': [0.3, 2, 4.3, 7, 10, 14, 18, 21.2, 24, 27, 30.2, 33, 35],
        'last': 39.8,
    },
}
GAP = 0.15  # minimum gap kept between two placed lines


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
    return spans


def group(spans, n):
    """Merge sound spans into n lines by cutting at the n-1 longest pauses."""
    if len(spans) < n:
        sys.exit(f'Found {len(spans)} spoken parts but the script has {n} lines. '
                 'Leave a clear pause (about half a second) between lines and try again.')
    gaps = sorted(range(len(spans) - 1), key=lambda i: spans[i + 1][0] - spans[i][1], reverse=True)[:n - 1]
    cuts = sorted(gaps)
    lines, start = [], 0
    for c in cuts + [len(spans) - 1]:
        lines.append([spans[start][0], spans[c][1]])
        start = c + 1
    return lines


def main():
    if len(sys.argv) < 3 or sys.argv[1] not in SPOTS:
        sys.exit(__doc__)
    spot, voice = SPOTS[sys.argv[1]], sys.argv[2]
    times = spot['times'] + ([spot['last']] if '--with-last-line' in sys.argv else [])
    video = os.path.join(OUT, spot['video'])
    vlen = duration(video)
    lines = group(speech_spans(voice, duration(voice)), len(times))

    placed, prev_end, parts = [], 0.0, []
    for i, ((s, e), t) in enumerate(zip(lines, times)):
        s, e = max(0.0, s - 0.06), e + 0.12          # keep breaths and tails
        at = max(t, prev_end + GAP)
        prev_end = at + (e - s)
        placed.append({'line': i + 1, 'caption': t, 'starts': round(at, 2), 'length': round(e - s, 2)})
        ms = int(at * 1000)
        parts.append(f'[0:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS,adelay={ms}|{ms}[a{i}]')
    if prev_end > vlen:
        sys.exit(f'The voiceover runs to {prev_end:.1f} s but the video is {vlen:.0f} s. '
                 'Read a little faster or shorten the pauses inside lines.')

    mix = ''.join(f'[a{i}]' for i in range(len(lines)))
    graph = ';'.join(parts) + f';{mix}amix=inputs={len(lines)}:normalize=0,apad,atrim=0:{vlen:.3f},loudnorm=I=-14:TP=-1.5:LRA=11[v]'
    out = os.path.join(OUT, spot['video'].replace('.mp4', '-voice.mp4'))
    r = run(['ffmpeg', '-y', '-v', 'error', '-i', voice, '-i', video, '-filter_complex', graph,
             '-map', '1:v', '-map', '[v]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
             '-shortest', '-movflags', '+faststart', out])
    if r.returncode:
        sys.exit(r.stderr)
    late = [p for p in placed if p['starts'] - p['caption'] > 0.6]
    print(json.dumps({'output': out, 'lines': placed}, indent=1))
    if late:
        print(f'Note: {len(late)} line(s) start more than 0.6 s after their caption because the line before ran long.')


if __name__ == '__main__':
    main()
