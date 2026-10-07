/* Task guidance only: names/routes use the live catalog; no business data is read. */
(function(){
'use strict';
var data=window.__AIPlusWorkflows, catalog=window.__AIPlusCatalog;
var tools=Object.fromEntries(catalog.tools.filter(function(t){return t.status==='已上线'}).map(function(t){return[t.id,t]}));
var fields=[['input','准备资料'],['parameters','确认口径'],['review','优先复核'],['output','导出成果'],['boundary','适用边界']];
function esc(value){return String(value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var style=document.createElement('style');style.id='aiplus-workflow-style';style.textContent=
'.wf-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}.wf-card{padding:28px;min-width:0;display:flex;flex-direction:column;gap:16px}.wf-card .btn{align-self:flex-start;margin-top:auto}.wf-list{list-style:none;margin:0;padding:0;display:grid;gap:28px}.wf-step{padding:28px;min-width:0}.wf-title{display:flex;gap:16px;align-items:flex-start}.wf-index{flex:none;width:32px;font-size:24px;color:var(--blue,#1F6FEB)}.wf-fields{margin:20px 0 0;display:grid;grid-template-columns:100px minmax(0,1fr);gap:12px 20px;font-size:14px;line-height:1.7}.wf-fields dt{color:#6F747C}.wf-fields dd{margin:0;overflow-wrap:anywhere}.wf-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}.wf-next{margin-top:24px;padding-top:20px;border-top:1px solid var(--ln);font-size:14px;line-height:1.7;overflow-wrap:anywhere}.wf-guide{margin:0 0 28px;padding:24px;background:var(--tint,#F8F9FB)}.wf-returns{display:flex;flex-wrap:wrap;gap:12px;margin-top:20px}.wf-section{border-top:1px solid var(--ln);padding:56px 0}.wf-note{font-size:14px;line-height:1.7;color:#55595F;overflow-wrap:anywhere}@media(max-width:720px){.wf-grid{grid-template-columns:minmax(0,1fr);gap:16px}.wf-card,.wf-step{padding:20px}.wf-fields{grid-template-columns:minmax(0,1fr);gap:4px}.wf-fields dd{margin-bottom:12px}.wf-section{padding:40px 0}.wf-guide{padding:20px}.wf-actions .btn{max-width:100%;white-space:normal}.wf-title h2{font-size:22px}}';
document.head.appendChild(style);
function guideFields(id){var g=data.guides[id];return '<dl class="wf-fields">'+fields.map(function(f){return '<dt>'+f[1]+'</dt><dd data-guide-field="'+f[0]+'">'+esc(g[f[0]])+'</dd>'}).join('')+'</dl>'}
function cards(){return '<div class="wf-grid">'+data.workflows.map(function(f){return '<article class="card wf-card" data-workflow-card="'+f.id+'"><span class="lab blue">工作路径</span><h3 class="h3">'+esc(f.title)+'</h3><p class="body">'+esc(f.summary)+'</p><a class="btn btn-s btn-sm" href="#workflow-'+f.id+'">查看步骤与工具 →</a></article>'}).join('')+'</div>'}
function entry(title,id){var section=document.createElement('section');section.className='wf-section';section.id=id;section.innerHTML='<div class="wrap stack gap28"><div class="stack gap12"><span class="lab">按场景开始</span><h2 class="h2">'+title+'</h2><p class="body">选择这次要完成的任务，按步骤准备资料、核对结果并整理交接。</p></div>'+cards()+'</div>';return section}
var home=document.getElementById('r-home').content;
home.querySelector('section').insertAdjacentElement('afterend',entry('今天要完成哪项财务工作？','task-paths'));
var primary=home.querySelector('a[href="#tools"].btn');
var taskLink=document.createElement('a');taskLink.href='#home~task-paths';taskLink.className='btn btn-s';taskLink.textContent='按场景开始';primary.insertAdjacentElement('afterend',taskLink);
document.getElementById('r-tools').content.querySelector('section').insertAdjacentElement('afterend',entry('先选任务，再找工具','tool-task-paths'));
data.workflows.forEach(function(flow){
 var template=document.createElement('template');template.id='r-workflow-'+flow.id;
 template.innerHTML='<section class="sec" style="padding:40px 0 56px"><div class="wrap stack gap24"><nav aria-label="面包屑" class="row gap8 small"><a href="#home">首页</a><span>/</span><a href="#tools">工具库</a><span>/</span><span>'+esc(flow.title)+'</span></nav><span class="lab blue">按场景开始</span><h1 class="h1">'+esc(flow.title)+'</h1><p class="lead" style="max-width:820px">'+esc(flow.summary)+'</p><div class="card stack gap12" style="padding:24px"><h2 class="h3">开始前准备</h2><p class="body">'+esc(flow.prepare)+'</p><p class="wf-note" data-workflow-boundary>各工具独立运行。跨工具使用时，请先导出并复核，再按下一款模板整理资料；原始文件和来源依据一起保留。退出前主动下载底稿和需要的恢复文件。</p></div><div class="row gap12" style="flex-wrap:wrap"><button type="button" class="btn btn-s btn-sm" data-workflow-download="'+flow.id+'">下载本场景操作指引</button><span class="small">仅含步骤和口径提示，不含业务数据。</span></div></div></section><section class="sec" style="padding:0 0 72px"><div class="wrap"><ol class="wf-list">'+flow.steps.map(function(step,i){var t=tools[step.toolId];return '<li class="card wf-step" data-workflow-step data-tool-id="'+t.id+'"><div class="wf-title"><span class="num wf-index" aria-hidden="true">'+String(i+1).padStart(2,'0')+'</span><div class="stack gap8"><span class="lab">'+esc(step.action)+'</span><h2 class="h3">'+esc(t.name)+'</h2></div></div>'+guideFields(t.id)+'<div class="wf-next"><strong>完成后怎么衔接</strong><p style="margin:8px 0 0">'+esc(step.handoff)+'</p></div><div class="wf-actions"><a href="#'+esc(t.workspaceRoute)+'" class="btn btn-p btn-sm" data-step-start>打开'+esc(t.name)+'</a><a href="#'+esc(t.detailRoute)+'" class="btn btn-s btn-sm" data-step-detail>查看说明与下载</a></div></li>'}).join('')+'</ol><div class="wf-guide stack gap12" style="margin-top:28px"><h2 class="h3">最后整理与交接</h2><p class="body">'+esc(flow.result)+'</p><p class="wf-note">交接时列明主体、期间、币种、单位、输入版本、所用参数、异常处理与复核人；计算结果与人工判断分开记录。</p><a href="#tools" class="tl" style="align-self:flex-start">返回全部工具 →</a></div></div></section>';
 document.body.appendChild(template);
});
Object.keys(tools).forEach(function(id){
 var t=tools[id],template=document.getElementById('r-'+t.detailRoute);if(!template)return;
 var overview=template.content.querySelector('#overview');if(!overview)return;
 var guide=document.createElement('section');guide.className='wf-guide';guide.setAttribute('data-quick-start',id);
 var related=data.workflows.filter(function(f){return f.steps.some(function(s){return s.toolId===id})});
 guide.innerHTML='<h2 class="h3">快速使用指引</h2><p class="wf-note" style="margin:12px 0 0">先用虚构样例熟悉操作，再按本款模板整理自己的资料。确认主体、期间、币种与单位后计算；复核异常及来源，再导出底稿。</p>'+guideFields(id)+(related.length?'<div class="wf-returns">'+related.map(function(f){return '<a class="tl" href="#workflow-'+f.id+'" data-workflow-return="'+f.id+'">查看「'+esc(f.title)+'」完整路径 →</a>'}).join('')+'</div>':'');
 overview.insertAdjacentElement('beforebegin',guide);
});
function markdown(flow){
 var lines=['# '+flow.title,'','schema_version: 1','contains_data: false','guidance_version: '+data.version,'','本文件仅含操作指引，不保存业务数据或工作进度。','','## 开始前准备',flow.prepare,'','各工具独立运行。先导出并复核，再按下一款模板整理资料。退出前主动下载底稿和需要的恢复文件。'];
 flow.steps.forEach(function(s,i){var t=tools[s.toolId];lines.push('','## '+(i+1)+'. '+s.action+' · '+t.name+' ('+t.id+')');fields.forEach(function(f){lines.push('- '+f[1]+'：'+data.guides[t.id][f[0]])});lines.push('','完成后怎么衔接：'+s.handoff)});
 lines.push('','## 最后整理与交接',flow.result,'','记录主体、期间、币种、单位、输入版本、所用参数、异常处理与复核人；计算结果与人工判断分开记录。');return lines.join('\n')+'\n';
}
document.addEventListener('click',function(e){
 var button=e.target.closest('[data-workflow-download]');if(!button)return;
 var flow=data.workflows.find(function(f){return f.id===button.dataset.workflowDownload});if(!flow)return;
 var url=URL.createObjectURL(new Blob([markdown(flow)],{type:'text/markdown;charset=utf-8'}));
 var a=document.createElement('a');a.href=url;a.download=flow.title+'-操作指引.md';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},1000);
});
})();
