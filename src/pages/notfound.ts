import { head, logoSvg } from './head'

export function notFoundPage(msg = 'هذه الصفحة غير موجودة'): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
${head('الصفحة غير موجودة — تأكد', 'الصفحة التي تبحث عنها غير موجودة.', { noindex: true })}
<style>
  .nf { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px; }
  .nf .code { font-size: 5rem; font-weight: 700; color: var(--teal-100); line-height: 1; }
  .nf h1 { color: var(--teal-800); font-size: 1.4rem; margin: 12px 0 6px; }
  .nf p { color: var(--ink-mute); margin-bottom: 24px; }
</style>
</head>
<body>
<main class="nf">
  ${logoSvg(56)}
  <div class="code">404</div>
  <h1>${msg}</h1>
  <p>يمكن الرابط تبدل أو تكتب بشكل خاطئ. ما تخافش، طلباتك فأمان.</p>
  <div class="row wrap" style="justify-content:center">
    <a href="/" class="btn btn-primary">الصفحة الرئيسية</a>
    <a href="/app" class="btn btn-ghost">لوحة التحكم</a>
  </div>
</main>
</body>
</html>`
}
