'use strict';
// More practice problems in the course's own style and settings, added next to the lecture cases.
// They join MODULE II's case list (Worked examples, Practice problems, method pages) and get a block
// in each individual collection and a card on the Practice problems page. Nothing existing changes.
(function(){
 if(typeof M2==='undefined')return;
 const P=typeof BME_MODULE_II_PRACTICE==='undefined'?[]:BME_MODULE_II_PRACTICE.cases;
 P.forEach(c=>{if(!m2Cases.has(c.id)){M2.cases.push(c);m2Cases.set(c.id,c)}});
 const bySession=n=>P.filter(c=>c.module===n);
 function sessionList(n){
  const cases=bySession(n);if(!cases.length)return '';
  const methods=M2.methods.filter(m=>(m.module||17)===n&&cases.some(c=>c.topic===m.id));
  return methods.map(m=>`<h3>${esc(m.title)}</h3><ul class="m2n-list">${cases.filter(c=>c.topic===m.id).map(c=>`<li><span class="m2n-title">${esc(c.title)}</span><span class="m2n-actions"><button data-m2-practice="${c.id}">Try it first</button><button data-m2-case="${c.id}">Worked solution</button></span></li>`).join('')}</ul>`).join('')}
 const block=n=>`<details class="m2n-session m2p-session"><summary>More problems in the course style for Session ${n} · ${bySession(n).length} worked questions</summary><p class="small muted">Written the way the homework and exams ask, with medical and biology settings like the lecture's own. All data are invented for practice.</p>${sessionList(n)}</details>`;

 // The checkpoint box names the number that is graded, for every case (the shared label says "Lower endpoint").
 const ids=new Set(P.map(c=>c.id));
 const prevCase=m2CaseHTML;m2CaseHTML=function(c,worked=false,subset=null){let html=prevCase(c,worked,subset);
  // R output a practice question refers to is shown with the question, as R prints it.
  if(c&&ids.has(c.id)&&c.rOutput&&!subset&&!html.includes('class="m2n-r"'))html=html.replace('<div class="m2-answer">',`<pre class="m2n-r">${esc(Array.isArray(c.rOutput)?c.rOutput.join('\n'):String(c.rOutput))}</pre><div class="m2-answer">`);
  if(!c||!c.answerName||c.answerName==='Lower endpoint')return html;
  return html.replace('Lower endpoint · numerical checkpoint',esc(c.answerName)+' · numerical checkpoint').replace('Check the lower bound. Use the displayed estimate minus margin.','Not yet. Check '+esc(c.answerName.charAt(0).toLowerCase()+c.answerName.slice(1))+' again, or show the next step.')};

 // Individual collection: above the neuroscience block (or the videos and slides).
 const prevCollection=m2Collection;m2Collection=function(){const html=prevCollection();const m=m2Module(selectedModule);if(!m||!bySession(m.id).length)return html;
  let at=html.indexOf('<details class="m2n-session');if(at<0)at=html.indexOf('<details class="m2v-session');if(at<0)at=html.indexOf('<details class="lesson');
  return at<0?html+block(m.id):html.slice(0,at)+block(m.id)+html.slice(at)};

 // Practice problems and Worked examples pages: one card listing every session's extra problems.
 const prevScreen=m2Screen;m2Screen=function(){const html=prevScreen();if(view!=='m2practice'&&view!=='m2worked')return html;
  const sessions=[...new Set(P.map(c=>c.module))].sort((a,b)=>a-b);
  return html+`<div class="card m2p-all"><span class="tag">MORE PROBLEMS · COURSE STYLE</span><h2>${P.length} more problems asked the way the homework and exams ask</h2>${sessions.map(n=>{const m=M2.modules.find(x=>x.id===n);return `<details class="m2n-session"><summary>Session ${n}${m?' · '+esc(m.title):''} · ${bySession(n).length} problems</summary>${sessionList(n)}</details>`}).join('')}</div>`};
})();
