#!/usr/bin/env python3
"""Builds ../docs/index.html (Chakrview) and ../docs/duel.html (Chakrvroom) from src/.
Run:  python3 build.py   (needs only Python 3)"""
import os, sys
W = os.path.dirname(os.path.abspath(__file__))
rd = lambda p: open(os.path.join(W, p), encoding='utf-8').read()
three = rd('three.min.js')
base = rd('src/base.css').replace('/*FONTS*/', rd('fonts.css'))
ENGINE = ['src/engine_a.js', 'src/_art.js', 'src/engine_a2.js', 'src/engine_b.js', 'src/engine_c.js', 'src/music.js', 'src/logo.js']

def build(page, parts, out, extra_scripts=''):
    html = rd(page).replace('/*BASECSS*/', base)
    game = '\n'.join(rd(p) for p in parts)
    assert '</script' not in game
    html = html.replace('/*GAME*/', lambda_safe(game)).replace('<script>/*__THREE__*/</script>', '<script>' + three + '</script>' + extra_scripts)
    os.makedirs(os.path.dirname(os.path.join(W, out)), exist_ok=True)
    open(os.path.join(W, out), 'w', encoding='utf-8').write(html)
    # a source copy without the libraries, for syntax checks
    print(out, len(html))

def lambda_safe(s): return s

which = sys.argv[1:] or ['solo', 'vroom']
if 'solo' in which:
    build('src/solo_page.html', ['src/solo_cfg.js'] + ENGINE + ['src/solo_ui.js'], '../docs/index.html')
if 'vroom' in which and os.path.exists(os.path.join(W, 'src/vroom_page.html')):
    build('src/vroom_page.html', ['src/vroom_cfg.js'] + ENGINE + ['src/mqtt.js', 'src/vroom_ui.js'], '../docs/duel.html')
