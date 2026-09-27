/* ══ مكتبة حرف — سكربت مشترك بين الصفحات ═══════════════════════════════
   كل نصّ متغيّر يُكتب بـ textContent. لا أسرار ولا مفاتيح هنا.           */
(function(){
'use strict';
var D=window.HARF_DATA;
var reduce=matchMedia('(prefers-reduced-motion: reduce)');

/* ── أدوات ── */
function $(id){ return document.getElementById(id) }
function el(tag,cls,txt){ var e=document.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e }
function icon(n,s,extra){
  var NS='http://www.w3.org/2000/svg', svg=document.createElementNS(NS,'svg'), u=document.createElementNS(NS,'use');
  svg.setAttribute('class','ic'+(extra?' '+extra:'')); svg.setAttribute('width',s||16); svg.setAttribute('height',s||16);
  svg.setAttribute('aria-hidden','true'); u.setAttribute('href','#i-'+n); svg.appendChild(u); return svg;
}
function add(p){ for(var i=1;i<arguments.length;i++){ var c=arguments[i]; if(c==null) continue; p.appendChild(typeof c==='string'?document.createTextNode(c):c) } return p }
function store(k,v){ try{ if(v===undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k,JSON.stringify(v)) }catch(e){ return null } }
function weightsLabel(n){ return n===1?'وزن واحد':n===2?'وزنان':n<=10?n+' أوزان':n+' وزناً' }
function trap(root,e){
  var f=[].filter.call(root.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),[tabindex]:not([tabindex="-1"]),[contenteditable="true"]'),
    function(x){ return x.offsetParent!==null });
  if(!f.length) return;
  var a=f[0], z=f[f.length-1];
  if(e.shiftKey&&(document.activeElement===a||!root.contains(document.activeElement))){ e.preventDefault(); z.focus() }
  else if(!e.shiftKey&&document.activeElement===z){ e.preventDefault(); a.focus() }
}
/* يضع عنصراً منزلقاً تحت الزرّ المختار (مؤشّر التنقّل، مبدّل الترتيب، التبويبات) */
function slideTo(ind,target,host){
  if(!ind||!target) return;
  var h=host.getBoundingClientRect(), r=target.getBoundingClientRect();
  ind.style.width=r.width+'px';
  ind.style.transform='translateX('+(r.left-h.left+host.scrollLeft)+'px)';
}

/* ══ الترويسة ══ */
var pops=[];
function wire(btnId,popId){
  var b=$(btnId), p=$(popId); if(!b||!p) return;
  pops.push({b:b,p:p});
  b.addEventListener('click',function(e){
    e.stopPropagation();
    var was=p.classList.contains('open'); closeAll();
    if(!was){ p.classList.add('open'); b.setAttribute('aria-expanded','true') }
  });
  p.addEventListener('click',function(e){ e.stopPropagation() });
}
function closeAll(){ pops.forEach(function(o){ o.p.classList.remove('open'); o.b.setAttribute('aria-expanded','false') }) }
document.addEventListener('click',closeAll);
document.addEventListener('keydown',function(e){
  if(e.key!=='Escape') return;
  var open=pops.filter(function(o){ return o.p.classList.contains('open') })[0];
  closeAll(); if(open&&open.p.contains(document.activeElement)) open.b.focus();
});
wire('HBELL','HNOTIF'); wire('HCART','HCARTPOP'); wire('HME','HACC');

/* مؤشّر التنقّل */
var nav=document.querySelector('.nav'), navInd=document.querySelector('.nav-ind');
function paintNav(){ var a=nav&&nav.querySelector('[aria-current="page"]'); if(a) slideTo(navInd,a,nav) }
if(nav){
  nav.addEventListener('mouseover',function(e){ var a=e.target.closest('a'); if(a&&!reduce.matches) slideTo(navInd,a,nav) });
  nav.addEventListener('mouseleave',paintNav);
  addEventListener('resize',paintNav);
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(paintNav);
  paintNav();
}

/* الإشعارات */
(function(){
  var list=$('HNOTES'), dot=$('HBELLDOT'), bell=$('HBELL'); if(!list) return;
  function sync(){
    var n=list.querySelectorAll('.note.unread').length;
    dot.hidden=!n; bell.setAttribute('aria-label','الإشعارات'+(n?' — '+n+' غير مقروءة':''));
    $('HNOEMPTY').hidden=!!list.querySelector('.note');
  }
  list.addEventListener('click',function(e){ var n=e.target.closest('.note'); if(!n) return; e.preventDefault(); n.classList.remove('unread'); sync() });
  $('HREADALL').addEventListener('click',function(){ list.querySelectorAll('.unread').forEach(function(x){ x.classList.remove('unread') }); sync() });
  sync();
  /* الجرس يرنّ مرّة عند وجود جديد */
  if(!reduce.matches&&list.querySelector('.unread')) setTimeout(function(){ bell.classList.add('bell-ring'); setTimeout(function(){ bell.classList.remove('bell-ring') },900) },900);
})();

/* الوضع الليلي */
(function(){
  var b=$('HTHEME'); if(!b) return;
  function paint(){ var d=document.documentElement.getAttribute('data-theme')==='dark';
    b.querySelector('use').setAttribute('href',d?'#i-sun':'#i-moon'); b.setAttribute('aria-label',d?'الوضع النهاري':'الوضع الليلي'); b.title=b.getAttribute('aria-label') }
  b.addEventListener('click',function(){
    var root=document.documentElement, d=root.getAttribute('data-theme')==='dark'?'light':'dark';
    if(!reduce.matches){ root.classList.add('theme-anim'); setTimeout(function(){ root.classList.remove('theme-anim') },420) }
    root.setAttribute('data-theme',d);
    try{ localStorage.setItem('harf-theme',d) }catch(e){}
    paint();
  });
  paint();
})();

/* ══ الظهور عند التمرير ══ */
var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){
  es.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add('in'); io.unobserve(x.target) } });
},{rootMargin:'0px 0px -8% 0px'}):null;
function reveal(nodes,stagger){
  [].forEach.call(nodes,function(n,i){
    n.classList.add('reveal'); n.style.setProperty('--i',stagger===false?0:i%6);
    if(!io||reduce.matches) n.classList.add('in'); else io.observe(n);
  });
}

