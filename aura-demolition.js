window.AURAS=window.AURAS||{};
window.AURAS.demolition=function(host){
const QL=window.QUALITY;
const W=()=>innerWidth,H=()=>innerHeight,cl=x=>Math.min(1,Math.max(0,x)),es=x=>{x=cl(x);return x*x*(3-2*x)};
const AD=THREE.AdditiveBlending;
const R=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});R.setPixelRatio(Math.min(devicePixelRatio,QL.pr));R.setSize(W(),H());host.appendChild(R.domElement);
const S=new THREE.Scene();S.background=new THREE.Color(0x030304);S.fog=new THREE.FogExp2(0x060507,.008);
const fv=()=>W()<H()?80:55;const C=new THREE.PerspectiveCamera(fv(),W()/H(),.1,400);
const N2=`float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.03+7.;a*=.5;}return s;}`;
const N3=`float h3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}`;
const VP=`varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const AM=(u,v,f,o)=>new THREE.ShaderMaterial(Object.assign({uniforms:u,vertexShader:v,fragmentShader:f},o||{}));
const ADD={transparent:true,depthWrite:false,blending:AD,side:THREE.DoubleSide};

/* ---- zemin kasırgası ---- */
const gU={t:{value:0},g:{value:0}};
const ground=new THREE.Mesh(new THREE.PlaneGeometry(150,150),AM(gU,`varying vec2 v;void main(){v=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
`uniform float t,g;varying vec2 v;`+N2+`void main(){float r=length(v);float Rm=g*60.+.01;float m=smoothstep(Rm,Rm*.55,r);float a=atan(v.y,v.x);
float sa=a-t*.8+log(r+1.)*2.6;vec2 q=vec2(cos(sa),sin(sa))*(1.+r*.05);float f=fbm(q*1.8+vec2(0.,t*.15));
float arms=smoothstep(.25,.8,f);vec3 col=vec3(.5,.5,.53)*(.04+arms*.6)*(1.-r/95.);
float l=1.-abs(fbm(q*3.2+vec2(t*.3,-t*.5))*2.-1.);l=pow(l,10.)*smoothstep(.3,.7,fbm(q*1.1+7.));
col+=vec3(1.,.05,.02)*l*2.;col+=vec3(1.,.15,.05)*exp(-r*.12)*.35*g;gl_FragColor=vec4(col*m,1.);}`));
ground.rotation.x=-Math.PI/2;S.add(ground);

/* ---- parçacık sistemi (kıvılcım, toz) ---- */
function mkP(N,col,sz,hg,sp,rm){const a=new Float32Array(N*3);for(let i=0;i<N;i++){a[i*3]=Math.pow(Math.random(),.7)*rm+2;a[i*3+1]=Math.random()*6.283;a[i*3+2]=Math.random()}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3));g.setAttribute('a',new THREE.BufferAttribute(a,3));
const u={t:{value:0},g:{value:0},pr:{value:R.getPixelRatio()},sz:{value:sz},hg:{value:hg},sp:{value:sp},col:{value:new THREE.Color(col)}};
const m=new THREE.Points(g,AM(u,`attribute vec3 a;uniform float t,g,pr,sz,hg,sp;varying float k;void main(){float r=a.x*g;float an=a.y+t*sp*(1.+4./(a.x*.2+2.));float life=fract(a.z+t*.22);float y=.2+life*hg*(.4+a.z);k=sin(life*3.14159);vec4 mv=modelViewMatrix*vec4(cos(an)*r,y,sin(an)*r,1.);gl_PointSize=sz*pr*(1.+a.z)/(-mv.z)*300.;gl_Position=projectionMatrix*mv;}`,
`uniform vec3 col;varying float k;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(col*k*(1.-d*d)*2.,1.);}`,ADD));
m.frustumCulled=false;S.add(m);return m}
const sparks=mkP(Math.round(3200*QL.p),0xff3a14,.55,7,.9,48),embers=mkP(Math.round(900*QL.p),0xffa030,.4,22,.5,40),dust=mkP(Math.round(1400*QL.p),0x2a2a30,.5,16,.25,50);

