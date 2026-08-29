# تأكد — T2AKED

## Project Overview
- **Name**: تأكد (T2AKED)
- **Goal**: منصة SaaS للتجار المغاربة الذين يبيعون بالدفع عند الاستلام (COD) — تنظيم الطلبات، تأكيدها قبل الشحن، تقليل المرتجعات، من أول مساج حتى التسليم.
- **Creative direction**: «المسار» (The Path) — الهوية مبنية على مسار الطلب من المحادثة إلى التسليم. الرمز: فقاعة محادثة بداخلها علامة تأكيد ✓.

## URLs
- **Sandbox (dev)**: https://3000-ihwiriv3bc44xjje7fyy7-2e1b9533.sandbox.novita.ai
- **Production**: لم يتم النشر بعد (جاهز للنشر على Cloudflare Pages)
- **Demo account**: `demo@t2aked.ma` / `demo1234` (بيانات وهمية للعرض)

## Currently Completed Features
### الصفحة التسويقية `/`
- Hero بالدارجة + **Demo تفاعلي** لمسار الطلب (5 مراحل مع رسائل جاهزة لكل مرحلة)
- أقسام: المشكلة، المميزات، طريقة العمل (3 خطوات)، الأسعار (درهم)، FAQ، CTA
- SEO: meta, OG, sitemap.xml, robots.txt · Reveal-on-scroll يحترم prefers-reduced-motion

### المصادقة `/login` `/register` `/forgot`
- تسجيل/دخول/خروج، PBKDF2 (WebCrypto) + جلسات server-side مُهَشَّة (SHA-256) قابلة للإلغاء
- Rate limiting عبر D1، منع user enumeration في استعادة كلمة السر
- Onboarding: إنشاء متجر + قوالب رسائل دارجة افتراضية تلقائياً

### التطبيق `/app` (SPA, mobile-first, RTL)
- **اليوم**: KPIs + لائحة "شنو خاصك دير دابا" مرتبة بالأولوية
- **الطلبات**: بحث/تصفية بالحالة/ترتيب/pagination، إجراءات جماعية، تصدير/استيراد CSV (UTF-8 BOM)
- **تفاصيل الطلب**: مسار بصري، اقتراح الخطوة التالية، مؤشرات مراجعة (عنوان ناقص/رقم مكرر/محاولات كثيرة/تاريخ إلغاءات)، سجل زمني كامل، محاولات اتصال، ملاحظات، مواعيد متابعة
- **الرسائل الجاهزة**: CRUD + متغيرات `{{customer_name}}` إلخ + معاينة + **نسخ للواتساب** (لا API غير رسمي — قرار مقصود)
- **العملاء**: تجميع تلقائي بالهاتف + تاريخ الطلبات + مؤشر إلغاءات
- **المنتجات**: كتالوج + تعبئة تلقائية للثمن عند إضافة طلب
- **التقارير**: Chart.js — طلبات/يوم، مدن، منتجات، نسبة تأكيد (بصياغة "حسب بيانات متجرك")
- **الاشتراك**: 3 باقات بالدرهم — وضع تجريبي واضح
- **الإعدادات**: متجر/حساب/كلمة سر/تصدير البيانات JSON+CSV/حذف الحساب نهائياً (بتأكيد كلمة السر)

### الأمان
- عزل كامل بين المتاجر (كل استعلام مقيد بـ store_id — مُختبَر: مستخدم آخر يحصل على 404)
- تحقق من جميع المدخلات server-side + escaping كامل client-side ضد XSS
- Prepared statements ضد SQL Injection · Security headers · تأكيد قبل كل حذف · سجل أحداث (order_events)

## Data Architecture
- **Storage**: Cloudflare D1 (SQLite) — local عبر `--local`
- **Models**: users, sessions, stores, customers, products, orders, order_events, message_templates, rate_limits
- **Order statuses**: new → to_confirm → confirmed → preparing → shipped → delivered (+ no_answer, cancelled, returned)
- **Tenancy**: single-owner-per-store, all rows scoped by store_id with FK CASCADE

## API Endpoints
- `POST /api/auth/{register,login,logout,forgot,onboarding}` · `GET /api/auth/me` · `PUT /api/auth/{account,password}` · `GET /api/auth/export` · `DELETE /api/auth/account`
- `GET|POST /api/orders/` · `GET /api/orders/export.csv` · `POST /api/orders/{import,bulk}` · `GET|PUT|DELETE /api/orders/:id` · `POST /api/orders/:id/{status,call,note}`
- `GET /api/customers/` · `GET|PUT|DELETE /api/customers/:id`
- `GET|POST /api/products/` · `PUT|DELETE /api/products/:id`
- `GET|POST /api/templates/` · `GET /api/templates/render/:tid/:oid` · `PUT|DELETE /api/templates/:id`
- `GET /api/reports/{today,stats}` · `GET|PUT /api/store/` · `POST /api/store/plan`

## What Is Real vs. Prototype
| حقيقي وعامل | تجريبي / يحتاج إعداد خارجي |
|---|---|
| المصادقة والجلسات وعزل البيانات | إرسال بريد استعادة كلمة السر (يحتاج Resend/SendGrid API key) |
| كل عمليات الطلبات/العملاء/المنتجات/القوالب | الدفع الفعلي للباقات (يحتاج CMI/مزود دفع مغربي) |
| CSV import/export، التقارير | WhatsApp Business API الرسمي (مستقبلاً) |
| PWA manifest | حدود الطلبات حسب الباقة (غير مفروضة بعد — قرار منتج) |

## User Guide
1. سجل حساب (أو ادخل بحساب demo) → 2. سمّي متجرك → 3. اضغط ＋ وزد أول طلب → 4. من تفاصيل الطلب: انسخ رسالة التأكيد وصيفطها للعميل → 5. بدّل الحالة مع تقدم الطلب → 6. راقب لائحة «اليوم» كل صباح.

## Development
```bash
npm run build                  # vite build
pm2 start ecosystem.config.cjs # dev server on :3000 (wrangler pages dev + D1 local)
npm run db:migrate:local       # apply migrations
npm run db:seed                # demo data
```

## Deployment
- **Platform**: Cloudflare Pages (جاهز — يحتاج فقط إنشاء D1 production وتشغيل `wrangler pages deploy`)
- **Status**: ✅ يعمل في بيئة التطوير
- **Tech Stack**: Hono + TypeScript + Cloudflare D1 + Vanilla JS SPA + Chart.js + IBM Plex Sans Arabic
- **Last Updated**: 2026-08-29
