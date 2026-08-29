import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import {
  hashPassword, verifyPassword, createSession, destroySession,
  setSessionCookie, clearSessionCookie, requireAuth, rateLimit,
  type Bindings
} from '../lib/auth'
import { cleanString, cleanPhone, isValidEmail } from '../lib/validate'

const auth = new Hono<{ Bindings: Bindings; Variables: { user: any; store: any } }>({ strict: false })

// ── Register ──
auth.post('/register', async (c) => {
  const ip = c.req.header('cf-connecting-ip') || 'local'
  if (!(await rateLimit(c.env.DB, `reg:${ip}`, 10, 3600))) {
    return c.json({ error: 'rate_limited', message: 'محاولات كثيرة، حاول من بعد شوية' }, 429)
  }
  const body = await c.req.json().catch(() => ({}))
  const name = cleanString(body.name, 100)
  const email = cleanString(body.email, 200).toLowerCase()
  const phone = cleanPhone(body.phone)
  const password = String(body.password || '')

  if (!name || name.length < 2) return c.json({ error: 'invalid', field: 'name', message: 'دخل الاسم الكامل ديالك' }, 400)
  if (!isValidEmail(email)) return c.json({ error: 'invalid', field: 'email', message: 'البريد الإلكتروني غير صحيح' }, 400)
  if (password.length < 8) return c.json({ error: 'invalid', field: 'password', message: 'كلمة السر خاصها تكون 8 حروف على الأقل' }, 400)

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (existing) return c.json({ error: 'exists', field: 'email', message: 'هذا البريد مسجل من قبل — جرب تسجيل الدخول' }, 409)

  const hash = await hashPassword(password)
  const res = await c.env.DB.prepare('INSERT INTO users (email, phone, name, password_hash) VALUES (?, ?, ?, ?)')
    .bind(email, phone || null, name, hash).run()
  const userId = res.meta.last_row_id as number
  const token = await createSession(c.env.DB, userId, c.req.header('user-agent'))
  setSessionCookie(c, token)
  return c.json({ ok: true, onboarded: false })
})

// ── Login ──
auth.post('/login', async (c) => {
  const ip = c.req.header('cf-connecting-ip') || 'local'
  if (!(await rateLimit(c.env.DB, `login:${ip}`, 20, 900))) {
    return c.json({ error: 'rate_limited', message: 'محاولات كثيرة، حاول من بعد 15 دقيقة' }, 429)
  }
  const body = await c.req.json().catch(() => ({}))
  const email = cleanString(body.email, 200).toLowerCase()
  const password = String(body.password || '')
  const user = await c.env.DB.prepare('SELECT id, password_hash, onboarded FROM users WHERE email = ?').bind(email).first<any>()
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return c.json({ error: 'invalid_credentials', message: 'البريد أو كلمة السر غير صحيحة' }, 401)
  }
  const token = await createSession(c.env.DB, user.id, c.req.header('user-agent'))
  setSessionCookie(c, token)
  return c.json({ ok: true, onboarded: !!user.onboarded })
})

// ── Logout ──
auth.post('/logout', async (c) => {
  const token = getCookie(c, 't2aked_session')
  if (token) await destroySession(c.env.DB, token)
  clearSessionCookie(c)
  return c.json({ ok: true })
})

// ── Password reset (prototype: requires email service to send real link) ──
auth.post('/forgot', async (c) => {
  const ip = c.req.header('cf-connecting-ip') || 'local'
  if (!(await rateLimit(c.env.DB, `forgot:${ip}`, 5, 3600))) {
    return c.json({ error: 'rate_limited', message: 'محاولات كثيرة، حاول لاحقاً' }, 429)
  }
  const body = await c.req.json().catch(() => ({}))
  const email = cleanString(body.email, 200).toLowerCase()
  // Always return the same response (no user enumeration).
  // NOTE: sending the actual email requires an email provider API key (Resend/SendGrid).
  return c.json({ ok: true, message: 'إلا كان هذا البريد مسجل عندنا، غادي يوصلك رابط استعادة كلمة السر.' })
})

// ── Current user ──
auth.get('/me', requireAuth(), async (c) => {
  const user = c.get('user')
  const store = c.get('store')
  return c.json({ user, store })
})

