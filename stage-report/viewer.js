'use strict';
const report=document.querySelector('.report');
let activeReport='diagnosis';
let fields=[...document.querySelector('#panel-diagnosis').querySelectorAll('p[data-node-id]')];
const status=document.querySelector('#status');
let initial=Object.fromEntries(fields.map(p=>[p.dataset.nodeId,p.textContent.replace(/\s+/g,' ').trim()]));
const tabs=[...document.querySelectorAll('[role=tab]')];
function switchReport(key){
 if(key===activeReport)return;
 activeReport=key;
 document.querySelectorAll('.report-panel').forEach(p=>p.hidden=p.id!=='panel-'+key);
 tabs.forEach(t=>{const active=t.dataset.report===key;t.classList.toggle('active',active);t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;});
 const panel=document.querySelector('#panel-'+key);
 fields=[...panel.querySelectorAll('p[data-node-id]')];
 initial=Object.fromEntries(fields.map(p=>[p.dataset.nodeId,p.textContent.replace(/\s+/g,' ').trim()]));
 fields.forEach(p=>p.contentEditable=String(editing));
 document.querySelectorAll('.page-nav a').forEach((a,i)=>a.href='#'+(key==='diagnosis'?'page-':'effect-page-')+(i+1));
 history.replaceState(null,'',location.pathname+location.search);
 window.scrollTo({top:0,behavior:'instant'});
 status.textContent='Figma 示例内容 · 图表与统计为静态示例';
}
tabs.forEach((tab,i)=>{
 tab.onclick=()=>switchReport(tab.dataset.report);
 tab.onkeydown=e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;else if(e.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();tabs[next].focus();switchReport(tabs[next].dataset.report);};
});
let editing=false;
function fit(){document.documentElement.style.setProperty('--report-scale',Math.min(.32,Math.max(.1,(innerWidth-48)/2480)));}
fit();addEventListener('resize',fit);
function checkOverflow(){
 const overflowing=[...document.querySelectorAll('.report-panel:not([hidden]) .page-slot')].filter(slot=>{
  const boundary=slot.getBoundingClientRect();
  return [...slot.querySelectorAll('p')].some(p=>{const r=p.getBoundingClientRect();return r.bottom>boundary.bottom-12||r.right>boundary.right-12;});
 });
 status.textContent=overflowing.length?'内容可能超出纸张边界，请缩短文字后再打印。':'Figma 示例内容 · 修改文字不会重算图表与统计 · 编辑后请导出数据保存';
}
document.querySelector('#edit').onclick=()=>{
 editing=!editing;fields.forEach(p=>p.contentEditable=String(editing));
 document.querySelector('#edit').textContent=editing?'完成编辑':'编辑内容';
 document.querySelector('#edit').setAttribute('aria-pressed',String(editing));
 checkOverflow();
};
report.addEventListener('paste',e=>{if(e.target.isContentEditable){e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'));}});
report.addEventListener('input',checkOverflow);
function currentData(){return {schemaVersion:1,template:'stage-report-'+activeReport,fields:Object.fromEntries(fields.map(p=>[p.dataset.nodeId,p.textContent.trim()]))};}
document.querySelector('#save').onclick=()=>{
 const url=URL.createObjectURL(new Blob([JSON.stringify(currentData(),null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='阶段学情报告数据.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
document.querySelector('#load').onclick=()=>document.querySelector('#file').click();
document.querySelector('#file').onchange=async e=>{
 const f=e.target.files[0];if(!f)return;
 try{
  if(f.size>1024*1024)throw Error('文件不能超过 1MB');
  const data=JSON.parse(await f.text());
  if(data.schemaVersion!==1||data.template!=='stage-report-'+activeReport||!data.fields||typeof data.fields!=='object'||Array.isArray(data.fields))throw Error('不是当前报告版本的数据');
  const entries=Object.entries(data.fields);
  if(!entries.length||entries.some(([id,v])=>!Object.hasOwn(initial,id)||typeof v!=='string'||v.length>5000))throw Error('存在未知字段或无效文字');
  fields.forEach(p=>{
   if(!Object.hasOwn(data.fields,p.dataset.nodeId))return;
   const text=data.fields[p.dataset.nodeId];
   // Some Figma paragraphs use a zero-size parent with styled inline spans.
   // Keep the inline typography when replacing their text.
   const span=p.querySelector('span');
   if(span){const styled=span.cloneNode(false);styled.textContent=text;p.replaceChildren(styled);}
   else p.textContent=text;
  });
  checkOverflow();
 }catch(err){status.textContent='导入失败：'+err.message;}finally{e.target.value='';}
};
document.querySelector('#print').onclick=()=>{checkOverflow();window.print();};
window.getReportData=currentData;
