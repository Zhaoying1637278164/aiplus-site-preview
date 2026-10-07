const {chromium}=require(process.env.AIPLUS_PLAYWRIGHT_MODULE||'playwright');
const fs=require('fs'), path=require('path'), assert=require('assert/strict');
const root=path.resolve(__dirname,'../..');
const out=process.env.AIPLUS_WORKFLOW_EVIDENCE||'/private/tmp/aiplus-workflows-check';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Users/xiaoying/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000},offline:!process.env.AIPLUS_WORKFLOW_URL}); const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.AIPLUS_WORKFLOW_URL||'file://'+root+'/site/index.html');
 let p=page;
 if(process.env.AIPLUS_WORKFLOW_URL){
  for(let i=0;i<100;i++){
   for(const f of page.frames())if(await f.locator('#r-home').count()){p=f;break;}
   if(p!==page)break;await page.waitForTimeout(300);
  }
  assert.notEqual(p,page,'Website frame missing');
  const frame=await p.frameElement();
  const source=(await frame.getAttribute('srcdoc')).replace(/<script>window\.__AIPlusAssetPrefix=[\s\S]*?<\/script>/,'').replace(/<script>window\.__AIPlusInitialRoute=[\s\S]*?<\/script>/,'');
  assert.equal(source,fs.readFileSync(root+'/site/index.html','utf8'),'Deployed source differs');
 }
 assert.equal(await p.locator('#app [data-workflow-card]').count(),3,'Home must offer three task paths');
 await p.locator('#app [data-workflow-card]').first().scrollIntoViewIfNeeded();
 await page.screenshot({path:out+'/home-desktop.png'});
 const flows=[['close','完成本月结账',['C01','C04','C06','F03']],['review','准备经营分析会',['B02','M02','M01','M05']],['cash','安排未来资金',['R04','P02','T04','T03']]];
 const catalog=JSON.parse(fs.readFileSync(root+'/site/catalog.json','utf8'));
 const verified=[],launches=[];
 for(const [id,title,ids]of flows){
  await p.locator('#app [data-workflow-card="'+id+'"] a').click();
  assert.equal(await p.locator('#app h1').innerText(),title);
  assert.deepEqual(await p.locator('#app [data-workflow-step]').evaluateAll(es=>es.map(e=>e.dataset.toolId)),ids);
  assert((await p.locator('#app [data-workflow-boundary]').innerText()).includes('按下一款模板整理'));
  if(id==='cash')assert((await p.locator('#app').innerText()).includes('逾期应收不能直接作为预计收款'));
  if(id==='review')assert((await p.locator('#app').innerText()).includes('数学分解不代表业务因果'));
  const download=page.waitForEvent('download');
  await p.locator('#app [data-workflow-download]').click();
  const file=await download;assert.equal(await file.failure(),null);
  const saved=out+'/'+file.suggestedFilename();await file.saveAs(saved);
  const guide=fs.readFileSync(saved,'utf8');assert(guide.includes('schema_version: 1'));assert(guide.includes('contains_data: false'));
  for(const toolId of ids)assert(guide.includes(catalog.tools.find(t=>t.id===toolId).name));
  assert(!guide.includes('undefined'));
  await page.screenshot({path:out+'/'+id+'-desktop.png',fullPage:true});
  for(const toolId of ids){
   await p.locator('#app [data-tool-id="'+toolId+'"] [data-step-detail]').click();
   assert.equal(await p.locator('#app h1').innerText(),catalog.tools.find(t=>t.id===toolId).name);
   assert.equal(await p.locator('#app [data-quick-start]').count(),1);
   assert.equal(await p.locator('#app [data-quick-start] [data-guide-field]').count(),5);
   if(toolId===ids[0]){
    await page.setViewportSize({width:320,height:740});
    await p.locator('#app [data-quick-start]').scrollIntoViewIfNeeded();
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile quick-start overflow');
    await page.screenshot({path:out+'/'+toolId+'-guide-mobile.png'});
    await page.setViewportSize({width:1440,height:1000});
   }
   await p.locator('#app [data-workflow-return="'+id+'"]').click();
  }
  await page.setViewportSize({width:320,height:740});
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile workflow overflow');
  for(const toolId of ids){
   const a=p.locator('#app [data-tool-id="'+toolId+'"] [data-step-start]');
   await a.scrollIntoViewIfNeeded();assert(await a.isVisible());
   const box=await a.boundingBox();assert(box.x>=0&&box.x+box.width<=320,'Start action exceeds mobile width');
  }
  await p.locator('#app h1').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/'+id+'-mobile.png',fullPage:true});
  await page.screenshot({path:out+'/'+id+'-mobile-top.png'});
  await p.locator('#app [data-workflow-step]').first().scrollIntoViewIfNeeded();
  await page.screenshot({path:out+'/'+id+'-mobile-step.png'});
  await page.setViewportSize({width:1440,height:1000});
  await p.locator('#app a[href="#home"]').first().click();verified.push({id,steps:ids,download:true,mobile320:true});
 }
 await p.locator('#app a[href="#tools"]').first().click();
 assert.equal(await p.locator('#tool-list [data-tool]').count(),64);
 assert.equal(await p.locator('#app [data-workflow-card]').count(),3);
 for(const t of catalog.tools.filter(t=>t.status==='已上线')){
  await p.locator('#tool-list [data-id="'+t.id+'"] a').first().click();
  assert.equal(await p.locator('#app [data-quick-start]').count(),1);
  assert(!(await p.locator('#app [data-quick-start]').innerText()).includes('undefined'));
  await p.locator('nav[aria-label="面包屑"] a[href="#tools"]').click();
 }
 // In the deployed shell, use every scene action and verify only the selected tool loads.
 if(process.env.AIPLUS_WORKFLOW_URL){
  for(const [id,,ids]of flows)for(const toolId of ids){
   await p.locator('#app [data-workflow-card="'+id+'"] a').click();
   const runtimeResponse=page.waitForResponse(r=>r.url().includes('/tools/'+toolId+'/')&&r.url().endsWith('/runtime.json'));
   await p.locator('#app [data-tool-id="'+toolId+'"] [data-step-start]').click();
   const response=await runtimeResponse;assert(response.ok());const runtime=await response.json();
   assert.equal(runtime.id,toolId);assert.equal(runtime.name,catalog.tools.find(t=>t.id===toolId).name);
   const host=p.locator('#tool-workspace');
   await host.locator('h1').waitFor({timeout:30000});
   const heading=await host.locator('h1').innerText();assert(heading.trim());
   assert.equal(await host.evaluate(e=>e.children.length),1);
   assert.equal(await host.locator('[role="alert"]').count(),0);
   launches.push({id:runtime.id,name:runtime.name,version:runtime.version,heading,rendered:true});
   // No data has been loaded, so navigate through the original site exit policy.
   page.once('dialog',d=>d.accept());
   await p.locator('nav[aria-label="面包屑"] a[href="#tools"]').click();
  }
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(out+'/result.json',JSON.stringify({passed:true,flows:verified,quickStarts:64,toolLaunches:launches.length,launches,pageErrors:errors},null,2));
 console.log('Workflow and 64 quick-start browser checks passed');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
