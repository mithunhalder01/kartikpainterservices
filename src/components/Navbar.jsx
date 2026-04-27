import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Phone, MapPin, ChevronDown,
         Home as HomeIcon, Layers, Droplets, Sparkles,
         PaintBucket, Briefcase, ArrowRight } from 'lucide-react'

const PHONE     = '+917500770667'
const PHONE_RAW = '+91 75007 70667'

const links = [
  { to: '/',        label: 'Home'    },
  { to: '/blog',    label: 'Blog'    },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about',   label: 'About'   },
  { to: '/contact', label: 'Contact' },
]

const serviceLinks = [
  { to: '/interior-painting',      icon: HomeIcon,    label: 'Interior Painting', desc: 'Rooms, halls & ceilings'   },
  { to: '/exterior-painting',      icon: Layers,      label: 'Exterior Painting', desc: 'Facades & boundary walls'  },
  { to: '/waterproofing',          icon: Droplets,    label: 'Waterproofing',     desc: 'Terrace, bathroom & more'  },
  { to: '/texture-painting',       icon: Sparkles,    label: 'Texture Painting',  desc: 'Designer wall finishes'    },
  { to: '/wood-polish',            icon: PaintBucket, label: 'Wood Polish',       desc: 'Doors, railings & furniture' },
  { to: '/commercial-painting',    icon: Briefcase,   label: 'Commercial Painting', desc: 'Offices & shops'         },
  { to: '/pop-wall-putty',         icon: Layers,      label: 'POP & Wall Putty',   desc: 'False ceilings & putty'   },
  { to: '/metal-painting',         icon: Layers,      label: 'Metal Painting',     desc: 'Gates, grills & railings' },
  { to: '/stencil-wall-art',       icon: Sparkles,    label: 'Stencil & Wall Art',  desc: 'Custom wall designs'     },
]

const SCROLL_DELTA      = 8
const HIDE_BAR_AFTER    = 120
const SHOW_BAR_AT_TOP   = 32

