import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Clock, ArrowRight, ArrowUpRight } from 'lucide-react'
import { services, contact, areas, PHONE, WA_NUMBER } from '../data/data'

const nav = [
  {to:'/',label:'Home'},{to:'/services',label:'Services'},
  {to:'/gallery',label:'Gallery'},{to:'/about',label:'About'},
  {to:'/contact',label:'Contact'},
]

const WA = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-white/50">
      {/* CTA band */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-10
                        flex flex-col sm:flex-row items-start sm:items-center
                        justify-between gap-6">
          <div>
            <p className="text-white font-semibold text-xl mb-1">
              Ready to start your project?
            </p>
            <p className="text-white/50 text-sm">
              Free site visit anywhere in Noida and Greater Noida.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <a href={`tel:${PHONE}`}
               className="flex items-center gap-2 bg-white text-dark-900 text-sm font-semibold
                          px-5 py-3 rounded-lg hover:bg-accent-100 transition-colors">
              <Phone size={14}/> {PHONE}
            </a>
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer"
               className="flex items-center gap-2 bg-[#25D366] text-white text-sm font-semibold
                          px-5 py-3 rounded-lg hover:bg-[#20b858] transition-colors">
              <WA/> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-10 border-b border-white/10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-white/10 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">KP</span>
              </div>
              <span className="text-white font-semibold text-sm">Kartik Painter Services</span>
            </div>
            <p className="text-white/40 text-[13px] leading-relaxed mb-5">
              Noida's most trusted painting contractor since 2009. Premium materials, honest pricing.
            </p>
            {/* Stars */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array(5).fill(0).map((_,i) => (
                  <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <span className="text-white/60 text-[12px] font-medium">4.9 · 200+ reviews</span>
            </div>
          </div>

          {/* Nav */}
          <div>
            <p className="text-white/30 text-[10px] font-semibold tracking-[0.15em] uppercase mb-4">
              Navigation
            </p>
            <ul className="space-y-2.5">
              {nav.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to}
                        className="text-white/50 text-[13px] hover:text-white transition-colors
                                   flex items-center gap-1 group">
                    <ArrowRight size={10}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="text-white/30 text-[10px] font-semibold tracking-[0.15em] uppercase mb-4">
              Services
            </p>
            <ul className="space-y-2.5">
              {services.map(s => (
                <li key={s.id}
                    className="text-white/50 text-[13px] flex items-center gap-2">
                  <span className="w-1 h-1 bg-accent rounded-full flex-shrink-0"/>
                  {s.title}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-white/30 text-[10px] font-semibold tracking-[0.15em] uppercase mb-4">
              Contact
            </p>
            <ul className="space-y-3.5">
              {[
                { Icon:Phone, v:contact.phone,   href:`tel:${contact.phone}` },
                { Icon:Mail,  v:contact.email,   href:`mailto:${contact.email}` },
                { Icon:MapPin,v:contact.address,  href:null },
                { Icon:Clock, v:contact.timings,  href:null },
              ].map(({ Icon, v, href }, i) => (
                <li key={i} className="flex gap-2.5 items-start">
                  <Icon size={13} className="text-white/30 mt-0.5 flex-shrink-0"/>
                  {href
                    ? <a href={href}
                         className="text-white/50 text-[12px] hover:text-white/80
                                    transition-colors leading-snug">{v}</a>
                    : <span className="text-white/40 text-[12px] leading-snug">{v}</span>}
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas + Guides */}
          <div>
            <p className="text-white/30 text-[10px] font-semibold tracking-[0.15em] uppercase mb-4">
              Service Areas
            </p>
            <ul className="space-y-2.5">
              {[
                { to: '/noida',         label: 'Painter in Noida'         },
                { to: '/greater-noida', label: 'Painter in Greater Noida' },
                { to: '/dadri',         label: 'Painter in Dadri'         },
                { to: '/ghaziabad',     label: 'Painter in Ghaziabad'     },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to}
                        className="text-white/50 text-[13px] hover:text-white
                                   transition-colors flex items-center gap-1 group">
                    <ArrowUpRight size={10}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="text-white/30 text-[10px] font-semibold tracking-[0.15em]
                          uppercase mt-6 mb-4">
              Guides
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link to="/blog"
                      className="text-white/50 text-[13px] hover:text-white
                                 transition-colors flex items-center gap-1 group">
                  <ArrowUpRight size={10}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                  All Painting Guides
                </Link>
              </li>
              <li>
                <Link to="/blog/painting-cost-noida-2025"
                      className="text-white/50 text-[13px] hover:text-white
                                 transition-colors flex items-center gap-1 group">
                  <ArrowUpRight size={10}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                  Painting Cost in Noida 2025
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Areas */}
        <div className="py-6 border-b border-white/10">
          <p className="text-white/30 text-[10px] font-semibold tracking-[0.15em] uppercase mb-3">
            Service Areas
          </p>
          <div className="flex flex-wrap gap-2">
            {areas.map(a => (
              <span key={a}
                    className="text-[11px] text-white/40 border border-white/10
                               px-2.5 py-1 rounded-md hover:border-white/20 hover:text-white/60
                               transition-colors cursor-default">
                {a}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between gap-2
                        text-[11px] text-white/25">
          <p>© {new Date().getFullYear()} Kartik Painter Services. All rights reserved.</p>
          <p>Professional Painting Contractor · Noida, Uttar Pradesh, India</p>
        </div>
      </div>
    </footer>
  )
}