/* ══ المفضّلة (في هذا المتصفّح فقط — في المنتج تُحفظ في الحساب) ══ */
var favs=store('harf-favs')||[];
function isFav(id){ return favs.indexOf(id)>-1 }
function toggleFav(id,btn){
  var on=!isFav(id);
  if(on) favs.push(id); else favs=favs.filter(function(x){ return x!==id });
  store('harf-favs',favs);
  document.querySelectorAll('[data-fav="'+id+'"]').forEach(function(b){
    b.setAttribute('aria-pressed',String(on));
    b.querySelector('use').setAttribute('href',on?'#i-heart-s':'#i-heart');
  });
  if(btn&&!reduce.matches){ btn.classList.remove('pop-anim'); void btn.offsetWidth; btn.classList.add('pop-anim') }
}
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-fav]'); if(b){ e.preventDefault(); toggleFav(b.getAttribute('data-fav'),b); return }
  var d=e.target.closest('.dl'); if(d){ e.preventDefault(); download(d) }
});
/* التحميل: في المنتج يطلب الخادم رابطاً موقّتاً موقّعاً بعد التحقّق من الترخيص */
function download(b){
  if(b.classList.contains('busy')) return;
  var label=b.querySelector('span'), old=label.textContent;
  b.classList.add('busy'); label.textContent='جارٍ…';
  setTimeout(function(){
    b.classList.add('done'); label.textContent='تمّ'; b.querySelector('use').setAttribute('href','#i-check');
    setTimeout(function(){ b.classList.remove('done','busy'); label.textContent=old; b.querySelector('use').setAttribute('href','#i-download') },1600);
  },700);
}

/* ══ بطاقة الخط ══ */
function avatars(ids,max){
  var s=el('span','avs'); s.setAttribute('aria-hidden','true');
  ids.slice(0,max||2).forEach(function(k){ var p=D.people[k], i=el('i',null,p.i); i.style.background=p.c; s.appendChild(i) });
  if(ids.length>(max||2)){ s.appendChild(el('i','more',(ids.length-(max||2))+'+')) }
  return s;
}
function byline(f){
  if(f.byLabel) return f.byLabel;
  var first=D.people[f.by[0]];
  return f.by.length===1?first.en:first.n;
}
function card(f){
  var c=el('article','card'), href='font.html?id='+encodeURIComponent(f.id);
  var art=el('div','art'); art.setAttribute('aria-hidden','true');
  var bd=el('span','badge '+f.type); bd.appendChild(icon(f.type==='trial'?'clock':f.type==='paid'?'crown':'check',12)); add(bd,D.types[f.type]);
  var fav=el('button','fav'); fav.type='button'; fav.setAttribute('data-fav',f.id); fav.setAttribute('aria-pressed',String(isFav(f.id)));
  fav.setAttribute('aria-label','المفضّلة: '+f.name); fav.appendChild(icon(isFav(f.id)?'heart-s':'heart',15));
  var b=el('div','bd'), r1=el('div','r1'), nm=el('a','nm lat',f.name); nm.href=href;
  add(r1,nm,el('span','wt',weightsLabel(f.weights)));
  var by=el('div','by'); by.appendChild(avatars(f.by));
  var nmb=el('span'); if(f.by.length>2&&!f.byLabel){ add(nmb,byline(f)+' ',el('small',null,'و'+(f.by.length-1)+' آخرين')) } else { nmb.textContent=byline(f); if(/^[A-Za-z]/.test(byline(f))) nmb.className='lat' }
  by.appendChild(nmb);
  var r3=el('div','r3'), dl=el('button','btn btn-p btn-sm dl'); dl.type='button'; dl.appendChild(icon('download',14)); dl.appendChild(el('span',null,'تحميل'));
  dl.setAttribute('aria-label','تحميل '+f.name);
  add(r3,el('span','lic',D.uses[f.use]),dl);
  add(b,r1,by,r3); add(c,art,bd,fav,b);
  return c;
}

