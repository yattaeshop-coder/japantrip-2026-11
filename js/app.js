const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const storage={get:(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};

function updateTime(){const t=new Intl.DateTimeFormat("zh-TW",{timeZone:"Asia/Tokyo",hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date());$("#japanTime").textContent=t;$("#japanTime2").textContent=t}
updateTime();setInterval(updateTime,30000);

const depart=new Date("2026-11-02T09:45:00+08:00"), diff=depart-Date.now();
$("#countdown").textContent=diff>0?Math.ceil(diff/86400000)+" 天":"旅途中";

fetch("https://api.frankfurter.app/latest?from=TWD&to=JPY").then(r=>r.json()).then(d=>$("#fxValue").textContent=d.rates.JPY.toFixed(2)).catch(()=>$("#fxValue").textContent="—");
async function weather(lat,lon,id){try{const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=Asia%2FTokyo`);const d=await r.json();$(id).textContent=`${Math.round(d.current.temperature_2m)}°C`}catch{$(id).textContent="—"}}
weather(35.0116,135.7681,"#weatherKyoto");weather(35.6762,139.6503,"#weatherTokyo");

const tabs=$$(".day-tab"), days=$$(".day-section");
function activeDay(){let id=days[0].id;for(const d of days){if(scrollY+150>=d.offsetTop)id=d.id}tabs.forEach(t=>t.classList.toggle("active",t.dataset.day===id))}
addEventListener("scroll",()=>{activeDay();$("#progress").style.width=(scrollY/(document.documentElement.scrollHeight-innerHeight)*100)+"%"},{passive:true});activeDay();

$$(".filter").forEach(btn=>btn.onclick=()=>{$$(".filter").forEach(b=>b.classList.remove("active"));btn.classList.add("active");const f=btn.dataset.filter;$$(".schedule-card").forEach(c=>c.hidden=f!=="all"&&c.dataset.category!==f)});

const obs=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add("visible")),{threshold:.08});$$(".reveal").forEach(e=>obs.observe(e));

const budgets=storage.get("tripBudgets",{});
$$(".day-budget").forEach(i=>{i.value=budgets[i.dataset.budget]||"";i.oninput=()=>{budgets[i.dataset.budget]=Number(i.value)||0;storage.set("tripBudgets",budgets);sumBudget()}});
function sumBudget(){$("#budgetTotal").textContent=Object.values(budgets).reduce((a,b)=>a+Number(b||0),0).toLocaleString()}
sumBudget();$("#clearBudget").onclick=()=>{if(confirm("確定清除全部每日預算？")){Object.keys(budgets).forEach(k=>delete budgets[k]);storage.set("tripBudgets",budgets);$$(".day-budget").forEach(i=>i.value="");sumBudget()}};

const checks=storage.get("tripChecklist",{});
$$("[data-check]").forEach(i=>{i.checked=!!checks[i.dataset.check];i.onchange=()=>{checks[i.dataset.check]=i.checked;storage.set("tripChecklist",checks)}});

$("#photoInput").onchange=e=>{const g=$("#gallery");g.innerHTML="";[...e.target.files].slice(0,9).forEach(f=>{const img=new Image();img.src=URL.createObjectURL(f);g.append(img)})};

let deferredPrompt;addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("#installBtn").hidden=false});
$("#installBtn").onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("#installBtn").hidden=true}};

if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js"));
