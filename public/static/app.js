/* ═══════════════════════════════════════════════
   تأكد — T2AKED App (vanilla SPA, mobile-first, RTL)
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── State ──
  var S = {
    user: null,
    store: null,
    view: 'today',
    ordersQuery: { status: '', search: '', sort: 'newest', page: 1, followup: '' },
    selectedOrders: new Set(),
    charts: []
  };

  var STATUS_LABELS = {
    new: 'جديد', to_confirm: 'يحتاج تأكيد', confirmed: 'مؤكد', preparing: 'قيد التجهيز',
    shipped: 'تم الشحن', delivered: 'تم التسليم', no_answer: 'لم يرد', cancelled: 'ملغى', returned: 'مرتجع'
  };
  var STATUS_ORDER = ['new', 'to_confirm', 'confirmed', 'preparing', 'shipped', 'delivered', 'no_answer', 'cancelled', 'returned'];
  var PATH_STAGES = ['new', 'confirmed', 'preparing', 'shipped', 'delivered'];
  var FLAG_LABELS = {
    missing_address: { t: '📍 عنوان ناقص', risk: false },
    duplicate_phone: { t: '📱 رقم مكرر فطلب آخر', risk: false },
    many_attempts: { t: '📞 3+ محاولات بلا رد', risk: true },
    followup_due: { t: '⏰ موعد المتابعة وصل', risk: false },
    history_risk: { t: '⚠️ إلغاءات سابقة لهاد الرقم', risk: true }
  };
  var SOURCE_LABELS = { manual: 'يدوي', instagram: 'إنستغرام', facebook: 'فيسبوك', whatsapp: 'واتساب', form: 'نموذج', csv: 'CSV' };

  // ── Helpers ──
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) { return (Math.round((+n || 0) * 100) / 100).toLocaleString('ar-MA') + ' درهم'; }
  function timeAgo(iso) {
    if (!iso) return '';
    var d = new Date(iso.replace(' ', 'T') + (iso.indexOf('Z') < 0 ? 'Z' : ''));
    var diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'دابا';
    if (diff < 3600) return 'قبل ' + Math.floor(diff / 60) + ' دقيقة';
    if (diff < 86400) return 'قبل ' + Math.floor(diff / 3600) + ' ساعة';
    if (diff < 172800) return 'البارح';
    return d.toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' });
  }
  function toast(msg, type) {
    var w = $('#toast-wrap');
    var t = document.createElement('div');
    t.className = 'toast toast-' + (type || 'info');
    t.textContent = msg;
    w.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 3600);
    setTimeout(function () { t.remove(); }, 4000);
  }

  var pending = {};
  function api(method, url, body) {
    var key = method + url;
    if (pending[key]) return pending[key]; // prevent double-submit
    var p = fetch(url, {
      method: method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      if (r.status === 401) { window.location.href = '/login'; throw new Error('unauthorized'); }
      return r.json().then(function (j) {
        if (!r.ok) { var e = new Error(j.message || 'خطأ'); e.data = j; throw e; }
        return j;
      });
    }).finally(function () { delete pending[key]; });
    pending[key] = p;
    return p;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
    return Promise.resolve();
  }

  // ── Modal ──
  function openModal(title, bodyHtml, onMount) {
    var root = $('#modal-root');
    root.innerHTML =
      '<div class="modal-overlay" id="modal-ov">' +
      '<div class="modal" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
      '<div class="modal-head"><h3>' + esc(title) + '</h3><button class="modal-close" id="modal-x" aria-label="إغلاق">✕</button></div>' +
      '<div class="modal-body">' + bodyHtml + '</div>' +
      '</div></div>';
    $('#modal-x').onclick = closeModal;
    $('#modal-ov').addEventListener('click', function (e) { if (e.target.id === 'modal-ov') closeModal(); });
    document.body.style.overflow = 'hidden';
    if (onMount) onMount();
  }
  function closeModal() {
    $('#modal-root').innerHTML = '';
    document.body.style.overflow = '';
  }

  // ── Components ──
  function stPill(status) {
    return '<span class="st st-' + esc(status) + '">' + (STATUS_LABELS[status] || esc(status)) + '</span>';
  }
  function flagChips(flags) {
    if (!flags || !flags.length) return '';
    return flags.map(function (f) {
      var def = FLAG_LABELS[f];
      if (!def) return '';
      return '<span class="flag' + (def.risk ? ' flag-risk' : '') + '">' + def.t + '</span>';
    }).join(' ');
  }
  function pathTrack(status) {
    var idx = PATH_STAGES.indexOf(status);
    if (status === 'to_confirm') idx = 0;
    if (idx < 0) return ''; // off-path statuses
    var html = '<div class="path-track" aria-hidden="true">';
    for (var i = 0; i < PATH_STAGES.length; i++) {
      html += '<span class="path-node ' + (i < idx ? 'done' : i === idx ? 'active' : '') + '"></span>';
      if (i < PATH_STAGES.length - 1) html += '<span class="path-seg ' + (i < idx ? 'done' : '') + '"></span>';
    }
    return html + '</div>';
  }
  function emptyState(icon, title, text, ctaHtml) {
    return '<div class="empty"><div class="empty-icon">' + icon + '</div><h4>' + esc(title) + '</h4><p>' + esc(text) + '</p>' + (ctaHtml || '') + '</div>';
  }
  function skeletons(n, h) {
    var out = '';
    for (var i = 0; i < n; i++) out += '<div class="skeleton" style="height:' + (h || 72) + 'px;margin-bottom:10px"></div>';
    return out;
  }
  function orderCard(o, selectable) {
    var checked = S.selectedOrders.has(o.id);
    return '<article class="order-card" data-oid="' + o.id + '">' +
      '<div class="oc-top">' +
      '<div class="row" style="gap:10px">' +
      (selectable ? '<input type="checkbox" class="checkbox-lg oc-check" data-oid="' + o.id + '" ' + (checked ? 'checked' : '') + ' aria-label="اختيار الطلب" onclick="event.stopPropagation()">' : '') +
      '<div><div class="oc-name">' + esc(o.customer_name) + '</div>' +
      '<div class="oc-sub">' + esc(o.product_name) + (o.quantity > 1 ? ' ×' + o.quantity : '') + '</div></div></div>' +
      stPill(o.status) + '</div>' +
      pathTrack(o.status) +
      '<div class="oc-meta">' +
      '<span class="oc-amount tabular">' + money(o.total_amount) + '</span>' +
      (o.city ? '<span>📍 ' + esc(o.city) + '</span>' : '') +
      '<span class="ltr tabular">' + esc(o.order_number) + '</span>' +
      '<span>' + timeAgo(o.created_at) + '</span>' +
      '</div>' +
      (o.flags && o.flags.length ? '<div class="row wrap mt-1">' + flagChips(o.flags) + '</div>' : '') +
      '</article>';
  }

  // ── Router ──
  function nav(view, param) {
    S.view = view;
    S.viewParam = param;
    window.scrollTo(0, 0);
    $$('.tab').forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-nav') === (view === 'order' ? 'orders' : view === 'customer' ? 'customers' : view));
    });
    var fab = $('#fab-add');
    fab.classList.toggle('hide', ['today', 'orders'].indexOf(view) < 0);
    var views = {
      today: renderToday, orders: renderOrders, order: renderOrderDetail,
      customers: renderCustomers, customer: renderCustomerDetail,
      messages: renderMessages, more: renderMore, products: renderProducts,
      reports: renderReports, settings: renderSettings, plan: renderPlan
    };
    (views[view] || renderToday)(param);
  }

  // ═══════════ TODAY VIEW ═══════════
  function renderToday() {
    var v = $('#main-view');
    v.innerHTML = '<div class="page-head"><h1>☀️ اليوم</h1><span class="small mut" id="today-date"></span></div>' + skeletons(4, 80);
    $('#today-date').textContent = new Date().toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long' });

    api('GET', '/api/reports/today').then(function (d) {
      var html =
        '<div class="page-head"><h1>☀️ اليوم</h1><span class="small mut">' + new Date().toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long' }) + '</span></div>' +
        '<div class="kpis">' +
        kpi(d.new_orders, 'طلب جديد', d.new_orders > 0) +
        kpi(d.to_confirm, 'يحتاج تأكيد/متابعة', false) +
        kpi(d.followups_due, 'موعد متابعة وصل', d.followups_due > 0) +
        kpi(d.to_ship, 'واجد للشحن', false) +
        '</div>';

      html += '<h2 style="font-size:1.05rem;color:var(--teal-800);margin:6px 0 12px">📋 شنو خاصك دير دابا</h2>';
      if (!d.action_queue.length) {
        html += emptyState('🎉', 'كلشي مضبوط!', 'ما كاين حتى طلب محتاج إجراء دابا. زيد طلب جديد أو شوف التقارير.',
          '<button class="btn btn-primary" onclick="T2.openAddOrder()">＋ زيد طلب</button>');
      } else {
        d.action_queue.forEach(function (o) { html += orderCard(o); });
        html += '<div style="text-align:center;margin-top:12px"><button class="btn btn-ghost" data-goto="orders">شوف گاع الطلبات ←</button></div>';
      }
      v.innerHTML = html;
      bindOrderCards(v);
      var g = $('[data-goto]', v);
      if (g) g.onclick = function () { nav('orders'); };
    }).catch(errView);

    function kpi(val, label, hot) {
      return '<div class="kpi' + (hot ? ' hot' : '') + '"><div class="kv tabular">' + (val || 0) + '</div><div class="kl">' + label + '</div></div>';
    }
  }

  function errView(e) {
    if (e && e.data && e.data.error === 'no_store') { renderOnboarding(); return; }
    $('#main-view').innerHTML = emptyState('😕', 'وقع مشكل', (e && e.message) || 'حاول تحديث الصفحة',
      '<button class="btn btn-primary" onclick="location.reload()">تحديث</button>');
  }

  function bindOrderCards(root) {
    $$('.order-card', root).forEach(function (card) {
      card.addEventListener('click', function () { nav('order', +card.getAttribute('data-oid')); });
    });
  }

  // ═══════════ ONBOARDING ═══════════
  function renderOnboarding() {
    var v = $('#main-view');
    v.innerHTML =
      '<div style="max-width:460px;margin:20px auto">' +
      '<div class="onb-progress"><span class="on"></span><span></span></div>' +
      '<h1 style="font-size:1.4rem;color:var(--teal-900);margin-bottom:6px">مرحباً ' + esc((S.user && S.user.name) || '') + ' 👋</h1>' +
      '<p class="soft mb-3">خطوة وحدة وحسابك واجد: عرفنا على متجرك.</p>' +
      '<div class="card card-pad">' +
      '<div class="field"><label for="onb-name">اسم المتجر *</label><input class="input" id="onb-name" placeholder="مثال: قفطان سلمى" maxlength="100"></div>' +
      '<div class="field"><label for="onb-cat">نوع النشاط</label><select class="select" id="onb-cat">' +
      '<option value="">اختار…</option><option value="clothing">ملابس وعبايات</option><option value="beauty">عطور وتجميل</option>' +
      '<option value="food">حلويات وأكل</option><option value="gifts">هدايا وإكسسوارات</option><option value="other">شي حاجة أخرى</option>' +
      '</select></div>' +
      '<div class="field"><label for="onb-city">المدينة</label><input class="input" id="onb-city" placeholder="مثال: الدار البيضاء" maxlength="100"></div>' +
      '<div class="err-msg hide" id="onb-err"></div>' +
      '<button class="btn btn-primary btn-block" id="onb-go">يالاه نبداو ✓</button>' +
      '</div></div>';
    $('#onb-go').onclick = function () {
      var name = $('#onb-name').value.trim();
      if (name.length < 2) { $('#onb-err').textContent = 'دخل اسم المتجر'; $('#onb-err').classList.remove('hide'); return; }
      this.innerHTML = '<span class="spinner"></span>'; this.disabled = true;
      api('POST', '/api/auth/onboarding', { store_name: name, category: $('#onb-cat').value, city: $('#onb-city').value.trim() })
        .then(function () { return api('GET', '/api/auth/me'); })
        .then(function (me) {
          S.user = me.user; S.store = me.store;
          $('#store-chip').textContent = S.store ? S.store.name : '';
          toast('متجرك تسجل! مرحباً بيك فتأكد 🎉', 'success');
          nav('today');
        })
        .catch(function (e) { toast(e.message, 'error'); $('#onb-go').textContent = 'يالاه نبداو ✓'; $('#onb-go').disabled = false; });
    };
  }

  // ═══════════ BOOT ═══════════
  window.T2 = { openAddOrder: function () { openOrderForm(); }, nav: nav };

  document.addEventListener('DOMContentLoaded', function () {
    $$('.tab').forEach(function (t) {
      t.addEventListener('click', function () { nav(t.getAttribute('data-nav')); });
    });
    $('#fab-add').addEventListener('click', function () { openOrderForm(); });
    $('#logout-btn').addEventListener('click', function () {
      api('POST', '/api/auth/logout').then(function () { window.location.href = '/'; });
    });

    api('GET', '/api/auth/me').then(function (me) {
      S.user = me.user; S.store = me.store;
      $('#store-chip').textContent = S.store ? S.store.name : 'بلا متجر';
      if (!S.store || !S.user.onboarded) renderOnboarding();
      else nav('today');
    }).catch(function () { /* redirected */ });
  });

  // ═══════════ ORDERS LIST ═══════════
  var searchTimer = null;
  function renderOrders() {
    var v = $('#main-view');
    var q = S.ordersQuery;
    v.innerHTML =
      '<div class="page-head"><h1>📦 الطلبات</h1>' +
      '<div class="row"><button class="btn btn-ghost btn-sm" id="btn-export">⬇ تصدير CSV</button>' +
      '<button class="btn btn-ghost btn-sm" id="btn-import">⬆ استيراد</button></div></div>' +
      '<div class="search-bar">' +
      '<input class="input grow" id="ord-search" placeholder="🔍 قلب بالاسم، التيليفون، رقم الطلب…" value="' + esc(q.search) + '">' +
      '<select class="select" id="ord-sort" style="max-width:130px;min-height:42px;padding:8px">' +
      '<option value="newest">الأحدث</option><option value="oldest">الأقدم</option>' +
      '<option value="amount_desc">الأغلى</option><option value="updated">آخر تحديث</option></select>' +
      '</div>' +
      '<div class="pills-scroll" id="status-pills"></div>' +
      '<div id="bulk-zone"></div>' +
      '<div id="orders-list">' + skeletons(5) + '</div>' +
      '<div id="orders-pager" style="text-align:center;margin-top:14px"></div>';

    $('#ord-sort').value = q.sort;
    $('#ord-search').addEventListener('input', function () {
      clearTimeout(searchTimer);
      var val = this.value;
      searchTimer = setTimeout(function () { q.search = val.trim(); q.page = 1; loadOrders(); }, 350);
    });
    $('#ord-sort').addEventListener('change', function () { q.sort = this.value; q.page = 1; loadOrders(); });
    $('#btn-export').onclick = function () { window.location.href = '/api/orders/export.csv'; };
    $('#btn-import').onclick = openImport;
    loadOrders();
  }

  function loadOrders() {
    var q = S.ordersQuery;
    var url = '/api/orders/?page=' + q.page + '&sort=' + q.sort +
      (q.status ? '&status=' + q.status : '') +
      (q.search ? '&search=' + encodeURIComponent(q.search) : '') +
      (q.followup ? '&followup=due' : '');
    api('GET', url).then(function (d) {
      renderStatusPills(d.counts, d.total);
      var list = $('#orders-list');
      if (!list) return;
      if (!d.orders.length) {
        list.innerHTML = q.search || q.status
          ? emptyState('🔍', 'ما لقينا والو', 'جرب تبدل البحث أو الفلتر.', '<button class="btn btn-ghost" onclick="T2.clearFilters()">مسح الفلاتر</button>')
          : emptyState('📦', 'مازال ما عندك حتى طلب', 'زيد أول طلب ديالك — كياخد أقل من 30 ثانية.', '<button class="btn btn-primary" onclick="T2.openAddOrder()">＋ زيد أول طلب</button>');
        $('#orders-pager').innerHTML = '';
        renderBulkBar();
        return;
      }
      list.innerHTML = d.orders.map(function (o) { return orderCard(o, true); }).join('');
      bindOrderCards(list);
      $$('.oc-check', list).forEach(function (cb) {
        cb.addEventListener('change', function () {
          var id = +cb.getAttribute('data-oid');
          if (cb.checked) S.selectedOrders.add(id); else S.selectedOrders.delete(id);
          renderBulkBar();
        });
      });
      var pages = Math.ceil(d.total / d.per_page);
      $('#orders-pager').innerHTML = pages > 1
        ? '<div class="row" style="justify-content:center">' +
          (q.page > 1 ? '<button class="btn btn-ghost btn-sm" id="pg-prev">→ السابق</button>' : '') +
          '<span class="small mut tabular">صفحة ' + q.page + ' من ' + pages + '</span>' +
          (q.page < pages ? '<button class="btn btn-ghost btn-sm" id="pg-next">التالي ←</button>' : '') + '</div>'
        : '<span class="small mut tabular">' + d.total + ' طلب</span>';
      var pv = $('#pg-prev'), nx = $('#pg-next');
      if (pv) pv.onclick = function () { q.page--; loadOrders(); window.scrollTo(0, 0); };
      if (nx) nx.onclick = function () { q.page++; loadOrders(); window.scrollTo(0, 0); };
      renderBulkBar();
    }).catch(errView);
  }

  T2.clearFilters = function () {
    S.ordersQuery = { status: '', search: '', sort: 'newest', page: 1, followup: '' };
    renderOrders();
  };

  function renderStatusPills(counts, total) {
    var el = $('#status-pills');
    if (!el) return;
    var q = S.ordersQuery;
    var html = '<button class="fpill' + (!q.status && !q.followup ? ' on' : '') + '" data-st="">الكل <span class="cnt tabular">' + (total || 0) + '</span></button>';
    STATUS_ORDER.forEach(function (st) {
      var n = counts[st] || 0;
      if (!n && q.status !== st) return;
      html += '<button class="fpill' + (q.status === st ? ' on' : '') + '" data-st="' + st + '">' + STATUS_LABELS[st] + ' <span class="cnt tabular">' + n + '</span></button>';
    });
    el.innerHTML = html;
    $$('.fpill', el).forEach(function (p) {
      p.addEventListener('click', function () {
        q.status = p.getAttribute('data-st'); q.followup = ''; q.page = 1;
        loadOrders();
      });
    });
  }

  function renderBulkBar() {
    var zone = $('#bulk-zone');
    if (!zone) return;
    var n = S.selectedOrders.size;
    if (!n) { zone.innerHTML = ''; return; }
    zone.innerHTML =
      '<div class="bulk-bar"><span class="bold">' + n + ' طلب مختار</span>' +
      '<select id="bulk-status"><option value="">بدّل الحالة ل…</option>' +
      STATUS_ORDER.map(function (s) { return '<option value="' + s + '">' + STATUS_LABELS[s] + '</option>'; }).join('') +
      '</select>' +
      '<button class="btn btn-amber btn-sm" id="bulk-go">طبّق</button>' +
      '<button class="btn btn-sm" style="background:rgba(255,255,255,0.15);color:#fff" id="bulk-clear">إلغاء</button></div>';
    $('#bulk-go').onclick = function () {
      var st = $('#bulk-status').value;
      if (!st) { toast('اختار الحالة أولاً', 'info'); return; }
      api('POST', '/api/orders/bulk', { ids: Array.from(S.selectedOrders), status: st })
        .then(function (r) {
          toast('تبدلات حالة ' + r.updated + ' طلب ✓', 'success');
          S.selectedOrders.clear();
          loadOrders();
        }).catch(function (e) { toast(e.message, 'error'); });
    };
    $('#bulk-clear').onclick = function () { S.selectedOrders.clear(); renderOrders(); };
  }

  // ── CSV Import ──
  function openImport() {
    openModal('استيراد طلبات من CSV',
      '<p class="small soft mb-2">الملف خاصو يكون فيه الأعمدة: <span class="ltr tabular">customer_name, customer_phone, product_name</span> (إجبارية) و<span class="ltr tabular">city, address, quantity, total_amount, notes</span> (اختيارية).</p>' +
      '<input type="file" id="csv-file" accept=".csv,text/csv" class="input mb-2">' +
      '<div id="csv-preview" class="small mut mb-2"></div>' +
      '<button class="btn btn-primary btn-block" id="csv-go" disabled>استورد</button>',
      function () {
        var rows = null;
        $('#csv-file').addEventListener('change', function () {
          var f = this.files[0];
          if (!f) return;
          var reader = new FileReader();
          reader.onload = function () {
            rows = parseCSV(reader.result);
            $('#csv-preview').textContent = rows.length ? '✓ تلقاو ' + rows.length + ' سطر فالملف' : 'الملف خاوي أو الصيغة ماشي هي هاديك';
            $('#csv-go').disabled = !rows.length;
          };
          reader.readAsText(f, 'UTF-8');
        });
        $('#csv-go').onclick = function () {
          if (!rows || !rows.length) return;
          this.innerHTML = '<span class="spinner"></span>'; this.disabled = true;
          api('POST', '/api/orders/import', { rows: rows })
            .then(function (r) {
              closeModal();
              toast('تستوردو ' + r.imported + ' طلب' + (r.skipped ? ' (تجاهلنا ' + r.skipped + ' سطر ناقص)' : '') + ' ✓', 'success');
              loadOrders();
            })
            .catch(function (e) { toast(e.message, 'error'); closeModal(); });
        };
      });
  }

  function parseCSV(text) {
    var lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (lines.length < 2) return [];
    function splitLine(line) {
      var out = [], cur = '', inQ = false;
      for (var i = 0; i < line.length; i++) {
        var ch = line[i];
        if (inQ) {
          if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
          else if (ch === '"') inQ = false;
          else cur += ch;
        } else {
          if (ch === '"') inQ = true;
          else if (ch === ',') { out.push(cur); cur = ''; }
          else cur += ch;
        }
      }
      out.push(cur);
      return out;
    }
    var headers = splitLine(lines[0]).map(function (h) { return h.trim().toLowerCase(); });
    return lines.slice(1, 501).map(function (line) {
      var vals = splitLine(line);
      var row = {};
      headers.forEach(function (h, i) { row[h] = (vals[i] || '').trim(); });
      return row;
    });
  }

  // ═══════════ ORDER FORM (add / edit) ═══════════
  function openOrderForm(existing) {
    var isEdit = !!existing;
    var o = existing || {};
    openModal(isEdit ? 'تعديل الطلب ' + (o.order_number || '') : '＋ طلب جديد',
      '<div class="field"><label>اسم العميل *</label><input class="input" id="of-name" value="' + esc(o.customer_name || '') + '" maxlength="100" placeholder="مثال: فاطمة العلوي"></div>' +
      '<div class="field"><label>رقم الهاتف *</label><input class="input ltr" id="of-phone" type="tel" value="' + esc(o.customer_phone || '') + '" placeholder="0661234567"></div>' +
      '<div class="row" style="gap:10px;align-items:flex-start">' +
      '<div class="field grow"><label>المدينة</label><input class="input" id="of-city" value="' + esc(o.city || '') + '" maxlength="100" placeholder="الدار البيضاء"></div>' +
      (!isEdit ? '<div class="field"><label>المصدر</label><select class="select" id="of-source">' +
        '<option value="instagram">إنستغرام</option><option value="whatsapp">واتساب</option><option value="facebook">فيسبوك</option><option value="manual">مكالمة/يدوي</option>' +
        '</select></div>' : '') +
      '</div>' +
      '<div class="field"><label>العنوان</label><textarea class="textarea" id="of-address" style="min-height:64px" maxlength="300" placeholder="الحي، الزنقة، رقم الدار…">' + esc(o.address || '') + '</textarea></div>' +
      '<div class="field"><label>المنتج *</label><input class="input" id="of-product" list="products-dl" value="' + esc(o.product_name || '') + '" maxlength="200" placeholder="مثال: قفطان مخزني أخضر"><datalist id="products-dl"></datalist></div>' +
      '<div class="row" style="gap:10px">' +
      '<div class="field grow"><label>الكمية</label><input class="input tabular" id="of-qty" type="number" min="1" max="1000" value="' + (o.quantity || 1) + '"></div>' +
      '<div class="field grow"><label>المبلغ الإجمالي (درهم)</label><input class="input tabular" id="of-amount" type="number" min="0" step="0.5" value="' + (o.total_amount || '') + '" placeholder="0"></div>' +
      '</div>' +
      '<div class="field"><label>ملاحظات</label><input class="input" id="of-notes" value="' + esc(o.notes || '') + '" maxlength="500" placeholder="اختياري"></div>' +
      '<div class="field"><label>موعد المتابعة <span class="mut small">(باش يفكرك النظام)</span></label><input class="input ltr" id="of-followup" type="datetime-local" value="' + (o.followup_at ? o.followup_at.replace(' ', 'T').slice(0, 16) : '') + '"></div>' +
      '<div class="err-msg hide" id="of-err"></div>' +
      '<button class="btn btn-primary btn-block" id="of-save">' + (isEdit ? 'سجل التعديلات ✓' : 'زيد الطلب ✓') + '</button>',
      function () {
        api('GET', '/api/products/').then(function (d) {
          $('#products-dl').innerHTML = d.products.map(function (p) { return '<option value="' + esc(p.name) + '">'; }).join('');
          var prodInput = $('#of-product'), amountInput = $('#of-amount'), qtyInput = $('#of-qty');
          function autoFill() {
            var p = d.products.find(function (x) { return x.name === prodInput.value; });
            if (p && p.price) amountInput.value = (p.price * (parseInt(qtyInput.value) || 1));
          }
          prodInput.addEventListener('change', autoFill);
          qtyInput.addEventListener('change', autoFill);
        }).catch(function () {});

        $('#of-save').onclick = function () {
          var err = $('#of-err');
          err.classList.add('hide');
          var payload = {
            customer_name: $('#of-name').value.trim(),
            customer_phone: $('#of-phone').value.trim(),
            city: $('#of-city').value.trim(),
            address: $('#of-address').value.trim(),
            product_name: $('#of-product').value.trim(),
            quantity: parseInt($('#of-qty').value) || 1,
            total_amount: parseFloat($('#of-amount').value) || 0,
            notes: $('#of-notes').value.trim(),
            followup_at: $('#of-followup').value ? $('#of-followup').value.replace('T', ' ') : ''
          };
          if (!isEdit) payload.source = $('#of-source').value;
          if (!payload.customer_name) return showFieldErr('دخل اسم العميل');
          if (!/^(\+?\d[\d\s\-\.]{5,18})$/.test(payload.customer_phone)) return showFieldErr('دخل رقم هاتف صحيح (مثال: 0661234567)');
          if (!payload.product_name) return showFieldErr('دخل اسم المنتج');
          function showFieldErr(m) { err.textContent = m; err.classList.remove('hide'); }
          var btn = this;
          btn.innerHTML = '<span class="spinner"></span>'; btn.disabled = true;
          var req = isEdit ? api('PUT', '/api/orders/' + o.id, payload) : api('POST', '/api/orders/', payload);
          req.then(function (r) {
            closeModal();
            toast(isEdit ? 'تسجلو التعديلات ✓' : 'تزاد الطلب ' + (r.order_number || '') + ' ✓', 'success');
            if (S.view === 'orders') loadOrders();
            else if (S.view === 'order') nav('order', o.id);
            else nav('today');
          }).catch(function (e) {
            btn.textContent = isEdit ? 'سجل التعديلات ✓' : 'زيد الطلب ✓'; btn.disabled = false;
            showFieldErr(e.message);
          });
        };
      });
  }

  // ═══════════ ORDER DETAIL ═══════════
  function renderOrderDetail(id) {
    var v = $('#main-view');
    v.innerHTML = skeletons(4, 100);
    api('GET', '/api/orders/' + id).then(function (d) {
      var o = d.order;
      var html =
        '<div class="page-head">' +
        '<div class="row"><button class="btn btn-ghost btn-sm" id="back-btn">→</button>' +
        '<h1 class="tabular" style="font-size:1.15rem">' + esc(o.order_number) + '</h1>' + stPill(o.status) + '</div>' +
        '<button class="btn btn-ghost btn-sm" id="edit-btn">✏️ تعديل</button></div>';

      // path
      html += '<div class="card card-pad mb-2">' + (pathTrack(o.status) || '<p class="small mut">هاد الطلب خارج المسار الأساسي (' + STATUS_LABELS[o.status] + ')</p>');

      // next action suggestion
      var nextSuggestion = {
        new: { label: '📞 عيط للعميل وأكد الطلب', st: 'confirmed', btn: '✓ تأكد الطلب' },
        to_confirm: { label: '📞 عاود حاول الاتصال أو صيفط رسالة', st: 'confirmed', btn: '✓ تأكد الطلب' },
        confirmed: { label: '📦 وجد الطرد للشحن', st: 'preparing', btn: '📦 بدا التجهيز' },
        preparing: { label: '🚚 سلم الطرد لشركة التوصيل', st: 'shipped', btn: '🚚 تصيفط' },
        shipped: { label: '⏳ تبع مع شركة التوصيل حتى التسليم', st: 'delivered', btn: '✅ توصّل' },
        no_answer: { label: '📞 عاود المحاولة فوقت آخر أو صيفط رسالة', st: 'confirmed', btn: '✓ تأكد الطلب' }
      }[o.status];
      if (nextSuggestion) {
        html += '<div class="row-between wrap mt-2" style="background:var(--teal-50);border-radius:var(--radius-sm);padding:12px 14px">' +
          '<span class="small" style="color:var(--teal-800);font-weight:600">' + nextSuggestion.label + '</span>' +
          '<button class="btn btn-primary btn-sm" id="quick-advance" data-st="' + nextSuggestion.st + '">' + nextSuggestion.btn + '</button></div>';
      }
      html += '</div>';

      // flags
      if (o.flags && o.flags.length) {
        html += '<div class="card card-pad mb-2" style="border-color:var(--amber-500)"><h3 class="small bold mb-1" style="color:var(--amber-600)">⚠️ راجع قبل الشحن</h3><div class="row wrap">' + flagChips(o.flags) + '</div></div>';
      }

      // customer + order info
      html += '<div class="card card-pad mb-2">' +
        '<div class="row-between mb-1"><h3 style="font-size:1rem;color:var(--teal-800)">👤 ' + esc(o.customer_name) + '</h3>' +
        '<div class="row">' +
        '<a class="btn btn-ghost btn-sm ltr" href="tel:' + esc(o.customer_phone) + '" id="call-link">📞 ' + esc(o.customer_phone) + '</a>' +
        '</div></div>' +
        '<p class="small soft">📍 ' + esc(o.city || 'بلا مدينة') + (o.address ? ' — ' + esc(o.address) : ' — <span style="color:var(--amber-600)">العنوان ناقص</span>') + '</p>' +
        '<hr style="border:none;border-top:1px solid var(--line);margin:12px 0">' +
        '<div class="row-between wrap"><span>' + esc(o.product_name) + (o.quantity > 1 ? ' <span class="tabular">×' + o.quantity + '</span>' : '') + '</span>' +
        '<span class="bold tabular" style="color:var(--teal-700)">' + money(o.total_amount) + '</span></div>' +
        '<p class="small mut mt-1">المصدر: ' + (SOURCE_LABELS[o.source] || esc(o.source)) + ' · ' + timeAgo(o.created_at) +
        (o.call_attempts ? ' · <span class="tabular">' + o.call_attempts + '</span> محاولات اتصال' : '') + '</p>' +
        (o.notes ? '<p class="small mt-1" style="background:var(--amber-100);padding:8px 12px;border-radius:8px">📝 ' + esc(o.notes) + '</p>' : '') +
        (o.followup_at ? '<p class="small mt-1" style="color:var(--amber-600);font-weight:600">⏰ موعد المتابعة: ' + esc(o.followup_at).slice(0, 16) + '</p>' : '') +
        '</div>';

      // quick actions
      html += '<div class="card card-pad mb-2"><h3 style="font-size:0.98rem;color:var(--teal-800)" class="mb-1">⚡ إجراءات سريعة</h3>' +
        '<div class="row wrap">' +
        '<button class="btn btn-ghost btn-sm" id="act-msg">💬 نسخ رسالة للعميل</button>' +
        '<button class="btn btn-ghost btn-sm" id="act-call">📞 سجل محاولة اتصال</button>' +
        '<button class="btn btn-ghost btn-sm" id="act-note">📝 زيد ملاحظة</button>' +
        '<button class="btn btn-ghost btn-sm" id="act-followup">⏰ حدد متابعة</button>' +
        '</div></div>';

      // full status picker
      html += '<div class="card card-pad mb-2"><h3 style="font-size:0.98rem;color:var(--teal-800)" class="mb-1">🔄 بدّل الحالة</h3><div class="status-grid" id="status-grid">' +
        STATUS_ORDER.map(function (s) {
          return '<button class="status-opt' + (s === o.status ? ' on' : '') + '" data-st="' + s + '" style="color:var(--st-' + s + ')">' + STATUS_LABELS[s] + '</button>';
        }).join('') + '</div></div>';

      // customer history
      if (d.customer_history && d.customer_history.length) {
        html += '<div class="card card-pad mb-2"><h3 style="font-size:0.98rem;color:var(--teal-800)" class="mb-1">🗂 طلبات سابقة لنفس الرقم</h3>' +
          d.customer_history.map(function (h) {
            return '<div class="row-between" style="padding:7px 0;border-bottom:1px solid var(--line)">' +
              '<span class="small">' + esc(h.product_name) + ' <span class="mut tabular">' + esc(h.order_number) + '</span></span>' + stPill(h.status) + '</div>';
          }).join('') + '</div>';
      }

      // timeline
      html += '<div class="card card-pad mb-2"><h3 style="font-size:0.98rem;color:var(--teal-800)" class="mb-2">🕓 سجل الطلب</h3>';
      if (d.events && d.events.length) {
        html += '<div class="tl">' + d.events.map(function (ev) {
          var txt = ev.event_type === 'status_change'
            ? 'تبدلات الحالة: ' + (STATUS_LABELS[ev.from_status] || '—') + ' ← ' + (STATUS_LABELS[ev.to_status] || '')
            : ev.event_type === 'created' ? 'تسجل الطلب'
            : ev.event_type === 'call_attempt' ? '📞 محاولة اتصال'
            : ev.event_type === 'note' ? '📝 ملاحظة' : 'تعديل';
          return '<div class="tl-item"><div class="small bold soft">' + txt + '</div>' +
            (ev.detail ? '<div class="small mut">' + esc(ev.detail) + '</div>' : '') +
            '<div class="tl-t">' + timeAgo(ev.created_at) + '</div></div>';
        }).join('') + '</div>';
      } else html += '<p class="small mut">ما كاين حتى حدث بعد.</p>';
      html += '</div>';

      html += '<button class="btn btn-danger btn-block mb-3" id="del-btn">🗑 حذف الطلب</button>';

      v.innerHTML = html;

      // ── bindings ──
      $('#back-btn').onclick = function () { nav('orders'); };
      $('#edit-btn').onclick = function () { openOrderForm(o); };
      var qa = $('#quick-advance');
      if (qa) qa.onclick = function () { changeStatus(o.id, qa.getAttribute('data-st')); };

      $$('.status-opt').forEach(function (b) {
        b.addEventListener('click', function () {
          var st = b.getAttribute('data-st');
          if (st !== o.status) changeStatus(o.id, st);
        });
      });

      $('#act-msg').onclick = function () { openMessagePicker(o); };
      $('#act-call').onclick = function () {
        api('POST', '/api/orders/' + o.id + '/call').then(function (r) {
          toast('تسجلات المحاولة ' + r.attempts + ' 📞', 'success');
          nav('order', o.id);
        }).catch(function (e) { toast(e.message, 'error'); });
      };
      $('#act-note').onclick = function () {
        openModal('📝 زيد ملاحظة',
          '<div class="field"><textarea class="textarea" id="note-txt" maxlength="500" placeholder="مثال: قالت عيط ليها بعد الخمسة…">' + esc(o.notes || '') + '</textarea></div>' +
          '<button class="btn btn-primary btn-block" id="note-save">سجل ✓</button>',
          function () {
            $('#note-save').onclick = function () {
              var note = $('#note-txt').value.trim();
              if (!note) return toast('اكتب الملاحظة أولاً', 'info');
              api('POST', '/api/orders/' + o.id + '/note', { note: note }).then(function () {
                closeModal(); toast('تسجلات الملاحظة ✓', 'success'); nav('order', o.id);
              }).catch(function (e) { toast(e.message, 'error'); });
            };
          });
      };
      $('#act-followup').onclick = function () {
        openModal('⏰ موعد المتابعة',
          '<p class="small soft mb-2">حدد فوقاش بغيتي النظام يفكرك بهاد الطلب — غادي يبان فلائحة «اليوم».</p>' +
          '<div class="field"><input class="input ltr" type="datetime-local" id="fu-dt" value="' + (o.followup_at ? o.followup_at.replace(' ', 'T').slice(0, 16) : '') + '"></div>' +
          '<button class="btn btn-primary btn-block" id="fu-save">حدد الموعد ✓</button>',
          function () {
            $('#fu-save').onclick = function () {
              var dt = $('#fu-dt').value;
              if (!dt) return toast('اختار التاريخ والوقت', 'info');
              api('PUT', '/api/orders/' + o.id, {
                customer_name: o.customer_name, customer_phone: o.customer_phone, city: o.city || '',
                address: o.address || '', product_name: o.product_name, quantity: o.quantity,
                total_amount: o.total_amount, notes: o.notes || '', followup_at: dt.replace('T', ' ')
              }).then(function () { closeModal(); toast('تسجل موعد المتابعة ⏰', 'success'); nav('order', o.id); })
                .catch(function (e) { toast(e.message, 'error'); });
            };
          });
      };
      $('#del-btn').onclick = function () {
        openModal('🗑 حذف الطلب',
          '<p class="mb-2">واش متأكد بغيتي تحذف الطلب <strong class="tabular">' + esc(o.order_number) + '</strong>؟ هاد العملية ما كترجعش.</p>' +
          '<div class="row"><button class="btn btn-danger grow" id="del-yes">نعم، احذف</button><button class="btn btn-ghost grow" id="del-no">لا، رجعني</button></div>',
          function () {
            $('#del-no').onclick = closeModal;
            $('#del-yes').onclick = function () {
              api('DELETE', '/api/orders/' + o.id).then(function () {
                closeModal(); toast('تحذف الطلب', 'success'); nav('orders');
              }).catch(function (e) { toast(e.message, 'error'); });
            };
          });
      };
    }).catch(errView);
  }

  function changeStatus(orderId, newStatus) {
    api('POST', '/api/orders/' + orderId + '/status', { status: newStatus }).then(function () {
      if (newStatus === 'confirmed') toast('✓ الطلب تأكد!', 'success');
      else if (newStatus === 'delivered') toast('🎉 مبروك! طلب آخر توصّل', 'success');
      else toast('تبدلات الحالة ل«' + STATUS_LABELS[newStatus] + '» ✓', 'success');
      nav('order', orderId);
    }).catch(function (e) { toast(e.message, 'error'); });
  }

  // ── Message picker: choose template → rendered → copy ──
  function openMessagePicker(order) {
    openModal('💬 رسالة للعميل',
      '<p class="small soft mb-2">اختار الرسالة، غادي تتعمر أوتوماتيكياً بمعلومات الطلب، ومن بعد انسخها وصيفطها من الواتساب أو الدايركت.</p>' +
      '<div id="tpl-list">' + skeletons(3, 52) + '</div>' +
      '<div id="tpl-render" class="hide">' +
      '<div class="msg-body-preview" id="tpl-text"></div>' +
      '<div class="row"><button class="btn btn-primary grow" id="tpl-copy">📋 نسخ الرسالة</button>' +
      '<button class="btn btn-ghost" id="tpl-back">↩ رجوع</button></div>' +
      '<p class="hint mt-1">من بعد النسخ: حل الواتساب ولصق الرسالة. (الإرسال الآلي غير الرسمي كيعرض رقمك للحظر — لهذا كنخليوه يدوي وآمن.)</p>' +
      '</div>',
      function () {
        api('GET', '/api/templates/').then(function (d) {
          var listEl = $('#tpl-list');
          if (!d.templates.length) {
            listEl.innerHTML = emptyState('💬', 'ما عندك حتى قالب', 'زيد قوالب الرسائل من تبويب «الرسائل».');
            return;
          }
          listEl.innerHTML = d.templates.map(function (t) {
            return '<button class="btn btn-ghost btn-block mb-1" style="justify-content:flex-start" data-tid="' + t.id + '">' + esc(t.title) + '</button>';
          }).join('');
          $$('[data-tid]', listEl).forEach(function (b) {
            b.addEventListener('click', function () {
              api('GET', '/api/templates/render/' + b.getAttribute('data-tid') + '/' + order.id).then(function (r) {
                $('#tpl-list').classList.add('hide');
                $('#tpl-render').classList.remove('hide');
                $('#tpl-text').textContent = r.text;
              }).catch(function (e) { toast(e.message, 'error'); });
            });
          });
          $('#tpl-back').onclick = function () {
            $('#tpl-render').classList.add('hide');
            $('#tpl-list').classList.remove('hide');
          };
          $('#tpl-copy').onclick = function () {
            copyText($('#tpl-text').textContent).then(function () {
              toast('تنسخات الرسالة ✓ — حل الواتساب ولصقها', 'success');
            });
          };
        }).catch(function (e) { toast(e.message, 'error'); closeModal(); });
      });
  }

  // ═══════════ CUSTOMERS ═══════════
  var custSearchTimer = null;
  function renderCustomers() {
    var v = $('#main-view');
    v.innerHTML =
      '<div class="page-head"><h1>👥 العملاء</h1></div>' +
      '<div class="search-bar"><input class="input grow" id="cust-search" placeholder="🔍 قلب بالاسم أو التيليفون…"></div>' +
      '<div id="cust-list">' + skeletons(4, 64) + '</div>';
    $('#cust-search').addEventListener('input', function () {
      clearTimeout(custSearchTimer);
      var val = this.value.trim();
      custSearchTimer = setTimeout(function () { loadCustomers(val); }, 350);
    });
    loadCustomers('');
  }
  function loadCustomers(search) {
    api('GET', '/api/customers/' + (search ? '?search=' + encodeURIComponent(search) : '')).then(function (d) {
      var el = $('#cust-list');
      if (!el) return;
      if (!d.customers.length) {
        el.innerHTML = search
          ? emptyState('🔍', 'ما لقينا حتى عميل', 'جرب اسم أو رقم آخر.')
          : emptyState('👥', 'مازال ما عندك عملاء', 'العملاء كيتزادو أوتوماتيكياً ملي كتسجل الطلبات.');
        return;
      }
      el.innerHTML = d.customers.map(function (c) {
        return '<div class="list-row" style="cursor:pointer" data-cid="' + c.id + '">' +
          '<div><div class="bold" style="color:var(--teal-900)">' + esc(c.name) + '</div>' +
          '<div class="small mut ltr" style="text-align:right">' + esc(c.phone) + '</div>' +
          '<div class="small mut">' + (c.city ? '📍 ' + esc(c.city) + ' · ' : '') + '<span class="tabular">' + c.orders_count + '</span> طلب' +
          (c.risk_count >= 2 ? ' · <span style="color:var(--danger)">⚠️ ' + c.risk_count + ' إلغاء/إرجاع</span>' : '') + '</div></div>' +
          '<div class="bold tabular small" style="color:var(--teal-700)">' + money(c.delivered_total) + '</div>' +
          '</div>';
      }).join('');
      $$('[data-cid]', el).forEach(function (r) {
        r.addEventListener('click', function () { nav('customer', +r.getAttribute('data-cid')); });
      });
    }).catch(errView);
  }

  function renderCustomerDetail(id) {
    var v = $('#main-view');
    v.innerHTML = skeletons(3, 90);
    api('GET', '/api/customers/' + id).then(function (d) {
      var c = d.customer;
      var html =
        '<div class="page-head"><div class="row"><button class="btn btn-ghost btn-sm" id="back-btn">→</button><h1 style="font-size:1.2rem">' + esc(c.name) + '</h1></div>' +
        '<button class="btn btn-ghost btn-sm" id="edit-cust">✏️ تعديل</button></div>' +
        '<div class="card card-pad mb-2">' +
        '<div class="row wrap mb-1"><a class="btn btn-ghost btn-sm ltr" href="tel:' + esc(c.phone) + '">📞 ' + esc(c.phone) + '</a></div>' +
        '<p class="small soft">📍 ' + esc(c.city || 'بلا مدينة') + (c.address ? ' — ' + esc(c.address) : '') + '</p>' +
        (c.notes ? '<p class="small mt-1" style="background:var(--amber-100);padding:8px 12px;border-radius:8px">📝 ' + esc(c.notes) + '</p>' : '') +
        '</div>' +
        '<h3 style="font-size:1rem;color:var(--teal-800);margin:14px 0 10px">🗂 طلبات هاد العميل (' + d.orders.length + ')</h3>';
      if (!d.orders.length) html += emptyState('📦', 'ما عندو حتى طلب', '');
      else html += d.orders.map(function (h) {
        return '<div class="list-row" style="cursor:pointer" data-oid="' + h.id + '">' +
          '<div><div class="small bold">' + esc(h.product_name) + '</div><div class="small mut tabular">' + esc(h.order_number) + ' · ' + timeAgo(h.created_at) + '</div></div>' +
          '<div class="row">' + stPill(h.status) + '<span class="small bold tabular">' + money(h.total_amount) + '</span></div></div>';
      }).join('');
      v.innerHTML = html;
      $('#back-btn').onclick = function () { nav('customers'); };
      $$('[data-oid]', v).forEach(function (r) {
        r.addEventListener('click', function () { nav('order', +r.getAttribute('data-oid')); });
      });
      $('#edit-cust').onclick = function () {
        openModal('✏️ تعديل العميل',
          '<div class="field"><label>الاسم *</label><input class="input" id="ce-name" value="' + esc(c.name) + '" maxlength="100"></div>' +
          '<div class="field"><label>الهاتف *</label><input class="input ltr" id="ce-phone" value="' + esc(c.phone) + '"></div>' +
          '<div class="field"><label>المدينة</label><input class="input" id="ce-city" value="' + esc(c.city || '') + '" maxlength="100"></div>' +
          '<div class="field"><label>العنوان</label><input class="input" id="ce-address" value="' + esc(c.address || '') + '" maxlength="300"></div>' +
          '<div class="field"><label>ملاحظات</label><input class="input" id="ce-notes" value="' + esc(c.notes || '') + '" maxlength="500"></div>' +
          '<button class="btn btn-primary btn-block" id="ce-save">سجل ✓</button>',
          function () {
            $('#ce-save').onclick = function () {
              api('PUT', '/api/customers/' + c.id, {
                name: $('#ce-name').value.trim(), phone: $('#ce-phone').value.trim(),
                city: $('#ce-city').value.trim(), address: $('#ce-address').value.trim(), notes: $('#ce-notes').value.trim()
              }).then(function () { closeModal(); toast('تسجلات التعديلات ✓', 'success'); nav('customer', c.id); })
                .catch(function (e) { toast(e.message, 'error'); });
            };
          });
      };
    }).catch(errView);
  }

  // ═══════════ MESSAGES (templates management) ═══════════
  function renderMessages() {
    var v = $('#main-view');
    v.innerHTML =
      '<div class="page-head"><h1>💬 الرسائل الجاهزة</h1><button class="btn btn-primary btn-sm" id="add-tpl">＋ قالب جديد</button></div>' +
      '<p class="small soft mb-2">هادو هوما الرسائل اللي كتنسخها من داخل أي طلب. المتغيرات كتتعمر بوحدها: <span class="ltr tabular small">{{customer_name}} {{order_number}} {{product_name}} {{total_amount}} {{city}} {{store_name}}</span></p>' +
      '<div id="tpl-mgr">' + skeletons(4, 110) + '</div>';
    $('#add-tpl').onclick = function () { openTemplateForm(); };
    loadTemplates();
  }
  function loadTemplates() {
    api('GET', '/api/templates/').then(function (d) {
      var el = $('#tpl-mgr');
      if (!el) return;
      if (!d.templates.length) {
        el.innerHTML = emptyState('💬', 'ما عندك حتى قالب', 'زيد أول قالب رسالة — مثلاً رسالة تأكيد الطلب.',
          '<button class="btn btn-primary" onclick="document.getElementById(\'add-tpl\').click()">＋ زيد قالب</button>');
        return;
      }
      var langLabels = { darija: 'الدارجة', ar: 'العربية', fr: 'Français' };
      el.innerHTML = d.templates.map(function (t) {
        return '<div class="msg-tpl-card">' +
          '<div class="row-between"><h3 style="font-size:1rem;color:var(--teal-800)">' + esc(t.title) + '</h3>' +
          '<span class="small mut">' + (langLabels[t.lang] || t.lang) + '</span></div>' +
          '<div class="msg-body-preview">' + esc(t.body) + '</div>' +
          '<div class="row wrap">' +
          '<button class="btn btn-ghost btn-sm tpl-preview" data-tid="' + t.id + '">👁 معاينة بمثال</button>' +
          '<button class="btn btn-ghost btn-sm tpl-edit" data-tid="' + t.id + '">✏️ تعديل</button>' +
          '<button class="btn btn-danger btn-sm tpl-del" data-tid="' + t.id + '">حذف</button>' +
          '</div></div>';
      }).join('');
      $$('.tpl-edit', el).forEach(function (b) {
        b.addEventListener('click', function () {
          var t = d.templates.find(function (x) { return x.id === +b.getAttribute('data-tid'); });
          openTemplateForm(t);
        });
      });
      $$('.tpl-preview', el).forEach(function (b) {
        b.addEventListener('click', function () {
          var t = d.templates.find(function (x) { return x.id === +b.getAttribute('data-tid'); });
          var sample = { customer_name: 'خديجة', order_number: 'T-1042', product_name: 'جلابة صيفية بيضاء', total_amount: '420', city: 'مراكش', store_name: (S.store && S.store.name) || 'متجرك' };
          var text = t.body.replace(/\{\{(\w+)\}\}/g, function (_, k) { return sample[k] || '{{' + k + '}}'; });
          openModal('👁 معاينة: ' + t.title,
            '<div class="msg-body-preview">' + esc(text) + '</div>' +
            '<button class="btn btn-primary btn-block" id="pv-copy">📋 نسخ</button>',
            function () {
              $('#pv-copy').onclick = function () { copyText(text).then(function () { toast('تنسخات ✓', 'success'); }); };
            });
        });
      });
      $$('.tpl-del', el).forEach(function (b) {
        b.addEventListener('click', function () {
          var tid = +b.getAttribute('data-tid');
          openModal('حذف القالب', '<p class="mb-2">واش متأكد بغيتي تحذف هاد القالب؟</p>' +
            '<div class="row"><button class="btn btn-danger grow" id="td-yes">نعم، احذف</button><button class="btn btn-ghost grow" id="td-no">رجعني</button></div>',
            function () {
              $('#td-no').onclick = closeModal;
              $('#td-yes').onclick = function () {
                api('DELETE', '/api/templates/' + tid).then(function () { closeModal(); toast('تحذف القالب', 'success'); loadTemplates(); })
                  .catch(function (e) { toast(e.message, 'error'); });
              };
            });
        });
      });
    }).catch(errView);
  }

  function openTemplateForm(existing) {
    var isEdit = !!existing;
    var t = existing || {};
    openModal(isEdit ? '✏️ تعديل القالب' : '＋ قالب جديد',
      '<div class="field"><label>عنوان القالب *</label><input class="input" id="tf-title" value="' + esc(t.title || '') + '" maxlength="100" placeholder="مثال: تأكيد الطلب"></div>' +
      '<div class="row" style="gap:10px">' +
      '<div class="field grow"><label>اللغة</label><select class="select" id="tf-lang">' +
      '<option value="darija">الدارجة المغربية</option><option value="ar">العربية الفصحى</option><option value="fr">Français</option></select></div>' +
      '<div class="field grow"><label>الأسلوب</label><select class="select" id="tf-tone">' +
      '<option value="friendly">ودّي</option><option value="formal">رسمي</option></select></div></div>' +
      '<div class="field"><label>نص الرسالة *</label>' +
      '<textarea class="textarea" id="tf-body" maxlength="1000" placeholder="سلام {{customer_name}}…">' + esc(t.body || '') + '</textarea>' +
      '<p class="hint">اضغط على متغير باش يتزاد:</p>' +
      '<div class="row wrap mt-1" id="var-chips">' +
      ['customer_name', 'order_number', 'product_name', 'total_amount', 'city', 'store_name'].map(function (vn) {
        return '<button type="button" class="flag ltr" data-var="' + vn + '" style="cursor:pointer">{{' + vn + '}}</button>';
      }).join('') + '</div></div>' +
      '<button class="btn btn-primary btn-block" id="tf-save">' + (isEdit ? 'سجل التعديلات ✓' : 'زيد القالب ✓') + '</button>',
      function () {
        if (t.lang) $('#tf-lang').value = t.lang;
        if (t.tone) $('#tf-tone').value = t.tone;
        $$('[data-var]').forEach(function (chip) {
          chip.addEventListener('click', function () {
            var ta = $('#tf-body');
            var ins = '{{' + chip.getAttribute('data-var') + '}}';
            var start = ta.selectionStart || ta.value.length;
            ta.value = ta.value.slice(0, start) + ins + ta.value.slice(ta.selectionEnd || start);
            ta.focus();
          });
        });
        $('#tf-save').onclick = function () {
          var payload = { title: $('#tf-title').value.trim(), body: $('#tf-body').value.trim(), lang: $('#tf-lang').value, tone: $('#tf-tone').value, slug: t.slug || 'custom' };
          if (!payload.title || !payload.body) return toast('العنوان والنص مطلوبين', 'error');
          var req = isEdit ? api('PUT', '/api/templates/' + t.id, payload) : api('POST', '/api/templates/', payload);
          req.then(function () { closeModal(); toast(isEdit ? 'تسجل التعديل ✓' : 'تزاد القالب ✓', 'success'); loadTemplates(); })
            .catch(function (e) { toast(e.message, 'error'); });
        };
      });
  }

  // ═══════════ MORE (hub) ═══════════
  function renderMore() {
    var v = $('#main-view');
    var planLabels = { free: 'المجانية', basic: 'الأساسية', pro: 'الاحترافية' };
    v.innerHTML =
      '<div class="page-head"><h1>⚙️ المزيد</h1></div>' +
      '<div class="list-row" style="cursor:pointer" data-go="products"><div class="row"><span style="font-size:1.3rem">🏷️</span><div><div class="bold">المنتجات</div><div class="small mut">كتالوج منتجاتك وأثمنتها</div></div></div><span>‹</span></div>' +
      '<div class="list-row" style="cursor:pointer" data-go="reports"><div class="row"><span style="font-size:1.3rem">📊</span><div><div class="bold">التقارير</div><div class="small mut">أرقام متجرك ومؤشرات الأداء</div></div></div><span>‹</span></div>' +
      '<div class="list-row" style="cursor:pointer" data-go="plan"><div class="row"><span style="font-size:1.3rem">💳</span><div><div class="bold">الاشتراك</div><div class="small mut">باقتك الحالية: ' + (planLabels[(S.store && S.store.plan) || 'free']) + '</div></div></div><span>‹</span></div>' +
      '<div class="list-row" style="cursor:pointer" data-go="settings"><div class="row"><span style="font-size:1.3rem">🛠</span><div><div class="bold">الإعدادات</div><div class="small mut">المتجر، الحساب، البيانات</div></div></div><span>‹</span></div>' +
      '<p class="small mut mt-3" style="text-align:center">تأكد — T2AKED · نسخة تجريبية 1.0</p>';
    $$('[data-go]', v).forEach(function (r) {
      r.addEventListener('click', function () { nav(r.getAttribute('data-go')); });
    });
  }

  // ═══════════ PRODUCTS ═══════════
  function renderProducts() {
    var v = $('#main-view');
    v.innerHTML =
      '<div class="page-head"><div class="row"><button class="btn btn-ghost btn-sm" id="back-btn">→</button><h1>🏷️ المنتجات</h1></div>' +
      '<button class="btn btn-primary btn-sm" id="add-prod">＋ منتج</button></div>' +
      '<p class="small soft mb-2">المنتجات المسجلة هنا كتظهر كاقتراحات ملي كتزيد طلب، والثمن كيتعمر بوحدو.</p>' +
      '<div id="prod-list">' + skeletons(4, 60) + '</div>';
    $('#back-btn').onclick = function () { nav('more'); };
    $('#add-prod').onclick = function () { openProductForm(); };
    loadProducts();
  }
  function loadProducts() {
    api('GET', '/api/products/').then(function (d) {
      var el = $('#prod-list');
      if (!el) return;
      if (!d.products.length) {
        el.innerHTML = emptyState('🏷️', 'ما عندك حتى منتج', 'زيد منتجاتك باش تسرع إضافة الطلبات.',
          '<button class="btn btn-primary" onclick="document.getElementById(\'add-prod\').click()">＋ زيد منتج</button>');
        return;
      }
      el.innerHTML = d.products.map(function (p) {
        return '<div class="list-row">' +
          '<div><div class="bold">' + esc(p.name) + (p.active ? '' : ' <span class="small mut">(موقوف)</span>') + '</div>' +
          '<div class="small mut tabular">' + money(p.price) + (p.sku ? ' · ' + esc(p.sku) : '') + ' · ' + p.orders_count + ' طلب</div></div>' +
          '<div class="row"><button class="btn btn-ghost btn-sm p-edit" data-pid="' + p.id + '">✏️</button>' +
          '<button class="btn btn-danger btn-sm p-del" data-pid="' + p.id + '">🗑</button></div></div>';
      }).join('');
      $$('.p-edit', el).forEach(function (b) {
        b.addEventListener('click', function () {
          openProductForm(d.products.find(function (x) { return x.id === +b.getAttribute('data-pid'); }));
        });
      });
      $$('.p-del', el).forEach(function (b) {
        b.addEventListener('click', function () {
          var pid = +b.getAttribute('data-pid');
          openModal('حذف المنتج', '<p class="mb-2">واش متأكد؟ الطلبات القديمة ما غاديش تتأثر.</p>' +
            '<div class="row"><button class="btn btn-danger grow" id="pd-yes">نعم، احذف</button><button class="btn btn-ghost grow" id="pd-no">رجعني</button></div>',
            function () {
              $('#pd-no').onclick = closeModal;
              $('#pd-yes').onclick = function () {
                api('DELETE', '/api/products/' + pid).then(function () { closeModal(); toast('تحذف المنتج', 'success'); loadProducts(); })
                  .catch(function (e) { toast(e.message, 'error'); });
              };
            });
        });
      });
    }).catch(errView);
  }
  function openProductForm(existing) {
    var isEdit = !!existing;
    var p = existing || {};
    openModal(isEdit ? '✏️ تعديل المنتج' : '＋ منتج جديد',
      '<div class="field"><label>اسم المنتج *</label><input class="input" id="pf-name" value="' + esc(p.name || '') + '" maxlength="200" placeholder="مثال: قفطان مخزني أخضر"></div>' +
      '<div class="row" style="gap:10px">' +
      '<div class="field grow"><label>الثمن (درهم)</label><input class="input tabular" id="pf-price" type="number" min="0" step="0.5" value="' + (p.price || '') + '"></div>' +
      '<div class="field grow"><label>المرجع SKU <span class="mut small">(اختياري)</span></label><input class="input ltr" id="pf-sku" value="' + esc(p.sku || '') + '" maxlength="50"></div></div>' +
      (isEdit ? '<div class="field"><label class="row" style="cursor:pointer"><input type="checkbox" class="checkbox-lg" id="pf-active" ' + (p.active ? 'checked' : '') + '> <span>المنتج نشيط (كيظهر فالاقتراحات)</span></label></div>' : '') +
      '<button class="btn btn-primary btn-block" id="pf-save">' + (isEdit ? 'سجل ✓' : 'زيد المنتج ✓') + '</button>',
      function () {
        $('#pf-save').onclick = function () {
          var payload = { name: $('#pf-name').value.trim(), price: parseFloat($('#pf-price').value) || 0, sku: $('#pf-sku').value.trim(), active: isEdit ? $('#pf-active').checked : true };
          if (!payload.name) return toast('اسم المنتج مطلوب', 'error');
          var req = isEdit ? api('PUT', '/api/products/' + p.id, payload) : api('POST', '/api/products/', payload);
          req.then(function () { closeModal(); toast(isEdit ? 'تسجل ✓' : 'تزاد المنتج ✓', 'success'); loadProducts(); })
            .catch(function (e) { toast(e.message, 'error'); });
        };
      });
  }

  // ═══════════ REPORTS ═══════════
  function renderReports() {
    var v = $('#main-view');
    v.innerHTML =
      '<div class="page-head"><div class="row"><button class="btn btn-ghost btn-sm" id="back-btn">→</button><h1>📊 التقارير</h1></div>' +
      '<select class="select" id="rep-days" style="max-width:140px;min-height:40px;padding:6px 10px">' +
      '<option value="7">آخر 7 أيام</option><option value="30" selected>آخر 30 يوم</option><option value="90">آخر 90 يوم</option></select></div>' +
      '<div id="rep-body">' + skeletons(4, 110) + '</div>';
    $('#back-btn').onclick = function () { nav('more'); };
    $('#rep-days').addEventListener('change', function () { loadReports(+this.value); });
    loadReports(30);
  }
  function loadReports(days) {
    S.charts.forEach(function (ch) { try { ch.destroy(); } catch (e) {} });
    S.charts = [];
    api('GET', '/api/reports/stats?days=' + days).then(function (d) {
      var el = $('#rep-body');
      if (!el) return;
      var t = d.totals;
      el.innerHTML =
        '<p class="small mut mb-2">حسب بيانات متجرك فآخر ' + d.days + ' يوم — النتائج كتختلف من متجر لآخر.</p>' +
        '<div class="kpis">' +
        '<div class="kpi"><div class="kv tabular">' + (t.total || 0) + '</div><div class="kl">إجمالي الطلبات</div></div>' +
        '<div class="kpi"><div class="kv tabular">' + t.confirmation_rate + '٪</div><div class="kl">مؤشر التأكيد</div></div>' +
        '<div class="kpi"><div class="kv tabular">' + (t.delivered || 0) + '</div><div class="kl">طلب توصّل</div></div>' +
        '<div class="kpi"><div class="kv tabular">' + Math.round(t.avg_amount || 0) + '</div><div class="kl">متوسط قيمة الطلب (درهم)</div></div>' +
        '</div>' +
        '<div class="kpis" style="grid-template-columns:repeat(3,1fr)">' +
        '<div class="kpi"><div class="kv tabular" style="color:var(--st-cancelled)">' + (t.cancelled || 0) + '</div><div class="kl">ملغى</div></div>' +
        '<div class="kpi"><div class="kv tabular" style="color:var(--st-no_answer)">' + (t.no_answer || 0) + '</div><div class="kl">لم يرد</div></div>' +
        '<div class="kpi"><div class="kv tabular" style="color:var(--st-returned)">' + (t.returned || 0) + '</div><div class="kl">مرتجع</div></div>' +
        '</div>' +
        '<div class="chart-card"><h3>📈 الطلبات باليوم</h3><div class="chart-box"><canvas id="ch-days"></canvas></div></div>' +
        '<div class="chart-card"><h3>🏙 أكثر المدن طلباً</h3><div class="chart-box"><canvas id="ch-city"></canvas></div></div>' +
        '<div class="chart-card"><h3>🏷️ أكثر المنتجات طلباً</h3>' +
        (d.by_product.length ? d.by_product.map(function (p) {
          return '<div class="row-between" style="padding:7px 0;border-bottom:1px solid var(--line)">' +
            '<span class="small">' + esc(p.product_name) + '</span>' +
            '<span class="small bold tabular">' + p.n + ' طلب · ' + money(p.amount) + '</span></div>';
        }).join('') : '<p class="small mut">ما كاين بيانات بعد.</p>') +
        '</div>';

      if (typeof Chart === 'undefined') return;
      Chart.defaults.font.family = 'IBM Plex Sans Arabic';
      if (d.by_day.length) {
        S.charts.push(new Chart($('#ch-days'), {
          type: 'line',
          data: {
            labels: d.by_day.map(function (r) { return r.day.slice(5); }),
            datasets: [
              { label: 'الطلبات', data: d.by_day.map(function (r) { return r.n; }), borderColor: '#0D7A6C', backgroundColor: 'rgba(13,122,108,0.1)', fill: true, tension: 0.35 },
              { label: 'المؤكدة', data: d.by_day.map(function (r) { return r.confirmed; }), borderColor: '#E8A317', backgroundColor: 'transparent', tension: 0.35 }
            ]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { rtl: true, position: 'bottom' } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
        }));
      }
      if (d.by_city.length) {
        S.charts.push(new Chart($('#ch-city'), {
          type: 'bar',
          data: {
            labels: d.by_city.map(function (r) { return r.city; }),
            datasets: [{ label: 'طلبات', data: d.by_city.map(function (r) { return r.n; }), backgroundColor: '#0D7A6C', borderRadius: 8 }]
          },
          options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } } }
        }));
      }
    }).catch(errView);
  }

  // ═══════════ PLAN ═══════════
  function renderPlan() {
    var v = $('#main-view');
    var current = (S.store && S.store.plan) || 'free';
    var plans = [
      { id: 'free', name: 'المجانية', price: '0', desc: 'حتى 30 طلب فالشهر · اللوحة الأساسية · الرسائل الجاهزة' },
      { id: 'basic', name: 'الأساسية', price: '99', desc: 'حتى 500 طلب · المتابعات · التقارير · استيراد CSV · مؤشرات المراجعة' },
      { id: 'pro', name: 'الاحترافية', price: '249', desc: 'طلبات غير محدودة · مستخدمون متعددون (قريباً) · تقارير متقدمة · أولوية الدعم' }
    ];
    v.innerHTML =
      '<div class="page-head"><div class="row"><button class="btn btn-ghost btn-sm" id="back-btn">→</button><h1>💳 الاشتراك</h1></div></div>' +
      '<div class="card card-pad mb-2" style="background:var(--amber-100);border-color:var(--amber-500)">' +
      '<p class="small" style="color:var(--amber-600);font-weight:600">⚠️ وضع تجريبي: الدفع الإلكتروني الفعلي غادي يتفعّل مع مزود الدفع (CMI أو مشابه). تبديل الباقة حالياً مجاني وللتجربة.</p></div>' +
      plans.map(function (p) {
        var isCur = p.id === current;
        return '<div class="card card-pad mb-2"' + (isCur ? ' style="border-color:var(--teal-600);border-width:2px"' : '') + '>' +
          '<div class="row-between"><div><h3 style="color:var(--teal-800)">' + p.name + (isCur ? ' <span class="st st-confirmed">باقتك الحالية</span>' : '') + '</h3>' +
          '<div class="kv tabular" style="font-size:1.4rem;color:var(--teal-900)">' + p.price + ' <span class="small mut">درهم/شهر</span></div></div>' +
          (!isCur ? '<button class="btn btn-primary btn-sm plan-pick" data-plan="' + p.id + '">اختار</button>' : '') + '</div>' +
          '<p class="small soft mt-1">' + p.desc + '</p></div>';
      }).join('');
    $('#back-btn').onclick = function () { nav('more'); };
    $$('.plan-pick', v).forEach(function (b) {
      b.addEventListener('click', function () {
        api('POST', '/api/store/plan', { plan: b.getAttribute('data-plan') }).then(function (r) {
          S.store.plan = r.plan;
          toast(r.message, 'success');
          renderPlan();
        }).catch(function (e) { toast(e.message, 'error'); });
      });
    });
  }

  // ═══════════ SETTINGS ═══════════
  function renderSettings() {
    var v = $('#main-view');
    var s = S.store || {};
    var u = S.user || {};
    v.innerHTML =
      '<div class="page-head"><div class="row"><button class="btn btn-ghost btn-sm" id="back-btn">→</button><h1>🛠 الإعدادات</h1></div></div>' +

      '<div class="card card-pad mb-2"><h3 style="color:var(--teal-800);font-size:1rem" class="mb-2">🏪 المتجر</h3>' +
      '<div class="field"><label>اسم المتجر</label><input class="input" id="st-name" value="' + esc(s.name || '') + '" maxlength="100"></div>' +
      '<div class="row" style="gap:10px">' +
      '<div class="field grow"><label>المدينة</label><input class="input" id="st-city" value="' + esc(s.city || '') + '" maxlength="100"></div>' +
      '<div class="field grow"><label>هاتف المتجر</label><input class="input ltr" id="st-phone" value="' + esc(s.phone || '') + '"></div></div>' +
      '<div class="field"><label>نوع النشاط</label><select class="select" id="st-cat">' +
      '<option value="">اختار…</option><option value="clothing">ملابس وعبايات</option><option value="beauty">عطور وتجميل</option>' +
      '<option value="food">حلويات وأكل</option><option value="gifts">هدايا وإكسسوارات</option><option value="other">شي حاجة أخرى</option></select></div>' +
      '<button class="btn btn-primary" id="st-save">سجل إعدادات المتجر ✓</button></div>' +

      '<div class="card card-pad mb-2"><h3 style="color:var(--teal-800);font-size:1rem" class="mb-2">👤 الحساب</h3>' +
      '<div class="field"><label>الاسم</label><input class="input" id="ac-name" value="' + esc(u.name || '') + '" maxlength="100"></div>' +
      '<div class="field"><label>الهاتف</label><input class="input ltr" id="ac-phone" value="' + esc(u.phone || '') + '"></div>' +
      '<div class="field"><label>البريد</label><input class="input ltr" value="' + esc(u.email || '') + '" disabled></div>' +
      '<button class="btn btn-primary" id="ac-save">سجل ✓</button></div>' +

      '<div class="card card-pad mb-2"><h3 style="color:var(--teal-800);font-size:1rem" class="mb-2">🔒 كلمة السر</h3>' +
      '<div class="field"><label>كلمة السر الحالية</label><input class="input ltr" type="password" id="pw-cur" autocomplete="current-password"></div>' +
      '<div class="field"><label>كلمة السر الجديدة</label><input class="input ltr" type="password" id="pw-new" autocomplete="new-password" minlength="8"></div>' +
      '<button class="btn btn-primary" id="pw-save">بدّل كلمة السر</button></div>' +

      '<div class="card card-pad mb-2"><h3 style="color:var(--teal-800);font-size:1rem" class="mb-2">📦 بياناتك</h3>' +
      '<p class="small soft mb-2">بياناتك ملكك. تقدر تنزلها كاملة أو تصدّر الطلبات CSV.</p>' +
      '<div class="row wrap">' +
      '<a class="btn btn-ghost btn-sm" href="/api/auth/export">⬇ تنزيل كل البيانات (JSON)</a>' +
      '<a class="btn btn-ghost btn-sm" href="/api/orders/export.csv">⬇ تصدير الطلبات (CSV)</a></div></div>' +

      '<div class="card card-pad mb-3" style="border-color:var(--danger)"><h3 style="color:var(--danger);font-size:1rem" class="mb-1">⚠️ منطقة الخطر</h3>' +
      '<p class="small soft mb-2">حذف الحساب كيمسح المتجر والطلبات والعملاء والقوالب نهائياً — ما كاينش رجوع.</p>' +
      '<button class="btn btn-danger btn-sm" id="del-account">حذف الحساب نهائياً</button></div>';

    if (s.category) $('#st-cat').value = s.category;
    $('#back-btn').onclick = function () { nav('more'); };
    $('#st-save').onclick = function () {
      api('PUT', '/api/store/', { name: $('#st-name').value.trim(), city: $('#st-city').value.trim(), phone: $('#st-phone').value.trim(), category: $('#st-cat').value })
        .then(function () {
          toast('تسجلات إعدادات المتجر ✓', 'success');
          return api('GET', '/api/auth/me');
        })
        .then(function (me) { S.store = me.store; $('#store-chip').textContent = S.store.name; })
        .catch(function (e) { toast(e.message, 'error'); });
    };
    $('#ac-save').onclick = function () {
      api('PUT', '/api/auth/account', { name: $('#ac-name').value.trim(), phone: $('#ac-phone').value.trim() })
        .then(function () { toast('تسجل ✓', 'success'); S.user.name = $('#ac-name').value.trim(); })
        .catch(function (e) { toast(e.message, 'error'); });
    };
    $('#pw-save').onclick = function () {
      var cur = $('#pw-cur').value, nw = $('#pw-new').value;
      if (nw.length < 8) return toast('كلمة السر الجديدة خاصها 8 حروف على الأقل', 'error');
      api('PUT', '/api/auth/password', { current: cur, next: nw })
        .then(function () { toast('تبدلات كلمة السر ✓', 'success'); $('#pw-cur').value = ''; $('#pw-new').value = ''; })
        .catch(function (e) { toast(e.message, 'error'); });
    };
    $('#del-account').onclick = function () {
      openModal('⚠️ حذف الحساب نهائياً',
        '<p class="mb-2">غادي يتمسح <strong>كلشي</strong>: المتجر، الطلبات، العملاء، القوالب. هاد العملية نهائية.</p>' +
        '<div class="field"><label>دخل كلمة السر ديالك للتأكيد</label><input class="input ltr" type="password" id="da-pw"></div>' +
        '<button class="btn btn-danger btn-block" id="da-go">فهمت، احذف كلشي نهائياً</button>',
        function () {
          $('#da-go').onclick = function () {
            var pw = $('#da-pw').value;
            if (!pw) return toast('دخل كلمة السر', 'error');
            api('DELETE', '/api/auth/account', { password: pw })
              .then(function () { window.location.href = '/'; })
              .catch(function (e) { toast(e.message, 'error'); });
          };
        });
    };
  }

})();
