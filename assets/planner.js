'use strict';
const $=s=>document.querySelector(s), places=window.KOREA_PLACES;
let selected=places[0],summary='';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const guide={myeongdong:'incheon-airport-to-myeongdong.html',hongdae:'incheon-airport-to-hongdae.html',seoul:'airport-transfer.html',gangnam:'incheon-airport-to-gangnam.html'};
function closeMatches(){$('#matches').style.display='none';$('#placeSearch').setAttribute('aria-expanded','false');}
function stateURL(){const u=new URL(location.href);u.search='';u.hash=new URLSearchParams({place:String(selected.id),terminal:$('#terminal').value}).toString();return u;}
function save(){const u=stateURL();if(u.href!==location.href)history.pushState(null,'',u);}
function restore(){const h=new URLSearchParams(location.hash.slice(1)),q=new URLSearchParams(location.search);const id=h.get('place');selected=id!==null?places.find(p=>String(p.id)===id)||places[0]:places.find(p=>p.key===q.get('area'))||places[0];const t=(h.get('terminal')||q.get('terminal')||'T1').toUpperCase();$('#terminal').value=['T1','T2'].includes(t)?t:'T1';$('#placeSearch').value=selected.name;closeMatches();render();}
function render(){
 const t=$('#terminal').value,n=Math.max(1,Math.min(8,parseInt($('#travelers').value,10)||1));$('#travelers').value=n;
 const late=$('#arrival').value==='late';
 $('#summary').textContent=`${selected.name} · ${t} · ${n} adults. Recommendation withheld: source review pending.${late?' Late arrival: service availability is not confirmed.':''}`;
 const routes=window.KOREA_TRANSPORT.routes.filter(r=>r.area===selected.key&&r.terminal===t);
 const source='https://www.airportrailroad.com/';
 const options=[['AREX all-stop train','Check the station network and onward journey with AREX.',source],['AREX Express','Check the express service and any onward journey separately.',source],['Airport bus','Route and hotel-stop suitability require verification.',routes[0]?.source_url||'https://www.airport.kr/'],['Official-stand taxi','Confirm vehicle capacity, luggage space, meter rules and surcharges.','https://www.airport.kr/']];
 $('#results').innerHTML=options.map(([title,note,url])=>`<article class="result"><div class="cardhead"><h3>${title}</h3><div class="price">Not verified</div></div><p>${note}</p><div class="facts">Current fare, travel time and availability: not verified.</div>${title==='Airport bus'?routes.map(r=>`<div class="busline"><strong>Route candidate ${esc(r.route_id)} · ${esc(t)}</strong><p>Boarding platform: not verified<br>Drop-off stop: not verified<br>Source review: blocked; no verification date assigned.</p></div>`).join(''):''}<div class="actionlinks"><a href="${url}" target="_blank" rel="noopener noreferrer">Official source ↗</a><a href="${guide[selected.key]||'airport-transfer.html'}">Read destination guide →</a></div></article>`).join('');
 summary=`${selected.name} · ${t}\n${n} adults\nNo verified fare or recommendation. Confirm current journey details with the operator.`;
}
function choose(p){selected=p;$('#placeSearch').value=p.name;closeMatches();render();save();}
function suggestions(){const term=$('#placeSearch').value.trim().toLowerCase();const hits=places.filter(p=>(p.name+' '+p.area).toLowerCase().includes(term));const box=$('#matches');box.replaceChildren();for(const p of hits){const b=document.createElement('button');b.type='button';b.setAttribute('role','option');b.textContent=p.name+' · '+p.area;b.onclick=()=>choose(p);box.append(b);}if(!hits.length){const msg=document.createElement('p');msg.textContent='No matching place. Try a district or hotel name.';box.append(msg);}box.style.display='block';$('#placeSearch').setAttribute('aria-expanded','true');}
$('#placeSearch').addEventListener('input',suggestions);$('#placeSearch').addEventListener('focus',suggestions);
$('#placeSearch').addEventListener('keydown',e=>{if(e.key==='Escape')closeMatches();if(e.key==='ArrowDown'){e.preventDefault();$('#matches button')?.focus();}if(e.key==='Enter'){$('#matches button')?.click();e.preventDefault();}});
$('#matches').addEventListener('keydown',e=>{const b=[...$('#matches').querySelectorAll('button')],i=b.indexOf(document.activeElement);if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();b[(i+(e.key==='ArrowDown'?1:-1)+b.length)%b.length]?.focus();}if(e.key==='Escape'){closeMatches();$('#placeSearch').focus();closeMatches();}});
document.addEventListener('click',e=>{if(!e.target.closest('.selector')){closeMatches();$('#placeSearch').value=selected.name;}});
for(const id of ['terminal','arrival','travelers','luggage','priority'])$('#'+id).addEventListener('input',()=>{render();save();});
$('#reset').onclick=()=>{$('#terminal').value='T1';$('#arrival').value='day';$('#travelers').value='2';$('#luggage').value='2';$('#priority').value='ease';choose(places[0]);};
async function copy(text){try{await navigator.clipboard.writeText(text);$('#copyStatus').textContent='Copied.';}catch{$('#copyStatus').textContent='Copy unavailable. Select and copy: '+text;}}
$('#copy').onclick=()=>copy(summary);
const share=document.createElement('button');share.id='share';share.className='secondary';share.textContent='Copy result link';share.onclick=()=>copy(stateURL().href);$('#copy').after(share);
window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);restore();
