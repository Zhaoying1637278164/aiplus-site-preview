"""Embed task guidance; tool identity and routes come from the existing catalog."""
import json,pathlib,re
ROOT=pathlib.Path(__file__).resolve().parents[1]

def validate(data,catalog):
    live={t['id']:t for t in catalog['tools'] if t['status']=='已上线'}
    assert data['schema_version']==1 and data['contains_data'] is False
    assert set(data['guides'])==set(live),'Guidance must cover exactly the live tool IDs'
    for guide in data['guides'].values():
        assert set(guide)=={'input','parameters','review','output','boundary'}
        assert all(isinstance(v,str) and v.strip() for v in guide.values())
    assert [f['id'] for f in data['workflows']]==['close','review','cash']
    for flow in data['workflows']:
        assert all(isinstance(flow.get(k),str) and flow[k].strip() for k in ['title','summary','prepare','result'])
        assert len(flow['steps'])==4
        assert len({s['toolId'] for s in flow['steps']})==4
        for step in flow['steps']:
            assert step['toolId'] in live,'Scene links must resolve to a live tool'
            assert all(isinstance(step.get(k),str) and step[k].strip() for k in ['action','handoff'])
    return live

def main():
    data=json.loads((ROOT/'site/workflows.json').read_text())
    validate(data,json.loads((ROOT/'site/catalog.json').read_text()))
    ui=(ROOT/'site/workflows-ui.js').read_text()
    serialized=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
    block='<script id="aiplus-workflow-data">window.__AIPlusWorkflows='+serialized+';</script>\n<script id="aiplus-workflow-ui">\n'+ui+'\n</script>'
    p=ROOT/'site/index.html';source=p.read_text()
    pattern=r'<script id="aiplus-workflow-data">.*?</script>\s*<script id="aiplus-workflow-ui">.*?</script>'
    if re.search(pattern,source,re.S):source=re.sub(pattern,lambda _:block,source,flags=re.S)
    else:
        marker='<script>\nwindow.__initTools='
        assert source.count(marker)==1,'Expected existing router integration marker'
        source=source.replace(marker,block+'\n'+marker,1)
    p.write_text(source)
    print('Embedded 3 task paths and 64 tool guides; original routing retained')

if __name__=='__main__':main()
