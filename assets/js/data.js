/* ══ بيانات تجريبية للعرض فقط ══════════════════════════════════════════
   في المنتج الحقيقي تأتي من الخادم (API) مع الصور وروابط التحميل الموقّعة.
   الأسعار والتواريخ والأعداد هنا أمثلة لا قواعد.                           */
(function(){
  var DAY=864e5, now=Date.now();
  function ago(d){ return new Date(now-d*DAY).toISOString().slice(0,10) }
  var P={
    AJ:{i:'AJ',n:'عبدالملك جاسم',en:'Abdulmlik Jassim',c:'#EC3B3C'},
    KM:{i:'KM',n:'Harf Type',en:'Harf Type',c:'#6233F5'},
    MD:{i:'MD',n:'Mathieu Desjardins',en:'Mathieu Desjardins',c:'#EC3B3C'},
    SN:{i:'SN',n:'سارة نبيل',en:'Sara Nabil',c:'#008BFE'},
    HR:{i:'HR',n:'حسن رضا',en:'Hassan Reda',c:'#2CAE53'},
    LY:{i:'LY',n:'ليلى يوسف',en:'Layla Yousef',c:'#F5A524'},
    OM:{i:'OM',n:'عمر مراد',en:'Omar Murad',c:'#434052'}
  };
  /* type: free | trial | paid — use: personal | commercial
     langs: ar ku fa ur la — cat: classic headline text decorative modern */
  var F=[
    {id:'zaetoon',name:'Zaetoon Typeface',by:['AJ','KM'],byLabel:'Abdmk Jassim & Harf Type',weights:10,langs:['ar','ku','fa','la'],type:'free',use:'commercial',cat:'text',date:ago(4),pop:980,price:0,style:'وزن متغير',
     tags:['Variable font','Clen','عربي إبداعي','نسخ بسيط','Sans','نسخ','Text','عربي']},
    {id:'tajarib',name:'Tajarib Typeface',by:['AJ','KM','SN','HR','LY'],weights:5,langs:['ar','fa'],type:'free',use:'commercial',cat:'headline',date:ago(12),pop:870,price:0},
    {id:'roobert',name:'Roobert Arabic TRIAL',by:['MD'],weights:7,langs:['ar','la'],type:'trial',use:'personal',cat:'modern',date:ago(40),pop:910,price:320},
    {id:'naskh',name:'Naskh Hadith',by:['SN'],weights:6,langs:['ar','ur','fa'],type:'paid',use:'commercial',cat:'classic',date:ago(90),pop:640,price:180},
    {id:'kufa',name:'Kufa Grid',by:['HR'],weights:4,langs:['ar','ku'],type:'free',use:'personal',cat:'decorative',date:ago(2),pop:520,price:0},
    {id:'thuluth',name:'Thuluth Modern',by:['LY','AJ'],weights:3,langs:['ar'],type:'paid',use:'commercial',cat:'classic',date:ago(200),pop:450,price:640},
    {id:'sahat',name:'Sahat Display',by:['OM'],weights:8,langs:['ar','la'],type:'trial',use:'personal',cat:'headline',date:ago(25),pop:770,price:260},
    {id:'rawi',name:'Rawi Text',by:['KM'],weights:9,langs:['ar','fa','ur','la'],type:'paid',use:'commercial',cat:'text',date:ago(150),pop:690,price:420},
    {id:'nuqta',name:'Nuqta Sans',by:['AJ'],weights:6,langs:['ar','ku','la'],type:'free',use:'commercial',cat:'modern',date:ago(6),pop:830,price:0},
    {id:'zakhrafa',name:'Zakhrafa',by:['LY'],weights:1,langs:['ar'],type:'free',use:'personal',cat:'decorative',date:ago(300),pop:300,price:0},
    {id:'lamsa',name:'Lamsa Round',by:['SN','OM'],weights:5,langs:['ar','fa'],type:'paid',use:'commercial',cat:'modern',date:ago(60),pop:600,price:880},
    {id:'mahbar',name:'Mahbar Serif',by:['HR','KM'],weights:7,langs:['ar','ku','fa','ur'],type:'trial',use:'personal',cat:'text',date:ago(170),pop:560,price:540}
  ];
  window.HARF_DATA={
    people:P, fonts:F,
    langs:{ar:'العربية',ku:'الكردية',fa:'الفارسية',ur:'الأردية',la:'اللاتينية'},
    langShort:{ar:'عربي',ku:'كردي',fa:'فارسي',ur:'أردي',la:'لاتيني'},
    cats:{classic:'كلاسيكية',headline:'عناوين',text:'نصوص',decorative:'زخرفية',modern:'حديثة'},
    types:{free:'مجاني',trial:'تجريبي',paid:'مدفوع'},
    uses:{personal:'شخصي',commercial:'تجاري & شخصي'}
  };
})();
