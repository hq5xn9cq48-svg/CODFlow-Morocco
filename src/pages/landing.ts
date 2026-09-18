import { head, logoSvg } from './head'

export function landingPage(): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
${head('تأكد — منصة تشغيل طلبات الدفع عند الاستلام', 'نظّم طلبات متجرك المغربي، أكدها قبل الشحن، وتابع كل عملية حتى التسليم من لوحة واحدة.')}
<style>
  :root { --navy:#102f35; --teal:#117d70; --mint:#e7f3ef; --sand:#f8f5ee; --ink:#183b3f; --muted:#668087; --line:#dce7e2; --white:#fff; --amber:#e8a317; }
  body { background:var(--sand); color:var(--ink); }
  .land-nav { position:sticky; top:0; z-index:20; background:rgba(248,245,238,.9); backdrop-filter:blur(16px); border-bottom:1px solid rgba(220,231,226,.8); }
  .land-nav-inner { max-width:1180px; margin:auto; padding:16px 24px; display:flex; align-items:center; justify-content:space-between; gap:18px; }
  .brand { display:flex; align-items:center; gap:9px; color:var(--navy); text-decoration:none; font-weight:800; font-size:1.2rem; }
  .nav-links { display:none; gap:25px; }
  .nav-links a { color:var(--muted); text-decoration:none; font-size:.92rem; font-weight:600; }
  .nav-links a:hover { color:var(--teal); }
  @media (min-width:800px) { .nav-links { display:flex; } }
  .hero { max-width:1180px; margin:auto; padding:72px 24px 54px; display:grid; gap:48px; align-items:center; }
  @media (min-width:900px) { .hero { grid-template-columns:1.02fr .98fr; direction:ltr; padding-top:88px; } .hero-copy { direction:rtl; } }
  .eyebrow,.kicker { color:var(--teal); font-size:.82rem; font-weight:800; letter-spacing:.04em; }
  .eyebrow { display:inline-flex; align-items:center; gap:8px; margin-bottom:18px; }
  .eyebrow:before { content:''; width:24px; height:2px; background:var(--amber); }
  h1 { color:var(--navy); font-size:clamp(2.35rem,6vw,4.65rem); line-height:1.13; letter-spacing:-.04em; margin-bottom:20px; }
  h1 strong { color:var(--teal); font-weight:800; }
  .hero-copy .sub { color:var(--muted); font-size:clamp(1rem,2vw,1.18rem); line-height:1.9; max-width:590px; margin-bottom:29px; }
  .hero-ctas { display:flex; flex-wrap:wrap; gap:11px; align-items:center; }
  .hero-note { color:var(--muted); font-size:.78rem; margin-top:13px; }
  .btn { border-radius:10px; }
  .hero-visual { direction:rtl; position:relative; }
  .dashboard { background:var(--white); border:1px solid var(--line); border-radius:20px; box-shadow:0 22px 60px rgba(16,47,53,.13); overflow:hidden; }
  .dash-head { background:var(--navy); color:#fff; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; font-size:.8rem; }
  .dash-brand { display:flex; align-items:center; gap:8px; font-weight:700; }
  .dash-dot { width:8px; height:8px; border-radius:50%; background:#82d7b9; }
  .dash-body { padding:20px; }
  .dash-greeting { display:flex; justify-content:space-between; align-items:start; margin-bottom:18px; }
  .dash-greeting h3 { color:var(--navy); font-size:1.05rem; }
  .dash-greeting span { color:var(--muted); font-size:.72rem; }
  .metric-row { display:grid; grid-template-columns:repeat(3,1fr); gap:9px; margin-bottom:19px; }
  .metric { background:var(--sand); border:1px solid var(--line); border-radius:11px; padding:12px; }
  .metric b { display:block; color:var(--navy); font-size:1.25rem; }
  .metric small { color:var(--muted); font-size:.68rem; }
  .metric.hot { background:var(--mint); border-color:#c4e1d8; }
  .order-list { display:grid; gap:8px; }
  .order { display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid var(--line); border-radius:10px; background:#fff; }
  .order-main { display:flex; gap:9px; align-items:center; }
  .order-avatar { width:30px; height:30px; border-radius:9px; background:var(--mint); color:var(--teal); display:grid; place-items:center; font-weight:800; font-size:.75rem; }
  .order strong { display:block; color:var(--navy); font-size:.78rem; }
  .order small { color:var(--muted); font-size:.65rem; }
  .order-status { color:var(--teal); background:var(--mint); border-radius:99px; padding:4px 8px; font-size:.63rem; font-weight:700; }
  .float-note { position:absolute; bottom:-22px; left:-16px; background:#fff; border:1px solid var(--line); box-shadow:0 12px 28px rgba(16,47,53,.12); border-radius:13px; padding:13px 15px; display:flex; gap:10px; align-items:center; font-size:.76rem; }
  .float-check { width:25px; height:25px; border-radius:50%; background:var(--amber); color:var(--navy); display:grid; place-items:center; font-weight:800; }
  .sect { max-width:1180px; margin:auto; padding:88px 24px; }
  .sect-head { max-width:640px; margin:0 auto 38px; text-align:center; }
  .sect-head h2 { color:var(--navy); font-size:clamp(1.8rem,4vw,2.65rem); line-height:1.25; margin:8px 0 12px; letter-spacing:-.03em; }
  .sect-head p { color:var(--muted); line-height:1.8; }
  .proof-strip { background:var(--navy); color:#fff; }
  .proof-inner { max-width:1180px; margin:auto; padding:25px 24px; display:flex; gap:30px; flex-wrap:wrap; justify-content:center; text-align:center; }
  .proof-inner strong { color:#fff; display:block; font-size:1.15rem; }
  .proof-inner span { color:#b8d0ca; font-size:.76rem; }
  .pain-grid,.feat-grid,.price-grid { display:grid; gap:14px; }
  .pain-grid { grid-template-columns:repeat(2,1fr); }
  .pain-card,.feat,.price-card,.faq-item { background:var(--white); border:1px solid var(--line); border-radius:14px; }
  .pain-card { padding:22px; }
  .pain-card h3,.feat h3,.price-card h3 { color:var(--navy); font-size:1rem; margin-bottom:6px; }
  .pain-card p,.feat p { color:var(--muted); font-size:.88rem; line-height:1.8; }
  .pain-mark { color:var(--amber); font-size:1.3rem; margin-bottom:14px; display:block; }
  .feat-grid { grid-template-columns:repeat(3,1fr); }
  .feat { padding:24px; transition:transform .2s,box-shadow .2s; }
  .feat:hover { transform:translateY(-4px); box-shadow:0 15px 35px rgba(16,47,53,.09); }
  .feat-icon { color:var(--teal); font-size:1.5rem; margin-bottom:16px; }
  .how-wrap { display:grid; gap:25px; max-width:900px; margin:auto; }
  @media (min-width:800px) { .how-wrap { grid-template-columns:repeat(3,1fr); } }
  .how-step { position:relative; padding:23px; background:var(--mint); border-radius:14px; }
  .how-step b { display:grid; place-items:center; width:34px; height:34px; background:var(--teal); color:#fff; border-radius:9px; margin-bottom:20px; }
  .how-step h3 { color:var(--navy); font-size:1rem; margin-bottom:7px; }
  .how-step p { color:var(--muted); font-size:.87rem; line-height:1.8; }
  .price-grid { grid-template-columns:repeat(3,1fr); max-width:980px; margin:auto; }
  .price-card { padding:25px; display:flex; flex-direction:column; }
  .price-card.hot { border:2px solid var(--teal); position:relative; box-shadow:0 15px 35px rgba(17,125,112,.12); }
  .pop { position:absolute; top:-12px; right:20px; background:var(--amber); color:var(--navy); border-radius:99px; padding:4px 12px; font-size:.7rem; font-weight:800; }
  .price { color:var(--navy); font-size:2.15rem; font-weight:800; margin:9px 0 3px; }
  .price span,.price-card .small { color:var(--muted); font-size:.78rem; font-weight:400; }
  .price-card ul { list-style:none; display:grid; gap:10px; margin:20px 0 25px; flex:1; }
  .price-card li { color:var(--muted); font-size:.85rem; }
  .price-card li:before { content:'✓'; color:var(--teal); font-weight:800; margin-left:8px; }
  .faq-list { max-width:720px; margin:auto; display:grid; gap:9px; }
  .faq-item summary { padding:17px 20px; list-style:none; cursor:pointer; color:var(--navy); font-weight:700; display:flex; justify-content:space-between; gap:12px; }
  .faq-item summary::-webkit-details-marker { display:none; }
  .faq-item summary:after { content:'+'; color:var(--teal); font-size:1.25rem; }
  .faq-item[open] summary:after { content:'−'; }
  .faq-body { padding:0 20px 18px; color:var(--muted); font-size:.9rem; line-height:1.8; }
  .final-cta { max-width:1132px; margin:15px auto 75px; padding:60px 24px; border-radius:20px; background:var(--teal); color:#fff; text-align:center; }
  .final-cta h2 { font-size:clamp(1.7rem,4vw,2.5rem); margin-bottom:10px; }
  .final-cta p { color:#d9eee8; margin-bottom:25px; }
  footer { border-top:1px solid var(--line); padding:30px 24px; }
  .foot-inner { max-width:1180px; margin:auto; display:flex; gap:18px; justify-content:space-between; align-items:center; flex-wrap:wrap; }
  .foot-links { display:flex; gap:18px; flex-wrap:wrap; }
  .foot-links a { color:var(--muted); font-size:.8rem; text-decoration:none; }
  .rv { opacity:0; transform:translateY(15px); transition:opacity .55s ease,transform .55s ease; }
  .rv.in { opacity:1; transform:none; }
  @media (max-width:700px) { .pain-grid,.feat-grid,.price-grid { grid-template-columns:1fr; } .metric-row { gap:6px; } .metric { padding:9px; } .float-note { left:5px; } }
  @media (prefers-reduced-motion:reduce) { .rv { opacity:1; transform:none; transition:none; } }
</style>
</head>
<body>
<nav class="land-nav" aria-label="التنقل الرئيسي"><div class="land-nav-inner"><a href="/" class="brand">${logoSvg(34)}<span>تأكد</span></a><div class="nav-links"><a href="#features">المميزات</a><a href="#how">كيفاش كيخدم</a><a href="#pricing">الأسعار</a><a href="#faq">الأسئلة</a></div><div class="row"><a href="/login" class="btn btn-ghost btn-sm">دخول</a><a href="/register" class="btn btn-primary btn-sm">جرب مجاناً</a></div></div></nav>
<header class="hero"><div class="hero-copy"><div class="eyebrow">منصة تشغيل للتجارة بالدفع عند الاستلام</div><h1>من أول مساج<br>حتى <strong>التسليم.</strong></h1><p class="sub">جمع طلبات إنستغرام وواتساب وفيسبوك فلوحة وحدة. أكد قبل الشحن، عرف شنو خاصك دير اليوم، وخلي كل طلب يمشي فالمسار الصحيح.</p><div class="hero-ctas"><a href="/register" class="btn btn-primary" style="padding:14px 28px">بدا مجاناً</a><a href="#demo" class="btn btn-ghost">شوف كيفاش كيخدم</a></div><p class="hero-note">30 طلب مجاني كل شهر · بلا بطاقة بنكية · التسجيل فأقل من دقيقة</p></div><div class="hero-visual" id="demo"><div class="dashboard"><div class="dash-head"><span class="dash-brand"><i class="dash-dot"></i> لوحة التحكم</span><span>الثلاثاء، 12 مارس</span></div><div class="dash-body"><div class="dash-greeting"><h3>صباح الخير، سلمى</h3><span>شنو خاصك دير اليوم؟</span></div><div class="metric-row"><div class="metric hot"><b>12</b><small>طلبات جديدة</small></div><div class="metric"><b>7</b><small>خاصها تأكيد</small></div><div class="metric"><b>18</b><small>واجدة للشحن</small></div></div><div class="order-list"><div class="order"><div class="order-main"><div class="order-avatar">خ</div><div><strong>خديجة · مراكش</strong><small>جلابة صيفية · 420 درهم</small></div></div><span class="order-status">يحتاج تأكيد</span></div><div class="order"><div class="order-main"><div class="order-avatar">ي</div><div><strong>ياسين · الرباط</strong><small>عطر شرقي · 280 درهم</small></div></div><span class="order-status">مؤكد</span></div><div class="order"><div class="order-main"><div class="order-avatar">ن</div><div><strong>نادية · أكادير</strong><small>طقم صيفي · 350 درهم</small></div></div><span class="order-status">قيد التجهيز</span></div></div></div></div><div class="float-note"><span class="float-check">✓</span><span><strong>كلشي واضح</strong><br><small>الخطوة الجاية باينة</small></span></div></div></header>
<div class="proof-strip"><div class="proof-inner"><div><strong>كل طلب</strong><span>عندو مسار واضح</span></div><div><strong>رسائل جاهزة</strong><span>بالدارجة المغربية</span></div><div><strong>قبل الشحن</strong><span>كتشوف المخاطر</span></div><div><strong>بياناتك</strong><span>كتبقى ديالك</span></div></div></div>
<section class="sect" aria-labelledby="pain-title"><div class="sect-head rv"><div class="kicker">المشكل اللي كيعيشو كل تاجر</div><h2 id="pain-title">الفوضى ماشي قدر. راه غير نقص فالتنظيم.</h2><p>ملي الطلبات كتكتر، الاعتماد على الذاكرة والمحادثات ما كيبقاش كافي.</p></div><div class="pain-grid"><div class="pain-card rv"><span class="pain-mark">01</span><h3>الطلبات مفرقة فكل بلاصة</h3><p>دايركت، واتساب، كومنتير… وملي كتبغي تشحن كتبدا تقلب فالمحادثات.</p></div><div class="pain-card rv"><span class="pain-mark">02</span><h3>ما عارفش شكون أكد</h3><p>كلشي فالراس والراس كينسى. النتيجة: طلبات كتصيفط بلا تأكيد وكترجع.</p></div><div class="pain-card rv"><span class="pain-mark">03</span><h3>المتابعة كتضيع</h3><p>العميل قال عيط ليا غدا، وغدا كتفوت. فرص البيع كتضيع بلا تذكير واضح.</p></div><div class="pain-card rv"><span class="pain-mark">04</span><h3>كل مرتجع كيكلف مرتين</h3><p>التوصيل ذهاباً وإياباً والسلعة محجوزة. التأكيد قبل الشحن كيوفر عليك.</p></div></div></section>
<section class="sect" id="features" aria-labelledby="feat-title"><div class="sect-head rv"><div class="kicker">شنو كيدير تأكد</div><h2 id="feat-title">نظام واحد بسيط، مبني على مسار الطلب</h2><p>ماشي برنامج محاسبة معقد. غير الأدوات اللي محتاجها باش تسيطر على يومك.</p></div><div class="feat-grid"><div class="feat rv"><div class="feat-icon">↙</div><h3>كل الطلبات فبلاصة وحدة</h3><p>زيد الطلب فثواني من إنستغرام أو واتساب أو مكالمة. كل طلب عندو رقم وحالة وتاريخ.</p></div><div class="feat rv"><div class="feat-icon">→</div><h3>مسار واضح لكل طلب</h3><p>جديد، تأكيد، تجهيز، شحن، تسليم. عمرك تسول فين وصل هاد الطلب.</p></div><div class="feat rv"><div class="feat-icon">Aa</div><h3>رسائل جاهزة بالدارجة</h3><p>رسالة تأكيد أو تذكير معمرة بسميّة العميل والثمن. نسخ ولصق فالواتساب.</p></div><div class="feat rv"><div class="feat-icon">◷</div><h3>لائحة اليوم</h3><p>كل صباح كتلقى شكون خاصو تأكيد، شكون خاصو متابعة وشنو واجد يتصيفط.</p></div><div class="feat rv"><div class="feat-icon">!</div><h3>مراجعة قبل الشحن</h3><p>رقم مكرر، عنوان ناقص أو تاريخ إلغاءات سابق. كلشي باين قبل ما تخسر التوصيل.</p></div><div class="feat rv"><div class="feat-icon">↗</div><h3>أرقام متجرك بلا تعقيد</h3><p>نسبة التأكيد، المدن والمنتجات الأكثر طلباً، ومقارنة الأسابيع حسب بيانات متجرك.</p></div></div></section>
<section class="sect" id="how" aria-labelledby="how-title"><div class="sect-head rv"><div class="kicker">كيفاش كيخدم</div><h2 id="how-title">من الفوضى للسيطرة فـ 3 خطوات</h2></div><div class="how-wrap"><div class="how-step rv"><b>1</b><h3>زيد الطلب ملي يوصلك</h3><p>دخل السمية، التيليفون، المنتوج والمدينة فـ20 ثانية. سالينا.</p></div><div class="how-step rv"><b>2</b><h3>أكد قبل ما تصيفط</h3><p>استعمل الرسالة الجاهزة، أكد الحالة، وحدد موعد المتابعة إلا ما جاوبش.</p></div><div class="how-step rv"><b>3</b><h3>صيفط وتبع حتى التسليم</h3><p>خدم من لائحة الطلبات المؤكدة وشوف الأرقام ديال متجرك.</p></div></div></section>
<section class="sect" id="pricing" aria-labelledby="price-title"><div class="sect-head rv"><div class="kicker">الأسعار</div><h2 id="price-title">ابدأ مجاناً، وخلص غير ملي تكبر</h2><p>بلا التزام وبلا بطاقة بنكية فالبداية. الأثمنة بالدرهم المغربي.</p></div><div class="price-grid"><div class="price-card rv"><h3>مجانية</h3><div class="price">0 <span>درهم/شهر</span></div><p class="small">للي باغي يجرب أو عندو طلبات قليلة</p><ul><li>حتى 30 طلب فالشهر</li><li>لوحة تحكم أساسية</li><li>رسائل جاهزة بالدارجة</li><li>حالات الطلب الكاملة</li></ul><a href="/register" class="btn btn-ghost btn-block">ابدأ مجاناً</a></div><div class="price-card hot rv"><span class="pop">الأكثر اختياراً</span><h3>الأساسية</h3><div class="price">99 <span>درهم/شهر</span></div><p class="small">للتاجر النشيط اللي كيبيع كل يوم</p><ul><li>حتى 500 طلب فالشهر</li><li>المتابعات والتذكير</li><li>التقارير والإحصائيات</li><li>استيراد وتصدير CSV</li><li>مراجعة قبل الشحن</li></ul><a href="/register" class="btn btn-primary btn-block">جرب 14 يوم مجاناً</a></div><div class="price-card rv"><h3>الاحترافية</h3><div class="price">249 <span>درهم/شهر</span></div><p class="small">للمتاجر الكبيرة والفرق</p><ul><li>طلبات غير محدودة</li><li>تقارير متقدمة</li><li>أولوية فالدعم</li><li>تكاملات مستقبلية</li></ul><a href="/register" class="btn btn-ghost btn-block">ابدأ التجربة</a></div></div></section>
<section class="sect" id="faq" aria-labelledby="faq-title"><div class="sect-head rv"><div class="kicker">أسئلة شائعة</div><h2 id="faq-title">اللي كيسولو عليه التجار</h2></div><div class="faq-list"><details class="faq-item rv"><summary>واش خاصني موقع إلكتروني؟</summary><div class="faq-body">لا. تأكد مصمم للي كيبيع من إنستغرام وواتساب وفيسبوك بلا موقع. كتزيد الطلبات يدوياً فثواني.</div></details><details class="faq-item rv"><summary>واش كيصيفط الرسائل أوتوماتيكياً؟</summary><div class="faq-body">حالياً لا. تأكد كيوجد الرسالة معمرة بمعلومات الطلب وكتنسخها وتصيفطها بنفسك بضغطة وحدة.</div></details><details class="faq-item rv"><summary>واش بياناتي وبيانات عملائي فأمان؟</summary><div class="faq-body">كل متجر معزول. ما يمكن لمستخدم آخر يشوف طلباتك أو عملاءك، وتقدر تنزل أو تحذف بياناتك من الإعدادات.</div></details><details class="faq-item rv"><summary>واش كيخدم مزيان فالتيليفون؟</summary><div class="faq-body">نعم. تأكد مصمم بالأساس للتيليفون حيت أغلب التجار كيخدمو منو.</div></details></div></section>
<div class="final-cta rv"><h2>خليك متأكد من كل طلب.</h2><p>سجل دابا وزيد أول طلب ديالك فأقل من دقيقتين.</p><a href="/register" class="btn btn-amber" style="padding:14px 30px">افتح حسابك مجاناً</a></div>
<footer><div class="foot-inner"><a href="/" class="brand" style="font-size:1rem">${logoSvg(28)}<span>تأكد — T2AKED</span></a><div class="foot-links"><a href="#features">المميزات</a><a href="#pricing">الأسعار</a><a href="/terms">شروط الاستخدام</a><a href="/privacy">سياسة الخصوصية</a><a href="mailto:salam@t2aked.ma">تواصل معنا</a></div><span class="small mut">© 2025 تأكد</span></div></footer>
<script>
(function(){var stages=[{key:'new',label:'جديد',hint:'الطلب وصل — الخطوة الجاية هي التأكيد',btn:'أكدات الطلب',msg:'سلام خديجة، توصلنا بالطلب ديالك. واش نأكدو الطلب باش نصيفطوه ليك؟'},{key:'confirmed',label:'مؤكد',hint:'الطلب تأكد — دابا وجدو للشحن',btn:'وجدت الطرد',msg:'شكراً خديجة على التأكيد. غادي نوجدو ليك الطلب ونصيفطوه قريباً.'},{key:'preparing',label:'قيد التجهيز',hint:'الطرد واجد — صيفطو مع شركة التوصيل',btn:'صيفطت الطرد',msg:'الطلب واجد وغادي يخرج اليوم مع شركة التوصيل.'},{key:'shipped',label:'تم الشحن',hint:'الطرد فالطريق — تبع حتى التسليم',btn:'توصلات بالطرد',msg:'خبار زوينة، الطلب خرج اليوم وغادي يوصلك قريباً.'},{key:'delivered',label:'تم التسليم',hint:'مبروك! الطلب تسلم',btn:null,msg:'تنشكروك على الثقة. مرحبا بيك ديما!'}];var i=0;var path=document.getElementById('demo-path'),status=document.getElementById('demo-status'),label=document.getElementById('demo-stage-label'),msg=document.getElementById('demo-msg-text'),next=document.getElementById('demo-next'),reset=document.getElementById('demo-reset');function render(){var s=stages[i];if(!path)return;status.textContent=s.label;status.className='st st-'+s.key;label.textContent=s.hint;msg.textContent=s.msg;path.innerHTML=stages.map(function(_,n){return '<span class="path-node '+(n<i?'done':n===i?'active':'')+'"></span>'+(n<stages.length-1?'<span class="path-seg '+(n<i?'done':'')+'"></span>':'')}).join('');if(s.btn){next.textContent=s.btn;next.classList.remove('hide')}else next.classList.add('hide')}if(next)next.onclick=function(){if(i<stages.length-1){i++;render()}};if(reset)reset.onclick=function(){i=0;render()};render()})();
(function(){var els=document.querySelectorAll('.rv');if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return}var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target)}})},{threshold:.12});els.forEach(function(e){o.observe(e)})})();
</script></body></html>`
}

export default landingPage
