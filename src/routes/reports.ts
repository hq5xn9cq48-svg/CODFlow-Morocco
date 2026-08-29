import { Hono } from 'hono'
import { requireAuth, type Bindings } from '../lib/auth'
import { cleanInt } from '../lib/validate'

const reports = new Hono<{ Bindings: Bindings; Variables: { user: any; store: any } }>({ strict: false })
reports.use('*', requireAuth())

function noStore(c: any) { return c.json({ error: 'no_store', message: 'خاصك تكمل إعداد المتجر أولاً' }, 400) }

/** Dashboard "today" view: what needs action right now */
reports.get('/today', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const sid = store.id
  const db = c.env.DB

  const newOrders = await db.prepare(`SELECT COUNT(*) as n FROM orders WHERE store_id = ? AND status = 'new'`).bind(sid).first<any>()
  const toConfirm = await db.prepare(`SELECT COUNT(*) as n FROM orders WHERE store_id = ? AND status IN ('to_confirm','no_answer')`).bind(sid).first<any>()
  const toShip = await db.prepare(`SELECT COUNT(*) as n FROM orders WHERE store_id = ? AND status IN ('confirmed','preparing')`).bind(sid).first<any>()
  const followupsDue = await db.prepare(
    `SELECT COUNT(*) as n FROM orders WHERE store_id = ? AND followup_at IS NOT NULL AND followup_at <= datetime('now') AND status NOT IN ('delivered','cancelled','returned')`
  ).bind(sid).first<any>()
  const todayCount = await db.prepare(
    `SELECT COUNT(*) as n, COALESCE(SUM(total_amount),0) as amount FROM orders WHERE store_id = ? AND date(created_at) = date('now')`
  ).bind(sid).first<any>()

  // action queue: most urgent orders first
  const queue = await db.prepare(
    `SELECT id, order_number, customer_name, customer_phone, city, product_name, total_amount, status, followup_at, call_attempts, created_at
     FROM orders WHERE store_id = ? AND (
       status IN ('new','to_confirm','no_answer')
       OR (followup_at IS NOT NULL AND followup_at <= datetime('now') AND status NOT IN ('delivered','cancelled','returned'))
     )
     ORDER BY CASE
       WHEN followup_at IS NOT NULL AND followup_at <= datetime('now') THEN 0
       WHEN status = 'new' THEN 1
       WHEN status = 'to_confirm' THEN 2
       ELSE 3 END, created_at ASC
     LIMIT 15`
  ).bind(sid).all()

  return c.json({
    new_orders: newOrders?.n || 0,
    to_confirm: toConfirm?.n || 0,
    to_ship: toShip?.n || 0,
    followups_due: followupsDue?.n || 0,
    today_orders: todayCount?.n || 0,
    today_amount: todayCount?.amount || 0,
    action_queue: queue.results
  })
})

/** Full stats page */
reports.get('/stats', async (c) => {
  const store = c.get('store')
  if (!store) return noStore(c)
  const sid = store.id
  const db = c.env.DB
  const days = Math.min(365, Math.max(7, cleanInt(c.req.query('days') || 30, 7, 365)))

  const totals = await db.prepare(
    `SELECT COUNT(*) as total,
      SUM(CASE WHEN status IN ('confirmed','preparing','shipped','delivered') THEN 1 ELSE 0 END) as confirmed,
      SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN status = 'no_answer' THEN 1 ELSE 0 END) as no_answer,
      SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned,
      COALESCE(AVG(total_amount),0) as avg_amount,
      COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END),0) as delivered_amount
     FROM orders WHERE store_id = ? AND created_at >= datetime('now', '-' || ? || ' days')`
  ).bind(sid, days).first<any>()

  const byCity = await db.prepare(
    `SELECT COALESCE(NULLIF(city,''),'غير محدد') as city, COUNT(*) as n FROM orders
     WHERE store_id = ? AND created_at >= datetime('now', '-' || ? || ' days')
     GROUP BY 1 ORDER BY n DESC LIMIT 8`
  ).bind(sid, days).all()

  const byProduct = await db.prepare(
    `SELECT product_name, COUNT(*) as n, COALESCE(SUM(total_amount),0) as amount FROM orders
     WHERE store_id = ? AND created_at >= datetime('now', '-' || ? || ' days')
     GROUP BY product_name ORDER BY n DESC LIMIT 8`
  ).bind(sid, days).all()

  const byDay = await db.prepare(
    `SELECT date(created_at) as day, COUNT(*) as n,
      SUM(CASE WHEN status IN ('confirmed','preparing','shipped','delivered') THEN 1 ELSE 0 END) as confirmed
     FROM orders WHERE store_id = ? AND created_at >= datetime('now', '-' || ? || ' days')
     GROUP BY 1 ORDER BY 1 ASC`
  ).bind(sid, days).all()

  const byStatus = await db.prepare(
    `SELECT status, COUNT(*) as n FROM orders WHERE store_id = ? AND created_at >= datetime('now', '-' || ? || ' days') GROUP BY status`
  ).bind(sid, days).all()

  const total = totals?.total || 0
  return c.json({
    days,
    totals: {
      ...totals,
      confirmation_rate: total ? Math.round(((totals?.confirmed || 0) / total) * 100) : 0,
      delivery_rate: total ? Math.round(((totals?.delivered || 0) / total) * 100) : 0
    },
    by_city: byCity.results,
    by_product: byProduct.results,
    by_day: byDay.results,
    by_status: Object.fromEntries((byStatus.results as any[]).map((r) => [r.status, r.n]))
  })
})

export default reports
