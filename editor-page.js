/* Figma 10254:12730 editing page, sharing the original-coordinate editor transaction. */
let addBoxMode=false;
const gradeSubject=document.createElement('button');gradeSubject.className='editor-grade';gradeSubject.hidden=true;gradeSubject.setAttribute('aria-label','年级与学科');gradeSubject.innerHTML='<span></span><img src="edit-chevron.svg" alt="">';document.querySelector('.student').after(gradeSubject);
const editorActions=document.createElement('div');editorActions.className='editor-page-actions';editorActions.hidden=true;editorActions.innerHTML='<button type="button" class="editor-add" aria-pressed="false"><img src="edit-add.svg" alt="">添加框</button><i class="editor-divider" aria-hidden="true"></i><button type="button" class="btn btn-primary editor-confirm">确定</button>';document.querySelector('.toolbar').append(editorActions);
const grades=['1年级','2年级','3年级','4年级','5年级','6年级','7年级','8年级','9年级','高一','高二','高三'];const subjects=['数学','语文','英语','物理','化学','生物','历史','地理','政治'];
const fieldCascader=document.createElement('div');fieldCascader.id='editorFieldCascader';fieldCascader.className='editor-cascader';fieldCascader.hidden=true;fieldCascader.setAttribute('aria-label','年级与学科级联选择');document.body.append(fieldCascader);
gradeSubject.type='button';gradeSubject.setAttribute('aria-expanded','false');gradeSubject.setAttribute('aria-controls',fieldCascader.id);
let pendingGrade=editorFields.grade;
function closeFieldCascader(returnFocus=false){fieldCascader.hidden=true;gradeSubject.setAttribute('aria-expanded','false');if(returnFocus)gradeSubject.focus()}
function renderFieldCascader(){
 fieldCascader.innerHTML='<div class="cascader-column" role="group" aria-label="年级">'+grades.map(g=>'<button type="button" data-grade="'+g+'" aria-pressed="'+(g===pendingGrade)+'">'+g+'<span aria-hidden="true">›</span></button>').join('')+'</div><div class="cascader-column" role="group" aria-label="学科">'+subjects.map(v=>'<button type="button" data-subject="'+v+'" aria-pressed="'+(pendingGrade===editorFields.grade&&v===editorFields.subject)+'">'+v+'</button>').join('')+'</div>';
}
gradeSubject.onclick=()=>{if(!fieldCascader.hidden){closeFieldCascader();return}pendingGrade=editorFields.grade;renderFieldCascader();const r=gradeSubject.getBoundingClientRect();fieldCascader.style.left=Math.max(8,Math.min(r.left,innerWidth-296))+'px';fieldCascader.style.top=(r.bottom+6)+'px';fieldCascader.style.maxHeight=Math.max(100,innerHeight-r.bottom-14)+'px';fieldCascader.hidden=false;gradeSubject.setAttribute('aria-expanded','true')};
fieldCascader.onclick=e=>{const g=e.target.closest('[data-grade]'),v=e.target.closest('[data-subject]');if(g){pendingGrade=g.dataset.grade;renderFieldCascader();fieldCascader.querySelector('[data-grade="'+pendingGrade+'"]').focus()}else if(v){const value={grade:pendingGrade,subject:v.dataset.subject};if(JSON.stringify(value)!==JSON.stringify(editorFields)){remember();editorFields=value}closeFieldCascader(true);syncEditorPage();draw()}};
document.addEventListener('pointerdown',e=>{if(!fieldCascader.hidden&&!fieldCascader.contains(e.target)&&!gradeSubject.contains(e.target))closeFieldCascader()});
window.addEventListener('resize',()=>closeFieldCascader());
fieldCascader.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();closeFieldCascader(true)}if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const items=[...e.target.closest('.cascader-column').querySelectorAll('button')],i=items.indexOf(e.target);items[(i+(e.key==='ArrowDown'?1:items.length-1))%items.length].focus()}if(e.key==='ArrowRight'&&e.target.dataset.grade){e.preventDefault();pendingGrade=e.target.dataset.grade;renderFieldCascader();fieldCascader.querySelector('[data-subject]').focus()}if(e.key==='ArrowLeft'&&e.target.dataset.subject){e.preventDefault();fieldCascader.querySelector('[data-grade="'+pendingGrade+'"]').focus()}});
function syncEditorPage(){const on=tool==='edit';if(!on)closeFieldCascader();gradeSubject.hidden=!on;editorActions.hidden=!on;gradeSubject.querySelector('span').textContent=editorFields.grade+'/'+editorFields.subject;tools.hidden=!on||!editIds.size;positionEditorTools();document.body.classList.toggle('adding-box',on&&addBoxMode);editorActions.querySelector('.editor-add').setAttribute('aria-pressed',String(addBoxMode));$('back').setAttribute('aria-label',on?'取消编辑并返回':'返回适应整页')}
editorActions.querySelector('.editor-add').onclick=()=>{addBoxMode=!addBoxMode;pendingAddFrame=null;draft=null;editIds.clear();syncEditorPage();draw()};editorActions.querySelector('.editor-confirm').onclick=()=>finishEdit(true);
const previousSetTool=setTool;setTool=function(next){const oldAnchor=anchor();addBoxMode=false;pendingAddFrame=null;previousSetTool(next);syncEditorPage();render(oldAnchor)};
const previousDraw=draw;draw=function(){previousDraw();syncEditorPage()};
$('back').onclick=()=>{if(tool==='edit')finishEdit(false);else{fit=true;render()}};

