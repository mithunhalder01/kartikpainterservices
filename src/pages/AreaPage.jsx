// src/pages/AreaPage.jsx
import { Link } from 'react-router-dom'
import { Phone, MapPin, CheckCircle, ArrowRight } from 'lucide-react'
import SEO from '../components/SEO'
import { services, PHONE, WA_NUMBER } from '../data/data'

const areaData = {
  noida: {
    name: 'Noida',
    title: 'Painter in Noida – Best Painting Contractor | Kartik Painter Services',
    desc: 'Best painter in Noida. Professional interior, exterior & waterproofing painting services. 15+ years, 500+ projects. Free site visit. Call +91 7500770667.',
    h1: 'Painter in Noida',
    sub: 'Professional painting contractor serving all sectors of Noida — Sector 45, 62, 78, 100, 137 and more.',
    keywords: ['painter in noida', 'painting contractor noida', 'best painter noida',
               'interior painter noida', 'house painter noida'],
    sectors: ['Sector 45','Sector 62','Sector 78','Sector 100','Sector 137',
              'Sector 18','Sector 15','Sector 27','Noida Extension','Sector 50'],
  },
  'greater-noida': {
    name: 'Greater Noida',
    title: 'Painter in Greater Noida – Trusted Painting Contractor | Kartik Painter Services',
    desc: 'Professional painter in Greater Noida. Interior, exterior, waterproofing & texture painting. Free estimate. Call +91 7500770667.',
    h1: 'Painter in Greater Noida',
    sub: 'Trusted painting contractor in Greater Noida West, Alpha, Beta, Gamma sectors and Knowledge Park.',
    keywords: ['painter in greater noida', 'painting contractor greater noida',
               'best painter greater noida', 'house painter greater noida'],
    sectors: ['Greater Noida West','Alpha I','Alpha II','Beta I','Beta II',
              'Gamma I','Knowledge Park','Omicron','Chi','Psi'],
  },
  dadri: {
    name: 'Dadri',
    title: 'Painter in Dadri – Professional Painting Services | Kartik Painter Services',
    desc: 'Best painter in Dadri. Interior, exterior & waterproofing painting services. 15+ years experience. Free site visit. Call +91 7500770667.',
    h1: 'Painter in Dadri',
    sub: 'Professional painting contractor serving Dadri, GB Nagar and surrounding areas.',
    keywords: ['painter in dadri', 'painting contractor dadri', 'best painter dadri'],
    sectors: ['Dadri Town','GB Nagar','Sorkha','Bhangel','Barna','Saidpur'],
  },
  ghaziabad: {
    name: 'Ghaziabad',
    title: 'Painter in Ghaziabad – Professional Painting Contractor | Kartik Painter Services',
    desc: 'Trusted painter in Ghaziabad. Interior, exterior, waterproofing & texture painting. 15+ years experience. Free estimate. Call +91 7500770667.',
    h1: 'Painter in Ghaziabad',
    sub: 'Professional painting services across Ghaziabad — Indirapuram, Vaishali, Crossings Republik and more.',
    keywords: ['painter in ghaziabad', 'painting contractor ghaziabad',
               'best painter ghaziabad', 'house painter ghaziabad'],
    sectors: ['Indirapuram','Vaishali','Crossings Republik','Raj Nagar',
              'Kaushambi','Vasundhara','Mohan Nagar'],
  },
}

const localSchema = (area) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: `Painting Services in ${area.name}`,
  provider: {
    '@type': 'LocalBusiness',
    name: 'Kartik Painter Services',
  telephone: '917500770667',
    areaServed: area.name,
  },
  serviceType: 'Painting Contractor',
  areaServed: {
    '@type': 'City',
    name: area.name,
    containedInPlace: { '@type': 'State', name: 'Uttar Pradesh' },
  },
})

