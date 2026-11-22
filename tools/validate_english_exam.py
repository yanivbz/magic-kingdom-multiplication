#!/usr/bin/env python3
"""Validate English exam files against the teacher's scope.
Every word, sentence and letter example word must use ONLY the exam's letters; pictures must be unique.
Usage: python3 tools/validate_english_exam.py   (exit code 1 on any problem)"""
import json, re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
ix = json.loads((root / 'data/exams/index.json').read_text())
letters_js = (root / 'js/english-data.js').read_text()
examples = dict(re.findall(r"L\('([A-Z])', '[^']*', '[^']*', '([a-z-]+)'", letters_js))
bad = []
for f in ix['exams']:
    x = json.loads((root / 'data/exams' / f).read_text())
    if x.get('subject') != 'english':
        continue
    ok = set(''.join(x['letters']).lower())
    chk = lambda what, txt: (lambda extra: extra and bad.append(f"{f}: {what} '{txt}' uses {sorted(extra)}"))(set(re.sub(r'[^a-z]', '', txt.lower())) - ok)
    for w in x['words']: chk('word', w['w'])
    for s in x['sentences']: chk('sentence', s['s'])
    for u in x['letters']: chk(f'example word for {u}', examples.get(u, '?'))
    for key, items in (('word', [w['pic'] for w in x['words']]), ('sentence', [s['pic'] for s in x['sentences']])):
        dup = {p for p in items if items.count(p) > 1}
        if dup: bad.append(f"{f}: duplicate {key} pictures {dup}")
    ws = {w['w'] for w in x['words']}
    for s in x['sentences']:
        for t in re.findall(r'[a-z]+', s['s'].lower()):
            if t not in ws and t not in {'a', 'an', 'and', 'in', 'i', 'had', 'big', 'ate'}:
                bad.append(f"{f}: sentence word '{t}' is not in the word list ({s['s']})")
    print(f"{f}: {len(x['words'])} words, {len(x['sentences'])} sentences, letters {' '.join(x['letters'])}")
print('\n'.join(bad) or 'OK: everything is inside the teacher scope')
sys.exit(1 if bad else 0)