export default function Navbar() {
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showBar, setShowBar]   = useState(true)
  const [logoFailed, setLogoFailed] = useState(false)
  const [servHover, setServHover] = useState(false)  // desktop hover
  const [servMob, setServMob]   = useState(false)    // mobile accordion
  const lastScrollY             = useRef(0)
  const showBarRef              = useRef(true)
  const tickingRef              = useRef(false)
  const hoverTimeout            = useRef(null)
  const dropdownRef             = useRef(null)
  const { pathname }            = useLocation()

  useEffect(() => {
    const setBarVisibility = (visible) => {
      if (showBarRef.current === visible) return
      showBarRef.current = visible
      setShowBar(visible)
    }

    const fn = () => {
      if (tickingRef.current) return
      tickingRef.current = true

      window.requestAnimationFrame(() => {
        const current = window.scrollY <= 0 ? 0 : window.scrollY
        const prev = lastScrollY.current
        const delta = current - prev

        setScrolled(current > 40)

        if (current <= SHOW_BAR_AT_TOP) {
          setBarVisibility(true)
        } else if (Math.abs(delta) >= SCROLL_DELTA) {
          if (delta > 0 && current > HIDE_BAR_AFTER) setBarVisibility(false)
          if (delta < 0) setBarVisibility(true)
        }

        lastScrollY.current = current
        tickingRef.current = false
      })
    }

    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => {
      window.removeEventListener('scroll', fn)
      tickingRef.current = false
    }
  }, [])

  useEffect(() => {
    setOpen(false)
    setServMob(false)
    showBarRef.current = true
    setShowBar(true)
  }, [pathname])

  /* ── hover helpers with small delay so dropdown doesn't flicker ── */
  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout.current)
    setServHover(true)
  }
  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setServHover(false), 120)
  }

  const isServicesActive = pathname.startsWith('/services')

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow duration-200
      ${scrolled ? 'shadow-[0_1px_12px_rgba(0,0,0,0.08)]' : 'border-b border-border'}`}>

      {/* ── ANNOUNCEMENT BAR ── */}
      <div className={`bg-dark-900 overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out
                       ${showBar ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-1.5
                        flex flex-col sm:flex-row items-center justify-between gap-0.5 sm:gap-0">
          <span className="flex items-center gap-1 text-white/55 text-[10.5px] sm:text-[11px] font-medium">
            <MapPin size={10} className="text-accent-300 flex-shrink-0" />
            Serving Noida · Greater Noida · Dadri · Ghaziabad
          </span>
          <a href={`tel:${PHONE}`}
             className="text-accent-200 hover:text-white transition-colors font-medium
                        flex items-center gap-1 text-[10.5px] sm:text-[11px]">
            <Phone size={10} /> {PHONE_RAW} — Free Estimate
          </a>
        </div>
      </div>

      {/* ── MAIN NAV ── */}
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex flex-col items-start leading-none">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {!logoFailed ? (
              <img
                src="/logo.png"
                alt="Kartik Painter Services roller logo"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain flex-shrink-0"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-dark rounded-md
                              flex items-center justify-center flex-shrink-0 overflow-hidden">
                <span className="text-white font-bold text-[14px] tracking-tight">KP</span>
              </div>
            )}

            <div className="flex flex-col leading-none">
              <span className="font-brand font-bold text-[21px] sm:text-[27px] leading-[0.86]
                               tracking-[0.022em] text-[#0B2740] uppercase whitespace-nowrap">
                Kartik
              </span>
              <span className="font-brandSans text-[7px] sm:text-[8.5px] font-bold
                               tracking-[0.24em] uppercase text-[#0B2740] mt-0.5 whitespace-nowrap">
                Painter Services
              </span>
            </div>
          </div>
          <span className="font-brandSans text-[8px] sm:text-[9px] font-semibold
                           tracking-[0.16em] uppercase text-text-muted mt-1">
            Noida's Trusted Contractor
          </span>
        </Link>

        {/* ── Desktop Links ── */}
        <div className="hidden md:flex items-center gap-0.5">

          <Link to="/"
            className={`px-4 py-2 text-[13px] font-medium rounded-md transition-colors
              ${pathname === '/'
                ? 'text-text-primary bg-surface'
                : 'text-text-muted hover:text-text-primary hover:bg-surface'}`}>
            Home
          </Link>

          {/* ── Services — hover opens dropdown, click goes to /services ── */}
          <div className="relative"
               ref={dropdownRef}
               onMouseEnter={handleMouseEnter}
               onMouseLeave={handleMouseLeave}>

            {/* Services link + chevron side by side */}
            <div className={`flex items-center rounded-md transition-colors
                             ${isServicesActive ? 'bg-surface' : 'hover:bg-surface'}`}>

              {/* Click → /services page */}
              <Link to="/services"
                className={`pl-4 pr-1 py-2 text-[13px] font-medium transition-colors
                            ${isServicesActive ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'}`}>
                Services
              </Link>

              {/* Chevron — just visual, hover handles dropdown */}
              <span className="pr-2.5 py-2 flex items-center">
                <ChevronDown size={13}
                  className={`text-text-muted transition-transform duration-200
                              ${servHover ? 'rotate-180' : ''}`} />
              </span>
            </div>

            {/* Dropdown panel */}
            {servHover && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5
                              w-[300px] bg-white border border-border rounded-xl
                              shadow-[0_8px_32px_rgba(0,0,0,0.10)] overflow-hidden z-50">
                <div className="p-2">
                  {serviceLinks.map(({ to, icon: Icon, label, desc }) => (
                    <Link key={to} to={to}
                      onClick={() => setServHover(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg
                                 hover:bg-surface transition-colors group">
                      <div className="w-8 h-8 bg-surface group-hover:bg-white rounded-lg
                                      flex items-center justify-center flex-shrink-0
                                      border border-border transition-colors">
                        <Icon size={14} className="text-text-muted group-hover:text-accent transition-colors" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-text-primary leading-none mb-0.5">
                          {label}
                        </p>
                        <p className="text-[11px] text-text-muted">{desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-border px-4 py-3 flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">All painting services</span>
                  <Link to="/services"
                    onClick={() => setServHover(false)}
                    className="flex items-center gap-1 text-[12px] font-semibold
                               text-accent hover:text-accent-600 transition-colors">
                    View All <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {links.filter(l => l.to !== '/').map(({ to, label }) => (
            <Link key={to} to={to}
              className={`px-4 py-2 text-[13px] font-medium rounded-md transition-colors
                ${pathname === to
                  ? 'text-text-primary bg-surface'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface'}`}>
              {label}
            </Link>
          ))}

          <a href={`tel:${PHONE}`}
             className="ml-3 btn-accent text-[13px] px-5 py-2.5 flex items-center gap-1.5">
            <Phone size={13} /> Call Now
          </a>
        </div>

        {/* Hamburger */}
        <button onClick={() => setOpen(!open)}
                className="md:hidden p-2 text-text-muted hover:text-text-primary
                           hover:bg-surface rounded-md transition-colors"
                aria-label="Menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* ── MOBILE DRAWER ── */}
      {open && (
        <div className="md:hidden bg-white border-t border-border">
          <div className="px-4 py-4 space-y-1">

            <Link to="/"
              className={`flex items-center py-3 px-3 rounded-md text-[15px] font-medium
                          transition-colors
                ${pathname === '/' ? 'text-text-primary bg-surface' : 'text-text-muted'}`}>
              Home
            </Link>

            {/* ── Mobile Services: text → page, arrow → accordion ── */}
            <div>
              <div className={`flex items-center rounded-md transition-colors
                               ${isServicesActive ? 'bg-surface' : ''}`}>

                {/* "Services" text → go to /services */}
                <Link to="/services"
                  className={`flex-1 py-3 pl-3 text-[15px] font-medium transition-colors
                    ${isServicesActive ? 'text-text-primary' : 'text-text-muted'}`}>
                  Services
                </Link>

                {/* Arrow → toggle accordion */}
                <button
                  onClick={() => setServMob(p => !p)}
                  className="px-3 py-3 text-text-muted hover:text-text-primary transition-colors">
                  <ChevronDown size={17}
                    className={`transition-transform duration-200 ${servMob ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {servMob && (
                <div className="ml-3 mt-1 border-l-2 border-border pl-3 space-y-0.5 pb-1">
                  {serviceLinks.map(({ to, icon: Icon, label }) => (
                    <Link key={to} to={to}
                      className="flex items-center gap-2.5 py-2.5 px-2 rounded-md
                                 text-[14px] text-text-muted hover:text-text-primary
                                 transition-colors">
                      <Icon size={13} className="text-accent flex-shrink-0" />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {links.filter(l => l.to !== '/').map(({ to, label }) => (
              <Link key={to} to={to}
                className={`flex items-center py-3 px-3 rounded-md text-[15px] font-medium
                            transition-colors
                  ${pathname === to ? 'text-text-primary bg-surface' : 'text-text-muted'}`}>
                {label}
              </Link>
            ))}
          </div>

          <div className="px-4 pb-5 flex gap-3">
            <a href={`tel:${PHONE}`}
               className="btn-accent flex-1 text-[13px] py-3 justify-center">
              <Phone size={14} /> Call Now
            </a>
            <Link to="/contact" className="btn-dark flex-1 text-[13px] py-3 justify-center">
              Free Estimate
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