/* ══ الشريحة (الرئيسية ومعرض صفحة الخط) ══ */
function carousel(root,opt){
  opt=opt||{};
  var track=root.querySelector('.car-track'), slides=track.children, n=slides.length, i=0, timer=null;
  var dots=root.querySelector('.car-dots');
  root.setAttribute('aria-roledescription','شريحة عرض');
  [].forEach.call(slides,function(s,k){ s.setAttribute('role','group'); s.setAttribute('aria-roledescription','شريحة'); s.setAttribute('aria-label',(k+1)+' من '+n) });
  if(dots){ for(var k=0;k<n;k++){ var d=el('button'); d.type='button'; d.setAttribute('aria-label','الشريحة '+(k+1)); d.setAttribute('data-i',k); dots.appendChild(d) } }
  function go(k,user){
    i=(k+n)%n; track.style.transform='translateX('+(i*100)+'%)';
    [].forEach.call(slides,function(s,j){ s.setAttribute('aria-hidden',String(j!==i)); s.inert=j!==i });
    if(dots) [].forEach.call(dots.children,function(d,j){ d.setAttribute('aria-current',String(j===i)) });
    if(opt.onChange) opt.onChange(i);
    if(user) restart();
  }
  function restart(){ clearInterval(timer); if(opt.auto&&!reduce.matches) timer=setInterval(function(){ if(!paused) go(i+1) },opt.auto) }
  var paused=false;
  root.addEventListener('mouseenter',function(){ paused=true }); root.addEventListener('mouseleave',function(){ paused=false });
  root.addEventListener('focusin',function(){ paused=true }); root.addEventListener('focusout',function(){ paused=false });
  document.addEventListener('visibilitychange',function(){ paused=document.hidden });
  var p=root.querySelector('.prev'), nx=root.querySelector('.next');
  if(p) p.addEventListener('click',function(){ go(i-1,true) });
  if(nx) nx.addEventListener('click',function(){ go(i+1,true) });
  if(dots) dots.addEventListener('click',function(e){ var d=e.target.closest('[data-i]'); if(d) go(+d.getAttribute('data-i'),true) });
  root.addEventListener('keydown',function(e){
    if(e.target.closest('input,[contenteditable]')) return;
    if(e.key==='ArrowLeft'){ e.preventDefault(); go(i+1,true) } else if(e.key==='ArrowRight'){ e.preventDefault(); go(i-1,true) }
  });
  /* السحب باللمس */
  var x0=null;
  root.addEventListener('pointerdown',function(e){ if(e.pointerType!=='mouse') x0=e.clientX });
  root.addEventListener('pointerup',function(e){ if(x0==null) return; var dx=e.clientX-x0; x0=null; if(Math.abs(dx)>40) go(dx<0?i+1:i-1,true) });
  go(0); restart();
  return {go:function(k){ go(k,true) },get index(){ return i }};
}

