"""Fail closed on website taxonomy, catalog drift and literal tool counts."""
import collections,json,pathlib,re,sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
def validate(c,source,runtime):
 errors=[];modules={m['id']:m['name'] for m in c['modules']};kinds={k['name'] for k in c['kinds']};rows=c['tools']
 expected=dict(zip('RPETKACFXBMDU',['应收','应付','费用薪酬','资金','成本存货','资产','结账','报表','税务','预算','经营分析','数据准备','审计内控']))
 if modules!=expected:errors.append('模块集合与批准的编号映射不一致')
 for r in rows:
  for field,valid in [('module',set(modules)),('kind',kinds),('status',{'已上线','规划中'})]:
   if not isinstance(r.get(field),str) or r[field] not in valid:errors.append(f'{r.get("id")}: {field} 必须恰好一个合法值')
  if not isinstance(r.get('id'),str) or not re.fullmatch(r'[RPETKACFXBMDU](?:\d{2}|-P\d{2})',r.get('id','')) or r['id'][0]!=r.get('module'):errors.append(f'{r.get("id")}: 编号前缀与模块不一致')
  if not isinstance(r.get('name'),str) or not r['name'].strip():errors.append('名称不能为空')
  if type(r.get('ai')) is not bool:errors.append(f'{r.get("id")}: ai 必须是布尔值')
 for field in ['id','name']:
  vals=[r.get(field) for r in rows if isinstance(r.get(field),str)]
  if len(set(vals))!=len(vals):errors.append(field+'重复')
 live=[r for r in rows if r.get('status')=='已上线'];by_mod=collections.Counter(r.get('module') for r in live if isinstance(r.get('module'),str));by_kind=collections.Counter(r.get('kind') for r in live if isinstance(r.get('kind'),str))
 if len(live)!=sum(by_mod.get(m,0) for m in modules) or len(live)!=sum(by_kind.get(k,0) for k in kinds):errors.append('已上线总数与模块或形态之和不等')
 if set(r['id'] for r in live)!=set(r['id'] for r in runtime):errors.append('已上线登记与实际运行登记不一致')
 for r in live:
  actual=next((x for x in runtime if x['id']==r['id']),{})
  if any(r.get(k)!=actual.get(k) for k in ['name','detailRoute','workspaceRoute']):errors.append(r['id']+'与运行登记不一致')
 # Numbers in fonts, SHA hashes and download byte lengths are assets, not tool counts.
 clean=re.sub(r'data:font/[^\"\)\s]+','FONT',source)
 clean=re.sub(r'data-download-(?:bytes|sha)="[^"]*"','',clean)
 clean=re.sub(r'window\.__AIPlusRegistry=.*?;</script>','RUNTIME</script>',clean,flags=re.S)
 if re.search(r'(?<!\d)113(?!\d)',clean):errors.append('页面含旧硬编码工具数量')
 text=re.sub(r'<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>','',clean,flags=re.S)
 if re.search(r'\d+\s*个\s*(?:已上线)?(?:开源财务工具|工具模板|工具|业务模块)',text):errors.append('展示文案含硬编码工具/模块数量')
 if re.search(r'data-(?:total|count|live-count)=[^>]*>\s*\d+',text):errors.append('计数展示必须运行时计算')
 if errors:raise ValueError('\n'.join(errors))
 return {'live':len(live),'modules':dict(by_mod),'kinds':dict(by_kind),'planned':len(rows)-len(live)}
def main():
 c=json.loads((ROOT/'site/catalog.json').read_text());source=(ROOT/'site/index.html').read_text();runtime=json.loads((ROOT/'site/registry.json').read_text())
 result=validate(c,source,runtime)
 embedded=re.search(r'<script id="aiplus-catalog-data">window\.__AIPlusCatalog=(.*?);</script>',source,re.S)
 assert embedded and json.loads(embedded[1].replace('<\\/','</'))==c,'内嵌登记未同步，请运行 build_catalog.py'
 ui=re.search(r'<script id="aiplus-catalog-ui">\n(.*?)\n</script>',source,re.S)
 assert ui and ui[1]==(ROOT/'site/catalog-ui.js').read_text(),'内嵌展示代码未同步'
 print(json.dumps({'passed':True,**result},ensure_ascii=False,indent=2))
if __name__=='__main__':
 try:main()
 except (ValueError,AssertionError) as e:print(str(e),file=sys.stderr);sys.exit(1)