/* ---- plazma topu ---- */
const bU={t:{value:0}};
const ball=new THREE.Mesh(new THREE.IcosahedronGeometry(3,6),AM(bU,N3+`uniform float t;varying vec3 p,nn,vv;void main(){p=position;nn=normalize(normalMatrix*normal);float d=n3(position*.9+t*.6)*.5+n3(position*2.+t)*.25;vec3 pp=position*(1.+.13*d);vec4 mv=modelViewMatrix*vec4(pp,1.);vv=-mv.xyz;gl_Position=projectionMatrix*mv;}`,
N3+`uniform float t;varying vec3 p,nn,vv;void main(){float f=n3(p*1.3+vec3(0.,t*.8,0.))*.55+n3(p*3.+t*1.5)*.3+n3(p*7.-t*2.)*.15;float fr=pow(1.-max(dot(normalize(nn),normalize(vv)),0.),2.);float x=f+fr*.5;
vec3 c=mix(vec3(1.,.1,.02),vec3(1.,.55,.1),smoothstep(.3,.6,x));c=mix(c,vec3(1.,.95,.7),smoothstep(.55,.85,x));gl_FragColor=vec4(c*(1.+fr*.8),1.);}`));
S.add(ball);
function gt(c){const k=document.createElement('canvas');k.width=k.height=128;const x=k.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,c+'1)');g.addColorStop(.3,c+'.35)');g.addColorStop(1,c+'0)');x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(k)}
const spr=(c,s)=>{const m=new THREE.Sprite(new THREE.SpriteMaterial({map:gt(c),blending:AD,depthWrite:false,transparent:true}));m.scale.set(s,s,1);return m};
const bg1=spr('rgba(255,150,60,',15),bg2=spr('rgba(255,30,10,',38);S.add(bg1,bg2);
const PL=new THREE.PointLight(0xff5a2a,8,100,1.2);const DL=new THREE.DirectionalLight(0x6070ff,.35);DL.position.set(-20,30,20);S.add(PL,new THREE.AmbientLight(0x2a2024,1),DL);

/* ---- kuasarlar ---- */
const qT={t:{value:0}},Q=[],QS=[];
function mkQ(s){const o=new THREE.Group(),sp=new THREE.Group();o.add(sp);
const disk=new THREE.Mesh(new THREE.RingGeometry(1.2,9,128),AM(qT,VP,N3+`varying vec3 p;void main(){float r=length(p.xy);float a=atan(p.y,p.x);float f=n3(vec3(cos(a+r*.9)*r*.6,sin(a+r*.9)*r*.6,r*.5)*1.5);float arm=.5+.5*sin(a*3.+r*1.8);float e=smoothstep(1.2,1.8,r)*(1.-smoothstep(6.,9.,r));gl_FragColor=vec4(vec3(1.,.12,.04)*(1.6+4.*arm*f)*e*(1.+2./(r*r)),1.);}`,ADD));
disk.rotation.x=-Math.PI/2;sp.add(disk);
const jm=AM(qT,VP,`varying vec3 p;void main(){float u=(p.y+6.)/12.;float a=atan(p.z,p.x);float s=.4+.6*sin(a*4.+p.y*.9);gl_FragColor=vec4(vec3(1.,.1,.04)*4.*pow(1.-u,1.2)*s,1.);}`,ADD);
const j1=new THREE.Mesh(new THREE.ConeGeometry(.9,12,32,1,true),jm);j1.position.y=6;
const j2=new THREE.Mesh(new THREE.ConeGeometry(.9,12,32,1,true),jm);j2.position.y=-6;j2.rotation.x=Math.PI;
const core=new THREE.Mesh(new THREE.SphereGeometry(1.3,24,24),new THREE.MeshBasicMaterial({color:0xffb0a0}));
const j3=j1.clone(),j4=j2.clone();[j3,j4].forEach(j=>j.scale.set(2.4,1.4,2.4));j3.position.y=8.4;j4.position.y=-8.4;sp.add(j1,j2,j3,j4,core);o.add(spr('rgba(255,40,20,',30),spr('rgba(255,160,120,',9),new THREE.PointLight(0xff1a0a,5,60,1.5));
o.rotation.set(.42,0,s*.5);o.position.set(s*14,12,-9);o.scale.setScalar(.001);o.visible=false;S.add(o);Q.push(o);QS.push(sp)}
mkQ(-1);mkQ(1);

