
const days=window.TRIP_DAYS,$=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const store={get(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}},set(k,v){localStorage.setItem(k,JSON.stringify(v))}};

// hero video
$$(".video-switch button").forEach(b=>b.onclick=()=>{$$(".video-switch button").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(".video-layer.active").classList.remove("active");$("#video"+(b.dataset.video==="kyoto"?"Kyoto":"Tokyo")).classList.add("active")});

// sakura
function petal(){const e=document.createElement("span");e.className="petal";e.textContent=Math.random()>.5?"🌸":"✿";e.style.left=Math.random()*100+"vw";e.style.animationDuration=6+Math.random()*8+"s";e.style.setProperty("--drift",(Math.random()*220-110)+"px");$("#sakura").append(e);setTimeout(()=>e.remove(),15000)}
setInterval(petal,650);

// reveal
const obs=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add("visible")),{threshold:.1});$$(".reveal").forEach(e=>obs.observe(e));

// time/weather/fx
function clock(){const v=new Intl.DateTimeFormat("zh-TW",{timeZone:"Asia/Tokyo",hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date());$("#japanTime").textContent=v} clock();setInterval(clock,30000);
async function weather(lat,lon,id){try{const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=Asia%2FTokyo`);const d=await r.json();$(id).textContent=Math.round(d.current.temperature_2m)+"°C"}catch{$(id).textContent="—"}}
weather(35.0116,135.7681,"#kyotoWeather");weather(35.6762,139.6503,"#tokyoWeather");
fetch("https://api.frankfurter.app/latest?from=TWD&to=JPY").then(r=>r.json()).then(d=>$("#fxRate").textContent=d.rates.JPY.toFixed(2)+" JPY").catch(()=>$("#fxRate").textContent="—");

// map
const map=L.map("map",{zoomControl:true}).setView(days[0].center,12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(map);
let layer=L.layerGroup().addTo(map),activeDay=days[0],budgets=store.get("budgets",{});
function gmRoute(day){return "https://www.google.com/maps/dir/"+day.stops.map(s=>encodeURIComponent(s[2])).join("/")}
function renderMap(day,focus){activeDay=day;layer.clearLayers();const pts=day.stops.map(s=>[s[3],s[4]]);day.stops.forEach((s,i)=>L.marker([s[3],s[4]]).addTo(layer).bindPopup(`<b>${s[0]} ${s[1]}</b><br>${s[2]}`));if(pts.length>1)L.polyline(pts,{color:"#b33a32",weight:4,opacity:.8,dashArray:"8 7"}).addTo(layer);if(focus){map.setView(focus,15)}else{map.fitBounds(pts,{padding:[35,35]})}$("#mapTitle").textContent=`${day.date} ${day.title}`;$("#googleRoute").href=gmRoute(day);$("#dayBudget").value=budgets[day.id]||"";setTimeout(()=>map.invalidateSize(),120)}
renderMap(days[0]);

$$(".day-button").forEach(b=>b.onclick=()=>{const day=days.find(d=>d.id===b.dataset.day);$$(".day-button").forEach(x=>x.classList.toggle("active",x===b));$$(".day-panel").forEach(p=>p.classList.toggle("active",p.id===day.id));renderMap(day);initCarousel($("#"+day.id));scrollTo({top:$("#journey").offsetTop+120,behavior:"smooth"})});
$$(".stop-card").forEach(b=>b.onclick=()=>{const day=days.find(d=>d.id===b.dataset.day);renderMap(day,[+b.dataset.lat,+b.dataset.lng]);L.popup().setLatLng([+b.dataset.lat,+b.dataset.lng]).setContent(`<b>${b.dataset.name}</b>`).openOn(map)});

// carousel
function initCarousel(panel){if(panel.dataset.ready)return;panel.dataset.ready=1;const track=$(".photo-track",panel),imgs=$$("img",track),dots=$(".dots",panel);let index=0;imgs.forEach((_,i)=>{const d=document.createElement("i");if(i===0)d.className="active";dots.append(d)});const paint=()=>{track.style.transform=`translateX(-${index*100}%)`;$$("i",dots).forEach((d,i)=>d.classList.toggle("active",i===index))};$(".next",panel).onclick=()=>{index=(index+1)%imgs.length;paint()};$(".prev",panel).onclick=()=>{index=(index-1+imgs.length)%imgs.length;paint()}}
$$(".day-panel").forEach(initCarousel);

// budgets
function budgetTotal(){const t=Object.values(budgets).reduce((a,b)=>a+(+b||0),0);$("#budgetTotal").textContent=t.toLocaleString();$("#budgetList").innerHTML=days.map((d,i)=>`<div class="budget-item"><span>Day ${i+1} · ${d.date}</span><b>${(+budgets[d.id]||0).toLocaleString()} 円</b></div>`).join("")}
$("#dayBudget").oninput=e=>{budgets[activeDay.id]=+e.target.value||0;store.set("budgets",budgets);budgetTotal()};budgetTotal();
$("#clearBudget").onclick=()=>{if(confirm("確定清除全部預算？")){budgets={};store.set("budgets",budgets);$("#dayBudget").value="";budgetTotal()}};

// steps (manual because normal websites cannot reliably read phone health step data)
let steps=store.get("steps",0);function drawSteps(){$("#stepsValue").textContent=steps.toLocaleString()}drawSteps();
$("#addSteps").onclick=()=>{steps+=500;store.set("steps",steps);drawSteps()};

// checklist
const checklist=store.get("checklist",{});
$$("[data-item]").forEach(x=>{x.checked=!!checklist[x.dataset.item];x.onchange=()=>{checklist[x.dataset.item]=x.checked;store.set("checklist",checklist)}});

// PWA
let prompt;addEventListener("beforeinstallprompt",e=>{e.preventDefault();prompt=e;$("#installBtn").hidden=false});
$("#installBtn").onclick=async()=>{if(prompt){prompt.prompt();await prompt.userChoice;prompt=null;$("#installBtn").hidden=true}};
if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js"));
