'use strict';
// MODULE II "Learn these methods" in the MODULE I layout: one method at a time, chosen from a
// dropdown or with Previous / Next, and everything shown on the page in the same order as MODULE I
// (teaching, 1. match the question to the setup, 2. one complete worked example, 3. practise with
// notes and a calculator, before moving on). Content comes from the existing MODULE II methods,
// cases and videos. Nothing else changes.
(function(){
 if(typeof M2==='undefined')return;
 const sessionOf=m=>m.module||17;
 const methods=()=>[...M2.methods].sort((a,b)=>sessionOf(a)-sessionOf(b));
 function ls(){state.moduleII.learn??={index:0,details:{},worked:{},practice:{}};const s=state.moduleII.learn;s.details??={};s.worked??={};s.practice??={};
  const n=methods().length;s.index=Math.max(0,Math.min(n-1,Number(s.index)||0));return s}
 const kindRank=c=>c.neuro?2:c.coursePractice?1:0; // lecture cases first, then course-style, then neuroscience
 const casesOf=id=>M2.cases.filter(c=>c.topic===id).sort((a,b)=>kindRank(a)-kindRank(b));
 function workedCase(m){const s=ls(),pool=casesOf(m.id);return m2Cases.get(s.worked[m.id])||m2Cases.get(m.example)||pool[0]||null}
 function practiceCase(m){const s=ls(),w=workedCase(m),pool=casesOf(m.id).filter(c=>!w||c.id!==w.id);
  return m2Cases.get(s.practice[m.id])&&s.practice[m.id]!==(w&&w.id)?m2Cases.get(s.practice[m.id]):(pool.find(c=>c.coursePractice)||pool.find(c=>!c.neuro)||pool[0]||null)}
 function next(list,cur){if(!list.length)return null;const i=list.findIndex(c=>c.id===cur);return list[(i+1)%list.length]}
 function details(key,title,body,open=false){const s=ls(),o=s.details[key]??open;return `<details class="rapid-detail" data-m2l-detail="${esc(key)}" ${o?'open':''}><summary>${esc(title)}</summary>${body}</details>`}
 function nav(){const s=ls(),i=s.index,n=methods().length;return `<div class="row rapid-navigation" role="group" aria-label="Method navigation"><button data-m2l-move="-1" ${i===0?'disabled':''}>← Previous method</button><span class="small">${i+1} / ${n}</span><button class="primary" data-m2l-move="1" ${i===n-1?'disabled':''}>Next method →</button><button data-m2-quiz-topic="${esc(methods()[i].id)}">Check the work</button></div>`}
 const done=()=>methods().filter(m=>['setup','try'].every(k=>state.checks.includes('m2learn:'+m.id+':'+k))).length;
 function videos(m){if(typeof m2vFor!=='function')return '';const v=m2vFor(m.id)[0],bs=typeof m2vBoards==='function'?m2vBoards(m.id):[];if(!v&&!bs.length)return '';
  return m2vTabs(v?m2vPlayer(v,{lazy:true}):'',bs.length?m2vBoardList(bs,{first:-1}):'')}

 function learn(){
  const s=ls(),list=methods(),m=list[s.index],n=sessionOf(m),mod=M2.modules.find(x=>x.id===n);
  const w=workedCase(m),p=practiceCase(m),pool=casesOf(m.id);
  const sessions=[...new Set(list.map(sessionOf))];
  const select=`<label class="rapid-select">Choose a method<select id="m2LearnMethod" aria-label="Choose a MODULE II method">${sessions.map(k=>{const mm=M2.modules.find(x=>x.id===k);return `<optgroup label="Session ${k}${mm?' · '+esc(mm.title):''}">${list.map((x,i)=>sessionOf(x)===k?`<option value="${i}" ${i===s.index?'selected':''}>${i+1}. ${esc(x.title)}</option>`:'').join('')}</optgroup>`}).join('')}</select></label>`;
  const setup=[
   details(m.id+':eq','Equations and symbol meanings',`${(m.formula||[]).map(displayMath).join('')}<p class="symbol-key">${rich(m.symbols||(w&&w.symbols)||'')}</p>`,true),
   m.shortcut?details(m.id+':short','Shorter method',`<p>${rich(m.shortcut)}</p>`):'',
   (m.pages||[]).length?details(m.id+':slides','Where it is taught',`<p>Session ${n} slides on this method.</p><div class="row">${m.pages.map(pg=>`<button class="tiny" data-open-slide="${n}:${pg}">Source slide ${pg}</button>`).join('')}</div>`):'',
   videos(m)?details(m.id+':video','Watch the method · animation and worked on the board',videos(m)):''].join('');
  const another=pool.length>1;
  return `<div class="hero rapid-hero"><span class="tag">LEARN → WORK → TRY</span><h1>Learn these methods</h1><p>Use the question to choose the method, keep the equation beside the numbers, and complete one calculation at a time. Use the class tables and a calculator during practice.</p><div class="row"><button class="primary" data-m2l-resume>Start / resume the route</button><button data-view="m2quizzes">Lecture quizzes</button><button data-view="m2memorize">Order to memorize</button></div></div>
  <p class="small muted">${done()} of ${list.length} methods marked practised. Continue once the setup is clear and the calculation can be shown.</p>
  <div class="scope"><strong>MODULE II covers:</strong> ${M2.modules.map(x=>`Session ${x.id} · ${esc(x.title)}`).join(', ')}. Work through one method at a time.</div>
  ${select}${nav()}
  <article class="card rapid-lesson" data-m2l-method="${esc(m.id)}"><span class="tag">SESSION ${n} · METHOD ${s.index+1} OF ${list.length}</span><h2 id="m2LearnHeading" tabindex="-1">${esc(m.title)}</h2>
   <p class="teaching"><strong>Recognize the question.</strong> ${rich(m.trigger)}</p>${(m.paragraphs||[]).map(t=>`<p class="teaching">${rich(t)}</p>`).join('')}
   <h3>1. Match the question to the setup</h3>${setup}
   <h3 id="m2LearnWorked" tabindex="-1">2. Follow one complete worked example</h3><p>Read the equation first, then its numbers. Keep the givens visible and explain why each next step is needed.</p>
   ${another?`<div class="row rapid-practice-controls"><button data-m2l-another-worked>Another worked example</button><span class="small muted">${pool.length} worked examples for this method</span></div>`:''}
   ${w?details(m.id+':worked','Show the example · equations + every step',`<div class="rapid-worked">${m2CaseHTML(w,true)}</div>`,true):'<p class="notice">No worked example is attached to this method yet.</p>'}
   <h3 id="m2LearnPractice" tabindex="-1">3. Practise with notes and a calculator</h3><p>Keep the solution covered first. Write the setup in Working / notes, calculate, then check the requested answer. If a step is unclear, reveal that step and repeat the calculation.</p>
   ${p?`<div class="row rapid-practice-controls">${pool.length>2?'<button class="primary" data-m2l-another>Another question</button>':''}<button data-m2-quiz-topic="${esc(m.id)}">Quiz this method</button></div><div data-m2l-practice="${esc(p.id)}">${m2CaseHTML(p,false)}</div>`:`<div class="row"><button class="primary" data-m2-quiz-topic="${esc(m.id)}">Quiz this method</button></div>`}
   <div class="rapid-success"><strong>Before moving on</strong><p>${rich(m.trigger)}</p>${checklist('m2learn:'+m.id+':setup','Choose the method and substitute the given values into its equation.')}${checklist('m2learn:'+m.id+':try','Complete the calculation with the solution covered and explain what the result means.')}</div>
   <div class="row"><button data-module="${n}">Session ${n} collection</button><button data-m2-quiz-module="${n}">Session ${n} lecture quiz</button><button data-view="tables">Supplied statistical tables</button></div>
  </article>${nav()}`}

 const prevScreen=m2Screen;m2Screen=function(){return view==='m2methods'?learn():prevScreen()};

 function goTo(i){const s=ls();s.index=i;save();render();const h=document.getElementById('m2LearnHeading');if(h){h.scrollIntoView({block:'start'});h.focus({preventScroll:true})}}
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||view!=='m2methods')return;const d=b.dataset,s=ls(),m=methods()[s.index];
  if(d.m2lMove!==undefined){e.stopImmediatePropagation();goTo(Math.max(0,Math.min(methods().length-1,s.index+Number(d.m2lMove))));return}
  if(d.m2lResume!==undefined){e.stopImmediatePropagation();const i=methods().findIndex(x=>!['setup','try'].every(k=>state.checks.includes('m2learn:'+x.id+':'+k)));goTo(i<0?methods().length-1:i);return}
  if(d.m2lAnotherWorked!==undefined){e.stopImmediatePropagation();const w=workedCase(m),c=next(casesOf(m.id),w&&w.id);if(c){s.worked[m.id]=c.id;if(s.practice[m.id]===c.id)delete s.practice[m.id];s.details[m.id+':worked']=true;save();render();document.getElementById('m2LearnWorked')?.scrollIntoView({block:'start'})}return}
  if(d.m2lAnother!==undefined){e.stopImmediatePropagation();const w=workedCase(m),p=practiceCase(m),c=next(casesOf(m.id).filter(x=>!w||x.id!==w.id),p&&p.id);if(c){s.practice[m.id]=c.id;save();render();document.getElementById('m2LearnPractice')?.scrollIntoView({block:'start'})}return}
 },true);
 document.addEventListener('change',e=>{if(e.target.id==='m2LearnMethod'){goTo(Number(e.target.value))}});
 document.addEventListener('toggle',e=>{const el=e.target;if(!(el instanceof HTMLDetailsElement)||!el.dataset.m2lDetail)return;ls().details[el.dataset.m2lDetail]=el.open;save()},true);
})();