export default function AreaPage({ area: areaKey }) {
  const area = areaData[areaKey]
  if (!area) return null

  return (
    <>
      <SEO
        title={area.title}
        description={area.desc}
        canonical={`/${areaKey}`}
        schema={localSchema(area)}
      />

      {/* Hero */}
      <section className="page-hero py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-accent text-[12px] font-semibold
                          uppercase tracking-widest mb-4">
            <MapPin size={13}/> {area.name}, Uttar Pradesh
          </div>
          <h1 className="text-[clamp(28px,5vw,48px)] font-black text-white
                         leading-tight tracking-tight mb-4">
            {area.h1}
          </h1>
          <p className="text-white/55 text-[15px] leading-relaxed mb-8 max-w-xl">
            {area.sub}
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={`tel:${PHONE}`} className="btn-accent text-[14px] px-6 py-3">
              <Phone size={14}/> Call for Free Estimate
            </a>
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer"
               className="flex items-center gap-2 bg-[#25D366] text-white text-[14px]
                          font-semibold px-6 py-3 rounded-lg hover:bg-[#20b858] transition-colors">
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Why us for this area */}
      <section className="bg-white py-14 px-4 sm:px-6 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-[22px] text-text-primary mb-6">
            Why {area.name} Residents Choose Kartik Painter Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              `Serving ${area.name} since 2009 — 15+ years local experience`,
              'Free site visit anywhere in ' + area.name,
              'Same-day response — call or WhatsApp anytime',
              'Only genuine Asian Paints, Berger & Dulux used',
              'Complete on-time delivery with written commitment',
              'Post-work site cleanup included — zero mess',
            ].map(t => (
              <div key={t} className="flex gap-3 p-4 border border-border rounded-xl">
                <CheckCircle size={15} className="text-accent flex-shrink-0 mt-0.5"/>
                <p className="text-text-secondary text-[14px]">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services in this area */}
      <section className="bg-surface py-14 px-4 sm:px-6 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-[22px] text-text-primary mb-6">
            Painting Services in {area.name}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {services.map(({ id, Icon, title, price }) => (
              <div key={id} className="p-4 border border-border rounded-xl bg-white">
                <Icon size={16} className="text-accent mb-2"/>
                <p className="font-semibold text-[14px] text-text-primary">{title}</p>
                <p className="text-accent text-[12px] font-semibold mt-1">{price}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link to="/contact" className="btn-dark text-[14px]">
              Get Free Estimate in {area.name} <ArrowRight size={14}/>
            </Link>
          </div>
        </div>
      </section>

      {/* Areas/sectors covered */}
      <section className="bg-white py-14 px-4 sm:px-6 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-[22px] text-text-primary mb-2">
            Areas We Cover in {area.name}
          </h2>
          <p className="text-text-muted text-[14px] mb-6">
            We serve all major sectors and localities in {area.name}.
            Not listed? Call us — we likely cover your area.
          </p>
          <div className="flex flex-wrap gap-2">
            {area.sectors.map(s => (
              <span key={s}
                    className="text-[13px] font-medium text-text-secondary border border-border
                               bg-surface px-3 py-1.5 rounded-lg">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Local FAQ — SEO keywords */}
      <section className="bg-surface py-14 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-[22px] text-text-primary mb-8">
            Frequently Asked Questions — Painter in {area.name}
          </h2>
          <div className="space-y-4">
            {[
              {
                q: `How much does painting cost in ${area.name}?`,
                a: `Interior painting in ${area.name} starts from ₹8–₹15 per sq.ft. Exterior painting is ₹12–₹20 per sq.ft. We provide a free, written estimate after a free site visit — no hidden charges.`,
              },
              {
                q: `Do you offer free site visits in ${area.name}?`,
                a: `Yes, we offer completely free site visits and estimates across all areas of ${area.name}. Call +91 7500770667 or WhatsApp to book.`,
              },
              {
                q: `How long does painting take in ${area.name}?`,
                a: `A standard 2BHK takes 3–4 days. A 3BHK takes 4–6 days. We give a written completion date before starting work.`,
              },
              {
                q: `Which paint brands do you use in ${area.name}?`,
                a: `We use only genuine Asian Paints, Berger Paints and Dulux — certified products, never substitutes or local brands.`,
              },
            ].map(({ q, a }) => (
              <div key={q} className="border border-border rounded-xl p-5 bg-white">
                <p className="font-semibold text-text-primary text-[15px] mb-2">{q}</p>
                <p className="text-text-muted text-[14px] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
