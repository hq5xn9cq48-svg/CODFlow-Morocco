import { head, logoSvg } from './head'

export function appShell(): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
${head('لوحة التحكم — تأكد', 'لوحة تحكم تأكد لإدارة طلبات الدفع عند الاستلام.', { noindex: true })}
<style>
  /* ── App layout: bottom tab bar (mobile) / side rail (desktop) ── */
  body { background: var(--cream); }
  #app-root { min-height: 100vh; display: flex; flex-direction: column; }
  .app-main-col { background: radial-gradient(circle at 100% 0%, rgba(37,167,162,0.08), transparent 34rem); }
  .app-top { box-shadow: 0 1px 0 rgba(7,29,43,0.03); }
  .page-head h1 { letter-spacing: -0.025em; }
  .kpi { box-shadow: 0 8px 24px rgba(7,29,43,0.045); transition: transform 0.18s ease, box-shadow 0.18s ease; }
  .kpi:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(7,29,43,0.08); }
  .order-card, .chart-card, .list-row { box-shadow: 0 4px 18px rgba(7,29,43,0.035); }
  .tabbar { box-shadow: 0 -8px 24px rgba(7,29,43,0.04); }
  @media (max-width: 520px) {
    #main-view { padding-inline: 14px; }
    .page-head { align-items: flex-start; }
    .page-head .btn { width: 100%; }
  }

  .app-top {
    position: sticky; top: 0; z-index: 90;
    background: rgba(250,248,244,0.94); backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--line);
    padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; gap: 10px;
  }
  .app-top .brand-mini { display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--teal-800); text-decoration: none; font-size: 1.05rem; }
  .app-top .store-chip { font-size: 0.82rem; color: var(--ink-mute); background: var(--paper); border: 1px solid var(--line); padding: 4px 12px; border-radius: 999px; max-width: 46vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  #main-view { flex: 1; padding: 16px 16px 90px; max-width: 1060px; width: 100%; margin: 0 auto; }

  .tabbar {
    position: fixed; bottom: 0; right: 0; left: 0; z-index: 90;
    background: var(--paper); border-top: 1px solid var(--line);
    display: flex; justify-content: space-around; padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
  }
  .tab {
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    padding: 6px 10px; border-radius: 12px; text-decoration: none;
    color: var(--ink-mute); font-size: 0.7rem; font-weight: 600; border: none; background: none;
    min-width: 58px;
  }
  .tab .ti { font-size: 1.35rem; line-height: 1.2; }
  .tab.active { color: var(--teal-600); background: var(--teal-50); }

  @media (min-width: 900px) {
    #app-root { flex-direction: row; }
    .tabbar {
      position: sticky; top: 0; bottom: auto; height: 100vh; width: 210px;
      flex-direction: column; justify-content: flex-start; gap: 4px;
      border-top: none; border-inline-start: none; border-inline-end: 1px solid var(--line);
      padding: 18px 12px;
    }
    .tab { flex-direction: row; gap: 10px; font-size: 0.95rem; padding: 11px 14px; width: 100%; justify-content: flex-start; }
    .tab .ti { font-size: 1.15rem; }
    .app-main-col { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    #main-view { padding-bottom: 40px; }
    #rail-brand { display: flex !important; align-items: center; gap: 9px; font-weight: 700; color: var(--teal-800); font-size: 1.15rem; padding: 4px 10px 18px; text-decoration: none; }
    .app-top .brand-mini { display: none; }
  }
  #rail-brand { display: none; }

  /* page header inside view */
  .page-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
  .page-head h1 { font-size: 1.35rem; color: var(--teal-900); }

  /* KPI tiles */
  .kpis { display: grid; gap: 10px; grid-template-columns: repeat(2, 1fr); margin-bottom: 18px; }
  @media (min-width: 700px) { .kpis { grid-template-columns: repeat(4, 1fr); } }
  .kpi { background: var(--paper); border: 1px solid var(--line); border-radius: var(--radius); padding: 14px 16px; }
  .kpi .kv { font-size: 1.65rem; font-weight: 700; color: var(--teal-900); line-height: 1.2; }
  .kpi .kl { font-size: 0.82rem; color: var(--ink-mute); font-weight: 500; }
  .kpi.hot { border-color: var(--amber-500); background: linear-gradient(135deg, var(--paper), var(--amber-100)); }

  /* order cards (mobile-first list) */
  .order-card { background: var(--paper); border: 1px solid var(--line); border-radius: var(--radius); padding: 14px 16px; margin-bottom: 10px; cursor: pointer; transition: box-shadow 0.15s, transform 0.15s; }
  .order-card:hover { box-shadow: var(--shadow); }
  .order-card:active { transform: scale(0.995); }
  .order-card .oc-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
  .order-card .oc-name { font-weight: 700; color: var(--teal-900); }
  .order-card .oc-sub { font-size: 0.85rem; color: var(--ink-soft); }
  .order-card .oc-meta { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 8px; font-size: 0.82rem; color: var(--ink-mute); }
  .order-card .oc-amount { font-weight: 700; color: var(--teal-700); white-space: nowrap; }

  /* status filter pills row */
  .pills-scroll { display: flex; gap: 8px; overflow-x: auto; padding: 2px 0 10px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
  .pills-scroll::-webkit-scrollbar { display: none; }
  .fpill { flex-shrink: 0; padding: 7px 15px; border-radius: 999px; border: 1.5px solid var(--line); background: var(--paper); font-size: 0.86rem; font-weight: 600; color: var(--ink-soft); }
  .fpill.on { background: var(--teal-800); border-color: var(--teal-800); color: #fff; }
  .fpill .cnt { font-size: 0.78rem; opacity: 0.8; }

  /* status picker in order detail */
  .status-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .status-opt { border: 1.5px solid var(--line); background: var(--paper); border-radius: var(--radius-sm); padding: 10px 6px; font-size: 0.82rem; font-weight: 600; color: var(--ink-soft); text-align: center; transition: all 0.15s; }
  .status-opt.on { border-color: currentColor; }

  /* timeline */
  .tl { position: relative; padding-inline-start: 22px; }
  .tl::before { content: ''; position: absolute; right: 7px; top: 6px; bottom: 6px; width: 2px; background: var(--line); }
  .tl-item { position: relative; padding-bottom: 16px; }
  .tl-item::before { content: ''; position: absolute; right: -19.5px; top: 7px; width: 9px; height: 9px; border-radius: 50%; background: var(--teal-500); box-shadow: 0 0 0 3px var(--cream); }
  .tl-item .tl-t { font-size: 0.78rem; color: var(--ink-mute); }

  /* segmented rows for lists */
  .list-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; background: var(--paper); border: 1px solid var(--line); border-radius: var(--radius); padding: 13px 16px; margin-bottom: 8px; }

  /* charts */
  .chart-card { background: var(--paper); border: 1px solid var(--line); border-radius: var(--radius); padding: 16px; margin-bottom: 14px; }
  .chart-card h3 { font-size: 0.98rem; color: var(--teal-800); margin-bottom: 10px; }
  .chart-box { position: relative; height: 240px; }

  .fab {
    position: fixed; bottom: calc(78px + env(safe-area-inset-bottom)); left: 18px; z-index: 80;
    width: 58px; height: 58px; border-radius: 50%; background: var(--teal-600); color: #fff;
    font-size: 1.7rem; border: none; box-shadow: 0 6px 20px rgba(13,122,108,0.45);
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.15s, background 0.15s;
  }
  .fab:hover { background: var(--teal-700); transform: scale(1.06); }
  @media (min-width: 900px) { .fab { bottom: 26px; } }

  .bulk-bar { position: sticky; top: 54px; z-index: 60; background: var(--teal-800); color: #fff; border-radius: var(--radius); padding: 10px 14px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; box-shadow: var(--shadow); }
  .bulk-bar select { border-radius: 8px; border: none; padding: 7px 10px; font-size: 0.88rem; }

  .search-bar { display: flex; gap: 8px; margin-bottom: 12px; }
  .search-bar .input { min-height: 42px; padding: 8px 14px; }

  .msg-tpl-card { background: var(--paper); border: 1px solid var(--line); border-radius: var(--radius); padding: 16px; margin-bottom: 10px; }
  .msg-body-preview { background: var(--cream); border-radius: var(--radius-sm); padding: 12px 14px; font-size: 0.9rem; color: var(--ink-soft); margin: 10px 0; white-space: pre-wrap; }

  .onb-progress { display: flex; gap: 6px; margin-bottom: 22px; }
  .onb-progress span { height: 5px; flex: 1; border-radius: 4px; background: var(--line); }
  .onb-progress span.on { background: var(--teal-600); }

  .checkbox-lg { width: 20px; height: 20px; accent-color: var(--teal-600); flex-shrink: 0; }
</style>
</head>
<body>
<div id="app-root">
  <nav class="tabbar" aria-label="التنقل في التطبيق">
    <a id="rail-brand" href="/app">${logoSvg(32)}<span>تأكد</span></a>
    <button class="tab" data-nav="today"><span class="ti">☀️</span><span>اليوم</span></button>
    <button class="tab" data-nav="orders"><span class="ti">📦</span><span>الطلبات</span></button>
    <button class="tab" data-nav="customers"><span class="ti">👥</span><span>العملاء</span></button>
    <button class="tab" data-nav="messages"><span class="ti">💬</span><span>الرسائل</span></button>
    <button class="tab" data-nav="more"><span class="ti">⚙️</span><span>المزيد</span></button>
  </nav>
  <div class="app-main-col">
    <header class="app-top">
      <a href="/app" class="brand-mini">${logoSvg(30)}<span>تأكد</span></a>
      <span class="store-chip" id="store-chip">…</span>
      <button class="btn btn-ghost btn-sm" id="logout-btn">خروج</button>
    </header>
    <main id="main-view">
      <div class="skeleton" style="height:90px;margin-bottom:12px"></div>
      <div class="skeleton" style="height:70px;margin-bottom:10px"></div>
      <div class="skeleton" style="height:70px;margin-bottom:10px"></div>
      <div class="skeleton" style="height:70px"></div>
    </main>
  </div>
</div>
<button class="fab hide" id="fab-add" aria-label="إضافة طلب جديد">＋</button>
<div id="modal-root"></div>
<div id="toast-wrap"></div>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js" defer></script>
<script src="/static/app.js" defer></script>
</body>
</html>`
}
