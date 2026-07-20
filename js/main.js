
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function updateJapanTime(){
  const el = $('#japanTime');
  if(!el) return;
  const now = new Date();
  el.textContent = new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now);
}
setInterval(updateJapanTime,1000); updateJapanTime();

async function loadWeather(){
  const el = $('#weatherValue'); if(!el) return;
  try{
    const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=35.0116&longitude=135.7681&current=temperature_2m,weather_code&timezone=Asia%2FTokyo');
    const d = await r.json();
    el.textContent = `${Math.round(d.current.temperature_2m)}°C`;
  }catch(e){ el.textContent='查看天氣'; }
}
async function loadFx(){
  const el = $('#fxValue'); if(!el) return;
  try{
    const r = await fetch('https://api.frankfurter.app/latest?from=TWD&to=JPY');
    const d = await r.json();
    el.textContent = `1 TWD ≈ ${d.rates.JPY.toFixed(2)} JPY`;
  }catch(e){ el.textContent='查看匯率'; }
}
loadWeather(); loadFx();

const stepInput=$('#steps');
if(stepInput){
  const saved=localStorage.getItem('jp_steps')||'0'; stepInput.value=saved;
  const render=()=>{ const v=Number(stepInput.value||0); localStorage.setItem('jp_steps',v); $('#stepValue').textContent=v.toLocaleString(); $('#stepBar').style.width=Math.min(100,v/15000*100)+'%'; $('#distanceValue').textContent=(v*0.0007).toFixed(1)+' km'; };
  stepInput.addEventListener('input',render); render();
}

const budgetRows=$('#budgetRows');
function addBudgetRow(name='',amount=''){
 if(!budgetRows) return;
 const row=document.createElement('div'); row.className='budget-row';
 row.innerHTML=`<input class="bname" placeholder="項目" value="${name}"><input class="bamount" type="number" min="0" placeholder="日圓" value="${amount}"><button class="delete" title="刪除">×</button>`;
 budgetRows.appendChild(row);
 row.querySelectorAll('input').forEach(i=>i.addEventListener('input',saveBudget));
 row.querySelector('.delete').onclick=()=>{row.remove();saveBudget()};
}
function saveBudget(){
 const data=$$('.budget-row').map(r=>({name:r.querySelector('.bname').value,amount:Number(r.querySelector('.bamount').value||0)}));
 localStorage.setItem('jp_budget',JSON.stringify(data));
 const total=data.reduce((s,x)=>s+x.amount,0);
 const t=$('#budgetTotal'); if(t)t.textContent=total.toLocaleString()+' 円';
}
if(budgetRows){
 const data=JSON.parse(localStorage.getItem('jp_budget')||'[]');
 (data.length?data:[{name:'餐費',amount:0},{name:'交通',amount:0},{name:'購物',amount:0}]).forEach(x=>addBudgetRow(x.name,x.amount));
 $('#addBudget').onclick=()=>addBudgetRow(); saveBudget();
}

const uploader=$('#photoUpload'), gallery=$('#gallery');
if(uploader && gallery){
 const saved=JSON.parse(localStorage.getItem('jp_gallery')||'[]');
 saved.forEach(src=>addPhoto(src,false));
 uploader.addEventListener('change',async e=>{
   const files=[...e.target.files].slice(0,8);
   for(const f of files){
     const src=await fileToDataURL(f);
     addPhoto(src,true);
   }
   uploader.value='';
 });
}
function fileToDataURL(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}
function addPhoto(src,save){
 const img=document.createElement('img');img.src=src;img.alt='家庭旅行照片';gallery.appendChild(img);
 if(save){const arr=JSON.parse(localStorage.getItem('jp_gallery')||'[]');arr.push(src);localStorage.setItem('jp_gallery',JSON.stringify(arr.slice(-12)));}
}

document.querySelectorAll('.filter-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f=btn.dataset.filter;
    document.querySelectorAll('.item[data-category]').forEach(item=>{
      item.classList.toggle('hidden', f!=='all' && item.dataset.category!==f);
    });
  });
});
