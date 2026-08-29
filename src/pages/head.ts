/** Shared <head> for all pages */
export function head(title: string, description: string, opts: { noindex?: boolean } = {}): string {
  return `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${title}</title>
  <meta name="description" content="${description}">
  ${opts.noindex ? '<meta name="robots" content="noindex">' : ''}
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ar_MA">
  <meta property="og:site_name" content="تأكد — T2AKED">
  <meta name="theme-color" content="#0D7A6C">
  <link rel="icon" type="image/svg+xml" href="/static/favicon.svg">
  <link rel="manifest" href="/manifest.json">
  <link rel="apple-touch-icon" href="/static/icon-192.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="/static/style.css" rel="stylesheet">
  `
}

/** Brand logo SVG (inline) */
export function logoSvg(size = 34): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}" aria-hidden="true">
  <rect width="512" height="512" rx="116" fill="#0D7A6C"/>
  <path d="M256 106c-83 0-150 56-150 126 0 39 21 74 55 97l-13 55c-2 8 7 15 14 10l60-38c11 2 22 3 34 3 83 0 150-56 150-127s-67-126-150-126z" fill="#FAF8F4"/>
  <path d="M196 232l42 42 78-84" fill="none" stroke="#0D7A6C" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
}
