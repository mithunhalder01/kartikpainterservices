/**
 * Static per-route pre-render for the SPA.
 *
 * WHY: The app is a client-side SPA — without this, every URL serves the same
 * dist/index.html (homepage <title>/meta) until React + react-helmet run. Social
 * scrapers (WhatsApp / Facebook / LinkedIn / X) never run JS, so shared deep links
 * would always preview the homepage. This script clones the built index.html for
 * each known route and injects that route's real <title>, description, canonical,
 * Open Graph / Twitter tags, JSON-LD breadcrumb, and unique crawlable body copy.
 *
 * Vercel serves these static files (directory index) BEFORE the SPA rewrite, so the
 * correct HTML is delivered per URL; React then hydrates the same bundle on top.
 *
 * Runs after `vite build` (see package.json build script). Zero runtime deps.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'dist')
const SITE = 'https://kartikpainterservices.vercel.app'
const BRAND = 'Kartik Painter Services'
const OG_IMAGE = `${SITE}/og-image.jpg`

// ── Pull dynamic route metadata from the real data sources (DRY, no drift) ──
const { services } = await import('../src/data/data.js')
const { blogPosts } = await import('../src/data/blogPosts.js')
const { areaData, areaKeys } = await import('../src/data/areas.js')

// Every locality page, sourced from the shared areas data.
const AREAS = areaKeys.map((key) => {
  const a = areaData[key]
  return { path: `/${key}`, title: a.title, desc: a.desc, h1: a.h1, intro: a.sub }
})

// Static, hand-authored pages.
const STATIC_PAGES = [
  {
    path: '/',
    title: 'Best House Painting Services in Noida | Starting ₹8/sqft | Kartik Painter Services',
    desc: 'Noida mein best house painting services (interior, exterior, waterproofing, texture). Lowest charges (starting ₹8/sqft) from verified painters with 15+ years experience. Free site visit. Call +91 7500770667.',
    h1: 'Best Painter in Noida | Professional House & Home Painting Services',
    intro: 'Trusted painter in Noida for interior painting, exterior painting, waterproofing, texture painting, POP, wall putty and wood polish. 15+ years of experience and 500+ projects across Noida, Greater Noida, Dadri and Ghaziabad.',
  },
  {
    path: '/services',
    title: 'Painting Services in Noida – Interior, Exterior & Waterproofing | Kartik Painter Services',
    desc: 'All painting services in Noida under one roof: interior, exterior, waterproofing, texture, commercial, POP, wall putty, wood polish and more. Written estimate, premium brands, free site visit.',
    h1: 'Painting Services in Noida',
    intro: 'Explore every painting and finishing service we offer across Noida and Greater Noida — each with transparent starting prices and a free site visit.',
  },
  {
    path: '/gallery',
    title: 'Painting Work Gallery in Noida – Real Projects | Kartik Painter Services',
    desc: 'Browse real interior, exterior and texture painting projects completed by Kartik Painter Services across Noida, Greater Noida and Ghaziabad.',
    h1: 'Our Painting Work in Noida',
    intro: 'A gallery of real, completed painting and waterproofing projects across Noida NCR — interior, exterior, texture and commercial work.',
  },
  {
    path: '/about',
    title: 'About Kartik Painter Services – 15+ Years Painting Noida NCR',
    desc: 'Kartik Painter Services is a trusted painting contractor in Noida NCR with 15+ years of experience, 500+ completed projects and a commitment to premium brands and clean, on-time delivery.',
    h1: 'About Kartik Painter Services',
    intro: 'For 15+ years we have painted homes, offices and commercial spaces across Noida, Greater Noida, Dadri and Ghaziabad — with verified painters, premium brands and written estimates.',
  },
  {
    path: '/contact',
    title: 'Contact Kartik Painter Services – Free Painting Estimate in Noida',
    desc: 'Book a free site visit and written painting estimate in Noida. Call or WhatsApp +91 7500770667, or send us your project details for a fast quote.',
    h1: 'Get a Free Painting Estimate in Noida',
    intro: 'Book a free site visit and written estimate anywhere in Noida, Greater Noida, Dadri or Ghaziabad. Call or WhatsApp +91 7500770667.',
  },
  {
    path: '/blog',
    title: 'Painting Tips & Cost Guides for Noida Homes | Kartik Painter Services Blog',
    desc: 'Expert painting guides for Noida homeowners — painting costs, colour ideas, waterproofing tips and how to choose the right painter in Noida NCR.',
    h1: 'Painting Guides for Noida Homeowners',
    intro: 'Practical painting advice for Noida NCR — costs, colour trends, waterproofing and how to hire the right painting contractor.',
  },
]

// Service pages, sourced from data.js.
const SERVICE_PAGES = services.map((s) => ({
  path: `/${s.slug}`,
  title: s.seoTitle || `${s.title} in Noida | ${BRAND}`,
  desc: s.seoDesc || s.desc,
  h1: `${s.title} in Noida`,
  intro: s.longDesc || s.desc || '',
}))

// Blog post pages, sourced from blogPosts.js.
const BLOG_PAGES = blogPosts.map((p) => ({
  path: `/blog/${p.slug}`,
  title: p.title.includes(BRAND) ? p.title : `${p.title} | ${BRAND}`,
  desc: p.desc || `${p.title} — expert painting advice for Noida NCR homeowners.`,
  h1: p.title,
  intro: p.desc || '',
  ogType: 'article',
}))

const ROUTES = [...STATIC_PAGES, ...SERVICE_PAGES, ...AREAS, ...BLOG_PAGES]

// ── HTML helpers ────────────────────────────────────────────────────────────
const esc = (str = '') =>
  String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Replace the content of a tag matched by a regex, or leave HTML unchanged. */
