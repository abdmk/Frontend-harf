/* ══ صفحة الخط: المعرض، المعلومات، مختبر الخط، شلال الأوزان، التبويبات ══ */
(function(){
'use strict';
var H=window.Harf, D=window.HARF_DATA, $=H.$, el=H.el, icon=H.icon;

/* الخط المطلوب من الرابط — المعرّف يُطابَق مع القائمة فقط، ولا يُكتب في الصفحة كما هو */
var id=new URLSearchParams(location.search).get('id');
var f=D.fonts.filter(function(x){ return x.id===id })[0]||D.fonts[0];

/* ── العنوان والمعلومات ── */
document.title=f.name+' — مكتبة حرف';
$('CRUMB').textContent=f.name;
$('FNAME').textContent=f.name;
var dsg=$('FDSG'); dsg.textContent='';
f.by.forEach(function(k){ var p=D.people[k], s=el('span'); s.appendChild(H.avatars([k],1)); var t=el('span','lat',p.en); s.appendChild(t); dsg.appendChild(s) });
var favB=$('FFAV'); favB.setAttribute('data-fav',f.id);
try{ var on=(JSON.parse(localStorage.getItem('harf-favs'))||[]).indexOf(f.id)>-1; favB.setAttribute('aria-pressed',String(on)); favB.querySelector('use').setAttribute('href',on?'#i-heart-s':'#i-heart') }catch(e){}
$('FDL').setAttribute('aria-label','تحميل الخط '+f.name);
$('MW').textContent=f.weights; $('ML').textContent=f.langs.length;
$('MU').textContent=D.uses[f.use]; $('MC').textContent=D.cats[f.cat]; $('MY').textContent=f.date.slice(0,4);
var M=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
var d=new Date(f.date); $('IDATE').textContent=d.getDate()+' '+M[d.getMonth()]+' '+d.getFullYear();
$('ILANGS').textContent=f.langs.map(function(l){ return D.langs[l] }).join('، ');
$('IWTS').textContent=H.weightsLabel(f.weights)+(f.style?' | '+f.style:'');
var tags=$('ITAGS'); tags.textContent=''; (f.tags||[D.cats[f.cat],'عربي']).forEach(function(t){ tags.appendChild(el('span',null,t)) });
var files=$('IFILES'); files.textContent='';
['OTF','TTF','WOFF2'].forEach(function(x){ var li=el('li'); li.appendChild(el('span','fn',f.name.replace(/\s+/g,'')+'-'+f.weights+'w.'+x.toLowerCase()+'.zip')); li.appendChild(el('span',null,H.weightsLabel(f.weights)+' · '+x)); files.appendChild(li) });
var lic=el('li'); lic.appendChild(el('span','fn','License.pdf')); lic.appendChild(el('span',null,'ملف الترخيص')); files.appendChild(lic);

/* ── المعرض ── */
var gal=$('GAL'), thumbs=$('THUMBS');
var car=H.carousel(gal,{onChange:function(i){ thumbs.querySelectorAll('button').forEach(function(b,k){ b.setAttribute('aria-current',String(k===i)) }) }});
thumbs.addEventListener('click',function(e){ var b=e.target.closest('button'); if(b) car.go(+b.getAttribute('data-i')) });
var fsBtn=$('GALFS'), fsOpener=null;
function full(on){
  gal.classList.toggle('full',on); document.body.style.overflow=on?'hidden':'';
  fsBtn.setAttribute('aria-label',on?'الخروج من ملء الشاشة':'ملء الشاشة');
  fsBtn.querySelector('use').setAttribute('href',on?'#i-cross':'#i-expand');
  if(on){ fsOpener=document.activeElement; gal.setAttribute('role','dialog'); gal.setAttribute('aria-modal','true'); fsBtn.focus() }
  else { gal.removeAttribute('role'); gal.removeAttribute('aria-modal'); if(fsOpener) fsOpener.focus() }
}
fsBtn.addEventListener('click',function(){ full(!gal.classList.contains('full')) });
document.addEventListener('keydown',function(e){
  if(!gal.classList.contains('full')) return;
  if(e.key==='Escape') full(false); else if(e.key==='Tab') H.trap(gal,e);
});

/* ── مختبر الخط ── */
var T=$('TTEXT'), bar=$('TBAR');
var PRESETS={
  sentence:{t:'لا إبداع حيث لا حرية، ولا فكرة حقيقية تولد في مكان يخشى السؤال.',s:36},
  title:{t:'حرف يصنع الهوية',s:64},
  para:{t:T.textContent.trim(),s:24},
  abc:{t:'ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي',s:36},
  nums:{t:'0123456789 ٠١٢٣٤٥٦٧٨٩ ۰۱۲۳۴۵۶۷۸۹',s:40}
};
var ts={w:300,align:'justify',lh:0,size:24};
var LH=[1.9,1.5,2.4];
function weightStyle(node,w){
  /* الأوزان فوق 600 غير متاحة في خطّ العرض؛ تُحاكى بحدٍّ خفيف (في المنتج يُحمَّل ملف الوزن نفسه) */
  node.style.fontWeight=Math.min(w,600);
  node.style.webkitTextStroke=w>600?((w-600)/100*0.3).toFixed(2)+'px currentColor':'';
}
function paint(){
  T.style.setProperty('--ts-size',ts.size+'px'); T.style.setProperty('--ts-align',ts.align); T.style.setProperty('--ts-lh',LH[ts.lh]);
  weightStyle(T,ts.w);
  var r=$('TSIZE'); r.value=ts.size; r.style.setProperty('--v',((ts.size-12)/(120-12)*100)+'%'); $('TSIZEO').value=ts.size+' px';
  bar.querySelectorAll('[data-w]').forEach(function(b){ b.setAttribute('aria-pressed',String(+b.getAttribute('data-w')===ts.w)) });
  bar.querySelectorAll('[data-align]').forEach(function(b){ b.setAttribute('aria-pressed',String(b.getAttribute('data-align')===ts.align)) });
}
$('PRESETS').addEventListener('click',function(e){
  var b=e.target.closest('[data-p]'); if(!b) return;
  var p=PRESETS[b.getAttribute('data-p')];
  $('PRESETS').querySelectorAll('[data-p]').forEach(function(x){ x.setAttribute('aria-pressed',String(x===b)) });
  T.textContent=p.t; ts.size=p.s; paint();
  if(!H.reduce.matches){ T.classList.remove('swap'); void T.offsetWidth; T.classList.add('swap') }
});
$('TSIZE').addEventListener('input',function(){ ts.size=+this.value; paint() });
bar.addEventListener('click',function(e){
  var b=e.target.closest('button'); if(!b) return;
  if(b.hasAttribute('data-w')){ ts.w=+b.getAttribute('data-w'); paint() }
  else if(b.hasAttribute('data-align')){ ts.align=b.getAttribute('data-align'); paint() }
  else if(b.id==='TLH'){ ts.lh=(ts.lh+1)%LH.length; b.setAttribute('aria-pressed',String(ts.lh!==0)); paint() }
  else if(b.id==='TINV'){ var on=T.classList.toggle('inv'); b.setAttribute('aria-pressed',String(on)) }
  else if(b.id==='TCOPY'){
    var done=function(){ $('TSTATUS').textContent='نُسخ النص'; setTimeout(function(){ $('TSTATUS').textContent='' },1600) };
    if(navigator.clipboard) navigator.clipboard.writeText(T.textContent).then(done,function(){}); else done();
  }
  else if(b.id==='TRESET'){ ts={w:300,align:'justify',lh:0,size:24}; T.classList.remove('inv'); T.textContent=PRESETS.para.t;
    $('PRESETS').querySelectorAll('[data-p]').forEach(function(x){ x.setAttribute('aria-pressed',String(x.getAttribute('data-p')==='para')) });
    ['TLH','TINV'].forEach(function(k){ $(k).setAttribute('aria-pressed','false') }); paint() }
});
/* اللصق نصّاً عادياً فقط، وبطول معقول */
T.addEventListener('paste',function(e){ e.preventDefault(); var t=(e.clipboardData||window.clipboardData).getData('text').slice(0,2000); document.execCommand('insertText',false,t) });
paint();

/* ── شلال الأوزان ── */
var WF=[[100,'Thin'],[200,'ExtraLight'],[300,'Light'],[400,'Regular'],[500,'Medium'],[600,'SemiBold'],[700,'Bold'],[800,'Black'],[1000,'Super']];
var wf=$('WF'); wf.textContent='';
WF.forEach(function(w){
  var li=el('li'), s=el('span','s','نص حكيم له سر قاطع وشأن عظيم، بثوب أخضر وجلد أزرق'); weightStyle(s,w[0]==100?250:w[0]==200?270:w[0]);
  var e=el('span','e',w[1]); weightStyle(e,Math.max(w[0],400));
  li.appendChild(el('span','n',String(w[0]))); li.appendChild(s); li.appendChild(e); wf.appendChild(li);
});
H.reveal(wf.children);

/* ── التبويبات ── */
var tl=$('TABS'), ind=tl.querySelector('.tab-ind'), tabs=[].slice.call(tl.querySelectorAll('[role="tab"]'));
function sel(t,focus){
  tabs.forEach(function(x){ var on=x===t; x.setAttribute('aria-selected',String(on)); x.tabIndex=on?0:-1; $(x.getAttribute('aria-controls')).hidden=!on });
  H.slideTo(ind,t,tl); if(focus) t.focus();
}
tl.addEventListener('click',function(e){ var t=e.target.closest('[role="tab"]'); if(t) sel(t) });
tl.addEventListener('keydown',function(e){
  var k=tabs.indexOf(document.activeElement); if(k<0) return;
  if(e.key==='ArrowLeft'){ e.preventDefault(); sel(tabs[(k+1)%tabs.length],true) }
  if(e.key==='ArrowRight'){ e.preventDefault(); sel(tabs[(k-1+tabs.length)%tabs.length],true) }
});
addEventListener('resize',function(){ H.slideTo(ind,tl.querySelector('[aria-selected="true"]'),tl) });
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){ H.slideTo(ind,tl.querySelector('[aria-selected="true"]'),tl) });
sel(tabs[0]);

/* ── خطوط مشابهة ── */
var rel=D.fonts.filter(function(x){ return x.id!==f.id }).sort(function(a,b){ return (b.cat===f.cat)-(a.cat===f.cat)||b.pop-a.pop }).slice(0,3);
var g=$('RELATED'); rel.forEach(function(x){ g.appendChild(H.card(x)) }); H.reveal(g.children);
H.reveal(document.querySelectorAll('.tester,.tabs'),false);
})();
