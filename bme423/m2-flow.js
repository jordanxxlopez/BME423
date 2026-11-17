'use strict';
// Easier movement inside MODULE II. Nothing existing is removed.
// 1. A bar at the top of MODULE II pages: ‹ previous · a dropdown of everything in the section · next ›
//    on method guides, worked examples, practice problems and the individual collections.
// 2. "Open on this page" mode (the default, switchable in the bar): buttons that used to jump to another
//    page (Explanation + equations + full work, Worked example, Try a problem, Worked solution, Try it first)
//    now open their content right under the button. "Open as its own page" is still offered in each panel.
(function(){
 if(typeof M2==='undefined')return;
 const KEY='m2-flow-inline';
 const inlineOn=()=>{try{return localStorage.getItem(KEY)!=='0'}catch(e){return true}};
 const setInline=v=>{try{localStorage.setItem(KEY,v?'1':'0')}catch(e){}};
 const isM2=()=>String(view).startsWith('m2')||(view==='module'&&Number(selectedModule)>=17);
 const pageKey=()=>[view,selectedModule,view==='m2method'?m2Method:'',view==='m2worked'||view==='m2practice'?m2Case:''].join('|');
 const sessionOf=m=>m.module||17;
 const sessions=()=>[...new Set(M2.modules.map(m=>m.id))].sort((a,b)=>a-b);
 const sessionTitle=n=>{const m=M2.modules.find(x=>x.id===n);return `Session ${n}${m?' · '+m.title:''}`};

 // ---------- switcher bar ----------
 function picker(label,items,current,attr){
  const i=items.findIndex(x=>x.id===current);
  const prev=i>0?items[i-1]:null,next=i>=0&&i<items.length-1?items[i+1]:null;
  const groups=[...new Set(items.map(x=>x.group))];
  const opts=groups.map(g=>{const inner=items.filter(x=>x.group===g).map(x=>`<option value="${esc(String(x.id))}" ${x.id===current?'selected':''}>${esc(x.label)}</option>`).join('');return g?`<optgroup label="${esc(g)}">${inner}</optgroup>`:inner}).join('');
  return `<div class="m2f-switch"><button class="m2f-arrow" ${prev?`data-m2f-go="${attr}:${esc(String(prev.id))}" title="${esc(prev.label)}"`:'disabled'} aria-label="Previous ${label}">‹</button><select data-m2f-select="${attr}" aria-label="Choose a ${label}">${opts}</select><button class="m2f-arrow" ${next?`data-m2f-go="${attr}:${esc(String(next.id))}" title="${esc(next.label)}"`:'disabled'} aria-label="Next ${label}">›</button><span class="m2f-count small muted">${i+1} of ${items.length}</span></div>`}
 function casePool(){return M2.cases.filter(c=>m2Topic==='all'||c.topic===m2Topic)}
 function switcher(){
  if(view==='m2method'){
   const items=[...M2.methods].sort((a,b)=>sessionOf(a)-sessionOf(b)).map(m=>({id:m.id,label:m.title,group:`Session ${sessionOf(m)}`}));
   return picker('method',items,m2Method,'method')}
  if(view==='m2worked'||view==='m2practice'){
   const items=casePool().map(c=>({id:c.id,label:c.title+(c.neuro?' · neuroscience':c.coursePractice?' · more practice':''),group:`Session ${c.module||17}`}));
   return picker('problem',items,m2Case,'case')}
  if(view==='module'&&Number(selectedModule)>=17){
   const items=sessions().map(n=>({id:n,label:sessionTitle(n),group:''}));
   return picker('session',items,Number(selectedModule),'session')}
  return ''}
 function bar(){
  const on=inlineOn();
  return `<div class="m2f-bar" role="navigation" aria-label="Move within this section">${switcher()}<div class="m2f-mode"><span class="small muted">Open things</span><div class="m2f-seg" role="group" aria-label="Where to open methods and problems"><button class="${on?'active':''}" aria-pressed="${on}" data-m2f-mode="1">On this page</button><button class="${on?'':'active'}" aria-pressed="${!on}" data-m2f-mode="0">On their own page</button></div></div></div>`}

 // ---------- open in place ----------
 const open=[];let openPage='';
 const KIND={m2Method:'method',m2Case:'worked',m2Practice:'practice'};
 function target(b){for(const k of Object.keys(KIND))if(b.dataset[k])return {kind:KIND[k],attr:k,id:b.dataset[k]};return null}
 const attrName=k=>'data-'+k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
 function panelHTML(p){
  let title='',html='';
  if(p.kind==='method'){const m=m2Methods.get(p.id);if(!m)return '';const keep=m2Method;m2Method=p.id;try{html=m2MethodScreen()}finally{m2Method=keep}title=m.title}
  else{const c=m2Cases.get(p.id);if(!c)return '';html=m2CaseHTML(c,p.kind==='worked');title=(p.kind==='worked'?'Worked solution · ':'Try it first · ')+c.title}
  return `<section class="m2f-panel" data-m2f-key="${esc(p.key)}"><div class="m2f-head"><strong>${esc(title)}</strong><span class="m2f-headbtns"><button data-m2f-full="${esc(p.key)}">Open as its own page</button><button data-m2f-close="${esc(p.key)}" aria-label="Close">Close ✕</button></span></div>${html}</section>`}
 function anchorFor(p){const all=[...document.querySelectorAll(`#content [${attrName(p.attr)}="${CSS.escape(p.id)}"]`)].filter(b=>!b.closest('.m2f-panel'));return all[p.idx]||all[0]||null}
 function place(p){
  const b=anchorFor(p);if(!b)return false;
  const host=b.closest('li')||b.closest('.row')||b.closest('.card')||b.parentElement;
  const wrap=document.createElement('div');wrap.innerHTML=panelHTML(p);const el=wrap.firstElementChild;if(!el)return false;
  if(host.tagName==='LI'||host.classList.contains('card')){host.appendChild(el);host.classList.add('m2f-host')}else host.insertAdjacentElement('afterend',el);
  b.classList.add('m2f-opened');b.setAttribute('aria-expanded','true');return true}
 function finish(){if(typeof typesetContent==='function')typesetContent();if(typeof sizeNote==='function')document.querySelectorAll('#content [data-note]').forEach(sizeNote)}
 function restore(){if(openPage!==pageKey()){open.length=0;openPage=pageKey();return}let any=false;for(const p of open)any=place(p)||any;if(any)finish()}

 document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.m2fMode!==undefined){e.stopImmediatePropagation();setInline(b.dataset.m2fMode==='1');render();return}
  if(b.dataset.m2fGo){e.stopImmediatePropagation();const [kind,...rest]=b.dataset.m2fGo.split(':');jump(kind,rest.join(':'));return}
  if(b.dataset.m2fClose){e.stopImmediatePropagation();const i=open.findIndex(p=>p.key===b.dataset.m2fClose);const p=open[i];if(i>=0)open.splice(i,1);
   const el=document.querySelector(`.m2f-panel[data-m2f-key="${CSS.escape(b.dataset.m2fClose)}"]`);if(el){const h=el.parentElement;el.remove();if(h&&!h.querySelector('.m2f-panel'))h.classList.remove('m2f-host')}if(p){const a=anchorFor(p);if(a){a.classList.remove('m2f-opened');a.removeAttribute('aria-expanded');a.scrollIntoView({block:'nearest'})}}return}
  if(b.dataset.m2fFull){e.stopImmediatePropagation();const p=open.find(x=>x.key===b.dataset.m2fFull);if(!p)return;open.length=0;
   if(p.kind==='method'){m2Method=p.id;go('m2method')}else{m2Case=p.id;m2Topic='all';go(p.kind==='worked'?'m2worked':'m2practice')}return}
  if(!inlineOn()||!isM2()||b.closest('.m2f-bar'))return;
  const t=target(b);if(!t)return;
  // On a method page its own method stays put; on a problem page the problem buttons keep their meaning.
  if(t.kind==='method'&&view==='m2method'&&t.id===m2Method)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(openPage!==pageKey()){open.length=0;openPage=pageKey()}
  const same=[...document.querySelectorAll(`#content [${attrName(t.attr)}="${CSS.escape(t.id)}"]`)].filter(x=>!x.closest('.m2f-panel'));
  const idx=Math.max(0,same.indexOf(b)),key=`${t.kind}:${t.id}:${idx}`;
  const have=open.findIndex(p=>p.key===key);
  if(have>=0){const el=document.querySelector(`.m2f-panel[data-m2f-key="${CSS.escape(key)}"]`);if(el){el.scrollIntoView({behavior:'smooth',block:'start'});return}open.splice(have,1)}
  const p={...t,idx,key};open.push(p);
  if(place(p)){finish();const el=document.querySelector(`.m2f-panel[data-m2f-key="${CSS.escape(key)}"]`);if(el)el.scrollIntoView({behavior:'smooth',block:'start'})}
 },true);

 function jump(kind,id){
  if(kind==='method'){m2Method=id;go('m2method')}
  else if(kind==='case'){m2Case=id;render();const h=document.querySelector('#content h1');if(h)window.scrollTo(0,0)}
  else if(kind==='session'){selectedModule=Number(id);go('module')}}
 document.addEventListener('change',e=>{const s=e.target.closest('[data-m2f-select]');if(!s)return;e.stopImmediatePropagation();jump(s.dataset.m2fSelect,s.value)},true);

 // ---------- hook into rendering ----------
 const prevRender=render;
 render=function(){
  prevRender();
  if(!isM2())return;
  const c=document.querySelector('#content');if(!c)return;
  if(!c.querySelector(':scope > .m2f-bar'))c.insertAdjacentHTML('afterbegin',bar());
  restore()};
 if(isM2())render();
})();
