'use strict';
// Step-by-step animations for MODULE II (videos rendered by authoring/videos with Remotion).
// Adds them to the workspace, every individual collection, method guides and worked cases.
// Each step chip plays only that step's segment and stops at its end.
const M2V=Object.assign({videos:{},byMethod:{},boardByMethod:{},boardByCase:{}},typeof BME_M2_VIDEOS!=='undefined'?BME_M2_VIDEOS:{});
let m2vSeq=0;
function m2vFor(method){return (M2V.byMethod[method]||[]).map(id=>M2V.videos[id]).filter(Boolean)}
// Second explanation: the "worked on the board" videos, one per worked case.
function m2vBoards(method){return (M2V.boardByMethod[method]||[]).map(id=>M2V.videos[id]).filter(Boolean)}
function m2vBoardFor(caseId){return M2V.videos[M2V.boardByCase[caseId]]||null}
function m2vPref(){try{return localStorage.getItem('m2v-explanation')==='1'?1:0}catch(e){return 0}}
// Two explanations of the same idea side by side as tabs. The last tab chosen is remembered.
function m2vTabs(a,b){if(!b)return a;if(!a)return b;const id='m2vt-'+(++m2vSeq),k=m2vPref();
 return `<div class="m2v-tabs" id="${id}"><div class="m2v-tabbar" role="tablist"><button role="tab" class="m2v-tab${k?'':' active'}" aria-selected="${!k}" data-m2v-tab="${id}:0">Animation</button><button role="tab" class="m2v-tab${k?' active':''}" aria-selected="${!!k}" data-m2v-tab="${id}:1">Worked on the board</button><span class="small muted m2v-tabhint">Two ways to see the same method. If one does not click, try the other.</span></div><div class="m2v-pane" data-pane="0"${k?' hidden':''}>${a}</div><div class="m2v-pane" data-pane="1"${k?'':' hidden'}>${b}</div></div>`}
