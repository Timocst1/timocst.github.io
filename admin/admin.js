const $=id=>document.getElementById(id), FILE="data.json";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const SCHEMA={
  races:{label:"Rennergebnisse",f:[["date","Datum","date"],["league","Liga","text"],["track","Strecke","text"],["pos","Platz","number"],["note","Notiz","text"]]},
  leagues:{label:"Ligen (I drive)",f:[["name","Name","text"],["game","Spiel","text"],["series","Serie/Klasse","text"],["status","Status","text"]]},
  rc:{label:"RC-Ligen",f:[["name","Name","text"],["class","Klasse","text"],["note","Notiz","text"]]}
};
let cfg,data,sha,tab="races";
const b64e=s=>btoa(unescape(encodeURIComponent(s))), b64d=s=>decodeURIComponent(escape(atob(s.replace(/\n/g,""))));
const api=(m,body)=>fetch(`https://api.github.com/repos/${cfg.repo}/contents/${FILE}`+(m==="GET"?`?ref=${encodeURIComponent(cfg.branch)}&t=${Date.now()}`:""),{
  method:m,headers:{Authorization:"Bearer "+cfg.pat,Accept:"application/vnd.github+json"},body:body&&JSON.stringify(body)
}).then(async r=>{const j=await r.json();if(!r.ok)throw new Error(r.status===401?"Token ungültig oder abgelaufen.":r.status===404?"Repo, Branch oder data.json nicht gefunden (oder Token ohne Zugriff).":r.status===409?"Konflikt: data.json wurde zwischenzeitlich geändert. Neu laden.":j.message);return j});
function say(id,t,ok){$(id).textContent=t;$(id).className="msg "+(ok?"ok":"err")}
async function load(){const j=await api("GET");data=JSON.parse(b64d(j.content));sha=j.sha;
  $("login").hidden=true;$("app").hidden=false;draw()}
$("go").onclick=async()=>{cfg={repo:$("repo").value.trim(),branch:$("branch").value.trim()||"main",pat:$("pat").value.trim()};
  if(!cfg.repo||!cfg.pat)return say("lmsg","Repository und Token eingeben.");
  try{await load();localStorage.setItem("adm_repo",cfg.repo);localStorage.setItem("adm_branch",cfg.branch);sessionStorage.setItem("adm_pat",cfg.pat)}
  catch(e){say("lmsg",e.message)}};
$("out").onclick=()=>{sessionStorage.removeItem("adm_pat");location.reload()};
function draw(){
  $("tabs").innerHTML=Object.entries(SCHEMA).map(([k,v])=>`<button class="btn ${k===tab?"on":""}" data-t="${k}">${v.label}</button>`).join("");
  $("tabs").querySelectorAll("button").forEach(b=>b.onclick=()=>{tab=b.dataset.t;draw()});
  const f=SCHEMA[tab].f,rows=data[tab]||(data[tab]=[]);
  $("thead").innerHTML="<tr>"+f.map(x=>`<th>${x[1]}</th>`).join("")+"<th></th></tr>";
  $("tbody").innerHTML=rows.map((r,i)=>"<tr>"+f.map(([k,,t])=>`<td><input type="${t}" data-i="${i}" data-k="${k}" value="${esc(r[k])}"></td>`).join("")+`<td><button class="btn ghost sm" data-d="${i}" aria-label="Zeile löschen">Löschen</button></td></tr>`).join("");
  $("tbody").querySelectorAll("input").forEach(el=>el.oninput=()=>{const v=el.type==="number"&&el.value!==""?+el.value:el.value;rows[el.dataset.i][el.dataset.k]=v});
  $("tbody").querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{rows.splice(+b.dataset.d,1);draw()});
}
$("add").onclick=()=>{const o={};SCHEMA[tab].f.forEach(([k])=>o[k]="");if(tab==="races")o.date=new Date().toISOString().slice(0,10);data[tab].unshift(o);draw()};
$("save").onclick=async()=>{
  data.races.sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  try{say("msg","Speichere …",true);
    const j=await api("PUT",{message:"Update data.json via Admin",content:b64e(JSON.stringify(data,null,2)+"\n"),sha,branch:cfg.branch});
    sha=j.content.sha;draw();say("msg","Gespeichert. GitHub Pages braucht ca. 1 Minute, bis die Änderung live ist.",true)}
  catch(e){say("msg",e.message)}};
$("repo").value=localStorage.getItem("adm_repo")||"";$("branch").value=localStorage.getItem("adm_branch")||"main";
if(sessionStorage.getItem("adm_pat")&&$("repo").value){$("pat").value=sessionStorage.getItem("adm_pat");$("go").click()}
