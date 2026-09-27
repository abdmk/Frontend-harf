/* ══ الرئيسية: الشريحة، التصنيفات، البحث، الترتيب، التصفية ══ */
(function(){
'use strict';
var H=window.Harf, D=window.HARF_DATA, $=H.$, el=H.el, icon=H.icon;
var DAY=864e5;
var S={cat:'all',q:'',sort:'pop',f:JSON.parse(JSON.stringify(H.EMPTY))};

H.carousel($('HERO'),{auto:6000});

/* ── التصنيفات: الشرائح والقائمة تقرآن الحالة نفسها ── */
var chips=$('CHIPS'), catBtn=$('CATBTN'), catPop=$('CATPOP');
function paintCats(){
  chips.querySelectorAll('[data-cat]').forEach(function(c){ c.setAttribute('aria-pressed',String(c.getAttribute('data-cat')===S.cat)) });
  catPop.querySelectorAll('[data-cat]').forEach(function(c){ c.setAttribute('aria-checked',String(c.getAttribute('data-cat')===S.cat)) });
}
chips.addEventListener('click',function(e){ var c=e.target.closest('[data-cat]'); if(!c) return; S.cat=c.getAttribute('data-cat'); paintCats(); render() });
catBtn.addEventListener('click',function(e){
  e.stopPropagation(); var open=!catPop.classList.contains('open'); H.closeAll();
  catPop.classList.toggle('open',open); catBtn.setAttribute('aria-expanded',String(open));
  if(open) catPop.querySelector('[aria-checked="true"]').focus();
});
catPop.addEventListener('click',function(e){
  e.stopPropagation(); var c=e.target.closest('[data-cat]'); if(!c) return;
  S.cat=c.getAttribute('data-cat'); paintCats(); render(); closeCat(true);
});
function closeCat(focus){ if(!catPop.classList.contains('open')) return; catPop.classList.remove('open'); catBtn.setAttribute('aria-expanded','false'); if(focus) catBtn.focus() }
document.addEventListener('click',function(){ closeCat(false) });
document.addEventListener('keydown',function(e){
  if(!catPop.classList.contains('open')) return;
  if(e.key==='Escape') closeCat(true);
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){ e.preventDefault(); var it=[].slice.call(catPop.querySelectorAll('.it')), k=it.indexOf(document.activeElement);
    it[(k+(e.key==='ArrowDown'?1:-1)+it.length)%it.length].focus() }
});

/* ── البحث: نصّ عادي، يُطابَق ولا يُحقن ── */
var qt=null;
$('Q').addEventListener('input',function(){ var v=this.value; clearTimeout(qt); qt=setTimeout(function(){ S.q=v.trim().slice(0,80).toLowerCase(); render() },160) });
$('QFORM').addEventListener('submit',function(e){ e.preventDefault() });

/* ── الترتيب ── */
var seg=$('SORT'), pill=seg.querySelector('.pill');
function paintSort(){ var on=seg.querySelector('[aria-pressed="true"]'); var h=seg.getBoundingClientRect(), r=on.getBoundingClientRect();
  pill.style.width=r.width+'px'; pill.style.transform='translateX('+(r.left-h.left)+'px)' }
seg.addEventListener('click',function(e){ var b=e.target.closest('[data-sort]'); if(!b) return;
  seg.querySelectorAll('[data-sort]').forEach(function(x){ x.setAttribute('aria-pressed',String(x===b)) }); S.sort=b.getAttribute('data-sort'); paintSort(); render() });
addEventListener('resize',paintSort);
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(paintSort);

/* ── التصفية ── */
var dr=H.drawer({id:'FILTER',opener:'FBTN',get:function(){ return S.f },apply:function(f){ S.f=f; render() }});

/* ── المطابقة ── */
function match(f){
  if(S.cat!=='all'&&f.cat!==S.cat) return false;
  if(S.q){ var hay=(f.name+' '+f.by.map(function(k){ var p=D.people[k]; return p.n+' '+p.en }).join(' ')+' '+(f.byLabel||'')).toLowerCase();
    if(hay.indexOf(S.q)<0) return false }
  var F=S.f;
  if(F.use==='personal'&&f.use!=='personal') return false;
  if(F.use==='commercial'&&f.use!=='commercial') return false;
  if(F.use==='paid'&&f.type==='free') return false;
  if(F.langs.length&&!F.langs.every(function(l){ return f.langs.indexOf(l)>-1 })) return false;
  if(F.date!=='all'){ var age=(Date.now()-Date.parse(f.date))/DAY;
    if(F.date==='year'){ if(new Date(f.date).getFullYear()!==new Date().getFullYear()) return false } else if(age>+F.date) return false }
  if(F.price&&(f.price<F.price[0]||f.price>F.price[1])) return false;
  if(F.weights&&(f.weights<F.weights[0]||f.weights>F.weights[1])) return false;
  return true;
}
var DATES={'7':'آخر 7 أيام','30':'آخر 30 يوماً','180':'آخر 6 أشهر','year':'هذه السنة'};
var USES={personal:'شخصي',commercial:'تجاري',paid:'مدفوع'};
function activeChips(){
  var out=[], F=S.f;
  F.langs.forEach(function(l){ out.push([D.langShort[l],function(){ F.langs=F.langs.filter(function(x){ return x!==l }) }]) });
  if(F.use!=='all') out.push([USES[F.use],function(){ F.use='all' }]);
  if(F.date!=='all') out.push([DATES[F.date],function(){ F.date='all' }]);
  if(F.price) out.push(['$'+F.price[0]+' – $'+F.price[1],function(){ F.price=null }]);
  if(F.weights) out.push([F.weights[0]+'–'+F.weights[1]+' أوزان',function(){ F.weights=null }]);
  if(S.cat!=='all') out.push([D.cats[S.cat],function(){ S.cat='all'; paintCats() }]);
  if(S.q) out.push(['«'+S.q+'»',function(){ S.q=''; $('Q').value='' }]);
  return out;
}
function filterCount(){ var F=S.f; return F.langs.length+(F.use!=='all')+(F.date!=='all')+!!F.price+!!F.weights }

var grid=$('GRID'), first=true;
function render(){
  var list=D.fonts.filter(match).sort(function(a,b){ return S.sort==='new'?Date.parse(b.date)-Date.parse(a.date):b.pop-a.pop });
  /* صفّ النتائج */
  $('COUNT').textContent=list.length+' نتيجة';
  var box=$('ACTIVE'); box.textContent='';
  var ac=activeChips();
  ac.forEach(function(a){
    var b=el('button','fchip'); b.type='button'; b.appendChild(el('span',null,a[0]));
    var x=el('span','x'); x.appendChild(icon('cross-small',12)); b.appendChild(x);
    b.setAttribute('aria-label','إزالة '+a[0]);
    b.addEventListener('click',function(){ a[1](); render(); var n=box.querySelector('.fchip')||$('Q'); n.focus() });
    box.appendChild(b);
  });
  $('CLEARALL').hidden=!ac.length;
  var n=filterCount(), badge=$('FCOUNT'); badge.textContent=n; badge.hidden=!n;
  /* الشبكة */
  grid.textContent='';
  if(!list.length){
    var em=el('div','empty-state'); em.appendChild(el('b',null,'لا خطوط تطابق اختيارك'));
    em.appendChild(el('span',null,'جرّب تصنيفاً آخر أو امسح بعض الفلاتر.'));
    var c=el('button','btn btn-s'); c.type='button'; c.textContent='مسح الكل'; c.addEventListener('click',clearAll); em.appendChild(c);
    grid.appendChild(em);
  } else list.forEach(function(f){ grid.appendChild(H.card(f)) });
  H.reveal(grid.children);
  if(!first&&!H.reduce.matches){ grid.classList.remove('swap'); void grid.offsetWidth; grid.classList.add('swap') }
  first=false;
}
function clearAll(){ S.f=JSON.parse(JSON.stringify(H.EMPTY)); S.cat='all'; S.q=''; $('Q').value=''; paintCats(); render() }
$('CLEARALL').addEventListener('click',clearAll);

paintCats(); render(); paintSort();
})();
