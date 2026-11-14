'use strict';
// Step-by-step animations for MODULE II (videos rendered by authoring/videos with Remotion).
// Adds them to the workspace, every individual collection, method guides and worked cases.
// Each step chip plays only that step's segment and stops at its end.
const M2V=typeof BME_M2_VIDEOS!=='undefined'?BME_M2_VIDEOS:{videos:{},byMethod:{}};
let m2vSeq=0;
function m2vFor(method){return (M2V.byMethod[method]||[]).map(id=>M2V.videos[id]).filter(Boolean)}
function m2vClock(t){const s=Math.round(t);return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`}
// Full player: video plus one chip per step. `lazy` shows a poster button until clicked.
function m2vPlayer(v,{lazy=false,heading=true}={}){const id=`m2v-${v.id}-${++m2vSeq}`;
 const chips=v.steps.map(s=>`<button class="m2v-chip" data-m2v-play="${id}:${s.step}" title="${esc(s.title)} · ${m2vClock(s.start)}–${m2vClock(s.end)}"><span>${s.step}</span>${esc(s.title)}</button>`).join('');
 const media=lazy?`<button class="m2v-poster" data-m2v-load="${id}" data-m2v-src="${esc(v.file)}" aria-label="Load the animation ${esc(v.title)}"><img src="${esc(v.poster)}" alt="" loading="lazy"><span class="m2v-playicon">▶</span></button>`
  :`<video id="${id}" class="m2v-video" src="${esc(v.file)}" poster="${esc(v.poster)}" preload="metadata" playsinline muted></video>`;
 return `<figure class="m2v" data-m2v-id="${esc(v.id)}" data-m2v-box="${id}">${heading?`<figcaption><span class="tag">ANIMATION · SESSION ${v.session}</span> <strong>${esc(v.title)}</strong> <span class="small muted">${m2vClock(v.duration)} · ${v.steps.length} steps · tap a step to watch only that part</span></figcaption>`:''}<div class="m2v-frame" id="${id}-frame">${media}</div><div class="m2v-bar"><button class="m2v-toggle" data-m2v-toggle="${id}" aria-label="Play or pause">▶</button><button data-m2v-nav="${id}:-1" aria-label="Previous step">‹ step</button><input type="range" class="m2v-seek" data-m2v-seek="${id}" min="0" max="${v.duration}" step="0.1" value="0" aria-label="Position in the animation"><button data-m2v-nav="${id}:1" aria-label="Next step">step ›</button><span class="m2v-time" id="${id}-time">0:00 / ${m2vClock(v.duration)}</span></div><div class="m2v-chips">${chips}</div></figure>`}
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
 if(b.dataset.m2vStep){const [id,step]=b.dataset.m2vStep.split(':');m2vPlayStep(id,Number(step))}});

// Workspace page: every animation, grouped by session.
M2_NAV.splice(1,0,['m2videos','Animations · step by step']);m2Views.add('m2videos');
function m2VideosScreen(){const sessions=[...new Set(Object.values(M2V.videos).map(v=>v.session))].sort((a,b)=>a-b);
 return `<h1>Animations · step by step</h1><p>Each animation follows one method from the data to the conclusion. Tap a step to watch only that part. The same steps appear beside the worked examples.</p>${sessions.map(n=>{const m=M2.modules.find(m=>m.id===n);
  return `<h2>Session ${n}${m?` · ${esc(m.title)}`:''}</h2>${M2.methods.filter(x=>(x.module||17)===n).flatMap(x=>m2vFor(x.id)).map(v=>m2vPlayer(v,{lazy:true})).join('')}`}).join('')}`}
const m2vPrevScreen=m2Screen;m2Screen=function(){return view==='m2videos'?m2VideosScreen():m2vPrevScreen()};
// Individual collection: the session's animations first, then a compact watch strip on each slide.
const m2vPrevCollection=m2Collection;m2Collection=function(){const html=m2vPrevCollection();const m=m2Module(selectedModule);
 const vids=M2.methods.filter(x=>(x.module||17)===m.id).flatMap(x=>m2vFor(x.id));if(!vids.length)return html;
 const strip=`<details class="m2v-session" open><summary>Animations for Session ${m.id} · ${vids.length}</summary>${vids.map(v=>m2vPlayer(v,{lazy:true})).join('')}</details>`;
 const at=html.indexOf('<details class="lesson');return at<0?html+strip:html.slice(0,at)+strip+html.slice(at)};
const m2vPrevSlideCard=m2SlideCard;m2SlideCard=function(s,open){const html=m2vPrevSlideCard(s,open);const v=m2vFor(s.topic)[0];if(!v)return html;
 const block=`<details class="m2v-inline"><summary>▶ Watch this method · ${esc(v.title)}</summary>${m2vPlayer(v,{lazy:true,heading:false})}</details>`;
 return html.replace(/<\/div><div class="slide-wrap">/,block+'</div><div class="slide-wrap">')};
// Method guide: the full animation under the heading.
const m2vPrevMethod=m2MethodScreen;m2MethodScreen=function(){const html=m2vPrevMethod();const v=m2vFor(m2Method)[0];if(!v)return html;
 return html.replace('</h1>','</h1>'+m2vPlayer(v,{lazy:false}))};
// Worked cases: the animation above the steps, and a "watch this step" button on each mapped step.
const m2vPrevCase=m2CaseHTML;m2CaseHTML=function(c,worked=false,subset=null){let html=m2vPrevCase(c,worked,subset);
 const v=m2vFor(c.topic).find(x=>x.cases&&x.cases[c.id])||m2vFor(c.topic)[0];if(!v)return html;
 const player=m2vPlayer(v,{lazy:!!subset||!worked});const id=player.match(/data-m2v-box="([^"]+)"/)[1];const map=(v.cases||{})[c.id];
 if(map)html=html.replace(/<div class="step"><h3>(\d+)\. /g,(all,num)=>{const k=map[Number(num)-1];return k?`<div class="step"><button class="m2v-stepbtn" data-m2v-step="${id}:${k}">▶ Watch step ${k}</button><h3>${num}. `:all});
 const at=html.indexOf('<div class="step">');
 const wrapped=subset?`<details class="m2v-inline"><summary>▶ Watch the animation</summary>${player}</details>`:(worked?player:`<details class="m2v-inline"><summary>▶ Watch the animation (shows the method, try the problem first)</summary>${player}</details>`);
 return at<0?html+wrapped:html.slice(0,at)+wrapped+html.slice(at)};
// Home: a card that opens the animations page.
const m2vPrevHome=m2Home;m2Home=function(){const n=Object.keys(M2V.videos).length;if(!n)return m2vPrevHome();
 return m2vPrevHome().replace('<h2>Lecture collections</h2>',`<div class="card m2v-home"><span class="tag">NEW · ANIMATIONS</span><h2>Watch each method step by step</h2><p>${n} animations across Module II. Each step can be played on its own.</p><button class="primary" data-view="m2videos">Open the animations</button></div><h2>Lecture collections</h2>`)};
if(new URLSearchParams(location.search).get('view')==='m2videos')view='m2videos';
render();
