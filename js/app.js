
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const store={get(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}},set(k,v){localStorage.setItem(k,JSON.stringify(v))}};

// tabs
$$(".day-tab").forEach(tab=>tab.onclick=()=>{
  $$(".day-tab").forEach(x=>x.classList.remove("active")); tab.classList.add("active");
  $$(".day-page").forEach(p=>p.classList.toggle("active",p.dataset.day===tab.dataset.day));
  window.scrollTo({top:$("#days").offsetTop+60,behavior:"smooth"});
});

// countdown + clock
const depart=new Date("2026-11-02T09:45:00+08:00");
function updateClock(){
 const diff=depart-Date.now();
 $("#countdown").textContent=diff>0?Math.ceil(diff/86400000)+" 天":"旅行中";
 $("#japanTime").textContent=new Intl.DateTimeFormat("zh-TW",{timeZone:"Asia/Tokyo",hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date());
} updateClock();setInterval(updateClock,30000);

// current weather and fx
async function weather(lat,lon,id){
 try{const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=Asia%2FTokyo`);
 const d=await r.json();$(id).textContent=Math.round(d.current.temperature_2m)+"°C"}catch{$(id).textContent="—"}
}
weather(35.0116,135.7681,"#kyotoWeather");weather(35.6762,139.6503,"#tokyoWeather");
fetch("https://api.frankfurter.app/latest?from=TWD&to=JPY").then(r=>r.json()).then(d=>$("#fxRate").textContent=d.rates.JPY.toFixed(2)+" JPY").catch(()=>$("#fxRate").textContent="—");

// budget
let budgets=store.get("trip-budgets-v4",{});
function drawBudget(){ $("#budgetTotal").textContent=Object.values(budgets).reduce((a,b)=>a+(Number(b)||0),0).toLocaleString() }
$$(".budget-input").forEach(x=>{x.value=budgets[x.dataset.budget]||"";x.oninput=()=>{budgets[x.dataset.budget]=Number(x.value)||0;store.set("trip-budgets-v4",budgets);drawBudget()}});drawBudget();

// checklist and completed stops
let items=store.get("trip-items-v4",{});
$$("[data-item], [data-check]").forEach(x=>{const key=x.dataset.item||x.dataset.check;x.checked=!!items[key];x.onchange=()=>{items[key]=x.checked;store.set("trip-items-v4",items)}});

// steps
let steps=store.get("trip-steps-v4",0);function drawSteps(){$("#steps").textContent=steps.toLocaleString()}drawSteps();
$$("[data-step]").forEach(b=>b.onclick=()=>{steps+=Number(b.dataset.step);store.set("trip-steps-v4",steps);drawSteps()});
$("#resetSteps").onclick=()=>{steps=0;store.set("trip-steps-v4",steps);drawSteps()};

// memo
$("#memo").value=localStorage.getItem("trip-memo-v4")||"";
$("#memo").oninput=e=>localStorage.setItem("trip-memo-v4",e.target.value);

// sakura
function addPetal(){const p=document.createElement("span");p.className="petal";p.textContent=Math.random()>.5?"🌸":"✿";p.style.left=Math.random()*100+"vw";p.style.animationDuration=(7+Math.random()*7)+"s";p.style.setProperty("--drift",(Math.random()*180-90)+"px");$("#petals").append(p);setTimeout(()=>p.remove(),15000)}
setInterval(addPetal,700);

// PWA
let deferred;addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;$("#installBtn").hidden=false});
$("#installBtn").onclick=async()=>{if(deferred){deferred.prompt();await deferred.userChoice;deferred=null;$("#installBtn").hidden=true}};
if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js"));
