import { Link } from 'react-router-dom'
import { CalendarDays, ArrowRight } from 'lucide-react'
import SEO, { buildBreadcrumbSchema } from '../components/SEO'
import { blogPosts } from '../data/blogPosts'

const blogListSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Kartik Painter Services Blog',
  description: 'Painting guides, pricing and tips for Noida, Greater Noida and nearby areas.',
  url: 'https://kartikpainterservices.vercel.app/blog',
}

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Blog', path: '/blog' },
])

export default function Blog() {
  return (
    <>
      <SEO
        title="Painting Blog in Noida – Cost Guides and Tips"
        description="Read painting guides, local price breakdowns and practical tips for Noida homes and offices from Kartik Painter Services."
        canonical="/blog"
        schema={[blogListSchema, breadcrumbSchema]}
        keywords="painting blog noida, painting cost noida, wall painting guide, waterproofing guide noida"
      />

      <section className="page-hero py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="label text-accent-300">Blog</p>
          <h1 className="text-display-lg font-black text-white mb-4">
            Painting Guides for
            <br />Noida Homeowners
          </h1>
          <p className="text-white/50 text-[16px] max-w-2xl">
            Simple, practical articles on painting cost, materials, planning, and maintenance.
          </p>
        </div>
      </section>

      <section className="bg-white py-14 px-6">
        <div className="max-w-6xl mx-auto grid gap-5">
          {blogPosts.map((post) => (
            <article key={post.slug} className="border border-border rounded-2xl p-6 md:p-7 hover:border-dark/30 transition-colors">
              <p className="text-[11px] text-text-subtle uppercase tracking-[0.14em] mb-3 flex items-center gap-1.5">
                <CalendarDays size={12} />
                Updated {post.updated || post.published}
              </p>
              <h2 className="text-[24px] font-black text-text-primary mb-3">
                {post.title}
              </h2>
              <p className="text-[15px] text-text-muted leading-relaxed mb-5">
                {post.desc}
              </p>
              <Link to={`/blog/${post.slug}`} className="btn-dark text-[14px]">
                Read Full Guide <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
