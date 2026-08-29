// Authentication utilities — WebCrypto PBKDF2 + server-side sessions
import type { Context, Next } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

export type Bindings = { DB: D1Database }
export type AppContext = Context<{ Bindings: Bindings; Variables: { user: any; store: any } }>

const ITERATIONS = 100000

function bufToHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
function hexToBuf(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < arr.length; i++) arr[i] = parseInt(hex.substr(i * 2, 2), 16)
  return arr
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, key, 256)
  return `pbkdf2:${ITERATIONS}:${bufToHex(salt.buffer)}:${bufToHex(bits)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [scheme, iterStr, saltHex, hashHex] = stored.split(':')
    if (scheme !== 'pbkdf2') return false
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: hexToBuf(saltHex), iterations: parseInt(iterStr), hash: 'SHA-256' },
      key, 256
    )
    const computed = bufToHex(bits)
    // constant-time compare
    if (computed.length !== hashHex.length) return false
    let diff = 0
    for (let i = 0; i < computed.length; i++) diff |= computed.charCodeAt(i) ^ hashHex.charCodeAt(i)
    return diff === 0
  } catch {
    return false
  }
}

export function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return bufToHex(bytes.buffer)
}

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return bufToHex(digest)
}

const SESSION_DAYS = 30

export async function createSession(db: D1Database, userId: number, userAgent?: string): Promise<string> {
  const token = generateToken()
  const tokenHash = await sha256Hex(token)
  await db
    .prepare(`INSERT INTO sessions (id, user_id, expires_at, user_agent) VALUES (?, ?, datetime('now', '+${SESSION_DAYS} days'), ?)`)
    .bind(tokenHash, userId, (userAgent || '').slice(0, 200))
    .run()
  return token
}

export async function destroySession(db: D1Database, token: string) {
  const tokenHash = await sha256Hex(token)
  await db.prepare('DELETE FROM sessions WHERE id = ?').bind(tokenHash).run()
}

export function setSessionCookie(c: Context, token: string) {
  setCookie(c, 't2aked_session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 3600
  })
}

export function clearSessionCookie(c: Context) {
  deleteCookie(c, 't2aked_session', { path: '/' })
}

/** Middleware: loads user + store, rejects unauthenticated API calls */
export function requireAuth() {
  return async (c: AppContext, next: Next) => {
    const token = getCookie(c, 't2aked_session')
    if (!token) return c.json({ error: 'unauthorized', message: 'خاصك تسجل الدخول أولاً' }, 401)
    const tokenHash = await sha256Hex(token)
    const row = await c.env.DB.prepare(
      `SELECT u.id, u.email, u.name, u.phone, u.onboarded
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.id = ? AND s.expires_at > datetime('now')`
    ).bind(tokenHash).first()
    if (!row) {
      clearSessionCookie(c)
      return c.json({ error: 'unauthorized', message: 'انتهت الجلسة، سجل الدخول من جديد' }, 401)
    }
    c.set('user', row)
    const store = await c.env.DB.prepare('SELECT * FROM stores WHERE owner_id = ? LIMIT 1').bind(row.id).first()
    c.set('store', store)
    await next()
  }
}

/** Returns user or null without rejecting (for page routing) */
export async function getSessionUser(c: AppContext) {
  const token = getCookie(c, 't2aked_session')
  if (!token) return null
  const tokenHash = await sha256Hex(token)
  return await c.env.DB.prepare(
    `SELECT u.id, u.email, u.name, u.onboarded FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.expires_at > datetime('now')`
  ).bind(tokenHash).first()
}

/** Simple D1-backed rate limiter: max `limit` hits per `windowSec` per key */
export async function rateLimit(db: D1Database, key: string, limit: number, windowSec: number): Promise<boolean> {
  const now = Date.now()
  const row = await db.prepare('SELECT count, window_start FROM rate_limits WHERE key = ?').bind(key).first<{ count: number; window_start: string }>()
  if (!row || now - new Date(row.window_start).getTime() > windowSec * 1000) {
    await db.prepare(`INSERT INTO rate_limits (key, count, window_start) VALUES (?, 1, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET count = 1, window_start = datetime('now')`).bind(key).run()
    return true
  }
  if (row.count >= limit) return false
  await db.prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ?').bind(key).run()
  return true
}
