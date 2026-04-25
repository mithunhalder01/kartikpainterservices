import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone } from 'lucide-react'
import { gallery, PHONE } from '../data/data'
import SEO, { buildBreadcrumbSchema } from '../components/SEO'

const CATS = ['All','Interior','Exterior','Texture','Commercial']

const gallerySchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Painting Portfolio in Noida',
  description: 'Real painting project photos by Kartik Painter Services in Noida and nearby areas.',
  url: 'https://kartikpainterservices.vercel.app/gallery',
}

const galleryBreadcrumbSchema = buildBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Gallery', path: '/gallery' },
])

export default function Gallery() {
  const [active, setActive] = useState('All')
  const filtered = active==='All' ? gallery : gallery.filter(g=>g.cat===active)

  return (
    <>
      <SEO
        title="Painting Portfolio – Real Work in Noida"
        description="Browse 500+ completed painting projects by Kartik Painter Services in Noida. Real photos of interior, exterior, texture and commercial painting work."
        canonical="/gallery"
        schema={[gallerySchema, galleryBreadcrumbSchema]}
      />

      <section className="page-hero py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="label text-accent-300">Portfolio</p>
          <h1 className="text-display-lg font-black text-white mb-3">Our Work</h1>
          <p className="text-white/50 text-[16px]">
            Every photo is real work by our team — no stock images.
          </p>
        </div>
      </section>

      <section className="bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-10 border-b border-border pb-6 items-center">
            {CATS.map(c => (
              <button key={c} onClick={()=>setActive(c)}
                className={`px-4 py-2 text-[13px] font-medium rounded-lg border transition-all
                  ${active===c
                    ? 'bg-dark text-white border-dark'
                    : 'border-border text-text-muted hover:border-dark hover:text-text-primary'}`}>
                {c}
              </button>
            ))}
            <span className="ml-auto text-[13px] text-text-subtle">{filtered.length} projects</span>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
            {filtered.map((g, i) => (
              <div key={g.id}
                   className="gallery-item break-inside-avoid rounded-xl overflow-hidden
                              shadow-[0_1px_4px_rgba(0,0,0,0.08)] fade-up"
                   style={{ animationDelay:`${i*0.04}s` }}>
                <img src={g.src} alt={`${g.label} – Kartik Painter Services Noida`}
                     className="w-full block img-zoom"/>
                <div className="overlay">
                  <p>{g.label}</p>
                </div>
                <div className="absolute top-2.5 left-2.5 bg-dark/70 text-white/90 text-[10px]
                                font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md">
                  {g.cat}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface border-t border-border py-16 px-6 text-center">
        <h2 className="text-display-sm font-black text-text-primary mb-3">Like what you see?</h2>
        <p className="text-text-muted text-[15px] mb-8">Free estimate, no commitment required.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href={`tel:${PHONE}`} className="btn-accent text-[14px]">
            <Phone size={14}/> Call Now
          </a>
          <Link to="/contact" className="btn-outline text-[14px]">Request Quote</Link>
        </div>
      </section>
    </>
  )
}
