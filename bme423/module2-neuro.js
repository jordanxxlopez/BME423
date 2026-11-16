'use strict';
// Neuroscience and psychology questions, added next to the existing cases.
// Nothing existing is changed: the new cases and quiz questions join MODULE II's lists, a workspace
// page and a block in each collection list them, and a MODULE I page holds the Exam 1 format questions.
(function(){
 if(typeof BME_MODULE_II_NEURO==='undefined')return;
 const N=BME_MODULE_II_NEURO;
 const neuroIds=new Set(N.cases.map(c=>c.id));
 N.cases.forEach(c=>{if(!m2Cases.has(c.id)){M2.cases.push(c);m2Cases.set(c.id,c)}});
 M2.questions.push(...N.questions.filter(q=>!M2.questions.some(x=>x.id===q.id)));
 const bySession=n=>N.cases.filter(c=>c.module===n);
 const quizFor=n=>N.questions.filter(q=>q.module===n);

 // One session's list: cases grouped by method, each with a worked-solution and a try-it-first button.
 function sessionList(n){
  const cases=bySession(n);if(!cases.length)return '';
  const methods=M2.methods.filter(m=>(m.module||17)===n&&cases.some(c=>c.topic===m.id));
  const rows=methods.map(m=>`<h3>${esc(m.title)}</h3><ul class="m2n-list">${cases.filter(c=>c.topic===m.id).map(c=>`<li><span class="m2n-title">${esc(c.title)}</span><span class="m2n-actions"><button data-m2-practice="${c.id}">Try it first</button><button data-m2-case="${c.id}">Worked solution</button></span></li>`).join('')}</ul>`).join('');
  const q=quizFor(n).length;
  return `${rows}${q?`<p><button class="primary" data-m2n-quiz="${n}">Quiz · ${q} neuroscience questions for Session ${n}</button></p>`:''}`}

 // Workspace page.
 M2_NAV.splice(2,0,['m2neuro','Neuroscience questions']);m2Views.add('m2neuro');
 function neuroScreen(){
  const sessions=[...new Set(N.cases.map(c=>c.module))].sort((a,b)=>a-b);
  const exam=N.exam.length?`<div class="card"><span class="tag">MODULE I · EXAM 1 FORMAT</span><h2>${N.exam.length} written questions in the Exam 1 format</h2><p>Probability, the Normal distribution, analysis of variance, Holm comparisons, chi-square and odds ratio, each asked the way Exam 1 asked it, with a full solution.</p><button data-view="neuroExam">Open the Exam 1 format questions</button></div>`:'';
  return `<h1>Neuroscience questions</h1><p>${N.cases.length} extra worked questions and ${N.questions.length} quiz questions with settings from neuroscience, psychology, hearing, speech and music. Each one is asked the way the course homework and exams ask questions, and each has every step worked out. All data are invented for practice.</p>${exam}${sessions.map(n=>{const m=M2.modules.find(x=>x.id===n);return `<details class="m2n-session" ${n===sessions[0]?'open':''}><summary>Session ${n}${m?` · ${esc(m.title)}`:''} · ${bySession(n).length} questions</summary>${sessionList(n)}</details>`}).join('')}`}
 const prevScreen=m2Screen;m2Screen=function(){return view==='m2neuro'?neuroScreen():prevScreen()};

 // Individual collection: the session's neuroscience questions, above the slides.
 const prevCollection=m2Collection;m2Collection=function(){const html=prevCollection();const m=m2Module(selectedModule);if(!m||!bySession(m.id).length)return html;
  const block=`<details class="m2n-session"><summary>Neuroscience questions for Session ${m.id} · ${bySession(m.id).length} worked questions · ${quizFor(m.id).length} quiz questions</summary>${sessionList(m.id)}</details>`;
  let at=html.indexOf('<details class="m2v-session');if(at<0)at=html.indexOf('<details class="lesson');
  return at<0?html+block:html.slice(0,at)+block+html.slice(at)};

 // The checkpoint box names the number that is graded (the shared label says "Lower endpoint").
 const prevCase=m2CaseHTML;m2CaseHTML=function(c,worked=false,subset=null){let html=prevCase(c,worked,subset);if(!neuroIds.has(c.id)||!c.answerName)return html;
  // R output the question refers to is shown with the question, as R prints it.
  if(c.rOutput&&!subset)html=html.replace('<div class="m2-answer">',`<pre class="m2n-r">${esc(Array.isArray(c.rOutput)?c.rOutput.join('\n'):String(c.rOutput))}</pre><div class="m2-answer">`);
  return html.replace('Lower endpoint · numerical checkpoint',esc(c.answerName)+' · numerical checkpoint').replace('Check the lower bound. Use the displayed estimate minus margin.','Not yet. Check '+esc(c.answerName.charAt(0).toLowerCase()+c.answerName.slice(1))+' again, or show the next step.')};

 // Home card.
 const prevHome=m2Home;m2Home=function(){return prevHome().replace('<h2>Lecture collections</h2>',`<div class="card m2n-home"><span class="tag">NEW · NEUROSCIENCE QUESTIONS</span><h2>Practice with brain and behavior examples</h2><p>${N.cases.length} extra worked questions and ${N.questions.length} quiz questions on sleep, memory, hearing, speech, music, attention and more, asked in the course's exam and homework style.</p><button class="primary" data-view="m2neuro">Open the neuroscience questions</button></div><h2>Lecture collections</h2>`)};

 // MODULE I page: Exam 1 format questions.
 const EXAM_VIEW='neuroExam';
 if(N.exam.length)NAV.splice(NAV.findIndex(x=>x[0]==='neuroWorked')+1||NAV.length,0,[EXAM_VIEW,'Neuroscience · Exam 1 format questions']);
 function stepPlot(f){
  const pts=f.points,W=420,H=230,L=56,R=20,T=16,B=40;const ys=pts.map(p=>p[0]);const lo=Math.min(...ys)-1,hi=Math.max(...ys)+1;
  const X=v=>L+(v-lo)/(hi-lo)*(W-L-R),Y=v=>H-B-v*(H-T-B);const ticksF=(f.ticks&&f.ticks.F)||pts.map(p=>String(p[1]));
  let prev=0,s='';const segs=[[lo,ys[0],0],...pts.map((p,i)=>[p[0],i+1<pts.length?pts[i+1][0]:hi,p[1]])];
  segs.forEach(([a,b,v],i)=>{s+=`<line x1="${X(a)}" x2="${X(b)}" y1="${Y(v)}" y2="${Y(v)}" class="m2n-line"/>`;if(i<segs.length-1)s+=`<circle cx="${X(b)}" cy="${Y(v)}" r="4.5" class="m2n-open"/>`;if(i>0)s+=`<circle cx="${X(a)}" cy="${Y(v)}" r="4.5" class="m2n-dot"/>`});
  const xt=[];for(let v=Math.ceil(lo);v<=Math.floor(hi);v++)xt.push(v);
  const ax=`<line x1="${L}" x2="${W-R}" y1="${Y(0)}" y2="${Y(0)}" class="m2n-axis"/><line x1="${L}" x2="${L}" y1="${T}" y2="${Y(0)}" class="m2n-axis"/>`+xt.map(v=>`<line x1="${X(v)}" x2="${X(v)}" y1="${Y(0)}" y2="${Y(0)+5}" class="m2n-axis"/><text x="${X(v)}" y="${Y(0)+20}" text-anchor="middle">${v}</text>`).join('')+pts.map((p,i)=>`<line x1="${L-5}" x2="${L}" y1="${Y(p[1])}" y2="${Y(p[1])}" class="m2n-axis"/><text x="${L-9}" y="${Y(p[1])+4}" text-anchor="end">${esc(String(ticksF[i]??p[1]))}</text>`).join('')+`<text x="${W-R}" y="${H-6}" text-anchor="end">y</text><text x="${L+8}" y="${T+4}" text-anchor="start">F(y)</text>`;
  return `<svg class="m2n-plot" viewBox="0 0 ${W} ${H}" role="img" aria-label="Step plot of the distribution function">${ax}${s}</svg>`}
 function figure(f){if(!f)return '';if(f.type==='stepdf')return stepPlot(f);if(f.type==='piecewise')return displayMath(f.latex);return ''}
 function table(t){if(!t||!t.headers)return '';return `${t.caption?`<p class="m2n-caption"><strong>${rich(t.caption)}</strong></p>`:''}<div class="m2-table"><table><thead><tr>${t.headers.map(h=>`<th>${rich(String(h))}</th>`).join('')}</tr></thead><tbody>${t.rows.map(r=>`<tr>${r.map(v=>`<td>${rich(String(v))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
 function examQuestion(q,i){
  const sol=q.solution.map((s,k)=>`<div class="step"><h3>${k+1}. ${esc(s.title)}</h3>${(s.general||[]).map(displayMath).join('')}${(s.work||[]).map(displayMath).join('')}${s.words?`<p>${rich(s.words)}</p>`:''}</div>`).join('');
  return `<div class="card m2n-exam" id="${q.id}"><span class="tag">QUESTION ${i+1} · ${q.points} POINTS</span><h2>${esc(q.title)}</h2>${q.paragraphs.filter(p=>!(q.rOutput&&/\(performed in R\):$/.test(p))).map(p=>`<p>${rich(p)}</p>`).join('')}${figure(q.figure)}${table(q.table)}${q.paragraphs.filter(p=>q.rOutput&&/\(performed in R\):$/.test(p)).map(p=>`<p>${rich(p)}</p>`).join('')}${q.rOutput?`<pre class="m2n-r">${esc(q.rOutput)}</pre>`:''}${q.parts.map(p=>`<p class="m2n-part">${rich(p)}</p>`).join('')}${note('neuro-exam:'+q.id,'Working / notes')}<details class="m2n-solution"><summary>Show the full solution</summary>${sol}<p class="m2-conclusion"><strong>Conclusion.</strong> ${rich(q.conclusion)}</p></details></div>`}
 function examScreen(){
  const types=[...new Set(N.exam.map(q=>q.topic))];
  const rules=['State the statistical procedure you are using for any question in which an inference is made.','State the null hypothesis in words that fit the problem.','Show the generic equations before the numbers, and the main intermediate calculations.','Report the critical value, the degrees of freedom and the level of significance, then state the complete conclusion.','If the null hypothesis is rejected, include the P value.','Unless directed, do not isolate differences among multiple groups.','For interval data, assume Normal distributions and equal variances unless noted.'];
  let n=0;
  return `<span class="tag">MODULE I · EXAM 1 FORMAT</span><h1>Neuroscience questions in the Exam 1 format</h1><p>${N.exam.length} written questions with settings from neuroscience, psychology, hearing, speech and music. Each follows the wording and layout of an Exam 1 question type and has a full solution. All data are invented for practice.</p><div class="notice"><strong>What every answer needs</strong><ol>${rules.map(r=>`<li>${r}</li>`).join('')}</ol></div>${types.map(t=>`<h2>${esc(t)}</h2>${N.exam.filter(q=>q.topic===t).map(q=>examQuestion(q,n++)).join('')}`).join('')}`}
 const prevRender=render;
 render=function(){
  if(view!==EXAM_VIEW)return prevRender();
  applyAppearance();nav();document.body.classList.remove('expanded');
  $('#content').innerHTML=examScreen();typesetContent();
  document.querySelectorAll('[data-note]').forEach(sizeNote);m2Context()};

 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!b.dataset.m2nQuiz)return;
  const pool=shuffle(quizFor(Number(b.dataset.m2nQuiz)).slice());if(!pool.length)return;
  quiz={items:prepareQuizItems(pool),index:0,answers:[],finished:false,scope:'moduleII'};go('m2quiz')});
 const want=new URLSearchParams(location.search).get('view');if(want==='m2neuro'||want===EXAM_VIEW)view=want;
 render();
})();
