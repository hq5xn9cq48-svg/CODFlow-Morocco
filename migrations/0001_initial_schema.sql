-- تأكد (T2AKED) — Initial schema
-- Multi-tenant: every business row carries store_id; all queries MUST filter by it.

-- ── Users ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,      -- PBKDF2 (WebCrypto) salt:iterations:hash
  onboarded INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Sessions (server-side, revocable) ────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,               -- random 256-bit token (hashed)
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- ── Stores (tenant) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS stores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,                     -- clothing / beauty / food / gifts / other
  city TEXT,
  phone TEXT,
  currency TEXT NOT NULL DEFAULT 'MAD',
  plan TEXT NOT NULL DEFAULT 'free', -- free / basic / pro
  plan_started_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_id);

-- ── Customers ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  address TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_customers_store ON customers(store_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(store_id, phone);

-- ── Products ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0,
  sku TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id);

-- ── Orders ───────────────────────────────────────────────
-- status: new | to_confirm | confirmed | preparing | shipped | delivered | no_answer | cancelled | returned
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,        -- human-friendly per-store e.g. T-1043
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  city TEXT,
  address TEXT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  source TEXT DEFAULT 'manual',      -- manual / instagram / facebook / whatsapp / form / csv
  notes TEXT,
  followup_at TEXT,                  -- next follow-up datetime
  call_attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(store_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(store_id, customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(store_id, created_at);

-- ── Order status history (audit log) ─────────────────────
CREATE TABLE IF NOT EXISTS order_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,          -- status_change / note / created / edited / call_attempt
  from_status TEXT,
  to_status TEXT,
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_order ON order_events(order_id);

-- ── Message templates ────────────────────────────────────
CREATE TABLE IF NOT EXISTS message_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,                -- confirm / ask_address / reminder / no_answer / shipped / delivered / review / apology / cancelled / upsell / custom
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'darija', -- darija / ar / fr
  tone TEXT NOT NULL DEFAULT 'friendly', -- friendly / formal
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_templates_store ON message_templates(store_id);

-- ── Simple rate limiting (per key per window) ────────────
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  window_start TEXT NOT NULL
);
