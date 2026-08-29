import { Hono } from 'hono'
import { requireAuth, type Bindings } from '../lib/auth'
import { cleanString, cleanPhone } from '../lib/validate'

const store = new Hono<{ Bindings: Bindings; Variables: { user: any; store: any } }>({ strict: false })
store.use('*', requireAuth())

store.get('/', async (c) => {
  const s = c.get('store')
  if (!s) return c.json({ error: 'no_store', message: 'ما عندكش متجر بعد' }, 404)
  return c.json({ store: s })
})

store.put('/', async (c) => {
  const s = c.get('store')
  if (!s) return c.json({ error: 'no_store', message: 'ما عندكش متجر بعد' }, 404)
  const body = await c.req.json().catch(() => ({}))
  const name = cleanString(body.name, 100)
  if (!name) return c.json({ error: 'invalid', message: 'اسم المتجر مطلوب' }, 400)
  await c.env.DB.prepare('UPDATE stores SET name = ?, category = ?, city = ?, phone = ? WHERE id = ?')
    .bind(name, cleanString(body.category, 50) || null, cleanString(body.city, 100) || null, cleanPhone(body.phone) || null, s.id).run()
  return c.json({ ok: true })
})

/** Change subscription plan — trial/demo billing only (no real payment provider connected) */
store.post('/plan', async (c) => {
  const s = c.get('store')
  if (!s) return c.json({ error: 'no_store', message: 'ما عندكش متجر بعد' }, 404)
  const body = await c.req.json().catch(() => ({}))
  const plan = ['free', 'basic', 'pro'].includes(body.plan) ? body.plan : null
  if (!plan) return c.json({ error: 'invalid', message: 'باقة غير معروفة' }, 400)
  await c.env.DB.prepare(`UPDATE stores SET plan = ?, plan_started_at = datetime('now') WHERE id = ?`).bind(plan, s.id).run()
  return c.json({
    ok: true, plan,
    message: plan === 'free' ? 'رجعتي للباقة المجانية' : 'تفعّلات الباقة بنجاح (وضع تجريبي — الدفع الفعلي غادي يتفعّل مع مزود الدفع)'
  })
})

export default store
