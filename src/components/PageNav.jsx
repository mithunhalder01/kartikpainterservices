import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Home } from 'lucide-react'
import { services } from '../data/data'
import { areaData } from '../data/areas'
import { blogPosts } from '../data/blogPosts'

// Static page labels.
const STATIC_LABELS = {
  services: 'Services',
  gallery: 'Gallery',
  about: 'About',
  contact: 'Contact',
  blog: 'Blog',
}

const titleCase = (slug) =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

// Build the breadcrumb trail for a pathname. Last crumb has no `path` (current page).
function buildCrumbs(pathname) {
  const segs = pathname.split('/').filter(Boolean)
  if (segs.length === 0) return []

  const crumbs = [{ name: 'Home', path: '/' }]

  // Blog: /blog or /blog/:slug
  if (segs[0] === 'blog') {
    if (segs.length === 1) return [...crumbs, { name: 'Blog' }]
    const post = blogPosts.find((p) => p.slug === segs[1])
    return [...crumbs, { name: 'Blog', path: '/blog' }, { name: post?.title || titleCase(segs[1]) }]
  }

  const seg = segs[0]

  // Service page
  const service = services.find((s) => s.slug === seg)
  if (service) {
    return [...crumbs, { name: 'Services', path: '/services' }, { name: service.title }]
  }

  // Area / locality page
  if (areaData[seg]) {
    return [...crumbs, { name: areaData[seg].name }]
  }

  // Static page
  if (STATIC_LABELS[seg]) {
    return [...crumbs, { name: STATIC_LABELS[seg] }]
  }

  // Fallback
  return [...crumbs, { name: titleCase(seg) }]
}

// Rendered INSIDE each page-hero (dark background), directly above the heading.
export default function PageNav() {
  const { pathname } = useLocation()

  // No breadcrumb on the homepage.
  if (pathname === '/') return null

  const crumbs = buildCrumbs(pathname)
  if (crumbs.length === 0) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-5 flex items-center justify-between gap-4"
    >
      {/* Left — Back to Home */}
      <Link
        to="/"
        className="group flex items-center gap-1.5 text-[12px] sm:text-[13px] font-semibold
                   text-white/75 hover:text-white transition-colors flex-shrink-0"
      >
        <ArrowLeft
          size={15}
          className="transition-transform duration-200 group-hover:-translate-x-0.5"
        />
        Back to Home
      </Link>

      {/* Right — breadcrumb path */}
      <ol className="flex items-center gap-1 text-[11px] sm:text-[12px] text-white/45
                     overflow-hidden whitespace-nowrap">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <li key={i} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight size={12} className="text-white/30 flex-shrink-0" />}
              {c.path && !isLast ? (
                <Link
                  to={c.path}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  {i === 0 && <Home size={12} className="flex-shrink-0" />}
                  {c.name}
                </Link>
              ) : (
                <span
                  className={`truncate ${isLast ? 'text-white/90 font-semibold' : ''}`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {c.name}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
