import { useState, useRef, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Phone, Star, CheckCircle, ChevronRight,
  Shield, Clock, BadgeCheck, Sparkles, MapPin, ChevronsLeftRight
} from 'lucide-react'
import {
  services, testimonials, gallery, stats, process,
  contact, areas, brands, WA_NUMBER
} from '../data/data'
import SEO, { buildBreadcrumbSchema } from '../components/SEO'
import TestimonialSlider from '../components/TestimonialSlider'
import StatsCard from '../components/StatsCard'

/* ─── Updated phone number ─────────────────────────── */
const PHONE = '+91 7500770667'
const PHONE_DISPLAY = '+91 75007 70667'
const BEFORE_IMG = '/before-after/before.png'
const AFTER_IMG = '/before-after/after.png'
const BEFORE_OBJECT_POS = 'center 56%'
const AFTER_OBJECT_POS = 'center 52%'

/* ─── Micro components ─────────────────────────────── */

function StarRow({ n = 5, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={size} className="star-filled" />
      ))}
    </div>
  )
}

function SectionLabel({ children }) {
  return <p className="label">{children}</p>
}

/* ─── Before / After Slider ────────────────────────── */
function BeforeAfterSlider() {
  const [pos, setPos] = useState(50)
  const dragging = useRef(false)
  const containerRef = useRef(null)

  const calcPos = useCallback((clientX) => {
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPos((x / rect.width) * 100)
  }, [])

  const onMouseDown  = (e) => { dragging.current = true; e.preventDefault() }
  const onMouseMove  = useCallback((e) => { if (dragging.current) calcPos(e.clientX) }, [calcPos])
  const onMouseUp    = () => { dragging.current = false }
  const onTouchStart = () => { dragging.current = true }
  const onTouchMove  = useCallback((e) => { if (dragging.current) calcPos(e.touches[0].clientX) }, [calcPos])
  const onTouchEnd   = () => { dragging.current = false }

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend',  onTouchEnd)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend',  onTouchEnd)
    }
  }, [onMouseMove, onTouchMove])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden cursor-col-resize"
      style={{ touchAction: 'none' }}
    >
      {/* AFTER — full width behind */}
      <img
        src={AFTER_IMG}
        alt="After — freshly painted room by Kartik Painter Services"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: AFTER_OBJECT_POS }}
        draggable={false}
      />

      {/* BEFORE — fixed-size image, only mask moves (no squish) */}
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img
          src={BEFORE_IMG}
          alt="Before — old walls before painting"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: BEFORE_OBJECT_POS }}
          draggable={false}
        />
      </div>

      {/* Labels */}
      <span className="absolute top-3 left-3 text-[10px] font-black tracking-widest
                       text-white/90 bg-black/55 backdrop-blur-sm border border-white/15
                       px-2.5 py-1 rounded-md pointer-events-none">
        BEFORE
      </span>
      <span className="absolute top-3 right-3 text-[10px] font-black tracking-widest
                       text-white/90 bg-amber-500/80 backdrop-blur-sm border border-amber-400/40
                       px-2.5 py-1 rounded-md pointer-events-none">
        AFTER
      </span>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.6)]"
        style={{ left: `${pos}%`, transform: 'translateX(-50%)', pointerEvents: 'none' }}
      />

      {/* Drag handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2
                   w-10 h-10 rounded-full bg-white shadow-[0_4px_24px_rgba(0,0,0,0.5)]
                   flex items-center justify-center z-10 cursor-col-resize
                   border-2 border-amber-400 hover:scale-110 active:scale-95
                   transition-transform duration-100"
        style={{ left: `${pos}%` }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <ChevronsLeftRight size={18} className="text-amber-500" strokeWidth={2.5} />
      </div>
    </div>
  )
}

/* Home page FAQs + JSON-LD schema */
const HOME_FAQS = [
  {
    q: 'How much does interior painting cost in Noida?',
    a: 'Interior painting in Noida starts from ₹8 to ₹15 per square foot with Kartik Painter Services, including wall putty, primer and two top coats.',
  },
  {
    q: 'Do you offer free site visits in Noida?',
    a: 'Yes, we offer free site visits and estimates across Noida, Greater Noida, Dadri and surrounding areas. Call +91 7500770667 to book.',
  },
  {
    q: 'Which paint brands do you use?',
    a: 'We use only genuine premium brands — Asian Paints, Berger Paints, Dulux, Nippon Paint and JSW Paints.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: HOME_FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: a,
    },
  })),
}

