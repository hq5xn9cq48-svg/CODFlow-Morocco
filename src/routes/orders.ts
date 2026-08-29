import { Hono } from 'hono'
import { requireAuth, type Bindings } from '../lib/auth'
import { isValidStatus, cleanString, cleanPhone, cleanNumber, cleanInt, ORDER_STATUSES, STATUS_LABELS } from '../lib/validate'

const orders = new Hono<{ Bindings: Bindings; Variables: { user: any; store: any } }>({ strict: false })
orders.use('*', requireAuth())

function noStore(c: any) {
  return c.json({ error: 'no_store', message: 'خاصك تكمل إعداد المتجر أولاً' }, 400)
}

/** attention flags computed for one order against its store history */
async function computeFlags(db: D1Database, storeId: number, order: any): Promise<string[]> {
  const flags: string[] = []
  if (!order.address || String(order.address).trim().length < 8) flags.push('missing_address')
  if (order.call_attempts >= 3 && !['delivered', 'cancelled', 'returned', 'shipped'].includes(order.status)) flags.push('many_attempts')
  if (order.followup_at && new Date(order.followup_at + 'Z') <= new Date() && !['delivered', 'cancelled', 'returned'].includes(order.status)) flags.push('followup_due')
  if (order.customer_phone) {
    const dup = await db.prepare(
      `SELECT COUNT(*) as n FROM orders WHERE store_id = ? AND customer_phone = ? AND id != ? AND status NOT IN ('delivered','cancelled','returned')`
    ).bind(storeId, order.customer_phone, order.id).first<any>()
    if (dup && dup.n > 0) flags.push('duplicate_phone')
    const prevCancelled = await db.prepare(
      `SELECT COUNT(*) as n FROM orders WHERE store_id = ? AND customer_phone = ? AND id != ? AND status IN ('cancelled','returned','no_answer')`
    ).bind(storeId, order.customer_phone, order.id).first<any>()
    if (prevCancelled && prevCancelled.n >= 2) flags.push('history_risk')
  }
  return flags
}

async function nextOrderNumber(db: D1Database, storeId: number): Promise<string> {
  const row = await db.prepare('SELECT COUNT(*) as n FROM orders WHERE store_id = ?').bind(storeId).first<any>()
  return `T-${1001 + (row?.n || 0)}`
}

async function upsertCustomer(db: D1Database, storeId: number, name: string, phone: string, city: string, address: string): Promise<number | null> {
  if (!phone) return null
  const existing = await db.prepare('SELECT id FROM customers WHERE store_id = ? AND phone = ? LIMIT 1').bind(storeId, phone).first<any>()
  if (existing) {
    await db.prepare('UPDATE customers SET name = ?, city = COALESCE(NULLIF(?, \'\'), city), address = COALESCE(NULLIF(?, \'\'), address) WHERE id = ?')
      .bind(name, city, address, existing.id).run()
    return existing.id
  }
  const res = await db.prepare('INSERT INTO customers (store_id, name, phone, city, address) VALUES (?, ?, ?, ?, ?)')
    .bind(storeId, name, phone, city || null, address || null).run()
  return res.meta.last_row_id as number
}