syncEditorPage();

// Follow the visible selection bounds without scaling menu typography or icons.
document.body.append(tools);
tools.classList.add('frame-editor-menu');
tools.setAttribute('aria-label','编辑题框');
const menuTitle=document.createElement('div');menuTitle.className='frame-menu-title';menuTitle.textContent='编辑题框';
const menuDivider=document.createElement('img');menuDivider.className='frame-menu-divider';menuDivider.src='editor-menu-divider.svg?v=20261028-1180';menuDivider.alt='';
tools.prepend(menuTitle,menuDivider);
const menuSlot=document.createElement("div");menuSlot.className="frame-menu-slot";tools.append(menuSlot);[...tools.querySelectorAll("button[data-action]")].forEach(button=>menuSlot.append(button));
const frameActionIcons={"merge": "<svg class=\"frame-action-icon\" aria-hidden=\"true\" viewBox=\"0 0 24 24\"><path d=\"M8 6h11M8 12h11M8 18h11M4 6h.01M4 12h.01M4 18h.01\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>", "split": "<svg class=\"frame-action-icon\" aria-hidden=\"true\" viewBox=\"0 0 24 24\"><path d=\"M8 3H5a2 2 0 0 0-2 2v3m0 8v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3m0-8V5a2 2 0 0 0-2-2h-3\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>", "delete": "<svg class=\"frame-action-icon\" aria-hidden=\"true\" viewBox=\"0 0 24 24\"><path d=\"M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>"};
for(const action of ["merge","split","delete"]){tools.querySelector("[data-action="+action+"]").innerHTML=(action==='split'?frameActionIcons[action]:'<img src="editor-menu-'+(action==='merge'?'merge':'trash')+'.svg" alt="">')+"<span></span>"}
function positionEditorTools(){
 if(tool!=='edit'||!editIds.size){tools.hidden=true;return}
 const nodes=[...stage.querySelectorAll('.box[data-id]')].filter(n=>editIds.has(+n.dataset.id));
 const view=viewport.getBoundingClientRect(),rects=nodes.map(n=>n.getBoundingClientRect());
 if(!rects.length){tools.hidden=true;return}
 const left=Math.min(...rects.map(r=>r.left)),right=Math.max(...rects.map(r=>r.right)),top=Math.min(...rects.map(r=>r.top)),bottom=Math.max(...rects.map(r=>r.bottom));
 if(right<view.left||left>view.right||bottom<view.top||top>view.bottom){tools.hidden=true;return}
 const selectedBoxes=boxes.filter(b=>editIds.has(b.id)),selectedGroups=new Set(selectedBoxes.map(group));
 const groupCount=boxes.filter(b=>selectedGroups.has(group(b))).length;
 const sameMergedGroup=selectedBoxes.length>1&&selectedGroups.size===1;
 const canMerge=selectedBoxes.length>1&&!sameMergedGroup;
 const canSplit=sameMergedGroup||(selectedBoxes.length===1&&groupCount>1);
 for(const [action,verb,count] of [['merge','合并',groupCount],['split','拆分',groupCount],['delete','删除',selectedBoxes.length]]){
  const button=tools.querySelector('[data-action='+action+']');button.hidden=action==='merge'?!canMerge:action==='split'?!canSplit:false;
  button.querySelector('span').textContent=action==='delete'?'删除 '+count+' 个题框':verb+'题框';
 }
 tools.hidden=false;
 const w=tools.offsetWidth,h=tools.offsetHeight;
 const x=Math.max(view.left+8,Math.min(right-w,view.right-w-8));
 let y=bottom+8;if(y+h>view.bottom-8)y=top-h-8;
 y=Math.max(view.top+8,Math.min(y,view.bottom-h-8));
 Object.assign(tools.style,{left:x+'px',top:y+'px'});
}
viewport.addEventListener('scroll',positionEditorTools,{passive:true});
window.addEventListener('resize',positionEditorTools);
new ResizeObserver(positionEditorTools).observe(viewport);
positionEditorTools();