/* ══ لوحة التصفية ══ */
function rangeCtl(box,stops,fmt,onInput){
  var a=box.querySelector('input.a'), b=box.querySelector('input.b'), ticks=box.querySelector('.ticks'), max=stops.length-1;
  [a,b].forEach(function(x){ x.min=0; x.max=max; x.step=1 });
  ticks.textContent=''; for(var k=0;k<=max;k++) ticks.appendChild(el('i'));
  var outs=box.parentNode.querySelectorAll('.rvals span');
  function paint(){
    var lo=+a.value, hi=+b.value;
    if(lo>hi){ if(document.activeElement===a) a.value=lo=hi; else b.value=hi=lo }
    box.style.setProperty('--pa',lo/max); box.style.setProperty('--pb',hi/max);
    [].forEach.call(ticks.children,function(t,k){ t.classList.toggle('on',k>=lo&&k<=hi) });
    outs[0].textContent=fmt(stops[lo]); outs[1].textContent=fmt(stops[hi]);
    a.setAttribute('aria-valuetext',fmt(stops[lo])); b.setAttribute('aria-valuetext',fmt(stops[hi]));
    if(onInput) onInput();
  }
  a.addEventListener('input',paint); b.addEventListener('input',paint);
  return {
    get:function(){ return [stops[+a.value],stops[+b.value]] },
    set:function(lo,hi){ a.value=stops.indexOf(lo); b.value=stops.indexOf(hi); paint() },
    full:function(){ return +a.value===0&&+b.value===max },
    reset:function(){ a.value=0; b.value=max; paint() }
  };
}
function drawer(opts){
  var dr=$(opts.id), btn=$(opts.opener); if(!dr) return null;
  var scrim=el('div','scrim'); scrim.hidden=true; document.body.appendChild(scrim);
  var price=rangeCtl(dr.querySelector('[data-range="price"]'),[0,100,200,300,400,500,600,700,800,900,1000],function(v){ return '$'+v });
  var wts=rangeCtl(dr.querySelector('[data-range="weights"]'),[1,2,3,4,5,6,7,8,9,10],function(v){ return v===1?'وزن واحد':weightsLabel(v) });
  dr.querySelectorAll('.fsec-t').forEach(function(t){
    t.addEventListener('click',function(){
      var on=t.getAttribute('aria-expanded')!=='true';
      t.setAttribute('aria-expanded',String(on));
      $(t.getAttribute('aria-controls')).inert=!on;   /* المطويّ لا يُركَّز عليه */
    });
  });
  var opener=null;
  function open(){
    opener=document.activeElement; read(opts.get());
    scrim.hidden=false; dr.hidden=false; dr.classList.remove('closing');
    document.body.style.overflow='hidden';
    dr.getBoundingClientRect();
    requestAnimationFrame(function(){ scrim.classList.add('open'); dr.classList.add('open'); dr.querySelector('.dr-x').focus({preventScroll:true}) });
    if(btn) btn.setAttribute('aria-expanded','true');
  }
  function close(){
    if(!dr.classList.contains('open')) return;
    dr.classList.remove('open'); dr.classList.add('closing'); scrim.classList.remove('open');
    document.body.style.overflow='';
    if(btn) btn.setAttribute('aria-expanded','false');
    setTimeout(function(){ if(!dr.classList.contains('open')){ dr.hidden=true; scrim.hidden=true; dr.classList.remove('closing') } },reduce.matches?0:560);
    if(opener&&opener.focus) opener.focus({preventScroll:true});
  }
  function val(name){ var x=dr.querySelector('input[name="'+name+'"]:checked'); return x?x.value:'all' }
  function write(){
    return {use:val('f-use'),date:val('f-date'),
      langs:[].map.call(dr.querySelectorAll('input[name="f-lang"]:checked'),function(x){ return x.value }),
      price:price.full()?null:price.get(), weights:wts.full()?null:wts.get()};
  }
  function read(s){
    dr.querySelector('input[name="f-use"][value="'+s.use+'"]').checked=true;
    dr.querySelector('input[name="f-date"][value="'+s.date+'"]').checked=true;
    dr.querySelectorAll('input[name="f-lang"]').forEach(function(x){ x.checked=s.langs.indexOf(x.value)>-1 });
    if(s.price) price.set(s.price[0],s.price[1]); else price.reset();
    if(s.weights) wts.set(s.weights[0],s.weights[1]); else wts.reset();
  }
  if(btn) btn.addEventListener('click',open);
  dr.querySelector('.dr-x').addEventListener('click',close);
  scrim.addEventListener('click',close);
  dr.querySelector('[data-apply]').addEventListener('click',function(){ opts.apply(write()); close() });
  dr.querySelector('[data-clear]').addEventListener('click',function(){ read(EMPTY) });
  document.addEventListener('keydown',function(e){
    if(!dr.classList.contains('open')) return;
    if(e.key==='Escape'){ e.preventDefault(); close() } else if(e.key==='Tab') trap(dr,e);
  });
  return {open:open,close:close};
}
var EMPTY={use:'all',date:'all',langs:[],price:null,weights:null};

reveal(document.querySelectorAll('.cta'),false);

window.Harf={$:$,el:el,icon:icon,add:add,card:card,avatars:avatars,reveal:reveal,carousel:carousel,drawer:drawer,slideTo:slideTo,
  weightsLabel:weightsLabel,trap:trap,reduce:reduce,EMPTY:EMPTY,closeAll:closeAll};
})();
