import { Link } from 'react-router-dom'
import { ArrowRight, Phone, Check } from 'lucide-react'
import { services, process, contact, PHONE } from '../data/data'
import SEO from '../components/SEO'

const servicesSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Painting Services by Kartik Painter Services',
  itemListElement: services.map((s, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: s.title,
    description: s.desc,
    url: `https://kartikpainterservices.com/services#${s.slug}`,
  })),
}

export default function Services() {
  return (
    <>
      <SEO
        title="Painting Services in Noida – Interior, Exterior, Waterproofing"
        description="Professional painting services in Noida: Interior painting, exterior painting, waterproofing, texture painting, commercial painting and POP work. Free estimate by Kartik Painter Services."
        canonical="/services"
        schema={servicesSchema}
      />

      {/* Hero */}
      <section className="page-hero py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <p className="label text-accent-300">Services</p>
          <h1 className="text-display-lg font-black text-white max-w-xl mb-3 sm:mb-4">
            Every surface,
            <br/>perfectly finished.
          </h1>
          <p className="text-white/55 text-[14px] sm:text-[16px] max-w-lg font-medium">
            From a single room repaint to full-building waterproofing — one team, one standard.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="bg-white py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
          {services.map(({ id, slug, Icon, title, desc, price, image }, i) => (
            <div key={id} id={slug}
                 className={`grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-2xl
                             border border-border hover:border-dark
                             hover:shadow-[0_4px_32px_rgba(0,0,0,0.08)]
                             transition-all duration-200 fade-up d${Math.min(i+1,6)}`}>
              <div className={`img-zoom w-full aspect-[16/10] ${i%2!==0?'lg:order-2':''}`}>
                <img src={image} alt={`${title} in Noida by Kartik Painter Services`}
                     className="w-full h-full object-cover"/>
              </div>
              <div className={`p-5 sm:p-7 lg:p-12 flex flex-col justify-center ${i%2!==0?'lg:order-1':''}`}>
                <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 bg-surface rounded-lg flex items-center justify-center">
                    <Icon size={16} className="text-text-muted"/>
                  </div>
                  <h2 className="font-bold text-[18px] sm:text-[22px] text-text-primary">{title}</h2>
                </div>
                <p className="text-text-muted text-[13px] sm:text-[14px] leading-relaxed mb-4 sm:mb-5">{desc}</p>
                <ul className="space-y-1.5 sm:space-y-2 mb-5 sm:mb-6">
                  {['Premium certified brands','Full surface preparation','Post-work site cleanup'].map(pt => (
                    <li key={pt} className="flex items-center gap-2 text-[12px] sm:text-[13px] text-text-secondary">
                      <Check size={13} className="text-accent flex-shrink-0"/>
                      {pt}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between
                                gap-4 pt-4 sm:pt-5 border-t border-border">
                  <div>
                    <p className="text-[10px] font-semibold tracking-widest text-text-subtle uppercase mb-1">
                      Starting From
                    </p>
                    <p className="font-bold text-accent text-[18px] sm:text-[20px]">{price}</p>
                  </div>
                  <Link to="/contact" className="btn-dark w-full sm:w-auto justify-center text-[13px] px-5 py-2.5">
                    Get Quote <ArrowRight size={13}/>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-surface border-y border-border py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-9 sm:mb-12">
            <p className="label">Process</p>
            <h2 className="text-display-sm font-black text-text-primary">How it works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {process.map(({ n, t, d }) => (
              <div key={n} className="bg-white rounded-xl p-5 sm:p-6 border border-border">
                <span className="font-black text-[34px] sm:text-[40px] text-border leading-none block mb-3 sm:mb-4">{n}</span>
                <p className="font-semibold text-[14px] sm:text-[15px] text-text-primary mb-2">{t}</p>
                <p className="text-text-muted text-[12px] sm:text-[13px] leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-12 sm:py-16 px-4 sm:px-6 text-center border-b border-border">
        <h2 className="text-display-sm font-black text-text-primary mb-3">
          Have a project in mind?
        </h2>
        <p className="text-text-muted text-[14px] sm:text-[15px] mb-7 sm:mb-8">Free site visit, no obligation.</p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center max-w-md sm:max-w-none mx-auto">
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
