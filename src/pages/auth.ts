import { head, logoSvg } from './head'

export function authPage(mode: 'login' | 'register' | 'forgot'): string {
  const titles = {
    login: 'تسجيل الدخول — تأكد',
    register: 'إنشاء حساب — تأكد',
    forgot: 'استعادة كلمة السر — تأكد'
  }
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
${head(titles[mode], 'ادخل لحسابك فمنصة تأكد وسيطر على طلبات الدفع عند الاستلام ديالك.', { noindex: mode === 'forgot' })}
<style>
  .auth-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px 16px; }
  .auth-card { width: 100%; max-width: 420px; background: var(--paper); border: 1px solid var(--line); border-radius: 20px; box-shadow: var(--shadow); padding: 32px 26px; }
  .auth-brand { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 8px; text-decoration: none; color: var(--teal-800); font-weight: 700; font-size: 1.35rem; }
  .auth-sub { text-align: center; color: var(--ink-mute); font-size: 0.92rem; margin-bottom: 26px; }
  .auth-alt { text-align: center; margin-top: 20px; font-size: 0.92rem; color: var(--ink-soft); }
  .auth-alt a { color: var(--teal-600); font-weight: 600; }
  .demo-box { margin-top: 16px; background: var(--teal-50); border: 1px dashed var(--teal-500); border-radius: var(--radius-sm); padding: 12px 14px; font-size: 0.86rem; color: var(--teal-800); }
</style>
</head>
<body>
<main class="auth-wrap">
  <div class="auth-card">
    <a href="/" class="auth-brand">${logoSvg(38)}<span>تأكد</span></a>

    ${mode === 'login' ? `
    <p class="auth-sub">مرحباً بيك من جديد 👋</p>
    <form id="auth-form" novalidate>
      <div class="field">
        <label for="email">البريد الإلكتروني</label>
        <input class="input ltr" type="email" id="email" name="email" autocomplete="email" required placeholder="you@example.com">
      </div>
      <div class="field">
        <label for="password">كلمة السر</label>
        <input class="input ltr" type="password" id="password" name="password" autocomplete="current-password" required placeholder="••••••••">
        <p class="hint"><a href="/forgot" style="color:var(--teal-600)">نسيتي كلمة السر؟</a></p>
      </div>
      <div class="err-msg hide" id="form-err" role="alert"></div>
      <button type="submit" class="btn btn-primary btn-block mt-1" id="submit-btn">دخول</button>
    </form>
    <p class="auth-alt">ما عندكش حساب؟ <a href="/register">سجل مجاناً</a></p>
    <div class="demo-box">🔎 <strong>باغي تشوف قبل ما تسجل؟</strong> دخل بحساب التجربة:<br>البريد: <span class="ltr">demo@t2aked.ma</span> · كلمة السر: <span class="ltr">demo1234</span><br><span class="mut">(بيانات وهمية للعرض فقط)</span></div>
    ` : ''}

    ${mode === 'register' ? `
    <p class="auth-sub">افتح حسابك فأقل من دقيقة — مجاناً</p>
    <form id="auth-form" novalidate>
      <div class="field">
        <label for="name">الاسم الكامل</label>
        <input class="input" type="text" id="name" name="name" autocomplete="name" required placeholder="مثال: سلمى بناني">
      </div>
      <div class="field">
        <label for="email">البريد الإلكتروني</label>
        <input class="input ltr" type="email" id="email" name="email" autocomplete="email" required placeholder="you@example.com">
      </div>
      <div class="field">
        <label for="phone">رقم الهاتف <span class="mut small">(اختياري)</span></label>
        <input class="input ltr" type="tel" id="phone" name="phone" autocomplete="tel" placeholder="0661234567">
      </div>
      <div class="field">
        <label for="password">كلمة السر</label>
        <input class="input ltr" type="password" id="password" name="password" autocomplete="new-password" required placeholder="8 حروف على الأقل" minlength="8">
      </div>
      <div class="err-msg hide" id="form-err" role="alert"></div>
      <button type="submit" class="btn btn-primary btn-block mt-1" id="submit-btn">إنشاء الحساب</button>
      <p class="hint mt-1" style="text-align:center">بالتسجيل، كتوافق على <a href="/terms" style="color:var(--teal-600)">شروط الاستخدام</a> و<a href="/privacy" style="color:var(--teal-600)">سياسة الخصوصية</a></p>
    </form>
    <p class="auth-alt">عندك حساب من قبل؟ <a href="/login">دخول</a></p>
    ` : ''}

    ${mode === 'forgot' ? `
    <p class="auth-sub">دخل بريدك وغادي نصيفطو ليك رابط الاستعادة</p>
    <form id="auth-form" novalidate>
      <div class="field">
        <label for="email">البريد الإلكتروني</label>
        <input class="input ltr" type="email" id="email" name="email" autocomplete="email" required placeholder="you@example.com">
      </div>
      <div class="err-msg hide" id="form-err" role="alert"></div>
      <button type="submit" class="btn btn-primary btn-block mt-1" id="submit-btn">صيفط رابط الاستعادة</button>
    </form>
    <p class="auth-alt"><a href="/login">← رجوع لتسجيل الدخول</a></p>
    ` : ''}
  </div>
</main>
<div id="toast-wrap"></div>
<script>
(function () {
  var mode = '${mode}';
  var form = document.getElementById('auth-form');
  var btn = document.getElementById('submit-btn');
  var errEl = document.getElementById('form-err');
  var busy = false;

  function toast(msg, type) {
    var w = document.getElementById('toast-wrap');
    var t = document.createElement('div');
    t.className = 'toast toast-' + (type || 'info');
    t.textContent = msg;
    w.appendChild(t);
    setTimeout(function () { t.remove(); }, 4200);
  }
  function showErr(msg) { errEl.textContent = msg; errEl.classList.remove('hide'); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    errEl.classList.add('hide');
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });

    if (mode !== 'forgot' && (!data.password || data.password.length < 8)) {
      return showErr('كلمة السر خاصها تكون 8 حروف على الأقل');
    }
    busy = true;
    var orig = btn.textContent;
    btn.innerHTML = '<span class="spinner"></span>';
    btn.disabled = true;

    var url = mode === 'login' ? '/api/auth/login' : mode === 'register' ? '/api/auth/register' : '/api/auth/forgot';
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) { showErr(res.j.message || 'وقع خطأ، حاول من جديد'); return; }
        if (mode === 'forgot') { toast(res.j.message, 'success'); form.reset(); return; }
        toast(mode === 'login' ? 'مرحباً بيك! 👋' : 'تسجل حسابك بنجاح ✓', 'success');
        setTimeout(function () {
          window.location.href = res.j.onboarded ? '/app' : '/app#onboarding';
        }, 400);
      })
      .catch(function () { showErr('مشكل فالاتصال — تأكد من الإنترنت وحاول'); })
      .finally(function () { busy = false; btn.textContent = orig; btn.disabled = false; });
  });
})();
</script>
</body>
</html>`
}
