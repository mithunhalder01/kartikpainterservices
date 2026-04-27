import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Phone, CheckCircle, MapPin, ChevronRight } from 'lucide-react'
import { services, PHONE, WA_NUMBER } from '../data/data'
import SEO, { buildBreadcrumbSchema } from '../components/SEO'

const serviceFaqs = (serviceName, areaName) => [
  {
    q: `What is the cost of ${serviceName.toLowerCase()} in ${areaName}?`,
    a: `The cost of ${serviceName.toLowerCase()} in ${areaName} depends on the area size and materials used. Contact us at +91 7500770667 for a free, written estimate after a site visit.`,
  },
  {
    q: `How long does ${serviceName.toLowerCase()} take in ${areaName}?`,
    a: `Most ${serviceName.toLowerCase()} projects in ${areaName} are completed within 3-7 days depending on the scope. We provide a written timeline before starting work.`,
  },
  {
    q: `Which paint brands do you use for ${serviceName.toLowerCase()} in ${areaName}?`,
    a: `We use only genuine Asian Paints, Berger Paints, and Dulux products for all ${serviceName.toLowerCase()} work in ${areaName}. No substitutions, no inferior materials.`,
  },
  {
    q: `Do you offer free site visits for ${serviceName.toLowerCase()} in ${areaName}?`,
    a: `Yes, we offer completely free site visits and estimates for ${serviceName.toLowerCase()} across all areas of ${areaName}. Call or WhatsApp +91 7500770667 to book.`,
  },
]

export default function ServicePage() {
  const { slug } = useParams()
  const service = services.find(s => s.slug === slug)

  if (!service) return null

  const faqs = serviceFaqs(service.title, 'Noida')

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${service.title} in Noida`,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Kartik Painter Services',
      telephone: '+917500770667',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Near Sector 45 Metro Station',
        addressLocality: 'Noida',
        addressRegion: 'Uttar Pradesh',
        postalCode: '201301',
        addressCountry: 'IN',
      },
    },
    areaServed: {
      '@type': 'City',
      name: 'Noida',
      containedInPlace: { '@type': 'State', name: 'Uttar Pradesh' },
    },
    description: service.seoDesc,
    offers: {
      '@type': 'Offer',
      price: service.price,
      priceCurrency: 'INR',
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  }

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: service.title, path: `/${service.slug}` },
  ])

  return (
    <>
      <SEO
        title={service.seoTitle}
        description={service.seoDesc}
        canonical={`/${service.slug}`}
        schema={[serviceSchema, faqSchema, breadcrumbSchema]}
        keywords={service.seoKeywords}
        ogImage={service.image}
      />

      {/* ══ HERO ══ */}
      <section className="page-hero py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-accent text-[12px] font-semibold
                          uppercase tracking-widest mb-4">
            <MapPin size={13}/> Noida, Greater Noida, Ghaziabad
          </div>
          <h1 className="text-[clamp(28px,5vw,48px)] font-black text-white
                         leading-tight tracking-tight mb-4 max-w-2xl">
            {service.title} in Noida
          </h1>
          <p className="text-white/55 text-[14px] sm:text-[16px] leading-relaxed mb-8 max-w-xl">
            {service.desc}
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

      {/* ══ SERVICE DETAIL ══ */}
      <section className="bg-white py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden border border-border">
            <img
              src={service.image}
              alt={`${service.title} in Noida by Kartik Painter Services`}
              className="w-full h-[280px] sm:h-[360px] object-cover"
            />
          </div>

          {/* Content */}
          <div>
            <h2 className="text-display-sm font-black text-text-primary mb-4">
              Best {service.title} in Noida
            </h2>
            <p className="text-text-muted text-[14px] sm:text-[15px] leading-relaxed mb-6">
              {service.longDesc}
            </p>

            {/* Features */}
            <h3 className="font-semibold text-text-primary text-[15px] mb-3">
              What You Get
            </h3>
            <ul className="space-y-2.5 mb-8">
              {service.features.map(f => (
                <li key={f} className="flex items-center gap-2.5">
                  <CheckCircle size={14} className="text-accent flex-shrink-0"/>
                  <span className="text-text-secondary text-[13px] sm:text-[14px]">{f}</span>
                </li>
              ))}
            </ul>

            {/* Price */}
            <div className="bg-surface border border-border rounded-xl p-5 mb-6">
              <p className="text-[10px] font-semibold tracking-widest text-text-subtle uppercase mb-1">
                Starting From
              </p>
              <p className="font-bold text-accent text-[22px] sm:text-[26px]">{service.price}</p>
              <p className="text-text-muted text-[12px] mt-1">
                Final price depends on area size and paint selection
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/contact" className="btn-dark text-[14px] px-6 py-3">
                Get Free Quote <ArrowRight size={13}/>
              </Link>
              <a href={`tel:${PHONE}`}
                 className="flex items-center gap-2 bg-white border border-border
                            text-text-primary font-semibold text-[14px] px-6 py-3
                            rounded-xl hover:bg-surface transition-colors">
                <Phone size={14} className="text-accent"/> {PHONE}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ AREAS SERVED FOR THIS SERVICE ══ */}
      <section className="bg-surface py-12 sm:py-16 px-4 sm:px-6 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-display-sm font-black text-text-primary mb-2">
            {service.title} Service Areas in Noida
          </h2>
          <p className="text-text-muted text-[14px] sm:text-[15px] mb-6">
            We provide {service.title.toLowerCase()} services across these Noida sectors and localities.
            Not listed? Call us — we likely cover your area too.
          </p>
          <div className="flex flex-wrap gap-2">
            {service.areas.map(area => (
              <span key={area}
                    className="text-[12px] sm:text-[13px] font-medium text-text-secondary
                               border border-border bg-white px-3 py-1.5 rounded-lg">
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ OTHER SERVICES ══ */}
      <section className="bg-white py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-display-sm font-black text-text-primary mb-6">
            Other Painting Services in Noida
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {services.filter(s => s.id !== service.id).map(s => (
              <Link key={s.id} to={`/${s.slug}`}
                    className="p-4 border border-border rounded-xl bg-surface
                               hover:border-dark hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)]
                               transition-all duration-200 group">
                <p className="font-semibold text-[13px] sm:text-[14px] text-text-primary
                              group-hover:text-accent transition-colors">
                  {s.title}
                </p>
                <p className="text-accent text-[11px] font-semibold mt-1">{s.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="bg-surface py-12 sm:py-16 px-4 sm:px-6 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-display-sm font-black text-text-primary mb-8">
            Frequently Asked Questions — {service.title} in Noida
          </h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="border border-border rounded-xl p-5 bg-white">
                <p className="font-semibold text-text-primary text-[15px] mb-2">{q}</p>
                <p className="text-text-muted text-[14px] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="bg-white py-12 sm:py-16 px-4 sm:px-6 text-center border-b border-border">
        <h2 className="text-display-sm font-black text-text-primary mb-3">
          Ready for {service.title} in Noida?
        </h2>
        <p className="text-text-muted text-[14px] sm:text-[15px] mb-7">
          Free site visit, written estimate, no obligation.
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
          <a href={`tel:${PHONE}`} className="btn-accent text-[14px] px-6 sm:px-7 py-3.5 justify-center">
            <Phone size={15}/> {PHONE}
          </a>
          <Link to="/contact" className="btn-outline text-[14px] px-6 sm:px-7 py-3.5 justify-center">
            Send a Message
          </Link>
        </div>
      </section>
    </>
  )
}

