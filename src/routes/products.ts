import { Hono } from 'hono'
import { requireAuth, type Bindings } from '../lib/auth'
import { cleanString, cleanNumber, cleanInt } from '../lib/validate'

const products = new Hono<{ Bindings: Bindings; Variables: { user: any; store: any } }>({ strict: false })
products.use('*', requireAuth())

function noStore(c: any) { return c.json({ error: 'no_store', message: 'خاصك تكمل إعداد المتجر أولاً' }, 400) }

products.get('/', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const rows = await c.env.DB.prepare(
    `SELECT p.*, (SELECT COUNT(*) FROM orders o WHERE o.store_id = p.store_id AND o.product_name = p.name) as orders_count
     FROM products p WHERE p.store_id = ? ORDER BY p.created_at DESC LIMIT 200`
  ).bind(store.id).all()
  return c.json({ products: rows.results })
})

products.post('/', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const body = await c.req.json().catch(() => ({}))
  const name = cleanString(body.name, 200)
  if (!name) return c.json({ error: 'invalid', message: 'اسم المنتج مطلوب' }, 400)
  const res = await c.env.DB.prepare('INSERT INTO products (store_id, name, price, sku) VALUES (?, ?, ?, ?)')
    .bind(store.id, name, cleanNumber(body.price), cleanString(body.sku, 50) || null).run()
  return c.json({ ok: true, id: res.meta.last_row_id })
})

products.put('/:id', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const id = cleanInt(c.req.param('id'), 1)
  const body = await c.req.json().catch(() => ({}))
  const name = cleanString(body.name, 200)
  if (!name) return c.json({ error: 'invalid', message: 'اسم المنتج مطلوب' }, 400)
  const res = await c.env.DB.prepare('UPDATE products SET name = ?, price = ?, sku = ?, active = ? WHERE id = ? AND store_id = ?')
    .bind(name, cleanNumber(body.price), cleanString(body.sku, 50) || null, body.active ? 1 : 0, id, store.id).run()
  if (!res.meta.changes) return c.json({ error: 'not_found', message: 'المنتج غير موجود' }, 404)
  return c.json({ ok: true })
})

products.delete('/:id', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const id = cleanInt(c.req.param('id'), 1)
  const res = await c.env.DB.prepare('DELETE FROM products WHERE id = ? AND store_id = ?').bind(id, store.id).run()
  if (!res.meta.changes) return c.json({ error: 'not_found', message: 'المنتج غير موجود' }, 404)
  return c.json({ ok: true })
})

export default products
