/* يُحمَّل في <head> قبل الرسم: يطبّق الوضع المحفوظ فلا يومض الفاتح قبل الداكن. */
(function(){
  var t=null;
  try{ t=localStorage.getItem('harf-theme') }catch(e){}
  if(t!=='light'&&t!=='dark') t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  document.documentElement.setAttribute('data-theme',t);
})();
