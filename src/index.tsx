import { Hono } from 'hono'
import { logger } from 'hono/logger'
import authRoutes from './routes/auth'
import orderRoutes from './routes/orders'
import customerRoutes from './routes/customers'
import productRoutes from './routes/products'
import templateRoutes from './routes/templates'
import reportRoutes from './routes/reports'
import storeRoutes from './routes/store'
import { getSessionUser, type Bindings } from './lib/auth'
import { landingPage } from './pages/landing'
import { authPage } from './pages/auth'
import { appShell } from './pages/app'
import { legalPage, TERMS_HTML, PRIVACY_HTML } from './pages/legal'
import { notFoundPage } from './pages/notfound'

const app = new Hono<{ Bindings: Bindings; Variables: { user: any; store: any } }>({ strict: false })

app.use(logger())

// Security headers
app.use('*', async (c, next) => {
  await next()
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
})

// ── API ──
app.route('/api/auth', authRoutes)
app.route('/api/orders', orderRoutes)
app.route('/api/customers', customerRoutes)
app.route('/api/products', productRoutes)
app.route('/api/templates', templateRoutes)
app.route('/api/reports', reportRoutes)
app.route('/api/store', storeRoutes)

// ── Pages ──
app.get('/', (c) => c.html(landingPage()))
app.get('/login', async (c) => {
  const user = await getSessionUser(c as any)
  if (user) return c.redirect('/app')
  return c.html(authPage('login'))
})
app.get('/register', async (c) => {
  const user = await getSessionUser(c as any)
  if (user) return c.redirect('/app')
  return c.html(authPage('register'))
})
app.get('/forgot', (c) => c.html(authPage('forgot')))

app.get('/app', async (c) => {
  const user = await getSessionUser(c as any)
  if (!user) return c.redirect('/login')
  return c.html(appShell())
})
app.get('/app/*', async (c) => {
  const user = await getSessionUser(c as any)
  if (!user) return c.redirect('/login')
  return c.html(appShell())
})

app.get('/terms', (c) => c.html(legalPage('شروط الاستخدام', TERMS_HTML)))
app.get('/privacy', (c) => c.html(legalPage('سياسة الخصوصية', PRIVACY_HTML)))

// ── SEO ──
app.get('/robots.txt', (c) =>
  c.text(`User-agent: *\nAllow: /\nDisallow: /app\nDisallow: /api\nSitemap: ${new URL(c.req.url).origin}/sitemap.xml`)
)
app.get('/sitemap.xml', (c) => {
  const origin = new URL(c.req.url).origin
  const pages = ['', '/login', '/register', '/terms', '/privacy']
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${origin}${p}</loc></url>`).join('\n')}
</urlset>`
  c.header('Content-Type', 'application/xml')
  return c.body(xml)
})

// PWA manifest
app.get('/manifest.json', (c) =>
  c.json({
    name: 'تأكد — T2AKED',
    short_name: 'تأكد',
    description: 'نظّم طلبات الدفع عند الاستلام ديالك، من أول مساج حتى للتسليم',
    start_url: '/app',
    display: 'standalone',
    dir: 'rtl',
    lang: 'ar',
    background_color: '#FAF8F4',
    theme_color: '#0D7A6C',
    icons: [
      { src: '/static/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
      { src: '/static/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' }
    ]
  })
)

// 404
app.notFound((c) => {
  if (c.req.path.startsWith('/api/')) return c.json({ error: 'not_found', message: 'المسار غير موجود' }, 404)
  return c.html(notFoundPage(), 404)
})

app.onError((err, c) => {
  console.error(err)
  if (c.req.path.startsWith('/api/')) return c.json({ error: 'server_error', message: 'وقع خطأ غير متوقع، حاول من جديد' }, 500)
  return c.html(notFoundPage('وقع خطأ غير متوقع'), 500)
})

export default app
