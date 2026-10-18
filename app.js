(function(){
const K='auraGame1',$=id=>document.getElementById(id),fmt=n=>n.toLocaleString('en-US');
const AU=[
 {id:'gri',n:'Gri',o:2,c:'#9aa0a6'},{id:'mavi',n:'Mavi',o:5,c:'#4aa3ff'},
 {id:'yesil',n:'Yeşil',o:12,c:'#3ddc84'},{id:'mor',n:'Mor',o:60,c:'#b05cff'},
 {id:'altin',n:'Altın',o:1000,c:'#ffc94a'},{id:'kizil',n:'Kızıl',o:25000,c:'#ff4a4a'},
 {id:'demolition',n:'Demolition',o:675000000,c:'#ff2a1a',big:true}
];
const QS={dusuk:{pr:1,p:.35,bloom:false},orta:{pr:1.5,p:.65,bloom:true},yuksek:{pr:2,p:1,bloom:true}};
const QN={dusuk:'Düşük',orta:'Orta',yuksek:'Yüksek'};
const LK=[1,1000,1e6,1e8];
let st={rolls:0,inv:{},luck:1,q:'orta'};
try{Object.assign(st,JSON.parse(localStorage.getItem(K)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(K,JSON.stringify(st))}catch(e){}};
window.QUALITY=QS[st.q]||QS.orta;
let busy=false,curA=null,cur=null;const inst={};

function fs(){try{const d=document.documentElement;if(!document.fullscreenElement&&d.requestFullscreen&&!matchMedia('(display-mode: fullscreen)').matches){d.requestFullscreen().catch(()=>{});screen.orientation.lock('landscape').catch(()=>{})}}catch(e){}}
function upd(){$('cnt').textContent=fmt(st.rolls)+' roll'}
function card(a){const r=$('rn');r.textContent=a.n;r.style.color=a.c;r.style.textShadow='0 0 24px '+a.c;$('ro').textContent='1 in '+fmt(a.o);r.classList.remove('pop');void r.offsetWidth;r.classList.add('pop')}
function pick(){const L=st.luck;for(const a of AU.slice().sort((x,y)=>y.o-x.o))if(Math.random()<Math.min(1,L/a.o))return a;return AU[0]}

function play(a){
 if(!window.AURAS||!window.AURAS[a.id]){card(a);busy=false;return}
 busy=true;curA=a;const h=$('aura');h.style.display='block';$('hud').style.visibility='hidden';
 try{cur=inst[a.id]=inst[a.id]||window.AURAS[a.id](h);cur.start()}catch(e){closeA();return}
 setTimeout(()=>$('x').classList.add('on'),1500)
}
function closeA(){
 try{cur&&cur.stop()}catch(e){}
 $('aura').style.display='none';$('hud').style.visibility='';$('x').classList.remove('on');
 if(curA)card(curA);busy=false
}
$('x').onclick=closeA;

$('roll').onclick=()=>{
 if(busy)return;busy=true;fs();
 $('rn').textContent='...';$('rn').style.color='';$('rn').style.textShadow='';$('ro').textContent='';$('roll').classList.add('on');
 setTimeout(()=>{
  const a=pick();st.rolls++;st.inv[a.id]=(st.inv[a.id]||0)+1;save();upd();$('roll').classList.remove('on');
  if(a.big)play(a);else{card(a);busy=false}
 },700)
};

function panel(id,on){$(id).classList.toggle('on',on)}
document.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{panel('inv',false);panel('set',false)});
function renderInv(){
 const g=$('ig');g.innerHTML='';
 AU.slice().sort((x,y)=>y.o-x.o).forEach(a=>{
  const n=st.inv[a.id]||0,d=document.createElement('button');d.className='it';
  const b=document.createElement('b'),i=document.createElement('i'),u=document.createElement('u');
  if(n){b.textContent=a.n;b.style.color=a.c;i.textContent='1 in '+fmt(a.o);u.textContent='x'+fmt(n);d.append(b,i,u);
   d.onclick=()=>{if(busy)return;panel('inv',false);if(a.big)play(a);else card(a)}}
  else{b.textContent='???';i.textContent='keşfedilmedi';d.append(b,i)}
  g.appendChild(d)})
}
$('bi').onclick=()=>{renderInv();panel('inv',true)};

function seg(el,items,sel,fn){el.innerHTML='';items.forEach(([v,l])=>{const b=document.createElement('button');b.textContent=l;if(v===sel)b.className='sel';b.onclick=()=>fn(v);el.appendChild(b)})}
function renderSet(){
 seg($('sq'),Object.keys(QS).map(k=>[k,QN[k]]),st.q,v=>{st.q=v;save();location.reload()});
 seg($('sl'),LK.map(v=>[v,'x'+fmt(v)]),st.luck,v=>{st.luck=v;save();renderSet()})
}
$('bs').onclick=()=>{renderSet();panel('set',true)};
$('rs').onclick=()=>{if(confirm('Tüm roll ve envanter silinsin mi?')){try{localStorage.removeItem(K)}catch(e){}location.reload()}};
upd();
})();
