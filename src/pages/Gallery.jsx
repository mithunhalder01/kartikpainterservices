import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Phone } from 'lucide-react'
import { PHONE } from '../data/data'
import { usePublicData } from '../hooks/usePublicData'
import SEO, { buildBreadcrumbSchema } from '../components/SEO'

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

function SkeletonGrid() {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="break-inside-avoid rounded-xl overflow-hidden bg-surface animate-pulse"
          style={{ height: `${180 + (i % 3) * 60}px` }} />
      ))}
    </div>
  )
}

export default function Gallery() {
  const [active, setActive] = useState('All')
  const { data: images, loading, error } = usePublicData('/gallery', [])
  const { data: categories } = usePublicData('/gallery/categories', [])

  const cats = useMemo(() => ['All', ...categories.map((c) => c.name)], [categories])
  const filtered = active === 'All' ? images : images.filter((g) => g.category === active)

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
            {cats.map(c => (
              <button key={c} onClick={()=>setActive(c)}
                className={`px-4 py-2 text-[13px] font-medium rounded-lg border transition-all
                  ${active===c
                    ? 'bg-dark text-white border-dark'
                    : 'border-border text-text-muted hover:border-dark hover:text-text-primary'}`}>
                {c}
              </button>
            ))}
            {!loading && <span className="ml-auto text-[13px] text-text-subtle">{filtered.length} projects</span>}
          </div>

          {loading ? (
            <SkeletonGrid />
          ) : error ? (
            <p className="text-center text-text-muted text-[14px] py-12">
              Couldn't load the gallery right now. Please try again shortly.
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-text-muted text-[14px] py-12">No projects in this category yet.</p>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
              {filtered.map((g, i) => (
                <div key={g._id}
                     className="gallery-item break-inside-avoid rounded-xl overflow-hidden
                                shadow-[0_1px_4px_rgba(0,0,0,0.08)] fade-up"
                     style={{ animationDelay:`${i*0.04}s` }}>
                  <img src={g.imageUrl} alt={`${g.label} – Kartik Painter Services Noida`}
                       className="w-full block img-zoom" loading="lazy"/>
                  <div className="overlay">
                    <p>{g.label}</p>
                  </div>
                  <div className="absolute top-2.5 left-2.5 bg-dark/70 text-white/90 text-[10px]
                                  font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md">
                    {g.category}
                  </div>
                </div>
              ))}
            </div>
          )}
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