/* ---- şimşek ---- */
const LN=[];for(let i=0;i<14;i++){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(48),3));const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xff2a18,transparent:true,blending:AD,depthWrite:false}));l.frustumCulled=false;l.visible=false;S.add(l);LN.push(l)}
function zap(l,a,b,j){const p=l.geometry.attributes.position;for(let i=0;i<16;i++){const k=i/15,e=i>0&&i<15?j:0;p.setXYZ(i,a.x+(b.x-a.x)*k+(Math.random()-.5)*e,a.y+(b.y-a.y)*k+(Math.random()-.5)*e,a.z+(b.z-a.z)*k+(Math.random()-.5)*e)}p.needsUpdate=true}

/* ---- şok dalgaları ---- */
let WV=[];
function wave(t,big){const m=new THREE.Mesh(new THREE.RingGeometry(.9,1,96).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xff3018,transparent:true,blending:AD,depthWrite:false,side:THREE.DoubleSide}));m.position.y=.2;S.add(m);WV.push({m,t0:t,big})}

/* ---- kaya ve demir parçaları ---- */
const DN=Math.round(70*Math.max(QL.p,.5)),dm=new THREE.Object3D(),vv=new THREE.Vector3();
const rock=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),new THREE.MeshStandardMaterial({color:0x6a625c,roughness:.9,flatShading:true,emissive:0x1a0600}),DN);
const iron=new THREE.InstancedMesh(new THREE.BoxGeometry(2,.5,.9),new THREE.MeshStandardMaterial({color:0x9aa0aa,metalness:.85,roughness:.35,flatShading:true,emissive:0x200800}),DN);
S.add(rock,iron);
function mk(n){const a=[];for(let i=0;i<n;i++)a.push({r:5.5+Math.random()*6.5,w:(.3+Math.random()*.9)*(Math.random()<.2?-1:1),ph:Math.random()*6.28,q:new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random()*1.2-.6,Math.random()*6.28,Math.random()*1.2-.6)),s:[.2+Math.random()*.6,.2+Math.random()*.5,.15+Math.random()*.7],sp:[Math.random()*2,Math.random()*2,Math.random()*2],d:i*.04});return a}
const RD=mk(DN),ID=mk(DN);
function up(m,A,t,by){for(let i=0;i<A.length;i++){const d=A[i],th=d.ph+t*d.w;vv.set(Math.cos(th)*d.r,Math.sin(th*2)*.6,Math.sin(th)*d.r).applyQuaternion(d.q);vv.y+=by;dm.position.copy(vv);const k=es((t-13-d.d)/1.2);dm.scale.set(d.s[0]*k,d.s[1]*k,d.s[2]*k);dm.rotation.set(t*d.sp[0],t*d.sp[1],t*d.sp[2]);dm.updateMatrix();m.setMatrixAt(i,dm.matrix)}m.instanceMatrix.needsUpdate=true}