const swap = (html, regex, replacement) =>
  regex.test(html) ? html.replace(regex, replacement) : html

function breadcrumbLd(route) {
  const items = [{ name: 'Home', path: '/' }]
  if (route.path !== '/') {
    if (route.path.startsWith('/blog/')) items.push({ name: 'Blog', path: '/blog' })
    else if (SERVICE_PAGES.some((s) => s.path === route.path))
      items.push({ name: 'Services', path: '/services' })
    items.push({ name: route.h1, path: route.path })
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.path === '/' ? '/' : it.path}`,
    })),
  }
}

function fallbackBody(route) {
  return `<main id="seo-fallback">
    <img src="/logo.png" width="160" height="64" alt="${esc(BRAND)} logo" />
    <h1>${esc(route.h1)}</h1>
    <p>${esc(route.intro)}</p>
    <p>Call <a href="tel:+917500770667">+91 75007 70667</a> or email <a href="mailto:kartikpainterservices@gmail.com">kartikpainterservices@gmail.com</a> for a free site visit and written estimate.</p>
    <nav aria-label="Primary internal links">
      <a href="/">Home</a>
      <a href="/services">Services</a>
      <a href="/gallery">Gallery</a>
      <a href="/blog">Blog</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
      <a href="/noida">Painter in Noida</a>
      <a href="/greater-noida">Painter in Greater Noida</a>
      <a href="/ghaziabad">Painter in Ghaziabad</a>
      <a href="/dadri">Painter in Dadri</a>
    </nav>
  </main>`
}

function render(shell, route) {
  const canonical = `${SITE}${route.path === '/' ? '/' : route.path}`
  const title = esc(route.title)
  const desc = esc(route.desc)
  const ogType = route.ogType || 'website'
  let html = shell

  // <title>
  html = swap(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
  // description
  html = swap(html, /<meta name="description"[^>]*>/, `<meta name="description" content="${desc}" />`)
  // canonical
  html = swap(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonical}" />`)
  // Open Graph
  html = swap(html, /<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${ogType}" />`)
  html = swap(html, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonical}" />`)
  html = swap(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}" />`)
  html = swap(html, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${desc}" />`)
  // Twitter
  html = swap(html, /<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${title}" />`)
  html = swap(html, /<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${desc}" />`)
  // Unique crawlable fallback body (for no-JS crawlers / social scrapers)
  html = swap(html, /<main id="seo-fallback">[\s\S]*?<\/main>/, fallbackBody(route))
  // Inject per-route BreadcrumbList JSON-LD just before </head>
  const ld = `<script type="application/ld+json">${JSON.stringify(breadcrumbLd(route))}</script>\n</head>`
  html = html.replace('</head>', ld)

  return html
}

// Priority + changefreq per route type, for the sitemap.
function sitemapMeta(route) {
  if (route.path === '/') return { priority: '1.0', changefreq: 'weekly' }
  if (AREAS.some((a) => a.path === route.path)) return { priority: '0.95', changefreq: 'weekly' }
  if (SERVICE_PAGES.some((s) => s.path === route.path)) return { priority: '0.9', changefreq: 'monthly' }
  if (route.path === '/contact') return { priority: '0.9', changefreq: 'monthly' }
  if (route.path === '/services') return { priority: '0.9', changefreq: 'monthly' }
  if (route.path.startsWith('/blog')) return { priority: '0.8', changefreq: 'monthly' }
  if (route.path === '/gallery') return { priority: '0.8', changefreq: 'monthly' }
  return { priority: '0.7', changefreq: 'monthly' }
}

function buildSitemap(today) {
  const urls = ROUTES.map((route) => {
    const loc = `${SITE}${route.path === '/' ? '/' : route.path}`
    const { priority, changefreq } = sitemapMeta(route)
    return `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`
  }).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>\n`
}

// ── Run ─────────────────────────────────────────────────────────────────────
const shell = readFileSync(join(DIST, 'index.html'), 'utf8')
let count = 0

for (const route of ROUTES) {
  const html = render(shell, route)
  if (route.path === '/') {
    writeFileSync(join(DIST, 'index.html'), html)
  } else {
    const dir = join(DIST, route.path.replace(/^\//, ''))
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), html)
  }
  count++
}

// Auto-generate sitemap.xml from the same route list (single source of truth).
const today = new Date().toISOString().slice(0, 10)
writeFileSync(join(DIST, 'sitemap.xml'), buildSitemap(today))

console.log(`✓ Pre-rendered ${count} routes → dist/**/index.html`)
console.log(`✓ Generated sitemap.xml (${ROUTES.length} URLs, lastmod ${today})`)
