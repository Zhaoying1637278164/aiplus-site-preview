"""Embed the authoritative website catalog and its UI without network requests."""
import json,re,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
c=json.loads((ROOT/'site/catalog.json').read_text())
ui=(ROOT/'site/catalog-ui.js').read_text()
p=ROOT/'site/index.html';s=p.read_text()
block='<script id="aiplus-catalog-data">window.__AIPlusCatalog='+json.dumps(c,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';</script>\n<script id="aiplus-catalog-ui">\n'+ui+'\n</script>'
pattern=r'<script id="aiplus-catalog-data">.*?</script>\s*<script id="aiplus-catalog-ui">.*?</script>'
if re.search(pattern,s,re.S):s=re.sub(pattern,lambda _:block,s,flags=re.S)
else:s=s.replace('<script>\nwindow.__initTools=',block+'\n<script>\nwindow.__initTools=',1)
p.write_text(s)