function m2vBoardList(vs,{first=0}={}){if(!vs.length)return '';return vs.map((v,i)=>m2vPlayer(v,{lazy:i!==first||first<0})).join('')}
function m2vClock(t){const s=Math.round(t);return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`}
// Full player: video plus one chip per step. `lazy` shows a poster button until clicked.
function m2vPlayer(v,{lazy=false,heading=true}={}){const id=`m2v-${v.id}-${++m2vSeq}`;
 const chips=v.steps.map(s=>`<button class="m2v-chip" data-m2v-play="${id}:${s.step}" title="${esc(s.title)} · ${m2vClock(s.start)}–${m2vClock(s.end)}"><span>${s.step}</span>${esc(s.title)}</button>`).join('');
 const media=lazy?`<button class="m2v-poster" data-m2v-load="${id}" data-m2v-src="${esc(v.file)}" aria-label="Load the animation ${esc(v.title)}"><img src="${esc(v.poster)}" alt="" loading="lazy"><span class="m2v-playicon">▶</span></button>`
  :`<video id="${id}" class="m2v-video" src="${esc(v.file)}" poster="${esc(v.poster)}" preload="metadata" playsinline muted></video>`;
 return `<figure class="m2v" data-m2v-id="${esc(v.id)}" data-m2v-box="${id}">${heading?`<figcaption><span class="tag">${v.kind==='board'?'WORKED ON THE BOARD':'ANIMATION'} · SESSION ${v.session}</span> <strong>${esc(v.title)}</strong> <span class="small muted">${m2vClock(v.duration)} · ${v.steps.length} steps · tap a step to watch only that part</span></figcaption>`:''}<div class="m2v-frame" id="${id}-frame">${media}</div><div class="m2v-bar"><button class="m2v-toggle" data-m2v-toggle="${id}" aria-label="Play or pause">▶</button><button data-m2v-nav="${id}:-1" aria-label="Previous step">‹ step</button><input type="range" class="m2v-seek" data-m2v-seek="${id}" min="0" max="${v.duration}" step="0.1" value="0" aria-label="Position in the animation"><button data-m2v-nav="${id}:1" aria-label="Next step">step ›</button><span class="m2v-time" id="${id}-time">0:00 / ${m2vClock(v.duration)}</span></div><div class="m2v-chips">${chips}</div></figure>`}
function m2vVideoEl(id){let v=document.getElementById(id);if(v)return v;const b=document.querySelector(`[data-m2v-load="${id}"]`);if(!b)return null;
 v=document.createElement('video');v.id=id;v.className='m2v-video';v.src=b.dataset.m2vSrc;v.controls=false;v.playsInline=true;v.muted=true;v.preload='metadata';b.replaceWith(v);return v}
function m2vPlayStep(id,step){const box=document.querySelector(`[data-m2v-box="${id}"]`);const meta=M2V.videos[box?.dataset.m2vId];const v=m2vVideoEl(id);if(!v||!meta)return;
 const s=meta.steps[step-1];v._m2vEnd=s.end;box.querySelectorAll('.m2v-chip').forEach(c=>c.classList.toggle('active',c.dataset.m2vPlay===`${id}:${step}`));
 const go=()=>{v.currentTime=s.start+0.02;const p=v.play();if(p)p.catch(err=>console.warn('m2v play',err.message))};if(v.readyState>=1)go();else{v.addEventListener('loadedmetadata',go,{once:true});v.load()}
 v.scrollIntoView({block:'nearest',behavior:'smooth'})}
function m2vSync(v){const box=document.querySelector(`[data-m2v-box="${v.id}"]`);if(!box)return;const meta=M2V.videos[box.dataset.m2vId];
 const r=box.querySelector('.m2v-seek');if(r&&document.activeElement!==r)r.value=v.currentTime;const tt=document.getElementById(v.id+'-time');if(tt)tt.textContent=`${m2vClock(v.currentTime)} / ${m2vClock(meta.duration)}`;
 const tg=box.querySelector('.m2v-toggle');if(tg)tg.textContent=v.paused?'▶':'❚❚';
 const cur=meta.steps.find(s=>v.currentTime>=s.start&&v.currentTime<s.end)||meta.steps[meta.steps.length-1];box.querySelectorAll('.m2v-chip').forEach(c=>c.classList.toggle('active',c.dataset.m2vPlay===`${v.id}:${cur.step}`))}
document.addEventListener('timeupdate',e=>{const v=e.target;if(!v.classList?.contains('m2v-video'))return;if(v._m2vEnd&&v.currentTime>=v._m2vEnd-0.03){v.pause();v._m2vEnd=null}m2vSync(v)},true);
['play','pause','seeked','loadedmetadata'].forEach(t=>document.addEventListener(t,e=>{if(e.target.classList?.contains('m2v-video'))m2vSync(e.target)},true));
document.addEventListener('input',e=>{const id=e.target.dataset?.m2vSeek;if(!id)return;const v=m2vVideoEl(id);if(!v)return;v._m2vEnd=null;const t=Number(e.target.value);if(v.readyState>=1)v.currentTime=t;else{v.addEventListener('loadedmetadata',()=>{v.currentTime=t},{once:true});v.load()}});
document.addEventListener('click',e=>{const v=e.target.closest('video.m2v-video');if(v){v._m2vEnd=null;v.paused?v.play().catch(()=>{}):v.pause()}});
document.addEventListener('play',e=>{const v=e.target;if(v.classList?.contains('m2v-video'))document.querySelectorAll('video.m2v-video').forEach(o=>{if(o!==v)o.pause()})},true);
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.m2vPlay){const [id,step]=b.dataset.m2vPlay.split(':');m2vPlayStep(id,Number(step));return}
 if(b.dataset.m2vLoad){const v=m2vVideoEl(b.dataset.m2vLoad);v?.play().catch(()=>{});return}
 if(b.dataset.m2vToggle){const v=m2vVideoEl(b.dataset.m2vToggle);if(!v)return;v._m2vEnd=null;v.paused?v.play().catch(()=>{}):v.pause();return}
 if(b.dataset.m2vNav){const [id,dir]=b.dataset.m2vNav.split(':');const box=document.querySelector(`[data-m2v-box="${id}"]`);const meta=M2V.videos[box.dataset.m2vId];const v=document.getElementById(id);
  const t=v?v.currentTime:0;const cur=meta.steps.findIndex(s=>t>=s.start&&t<s.end);const k=Math.min(meta.steps.length,Math.max(1,(cur<0?0:cur+1)+Number(dir)));m2vPlayStep(id,k);return}
 if(b.dataset.m2vStep){const opts=b.dataset.m2vStep.split('|').map(x=>x.split(':'));
  // play in the explanation that is showing; fall back to the other one
  const vis=opts.find(([id])=>{const box=document.querySelector(`[data-m2v-box="${id}"]`);return box&&!box.closest('.m2v-pane[hidden]')})||opts[0];
  const box=document.querySelector(`[data-m2v-box="${vis[0]}"]`);const det=box&&box.closest('details');if(det)det.open=true;
  const pane=box&&box.closest('.m2v-pane[hidden]');if(pane){const t=pane.closest('.m2v-tabs');m2vShowTab(t.id,Number(pane.dataset.pane))}
  m2vPlayStep(vis[0],Number(vis[1]));return}
 if(b.dataset.m2vTab){const [id,k]=b.dataset.m2vTab.split(':');m2vShowTab(id,Number(k));try{localStorage.setItem('m2v-explanation',k)}catch(e){}}});
function m2vShowTab(id,k){const t=document.getElementById(id);if(!t)return;
 t.querySelectorAll(':scope>.m2v-tabbar>.m2v-tab').forEach((x,i)=>{x.classList.toggle('active',i===k);x.setAttribute('aria-selected',String(i===k))});
 t.querySelectorAll(':scope>.m2v-pane').forEach(p=>{const on=Number(p.dataset.pane)===k;p.hidden=!on;if(!on)p.querySelectorAll('video').forEach(v=>v.pause())})}

// Workspace page: every animation, grouped by session.
M2_NAV.splice(1,0,['m2videos','Animations · step by step']);m2Views.add('m2videos');
function m2VideosScreen(){const sessions=[...new Set(Object.values(M2V.videos).map(v=>v.session))].sort((a,b)=>a-b);
 const nB=Object.keys(M2V.boardByCase).length,nA=Object.keys(M2V.videos).length-nB;
 const sec=n=>{const m=M2.modules.find(m=>m.id===n);const ms=M2.methods.filter(x=>(x.module||17)===n);
  const a=ms.flatMap(x=>m2vFor(x.id)).map(v=>m2vPlayer(v,{lazy:true})).join('');
  const b=ms.map(x=>{const vs=m2vBoards(x.id);return vs.length?`<h3>${esc(x.title)}</h3>${m2vBoardList(vs,{first:-1})}`:''}).join('');
  return `<h2>Session ${n}${m?` · ${esc(m.title)}`:''}</h2>${m2vTabs(a,b)}`};
 return `<h1>Animations · step by step</h1><p>Every method has two explanations. <strong>Animation</strong> follows one method from the data to the conclusion with moving plots (${nA} videos). <strong>Worked on the board</strong> writes out each worked example line by line with the class equations, plots the numbers as they appear, and circles the cutoff in the class table (${nB} videos). Tap a step to watch only that part.</p>${sessions.map(sec).join('')}`}
const m2vPrevScreen=m2Screen;m2Screen=function(){return view==='m2videos'?m2VideosScreen():m2vPrevScreen()};
// Individual collection: the session's animations first, then a compact watch strip on each slide.
const m2vPrevCollection=m2Collection;m2Collection=function(){const html=m2vPrevCollection();const m=m2Module(selectedModule);
 const ms=M2.methods.filter(x=>(x.module||17)===m.id);const vids=ms.flatMap(x=>m2vFor(x.id));const boards=ms.flatMap(x=>m2vBoards(x.id));if(!vids.length&&!boards.length)return html;
 const strip=`<details class="m2v-session" open><summary>Videos for Session ${m.id} · ${vids.length} animations · ${boards.length} worked on the board</summary>${m2vTabs(vids.map(v=>m2vPlayer(v,{lazy:true})).join(''),m2vBoardList(boards,{first:-1}))}</details>`;
 const at=html.indexOf('<details class="lesson');return at<0?html+strip:html.slice(0,at)+strip+html.slice(at)};
const m2vPrevSlideCard=m2SlideCard;m2SlideCard=function(s,open){const html=m2vPrevSlideCard(s,open);const v=m2vFor(s.topic)[0],bs=m2vBoards(s.topic);if(!v&&!bs.length)return html;
 const block=`<details class="m2v-inline"><summary>▶ Watch this method · ${esc((v||bs[0]).title)}</summary>${m2vTabs(v?m2vPlayer(v,{lazy:true,heading:false}):'',bs.length?m2vBoardList(bs,{first:-1}):'')}</details>`;
 return html.replace(/<\/div><div class="slide-wrap">/,block+'</div><div class="slide-wrap">')};
// Method guide: the full animation under the heading.
const m2vPrevMethod=m2MethodScreen;m2MethodScreen=function(){const html=m2vPrevMethod();const v=m2vFor(m2Method)[0],bs=m2vBoards(m2Method);if(!v&&!bs.length)return html;
 return html.replace('</h1>','</h1>'+m2vTabs(v?m2vPlayer(v,{lazy:false}):'',m2vBoardList(bs,{first:v?-1:0})))};
// Worked cases: the animation above the steps, and a "watch this step" button on each mapped step.
const m2vPrevCase=m2CaseHTML;m2CaseHTML=function(c,worked=false,subset=null){let html=m2vPrevCase(c,worked,subset);
 const v=m2vFor(c.topic).find(x=>x.cases&&x.cases[c.id])||m2vFor(c.topic)[0];const bv=m2vBoardFor(c.id);if(!v&&!bv)return html;
 const lazy=!!subset||!worked;const player=v?m2vPlayer(v,{lazy}):'',board=bv?m2vPlayer(bv,{lazy}):'';
 const idOf=h=>(h.match(/data-m2v-box="([^"]+)"/)||[])[1];const ida=idOf(player),idb=idOf(board);
 const mapA=v?(v.cases||{})[c.id]:null,mapB=bv?(bv.cases||{})[c.id]:null;
 if(mapA||mapB)html=html.replace(/<div class="step"><h3>(\d+)\. /g,(all,num)=>{const j=Number(num)-1;const ka=mapA&&mapA[j],kb=mapB&&mapB[j];
  const opts=[ka&&ida?`${ida}:${ka}`:'',kb&&idb?`${idb}:${kb}`:''].filter(Boolean);
  return opts.length?`<div class="step"><button class="m2v-stepbtn" data-m2v-step="${opts.join('|')}">▶ Watch this step</button><h3>${num}. `:all});
 const at=html.indexOf('<div class="step">');const both=m2vTabs(player,board);
 const wrapped=subset?`<details class="m2v-inline"><summary>▶ Watch the videos</summary>${both}</details>`:(worked?both:`<details class="m2v-inline"><summary>▶ Watch the videos (they show the method, so try the problem first)</summary>${both}</details>`);
 return at<0?html+wrapped:html.slice(0,at)+wrapped+html.slice(at)};
// Home: a card that opens the animations page.
const m2vPrevHome=m2Home;m2Home=function(){const n=Object.keys(M2V.videos).length;if(!n)return m2vPrevHome();
 return m2vPrevHome().replace('<h2>Lecture collections</h2>',`<div class="card m2v-home"><span class="tag">NEW · TWO KINDS OF VIDEO</span><h2>Watch each method step by step</h2><p>${Object.keys(M2V.byMethod).length} method animations and ${Object.keys(M2V.boardByCase).length} worked-on-the-board videos across Module II. Each step can be played on its own.</p><button class="primary" data-view="m2videos">Open the animations</button></div><h2>Lecture collections</h2>`)};
if(new URLSearchParams(location.search).get('view')==='m2videos')view='m2videos';
render();