/* ---- post-process ---- */
const comp=new THREE.EffectComposer(R);comp.addPass(new THREE.RenderPass(S,C));
const bloom=new THREE.UnrealBloomPass(new THREE.Vector2(W(),H()),.7,.6,.45);comp.addPass(bloom);bloom.enabled=QL.bloom;
const fx=new THREE.ShaderPass({uniforms:{tDiffuse:{value:null},ca:{value:.005},vg:{value:.9}},vertexShader:`varying vec2 u;void main(){u=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
fragmentShader:`uniform sampler2D tDiffuse;uniform float ca,vg;varying vec2 u;void main(){vec2 d=u-.5;float r=length(d);vec2 o=d*ca*(1.+r*4.);vec3 c=vec3(texture2D(tDiffuse,u+o).r,texture2D(tDiffuse,u).g,texture2D(tDiffuse,u-o).b);c*=1.-smoothstep(.35,.95,r)*vg;gl_FragColor=vec4(c,1.);}`});comp.addPass(fx);
addEventListener('resize',()=>{R.setSize(W(),H());comp.setSize(W(),H());C.aspect=W()/H();C.fov=fv();C.updateProjectionMatrix()});

/* ---- ses ---- */
let AC,NB,A0;
function ns(t,d,ty,f0,f1,pk,at){const s=AC.createBufferSource();s.buffer=NB;const f=AC.createBiquadFilter();f.type=ty;f.frequency.setValueAtTime(f0,A0+t);f.frequency.exponentialRampToValueAtTime(f1,A0+t+d);const g=AC.createGain();g.gain.setValueAtTime(0,A0+t);g.gain.linearRampToValueAtTime(pk,A0+t+at);g.gain.linearRampToValueAtTime(0,A0+t+d);s.connect(f);f.connect(g);g.connect(AC.destination);s.start(A0+t);s.stop(A0+t+d+.1)}
function tn(t,d,ty,f0,f1,pk,at){const o=AC.createOscillator();o.type=ty;o.frequency.setValueAtTime(f0,A0+t);o.frequency.exponentialRampToValueAtTime(f1,A0+t+d);const g=AC.createGain();g.gain.setValueAtTime(0,A0+t);g.gain.linearRampToValueAtTime(pk,A0+t+at);g.gain.linearRampToValueAtTime(0,A0+t+d);o.connect(g);g.connect(AC.destination);o.start(A0+t);o.stop(A0+t+d+.1)}
function sound(){try{if(AC)AC.close();AC=new (window.AudioContext||window.webkitAudioContext)();const b=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;NB=b;A0=AC.currentTime+.1;
ns(0,18,'lowpass',60,220,.9,7);ns(.5,6,'bandpass',200,900,.5,5);
ns(3,2.2,'bandpass',300,6000,.7,2.1);tn(3,2.2,'sawtooth',40,200,.2,2.1);
tn(5.2,1.8,'sine',90,28,1,.01);ns(5.2,1.5,'lowpass',2000,100,1,.01);tn(5.5,40,'sawtooth',55,57,.1,2);
tn(6.9,1.2,'triangle',100,800,.25,1.1);tn(8.1,1.8,'sine',70,25,1,.01);ns(8.1,1.4,'lowpass',3000,120,.9,.01);
tn(8.2,40,'square',110,112,.04,1.5);tn(8.2,40,'sawtooth',165,167,.03,1.5);
for(let k=6;k<45;k+=.07)if(Math.random()<.6)ns(k,.05,'highpass',3000,3200,.05+Math.random()*.2,.003);
for(let k=13;k<45;k+=.22)if(Math.random()<.7){const f=700+Math.random()*1800;tn(k,.25,'triangle',f,f*.98,.06,.003)}
tn(15,2.5,'sine',60,20,1,.02);ns(15,2,'lowpass',1500,80,.9,.02)}catch(e){}}

/* ---- zaman çizelgesi ---- */
const FL=document.getElementById('fl'),TI=document.getElementById('ti');
let T0=0,run=false,fa=0,nextW=0,done=[];
const SKP=[[5.2,1],[8.1,1.2],[9,.8],[15,1.4]];
const EV=[[5.2,()=>{wave(5.2,0);fa=Math.max(fa,.55)}],[8.1,()=>{wave(8.1,1);fa=Math.max(fa,.5)}],[9,()=>{wave(9,1);fa=Math.max(fa,.3)}],[9.5,()=>{TI.classList.add('on')}],[15,()=>{fa=Math.max(fa,.6)}]];
const tmp=new THREE.Vector3();
function update(t){
const g=1-Math.pow(1-cl((t-.3)/5),2);gU.t.value=t;gU.g.value=g;
[sparks,embers,dust].forEach(p=>{p.material.uniforms.t.value=t;p.material.uniforms.g.value=g});
sparks.material.uniforms.sz.value=.55*(.3+g);
const ev=cl((t-9.5)/2);embers.material.uniforms.sz.value=.22*ev;dust.material.uniforms.sz.value=.5*ev;
EV.forEach((e,i)=>{if(!done[i]&&t>=e[0]){done[i]=1;e[1]()}});
if(t>10&&t>nextW){wave(t,0);nextW=t+1.5}
const bt=cl((t-5)/3.2),by=-4.5+es(bt)*14.5;
ball.visible=t>4.9;ball.position.set(0,by,0);ball.scale.setScalar((.3+.7*es(bt))*(1+.03*Math.sin(t*9)));bU.t.value=t;
PL.position.set(0,by+2,0);PL.intensity=(5+Math.sin(t*23)*1.5)*es(bt);
bg1.position.copy(ball.position);bg2.position.copy(ball.position);bg1.material.opacity=bg2.material.opacity=es(bt);
qT.t.value=t;const qs=es((t-8)/1.6);
Q.forEach((o,i)=>{o.visible=qs>0;o.scale.setScalar(qs*1.3+.001);QS[i].rotation.y=t*5.236*(i?1:-1);o.position.y=12+Math.sin(t*.7+i*3)*.5});
for(let i=WV.length-1;i>=0;i--){const w=WV[i],a=(t-w.t0)/(w.big?2.2:1.8);if(a>1){S.remove(w.m);WV.splice(i,1);continue}w.m.scale.setScalar(1+a*(w.big?65:42));w.m.material.opacity=(1-a)*(w.big?1.2:.7)}
const nl=t<5.8?0:t<9.5?4:LN.length;
LN.forEach((l,i)=>{l.visible=i<nl;if(i<nl&&Math.random()<.22){const an=Math.random()*6.283,rr=5+Math.random()*28;const dir=new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(3);let a=ball.position.clone().add(dir),b=new THREE.Vector3(Math.cos(an)*rr,.3,Math.sin(an)*rr);if(i%2==0&&t>8.6){a=Q[i%2].position.clone();b=ball.position.clone().add(dir)}zap(l,a,b,a.distanceTo(b)*.12);l.material.color.setHex(Math.random()<.3?0xffd0c0:0xff2a18)}});
rock.visible=iron.visible=t>13;if(t>13){up(rock,RD,t,by);up(iron,ID,t,by)}
let sk=.02*ev+.05*bt;SKP.forEach(s=>{if(t>s[0])sk+=s[1]*Math.exp(-(t-s[0])*3)});
const sh=()=>(Math.random()-.5)*sk*.9;
C.position.set(Math.sin(t*.1)*3+sh(),8+es(t/14)*3+sh(),40-es(t/16)*9);C.lookAt(0,5+4*bt,0);
S.fog.density=.008+ev*.005;
fx.uniforms.ca.value=.004+sk*.012;bloom.strength=.65+sk*.25+(t>8?.1:0);
fa*=.93;FL.style.opacity=fa<.01?0:fa*.45;
}
let raf=0;
function loop(){if(!run)return;update((performance.now()-T0)/1000);comp.render();raf=requestAnimationFrame(loop)}
function start(){WV.forEach(w=>S.remove(w.m));WV=[];done=[];nextW=0;fa=0;TI.classList.remove('on');sound();T0=performance.now();if(!run){run=true;loop()}}
function stop(){run=false;cancelAnimationFrame(raf);try{AC.close()}catch(e){}TI.classList.remove('on');FL.style.opacity=0}
return {start,stop};
};