// ── List with search / filter / sort / pagination ──
orders.get('/', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const q = c.req.query()
  const conditions: string[] = ['store_id = ?']
  const params: any[] = [store.id]

  if (q.status && isValidStatus(q.status)) { conditions.push('status = ?'); params.push(q.status) }
  if (q.search) {
    const s = `%${cleanString(q.search, 100)}%`
    conditions.push('(customer_name LIKE ? OR customer_phone LIKE ? OR order_number LIKE ? OR product_name LIKE ? OR city LIKE ?)')
    params.push(s, s, s, s, s)
  }
  if (q.city) { conditions.push('city = ?'); params.push(cleanString(q.city, 100)) }
  if (q.followup === 'due') {
    conditions.push(`followup_at IS NOT NULL AND followup_at <= datetime('now') AND status NOT IN ('delivered','cancelled','returned')`)
  }

  const sortMap: Record<string, string> = {
    newest: 'created_at DESC', oldest: 'created_at ASC',
    amount_desc: 'total_amount DESC', amount_asc: 'total_amount ASC',
    updated: 'updated_at DESC'
  }
  const orderBy = sortMap[q.sort || 'newest'] || 'created_at DESC'
  const page = Math.max(1, cleanInt(q.page || 1, 1, 10000))
  const perPage = Math.min(100, Math.max(5, cleanInt(q.per_page || 25, 5, 100)))
  const offset = (page - 1) * perPage

  const where = conditions.join(' AND ')
  const total = await c.env.DB.prepare(`SELECT COUNT(*) as n FROM orders WHERE ${where}`).bind(...params).first<any>()
  const rows = await c.env.DB.prepare(`SELECT * FROM orders WHERE ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
    .bind(...params, perPage, offset).all()

  const list = rows.results as any[]
  // flags for the visible page only (perf)
  for (const o of list) o.flags = await computeFlags(c.env.DB, store.id, o)

  // status counts for pipeline bar
  const counts = await c.env.DB.prepare(
    'SELECT status, COUNT(*) as n FROM orders WHERE store_id = ? GROUP BY status'
  ).bind(store.id).all()

  return c.json({
    orders: list,
    total: total?.n || 0,
    page, per_page: perPage,
    counts: Object.fromEntries((counts.results as any[]).map((r) => [r.status, r.n]))
  })
})

// ── CSV export (before /:id routes) ──
orders.get('/export.csv', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const rows = await c.env.DB.prepare('SELECT * FROM orders WHERE store_id = ? ORDER BY created_at DESC').bind(store.id).all()
  const header = 'order_number,customer_name,customer_phone,city,address,product_name,quantity,total_amount,status,source,notes,created_at'
  const csvEsc = (v: any) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = (rows.results as any[]).map((o) =>
    [o.order_number, o.customer_name, o.customer_phone, o.city, o.address, o.product_name, o.quantity, o.total_amount, STATUS_LABELS[o.status] || o.status, o.source, o.notes, o.created_at].map(csvEsc).join(',')
  )
  const csv = '\uFEFF' + header + '\n' + lines.join('\n')
  c.header('Content-Type', 'text/csv; charset=utf-8')
  c.header('Content-Disposition', 'attachment; filename="t2aked-orders.csv"')
  return c.body(csv)
})

// ── CSV import ──
orders.post('/import', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const body = await c.req.json().catch(() => ({}))
  const rows = Array.isArray(body.rows) ? body.rows.slice(0, 500) : []
  if (!rows.length) return c.json({ error: 'empty', message: 'الملف فارغ أو الصيغة غير صحيحة' }, 400)
  let imported = 0, skipped = 0
  for (const r of rows) {
    const name = cleanString(r.customer_name, 100)
    const phone = cleanPhone(r.customer_phone)
    const product = cleanString(r.product_name, 200)
    if (!name || !phone || !product) { skipped++; continue }
    const num = await nextOrderNumber(c.env.DB, store.id)
    const custId = await upsertCustomer(c.env.DB, store.id, name, phone, cleanString(r.city, 100), cleanString(r.address, 300))
    await c.env.DB.prepare(
      `INSERT INTO orders (store_id, order_number, customer_id, customer_name, customer_phone, city, address, product_name, quantity, total_amount, status, source, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', 'csv', ?)`
    ).bind(store.id, num, custId, name, phone, cleanString(r.city, 100) || null, cleanString(r.address, 300) || null,
      product, cleanInt(r.quantity || 1, 1, 1000), cleanNumber(r.total_amount), cleanString(r.notes, 500) || null).run()
    imported++
  }
  return c.json({ ok: true, imported, skipped })
})

// ── Bulk status action ──
orders.post('/bulk', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const body = await c.req.json().catch(() => ({}))
  const ids = (Array.isArray(body.ids) ? body.ids : []).map((v: any) => cleanInt(v, 1)).filter(Boolean).slice(0, 100)
  const status = body.status
  if (!ids.length) return c.json({ error: 'invalid', message: 'اختر طلب واحد على الأقل' }, 400)
  if (!isValidStatus(status)) return c.json({ error: 'invalid', message: 'حالة غير معروفة' }, 400)
  const placeholders = ids.map(() => '?').join(',')
  // tenant isolation: only rows belonging to this store
  const existing = await c.env.DB.prepare(`SELECT id, status FROM orders WHERE store_id = ? AND id IN (${placeholders})`)
    .bind(store.id, ...ids).all()
  for (const row of existing.results as any[]) {
    await c.env.DB.prepare(`UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ? AND store_id = ?`)
      .bind(status, row.id, store.id).run()
    await c.env.DB.prepare('INSERT INTO order_events (store_id, order_id, event_type, from_status, to_status, detail) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(store.id, row.id, 'status_change', row.status, status, 'إجراء جماعي').run()
  }
  return c.json({ ok: true, updated: existing.results.length })
})

