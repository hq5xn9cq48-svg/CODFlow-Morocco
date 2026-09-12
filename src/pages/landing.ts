import { head, logoSvg } from './head'

export function landingPage(): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
${head('تأكد — نظّم طلبات الدفع عند الاستلام ديالك', 'منصة مغربية للتجار اللي كيبيعو أونلاين بالدفع عند الاستلام. نظّم الطلبات، أكدها قبل الشحن، وقلّل المرتجعات — من أول مساج حتى للتسليم.')}
<style>
  /* ── Landing-specific styles ── */
  .land-nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(245, 248, 250, 0.9); backdrop-filter: blur(14px);
    border-bottom: 1px solid rgba(220, 231, 235, 0.8);
  }
  .hero { position: relative; isolation: isolate; }
  .hero::before { content: ''; position: absolute; inset: 0 8% auto; height: 28rem; background: radial-gradient(circle at 50% 15%, rgba(37,167,162,0.13), transparent 62%); z-index: -1; pointer-events: none; }
  .hero h1 { letter-spacing: -0.045em; }
  .hero .sub { line-height: 1.85; }
  .demo { box-shadow: 0 22px 60px rgba(7,29,43,0.14); }
  .pain-card, .feat, .price-card, .faq-item { box-shadow: 0 8px 24px rgba(7,29,43,0.035); }
  .pain-card:hover, .price-card:hover { transform: translateY(-3px); box-shadow: 0 14px 34px rgba(7,29,43,0.09); }
  .final-cta { box-shadow: 0 22px 50px rgba(7,29,43,0.16); }
  @media (max-width: 520px) {
    .land-nav-inner { padding-inline: 14px; }
    .land-nav .row { gap: 6px; }
    .land-nav .btn { padding-inline: 11px; }
    .hero { padding-top: 38px; }
    .hero h1 { font-size: clamp(2rem, 11vw, 3rem); }
    .hero-ctas { flex-direction: column; align-items: stretch; }
    .hero-ctas .btn { width: 100%; }
    .demo-wrap { padding-inline: 10px; }
    .demo-body { padding: 18px 14px 20px; }
  }
  .land-nav-inner { max-width: 1100px; margin: 0 auto; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .brand { display: flex; align-items: center; gap: 10px; text-decoration: none; font-weight: 700; font-size: 1.25rem; color: var(--teal-800); }
  .land-nav .nav-links { display: none; gap: 24px; }
  .land-nav .nav-links a { text-decoration: none; color: var(--ink-soft); font-weight: 500; font-size: 0.95rem; }
  .land-nav .nav-links a:hover { color: var(--teal-600); }
  @media (min-width: 820px) { .land-nav .nav-links { display: flex; } }

  .hero { max-width: 1100px; margin: 0 auto; padding: 52px 20px 30px; text-align: center; }
  .hero-badge { display: inline-flex; align-items: center; gap: 7px; background: var(--teal-100); color: var(--teal-700); padding: 6px 16px; border-radius: 999px; font-size: 0.86rem; font-weight: 600; margin-bottom: 22px; }
  .hero h1 { font-size: clamp(2rem, 6vw, 3.4rem); line-height: 1.25; color: var(--teal-900); font-weight: 700; margin-bottom: 16px; }
  .hero h1 .hl { color: var(--teal-600); position: relative; white-space: nowrap; }
  .hero h1 .hl::after { content: ''; position: absolute; right: 0; left: 0; bottom: 4px; height: 10px; background: var(--amber-100); z-index: -1; border-radius: 4px; }
  .hero .sub { font-size: clamp(1.02rem, 2.5vw, 1.25rem); color: var(--ink-soft); max-width: 620px; margin: 0 auto 28px; }
  .hero-ctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 14px; }
  .hero-note { font-size: 0.86rem; color: var(--ink-mute); }

  /* ── Interactive pipeline demo ── */
  .demo-wrap { max-width: 860px; margin: 40px auto 0; padding: 0 16px; }
  .demo {
    background: var(--paper); border: 1px solid var(--line); border-radius: 22px;
    box-shadow: var(--shadow-lg); overflow: hidden; text-align: right;
  }
  .demo-top { background: var(--teal-800); padding: 12px 20px; display: flex; align-items: center; gap: 8px; }
  .demo-top .dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.25); }
  .demo-top .demo-title { color: rgba(255,255,255,0.85); font-size: 0.84rem; margin-inline-start: auto; }
  .demo-body { padding: 22px 20px 26px; }
  .demo-order {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    background: var(--cream); border: 1px solid var(--line); border-radius: var(--radius);
    padding: 14px 16px; margin-bottom: 20px; flex-wrap: wrap;
  }
  .demo-order .who { font-weight: 700; color: var(--teal-800); }
  .demo-order .what { font-size: 0.88rem; color: var(--ink-soft); }
  .demo-path { display: flex; align-items: center; margin: 10px 4px 20px; }
  .demo-stage-label { text-align: center; font-size: 0.78rem; color: var(--ink-mute); font-weight: 600; margin-top: 8px; }
  .demo-msg {
    background: var(--teal-50); border: 1px dashed var(--teal-500); border-radius: var(--radius);
    padding: 14px 16px; font-size: 0.92rem; color: var(--teal-800); margin-bottom: 18px; min-height: 76px;
    transition: opacity 0.25s;
  }
  .demo-msg .msg-label { font-size: 0.76rem; font-weight: 700; color: var(--teal-600); display: block; margin-bottom: 4px; }
  .demo-actions { display: flex; gap: 10px; flex-wrap: wrap; }

  /* sections */
  .sect { max-width: 1100px; margin: 0 auto; padding: 64px 20px; }
  .sect-head { text-align: center; max-width: 640px; margin: 0 auto 42px; }
  .sect-head .kicker { color: var(--teal-600); font-weight: 700; font-size: 0.9rem; letter-spacing: 0.02em; margin-bottom: 8px; }
  .sect-head h2 { font-size: clamp(1.5rem, 4vw, 2.2rem); color: var(--teal-900); margin-bottom: 10px; }
  .sect-head p { color: var(--ink-soft); font-size: 1.02rem; }

  .pain-grid { display: grid; gap: 16px; grid-template-columns: 1fr; }
  @media (min-width: 720px) { .pain-grid { grid-template-columns: 1fr 1fr; } }
  .pain-card { background: var(--paper); border: 1px solid var(--line); border-radius: var(--radius); padding: 22px; display: flex; gap: 14px; align-items: flex-start; }
  .pain-card .pi { font-size: 1.5rem; flex-shrink: 0; }
  .pain-card h3 { font-size: 1.05rem; color: var(--teal-800); margin-bottom: 4px; }
  .pain-card p { font-size: 0.92rem; color: var(--ink-soft); }

  .feat-grid { display: grid; gap: 16px; grid-template-columns: 1fr; }
  @media (min-width: 640px) { .feat-grid { grid-template-columns: 1fr 1fr; } }
  @media (min-width: 980px) { .feat-grid { grid-template-columns: 1fr 1fr 1fr; } }
  .feat { background: var(--paper); border: 1px solid var(--line); border-radius: var(--radius); padding: 24px; transition: transform 0.2s, box-shadow 0.2s; }
  .feat:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
  .feat .fi { width: 46px; height: 46px; border-radius: 13px; background: var(--teal-100); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; margin-bottom: 14px; }
  .feat h3 { font-size: 1.06rem; color: var(--teal-800); margin-bottom: 6px; }
  .feat p { font-size: 0.92rem; color: var(--ink-soft); }

  .how-steps { display: grid; gap: 0; max-width: 560px; margin: 0 auto; }
  .how-step { display: flex; gap: 18px; position: relative; padding-bottom: 34px; }
  .how-step:last-child { padding-bottom: 0; }
  .how-step::before { content: ''; position: absolute; top: 40px; bottom: 0; right: 19px; width: 2.5px; background: var(--teal-100); }
  .how-step:last-child::before { display: none; }
  .how-num { width: 40px; height: 40px; border-radius: 50%; background: var(--teal-600); color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; z-index: 1; box-shadow: 0 0 0 5px var(--cream); }
  .how-step h3 { font-size: 1.08rem; color: var(--teal-800); margin-bottom: 4px; }
  .how-step p { font-size: 0.94rem; color: var(--ink-soft); }

  .price-grid { display: grid; gap: 18px; grid-template-columns: 1fr; max-width: 960px; margin: 0 auto; }
  @media (min-width: 860px) { .price-grid { grid-template-columns: 1fr 1fr 1fr; } }
  .price-card { background: var(--paper); border: 1.5px solid var(--line); border-radius: 18px; padding: 28px 24px; display: flex; flex-direction: column; position: relative; }
  .price-card.hot { border-color: var(--teal-600); box-shadow: var(--shadow); }
  .price-card .pop { position: absolute; top: -13px; right: 22px; background: var(--amber-500); color: var(--teal-900); font-size: 0.78rem; font-weight: 700; padding: 3px 14px; border-radius: 999px; }
  .price-card h3 { color: var(--teal-800); font-size: 1.12rem; }
  .price-card .pr { font-size: 2.1rem; font-weight: 700; color: var(--teal-900); margin: 10px 0 2px; }
  .price-card .pr span { font-size: 0.95rem; font-weight: 500; color: var(--ink-mute); }
  .price-card ul { list-style: none; margin: 18px 0 22px; display: grid; gap: 10px; flex: 1; }
  .price-card li { display: flex; gap: 8px; font-size: 0.93rem; color: var(--ink-soft); align-items: flex-start; }
  .price-card li::before { content: '✓'; color: var(--teal-600); font-weight: 700; flex-shrink: 0; }

  .faq-list { max-width: 680px; margin: 0 auto; display: grid; gap: 10px; }
  .faq-item { background: var(--paper); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; }
  .faq-item summary { padding: 16px 20px; font-weight: 600; color: var(--teal-800); cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
  .faq-item summary::-webkit-details-marker { display: none; }
  .faq-item summary::after { content: '+'; font-size: 1.3rem; color: var(--teal-600); transition: transform 0.2s; flex-shrink: 0; }
  .faq-item[open] summary::after { transform: rotate(45deg); }
  .faq-item .faq-body { padding: 0 20px 18px; color: var(--ink-soft); font-size: 0.95rem; }

  .final-cta { background: var(--teal-800); border-radius: 24px; max-width: 1060px; margin: 20px auto 60px; padding: 52px 24px; text-align: center; color: #fff; }
  .final-cta h2 { font-size: clamp(1.5rem, 4vw, 2.1rem); margin-bottom: 10px; }
  .final-cta p { color: rgba(255,255,255,0.85); margin-bottom: 26px; max-width: 480px; margin-inline: auto; }

  footer { border-top: 1px solid var(--line); padding: 34px 20px; }
  .foot-inner { max-width: 1100px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: 20px; justify-content: space-between; align-items: center; }
  .foot-links { display: flex; gap: 18px; flex-wrap: wrap; }
  .foot-links a { color: var(--ink-mute); text-decoration: none; font-size: 0.9rem; }
  .foot-links a:hover { color: var(--teal-600); }

  /* reveal on scroll */
  .rv { opacity: 0; transform: translateY(18px); transition: opacity 0.5s ease, transform 0.5s ease; }
  .rv.in { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) { .rv { opacity: 1; transform: none; transition: none; } }
</style>
</head>
<body>

<nav class="land-nav" aria-label="التنقل الرئيسي">
  <div class="land-nav-inner">
    <a href="/" class="brand">${logoSvg(36)}<span>تأكد</span></a>
    <div class="nav-links">
      <a href="#features">المميزات</a>
      <a href="#how">كيفاش كيخدم</a>
      <a href="#pricing">الأسعار</a>
      <a href="#faq">أسئلة شائعة</a>
    </div>
    <div class="row">
      <a href="/login" class="btn btn-ghost btn-sm">دخول</a>
      <a href="/register" class="btn btn-primary btn-sm">جرب مجاناً</a>
    </div>
  </div>
</nav>

<header class="hero" id="hero-section">
  <div class="hero-badge">✓ مصمم للتجار المغاربة اللي كيخدمو بالدفع عند الاستلام</div>
  <h1>كل طلب، <span class="hl">فبلاصتو.</span><br>من أول مساج حتى للتسليم.</h1>
  <p class="sub">الطلبات كتوصلك من إنستغرام وواتساب وفيسبوك، وكتضيع بين الرسائل؟ «تأكد» كيجمعها فبلاصة وحدة، كيوريك شنو خاصك دير فكل طلب، وكيعاونك تأكد قبل ما تصيفط.</p>
  <div class="hero-ctas">
    <a href="/register" class="btn btn-primary" style="font-size:1.08rem;padding:14px 32px">ابدأ مجاناً — بلا بطاقة بنكية</a>
    <a href="#demo" class="btn btn-ghost">شوف كيفاش كيخدم ↓</a>
  </div>
  <p class="hero-note">التسجيل كياخد أقل من دقيقة · أول 30 طلب فالشهر مجانيين</p>

  <!-- ── Interactive order-path demo ── -->
  <div class="demo-wrap" id="demo">
    <div class="demo" aria-label="عرض توضيحي تفاعلي لمسار الطلب">
      <div class="demo-top">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        <span class="demo-title">جرب بنفسك: حرّك الطلب فالمسار</span>
      </div>
      <div class="demo-body">
        <div class="demo-order">
          <div>
            <div class="who">خديجة · مراكش</div>
            <div class="what">جلابة صيفية بيضاء — <span class="tabular">420</span> درهم · جات من إنستغرام</div>
          </div>
          <span class="st st-new" id="demo-status">جديد</span>
        </div>

        <div class="demo-path" id="demo-path" aria-hidden="true"></div>
        <div class="demo-stage-label" id="demo-stage-label">الطلب وصل عندك — الخطوة الجاية: عيط للعميلة وأكد</div>

        <div class="demo-msg" id="demo-msg">
          <span class="msg-label">الرسالة الجاهزة لهاد المرحلة — نسخة ولصقها فالواتساب:</span>
          <span id="demo-msg-text">سلام خديجة 👋 معاك قفطان سلمى. توصلنا بالطلب ديالك: جلابة صيفية بيضاء بثمن 420 درهم. واش نأكدو الطلب باش نصيفطوه ليك؟</span>
        </div>

        <div class="demo-actions">
          <button class="btn btn-primary" id="demo-next">✓ الخطوة الجاية</button>
          <button class="btn btn-ghost btn-sm" id="demo-reset">إعادة من الأول</button>
        </div>
      </div>
    </div>
  </div>
</header>

<!-- ── Pain section ── -->
<section class="sect" aria-labelledby="pain-title">
  <div class="sect-head rv">
    <div class="kicker">المشكل اللي كيعيشو كل تاجر COD</div>
    <h2 id="pain-title">الفوضى ماشي قدر. راه غير نقص فالتنظيم.</h2>
  </div>
  <div class="pain-grid">
    <div class="pain-card rv"><span class="pi">📱</span><div><h3>الطلبات مفرّقة فكل بلاصة</h3><p>وحدة فالدايركت، وحدة فالواتساب، وحدة فكومنتير. وملي كتبغي تشحن، كتبدا تقلّب فالمحادثات وحدة بوحدة.</p></div></div>
    <div class="pain-card rv"><span class="pi">🤔</span><div><h3>ما عارفش شكون أكّد</h3><p>«واش عيطت لهادي؟ واش جاوبني هداك؟» — كلشي فالراس، والراس كينسى. النتيجة: طلبات كتصيفط بلا تأكيد وكترجع.</p></div></div>
    <div class="pain-card rv"><span class="pi">💸</span><div><h3>كل مرتجع كيكلف مرتين</h3><p>ثمن التوصيل ذهاباً وإياباً، والسلعة محجوزة سيمانة. الطلب اللي ما تأكدش قبل الشحن، غالباً كيرجع.</p></div></div>
    <div class="pain-card rv"><span class="pi">⏰</span><div><h3>المتابعة كتضيع</h3><p>العميل قال «عيط ليا غدا» — وغدا نسيتي. طلب كان غادي يتأكد، مشى فحالو حيت ما كانش شي نظام يفكرك.</p></div></div>
  </div>
</section>

<!-- ── Features ── -->
<section class="sect" id="features" aria-labelledby="feat-title">
  <div class="sect-head rv">
    <div class="kicker">شنو كيدير «تأكد»</div>
    <h2 id="feat-title">نظام واحد بسيط، مبني على مسار الطلب</h2>
    <p>ماشي برنامج محاسبة معقد. غير الأدوات اللي محتاجها باش تسيطر على طلباتك.</p>
  </div>
  <div class="feat-grid">
    <div class="feat rv"><div class="fi">📥</div><h3>كل الطلبات فبلاصة وحدة</h3><p>زيد الطلب فثواني — من إنستغرام، واتساب، فيسبوك أو مكالمة. كل طلب عندو رقم وحالة وتاريخ.</p></div>
    <div class="feat rv"><div class="fi">🛤️</div><h3>مسار واضح لكل طلب</h3><p>جديد ← يحتاج تأكيد ← مؤكد ← قيد التجهيز ← تم الشحن ← تم التسليم. عمرك تسول «فين وصل هاد الطلب؟»</p></div>
    <div class="feat rv"><div class="fi">💬</div><h3>رسائل جاهزة بالدارجة</h3><p>رسالة تأكيد، تذكير، شحن، اعتذار… بضغطة وحدة كتعمر بسميّة العميل والثمن، وكتنسخها للواتساب.</p></div>
    <div class="feat rv"><div class="fi">🔔</div><h3>لائحة «اليوم» — شنو خاصك دير دابا</h3><p>كل صباح كتلقى قدامك: شكون خاصو تأكيد، شكون خاصو م��ابعة، وشنو واجد يتصيفط.</p></div>
    <div class="feat rv"><div class="fi">⚠️</div><h3>مؤشرات مراجعة قبل الشحن</h3><p>رقم مكرر، عنوان ناقص، عميل عندو إلغاءات سابقة — كتشوفها قبل ما تخسر التوصيل.</p></div>
    <div class="feat rv"><div class="fi">📊</div><h3>أرقام متجرك بلا تعقيد</h3><p>نسبة التأكيد، أكثر المدن والمنتجات طلباً، مقارنة الأسابيع — حسب بيانات متجرك.</p></div>
  </div>
</section>

<!-- ── How it works ── -->
<section class="sect" id="how" aria-labelledby="how-title">
  <div class="sect-head rv">
    <div class="kicker">كيفاش كيخدم</div>
    <h2 id="how-title">من الفوضى للسيطرة ف3 خطوات</h2>
  </div>
  <div class="how-steps">
    <div class="how-step rv"><div class="how-num">1</div><div><h3>زيد الطلب ملي يوصلك</h3><p>جاك مساج فالدايركت؟ دخلو ل«تأكد» ف20 ثانية: السميّة، التيليفون، المنتوج، المدينة. سالينا.</p></div></div>
    <div class="how-step rv"><div class="how-num">2</div><div><h3>أكد قبل ما تصيفط</h3><p>عيط للعميل أو صيفط ليه الرسالة الجاهزة. جاوب وأكد؟ بدّل الحالة ل«مؤكد». ما جاوبش؟ حدد موعد المتابعة والنظام يفكرك.</p></div></div>
    <div class="how-step rv"><div class="how-num">3</div><div><h3>صيفط وتبع حتى التسليم</h3><p>الطلبات المؤكدة عندك واجدة فلائحة وحدة. صيفطها، بدّل الحالة، وشوف فالتقارير شحال كتأكد وشحال كيرجع.</p></div></div>
  </div>
</section>

<!-- ── Pricing ── -->
<section class="sect" id="pricing" aria-labelledby="price-title">
  <div class="sect-head rv">
    <div class="kicker">الأسعار</div>
    <h2 id="price-title">ابدأ مجاناً، وخلص غير ملي تكبر</h2>
    <p>بلا التزام. بلا بطاقة بنكية فالبداية. الأثمنة بالدرهم المغربي.</p>
  </div>
  <div class="price-grid">
    <div class="price-card rv">
      <h3>مجانية</h3>
      <div class="pr">0 <span>درهم/شهر</span></div>
      <p class="small mut">للي باغي يجرب أو عندو طلبات قليلة</p>
      <ul>
        <li>حتى 30 طلب فالشهر</li>
        <li>لوحة تحكم أساسية</li>
        <li>الرسائل الجاهزة بالدارجة</li>
        <li>حالات الطلب الكاملة</li>
      </ul>
      <a href="/register" class="btn btn-ghost btn-block">ابدأ مجاناً</a>
    </div>
    <div class="price-card hot rv">
      <span class="pop">الأكثر اختياراً</span>
      <h3>الأساسية</h3>
      <div class="pr">99 <span>درهم/شهر</span></div>
      <p class="small mut">للتاجر النشيط اللي كيبيع كل يوم</p>
      <ul>
        <li>حتى 500 طلب فالشهر</li>
        <li>لائحة المتابعات والتذكير</li>
        <li>التقارير والإحصائيات</li>
        <li>استيراد وتصدير CSV</li>
        <li>مؤشرات المراجعة قبل الشحن</li>
      </ul>
      <a href="/register" class="btn btn-primary btn-block">جرب 14 يوم مجاناً</a>
    </div>
    <div class="price-card rv">
      <h3>الاحترافية</h3>
      <div class="pr">249 <span>درهم/شهر</span></div>
      <p class="small mut">للمتاجر الكبيرة والفرق</p>
      <ul>
        <li>طلبات غير محدودة</li>
        <li>مستخدمون متعددون (قريباً)</li>
        <li>تقارير متقدمة</li>
        <li>أولوية فالدعم</li>
        <li>تكاملات مستقبلية (شركات التوصيل)</li>
      </ul>
      <a href="/register" class="btn btn-ghost btn-block">ابدأ التجربة</a>
    </div>
  </div>
  <p class="small mut rv" style="text-align:center;margin-top:18px">الدفع الإلكتروني قيد التفعيل — حالياً التفعيل تجريبي وبلا فوترة حقيقية.</p>
</section>

<!-- ── FAQ ── -->
<section class="sect" id="faq" aria-labelledby="faq-title">
  <div class="sect-head rv">
    <div class="kicker">أسئلة شائعة</div>
    <h2 id="faq-title">اللي كيسولو عليه التجار</h2>
  </div>
  <div class="faq-list">
    <details class="faq-item rv"><summary>واش خاصني موقع إلكتروني باش نستعمل «تأكد»؟</summary><div class="faq-body">لا. «تأكد» مصمم بالضبط للي كيبيع من إنستغرام وواتساب وفيسبوك بلا موقع. كتزيد الطلبات يدوياً ف20 ثانية، أو عبر نموذج طلب (قريباً).</div></details>
    <details class="faq-item rv"><summary>واش كيصيفط الرسائل أوتوماتيكياً فالواتساب؟</summary><div class="faq-body">حالياً لا — وهذا قرار مقصود. الإرسال الآلي غير الرسمي كيعرض رقمك للحظر من واتساب. «تأكد» كيوجد ليك الرسالة معمّرة بمعلومات الطلب، وكتنسخها وتصيفطها بنفسك بضغطة وحدة. التكامل الرسمي مع WhatsApp Business غادي يجي مستقبلاً.</div></details>
    <details class="faq-item rv"><summary>واش بياناتي وبيانات عملائي فأمان؟</summary><div class="faq-body">كل متجر معزول تماماً: ما يمكن لحتى شي مستخدم آخر يشوف طلباتك أو عملاءك. كلمات السر مشفرة، والاتصال كامل عبر HTTPS. وتقدر تنزّل بياناتك أو تحذف حسابك بالكامل فأي وقت من الإعدادات.</div></details>
    <details class="faq-item rv"><summary>عندي طلبات فجداول Excel — واش نقدر نجيبها؟</summary><div class="faq-body">نعم، الباقة الأساسية كتدعم استيراد ملفات CSV. كتصدّر جدولك لصيغة CSV وكترفعو، وكيتزادو الطلبات دفعة وحدة.</div></details>
    <details class="faq-item rv"><summary>واش كيخدم مزيان فالتيليفون؟</summary><div class="faq-body">«تأكد» مصمم بالأساس للتيليفون (Mobile-first) حيت عارفين أن أغلب التجار كيخدمو منو. تقدر حتى تثبتو كتطبيق على الشاشة الرئيسية.</div></details>
    <details class="faq-item rv"><summary>شنو كيوقع إلا فوّت الحد ديال الباقة المجانية؟</summary><div class="faq-body">الطلبات القديمة كتبقى محفوظة وما كيتمسح والو. غير غادي تحتاج ترقية الباقة باش تزيد طلبات جديدة فداك الشهر.</div></details>
  </div>
</section>

<div class="final-cta rv">
  <h2>خليك متأكد من كل طلب.</h2>
  <p>سجل دابا وزيد أول طلب ديالك فأقل من دقيقتين. مجاناً، بلا بطاقة بنكية.</p>
  <a href="/register" class="btn btn-amber" style="font-size:1.08rem;padding:14px 34px">افتح حسابك مجاناً</a>
</div>

<footer>
  <div class="foot-inner">
    <a href="/" class="brand" style="font-size:1.05rem">${logoSvg(28)}<span>تأكد — T2AKED</span></a>
    <div class="foot-links">
      <a href="#features">المميزات</a>
      <a href="#pricing">الأسعار</a>
      <a href="/terms">شروط الاستخدام</a>
      <a href="/privacy">سياسة الخصوصية</a>
      <a href="mailto:salam@t2aked.ma">تواصل معنا</a>
    </div>
    <span class="small mut">© 2026 تأكد. صن�� بحب فالمغرب 🇲🇦</span>
  </div>
</footer>

<script>
// ── Interactive demo ──
(function () {
  var stages = [
    { key: 'new', label: 'جديد', hint: 'الطلب وصل عندك — الخطوة الجاية: عيط للعميلة وأكد', btn: '✓ أكدات الطلب فالهاتف',
      msg: 'سلام خديجة 👋 معاك قفطان سلمى. توصلنا بالطلب ديالك: جلابة صيفية بيضاء بثمن 420 درهم. واش نأكدو الطلب باش نصيفطوه ليك؟' },
    { key: 'confirmed', label: 'مؤكد', hint: 'الطلب تأكد ✓ — دابا وجدو للشحن', btn: '📦 وجدت الطرد',
      msg: 'شكراً خديجة على التأكيد 🙏 غادي نوجدو ليك الطلب ونصيفطوه فأقرب وقت. الخلاص عند الاستلام: 420 درهم.' },
    { key: 'preparing', label: 'قيد التجهيز', hint: 'الطرد واجد — صيفطو مع شركة التوصيل', btn: '🚚 صيفطت الطرد',
      msg: 'خديجة، الطلب ديالك واجد وغادي يخرج اليوم مع شركة التوصيل 📦' },
    { key: 'shipped', label: 'تم الشحن', hint: 'الطرد فالطريق لمراكش — تبع حتى التسليم', btn: '✅ توصلات بالطرد',
      msg: 'خبار زوينة خديجة 🎉 الطلب ديالك خرج اليوم وغادي يوصلك قريباً فمراكش. الخلاص عند الاستلام: 420 درهم.' },
    { key: 'delivered', label: 'تم التسليم', hint: 'مبروك! الطلب تسلم والفلوس فجيبك 🎉', btn: null,
      msg: 'سلام خديجة، تنشكروك على الثقة فقفطان سلمى 🌟 نتمناو تعجبك الجلابة. مرحبا بيك ديما!' }
  ];
  var i = 0;
  var pathEl = document.getElementById('demo-path');
  var statusEl = document.getElementById('demo-status');
  var labelEl = document.getElementById('demo-stage-label');
  var msgEl = document.getElementById('demo-msg-text');
  var nextBtn = document.getElementById('demo-next');
  var resetBtn = document.getElementById('demo-reset');

  function renderPath() {
    var html = '';
    for (var s = 0; s < stages.length; s++) {
      var cls = s < i ? 'done' : s === i ? 'active' : '';
      html += '<span class="path-node ' + cls + '"></span>';
      if (s < stages.length - 1) html += '<span class="path-seg ' + (s < i ? 'done' : '') + '"></span>';
    }
    pathEl.innerHTML = html;
  }
  function render() {
    var st = stages[i];
    statusEl.textContent = st.label;
    statusEl.className = 'st st-' + st.key + (st.key === 'confirmed' ? ' stamp-anim' : '');
    labelEl.textContent = st.hint;
    msgEl.textContent = st.msg;
    renderPath();
    if (st.btn) { nextBtn.textContent = st.btn; nextBtn.classList.remove('hide'); }
    else nextBtn.classList.add('hide');
  }
  nextBtn.addEventListener('click', function () { if (i < stages.length - 1) { i++; render(); } });
  resetBtn.addEventListener('click', function () { i = 0; render(); });
  render();
})();

// ── Reveal on scroll ──
(function () {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.rv').forEach(function (el) { obs.observe(el); });
})();
</script>
</body>
</html>`
}
