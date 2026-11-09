const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const card=(t,l1,l2,tag)=>`<div class="card"><h3>${esc(t)}</h3><p>${esc(l1)}</p><p>${esc(l2)}</p>${tag?`<span class="tag">${esc(tag)}</span>`:""}</div>`;
const empty=a=>a.length?"":'<p class="empty">Noch keine Einträge.</p>';
fetch("data.json?"+Date.now()).then(r=>r.json()).then(d=>{
  const p=d.profile||{},races=[...(d.races||[])].sort((a,b)=>b.date.localeCompare(a.date));
  document.title=p.alias+" – Sim-Racer";
  $("logo").textContent=(p.alias||"RACE").toUpperCase();$("alias").textContent=p.alias||p.name;
  $("tagline").textContent=p.tagline||"";$("yt").href=p.youtube||"#";$("about-text").textContent=p.about||"";
  $("mail").textContent=p.email||"";$("mail").href="mailto:"+(p.email||"");
  $("year").textContent=new Date().getFullYear();$("foot-name").textContent=p.name||"";
  const wins=races.filter(r=>+r.pos===1).length,pod=races.filter(r=>+r.pos>=1&&+r.pos<=3).length;
  $("kpis").innerHTML=[[wins,"Siege"],[pod,"Podien"],[races.length,"Rennen gefahren"]].map(([n,l])=>`<div class="card kpi"><strong>${n}</strong><span>${l}</span></div>`).join("");
  $("league-list").innerHTML=(d.leagues||[]).map(l=>card(l.name,l.game,l.series,l.status)).join("")||empty([]);
  $("rc-list").innerHTML=(d.rc||[]).map(l=>card(l.name,l.class,l.note)).join("")||empty([]);
  $("race-body").innerHTML=races.slice(0,10).map(r=>`<tr><td>${esc(r.date)}</td><td>${esc(r.league)}</td><td>${esc(r.track)}</td><td class="pos p${+r.pos<=3?+r.pos:0}">P${esc(r.pos)}</td><td>${esc(r.note)}</td></tr>`).join("")||'<tr><td colspan="5" class="empty">Noch keine Rennen.</td></tr>';
}).catch(e=>{document.getElementById("alias").textContent="data.json konnte nicht geladen werden";console.error(e)});