// ── Create ──
orders.post('/', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const body = await c.req.json().catch(() => ({}))
  const name = cleanString(body.customer_name, 100)
  const phone = cleanPhone(body.customer_phone)
  const product = cleanString(body.product_name, 200)
  if (!name) return c.json({ error: 'invalid', field: 'customer_name', message: 'اسم العميل مطلوب' }, 400)
  if (!phone) return c.json({ error: 'invalid', field: 'customer_phone', message: 'رقم هاتف صحيح مطلوب (مثال: 0661234567)' }, 400)
  if (!product) return c.json({ error: 'invalid', field: 'product_name', message: 'اسم المنتج مطلوب' }, 400)

  const city = cleanString(body.city, 100)
  const address = cleanString(body.address, 300)
  const num = await nextOrderNumber(c.env.DB, store.id)
  const custId = await upsertCustomer(c.env.DB, store.id, name, phone, city, address)
  const source = ['manual', 'instagram', 'facebook', 'whatsapp', 'form'].includes(body.source) ? body.source : 'manual'
  const status = isValidStatus(body.status) ? body.status : 'new'

  const res = await c.env.DB.prepare(
    `INSERT INTO orders (store_id, order_number, customer_id, customer_name, customer_phone, city, address, product_name, quantity, total_amount, status, source, notes, followup_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(store.id, num, custId, name, phone, city || null, address || null, product,
    cleanInt(body.quantity || 1, 1, 1000), cleanNumber(body.total_amount), status, source,
    cleanString(body.notes, 500) || null, cleanString(body.followup_at, 30) || null).run()
  const orderId = res.meta.last_row_id as number
  await c.env.DB.prepare('INSERT INTO order_events (store_id, order_id, event_type, to_status, detail) VALUES (?, ?, ?, ?, ?)')
    .bind(store.id, orderId, 'created', status, `طلب جديد من ${source}`).run()
  return c.json({ ok: true, id: orderId, order_number: num })
})

// ── Single order + events + flags ──
orders.get('/:id', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const id = cleanInt(c.req.param('id'), 1)
  const order = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ? AND store_id = ?').bind(id, store.id).first<any>()
  if (!order) return c.json({ error: 'not_found', message: 'الطلب غير موجود' }, 404)
  order.flags = await computeFlags(c.env.DB, store.id, order)
  const events = await c.env.DB.prepare('SELECT * FROM order_events WHERE order_id = ? AND store_id = ? ORDER BY created_at DESC LIMIT 30')
    .bind(id, store.id).all()
  const customerHistory = await c.env.DB.prepare(
    'SELECT id, order_number, product_name, total_amount, status, created_at FROM orders WHERE store_id = ? AND customer_phone = ? AND id != ? ORDER BY created_at DESC LIMIT 10'
  ).bind(store.id, order.customer_phone, id).all()
  return c.json({ order, events: events.results, customer_history: customerHistory.results })
})

// ── Update ──
orders.put('/:id', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const id = cleanInt(c.req.param('id'), 1)
  const existing = await c.env.DB.prepare('SELECT id FROM orders WHERE id = ? AND store_id = ?').bind(id, store.id).first()
  if (!existing) return c.json({ error: 'not_found', message: 'الطلب غير موجود' }, 404)
  const body = await c.req.json().catch(() => ({}))
  const name = cleanString(body.customer_name, 100)
  const phone = cleanPhone(body.customer_phone)
  const product = cleanString(body.product_name, 200)
  if (!name || !phone || !product) return c.json({ error: 'invalid', message: 'الاسم والهاتف والمنتج مطلوبين' }, 400)

  await c.env.DB.prepare(
    `UPDATE orders SET customer_name = ?, customer_phone = ?, city = ?, address = ?, product_name = ?, quantity = ?, total_amount = ?, notes = ?, followup_at = ?, updated_at = datetime('now')
     WHERE id = ? AND store_id = ?`
  ).bind(name, phone, cleanString(body.city, 100) || null, cleanString(body.address, 300) || null, product,
    cleanInt(body.quantity || 1, 1, 1000), cleanNumber(body.total_amount),
    cleanString(body.notes, 500) || null, cleanString(body.followup_at, 30) || null, id, store.id).run()
  await c.env.DB.prepare('INSERT INTO order_events (store_id, order_id, event_type, detail) VALUES (?, ?, ?, ?)')
    .bind(store.id, id, 'edited', 'تعديل بيانات الطلب').run()
  return c.json({ ok: true })
})

// ── Change status ──
orders.post('/:id/status', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const id = cleanInt(c.req.param('id'), 1)
  const body = await c.req.json().catch(() => ({}))
  if (!isValidStatus(body.status)) return c.json({ error: 'invalid', message: 'حالة غير معروفة' }, 400)
  const order = await c.env.DB.prepare('SELECT id, status FROM orders WHERE id = ? AND store_id = ?').bind(id, store.id).first<any>()
  if (!order) return c.json({ error: 'not_found', message: 'الطلب غير موجود' }, 404)
  if (order.status === body.status) return c.json({ ok: true, unchanged: true })
  await c.env.DB.prepare(`UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ? AND store_id = ?`)
    .bind(body.status, id, store.id).run()
  await c.env.DB.prepare('INSERT INTO order_events (store_id, order_id, event_type, from_status, to_status, detail) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(store.id, id, 'status_change', order.status, body.status, cleanString(body.detail, 300) || null).run()
  return c.json({ ok: true, from: order.status, to: body.status })
})

// ── Log a call attempt ──
orders.post('/:id/call', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const id = cleanInt(c.req.param('id'), 1)
  const order = await c.env.DB.prepare('SELECT id, call_attempts FROM orders WHERE id = ? AND store_id = ?').bind(id, store.id).first<any>()
  if (!order) return c.json({ error: 'not_found', message: 'الطلب غير موجود' }, 404)
  const attempts = (order.call_attempts || 0) + 1
  await c.env.DB.prepare(`UPDATE orders SET call_attempts = ?, updated_at = datetime('now') WHERE id = ? AND store_id = ?`)
    .bind(attempts, id, store.id).run()
  await c.env.DB.prepare('INSERT INTO order_events (store_id, order_id, event_type, detail) VALUES (?, ?, ?, ?)')
    .bind(store.id, id, 'call_attempt', `المحاولة ${attempts}`).run()
  return c.json({ ok: true, attempts })
})

// ── Add note ──
orders.post('/:id/note', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const id = cleanInt(c.req.param('id'), 1)
  const body = await c.req.json().catch(() => ({}))
  const note = cleanString(body.note, 500)
  if (!note) return c.json({ error: 'invalid', message: 'اكتب الملاحظة أولاً' }, 400)
  const order = await c.env.DB.prepare('SELECT id FROM orders WHERE id = ? AND store_id = ?').bind(id, store.id).first()
  if (!order) return c.json({ error: 'not_found', message: 'الطلب غير موجود' }, 404)
  await c.env.DB.prepare(`UPDATE orders SET notes = ?, updated_at = datetime('now') WHERE id = ? AND store_id = ?`).bind(note, id, store.id).run()
  await c.env.DB.prepare('INSERT INTO order_events (store_id, order_id, event_type, detail) VALUES (?, ?, ?, ?)')
    .bind(store.id, id, 'note', note).run()
  return c.json({ ok: true })
})

// ── Delete ──
orders.delete('/:id', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const id = cleanInt(c.req.param('id'), 1)
  const res = await c.env.DB.prepare('DELETE FROM orders WHERE id = ? AND store_id = ?').bind(id, store.id).run()
  if (!res.meta.changes) return c.json({ error: 'not_found', message: 'الطلب غير موجود' }, 404)
  return c.json({ ok: true })
})

export default orders
