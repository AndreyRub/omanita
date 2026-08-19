"""Regenerate index.html and sadnaot.html. Usage: python src/build.py (any cwd)."""
import json, re, os
SRC = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(SRC)
imgs = json.load(open(os.path.join(SRC, 'imgs.json'), encoding='utf-8'))
sub = lambda s: re.sub(r'\{\{(\w+)\}\}', lambda m: imgs[m.group(1)], s)

# index.html: template with image placeholders filled in
tpl = open(os.path.join(SRC, 'omanita_v1_template.html'), encoding='utf-8').read()
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(sub(tpl))

# sadnaot.html: refresh its first (shared) <style> block from the template, keep the rest
style = tpl[tpl.index('<style>'):tpl.index('</style>') + 8]
cur = open(os.path.join(ROOT, 'sadnaot.html'), encoding='utf-8').read()
a, b = cur.index('<style>'), cur.index('</style>') + 8
open(os.path.join(ROOT, 'sadnaot.html'), 'w', encoding='utf-8').write(cur[:a] + style + cur[b:])
print('built index.html; refreshed sadnaot.html shared style')
