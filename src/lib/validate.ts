// Input validation helpers — all user input passes through these
export const ORDER_STATUSES = [
  'new', 'to_confirm', 'confirmed', 'preparing', 'shipped', 'delivered', 'no_answer', 'cancelled', 'returned'
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const STATUS_LABELS: Record<string, string> = {
  new: 'جديد',
  to_confirm: 'يحتاج تأكيد',
  confirmed: 'مؤكد',
  preparing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  no_answer: 'لم يرد',
  cancelled: 'ملغى',
  returned: 'مرتجع'
}

export const SOURCES = ['manual', 'instagram', 'facebook', 'whatsapp', 'form', 'csv'] as const
export const TEMPLATE_SLUGS = ['confirm', 'ask_address', 'reminder', 'no_answer', 'shipped', 'delivered', 'review', 'apology', 'cancelled', 'upsell', 'custom'] as const

export function isValidStatus(s: unknown): s is OrderStatus {
  return typeof s === 'string' && (ORDER_STATUSES as readonly string[]).includes(s)
}

export function cleanString(v: unknown, maxLen = 500): string {
  if (typeof v !== 'string') return ''
  return v.trim().slice(0, maxLen)
}

export function cleanPhone(v: unknown): string {
  const s = cleanString(v, 20).replace(/[\s\-\.]/g, '')
  return /^(\+?\d{6,15})$/.test(s) ? s : ''
}

export function cleanNumber(v: unknown, min = 0, max = 10000000): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  if (isNaN(n)) return 0
  return Math.min(max, Math.max(min, n))
}

export function cleanInt(v: unknown, min = 0, max = 1000000): number {
  return Math.round(cleanNumber(v, min, max))
}

export function isValidEmail(v: unknown): boolean {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 200
}

/** Escape for building HTML server-side (XSS protection) */
export function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
