// src/components/LeadPopup.jsx
import { useState, useEffect, useRef } from 'react'
import { X, Phone, CheckCircle, Home } from 'lucide-react'
import { WA_NUMBER } from '../data/data'

const STORAGE_KEY = 'kps_popup_v2'
const MAX_SHOWS   = 3
const SCROLL_PCT  = 30
const RESHW_DAYS  = 3
const TIME_DELAY  = 12000 // 12 seconds fallback trigger

const WA = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export default function LeadPopup() {
  const [visible, setVisible] = useState(false) // ← false: scroll pe trigger hoga
  const [phone, setPhone]     = useState('')
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)
  const triggered             = useRef(false)

  // ── Scroll trigger + time fallback ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const { count, ts } = JSON.parse(raw)
        if (count >= MAX_SHOWS) return
        const days = (Date.now() - ts) / 86400000
        if (days < RESHW_DAYS) return
      }
    } catch (_) {}

    let timerId = null

    const showPopup = () => {
      if (triggered.current) return
      triggered.current = true
      window.removeEventListener('scroll', onScroll)
      if (timerId) clearTimeout(timerId)
      setVisible(true)

      try {
        const raw  = localStorage.getItem(STORAGE_KEY)
        const prev = raw ? JSON.parse(raw) : { count: 0 }
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ count: (prev.count || 0) + 1, ts: Date.now() })
        )
      } catch (_) {}
    }

    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      if (total <= 0) return
      const pct = (window.scrollY / total) * 100
      if (pct >= SCROLL_PCT) showPopup()
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    // Time fallback: show after 12s if scroll hasn't triggered
    timerId = setTimeout(() => {
      showPopup()
    }, TIME_DELAY)

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (timerId) clearTimeout(timerId)
    }
  }, [])

  // ── Lock body scroll when open ──
  useEffect(() => {
    document.body.style.overflow = visible ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [visible])

  const close = () => {
    setVisible(false)
    setPhone('')
    setError('')
    setSent(false)
  }

  const submit = () => {
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit number')
      return
    }
    setError('')
    setSent(true)
    setTimeout(() => {
      window.open(
        `https://wa.me/${WA_NUMBER}?text=Hello%2C+I+need+a+free+painting+estimate.+My+number+is+%2B91+${phone}`,
        '_blank'
      )
    }, 900)
    setTimeout(close, 2600)
  }

  if (!visible) return null

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[3px] z-[100]"
        style={{ animation: 'kpsfd .22s ease' }}
        onClick={close}
      />

      {/* ── Centered wrapper ── */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="w-full max-w-[440px] bg-[#111111] border border-white/[0.08]
                     rounded-2xl overflow-hidden
                     shadow-[0_32px_80px_rgba(0,0,0,0.75)]"
          style={{ animation: 'kpssu .36s cubic-bezier(0.16,1,0.3,1)' }}
          onClick={e => e.stopPropagation()}
        >

          {/* ── Top row: brand + close ── */}
          <div className="flex items-center justify-between px-5 pt-5 pb-0">
            <div className="flex items-center gap-2.5">
              <div className="w-[30px] h-[30px] bg-accent rounded-lg flex items-center
                              justify-center font-bold text-white text-[12px]">
                KP
              </div>
              <span className="text-white/60 text-[13px] font-medium">
                Kartik Painter Services
              </span>
            </div>
            <button
              onClick={close}
              className="w-[30px] h-[30px] rounded-full bg-white/[0.07] flex items-center
                         justify-center hover:bg-white/[0.12] transition-colors"
              aria-label="Close"
            >
              <X size={14} className="text-white/60" />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="px-5 pt-5 pb-6">
            {sent ? (
              /* Success state */
              <div className="text-center py-5">
                <div className="w-14 h-14 bg-green-500/[0.12] rounded-full flex items-center
                                justify-content mx-auto mb-4 flex-col justify-center">
                  <CheckCircle size={28} className="text-green-400 mx-auto" />
                </div>
                <p className="text-white font-bold text-[20px] mb-2">
                  We'll call you shortly!
                </p>
                <p className="text-white/40 text-[13px] leading-relaxed">
                  Our team will reach out within the hour.
                </p>
              </div>
            ) : (
              <>
                {/* Tag */}
                <div className="inline-flex items-center gap-2 bg-accent/[0.12]
                                border border-accent/25 rounded-md px-3 py-1.5 mb-4">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <span className="text-accent text-[11px] font-semibold tracking-wide">
                    Free — No Obligation
                  </span>
                </div>

                <h2 className="text-white font-black text-[22px] sm:text-[24px]
                               leading-[1.15] tracking-tight mb-2">
                  Get a Free<br />Painting Estimate
                </h2>
                <p className="text-white/40 text-[13px] leading-relaxed mb-5">
                  Enter your number — we call within the hour.
                  No spam. No pressure.
                </p>

                {/* Input */}
                <div className="flex gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 bg-white/[0.06]
                                  border border-white/[0.1] rounded-xl px-3 flex-shrink-0">
                    <span className="text-[16px]">🇮🇳</span>
                    <span className="text-white/50 text-[12px] font-medium">+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="Phone number"
                    maxLength={10}
                    autoFocus
                    className="flex-1 min-w-0 bg-white/[0.06] border border-white/[0.1]
                               rounded-xl px-4 py-3 text-white text-[14px]
                               placeholder-white/25 outline-none
                               focus:border-accent transition-colors"
                    value={phone}
                    onChange={e => {
                      setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                      setError('')
                    }}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                  />
                </div>

                {/* Error */}
                <p className="text-red-400 text-[11.5px] mb-3 min-h-[16px]">
                  {error}
                </p>

                {/* Primary CTA */}
                <button
                  onClick={submit}
                  className="w-full bg-accent text-white font-bold text-[14px]
                             py-3.5 rounded-xl mb-2.5 flex items-center justify-center gap-2
                             hover:bg-accent-600 active:scale-[0.98] transition-all"
                >
                  <Phone size={15} /> Book Free Visit
                </button>

                {/* WhatsApp CTA */}
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=Hello%2C+I+need+a+free+painting+estimate`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-[#25D366] text-white font-semibold text-[13px]
                             py-3 rounded-xl flex items-center justify-center gap-2
                             hover:bg-[#20b858] active:scale-[0.98] transition-all"
                >
                  <WA /> WhatsApp Instead
                </a>

                {/* Trust grid */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4
                                border-t border-white/[0.07]">
                  {[
                    ['check', '15+ Years Exp.'],
                    ['star',  '4.9 Google Rating'],
                    ['shield','No Hidden Charges'],
                    ['clock', 'Free Site Visit'],
                  ].map(([type, label]) => (
                    <div key={label}
                         className="flex items-center gap-1.5 text-white/30 text-[11.5px]">
                      {type === 'star' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#E07A3A">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ) : type === 'check' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                             stroke="#E07A3A" strokeWidth="2">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      ) : type === 'shield' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                             stroke="#E07A3A" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                             stroke="#E07A3A" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 6v6l4 2"/>
                        </svg>
                      )}
                      {label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}