// Production add-frame flow: draw a local candidate, adjust, cancel or confirm.
function confirmAddFrame(){
 if(!pendingAddFrame)return;
 if(pendingAddFrame.w<30||pendingAddFrame.h<30){notify('题框太小，请重新框选');pendingAddFrame=null;addBoxMode=false;draw();return}
 remember();boxes.push({...pendingAddFrame,id:++serial});pendingAddFrame=null;addBoxMode=false;editIds.clear();draw();
}
function renderAddFrame(){
 stage.querySelectorAll('.add-frame-layer').forEach(n=>n.remove());
 const active=tool==='edit'&&addBoxMode;
 const button=editorActions.querySelector('.editor-add');button.innerHTML='<img src="edit-add.svg" alt="">'+(active?'退出添加':'添加题框');
 editorActions.querySelector('.editor-confirm').disabled=active;
 if(!active){pendingAddFrame=null;return}
 const candidate=draft||pendingAddFrame;
 pageNodes().forEach((node,page)=>{
  const m=pageMeta[page];if(!m)return;
  const layer=document.createElement('div');layer.className='add-frame-layer';
  const local=candidate&&candidate.page===page;
  if(!local)layer.innerHTML='<div class="add-frame-mask add-frame-mask-full"></div>';
  if(!candidate)layer.innerHTML+='<div class="add-frame-placeholder"><i></i><span>框选添加题框</span></div>';
  if(local){
   const x=candidate.x/m.w*100,y=candidate.y/m.h*100,w=candidate.w/m.w*100,h=candidate.h/m.h*100;
   layer.innerHTML='<div class="add-frame-mask" style="left:0;top:0;width:100%;height:'+y+'%"></div><div class="add-frame-mask" style="left:0;top:'+(y+h)+'%;width:100%;height:'+(100-y-h)+'%"></div><div class="add-frame-mask" style="left:0;top:'+y+'%;width:'+x+'%;height:'+h+'%"></div><div class="add-frame-mask" style="left:'+(x+w)+'%;top:'+y+'%;width:'+(100-x-w)+'%;height:'+h+'%"></div>';
   const frame=document.createElement('div');frame.className='add-frame-draft';frame.setAttribute('aria-label','待确认的新题框');Object.assign(frame.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});
   if(!gesture||gesture.kind!=='new-box'){
    frame.innerHTML=['nw','n','ne','e','se','s','sw','w'].map(h=>'<i class="add-frame-handle" data-add-h="'+h+'"></i>').join('')+'<div class="add-frame-actions"><button type="button" data-add-action="cancel" aria-label="取消本次框选"><img src="add-draft-cancel.svg" alt=""></button><button type="button" data-add-action="confirm" aria-label="确认添加题框"><img src="add-draft-confirm.svg" alt=""></button></div>';
    const r=node.getBoundingClientRect(),right=r.left+(x+w)/100*r.width;
    if(right+80>viewport.getBoundingClientRect().right)frame.classList.add('actions-inside');
   }
   layer.append(frame);
  }
  node.append(layer);
 });
}
const syncEditorBeforeAddDraft=syncEditorPage;
syncEditorPage=function(){syncEditorBeforeAddDraft();renderAddFrame()};
viewport.addEventListener('scroll',()=>{if(tool==='edit'&&addBoxMode)renderAddFrame()},{passive:true});
