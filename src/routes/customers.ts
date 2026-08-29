import { Hono } from 'hono'
import { requireAuth, type Bindings } from '../lib/auth'
import { cleanString, cleanPhone, cleanInt } from '../lib/validate'

const customers = new Hono<{ Bindings: Bindings; Variables: { user: any; store: any } }>({ strict: false })
customers.use('*', requireAuth())

function noStore(c: any) { return c.json({ error: 'no_store', message: 'خاصك تكمل إعداد المتجر أولاً' }, 400) }

customers.get('/', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const q = c.req.query()
  const conditions = ['c.store_id = ?']
  const params: any[] = [store.id]
  if (q.search) {
    const s = `%${cleanString(q.search, 100)}%`
    conditions.push('(c.name LIKE ? OR c.phone LIKE ? OR c.city LIKE ?)')
    params.push(s, s, s)
  }
  const page = Math.max(1, cleanInt(q.page || 1, 1, 10000))
  const perPage = 25
  const where = conditions.join(' AND ')
  const total = await c.env.DB.prepare(`SELECT COUNT(*) as n FROM customers c WHERE ${where}`).bind(...params).first<any>()
  const rows = await c.env.DB.prepare(
    `SELECT c.*, 
      (SELECT COUNT(*) FROM orders o WHERE o.store_id = c.store_id AND o.customer_phone = c.phone) as orders_count,
      (SELECT COALESCE(SUM(o.total_amount),0) FROM orders o WHERE o.store_id = c.store_id AND o.customer_phone = c.phone AND o.status = 'delivered') as delivered_total,
      (SELECT COUNT(*) FROM orders o WHERE o.store_id = c.store_id AND o.customer_phone = c.phone AND o.status IN ('cancelled','returned','no_answer')) as risk_count
     FROM customers c WHERE ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`
  ).bind(...params, perPage, (page - 1) * perPage).all()
  return c.json({ customers: rows.results, total: total?.n || 0, page, per_page: perPage })
})

customers.get('/:id', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const id = cleanInt(c.req.param('id'), 1)
  const customer = await c.env.DB.prepare('SELECT * FROM customers WHERE id = ? AND store_id = ?').bind(id, store.id).first<any>()
  if (!customer) return c.json({ error: 'not_found', message: 'العميل غير موجود' }, 404)
  const orders = await c.env.DB.prepare(
    'SELECT id, order_number, product_name, total_amount, status, created_at FROM orders WHERE store_id = ? AND customer_phone = ? ORDER BY created_at DESC LIMIT 50'
  ).bind(store.id, customer.phone).all()
  return c.json({ customer, orders: orders.results })
})

customers.put('/:id', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const id = cleanInt(c.req.param('id'), 1)
  const body = await c.req.json().catch(() => ({}))
  const name = cleanString(body.name, 100)
  const phone = cleanPhone(body.phone)
  if (!name || !phone) return c.json({ error: 'invalid', message: 'الاسم ورقم الهاتف مطلوبين' }, 400)
  const res = await c.env.DB.prepare(
    'UPDATE customers SET name = ?, phone = ?, city = ?, address = ?, notes = ? WHERE id = ? AND store_id = ?'
  ).bind(name, phone, cleanString(body.city, 100) || null, cleanString(body.address, 300) || null, cleanString(body.notes, 500) || null, id, store.id).run()
  if (!res.meta.changes) return c.json({ error: 'not_found', message: 'العميل غير موجود' }, 404)
  return c.json({ ok: true })
})

customers.delete('/:id', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const id = cleanInt(c.req.param('id'), 1)
  const res = await c.env.DB.prepare('DELETE FROM customers WHERE id = ? AND store_id = ?').bind(id, store.id).run()
  if (!res.meta.changes) return c.json({ error: 'not_found', message: 'العميل غير موجود' }, 404)
  return c.json({ ok: true })
})

export default customers
