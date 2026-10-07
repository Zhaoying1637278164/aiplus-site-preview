import copy,json,pathlib,unittest
from check_catalog import validate
ROOT=pathlib.Path(__file__).resolve().parents[1]
class CatalogGuards(unittest.TestCase):
 def setUp(self):
  self.c=json.loads((ROOT/'site/catalog.json').read_text());self.s=(ROOT/'site/index.html').read_text();self.r=json.loads((ROOT/'site/registry.json').read_text())
 def reject(self,mutate):
  mutate(self.c)
  with self.assertRaises(ValueError):validate(self.c,self.s,self.r)
 def test_valid(self):self.assertEqual(validate(self.c,self.s,self.r)['live'],len(self.r))
 def test_duplicate_id(self):self.reject(lambda c:c['tools'][1].update(id=c['tools'][0]['id']))
 def test_duplicate_name(self):self.reject(lambda c:c['tools'][1].update(name=c['tools'][0]['name']))
 def test_wrong_prefix(self):self.reject(lambda c:c['tools'][0].update(module='U' if c['tools'][0]['module']!='U' else 'R'))
 def test_multiple_modules(self):self.reject(lambda c:c['tools'][0].update(module=['R','U']))
 def test_multiple_types(self):self.reject(lambda c:c['tools'][0].update(kind=['分析看板','单点工具']))
 def test_missing_status(self):self.reject(lambda c:c['tools'][0].pop('status'))
 def test_wrong_status(self):self.reject(lambda c:c['tools'][0].update(status='即将上线'))
 def test_hardcoded_old_total(self):
  with self.assertRaises(ValueError):validate(self.c,self.s+'<p>113 个工具</p>',self.r)
 def test_hardcoded_new_total(self):
  with self.assertRaises(ValueError):validate(self.c,self.s+'<p>64 个工具</p>',self.r)
 def test_unregistered_runtime(self):self.reject(lambda c:c['tools'].pop(0))
if __name__=='__main__':unittest.main()
