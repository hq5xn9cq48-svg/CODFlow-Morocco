import { Hono } from 'hono'
import { requireAuth, type Bindings } from '../lib/auth'
import { cleanString, cleanInt, TEMPLATE_SLUGS } from '../lib/validate'

const templates = new Hono<{ Bindings: Bindings; Variables: { user: any; store: any } }>({ strict: false })
templates.use('*', requireAuth())

function noStore(c: any) { return c.json({ error: 'no_store', message: 'خاصك تكمل إعداد المتجر أولاً' }, 400) }

templates.get('/', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const rows = await c.env.DB.prepare('SELECT * FROM message_templates WHERE store_id = ? ORDER BY created_at ASC').bind(store.id).all()
  return c.json({ templates: rows.results })
})

/** Render a template against a specific order (server-side fill of variables) */
templates.get('/render/:templateId/:orderId', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const tid = cleanInt(c.req.param('templateId'), 1)
  const oid = cleanInt(c.req.param('orderId'), 1)
  const tpl = await c.env.DB.prepare('SELECT * FROM message_templates WHERE id = ? AND store_id = ?').bind(tid, store.id).first<any>()
  if (!tpl) return c.json({ error: 'not_found', message: 'القالب غير موجود' }, 404)
  const order = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ? AND store_id = ?').bind(oid, store.id).first<any>()
  if (!order) return c.json({ error: 'not_found', message: 'الطلب غير موجود' }, 404)
  const vars: Record<string, string> = {
    customer_name: order.customer_name || '',
    order_number: order.order_number || '',
    product_name: order.product_name || '',
    total_amount: String(order.total_amount ?? ''),
    city: order.city || '',
    store_name: store.name || ''
  }
  const text = tpl.body.replace(/\{\{(\w+)\}\}/g, (_: string, k: string) => vars[k] ?? `{{${k}}}`)
  return c.json({ text, title: tpl.title })
})

templates.post('/', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const body = await c.req.json().catch(() => ({}))
  const title = cleanString(body.title, 100)
  const text = cleanString(body.body, 1000)
  if (!title || !text) return c.json({ error: 'invalid', message: 'العنوان ونص الرسالة مطلوبين' }, 400)
  const slug = (TEMPLATE_SLUGS as readonly string[]).includes(body.slug) ? body.slug : 'custom'
  const lang = ['darija', 'ar', 'fr'].includes(body.lang) ? body.lang : 'darija'
  const tone = ['friendly', 'formal'].includes(body.tone) ? body.tone : 'friendly'
  const res = await c.env.DB.prepare('INSERT INTO message_templates (store_id, slug, title, body, lang, tone) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(store.id, slug, title, text, lang, tone).run()
  return c.json({ ok: true, id: res.meta.last_row_id })
})

templates.put('/:id', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const id = cleanInt(c.req.param('id'), 1)
  const body = await c.req.json().catch(() => ({}))
  const title = cleanString(body.title, 100)
  const text = cleanString(body.body, 1000)
  if (!title || !text) return c.json({ error: 'invalid', message: 'العنوان ونص الرسالة مطلوبين' }, 400)
  const lang = ['darija', 'ar', 'fr'].includes(body.lang) ? body.lang : 'darija'
  const tone = ['friendly', 'formal'].includes(body.tone) ? body.tone : 'friendly'
  const res = await c.env.DB.prepare('UPDATE message_templates SET title = ?, body = ?, lang = ?, tone = ? WHERE id = ? AND store_id = ?')
    .bind(title, text, lang, tone, id, store.id).run()
  if (!res.meta.changes) return c.json({ error: 'not_found', message: 'القالب غير موجود' }, 404)
  return c.json({ ok: true })
})

templates.delete('/:id', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const id = cleanInt(c.req.param('id'), 1)
  const res = await c.env.DB.prepare('DELETE FROM message_templates WHERE id = ? AND store_id = ?').bind(id, store.id).run()
  if (!res.meta.changes) return c.json({ error: 'not_found', message: 'القالب غير موجود' }, 404)
  return c.json({ ok: true })
})

export default templates
