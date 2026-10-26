/* Contextual keyboard help anchored to the paper canvas, outside its scrollable content. */
const keyboardHelp=document.createElement('aside');keyboardHelp.className='keyboard-help';keyboardHelp.innerHTML=`
<section class="keyboard-help-card" id="keyboardHelpCard" aria-labelledby="keyboardHelpTitle" hidden>
<h3 id="keyboardHelpTitle"><span class="mark-only">标记快捷操作</span><span class="edit-only">题框快捷操作</span></h3>
<div class="keyboard-help-row mark-only"><kbd>拖动框选</kbd><div><strong>批量操作标记</strong><p>从空白处拖动跨题框选，拖动选区移动、拖四角缩放，Delete 删除。</p></div></div>
<div class="keyboard-help-row"><kbd>Shift + 滚轮</kbd><div><strong>缩放试卷</strong><p>按住 Shift 滚动，以鼠标位置缩放试卷。</p></div></div>
<div class="keyboard-help-row mark-only"><kbd>↑ ↓ ← →</kbd><div><strong>移动标记</strong><p>选中标记后，可通过键盘上、下、左、右方向键移动。</p></div></div>
<div class="keyboard-help-row mark-only"><kbd>Shift + 方向键</kbd><div><strong>快速移动标记</strong><p>选中标记后，按 Shift + 方向键，每次移动 10 像素。</p></div></div>
<div class="keyboard-help-row"><kbd>Delete</kbd><div><strong>删除<span class="mark-only">标记</span><span class="edit-only">题框</span></strong><p><span class="mark-only">选中标记后，按 Delete 删除当前标记。</span><span class="edit-only">选中题框后，按 Delete 删除当前题框。</span></p></div></div>
</section>
<button class="keyboard-help-trigger" type="button" aria-label="快捷操作提示" aria-controls="keyboardHelpCard" aria-expanded="false"><span aria-hidden="true">i</span></button>`;
document.querySelector('.canvas-shell').append(keyboardHelp);
const keyboardHelpButton=keyboardHelp.querySelector('button'),keyboardHelpCard=keyboardHelp.querySelector('section');let keyboardHelpPinned=false;
function showKeyboardHelp(open){keyboardHelpCard.hidden=!open;keyboardHelpButton.setAttribute('aria-expanded',String(open))}
keyboardHelp.addEventListener('pointerenter',()=>showKeyboardHelp(true));keyboardHelp.addEventListener('pointerleave',()=>{if(!keyboardHelpPinned&&!keyboardHelp.contains(document.activeElement))showKeyboardHelp(false)});
keyboardHelpButton.onclick=()=>{keyboardHelpPinned=!keyboardHelpPinned;showKeyboardHelp(keyboardHelpPinned)};
keyboardHelp.addEventListener('focusin',()=>showKeyboardHelp(true));keyboardHelp.addEventListener('focusout',e=>{if(!keyboardHelpPinned&&!keyboardHelp.contains(e.relatedTarget))showKeyboardHelp(false)});
keyboardHelp.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();keyboardHelpPinned=false;showKeyboardHelp(false)}});
document.addEventListener('pointerdown',e=>{if(!keyboardHelp.contains(e.target)){keyboardHelpPinned=false;showKeyboardHelp(false)}});