// ── Onboarding: create store ──
auth.post('/onboarding', requireAuth(), async (c) => {
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))
  const name = cleanString(body.store_name, 100)
  const category = cleanString(body.category, 50)
  const city = cleanString(body.city, 100)
  if (!name || name.length < 2) return c.json({ error: 'invalid', field: 'store_name', message: 'دخل اسم المتجر ديالك' }, 400)

  const existing = await c.env.DB.prepare('SELECT id FROM stores WHERE owner_id = ?').bind(user.id).first()
  if (existing) {
    await c.env.DB.prepare('UPDATE stores SET name = ?, category = ?, city = ? WHERE owner_id = ?')
      .bind(name, category || null, city || null, user.id).run()
  } else {
    const res = await c.env.DB.prepare('INSERT INTO stores (owner_id, name, category, city) VALUES (?, ?, ?, ?)')
      .bind(user.id, name, category || null, city || null).run()
    const storeId = res.meta.last_row_id as number
    // Default darija message templates for the new store
    const defaults: [string, string, string][] = [
      ['confirm', 'تأكيد الطلب', 'سلام {{customer_name}} 👋 معاك {{store_name}}. توصلنا بالطلب ديالك: {{product_name}} بثمن {{total_amount}} درهم. واش نأكدو الطلب باش نصيفطوه ليك؟'],
      ['ask_address', 'طلب العنوان', 'سلام {{customer_name}}، باش نصيفطو ليك الطلب {{order_number}} محتاجين العنوان الكامل ديالك ف{{city}} (الحي، الزنقة، رقم الدار). شكراً 🙏'],
      ['reminder', 'تذكير', 'سلام {{customer_name}}، غير كنفكروك بالطلب ديالك {{product_name}}. واش مازال باغيه؟ إلا كان شي سؤال راه حنا هنا 😊'],
      ['no_answer', 'بعد عدم الرد', 'سلام {{customer_name}}، حاولنا نتصلو بيك باش نأكدو الطلب {{order_number}} ولكن ما قدرناش نوصلو ليك. عافاك جاوبنا هنا أو عيط لينا فاش يكون ممكن.'],
      ['shipped', 'تأكيد الشحن', 'خبار زوينة {{customer_name}} 🎉 الطلب ديالك {{order_number}} تصيفط اليوم وغادي يوصلك قريباً ف{{city}}. الخلاص عند الاستلام: {{total_amount}} درهم.'],
      ['delivered', 'تأكيد التسليم', 'سلام {{customer_name}}، تنشكروك على الثقة ف{{store_name}} 🌟 نتمناو يعجبك {{product_name}}. مرحبا بيك ديما!'],
      ['review', 'طلب تقييم', 'سلام {{customer_name}} 😊 إلا عجبك {{product_name}}، غادي نفرحو بزاف إلا شاركتي رأيك أو صورة. هادشي كيعاوننا بزاف. شكراً!'],
      ['cancelled', 'إلغاء', 'سلام {{customer_name}}، تسجل إلغاء الطلب {{order_number}} بلا مشكل. مرحبا بيك فأي وقت.']
    ]
    for (const [slug, title, bodyTxt] of defaults) {
      await c.env.DB.prepare('INSERT INTO message_templates (store_id, slug, title, body, lang, tone) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(storeId, slug, title, bodyTxt, 'darija', 'friendly').run()
    }
  }
  await c.env.DB.prepare('UPDATE users SET onboarded = 1 WHERE id = ?').bind(user.id).run()
  return c.json({ ok: true })
})

// ── Account settings ──
auth.put('/account', requireAuth(), async (c) => {
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))
  const name = cleanString(body.name, 100)
  const phone = cleanPhone(body.phone)
  if (!name) return c.json({ error: 'invalid', message: 'الاسم مطلوب' }, 400)
  await c.env.DB.prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?').bind(name, phone || null, user.id).run()
  return c.json({ ok: true })
})

auth.put('/password', requireAuth(), async (c) => {
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))
  const current = String(body.current || '')
  const next = String(body.next || '')
  if (next.length < 8) return c.json({ error: 'invalid', message: 'كلمة السر الجديدة خاصها 8 حروف على الأقل' }, 400)
  const row = await c.env.DB.prepare('SELECT password_hash FROM users WHERE id = ?').bind(user.id).first<any>()
  if (!row || !(await verifyPassword(current, row.password_hash))) {
    return c.json({ error: 'invalid', message: 'كلمة السر الحالية غير صحيحة' }, 401)
  }
  const hash = await hashPassword(next)
  await c.env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(hash, user.id).run()
  return c.json({ ok: true })
})

// ── Export all user data (GDPR-style) ──
auth.get('/export', requireAuth(), async (c) => {
  const user = c.get('user')
  const store = c.get('store')
  const data: any = { user, store, exported_at: new Date().toISOString() }
  if (store) {
    const sid = store.id
    data.orders = (await c.env.DB.prepare('SELECT * FROM orders WHERE store_id = ?').bind(sid).all()).results
    data.customers = (await c.env.DB.prepare('SELECT * FROM customers WHERE store_id = ?').bind(sid).all()).results
    data.products = (await c.env.DB.prepare('SELECT * FROM products WHERE store_id = ?').bind(sid).all()).results
    data.templates = (await c.env.DB.prepare('SELECT * FROM message_templates WHERE store_id = ?').bind(sid).all()).results
  }
  c.header('Content-Disposition', 'attachment; filename="t2aked-data-export.json"')
  return c.json(data)
})

// ── Delete account + all data ──
auth.delete('/account', requireAuth(), async (c) => {
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))
  const row = await c.env.DB.prepare('SELECT password_hash FROM users WHERE id = ?').bind(user.id).first<any>()
  if (!row || !(await verifyPassword(String(body.password || ''), row.password_hash))) {
    return c.json({ error: 'invalid', message: 'كلمة السر غير صحيحة — التأكيد ضروري قبل الحذف' }, 401)
  }
  // Cascading deletes handle store/orders/customers via FK ON DELETE CASCADE
  await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(user.id).run()
  clearSessionCookie(c)
  return c.json({ ok: true, message: 'تحذف الحساب وجميع البيانات نهائياً' })
})

export default auth
