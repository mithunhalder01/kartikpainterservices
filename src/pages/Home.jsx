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
        title="Painter in Noida – Free Estimate | Kartik Painter Services"
        description="Kartik Painter Services: trusted painter in Noida for interior, exterior, waterproofing and texture painting. 15+ years, 500+ projects. Free estimate."
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

            {/* Headline */}
            <h1 className="font-black text-white leading-[1.04] tracking-tight mb-4
                           text-[clamp(34px,6vw,60px)]">
              Noida's Most<br />
              <span className="relative inline-block">
                <span className="relative z-10 text-amber-400">Trusted Painter.</span>
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

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-7">
              <Link to="/contact"
                className="flex items-center justify-center gap-2
                           bg-amber-500 hover:bg-amber-400 active:scale-[0.98]
                           text-black font-bold text-[14px] sm:text-[15px]
                           px-6 py-4 rounded-xl transition-all duration-200
                           shadow-[0_8px_32px_rgba(245,158,11,0.35)]
                           hover:shadow-[0_10px_44px_rgba(245,158,11,0.55)]
                           hover:-translate-y-0.5">
                Book Free Site Visit
                <ArrowRight size={16} />
              </Link>
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
            {services.map(({ id, Icon, title, shortDesc, price }, i) => (
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
                  <Link to="/contact"
                    className="text-[11px] sm:text-[12px] font-semibold text-text-muted
                                   hover:text-text-primary transition-colors flex items-center gap-1">
                    Quote <ArrowRight size={11} />
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