const homeBreadcrumbSchema = buildBreadcrumbSchema([
  { name: 'Home', path: '/' },
])

export default function Home() {
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <>
      <SEO
        title="Best Painter in Noida – ₹8/sqft | FREE Site Visit | 15+ Years"
        description="Noida mein best painting services chahiye? Kartik Painters dete hain Interior, Exterior & Waterproofing ₹8/sqft se shuru. 15+ years experience. Aaj hi FREE Inspection & Quote payein!"
        canonical="/"
        schema={[faqSchema, homeBreadcrumbSchema]}
      />

      {/* ══ HERO ══ */}
      <section className="relative bg-[#0c0a00] overflow-hidden min-h-[80vh] flex items-center">

        {/* ── Full background image — more visible now ── */}
        <img
          src="/home.jpeg"
          alt="Professional interior painting by Kartik Painter Services Noida"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.22]"
        />

        {/* ── Gradient overlays ── */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c0a00]/98 via-[#0c0a00]/88 to-[#1f1500]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a00] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a00]/80 via-transparent to-transparent" />

        {/* ── Decorative amber blobs ── */}
        <div className="hidden lg:block absolute w-[600px] h-[600px] rounded-full
                        bg-amber-600/10 blur-[120px] -top-40 -right-40 pointer-events-none" />
        <div className="hidden lg:block absolute w-[400px] h-[400px] rounded-full
                        bg-yellow-500/7 blur-[100px] bottom-0 left-0 pointer-events-none" />

        {/* ── Subtle grid texture ── */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* ── Main grid ── */}
        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8
                        py-12 sm:py-16 lg:py-20
                        grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ════ LEFT COLUMN ════ */}
          <div className="fade-up">

            {/* Rating pill */}
            <div className="inline-flex items-center gap-2.5
                            bg-amber-500/12 border border-amber-500/30
                            rounded-full px-3.5 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
              <div className="flex gap-0.5">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} size={10} fill="#f59e0b" stroke="none" />
                ))}
              </div>
              <span className="text-amber-300/80 text-[11px] font-semibold tracking-wide">
                4.9 · 200+ Reviews · Since 2009
              </span>
            </div>

            {/* Headline — SEO Optimized H1 */}
            <h1 className="font-black text-white leading-[1.04] tracking-tight mb-4
                           text-[clamp(34px,6vw,60px)]">
              Top-Rated House<br />
              <span className="relative inline-block">
                <span className="relative z-10 text-amber-400">Painters in Noida</span>
                <svg className="absolute -bottom-1 left-0 w-full" height="8"
                  viewBox="0 0 300 8" preserveAspectRatio="none">
                  <path d="M0 6 Q75 1 150 5 Q225 9 300 4"
                    stroke="#f59e0b" strokeWidth="3"
                    fill="none" strokeLinecap="round" opacity="0.55" />
                </svg>
              </span>
            </h1>

            {/* Sub */}
            <p className="text-white/50 text-[14px] sm:text-[15px] leading-relaxed mb-2 max-w-[460px]">
              Interior · Exterior · Waterproofing · Texture Painting
            </p>
            <p className="text-white/35 text-[13px] leading-relaxed mb-7 max-w-[440px]">
              Free site visit anywhere in Noida, Greater Noida, Dadri &amp; Ghaziabad.
              Written quote — no surprises, no hidden costs.
            </p>

            {/* CTAs — WhatsApp + Call */}
            <div className="flex flex-col sm:flex-row gap-3 mb-7">
              <a href={`https://wa.me/${WA_NUMBER}?text=Hi%20Kartik%20Painters,%20I%20need%20a%20FREE%20quote%20for%20painting%20in%20Noida`}
                 target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2
                           bg-[#25D366] hover:bg-[#20b858] active:scale-[0.98]
                           text-white font-bold text-[14px] sm:text-[15px]
                           px-6 py-4 rounded-xl transition-all duration-200
                           shadow-[0_8px_32px_rgba(37,211,102,0.35)]
                           hover:shadow-[0_10px_44px_rgba(37,211,102,0.55)]
                           hover:-translate-y-0.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Get Free Quote on WhatsApp
              </a>
              <a href={`tel:${PHONE}`}
                className="flex items-center justify-center gap-2
                           bg-white/8 hover:bg-white/14 border border-white/15
                           hover:border-white/30 text-white font-semibold
                           text-[14px] sm:text-[15px]
                           px-6 py-4 rounded-xl transition-all duration-200
                           backdrop-blur-sm">
                <Phone size={15} className="text-amber-400" />
                {PHONE_DISPLAY}
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2.5 mb-8">
              {[
                [BadgeCheck, 'Licensed Contractor'],
                [Clock, 'On-Time Delivery'],
                [Shield, 'Transparent Pricing'],
              ].map(([Icon, t]) => (
                <span key={t}
                  className="flex items-center gap-1.5 text-white/45 text-[12px] font-medium
                             bg-white/4 border border-white/8 px-3 py-1.5 rounded-lg">
                  <Icon size={12} className="text-amber-400 flex-shrink-0" />
                  {t}
                </span>
              ))}
            </div>

            {/* ── Mobile: Before/After slider (replaces old static image strip) ── */}
            <div className="lg:hidden rounded-2xl overflow-hidden border border-white/10
                            shadow-[0_16px_48px_rgba(0,0,0,0.5)] relative h-[200px]">
              <BeforeAfterSlider />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2
                              bg-black/60 backdrop-blur-sm border border-white/15
                              rounded-lg px-3 py-1.5 flex items-center gap-1.5
                              whitespace-nowrap pointer-events-none">
                <ChevronsLeftRight size={12} className="text-amber-400" />
                <span className="text-white/70 text-[10px] font-medium">Drag to compare</span>
              </div>
            </div>

          </div>

          {/* ════ RIGHT COLUMN — desktop only ════ */}
          <div className="hidden lg:flex flex-col gap-4 fade-up d3">

            {/* ── Before/After slider card (replaces old static image card) ── */}
            <div className="relative rounded-2xl overflow-hidden
                            border border-white/10 bg-white/4 backdrop-blur-sm
                            shadow-[0_32px_80px_rgba(0,0,0,0.6)]">

              {/* Slider */}
              <div className="relative h-[260px]">
                <BeforeAfterSlider />
                {/* Drag hint — sits above the slider */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2
                                bg-black/60 backdrop-blur-sm border border-white/15
                                rounded-lg px-3 py-1.5 flex items-center gap-1.5
                                pointer-events-none">
                  <ChevronsLeftRight size={13} className="text-amber-400" />
                  <span className="text-white/70 text-[11px] font-medium whitespace-nowrap">
                    Drag to compare
                  </span>
                </div>
              </div>

              {/* Tags — exactly as before */}
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {['15+ Years', '500+ Projects', 'Free Site Visit',
                    'Asian Paints', 'Berger', 'Dulux'].map(tag => (
                      <span key={tag}
                        className="text-[11px] font-semibold text-white/50
                                 bg-white/6 border border-white/10
                                 px-2.5 py-1 rounded-md">
                        {tag}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            {/* Two mini cards — unchanged */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center
                                justify-center mb-3">
                  <BadgeCheck size={16} className="text-amber-400" />
                </div>
                <p className="text-white font-bold text-[14px] leading-snug mb-1">Free Site Visit</p>
                <p className="text-white/40 text-[12px] leading-relaxed">
                  We inspect &amp; give a written quote. Zero obligation.
                </p>
              </div>

              <div className="bg-white/4 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center
                                justify-center mb-3">
                  <Phone size={15} className="text-white/70" />
                </div>
                <p className="text-white font-bold text-[14px] leading-snug mb-1">Call Anytime</p>
                <a href={`tel:${PHONE}`}
                  className="text-amber-400 text-[12px] font-semibold
                             flex items-center gap-1 hover:text-amber-300 transition-colors">
                  {PHONE_DISPLAY} <ChevronRight size={12} />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24
                        bg-gradient-to-t from-[#0c0a00] to-transparent pointer-events-none" />
      </section>
    

      {/* ══════════════════════════════════════════════
          1.5 PRICING BANNER — Competitor-style
      ══════════════════════════════════════════════ */}
      <div className="bg-amber-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4
                        flex flex-wrap items-center justify-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-black font-black text-[18px] sm:text-[22px]">₹8/sqft</span>
            <span className="text-black/60 text-[12px] sm:text-[13px] font-medium">se shuru</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-black/20" />
          <div className="flex items-center gap-2 text-black text-[12px] sm:text-[13px] font-semibold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            FREE Site Visit & Inspection
          </div>
          <div className="hidden sm:block w-px h-6 bg-black/20" />
          <div className="flex items-center gap-2 text-black text-[12px] sm:text-[13px] font-semibold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Open Now — 8 AM to 8 PM
          </div>
          <div className="hidden sm:block w-px h-6 bg-black/20" />
          <a href={`tel:${PHONE}`}
             className="text-black font-bold text-[12px] sm:text-[13px]
                        bg-white/90 hover:bg-white px-3 py-1.5 rounded-lg
                        transition-colors">
            {PHONE_DISPLAY}
          </a>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          2. TRUST BAR
      ══════════════════════════════════════════════ */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4
                        flex flex-wrap items-center justify-center sm:justify-between gap-3">
          {[
            [BadgeCheck, '15+ Years in Noida'],
            [StarRow, '4.9 Rating — 200+ Reviews', true],
            [Shield, 'Licensed & Insured'],
            [Sparkles, 'Asian Paints · Berger · Dulux'],
          ].map(([Icon, text, isStars], i) => (
            <div key={i} className="flex items-center gap-1.5 text-text-muted text-[12px] sm:text-[13px] font-medium">
              {isStars
                ? <StarRow n={5} size={12} />
                : <Icon size={13} className="text-accent flex-shrink-0" />
              }
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          3. SERVICES — 2 cols on mobile, 3 on desktop
      ══════════════════════════════════════════════ */}
      <section className="bg-white section-py px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12">
            <div>
              <SectionLabel>Services</SectionLabel>
              <h2 className="text-display-md font-black text-text-primary">
                What We Do
              </h2>
            </div>
            <Link to="/services"
              className="text-[13px] font-medium text-text-muted hover:text-text-primary
                             transition-colors flex items-center gap-1 self-start md:self-auto">
              All Services <ChevronRight size={14} />
            </Link>
          </div>

          {/* 2 cols on mobile, 3 on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {services.map(({ id, slug, Icon, title, shortDesc, price }, i) => (
              <div key={id}
                className={`group p-4 sm:p-6 border border-border rounded-xl bg-white
                               hover:border-dark hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)]
                               transition-all duration-200 fade-up d${Math.min(i + 1, 6)}`}>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-surface rounded-lg flex items-center justify-center
                                mb-3 sm:mb-5 group-hover:bg-dark transition-colors duration-200">
                  <Icon size={16}
                    className="text-text-muted group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-[14px] sm:text-[17px] text-text-primary mb-1.5 sm:mb-2 leading-snug">
                  {title}
                </h3>
                <p className="text-text-muted text-[12px] sm:text-[13px] leading-relaxed mb-3 sm:mb-5
                              hidden sm:block">{shortDesc}</p>
                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border">
                  <span className="text-[11px] sm:text-[12px] font-semibold text-accent">{price}</span>
                  <Link to={`/${slug}`}
                    className="text-[11px] sm:text-[12px] font-semibold text-text-muted
                                   hover:text-text-primary transition-colors flex items-center gap-1">
                    Details <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          4. PROCESS — how we work
      ══════════════════════════════════════════════ */}
      <section className="bg-surface section-py px-4 sm:px-6 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <SectionLabel>How It Works</SectionLabel>
            <h2 className="text-display-md font-black text-text-primary">
              Four Simple Steps
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {process.map(({ n, t, d }, i) => (
              <div key={n} className={`fade-up d${i + 1}`}>
                <div className="flex items-center gap-3 mb-3 sm:mb-4 lg:flex-col lg:items-start lg:gap-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-dark rounded-lg flex items-center justify-center
                                  flex-shrink-0 lg:mb-4">
                    <span className="text-white font-bold text-[13px]">{n}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-[14px] sm:text-[15px] text-text-primary mb-1.5 sm:mb-2">{t}</h3>
                <p className="text-text-muted text-[12px] sm:text-[13px] leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          5.5 NOIDA COVERAGE — Local SEO Section
      ══════════════════════════════════════════════ */}
      <section className="bg-surface section-py px-4 sm:px-6 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <SectionLabel>Noida Coverage</SectionLabel>
            <h2 className="text-display-md font-black text-text-primary">
              Best Painter in Noida — All Sectors Covered
            </h2>
            <p className="text-text-muted text-[14px] sm:text-[15px] mt-3 max-w-2xl mx-auto">
              Hum Noida Sector 18, 62, 78, aur poore Noida mein best painting services dete hain.
              From Sector 1 to Sector 168, we cover every corner of Noida with professional painting solutions.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
            {[
              'Noida Sector 18', 'Noida Sector 62', 'Noida Sector 78',
              'Noida Sector 100', 'Noida Sector 137', 'Noida Sector 150',
              'Noida Sector 45', 'Noida Sector 50', 'Noida Sector 15',
              'Noida Sector 22', 'Noida Sector 34', 'Noida Sector 44',
              'Noida Sector 55', 'Noida Sector 63', 'Noida Sector 74',
              'Noida Sector 120',
            ].map(sector => (
              <div key={sector}
                   className="flex items-center gap-2 p-3 bg-white border border-border rounded-lg">
                <MapPin size={13} className="text-accent flex-shrink-0"/>
                <span className="text-[12px] sm:text-[13px] font-medium text-text-secondary">
                  {sector}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-white border border-border rounded-xl p-5 sm:p-6">
            <h3 className="font-semibold text-text-primary text-[15px] sm:text-[16px] mb-3">
              Painting Services Available Across Noida
            </h3>
            <p className="text-text-muted text-[13px] sm:text-[14px] leading-relaxed mb-4">
              Kartik Painter Services is the <strong className="text-text-primary">best painter in Noida</strong> with 15+ years of experience serving residential and commercial clients. We provide interior painting, exterior painting, waterproofing, texture painting, POP work, wood polish, and metal painting across all Noida sectors including Noida Extension, Greater Noida West, and nearby areas like Indirapuram, Vaishali, and Crossings Republik.
            </p>
            <p className="text-text-muted text-[13px] sm:text-[14px] leading-relaxed mb-4">
              <strong className="text-text-primary">नोएडा में बेहतरीन पेंटिंग सेवा:</strong> कार्तिक पेंटर सर्विसेज नोएडा, ग्रेटर नोएडा, दादरी और गाज़ियाबाद में 15+ सालों से पेंटिंग का काम कर रही है। हमारे पास 500+ प्रोजेक्ट्स का अनुभव है और 200+ ग्राहक हमें 5-स्टार रेटिंग दे चुके हैं। घर, ऑफिस, दुकान — हर जगह पेंटिंग सर्विस उपलब्ध। आज ही <strong>FREE साइट विज़िट</strong> बुक करें!
            </p>
            <div className="flex flex-wrap gap-2">
              {['Interior Painting Noida', 'Exterior Painting Noida', 'Waterproofing Noida',
                'Texture Painting Noida', 'POP Work Noida', 'Wood Polish Noida',
                'Commercial Painting Noida', 'Metal Painting Noida'].map(tag => (
                <span key={tag}
                      className="text-[11px] sm:text-[12px] font-medium text-accent
                                 bg-accent/5 border border-accent/20 px-3 py-1.5 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          5. WHY US — split layout
      ══════════════════════════════════════════════ */}
      <section className="section-py px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Image */}
          <div className="img-zoom rounded-2xl overflow-hidden">
            <img
              src="/why-chose.jpeg"
              alt="Professional painting work by Kartik Painter Services"
              className="w-full h-[280px] sm:h-[360px] lg:h-[420px] object-cover"
            />
          </div>

          {/* Content */}
          <div>
            <SectionLabel>Why Choose Us</SectionLabel>
            <h2 className="text-display-md font-black text-text-primary mb-4">
              Quality you can see.
              <br />Honesty you can trust.
            </h2>
            <p className="text-text-muted text-[14px] sm:text-[15px] leading-relaxed mb-6 sm:mb-8">
              We don't cut corners, use inferior materials, or surprise you with extra bills.
              Every project gets the same level of care — whether it's one room or an entire building.
            </p>
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {[
                ['On-Time Delivery', 'The date we commit to is the date we deliver. No excuses.'],
                ['Premium Brands Only', 'Genuine Asian Paints, Berger and Dulux — verified, never substituted.'],
                ['Transparent Quotes', 'Full written estimate before work starts. No hidden charges.'],
                ['Clean Site Guarantee', 'We protect your furniture and leave the space spotless.'],
              ].map(([t, d]) => (
                <div key={t} className="flex gap-3">
                  <CheckCircle size={15} className="text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-text-primary text-[13px] sm:text-[14px]">{t}</span>
                    <span className="text-text-muted text-[12px] sm:text-[13px]"> — {d}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact" className="btn-dark text-[14px]">
                Book Free Site Visit <ArrowRight size={14} />
              </Link>
              <Link to="/about"
                className="text-[14px] font-medium text-text-muted hover:text-text-primary
                               transition-colors flex items-center gap-1">
                About Us <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
              <StatsCard />

      {/* ══════════════════════════════════════════════
          6. GALLERY PREVIEW
      ══════════════════════════════════════════════ */}
      <section className="bg-surface section-py px-4 sm:px-6 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <SectionLabel>Portfolio</SectionLabel>
              <h2 className="text-display-md font-black text-text-primary">Recent Work</h2>
            </div>
            <div className="flex gap-4 self-start md:self-auto">
              <Link to="/gallery"
                className="text-[13px] font-medium text-text-muted hover:text-text-primary
                               transition-colors flex items-center gap-1">
                View All <ChevronRight size={14} />
              </Link>
              <Link to="/blog/painting-cost-noida-2025"
                className="text-[13px] font-medium text-text-muted hover:text-text-primary
                               transition-colors flex items-center gap-1">
                Pricing Guide <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Mobile-safe layout: explicit heights prevent Safari grid span glitches */}
          <div className="grid grid-cols-2 md:grid-cols-12 md:grid-rows-2 gap-3 md:h-[360px]">
            <div className="gallery-item col-span-2 md:col-span-5 md:row-span-2 h-52 md:h-auto rounded-xl img-zoom">
              <img src={gallery[0].src} alt={gallery[0].label}
                className="w-full h-full object-cover" />
              <div className="overlay">
                <span className="text-[10px] font-semibold uppercase tracking-widest
                                 text-white/60 mb-1">{gallery[0].cat}</span>
                <p>{gallery[0].label}</p>
              </div>
            </div>
            {gallery.slice(1, 5).map(g => (
              <div key={g.id}
                className="gallery-item col-span-1 md:col-span-3 h-36 md:h-auto rounded-xl img-zoom">
                <img src={g.src} alt={g.label} className="w-full h-full object-cover" />
                <div className="overlay">
                  <p>{g.label}</p>
                </div>
                <div className="absolute top-2 left-2 bg-dark/75 text-white/90 text-[10px]
                                font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide">
                  {g.cat}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          7. TESTIMONIALS
      ══════════════════════════════════════════════ */}
      <section className="bg-white section-py px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12">
            <div>
              <SectionLabel>Reviews</SectionLabel>
              <h2 className="text-display-md font-black text-text-primary">
                What clients say
              </h2>
            </div>
            <div className="flex items-center gap-3 self-start md:self-auto">
              <StarRow n={5} size={14} />
              <span className="text-text-muted text-[13px] font-medium">4.9 / 5.0</span>
            </div>
          </div>
          <TestimonialSlider items={testimonials} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          8. AREAS SERVED — local SEO section
      ══════════════════════════════════════════════ */}
      <section className="bg-surface section-py px-4 sm:px-6 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-8 sm:mb-10">
            <SectionLabel>Service Areas</SectionLabel>
            <h2 className="text-display-md font-black text-text-primary">
              Where We Work
            </h2>
            <p className="text-text-muted text-[14px] sm:text-[15px] mt-3">
              We cover Noida, Greater Noida, Dadri, Ghaziabad and nearby areas.
              Not listed? Call us — we probably cover your area too.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mb-8 sm:mb-10">
            {areas.map(a => {
              const slug = a.toLowerCase().replace(/\s+/g, '-')
              const hasPage = ['noida', 'greater-noida', 'dadri', 'ghaziabad'].includes(slug)
              return hasPage ? (
                <Link key={a} to={`/${slug}`}
                  className="text-[12px] sm:text-[13px] font-medium text-text-secondary border border-border
                                 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white hover:border-dark
                                 hover:text-text-primary transition-colors">
                  {a}
                </Link>
              ) : (
                <span key={a}
                  className="text-[12px] sm:text-[13px] font-medium text-text-secondary border border-border
                                 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white cursor-default">
                  {a}
                </span>
              )
            })}
          </div>
          {/* Brands */}
          <div className="section-divider pt-6 sm:pt-8">
            <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-text-subtle mb-3 sm:mb-4">
              Paint brands we use
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {brands.map(b => (
                <span key={b}
                  className="text-[12px] sm:text-[13px] font-medium text-text-secondary border border-border
                                 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          9. FAQ
      ══════════════════════════════════════════════ */}
      <section className="bg-white section-py px-4 sm:px-6 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="text-display-md font-black text-text-primary">
              Common Questions
            </h2>
          </div>

          <div className="space-y-3">
            {HOME_FAQS.map(({ q, a }, i) => {
              const isOpen = openFaq === i
              return (
                <div key={q} className="rounded-xl border border-border bg-surface overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : i)}
                    className="w-full px-4 sm:px-6 py-4 text-left flex items-center justify-between gap-3"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                  >
                    <span className="font-semibold text-text-primary text-[14px] sm:text-[16px]">
                      {q}
                    </span>
                    <ChevronRight
                      size={16}
                      className={`text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                    />
                  </button>

                  <div
                    id={`faq-panel-${i}`}
                    className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-4 sm:px-6 pb-4 sm:pb-5 text-text-muted text-[13px] sm:text-[14px] leading-relaxed">
                        {a}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          10. FINAL CTA
      ══════════════════════════════════════════════ */}
      <section className="bg-dark-900 section-py px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/40 text-[11px] font-semibold tracking-[0.2em] uppercase mb-4">
            Free — No Obligation
          </p>
          <h2 className="text-display-lg font-black text-white mb-4">
            Ready to transform
            <br />your space?
          </h2>
          <p className="text-white/50 text-[14px] sm:text-[16px] mb-8 sm:mb-10">
            Free site visit and detailed estimate — anywhere in Noida, Greater Noida, Dadri and Ghaziabad.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
            <a href={`tel:${PHONE}`}
              className="btn-accent text-[14px] sm:text-[15px] px-6 sm:px-8 py-3.5 sm:py-4">
              <Phone size={15} /> {PHONE_DISPLAY}
            </a>
            <Link to="/contact" className="btn-outline-inv text-[14px] sm:text-[15px] px-6 sm:px-8 py-3.5 sm:py-4">
              Send a Message
            </Link>
          </div>
        </div>
      </section>

      {/* ══ NO MOBILE STICKY BAR — removed as requested ══ */}
    </>
  )
}
